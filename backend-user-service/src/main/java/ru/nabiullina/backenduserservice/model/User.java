package ru.nabiullina.backenduserservice.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column
    private Long id;

    @Column(name = "user_id", unique = true)
    private String userId;

    @Column(name = "nickname", unique = true)
    private String nickname;

    @Column(name = "bio")
    private String bio;

    @Column(name = "email")
    private String email;

    @Column(name = "avatar_url")
    private String avatarUrl;
}
