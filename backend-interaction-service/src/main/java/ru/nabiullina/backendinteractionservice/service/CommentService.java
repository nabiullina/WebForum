package ru.nabiullina.backendinteractionservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.nabiullina.backendinteractionservice.client.UserServiceClient;
import ru.nabiullina.backendinteractionservice.dto.CommentDto;
import ru.nabiullina.backendinteractionservice.dto.CommentWithUserDto;
import ru.nabiullina.backendinteractionservice.dto.UserDto;
import ru.nabiullina.backendinteractionservice.entity.Comment;
import ru.nabiullina.backendinteractionservice.exception.InteractionServiceException;
import ru.nabiullina.backendinteractionservice.repository.CommentRepository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserServiceClient userServiceClient;

    @Transactional
    public CommentWithUserDto addComment(CommentDto commentDto, String userId, String token) {
        log.info("Saving comment {}", commentDto);
        Comment comment = new Comment();
        comment.setText(commentDto.getText());
        comment.setPostId(commentDto.getPostId());
        comment.setUserId(userId);
        comment.setCreatedAt(ZonedDateTime.now());
        comment = commentRepository.save(comment);

        String bearerToken = token.startsWith("Bearer ") ? token : "Bearer " + token;
        UserDto user = userServiceClient.getUserByUserId(userId, bearerToken);
        return new CommentWithUserDto(
                comment.getId(),
                comment.getPostId(),
                comment.getText(),
                comment.getCreatedAt(),
                user);
    }

    @Transactional
    public CommentWithUserDto updateComment(Long commentId, CommentDto commentDto, String userId, String token) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new InteractionServiceException("Comment not found with id: " + commentId));

        if (!comment.getUserId().equals(userId)) {
            throw new InteractionServiceException("You can only edit your own comments");
        }

        if (comment.getText() != null) {
            comment.setText(commentDto.getText());
        }

        log.info("Updating comment with id: {}. Comment text: {}", commentId, commentDto.getText());
        comment = commentRepository.save(comment);

        String bearerToken = token.startsWith("Bearer ") ? token : "Bearer " + token;
        UserDto user = userServiceClient.getUserByUserId(userId, bearerToken);
        return new CommentWithUserDto(
                comment.getId(),
                comment.getPostId(),
                comment.getText(),
                comment.getCreatedAt(),
                user);
    }

    @Transactional
    public void deleteComment(Long commentId,  String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new InteractionServiceException("Comment not found with id: " + commentId));

        if (!comment.getUserId().equals(userId)) {
            throw new InteractionServiceException("You can only delete your own comments");
        }

        log.info("Deleting comment with id: {}", commentId);
        commentRepository.delete(comment);
    }

    public List<CommentWithUserDto> getCommentsWithUsers(Long postId, String token) {
        List<Comment> comments = commentRepository.findByPostId(postId);

        List<String> userIds = comments.stream()
                .map(Comment::getUserId)
                .collect(Collectors.toList());

        String bearerToken = token.startsWith("Bearer ") ? token : "Bearer " + token;
        List<UserDto> users = userServiceClient.getUsersByIds(userIds, bearerToken);

        return comments.stream()
                .map(comment -> new CommentWithUserDto(
                        comment.getId(),
                        comment.getPostId(),
                        comment.getText(),
                        comment.getCreatedAt(),
                        users.stream().filter(user -> Objects.equals(user.getUserId(), comment.getUserId())).findFirst().get()))
                .toList();
    }

}
