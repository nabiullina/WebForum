package ru.nabiullina.backenduserservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.nabiullina.backenduserservice.model.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findUserByNickname(String nickname);

    List<User> getUsersByUserIdIn(List<String> userIds);

    User findUserByUserId(String userId);
}
