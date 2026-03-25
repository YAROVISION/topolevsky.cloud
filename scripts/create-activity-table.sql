CREATE TABLE IF NOT EXISTS user_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NULL,
    email VARCHAR(255) NULL,
    path VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    ip VARCHAR(45) NULL,
    userAgent TEXT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX (userId),
    INDEX (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
