package ru.nabiullina.backendinteractionservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import ru.nabiullina.backendinteractionservice.dto.CommentDto;
import ru.nabiullina.backendinteractionservice.dto.CommentWithUserDto;
import ru.nabiullina.backendinteractionservice.service.CommentService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comments")
public class CommentController {
    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<CommentWithUserDto> addComment(@RequestBody CommentDto comment,
                                                         @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(commentService.addComment(comment, jwt.getClaimAsString("sub"), jwt.getTokenValue()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentWithUserDto> updateComment(@PathVariable("id") Long id,
                                                 @RequestBody CommentDto comment,
                                                 @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(commentService.updateComment(id, comment, jwt.getClaimAsString("sub"), jwt.getTokenValue()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable("id") Long id,
                                                 @AuthenticationPrincipal Jwt jwt) {
        commentService.deleteComment(id, jwt.getClaimAsString("sub"));
        return ResponseEntity.ok().build();
    }

    @GetMapping("{postId}")
    public ResponseEntity<List<CommentWithUserDto>> getComments(@PathVariable Long postId,
                                                                @RequestHeader("Authorization") String token) {
        return ResponseEntity.ok(commentService.getCommentsWithUsers(postId, token));
    }
}
