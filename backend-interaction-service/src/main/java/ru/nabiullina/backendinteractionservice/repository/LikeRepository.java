package ru.nabiullina.backendinteractionservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.nabiullina.backendinteractionservice.entity.Like;

import java.util.List;

public interface LikeRepository extends JpaRepository<Like, Long> {
    void deleteByPostIdAndUserId(Long postId, String userId);

    boolean existsByUserIdAndPostId(String userId, Long postId);

    List<Like> findByPostId(Long postId);
}
