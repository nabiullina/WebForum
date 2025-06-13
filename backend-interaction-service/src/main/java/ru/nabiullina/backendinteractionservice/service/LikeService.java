package ru.nabiullina.backendinteractionservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.nabiullina.backendinteractionservice.client.UserServiceClient;
import ru.nabiullina.backendinteractionservice.dto.LikeWithUserDto;
import ru.nabiullina.backendinteractionservice.dto.UserDto;
import ru.nabiullina.backendinteractionservice.entity.Like;
import ru.nabiullina.backendinteractionservice.exception.InteractionServiceException;
import ru.nabiullina.backendinteractionservice.repository.LikeRepository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserServiceClient userServiceClient;

    @Transactional
    public void like(Long postId, String userId) {
        if (likeRepository.existsByUserIdAndPostId(userId, postId)) {
            throw new InteractionServiceException("User already liked this post");
        }

        Like like = new Like();
        like.setPostId(postId);
        like.setUserId(userId);
        like.setCreatedAt(ZonedDateTime.now());

        log.info("Saving like: {}", like);
        likeRepository.save(like);
    }

    @Transactional
    public void unlike(Long postId, String userId) {
        log.info("Deleting like for postId: {} and userId: {}", postId, userId);

        likeRepository.deleteByPostIdAndUserId(postId, userId);
    }

    @Transactional(readOnly = true)
    public List<LikeWithUserDto> getLikesWithUsers(Long postId, String token) {
        List<Like> likes = likeRepository.findByPostId(postId);

        List<String> userIds = likes.stream()
                .map(Like::getUserId)
                .collect(Collectors.toList());

        List<UserDto> users = userServiceClient.getUsersByIds(userIds, token);

        return likes.stream()
                .map(like -> {
                    LikeWithUserDto dto = new LikeWithUserDto();
                    dto.setPostId(like.getPostId());
                    dto.setUser(users.stream().filter(user -> Objects.equals(user.getUserId(), like.getUserId())).findFirst().orElseThrow());

                    return dto;
                })
                .toList();
    }
}
