package ru.nabiullina.backendinteractionservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import ru.nabiullina.backendinteractionservice.dto.UserDto;

import java.util.List;

@Service
@FeignClient(name = "user-service-client", url = "http://backend-user-service:8083")
public interface UserServiceClient {
    @GetMapping("/api/users")
    List<UserDto> getUsersByIds(@RequestParam List<String> userIds, @RequestHeader("Authorization") String token);

    @GetMapping("/api/users/{userId}")
    UserDto getUserByUserId(@PathVariable String userId, @RequestHeader("Authorization") String token);
}