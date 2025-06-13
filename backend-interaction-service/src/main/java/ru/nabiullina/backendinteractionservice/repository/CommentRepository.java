package ru.nabiullina.backendinteractionservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.nabiullina.backendinteractionservice.entity.Comment;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostId(Long postId);
}
