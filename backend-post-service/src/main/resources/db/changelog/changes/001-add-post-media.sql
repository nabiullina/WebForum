CREATE TABLE post_media (
    post_id BIGINT NOT NULL,
    media_url VARCHAR(255) NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
); 