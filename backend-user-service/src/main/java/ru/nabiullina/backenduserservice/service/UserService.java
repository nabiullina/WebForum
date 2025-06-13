package ru.nabiullina.backenduserservice.service;

import com.amazonaws.services.s3.model.S3Object;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.nabiullina.backenduserservice.error.ServiceException;
import ru.nabiullina.backenduserservice.model.User;
import ru.nabiullina.backenduserservice.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final S3Service s3Service;

    public List<User> getUsers(List<String> userIds) {
        return userRepository.getUsersByUserIdIn(userIds);
    }

    public User getUserByUserId(String userId) {
        return userRepository.findUserByUserId(userId);
    }

    public User updateUser(User user, String userId) {
        User updatedUser = userRepository.findUserByUserId(userId);
        if (user != null) {
            if (user.getEmail() != null) {
                updatedUser.setEmail(user.getEmail());
            }

            if (user.getBio() != null) {
                updatedUser.setBio(user.getBio());
            }

            if (user.getAvatarUrl() != null) {
                updatedUser.setAvatarUrl(user.getAvatarUrl());
            }
        }

        return userRepository.save(updatedUser);
    }

    @Transactional
    public User updateAvatar(String userId, MultipartFile file) {
        User user = getUserByUserId(userId);
        if (user == null) {
            throw new ServiceException("User not found");
        }

        String avatarUrl = s3Service.uploadFile(file, userId);
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }

    public S3Object getAvatar(String userId) {
        User user = getUserByUserId(userId);
        if (user == null) {
            throw new ServiceException("User not found");
        }

        if (user.getAvatarUrl() == null) {
            throw new ServiceException("User has no avatar");
        }

        return s3Service.getFile(user.getAvatarUrl());
    }
}
