package ru.nabiullina.backendpostservice.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserDto {
    private String userId;
    private String nickname;
    private String avatarUrl;
}
