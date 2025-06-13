package ru.nabiullina.backenduserservice.model;

import lombok.Data;

@Data
public class UserDto {
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
}