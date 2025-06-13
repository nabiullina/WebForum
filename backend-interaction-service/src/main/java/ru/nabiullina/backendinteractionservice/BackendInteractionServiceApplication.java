package ru.nabiullina.backendinteractionservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class BackendInteractionServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendInteractionServiceApplication.class, args);
    }
}
