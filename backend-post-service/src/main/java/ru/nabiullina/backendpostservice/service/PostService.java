package ru.nabiullina.backendpostservice.service;

import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.nabiullina.backendpostservice.client.InteractionServiceClient;
import ru.nabiullina.backendpostservice.client.UserServiceClient;
import ru.nabiullina.backendpostservice.dto.PostDto;
import ru.nabiullina.backendpostservice.dto.PostRequestDto;
import ru.nabiullina.backendpostservice.dto.UserDto;
import ru.nabiullina.backendpostservice.entity.Post;
import ru.nabiullina.backendpostservice.repository.PostRepository;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserServiceClient userServiceClient;
    private final InteractionServiceClient interactionServiceClient;
    private final S3Service s3Service;

    @Transactional
    public PostDto createPost(PostRequestDto postRequest, Jwt token) {
        Post post = new Post();
        post.setTitle(postRequest.getTitle());
        post.setContent(postRequest.getContent());
        post.setAuthorId(token.getSubject());
        post.setCategoryId(postRequest.getCategoryId());
        post.setCreatedAt(ZonedDateTime.now());
        postRepository.save(post);

        UserDto author = userServiceClient.getUserByUserId(post.getAuthorId(), "Bearer " + token.getTokenValue());
        log.info("Created post with ID: {}, mediaUrls: {}", post.getId(), post.getMediaUrls());

        return new PostDto(post.getId(), post.getTitle(), post.getContent(), post.getCreatedAt(), post.getCategoryId(), author, 0L, 0L, post.getMediaUrls());
    }

    @Transactional
    public PostDto updatePost(PostRequestDto postRequest, Jwt token) {
        log.info("Updating post with ID: {}", postRequest.getId());
        Post post = postRepository.findById(postRequest.getId()).orElseThrow(() -> new NotFoundException("Post not found"));

        if (!post.getAuthorId().equals(token.getSubject())) {
            throw new ForbiddenException("Forbidden");
        }

        post.setContent(postRequest.getContent());
        post = postRepository.save(post);

        UserDto author = userServiceClient.getUserByUserId(post.getAuthorId(), "Bearer " + token.getTokenValue());
        log.info("Updated post with ID: {}, mediaUrls: {}", post.getId(), post.getMediaUrls());

        return new PostDto(post.getId(), post.getTitle(), post.getContent(), post.getCreatedAt(), post.getCategoryId(), author, 0L, 0L, post.getMediaUrls());
    }

    @Transactional
    public PostDto addMediaToPost(Long postId, List<MultipartFile> files, Jwt token) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        List<String> mediaUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            String mediaUrl = s3Service.uploadFile(file, postId.toString());
            mediaUrls.add(mediaUrl);
            log.info("Added media URL to post {}: {}", postId, mediaUrl);
        }

        if (post.getMediaUrls() == null) {
            post.setMediaUrls(new ArrayList<>());
        }
        post.getMediaUrls().addAll(mediaUrls);
        postRepository.save(post);

        UserDto author = userServiceClient.getUserByUserId(post.getAuthorId(), "Bearer " + token.getTokenValue());
        log.info("Updated post {} with mediaUrls: {}", postId, post.getMediaUrls());

        return new PostDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCreatedAt(),
                post.getCategoryId(),
                author,
                0L,
                0L,
                post.getMediaUrls()
        );
    }

    private PostDto enrichPostWithDetails(Post post, Jwt token) {
        Long comments = (long) interactionServiceClient.getComments(post.getId(), "Bearer " + token.getTokenValue()).size();
        Long likes = (long) interactionServiceClient.getLikes(post.getId(), "Bearer " + token.getTokenValue()).size();

        UserDto author = userServiceClient.getUserByUserId(post.getAuthorId(), "Bearer " + token.getTokenValue());
        log.info("Enriching post {} with mediaUrls: {}", post.getId(), post.getMediaUrls());
        
        return new PostDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCreatedAt(),
                post.getCategoryId(),
                author,
                comments,
                likes,
                post.getMediaUrls()
        );
    }

    @Transactional(readOnly = true)
    public List<PostDto> getPostsWithDetails(Jwt token, Long categoryId) {
        List<Post> posts = postRepository.findByCategoryId(categoryId);
        log.info("Found {} posts for category {}", posts.size(), categoryId);
        
        List<PostDto> postDtos = posts.stream()
                .map(post -> enrichPostWithDetails(post, token))
                .collect(Collectors.toList());
        
        log.info("Returning {} post DTOs", postDtos.size());
        return postDtos;
    }
}