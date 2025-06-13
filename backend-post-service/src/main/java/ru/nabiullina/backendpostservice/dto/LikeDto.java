package ru.nabiullina.backendpostservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LikeDto {
    private Long postId;
    private UserDto user;
}
