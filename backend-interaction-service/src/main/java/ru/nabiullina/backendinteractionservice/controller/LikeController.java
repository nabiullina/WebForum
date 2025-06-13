package ru.nabiullina.backendinteractionservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import ru.nabiullina.backendinteractionservice.dto.LikeWithUserDto;
import ru.nabiullina.backendinteractionservice.service.LikeService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/likes")
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/{postId}")
    public ResponseEntity<Void> like(@PathVariable Long postId,
                                     @AuthenticationPrincipal Jwt jwt) {
        likeService.like(postId, jwt.getClaimAsString("sub"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> unlike(@PathVariable Long postId,
                                       @AuthenticationPrincipal Jwt jwt) {
        likeService.unlike(postId, jwt.getClaimAsString("sub"));
        return ResponseEntity.ok().build();
    }


    @GetMapping("{postId}")
    public ResponseEntity<List<LikeWithUserDto>> getLikes(@PathVariable Long postId,
                                                          @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(likeService.getLikesWithUsers(postId, token));
    }
}
