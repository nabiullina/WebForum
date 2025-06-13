package ru.nabiullina.backendpostservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.nabiullina.backendpostservice.entity.Post;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByAuthorId(String authorId);

    List<Post> findByCategoryId(Long categoryId);

    Post findPostById(Long id);
}
