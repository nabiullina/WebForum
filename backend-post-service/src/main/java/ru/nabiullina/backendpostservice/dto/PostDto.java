package ru.nabiullina.backendpostservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private Long id;
    private String title;
    private String content;
    private ZonedDateTime createdAt;
    private Long categoryId;
    private UserDto author;
    private Long commentsCount;
    private Long likesCount;
    private List<String> mediaUrls;
}
