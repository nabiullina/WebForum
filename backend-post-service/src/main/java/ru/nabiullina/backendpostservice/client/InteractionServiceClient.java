package ru.nabiullina.backendpostservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import ru.nabiullina.backendpostservice.dto.CommentWithUserDto;
import ru.nabiullina.backendpostservice.dto.LikeDto;

import java.util.List;

@Service
@FeignClient(name = "interaction-service-client", url = "http://backend-interaction-service:8085")
public interface InteractionServiceClient {
    @GetMapping("/api/comments/{postId}")
    List<CommentWithUserDto> getComments(@PathVariable Long postId, @RequestHeader("Authorization") String token);

    @GetMapping("/api/likes/{postId}")
    List<LikeDto> getLikes(@PathVariable Long postId, @RequestHeader("Authorization") String token);
}