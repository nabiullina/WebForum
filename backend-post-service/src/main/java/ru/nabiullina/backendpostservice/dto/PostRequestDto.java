package ru.nabiullina.backendpostservice.dto;

import lombok.Data;

@Data
public class PostRequestDto {
    private Long id;
    private String title;
    private String content;
    private Long categoryId;
}
