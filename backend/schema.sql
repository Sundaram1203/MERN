-- ============================================
-- User Module Database Schema
-- Database: db_swagger
-- ============================================

CREATE DATABASE IF NOT EXISTS db_swagger;
USE db_swagger;

CREATE TABLE IF NOT EXISTS `swag_user_master` (
  `id`            INT(11) NOT NULL AUTO_INCREMENT,
  `first_name`    VARCHAR(255) NOT NULL,
  `last_name`     VARCHAR(255) NOT NULL,
  `email`         VARCHAR(255) NOT NULL UNIQUE,
  `user_id`       VARCHAR(255) DEFAULT NULL,
  `password`      VARCHAR(255) NOT NULL,
  `hash_password` VARCHAR(255) DEFAULT NULL,
  `otp_code`      INT(6) DEFAULT NULL,
  `is_verified`   TINYINT(1) DEFAULT 0,
  `created_dt`    DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_dt`    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by`    VARCHAR(255) DEFAULT NULL,
  `deleted`       TINYINT(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
