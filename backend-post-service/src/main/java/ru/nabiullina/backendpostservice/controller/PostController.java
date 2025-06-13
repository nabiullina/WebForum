package ru.nabiullina.backendpostservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.nabiullina.backendpostservice.dto.PostDto;
import ru.nabiullina.backendpostservice.dto.PostRequestDto;
import ru.nabiullina.backendpostservice.service.PostService;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostDto createPost(@RequestBody PostRequestDto postRequest, @AuthenticationPrincipal Jwt jwt) {
        return postService.createPost(postRequest, jwt);
    }

    @PutMapping
    @ResponseStatus(HttpStatus.OK)
    public PostDto updatePost(@RequestBody PostRequestDto postRequest, @AuthenticationPrincipal Jwt jwt) {
        return postService.updatePost(postRequest, jwt);
    }

    @GetMapping("{categoryId}")
    public List<PostDto> getPosts(@AuthenticationPrincipal Jwt token,
                                  @PathVariable Long categoryId) {
        return postService.getPostsWithDetails(token, categoryId);
    }

    @GetMapping
    public List<PostDto> getPosts(@AuthenticationPrincipal Jwt token) {
        return postService.getPostsWithDetails(token, -1L);
    }

    @PostMapping(value = "/{postId}/media", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostDto> addMediaToPost(
            @PathVariable Long postId,
            @RequestParam("files") List<MultipartFile> files,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(postService.addMediaToPost(postId, files, jwt));
    }


}