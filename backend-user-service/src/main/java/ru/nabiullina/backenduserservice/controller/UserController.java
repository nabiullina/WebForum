package ru.nabiullina.backenduserservice.controller;

import com.amazonaws.services.s3.model.S3Object;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.nabiullina.backenduserservice.model.User;
import ru.nabiullina.backenduserservice.model.UserDto;
import ru.nabiullina.backenduserservice.repository.UserRepository;
import ru.nabiullina.backenduserservice.service.UserService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(value = "/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final Keycloak keycloak;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        try {
            System.out.println("Received user registration request: " + userDto);

            if (userDto.getUsername() == null || userDto.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }
            if (userDto.getEmail() == null || userDto.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            if (userDto.getPassword() == null || userDto.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }

            RealmResource realmResource = keycloak.realm("nabiullina");
            UsersResource usersResource = realmResource.users();

            UserRepresentation user = new UserRepresentation();
            user.setEnabled(true);
            user.setUsername(userDto.getUsername());
            user.setEmail(userDto.getEmail());
            user.setFirstName(userDto.getFirstName());
            user.setLastName(userDto.getLastName());
            user.setEmailVerified(false);

            System.out.println("Creating Keycloak user with data: " + user);
            Response response = usersResource.create(user);

            if (response.getStatus() == 201) {
                String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

                CredentialRepresentation credential = new CredentialRepresentation();
                credential.setType(CredentialRepresentation.PASSWORD);
                credential.setValue(userDto.getPassword());
                credential.setTemporary(false);

                usersResource.get(userId).resetPassword(credential);

                User userEntity = new User();
                userEntity.setUserId(userId);
                userEntity.setNickname(userDto.getUsername());
                userEntity.setEmail(userDto.getEmail());
                userRepository.save(userEntity);

                System.out.println("User created successfully with ID: " + userId);

                return ResponseEntity.ok().build();
            }

            String errorMessage = "Failed to create user. Status: " + response.getStatus();
            System.out.println(errorMessage);
            if (response.hasEntity()) {
                String responseBody = response.readEntity(String.class);
                System.out.println("Response body: " + responseBody);
                errorMessage += ". Response: " + responseBody;
            }
            return ResponseEntity.status(response.getStatus()).body(errorMessage);
        } catch (Exception e) {
            String errorMessage = "Error creating user: " + e.getMessage();
            System.out.println(errorMessage);
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(errorMessage);
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getUsers(@RequestParam List<String> userIds) {
        return ResponseEntity.ok(userService.getUsers(userIds));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserByUserId(id));
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getUserByUserId(jwt.getSubject()));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(@RequestBody User user, @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.updateUser(user, jwt.getSubject()));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> uploadAvatar(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userService.updateAvatar(jwt.getSubject(), file));
    }

    @GetMapping("/{userId}/avatar")
    public ResponseEntity<byte[]> getAvatar(@PathVariable String userId) {
        try {
            S3Object s3Object = userService.getAvatar(userId);
            byte[] avatarBytes = s3Object.getObjectContent().readAllBytes();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(s3Object.getObjectMetadata().getContentType()));
            headers.setContentLength(s3Object.getObjectMetadata().getContentLength());
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(avatarBytes);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
