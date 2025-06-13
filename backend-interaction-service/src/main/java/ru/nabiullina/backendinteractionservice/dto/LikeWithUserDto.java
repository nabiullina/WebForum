package ru.nabiullina.backendinteractionservice.dto;

import lombok.Data;

@Data
public class LikeWithUserDto {
    private Long postId;
    private UserDto user;
}
