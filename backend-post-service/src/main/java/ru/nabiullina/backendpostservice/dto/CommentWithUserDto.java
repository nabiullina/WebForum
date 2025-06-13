package ru.nabiullina.backendpostservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class CommentWithUserDto {
    private Long id;
    private Long postId;
    private String text;
    private UserDto user;
}
