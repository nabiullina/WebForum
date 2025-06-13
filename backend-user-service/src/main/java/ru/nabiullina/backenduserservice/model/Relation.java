package ru.nabiullina.backenduserservice.model;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;
import ru.nabiullina.backenduserservice.enums.RelationStatus;

@Data
@Entity
public class Relation {

    @Id
    @Column
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "follower_id")
    private Long followerId;

    @Column
    private RelationStatus status;
}
