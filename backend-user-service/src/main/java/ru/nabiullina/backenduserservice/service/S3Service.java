package ru.nabiullina.backenduserservice.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;

    public String uploadFile(MultipartFile file, String userId) {
        try {
            String fileName = generateFileName(file, userId);
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(file.getContentType());
            metadata.setContentLength(file.getSize());

            PutObjectRequest putObjectRequest = new PutObjectRequest(
                    bucketName,
                    fileName,
                    file.getInputStream(),
                    metadata
            );

            amazonS3.putObject(putObjectRequest);
            return amazonS3.getUrl(bucketName, fileName).toString();
        } catch (IOException e) {
            log.error("Error uploading file to S3", e);
            throw new RuntimeException("Error uploading file to S3", e);
        }
    }

    public S3Object getFile(String fileUrl) {
        try {
            String key = extractKeyFromUrl(fileUrl);
            log.info("Retrieving file from S3: {}", key);
            return amazonS3.getObject(bucketName, key);
        } catch (Exception e) {
            log.error("Error getting file from S3", e);
            throw new RuntimeException("Error getting file from S3", e);
        }
    }

    private String extractKeyFromUrl(String fileUrl) {
        String[] parts = fileUrl.split("://[^/]+/" + bucketName);
        if (parts.length < 2) {
            throw new IllegalArgumentException("Invalid MinIO URL format");
        }

        return parts[1].split("\\?")[0];
    }

    private String generateFileName(MultipartFile file, String userId) {
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        return "avatars/" + userId + "/" + UUID.randomUUID() + extension;
    }
} 