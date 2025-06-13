package ru.nabiullina.backendpostservice.controller;

import com.amazonaws.services.s3.model.S3Object;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.nabiullina.backendpostservice.service.S3Service;

@Slf4j
@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final S3Service s3Service;

    @GetMapping()
    public ResponseEntity<byte[]> getMedia(
            @RequestParam String path
    ) {
        try {
            S3Object media = s3Service.getFile(path);
            
            String contentType;
            if (path.toLowerCase().endsWith(".mp4")) {
                contentType = "video/mp4";
            } else if (path.toLowerCase().endsWith(".webm")) {
                contentType = "video/webm";
            } else if (path.toLowerCase().endsWith(".ogg")) {
                contentType = "video/ogg";
            } else if (path.toLowerCase().endsWith(".mov")) {
                contentType = "video/quicktime";
            } else if (path.toLowerCase().endsWith(".jpg") || path.toLowerCase().endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else if (path.toLowerCase().endsWith(".png")) {
                contentType = "image/png";
            } else if (path.toLowerCase().endsWith(".gif")) {
                contentType = "image/gif";
            } else {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + media.getKey() + "\"")
                    .body(media.getObjectContent().readAllBytes());
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
} 