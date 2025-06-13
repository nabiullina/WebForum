package ru.nabiullina.backendinteractionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentWithUserDto {
    private Long id;
    private Long postId;
    private String text;
    private ZonedDateTime createdAt;
    private UserDto user;
}
