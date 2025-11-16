-- MySQL dump created by Python
-- Database: db_ierms
-- Server: 127.0.0.1:3306
-- Generated: 2025-11-16 18:23:48
SET FOREIGN_KEY_CHECKS=0;

--
-- Table structure for table `audit_activitylog`
--
DROP TABLE IF EXISTS `audit_activitylog`;
CREATE TABLE `audit_activitylog` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `role` varchar(50) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `module` varchar(100) DEFAULT NULL,
  `description` longtext DEFAULT NULL,
  `message` longtext NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`metadata`)),
  `ip_address` char(39) DEFAULT NULL,
  `user_agent` longtext DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_activitylog_user_id_3cff121f_fk_users_user_id` (`user_id`),
  CONSTRAINT `audit_activitylog_user_id_3cff121f_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_activitylog`
--
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (1, 'Admin', 'create', 'User Management', 'User account created: admin@example.com', 'User account created: admin@example.com', '{"entity_name": "admin@example.com", "entity_id": 1, "role": "Admin", "status": "success"}', NULL, '', '2025-11-13 15:06:16.181274', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (2, 'Admin', 'update', 'User Management', 'User account updated: admin@example.com', 'User account updated: admin@example.com', '{"entity_name": "admin@example.com", "entity_id": 1, "status": "success"}', NULL, '', '2025-11-13 15:07:43.006281', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (3, 'Admin', 'login', 'Authentication', 'admin@example.com logged in', 'admin@example.com logged in', '{"user_id": 1, "email": "admin@example.com", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-13 15:07:43.042661', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (4, 'Admin', 'update', 'System Configuration', 'System configuration updated', 'System configuration updated', '{"updated_fields": ["email_host", "email_port", "email_use_tls", "email_host_user", "email_host_password", "default_from_email", "email_from_name", "access_token_lifetime_minutes", "refresh_token_lifetime_days", "rotate_refresh_tokens", "blacklist_after_rotation", "backup_custom_path", "backup_schedule_frequency", "backup_retention_days", "quota_carry_over_policy", "quota_carry_over_enabled"], "status": "success", "path": "/api/system/config/update/", "method": "PUT"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:22:15.262933', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (5, '', 'backup', 'Backup & Restore', 'System created backup backup_20251116_002302.sql', 'System created backup backup_20251116_002302.sql', '{"status": "success", "file_name": "backup_20251116_002302.sql", "path": "backup\\\\backup_20251116_002302.sql", "location": "backup", "size_bytes": 74480, "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:23:02.790235', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (6, 'Division Chief', 'create', 'User Management', 'User account created: jerichourbano.01.01.04@gmail.com', 'User account created: jerichourbano.01.01.04@gmail.com', '{"entity_name": "jerichourbano.01.01.04@gmail.com", "entity_id": 2, "role": "Division Chief", "status": "success"}', NULL, '', '2025-11-15 16:23:30.796468', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (7, '', 'create', 'User Management', 'System registered user jerichourbano.01.01.04@gmail.com', 'System registered user jerichourbano.01.01.04@gmail.com', '{"entity_name": "jerichourbano.01.01.04@gmail.com", "entity_id": 2, "role": "Division Chief", "status": "success", "path": "/api/auth/register/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:23:34.301434', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (8, 'Division Chief', 'update', 'User Management', 'User account updated: jerichourbano.01.01.04@gmail.com', 'User account updated: jerichourbano.01.01.04@gmail.com', '{"entity_name": "jerichourbano.01.01.04@gmail.com", "entity_id": 2, "status": "success"}', NULL, '', '2025-11-15 16:24:15.873339', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (9, 'Division Chief', 'login', 'Authentication', 'jerichourbano.01.01.04@gmail.com logged in', 'jerichourbano.01.01.04@gmail.com logged in', '{"user_id": 2, "email": "jerichourbano.01.01.04@gmail.com", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:24:15.880404', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (10, 'Division Chief', 'update', 'User Management', 'User account updated: jerichourbano.01.01.04@gmail.com', 'User account updated: jerichourbano.01.01.04@gmail.com', '{"entity_name": "jerichourbano.01.01.04@gmail.com", "entity_id": 2, "status": "success"}', NULL, '', '2025-11-15 16:24:32.982377', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (11, 'Division Chief', 'update', 'Authentication', 'jerichourbano.01.01.04@gmail.com completed first-time password setup', 'jerichourbano.01.01.04@gmail.com completed first-time password setup', '{"user_id": 2, "status": "success", "operation": "first_time_change_password", "path": "/api/auth/first-time-change-password/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:24:32.985398', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (12, 'Division Chief', 'update', 'User Management', 'User account updated: jerichourbano.01.01.04@gmail.com', 'User account updated: jerichourbano.01.01.04@gmail.com', '{"entity_name": "jerichourbano.01.01.04@gmail.com", "entity_id": 2, "status": "success"}', NULL, '', '2025-11-15 16:24:47.870518', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (13, 'Division Chief', 'login', 'Authentication', 'jerichourbano.01.01.04@gmail.com logged in', 'jerichourbano.01.01.04@gmail.com logged in', '{"user_id": 2, "email": "jerichourbano.01.01.04@gmail.com", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:24:47.876700', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (14, '', 'create', 'Establishment Registry', 'Created establishment: SAINT LOUIS COLLEGE', 'Created establishment: SAINT LOUIS COLLEGE', '{"status": "success"}', NULL, '', '2025-11-15 16:26:33.262273', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (15, 'Division Chief', 'update', 'Establishment Registry', 'Updated establishment: SAINT LOUIS COLLEGE', 'Updated establishment: SAINT LOUIS COLLEGE', '{"status": "success"}', NULL, '', '2025-11-15 16:26:33.315895', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (16, 'Section Chief', 'create', 'User Management', 'User account created: 22101222@slc-sflu.edu.ph', 'User account created: 22101222@slc-sflu.edu.ph', '{"entity_name": "22101222@slc-sflu.edu.ph", "entity_id": 3, "role": "Section Chief", "status": "success"}', NULL, '', '2025-11-15 16:27:11.613685', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (17, '', 'create', 'User Management', 'System registered user 22101222@slc-sflu.edu.ph', 'System registered user 22101222@slc-sflu.edu.ph', '{"entity_name": "22101222@slc-sflu.edu.ph", "entity_id": 3, "role": "Section Chief", "status": "success", "path": "/api/auth/register/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:27:14.565580', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (18, 'Unit Head', 'create', 'User Management', 'User account created: echo.010104@gmail.com', 'User account created: echo.010104@gmail.com', '{"entity_name": "echo.010104@gmail.com", "entity_id": 4, "role": "Unit Head", "status": "success"}', NULL, '', '2025-11-15 16:27:37.269618', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (19, '', 'create', 'User Management', 'System registered user echo.010104@gmail.com', 'System registered user echo.010104@gmail.com', '{"entity_name": "echo.010104@gmail.com", "entity_id": 4, "role": "Unit Head", "status": "success", "path": "/api/auth/register/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:27:40.144128', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (20, 'Monitoring Personnel', 'create', 'User Management', 'User account created: emee46990@gmail.com', 'User account created: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 5, "role": "Monitoring Personnel", "status": "success"}', NULL, '', '2025-11-15 16:28:10.170373', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (21, '', 'create', 'User Management', 'System registered user emee46990@gmail.com', 'System registered user emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 5, "role": "Monitoring Personnel", "status": "success", "path": "/api/auth/register/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:28:13.058065', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (22, 'Admin', 'login', 'Authentication', 'User admin@example.com logged in successfully', 'User admin@example.com logged in successfully', '{"user_id": 1, "email": "admin@example.com", "status": "success", "path": "/admin/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:46:31.895441', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (23, 'Admin', 'update', 'User Management', 'User account updated: admin@example.com', 'User account updated: admin@example.com', '{"entity_name": "admin@example.com", "entity_id": 1, "status": "success"}', NULL, '', '2025-11-15 16:46:31.910880', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (24, 'Section Chief', 'create', 'User Management', 'User account created: 22101222@slc-sflu.edu.ph', 'User account created: 22101222@slc-sflu.edu.ph', '{"entity_name": "22101222@slc-sflu.edu.ph", "entity_id": 6, "role": "Section Chief", "status": "success"}', NULL, '', '2025-11-15 16:47:46.055899', 6);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (25, '', 'create', 'User Management', 'System registered user 22101222@slc-sflu.edu.ph', 'System registered user 22101222@slc-sflu.edu.ph', '{"entity_name": "22101222@slc-sflu.edu.ph", "entity_id": 6, "role": "Section Chief", "status": "success", "path": "/api/auth/register/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:47:50.215709', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (26, 'Division Chief', 'update', 'User Management', 'User account updated: jerichourbano.01.01.04@gmail.com', 'User account updated: jerichourbano.01.01.04@gmail.com', '{"entity_name": "jerichourbano.01.01.04@gmail.com", "entity_id": 2, "status": "success"}', NULL, '', '2025-11-15 16:48:17.674595', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (27, 'Admin', 'update', 'User Management', 'admin@example.com deactivated user jerichourbano.01.01.04@gmail.com', 'admin@example.com deactivated user jerichourbano.01.01.04@gmail.com', '{"entity_name": "jerichourbano.01.01.04@gmail.com", "entity_id": 2, "status": "success", "before": {"is_active": true}, "after": {"is_active": false}, "path": "/api/auth/toggle-active/2/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:48:17.690176', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (28, 'Division Chief', 'update', 'User Management', 'User account updated: jerichourbano.01.01.04@gmail.com', 'User account updated: jerichourbano.01.01.04@gmail.com', '{"entity_name": "jerichourbano.01.01.04@gmail.com", "entity_id": 2, "status": "success"}', NULL, '', '2025-11-15 16:48:28.224645', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (29, 'Admin', 'update', 'User Management', 'admin@example.com activated user jerichourbano.01.01.04@gmail.com', 'admin@example.com activated user jerichourbano.01.01.04@gmail.com', '{"entity_name": "jerichourbano.01.01.04@gmail.com", "entity_id": 2, "status": "success", "before": {"is_active": false}, "after": {"is_active": true}, "path": "/api/auth/toggle-active/2/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:48:28.249684', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (30, 'Unit Head', 'create', 'User Management', 'User account created: echo.010104@gmail.com', 'User account created: echo.010104@gmail.com', '{"entity_name": "echo.010104@gmail.com", "entity_id": 7, "role": "Unit Head", "status": "success"}', NULL, '', '2025-11-15 16:48:58.428086', 7);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (31, '', 'create', 'User Management', 'System registered user echo.010104@gmail.com', 'System registered user echo.010104@gmail.com', '{"entity_name": "echo.010104@gmail.com", "entity_id": 7, "role": "Unit Head", "status": "success", "path": "/api/auth/register/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:49:00.703610', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (32, 'Section Chief', 'update', 'User Management', 'User account updated: 22101222@slc-sflu.edu.ph', 'User account updated: 22101222@slc-sflu.edu.ph', '{"entity_name": "22101222@slc-sflu.edu.ph", "entity_id": 6, "status": "success"}', NULL, '', '2025-11-15 16:49:16.499907', 6);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (33, 'Section Chief', 'login', 'Authentication', '22101222@slc-sflu.edu.ph logged in', '22101222@slc-sflu.edu.ph logged in', '{"user_id": 6, "email": "22101222@slc-sflu.edu.ph", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:49:16.518946', 6);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (34, 'Section Chief', 'update', 'User Management', 'User account updated: 22101222@slc-sflu.edu.ph', 'User account updated: 22101222@slc-sflu.edu.ph', '{"entity_name": "22101222@slc-sflu.edu.ph", "entity_id": 6, "status": "success"}', NULL, '', '2025-11-15 16:49:33.676305', 6);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (35, 'Section Chief', 'update', 'Authentication', '22101222@slc-sflu.edu.ph completed first-time password setup', '22101222@slc-sflu.edu.ph completed first-time password setup', '{"user_id": 6, "status": "success", "operation": "first_time_change_password", "path": "/api/auth/first-time-change-password/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:49:33.684476', 6);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (36, 'Section Chief', 'update', 'User Management', 'User account updated: 22101222@slc-sflu.edu.ph', 'User account updated: 22101222@slc-sflu.edu.ph', '{"entity_name": "22101222@slc-sflu.edu.ph", "entity_id": 6, "status": "success"}', NULL, '', '2025-11-15 16:49:52.513580', 6);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (37, 'Section Chief', 'login', 'Authentication', '22101222@slc-sflu.edu.ph logged in', '22101222@slc-sflu.edu.ph logged in', '{"user_id": 6, "email": "22101222@slc-sflu.edu.ph", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:49:52.528268', 6);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (38, 'Monitoring Personnel', 'create', 'User Management', 'User account created: emee46990@gmail.com', 'User account created: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 8, "role": "Monitoring Personnel", "status": "success"}', NULL, '', '2025-11-15 16:51:45.332016', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (39, '', 'create', 'User Management', 'System registered user emee46990@gmail.com', 'System registered user emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 8, "role": "Monitoring Personnel", "status": "success", "path": "/api/auth/register/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:51:47.666344', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (40, 'Unit Head', 'update', 'User Management', 'User account updated: echo.010104@gmail.com', 'User account updated: echo.010104@gmail.com', '{"entity_name": "echo.010104@gmail.com", "entity_id": 7, "status": "success"}', NULL, '', '2025-11-15 16:51:58.909798', 7);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (41, 'Unit Head', 'login', 'Authentication', 'echo.010104@gmail.com logged in', 'echo.010104@gmail.com logged in', '{"user_id": 7, "email": "echo.010104@gmail.com", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:51:58.917648', 7);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (42, 'Unit Head', 'update', 'User Management', 'User account updated: echo.010104@gmail.com', 'User account updated: echo.010104@gmail.com', '{"entity_name": "echo.010104@gmail.com", "entity_id": 7, "status": "success"}', NULL, '', '2025-11-15 16:52:26.864139', 7);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (43, 'Unit Head', 'update', 'Authentication', 'echo.010104@gmail.com completed first-time password setup', 'echo.010104@gmail.com completed first-time password setup', '{"user_id": 7, "status": "success", "operation": "first_time_change_password", "path": "/api/auth/first-time-change-password/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:52:26.877928', 7);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (44, 'Unit Head', 'update', 'User Management', 'User account updated: echo.010104@gmail.com', 'User account updated: echo.010104@gmail.com', '{"entity_name": "echo.010104@gmail.com", "entity_id": 7, "status": "success"}', NULL, '', '2025-11-15 16:53:42.649943', 7);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (45, 'Unit Head', 'login', 'Authentication', 'echo.010104@gmail.com logged in', 'echo.010104@gmail.com logged in', '{"user_id": 7, "email": "echo.010104@gmail.com", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:53:42.664376', 7);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (46, 'Monitoring Personnel', 'update', 'User Management', 'User account updated: emee46990@gmail.com', 'User account updated: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 8, "status": "success"}', NULL, '', '2025-11-15 16:56:06.544107', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (47, 'Monitoring Personnel', 'login', 'Authentication', 'Failed login attempt for emee46990@gmail.com (attempt #1)', 'Failed login attempt for emee46990@gmail.com (attempt #1)', '{"user_id": 8, "email": "emee46990@gmail.com", "status": "failed", "reason": "invalid_credentials", "attempt": 1, "ip": "127.0.0.1", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:56:06.546801', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (48, '', 'login', 'Authentication', 'Invalid login attempt for emee46990@gmail.com', 'Invalid login attempt for emee46990@gmail.com', '{"email": "emee46990@gmail.com", "status": "failed", "reason": "invalid_credentials", "failed_attempts": 1, "remaining_attempts": 9, "lockout_duration_minutes": 3, "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:56:06.551980', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (49, 'Monitoring Personnel', 'update', 'User Management', 'User account updated: emee46990@gmail.com', 'User account updated: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 8, "status": "success"}', NULL, '', '2025-11-15 16:56:28.810317', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (50, 'Monitoring Personnel', 'login', 'Authentication', 'Failed login attempt for emee46990@gmail.com (attempt #2)', 'Failed login attempt for emee46990@gmail.com (attempt #2)', '{"user_id": 8, "email": "emee46990@gmail.com", "status": "failed", "reason": "invalid_credentials", "attempt": 2, "ip": "127.0.0.1", "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:56:28.814419', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (51, '', 'login', 'Authentication', 'Invalid login attempt for emee46990@gmail.com', 'Invalid login attempt for emee46990@gmail.com', '{"email": "emee46990@gmail.com", "status": "failed", "reason": "invalid_credentials", "failed_attempts": 2, "remaining_attempts": 8, "lockout_duration_minutes": 3, "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:56:28.820628', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (52, 'Monitoring Personnel', 'update', 'User Management', 'User account updated: emee46990@gmail.com', 'User account updated: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 8, "status": "success"}', NULL, '', '2025-11-15 16:56:56.025476', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (53, 'Monitoring Personnel', 'update', 'User Management', 'User account updated: emee46990@gmail.com', 'User account updated: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 8, "status": "success"}', NULL, '', '2025-11-15 16:56:56.030266', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (54, 'Monitoring Personnel', 'login', 'Authentication', 'emee46990@gmail.com logged in', 'emee46990@gmail.com logged in', '{"user_id": 8, "email": "emee46990@gmail.com", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:56:56.037038', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (55, 'Monitoring Personnel', 'update', 'User Management', 'User account updated: emee46990@gmail.com', 'User account updated: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 8, "status": "success"}', NULL, '', '2025-11-15 16:57:30.474966', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (56, 'Monitoring Personnel', 'update', 'Authentication', 'emee46990@gmail.com completed first-time password setup', 'emee46990@gmail.com completed first-time password setup', '{"user_id": 8, "status": "success", "operation": "first_time_change_password", "path": "/api/auth/first-time-change-password/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:57:30.477604', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (57, 'Monitoring Personnel', 'update', 'User Management', 'User account updated: emee46990@gmail.com', 'User account updated: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 8, "status": "success"}', NULL, '', '2025-11-15 16:58:08.070135', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (58, 'Monitoring Personnel', 'login', 'Authentication', 'emee46990@gmail.com logged in', 'emee46990@gmail.com logged in', '{"user_id": 8, "email": "emee46990@gmail.com", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:58:08.075865', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (59, 'Admin', 'update', 'User Management', 'User account updated: admin@example.com', 'User account updated: admin@example.com', '{"entity_name": "admin@example.com", "entity_id": 1, "status": "success"}', NULL, '', '2025-11-15 16:58:26.246796', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (60, 'Admin', 'login', 'Authentication', 'admin@example.com logged in', 'admin@example.com logged in', '{"user_id": 1, "email": "admin@example.com", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:58:26.253733', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (61, '', 'backup', 'Backup & Restore', 'System created backup backup_20251116_005836.sql', 'System created backup backup_20251116_005836.sql', '{"status": "success", "file_name": "backup_20251116_005836.sql", "path": "backup\\\\backup_20251116_005836.sql", "location": "backup", "size_bytes": 120922, "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:58:37.316352', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (62, '', 'backup', 'Backup & Restore', 'System created backup backup_20251116_005846.sql', 'System created backup backup_20251116_005846.sql', '{"status": "success", "file_name": "backup_20251116_005846.sql", "path": "backup\\\\backup_20251116_005846.sql", "location": "backup", "size_bytes": 121787, "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 16:58:46.595364', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (63, 'Monitoring Personnel', 'create', 'User Management', 'User account created: emee46990@gmail.com', 'User account created: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 9, "role": "Monitoring Personnel", "status": "success"}', NULL, '', '2025-11-15 17:08:02.619943', 9);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (64, '', 'create', 'User Management', 'System registered user emee46990@gmail.com', 'System registered user emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 9, "role": "Monitoring Personnel", "status": "success", "path": "/api/auth/register/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 17:08:06.552584', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (65, 'Monitoring Personnel', 'update', 'User Management', 'User account updated: emee46990@gmail.com', 'User account updated: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 9, "status": "success"}', NULL, '', '2025-11-15 17:09:26.512050', 9);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (66, 'Monitoring Personnel', 'login', 'Authentication', 'emee46990@gmail.com logged in', 'emee46990@gmail.com logged in', '{"user_id": 9, "email": "emee46990@gmail.com", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 17:09:26.516833', 9);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (67, 'Monitoring Personnel', 'update', 'User Management', 'User account updated: emee46990@gmail.com', 'User account updated: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 9, "status": "success"}', NULL, '', '2025-11-15 17:09:46.491458', 9);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (68, 'Monitoring Personnel', 'update', 'Authentication', 'emee46990@gmail.com completed first-time password setup', 'emee46990@gmail.com completed first-time password setup', '{"user_id": 9, "status": "success", "operation": "first_time_change_password", "path": "/api/auth/first-time-change-password/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 17:09:46.493746', 9);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (69, 'Monitoring Personnel', 'update', 'User Management', 'User account updated: emee46990@gmail.com', 'User account updated: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 9, "status": "success"}', NULL, '', '2025-11-15 17:10:15.516712', 9);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (70, 'Monitoring Personnel', 'login', 'Authentication', 'emee46990@gmail.com logged in', 'emee46990@gmail.com logged in', '{"user_id": 9, "email": "emee46990@gmail.com", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 17:10:15.522119', 9);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (71, '', 'backup', 'Backup & Restore', 'System created backup backup_20251116_011053.sql', 'System created backup backup_20251116_011053.sql', '{"status": "success", "file_name": "backup_20251116_011053.sql", "path": "backup\\\\backup_20251116_011053.sql", "location": "backup", "size_bytes": 128596, "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 17:10:54.404951', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (72, '', 'backup', 'Backup & Restore', 'System created backup backup_20251116_011302.sql', 'System created backup backup_20251116_011302.sql', '{"status": "success", "file_name": "backup_20251116_011302.sql", "path": "backup\\\\backup_20251116_011302.sql", "location": "backup", "size_bytes": 129461, "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 17:13:02.657928', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (73, '', 'restore', 'Backup & Restore', 'System restored database from backup_20251116_011302.sql', 'System restored database from backup_20251116_011302.sql', '{"status": "success", "file_name": "backup_20251116_011302.sql", "path": "C:\\\\Users\\\\ming\\\\Documents\\\\GitHub\\\\integrated_establishments_regulatory_management_system\\\\server\\\\backups\\\\backup_20251116_011302.sql", "backup_record_id": 5, "restore_record": "restore_20251116_011439_from_backup_20251116_011302.sql", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 17:14:39.618363', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (74, 'Division Chief', 'create', 'Inspection Workflow', 'jerichourbano.01.01.04@gmail.com created inspection EIA-2025-11-15-0001', 'jerichourbano.01.01.04@gmail.com created inspection EIA-2025-11-15-0001', '{"entity_id": 1, "entity_name": "Inspection #1", "status": "success", "current_status": "SECTION_ASSIGNED", "assigned_to": "22101222@slc-sflu.edu.ph", "action": "inspection_creation", "law": "PD-1586", "establishment_ids": ["1"], "establishment_names": ["SAINT LOUIS COLLEGE"], "establishment_count": 1, "scheduled_at": null, "initial_status": "SECTION_ASSIGNED", "district": "LA UNION - 1st District", "path": "/api/inspections/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 19:14:58.485093', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (75, 'Section Chief', 'assign', 'Inspection Workflow', '22101222@slc-sflu.edu.ph forwarded inspection EIA-2025-11-15-0001 from SECTION_ASSIGNED to UNIT_ASSIGNED', '22101222@slc-sflu.edu.ph forwarded inspection EIA-2025-11-15-0001 from SECTION_ASSIGNED to UNIT_ASSIGNED', '{"entity_id": 1, "entity_name": "Inspection #1", "status": "success", "current_status": "UNIT_ASSIGNED", "assigned_to": "echo.010104@gmail.com", "action": "forward", "previous_status": "SECTION_ASSIGNED", "new_status": "UNIT_ASSIGNED", "assigned_userlevel": "Unit Head", "remarks": "Forwarded to next level", "path": "/api/inspections/1/forward/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 19:15:16.058460', 6);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (76, 'Unit Head', 'update', 'User Management', 'User account updated: echo.010104@gmail.com', 'User account updated: echo.010104@gmail.com', '{"entity_name": "echo.010104@gmail.com", "entity_id": 7, "status": "success"}', NULL, '', '2025-11-15 19:15:33.708414', 7);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (77, 'Unit Head', 'login', 'Authentication', 'echo.010104@gmail.com logged in', 'echo.010104@gmail.com logged in', '{"user_id": 7, "email": "echo.010104@gmail.com", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 19:15:33.713719', 7);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (78, 'Unit Head', 'assign', 'Inspection Workflow', 'echo.010104@gmail.com forwarded inspection EIA-2025-11-15-0001 from UNIT_ASSIGNED to MONITORING_ASSIGNED', 'echo.010104@gmail.com forwarded inspection EIA-2025-11-15-0001 from UNIT_ASSIGNED to MONITORING_ASSIGNED', '{"entity_id": 1, "entity_name": "Inspection #1", "status": "success", "current_status": "MONITORING_ASSIGNED", "assigned_to": "emee46990@gmail.com", "action": "forward", "previous_status": "UNIT_ASSIGNED", "new_status": "MONITORING_ASSIGNED", "assigned_userlevel": "Monitoring Personnel", "remarks": "Forwarded to EIA MONITORING EMB SAMPLE (Monitoring Personnel)", "path": "/api/inspections/1/forward/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 19:15:49.154207', 7);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (79, 'Monitoring Personnel', 'update', 'Inspection Workflow', 'emee46990@gmail.com moved inspection to MONITORING_IN_PROGRESS', 'emee46990@gmail.com moved inspection to MONITORING_IN_PROGRESS', '{"entity_id": 1, "entity_name": "Inspection #1", "status": "success", "current_status": "MONITORING_IN_PROGRESS", "assigned_to": "emee46990@gmail.com", "previous_status": "MONITORING_ASSIGNED", "new_status": "MONITORING_IN_PROGRESS", "remarks": "Moved to My Inspections", "path": "/api/inspections/1/inspect/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 19:15:58.829859', 9);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (80, 'Monitoring Personnel', 'update', 'Inspection Workflow', 'emee46990@gmail.com completed inspection EIA-2025-11-15-0001 as NON_COMPLIANT', 'emee46990@gmail.com completed inspection EIA-2025-11-15-0001 as NON_COMPLIANT', '{"entity_id": 1, "entity_name": "Inspection #1", "status": "success", "current_status": "MONITORING_COMPLETED_NON_COMPLIANT", "assigned_to": "emee46990@gmail.com", "action": "complete", "previous_status": "MONITORING_IN_PROGRESS", "new_status": "MONITORING_COMPLETED_NON_COMPLIANT", "compliance_decision": "NON_COMPLIANT", "violations_found": "1. PD-1586:, 1.1 Project Description: ASDAD  ASDASD, 1.2 Environmental Impact Statement System: sdfsdsdfsd", "remarks": "Inspection completed by Monitoring Personnel", "path": "/api/inspections/1/complete/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 19:18:34.101725', 9);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (81, 'Unit Head', 'approve', 'Inspection Workflow', 'echo.010104@gmail.com reviewed and forwarded inspection EIA-2025-11-15-0001 to Section Chief', 'echo.010104@gmail.com reviewed and forwarded inspection EIA-2025-11-15-0001 to Section Chief', '{"entity_id": 1, "entity_name": "Inspection #1", "status": "success", "current_status": "UNIT_REVIEWED", "assigned_to": "22101222@slc-sflu.edu.ph", "action": "review_and_forward_unit", "previous_status": "MONITORING_COMPLETED_NON_COMPLIANT", "new_status": "UNIT_REVIEWED", "remarks": "Unit Head approved and forwarded to Section Chief", "path": "/api/inspections/1/review_and_forward_unit/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 19:19:02.671076', 7);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (82, 'Section Chief', 'approve', 'Inspection Workflow', '22101222@slc-sflu.edu.ph reviewed and forwarded inspection EIA-2025-11-15-0001 to Division Chief', '22101222@slc-sflu.edu.ph reviewed and forwarded inspection EIA-2025-11-15-0001 to Division Chief', '{"entity_id": 1, "entity_name": "Inspection #1", "status": "success", "current_status": "SECTION_REVIEWED", "assigned_to": "jerichourbano.01.01.04@gmail.com", "action": "review_and_forward_section", "previous_status": "UNIT_REVIEWED", "new_status": "SECTION_REVIEWED", "remarks": "Section Chief approved and forwarded to Division Chief", "path": "/api/inspections/1/review_and_forward_section/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 19:19:19.001765', 6);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (83, 'Admin', 'update', 'User Management', 'User account updated: admin@example.com', 'User account updated: admin@example.com', '{"entity_name": "admin@example.com", "entity_id": 1, "status": "success"}', NULL, '', '2025-11-15 19:19:36.736903', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (84, 'Admin', 'login', 'Authentication', 'admin@example.com logged in', 'admin@example.com logged in', '{"user_id": 1, "email": "admin@example.com", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-15 19:19:36.747088', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (85, 'Division Chief', 'approve', 'Inspection Workflow', 'jerichourbano.01.01.04@gmail.com reviewed inspection EIA-2025-11-15-0001 and marked as DIVISION_REVIEWED', 'jerichourbano.01.01.04@gmail.com reviewed inspection EIA-2025-11-15-0001 and marked as DIVISION_REVIEWED', '{"entity_id": 1, "entity_name": "Inspection #1", "status": "success", "current_status": "DIVISION_REVIEWED", "assigned_to": "jerichourbano.01.01.04@gmail.com", "action": "review_division", "previous_status": "SECTION_REVIEWED", "new_status": "DIVISION_REVIEWED", "remarks": "Division Chief reviewed and marked as DIVISION_REVIEWED", "path": "/api/inspections/1/review_division/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 09:35:30.295368', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (86, 'Legal Unit', 'create', 'User Management', 'User account created: 22100949@slc-sflu.edu.ph', 'User account created: 22100949@slc-sflu.edu.ph', '{"entity_name": "22100949@slc-sflu.edu.ph", "entity_id": 10, "role": "Legal Unit", "status": "success"}', NULL, '', '2025-11-16 09:36:50.305009', 10);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (87, '', 'create', 'User Management', 'System registered user 22100949@slc-sflu.edu.ph', 'System registered user 22100949@slc-sflu.edu.ph', '{"entity_name": "22100949@slc-sflu.edu.ph", "entity_id": 10, "role": "Legal Unit", "status": "success", "path": "/api/auth/register/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 09:36:55.678959', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (88, 'Legal Unit', 'update', 'User Management', 'User account updated: 22100949@slc-sflu.edu.ph', 'User account updated: 22100949@slc-sflu.edu.ph', '{"entity_name": "22100949@slc-sflu.edu.ph", "entity_id": 10, "status": "success"}', NULL, '', '2025-11-16 09:39:55.321767', 10);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (89, 'Legal Unit', 'login', 'Authentication', '22100949@slc-sflu.edu.ph logged in', '22100949@slc-sflu.edu.ph logged in', '{"user_id": 10, "email": "22100949@slc-sflu.edu.ph", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 09:39:55.326836', 10);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (90, 'Legal Unit', 'update', 'User Management', 'User account updated: 22100949@slc-sflu.edu.ph', 'User account updated: 22100949@slc-sflu.edu.ph', '{"entity_name": "22100949@slc-sflu.edu.ph", "entity_id": 10, "status": "success"}', NULL, '', '2025-11-16 09:40:33.383603', 10);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (91, 'Legal Unit', 'update', 'Authentication', '22100949@slc-sflu.edu.ph completed first-time password setup', '22100949@slc-sflu.edu.ph completed first-time password setup', '{"user_id": 10, "status": "success", "operation": "first_time_change_password", "path": "/api/auth/first-time-change-password/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 09:40:33.385908', 10);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (92, 'Legal Unit', 'update', 'User Management', 'User account updated: 22100949@slc-sflu.edu.ph', 'User account updated: 22100949@slc-sflu.edu.ph', '{"entity_name": "22100949@slc-sflu.edu.ph", "entity_id": 10, "status": "success"}', NULL, '', '2025-11-16 09:40:50.599957', 10);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (93, 'Legal Unit', 'login', 'Authentication', '22100949@slc-sflu.edu.ph logged in', '22100949@slc-sflu.edu.ph logged in', '{"user_id": 10, "email": "22100949@slc-sflu.edu.ph", "status": "success", "path": "/api/auth/login/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 09:40:50.607370', 10);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (94, 'Division Chief', 'update', 'User Management', 'User account updated: jerichourbano.01.01.04@gmail.com', 'User account updated: jerichourbano.01.01.04@gmail.com', '{"entity_name": "jerichourbano.01.01.04@gmail.com", "entity_id": 2, "status": "success"}', NULL, '', '2025-11-16 09:45:39.693569', 2);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (95, 'Admin', 'update', 'User Management', 'admin@example.com updated user jerichourbano.01.01.04@gmail.com', 'admin@example.com updated user jerichourbano.01.01.04@gmail.com', '{"entity_name": "jerichourbano.01.01.04@gmail.com", "entity_id": 2, "status": "success", "path": "/api/auth/users/2/", "method": "PUT"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 09:45:39.806226', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (96, 'Section Chief', 'update', 'User Management', 'User account updated: 22101222@slc-sflu.edu.ph', 'User account updated: 22101222@slc-sflu.edu.ph', '{"entity_name": "22101222@slc-sflu.edu.ph", "entity_id": 6, "status": "success"}', NULL, '', '2025-11-16 09:46:11.891905', 6);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (97, 'Admin', 'update', 'User Management', 'admin@example.com updated user 22101222@slc-sflu.edu.ph', 'admin@example.com updated user 22101222@slc-sflu.edu.ph', '{"entity_name": "22101222@slc-sflu.edu.ph", "entity_id": 6, "status": "success", "path": "/api/auth/users/6/", "method": "PUT"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 09:46:11.906580', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (98, 'Unit Head', 'update', 'User Management', 'User account updated: echo.010104@gmail.com', 'User account updated: echo.010104@gmail.com', '{"entity_name": "echo.010104@gmail.com", "entity_id": 7, "status": "success"}', NULL, '', '2025-11-16 09:46:32.405906', 7);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (99, 'Admin', 'update', 'User Management', 'admin@example.com updated user echo.010104@gmail.com', 'admin@example.com updated user echo.010104@gmail.com', '{"entity_name": "echo.010104@gmail.com", "entity_id": 7, "status": "success", "path": "/api/auth/users/7/", "method": "PUT"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 09:46:32.415382', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (100, 'Monitoring Personnel', 'update', 'User Management', 'User account updated: emee46990@gmail.com', 'User account updated: emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 9, "status": "success"}', NULL, '', '2025-11-16 09:46:53.726745', 9);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (101, 'Admin', 'update', 'User Management', 'admin@example.com updated user emee46990@gmail.com', 'admin@example.com updated user emee46990@gmail.com', '{"entity_name": "emee46990@gmail.com", "entity_id": 9, "status": "success", "path": "/api/auth/users/9/", "method": "PUT"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 09:46:53.734836', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (102, 'Legal Unit', 'update', 'User Management', 'User account updated: 22100949@slc-sflu.edu.ph', 'User account updated: 22100949@slc-sflu.edu.ph', '{"entity_name": "22100949@slc-sflu.edu.ph", "entity_id": 10, "status": "success"}', NULL, '', '2025-11-16 09:47:08.256456', 10);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (103, 'Admin', 'update', 'User Management', 'admin@example.com updated user 22100949@slc-sflu.edu.ph', 'admin@example.com updated user 22100949@slc-sflu.edu.ph', '{"entity_name": "22100949@slc-sflu.edu.ph", "entity_id": 10, "status": "success", "path": "/api/auth/users/10/", "method": "PUT"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 09:47:08.295295', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (104, '', 'backup', 'Backup & Restore', 'System created backup backup_20251116_181123.sql', 'System created backup backup_20251116_181123.sql', '{"status": "success", "file_name": "backup_20251116_181123.sql", "path": "backup\\\\backup_20251116_181123.sql", "location": "backup", "size_bytes": 191579, "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 10:11:30.728118', NULL);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (105, 'Section Chief', 'update', 'User Management', 'User account updated: 22101222@slc-sflu.edu.ph', 'User account updated: 22101222@slc-sflu.edu.ph', '{"entity_name": "22101222@slc-sflu.edu.ph", "entity_id": 6, "status": "success"}', NULL, '', '2025-11-16 10:19:24.436176', 6);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (106, 'Admin', 'update', 'User Management', 'admin@example.com updated user 22101222@slc-sflu.edu.ph', 'admin@example.com updated user 22101222@slc-sflu.edu.ph', '{"entity_name": "22101222@slc-sflu.edu.ph", "entity_id": 6, "status": "success", "path": "/api/auth/users/6/", "method": "PUT"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 10:19:24.456365', 1);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (107, 'Section Chief', 'create', 'User Management', 'User account created: harryzabate@gmail.com', 'User account created: harryzabate@gmail.com', '{"entity_name": "harryzabate@gmail.com", "entity_id": 11, "role": "Section Chief", "status": "success"}', NULL, '', '2025-11-16 10:20:52.757076', 11);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (108, 'Section Chief', 'update', 'User Management', 'User account updated: harryzabate@gmail.com', 'User account updated: harryzabate@gmail.com', '{"entity_name": "harryzabate@gmail.com", "entity_id": 11, "status": "success"}', NULL, '', '2025-11-16 10:20:53.696984', 11);
INSERT INTO `audit_activitylog` (`id`, `role`, `action`, `module`, `description`, `message`, `metadata`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (109, '', 'create', 'User Management', 'System registered user harryzabate@gmail.com', 'System registered user harryzabate@gmail.com', '{"entity_name": "harryzabate@gmail.com", "entity_id": 11, "role": "Section Chief", "status": "success", "path": "/api/auth/register/", "method": "POST"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '2025-11-16 10:21:00.275535', NULL);

--
-- Table structure for table `auth_group`
--
DROP TABLE IF EXISTS `auth_group`;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_group`
--

--
-- Table structure for table `auth_group_permissions`
--
DROP TABLE IF EXISTS `auth_group_permissions`;
CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_group_permissions`
--

--
-- Table structure for table `auth_permission`
--
DROP TABLE IF EXISTS `auth_permission`;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auth_permission`
--
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (1, 'Can add log entry', 1, 'add_logentry');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (2, 'Can change log entry', 1, 'change_logentry');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (3, 'Can delete log entry', 1, 'delete_logentry');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (4, 'Can view log entry', 1, 'view_logentry');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (5, 'Can add permission', 2, 'add_permission');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (6, 'Can change permission', 2, 'change_permission');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (7, 'Can delete permission', 2, 'delete_permission');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (8, 'Can view permission', 2, 'view_permission');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (9, 'Can add group', 3, 'add_group');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (10, 'Can change group', 3, 'change_group');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (11, 'Can delete group', 3, 'delete_group');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (12, 'Can view group', 3, 'view_group');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (13, 'Can add content type', 4, 'add_contenttype');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (14, 'Can change content type', 4, 'change_contenttype');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (15, 'Can delete content type', 4, 'delete_contenttype');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (16, 'Can view content type', 4, 'view_contenttype');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (17, 'Can add session', 5, 'add_session');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (18, 'Can change session', 5, 'change_session');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (19, 'Can delete session', 5, 'delete_session');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (20, 'Can view session', 5, 'view_session');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (21, 'Can add Blacklisted Token', 6, 'add_blacklistedtoken');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (22, 'Can change Blacklisted Token', 6, 'change_blacklistedtoken');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (23, 'Can delete Blacklisted Token', 6, 'delete_blacklistedtoken');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (24, 'Can view Blacklisted Token', 6, 'view_blacklistedtoken');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (25, 'Can add Outstanding Token', 7, 'add_outstandingtoken');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (26, 'Can change Outstanding Token', 7, 'change_outstandingtoken');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (27, 'Can delete Outstanding Token', 7, 'delete_outstandingtoken');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (28, 'Can view Outstanding Token', 7, 'view_outstandingtoken');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (29, 'Can add user', 8, 'add_user');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (30, 'Can change user', 8, 'change_user');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (31, 'Can delete user', 8, 'delete_user');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (32, 'Can view user', 8, 'view_user');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (33, 'Can add establishment', 9, 'add_establishment');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (34, 'Can change establishment', 9, 'change_establishment');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (35, 'Can delete establishment', 9, 'delete_establishment');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (36, 'Can view establishment', 9, 'view_establishment');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (37, 'Can add notification', 10, 'add_notification');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (38, 'Can change notification', 10, 'change_notification');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (39, 'Can delete notification', 10, 'delete_notification');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (40, 'Can view notification', 10, 'view_notification');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (41, 'Can add activity log', 11, 'add_activitylog');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (42, 'Can change activity log', 11, 'change_activitylog');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (43, 'Can delete activity log', 11, 'delete_activitylog');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (44, 'Can view activity log', 11, 'view_activitylog');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (45, 'Can add Billing Record', 12, 'add_billingrecord');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (46, 'Can change Billing Record', 12, 'change_billingrecord');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (47, 'Can delete Billing Record', 12, 'delete_billingrecord');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (48, 'Can view Billing Record', 12, 'view_billingrecord');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (49, 'Can add compliance quota', 13, 'add_compliancequota');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (50, 'Can change compliance quota', 13, 'change_compliancequota');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (51, 'Can delete compliance quota', 13, 'delete_compliancequota');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (52, 'Can view compliance quota', 13, 'view_compliancequota');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (53, 'Can add inspection', 14, 'add_inspection');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (54, 'Can change inspection', 14, 'change_inspection');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (55, 'Can delete inspection', 14, 'delete_inspection');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (56, 'Can view inspection', 14, 'view_inspection');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (57, 'Can add inspection document', 15, 'add_inspectiondocument');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (58, 'Can change inspection document', 15, 'change_inspectiondocument');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (59, 'Can delete inspection document', 15, 'delete_inspectiondocument');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (60, 'Can view inspection document', 15, 'view_inspectiondocument');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (61, 'Can add inspection history', 16, 'add_inspectionhistory');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (62, 'Can change inspection history', 16, 'change_inspectionhistory');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (63, 'Can delete inspection history', 16, 'delete_inspectionhistory');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (64, 'Can view inspection history', 16, 'view_inspectionhistory');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (65, 'Can add quarterly evaluation', 17, 'add_quarterlyevaluation');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (66, 'Can change quarterly evaluation', 17, 'change_quarterlyevaluation');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (67, 'Can delete quarterly evaluation', 17, 'delete_quarterlyevaluation');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (68, 'Can view quarterly evaluation', 17, 'view_quarterlyevaluation');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (69, 'Can add inspection form', 18, 'add_inspectionform');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (70, 'Can change inspection form', 18, 'change_inspectionform');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (71, 'Can delete inspection form', 18, 'delete_inspectionform');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (72, 'Can view inspection form', 18, 'view_inspectionform');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (73, 'Can add reinspection schedule', 19, 'add_reinspectionschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (74, 'Can change reinspection schedule', 19, 'change_reinspectionschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (75, 'Can delete reinspection schedule', 19, 'delete_reinspectionschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (76, 'Can view reinspection schedule', 19, 'view_reinspectionschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (77, 'Can add Notice of Order', 20, 'add_noticeoforder');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (78, 'Can change Notice of Order', 20, 'change_noticeoforder');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (79, 'Can delete Notice of Order', 20, 'delete_noticeoforder');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (80, 'Can view Notice of Order', 20, 'view_noticeoforder');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (81, 'Can add Notice of Violation', 21, 'add_noticeofviolation');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (82, 'Can change Notice of Violation', 21, 'change_noticeofviolation');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (83, 'Can delete Notice of Violation', 21, 'delete_noticeofviolation');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (84, 'Can view Notice of Violation', 21, 'view_noticeofviolation');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (85, 'Can add System Configuration', 22, 'add_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (86, 'Can change System Configuration', 22, 'change_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (87, 'Can delete System Configuration', 22, 'delete_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (88, 'Can view System Configuration', 22, 'view_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (89, 'Can add Backup Record', 23, 'add_backuprecord');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (90, 'Can change Backup Record', 23, 'change_backuprecord');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (91, 'Can delete Backup Record', 23, 'delete_backuprecord');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (92, 'Can view Backup Record', 23, 'view_backuprecord');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (93, 'Can add Accomplishment Report', 24, 'add_accomplishmentreport');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (94, 'Can change Accomplishment Report', 24, 'change_accomplishmentreport');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (95, 'Can delete Accomplishment Report', 24, 'delete_accomplishmentreport');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (96, 'Can view Accomplishment Report', 24, 'view_accomplishmentreport');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (97, 'Can add Report Metric', 25, 'add_reportmetric');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (98, 'Can change Report Metric', 25, 'change_reportmetric');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (99, 'Can delete Report Metric', 25, 'delete_reportmetric');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (100, 'Can view Report Metric', 25, 'view_reportmetric');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (101, 'Can add crontab', 26, 'add_crontabschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (102, 'Can change crontab', 26, 'change_crontabschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (103, 'Can delete crontab', 26, 'delete_crontabschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (104, 'Can view crontab', 26, 'view_crontabschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (105, 'Can add interval', 27, 'add_intervalschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (106, 'Can change interval', 27, 'change_intervalschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (107, 'Can delete interval', 27, 'delete_intervalschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (108, 'Can view interval', 27, 'view_intervalschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (109, 'Can add periodic task', 28, 'add_periodictask');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (110, 'Can change periodic task', 28, 'change_periodictask');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (111, 'Can delete periodic task', 28, 'delete_periodictask');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (112, 'Can view periodic task', 28, 'view_periodictask');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (113, 'Can add periodic tasks', 29, 'add_periodictasks');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (114, 'Can change periodic tasks', 29, 'change_periodictasks');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (115, 'Can delete periodic tasks', 29, 'delete_periodictasks');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (116, 'Can view periodic tasks', 29, 'view_periodictasks');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (117, 'Can add solar event', 30, 'add_solarschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (118, 'Can change solar event', 30, 'change_solarschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (119, 'Can delete solar event', 30, 'delete_solarschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (120, 'Can view solar event', 30, 'view_solarschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (121, 'Can add clocked', 31, 'add_clockedschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (122, 'Can change clocked', 31, 'change_clockedschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (123, 'Can delete clocked', 31, 'delete_clockedschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (124, 'Can view clocked', 31, 'view_clockedschedule');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (125, 'Can add email queue', 32, 'add_emailqueue');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (126, 'Can change email queue', 32, 'change_emailqueue');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (127, 'Can delete email queue', 32, 'delete_emailqueue');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (128, 'Can view email queue', 32, 'view_emailqueue');

--
-- Table structure for table `django_admin_log`
--
DROP TABLE IF EXISTS `django_admin_log`;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_users_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_admin_log`
--
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (1, '2025-11-15 16:46:49.645417', '3', '22101222@slc-sflu.edu.ph (Section Chief)', 3, '', 8, 1);
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (2, '2025-11-15 16:46:56.052293', '4', 'echo.010104@gmail.com (Unit Head)', 3, '', 8, 1);
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (3, '2025-11-15 16:47:01.078553', '5', 'emee46990@gmail.com (Monitoring Personnel)', 3, '', 8, 1);
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (4, '2025-11-15 17:07:01.181619', '8', 'emee46990@gmail.com (Monitoring Personnel)', 3, '', 8, 1);

--
-- Table structure for table `django_celery_beat_clockedschedule`
--
DROP TABLE IF EXISTS `django_celery_beat_clockedschedule`;
CREATE TABLE `django_celery_beat_clockedschedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clocked_time` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_celery_beat_clockedschedule`
--

--
-- Table structure for table `django_celery_beat_crontabschedule`
--
DROP TABLE IF EXISTS `django_celery_beat_crontabschedule`;
CREATE TABLE `django_celery_beat_crontabschedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `minute` varchar(240) NOT NULL,
  `hour` varchar(96) NOT NULL,
  `day_of_week` varchar(64) NOT NULL,
  `day_of_month` varchar(124) NOT NULL,
  `month_of_year` varchar(64) NOT NULL,
  `timezone` varchar(63) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_celery_beat_crontabschedule`
--

--
-- Table structure for table `django_celery_beat_intervalschedule`
--
DROP TABLE IF EXISTS `django_celery_beat_intervalschedule`;
CREATE TABLE `django_celery_beat_intervalschedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `every` int(11) NOT NULL,
  `period` varchar(24) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_celery_beat_intervalschedule`
--

--
-- Table structure for table `django_celery_beat_periodictask`
--
DROP TABLE IF EXISTS `django_celery_beat_periodictask`;
CREATE TABLE `django_celery_beat_periodictask` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `task` varchar(200) NOT NULL,
  `args` longtext NOT NULL,
  `kwargs` longtext NOT NULL,
  `queue` varchar(200) DEFAULT NULL,
  `exchange` varchar(200) DEFAULT NULL,
  `routing_key` varchar(200) DEFAULT NULL,
  `expires` datetime(6) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL,
  `last_run_at` datetime(6) DEFAULT NULL,
  `total_run_count` int(10) unsigned NOT NULL CHECK (`total_run_count` >= 0),
  `date_changed` datetime(6) NOT NULL,
  `description` longtext NOT NULL,
  `crontab_id` int(11) DEFAULT NULL,
  `interval_id` int(11) DEFAULT NULL,
  `solar_id` int(11) DEFAULT NULL,
  `one_off` tinyint(1) NOT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `priority` int(10) unsigned DEFAULT NULL CHECK (`priority` >= 0),
  `headers` longtext NOT NULL,
  `clocked_id` int(11) DEFAULT NULL,
  `expire_seconds` int(10) unsigned DEFAULT NULL CHECK (`expire_seconds` >= 0),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `django_celery_beat_p_crontab_id_d3cba168_fk_django_ce` (`crontab_id`),
  KEY `django_celery_beat_p_interval_id_a8ca27da_fk_django_ce` (`interval_id`),
  KEY `django_celery_beat_p_solar_id_a87ce72c_fk_django_ce` (`solar_id`),
  KEY `django_celery_beat_p_clocked_id_47a69f82_fk_django_ce` (`clocked_id`),
  CONSTRAINT `django_celery_beat_p_clocked_id_47a69f82_fk_django_ce` FOREIGN KEY (`clocked_id`) REFERENCES `django_celery_beat_clockedschedule` (`id`),
  CONSTRAINT `django_celery_beat_p_crontab_id_d3cba168_fk_django_ce` FOREIGN KEY (`crontab_id`) REFERENCES `django_celery_beat_crontabschedule` (`id`),
  CONSTRAINT `django_celery_beat_p_interval_id_a8ca27da_fk_django_ce` FOREIGN KEY (`interval_id`) REFERENCES `django_celery_beat_intervalschedule` (`id`),
  CONSTRAINT `django_celery_beat_p_solar_id_a87ce72c_fk_django_ce` FOREIGN KEY (`solar_id`) REFERENCES `django_celery_beat_solarschedule` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_celery_beat_periodictask`
--

--
-- Table structure for table `django_celery_beat_periodictasks`
--
DROP TABLE IF EXISTS `django_celery_beat_periodictasks`;
CREATE TABLE `django_celery_beat_periodictasks` (
  `ident` smallint(6) NOT NULL,
  `last_update` datetime(6) NOT NULL,
  PRIMARY KEY (`ident`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_celery_beat_periodictasks`
--

--
-- Table structure for table `django_celery_beat_solarschedule`
--
DROP TABLE IF EXISTS `django_celery_beat_solarschedule`;
CREATE TABLE `django_celery_beat_solarschedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event` varchar(24) NOT NULL,
  `latitude` decimal(9,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_celery_beat_solar_event_latitude_longitude_ba64999a_uniq` (`event`,`latitude`,`longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_celery_beat_solarschedule`
--

--
-- Table structure for table `django_content_type`
--
DROP TABLE IF EXISTS `django_content_type`;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_content_type`
--
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (1, 'admin', 'logentry');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (11, 'audit', 'activitylog');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (3, 'auth', 'group');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (2, 'auth', 'permission');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (4, 'contenttypes', 'contenttype');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (31, 'django_celery_beat', 'clockedschedule');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (26, 'django_celery_beat', 'crontabschedule');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (27, 'django_celery_beat', 'intervalschedule');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (28, 'django_celery_beat', 'periodictask');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (29, 'django_celery_beat', 'periodictasks');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (30, 'django_celery_beat', 'solarschedule');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (9, 'establishments', 'establishment');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (12, 'inspections', 'billingrecord');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (13, 'inspections', 'compliancequota');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (14, 'inspections', 'inspection');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (15, 'inspections', 'inspectiondocument');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (18, 'inspections', 'inspectionform');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (16, 'inspections', 'inspectionhistory');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (20, 'inspections', 'noticeoforder');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (21, 'inspections', 'noticeofviolation');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (17, 'inspections', 'quarterlyevaluation');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (19, 'inspections', 'reinspectionschedule');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (10, 'notifications', 'notification');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (24, 'reports', 'accomplishmentreport');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (25, 'reports', 'reportmetric');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (5, 'sessions', 'session');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (23, 'system', 'backuprecord');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (22, 'system_config', 'systemconfiguration');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (6, 'token_blacklist', 'blacklistedtoken');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (7, 'token_blacklist', 'outstandingtoken');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (32, 'users', 'emailqueue');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (8, 'users', 'user');

--
-- Table structure for table `django_migrations`
--
DROP TABLE IF EXISTS `django_migrations`;
CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_migrations`
--
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (1, 'contenttypes', '0001_initial', '2025-11-13 15:04:59.985588');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (2, 'contenttypes', '0002_remove_content_type_name', '2025-11-13 15:05:00.111214');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (3, 'auth', '0001_initial', '2025-11-13 15:05:00.499257');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (4, 'auth', '0002_alter_permission_name_max_length', '2025-11-13 15:05:00.577054');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (5, 'auth', '0003_alter_user_email_max_length', '2025-11-13 15:05:00.611563');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (6, 'auth', '0004_alter_user_username_opts', '2025-11-13 15:05:00.621123');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (7, 'auth', '0005_alter_user_last_login_null', '2025-11-13 15:05:00.630402');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (8, 'auth', '0006_require_contenttypes_0002', '2025-11-13 15:05:00.635906');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (9, 'auth', '0007_alter_validators_add_error_messages', '2025-11-13 15:05:00.647574');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (10, 'auth', '0008_alter_user_username_max_length', '2025-11-13 15:05:00.666934');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (11, 'auth', '0009_alter_user_last_name_max_length', '2025-11-13 15:05:00.688553');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (12, 'auth', '0010_alter_group_name_max_length', '2025-11-13 15:05:00.717057');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (13, 'auth', '0011_update_proxy_permissions', '2025-11-13 15:05:00.739654');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (14, 'auth', '0012_alter_user_first_name_max_length', '2025-11-13 15:05:00.770463');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (15, 'users', '0001_initial', '2025-11-13 15:05:01.556656');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (16, 'admin', '0001_initial', '2025-11-13 15:05:01.802110');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (17, 'admin', '0002_logentry_remove_auto_add', '2025-11-13 15:05:01.828229');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (18, 'admin', '0003_logentry_add_action_flag_choices', '2025-11-13 15:05:01.846744');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (19, 'audit', '0001_initial', '2025-11-13 15:05:01.885657');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (20, 'audit', '0002_initial', '2025-11-13 15:05:02.013949');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (21, 'django_celery_beat', '0001_initial', '2025-11-13 15:05:02.283429');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (22, 'django_celery_beat', '0002_auto_20161118_0346', '2025-11-13 15:05:02.451672');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (23, 'django_celery_beat', '0003_auto_20161209_0049', '2025-11-13 15:05:02.490607');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (24, 'django_celery_beat', '0004_auto_20170221_0000', '2025-11-13 15:05:02.502195');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (25, 'django_celery_beat', '0005_add_solarschedule_events_choices', '2025-11-13 15:05:02.519736');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (26, 'django_celery_beat', '0006_auto_20180322_0932', '2025-11-13 15:05:02.615503');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (27, 'django_celery_beat', '0007_auto_20180521_0826', '2025-11-13 15:05:02.667853');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (28, 'django_celery_beat', '0008_auto_20180914_1922', '2025-11-13 15:05:02.744999');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (29, 'django_celery_beat', '0006_auto_20180210_1226', '2025-11-13 15:05:02.799821');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (30, 'django_celery_beat', '0006_periodictask_priority', '2025-11-13 15:05:02.827253');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (31, 'django_celery_beat', '0009_periodictask_headers', '2025-11-13 15:05:02.875692');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (32, 'django_celery_beat', '0010_auto_20190429_0326', '2025-11-13 15:05:03.149462');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (33, 'django_celery_beat', '0011_auto_20190508_0153', '2025-11-13 15:05:03.241377');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (34, 'django_celery_beat', '0012_periodictask_expire_seconds', '2025-11-13 15:05:03.273933');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (35, 'django_celery_beat', '0013_auto_20200609_0727', '2025-11-13 15:05:03.309058');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (36, 'django_celery_beat', '0014_remove_clockedschedule_enabled', '2025-11-13 15:05:03.324207');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (37, 'django_celery_beat', '0015_edit_solarschedule_events_choices', '2025-11-13 15:05:03.342104');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (38, 'django_celery_beat', '0016_alter_crontabschedule_timezone', '2025-11-13 15:05:03.379957');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (39, 'django_celery_beat', '0017_alter_crontabschedule_month_of_year', '2025-11-13 15:05:03.411286');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (40, 'django_celery_beat', '0018_improve_crontab_helptext', '2025-11-13 15:05:03.430703');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (41, 'establishments', '0001_initial', '2025-11-13 15:05:03.508469');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (42, 'inspections', '0001_initial', '2025-11-13 15:05:03.844208');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (43, 'inspections', '0002_initial', '2025-11-13 15:05:06.024891');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (44, 'notifications', '0001_initial', '2025-11-13 15:05:06.041022');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (45, 'notifications', '0002_initial', '2025-11-13 15:05:06.405659');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (46, 'reports', '0001_initial', '2025-11-13 15:05:06.769189');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (47, 'reports', '0002_initial', '2025-11-13 15:05:06.905167');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (48, 'sessions', '0001_initial', '2025-11-13 15:05:06.966915');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (49, 'system', '0001_initial', '2025-11-13 15:05:07.078938');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (50, 'system_config', '0001_initial', '2025-11-13 15:05:07.095689');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (51, 'token_blacklist', '0001_initial', '2025-11-13 15:05:07.321452');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (52, 'token_blacklist', '0002_outstandingtoken_jti_hex', '2025-11-13 15:05:07.368708');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (53, 'token_blacklist', '0003_auto_20171017_2007', '2025-11-13 15:05:07.434151');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (54, 'token_blacklist', '0004_auto_20171017_2013', '2025-11-13 15:05:07.548349');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (55, 'token_blacklist', '0005_remove_outstandingtoken_jti', '2025-11-13 15:05:07.590837');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (56, 'token_blacklist', '0006_auto_20171017_2113', '2025-11-13 15:05:07.659661');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (57, 'token_blacklist', '0007_auto_20171017_2214', '2025-11-13 15:05:08.172080');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (58, 'token_blacklist', '0008_migrate_to_bigautofield', '2025-11-13 15:05:08.689725');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (59, 'token_blacklist', '0010_fix_migrate_to_bigautofield', '2025-11-13 15:05:08.767038');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (60, 'token_blacklist', '0011_linearizes_history', '2025-11-13 15:05:08.775768');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (61, 'token_blacklist', '0012_alter_outstandingtoken_user', '2025-11-13 15:05:08.833240');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (62, 'token_blacklist', '0013_alter_blacklistedtoken_options_and_more', '2025-11-13 15:05:08.886275');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (63, 'inspections', '0003_noticeoforder_contact_person_and_more', '2025-11-15 16:19:00.900558');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (64, 'inspections', '0004_billingrecord_payment_fields', '2025-11-15 16:19:01.271217');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (65, 'inspections', '0005_billingrecord_unpaid_status', '2025-11-15 16:19:01.321917');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (66, 'inspections', '0006_alter_billingrecord_payment_status', '2025-11-15 16:19:01.400923');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (67, 'notifications', '0003_alter_notification_notification_type', '2025-11-15 16:19:01.445467');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (68, 'users', '0002_emailqueue', '2025-11-15 16:19:01.752464');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (69, 'users', '0003_delete_emailqueue', '2025-11-15 16:19:34.557135');

--
-- Table structure for table `django_session`
--
DROP TABLE IF EXISTS `django_session`;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_session`
--
INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES ('7qs0j5io4sbek68qve3d4jqrbyvze2wp', '.eJxVjDkOwjAUBe_iGlnxbijpcwbLfzEOIEeKkwpxd4iUAto3M-8lUt7WmrbOS5pIXIQSp98NMj647YDuud1miXNblwnkrsiDdjnOxM_r4f4d1Nzrt2ZAx4gROVsV0GfrwKkBtddnMkSBgyom4hCiLsaF6KLhYKIvlsBBEe8PArI4RA:1vKJPz:eQEZrZLcib_pyxlFTKaKvLY1sd5Rl4VmuJ4LSrWndMM', '2025-11-29 16:46:31.925283');

--
-- Table structure for table `establishments_establishment`
--
DROP TABLE IF EXISTS `establishments_establishment`;
CREATE TABLE `establishments_establishment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `nature_of_business` varchar(255) NOT NULL,
  `year_established` varchar(4) NOT NULL,
  `province` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `barangay` varchar(100) NOT NULL,
  `street_building` varchar(255) NOT NULL,
  `postal_code` varchar(4) NOT NULL,
  `latitude` decimal(9,6) NOT NULL,
  `longitude` decimal(9,6) NOT NULL,
  `polygon` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`polygon`)),
  `marker_icon` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `establishme_name_9f5395_idx` (`name`),
  KEY `establishme_nature__7f0240_idx` (`nature_of_business`),
  KEY `establishme_city_6fc21b_idx` (`city`),
  KEY `establishme_baranga_fe31e9_idx` (`barangay`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `establishments_establishment`
--
INSERT INTO `establishments_establishment` (`id`, `name`, `nature_of_business`, `year_established`, `province`, `city`, `barangay`, `street_building`, `postal_code`, `latitude`, `longitude`, `polygon`, `marker_icon`, `is_active`, `created_at`, `updated_at`) VALUES (1, 'SAINT LOUIS COLLEGE', 'EDUCATION/TRAINING', '1964', 'LA UNION', 'SAN FERNANDO', 'Carlatan', '1', '2500', '16.636547', '120.313189', NULL, NULL, 1, '2025-11-15 16:26:33.239983', '2025-11-15 16:26:33.285890');

--
-- Table structure for table `inspections_billingrecord`
--
DROP TABLE IF EXISTS `inspections_billingrecord`;
CREATE TABLE `inspections_billingrecord` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `billing_code` varchar(30) NOT NULL,
  `establishment_name` varchar(255) NOT NULL,
  `contact_person` varchar(255) NOT NULL,
  `related_law` varchar(50) NOT NULL,
  `billing_type` varchar(20) NOT NULL,
  `description` longtext NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `due_date` date NOT NULL,
  `recommendations` longtext NOT NULL,
  `sent_date` datetime(6) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `establishment_id` bigint(20) NOT NULL,
  `inspection_id` bigint(20) NOT NULL,
  `issued_by_id` bigint(20) DEFAULT NULL,
  `payment_confirmed_at` datetime(6) DEFAULT NULL,
  `payment_confirmed_by_id` bigint(20) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_notes` longtext NOT NULL,
  `payment_reference` varchar(100) NOT NULL,
  `payment_status` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `billing_code` (`billing_code`),
  UNIQUE KEY `inspection_id` (`inspection_id`),
  KEY `inspections_billingrecord_issued_by_id_0e4654b9_fk_users_user_id` (`issued_by_id`),
  KEY `inspections_billing_c5e0c5_idx` (`billing_code`),
  KEY `inspections_establi_edae83_idx` (`establishment_id`),
  KEY `inspections_created_9b7da4_idx` (`created_at`),
  KEY `inspections_related_d892c1_idx` (`related_law`),
  KEY `inspections_billingr_payment_confirmed_by_fca89327_fk_users_use` (`payment_confirmed_by_id`),
  CONSTRAINT `inspections_billingr_establishment_id_c0d2c8c0_fk_establish` FOREIGN KEY (`establishment_id`) REFERENCES `establishments_establishment` (`id`),
  CONSTRAINT `inspections_billingr_inspection_id_c11afb13_fk_inspectio` FOREIGN KEY (`inspection_id`) REFERENCES `inspections_inspection` (`id`),
  CONSTRAINT `inspections_billingr_payment_confirmed_by_fca89327_fk_users_use` FOREIGN KEY (`payment_confirmed_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_billingrecord_issued_by_id_0e4654b9_fk_users_user_id` FOREIGN KEY (`issued_by_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_billingrecord`
--

--
-- Table structure for table `inspections_compliancequota`
--
DROP TABLE IF EXISTS `inspections_compliancequota`;
CREATE TABLE `inspections_compliancequota` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `law` varchar(50) NOT NULL,
  `year` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `quarter` int(11) NOT NULL,
  `target` int(11) NOT NULL,
  `auto_adjusted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inspections_compliancequota_law_year_month_087485d6_uniq` (`law`,`year`,`month`),
  KEY `inspections_complian_created_by_id_f82088ee_fk_users_use` (`created_by_id`),
  KEY `inspections_law_a15f50_idx` (`law`,`year`,`month`),
  KEY `inspections_year_ffa421_idx` (`year`,`month`),
  KEY `inspections_year_ead5b8_idx` (`year`,`quarter`),
  CONSTRAINT `inspections_complian_created_by_id_f82088ee_fk_users_use` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_compliancequota`
--

--
-- Table structure for table `inspections_inspection`
--
DROP TABLE IF EXISTS `inspections_inspection`;
CREATE TABLE `inspections_inspection` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `code` varchar(30) DEFAULT NULL,
  `law` varchar(50) NOT NULL,
  `district` varchar(100) DEFAULT NULL,
  `current_status` varchar(40) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `assigned_to_id` bigint(20) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `inspections_code_dc1b07_idx` (`code`),
  KEY `inspections_current_6b932e_idx` (`current_status`),
  KEY `inspections_assigne_306954_idx` (`assigned_to_id`),
  KEY `inspections_created_282730_idx` (`created_by_id`),
  KEY `inspections_law_e1febf_idx` (`law`),
  CONSTRAINT `inspections_inspection_assigned_to_id_ad860202_fk_users_user_id` FOREIGN KEY (`assigned_to_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspection_created_by_id_23948284_fk_users_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspection`
--
INSERT INTO `inspections_inspection` (`id`, `code`, `law`, `district`, `current_status`, `created_at`, `updated_at`, `assigned_to_id`, `created_by_id`) VALUES (1, 'EIA-2025-11-15-0001', 'PD-1586', 'LA UNION - 1st District', 'DIVISION_REVIEWED', '2025-11-15 19:14:53.427438', '2025-11-16 09:35:30.274525', 2, 2);

--
-- Table structure for table `inspections_inspection_establishments`
--
DROP TABLE IF EXISTS `inspections_inspection_establishments`;
CREATE TABLE `inspections_inspection_establishments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `inspection_id` bigint(20) NOT NULL,
  `establishment_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inspections_inspection_e_inspection_id_establishm_1751f803_uniq` (`inspection_id`,`establishment_id`),
  KEY `inspections_inspecti_establishment_id_6e7303d7_fk_establish` (`establishment_id`),
  CONSTRAINT `inspections_inspecti_establishment_id_6e7303d7_fk_establish` FOREIGN KEY (`establishment_id`) REFERENCES `establishments_establishment` (`id`),
  CONSTRAINT `inspections_inspecti_inspection_id_1332f775_fk_inspectio` FOREIGN KEY (`inspection_id`) REFERENCES `inspections_inspection` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspection_establishments`
--
INSERT INTO `inspections_inspection_establishments` (`id`, `inspection_id`, `establishment_id`) VALUES (1, 1, 1);

--
-- Table structure for table `inspections_inspectiondocument`
--
DROP TABLE IF EXISTS `inspections_inspectiondocument`;
CREATE TABLE `inspections_inspectiondocument` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `file` varchar(100) NOT NULL,
  `document_type` varchar(20) NOT NULL,
  `description` varchar(255) NOT NULL,
  `uploaded_at` datetime(6) NOT NULL,
  `uploaded_by_id` bigint(20) DEFAULT NULL,
  `inspection_form_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inspections_inspecti_uploaded_by_id_7fc85114_fk_users_use` (`uploaded_by_id`),
  KEY `inspections_inspecti_inspection_form_id_3aaabc98_fk_inspectio` (`inspection_form_id`),
  CONSTRAINT `inspections_inspecti_inspection_form_id_3aaabc98_fk_inspectio` FOREIGN KEY (`inspection_form_id`) REFERENCES `inspections_inspectionform` (`inspection_id`),
  CONSTRAINT `inspections_inspecti_uploaded_by_id_7fc85114_fk_users_use` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspectiondocument`
--
INSERT INTO `inspections_inspectiondocument` (`id`, `file`, `document_type`, `description`, `uploaded_at`, `uploaded_by_id`, `inspection_form_id`) VALUES (1, 'inspections/documents/2025/11/16/566552729_834844329503899_924404772532686992_n_52Uz0zI.jpg', 'PHOTO', 'system_id:general|finding_type:general|caption:', '2025-11-15 19:18:17.882988', 9, 1);
INSERT INTO `inspections_inspectiondocument` (`id`, `file`, `document_type`, `description`, `uploaded_at`, `uploaded_by_id`, `inspection_form_id`) VALUES (2, 'inspections/documents/2025/11/16/566636092_671519059057072_5870353076975172403_n_jPCeB6W.jpg', 'PHOTO', 'system_id:general|finding_type:general|caption:', '2025-11-15 19:18:17.965823', 9, 1);
INSERT INTO `inspections_inspectiondocument` (`id`, `file`, `document_type`, `description`, `uploaded_at`, `uploaded_by_id`, `inspection_form_id`) VALUES (3, 'inspections/documents/2025/11/16/554324741_1314213570184901_8364270589079062708_n_HoZ1m8U.jpg', 'PHOTO', 'system_id:general|finding_type:general|caption:', '2025-11-15 19:18:17.967890', 9, 1);
INSERT INTO `inspections_inspectiondocument` (`id`, `file`, `document_type`, `description`, `uploaded_at`, `uploaded_by_id`, `inspection_form_id`) VALUES (4, 'inspections/documents/2025/11/16/568203112_714476568346757_1987734501121662792_n_rd9rRSy.jpg', 'PHOTO', 'system_id:general|finding_type:general|caption:', '2025-11-15 19:18:18.014444', 9, 1);
INSERT INTO `inspections_inspectiondocument` (`id`, `file`, `document_type`, `description`, `uploaded_at`, `uploaded_by_id`, `inspection_form_id`) VALUES (5, 'inspections/documents/2025/11/16/553062913_806472652233164_5755714393897697295_n_tojavlf.jpg', 'PHOTO', 'system_id:general|finding_type:general|caption:', '2025-11-15 19:18:18.082367', 9, 1);
INSERT INTO `inspections_inspectiondocument` (`id`, `file`, `document_type`, `description`, `uploaded_at`, `uploaded_by_id`, `inspection_form_id`) VALUES (6, 'inspections/documents/2025/11/16/566559475_1786084815373631_8098760723510899684_n_zJoMQN5.jpg', 'PHOTO', 'system_id:general|finding_type:general|caption:', '2025-11-15 19:18:18.112165', 9, 1);
INSERT INTO `inspections_inspectiondocument` (`id`, `file`, `document_type`, `description`, `uploaded_at`, `uploaded_by_id`, `inspection_form_id`) VALUES (7, 'inspections/documents/2025/11/16/552625367_1438612711597529_6241658369505092141_n_UbzHQmd.jpg', 'PHOTO', 'system_id:general|finding_type:general|caption:', '2025-11-15 19:18:18.110895', 9, 1);
INSERT INTO `inspections_inspectiondocument` (`id`, `file`, `document_type`, `description`, `uploaded_at`, `uploaded_by_id`, `inspection_form_id`) VALUES (8, 'inspections/documents/2025/11/16/566523799_1128390226024744_427216430872117575_n_J5tQI6N.jpg', 'PHOTO', 'system_id:general|finding_type:general|caption:', '2025-11-15 19:18:18.211645', 9, 1);
INSERT INTO `inspections_inspectiondocument` (`id`, `file`, `document_type`, `description`, `uploaded_at`, `uploaded_by_id`, `inspection_form_id`) VALUES (9, 'inspections/documents/2025/11/16/553984469_997150805931446_2592598999236687883_n_7s4R8zf.jpg', 'PHOTO', 'system_id:general|finding_type:general|caption:', '2025-11-15 19:18:18.289248', 9, 1);

--
-- Table structure for table `inspections_inspectionform`
--
DROP TABLE IF EXISTS `inspections_inspectionform`;
CREATE TABLE `inspections_inspectionform` (
  `inspection_id` bigint(20) NOT NULL,
  `scheduled_at` datetime(6) DEFAULT NULL,
  `checklist` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`checklist`)),
  `compliance_decision` varchar(30) NOT NULL,
  `violations_found` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `inspected_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`inspection_id`),
  KEY `inspections_inspecti_inspected_by_id_5e96ed53_fk_users_use` (`inspected_by_id`),
  CONSTRAINT `inspections_inspecti_inspected_by_id_5e96ed53_fk_users_use` FOREIGN KEY (`inspected_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspecti_inspection_id_04525c09_fk_inspectio` FOREIGN KEY (`inspection_id`) REFERENCES `inspections_inspection` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspectionform`
--
INSERT INTO `inspections_inspectionform` (`inspection_id`, `scheduled_at`, `checklist`, `compliance_decision`, `violations_found`, `created_at`, `updated_at`, `inspected_by_id`) VALUES (1, '2025-11-15 19:16:00', '{"general": {"establishment_name": "SAINT LOUIS COLLEGE", "address": "1, CARLATAN, SAN FERNANDO, LA UNION, 2500", "coordinates": "16.636547, 120.313189", "nature_of_business": "EDUCATION/TRAINING", "year_established": "1964", "inspection_date_time": "2025-11-16T03:16", "environmental_laws": ["PD-1586"], "operating_hours": 24, "operating_days_per_week": 7, "operating_days_per_year": 300, "product_lines": "LOGISTICS SERVICES", "declared_production_rate": "100 TPD", "actual_production_rate": "100 TPD", "managing_head": "DFHD", "pco_name": "DFG", "interviewed_person": "DG", "pco_accreditation_no": "PCO1-12092022-3730", "effectivity_date": "2025-12-05", "phone_fax_no": "0987654321", "email_address": "rrrrrr@sdajl.com"}, "purpose": {"verify_accuracy": false, "verify_accuracy_details": [], "verify_accuracy_others": "", "determine_compliance": true, "investigate_complaints": false, "check_commitment_status": false, "commitment_status_details": [], "commitment_status_others": "", "other_purpose": false, "other_purpose_specify": ""}, "permits": [{"lawId": "PD-1586", "permitType": "ECC1", "permitNumber": "ECC-R3-2023-045", "dateIssued": "2025-10-28", "expiryDate": "", "description": "Environmental Compliance Certificate Type 1", "required": true}, {"lawId": "PD-1586", "permitType": "ECC2", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Environmental Compliance Certificate Type 2", "required": false}, {"lawId": "PD-1586", "permitType": "ECC3", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Environmental Compliance Certificate Type 3", "required": false}, {"lawId": "RA-6969", "permitType": "DENR Registry ID", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Chemical Control Order Registry Identification", "required": true}, {"lawId": "RA-6969", "permitType": "PCL Compliance Certificate", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Priority Chemicals List Compliance Certificate", "required": true}, {"lawId": "RA-6969", "permitType": "CCO Registry", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Chemical Control Order Registry", "required": false}, {"lawId": "RA-6969", "permitType": "Importer Clearance No.", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Importer Clearance Number for Hazardous Substances", "required": false}, {"lawId": "RA-6969", "permitType": "Permit to Transport", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Hazardous Waste Transport Permit", "required": true}, {"lawId": "RA-6969", "permitType": "Copy of COT issued by licensed TSD Facility", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Certificate of Treatment from Treatment, Storage, and Disposal Facility", "required": false}, {"lawId": "RA-8749", "permitType": "POA No.", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Permit to Operate Air Pollution Source", "required": true}, {"lawId": "RA-9275", "permitType": "Discharge Permit No.", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Wastewater Discharge Permit", "required": true}, {"lawId": "RA-9003", "permitType": "With MOA/Agreement for residuals disposed of to a SLF w/ ECC", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Memorandum of Agreement for Residual Waste Disposal", "required": false}], "complianceItems": [{"lawId": "PD-1586", "applicableLaw": "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities", "conditionId": "PD-1586-1", "conditionNumber": "Condition No. 1", "complianceRequirement": "Project Description", "complianceRequirementDetails": "dsd", "compliant": "No", "remarks": "ASDAD  ASDASD ", "category": "Documentation", "priority": "High", "lawCitation": "", "remarksOption": "Document expired"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-PCL-1", "lawCitation": "Priority Chemical List", "complianceRequirement": "Valid PCL Compliance Certificate", "compliant": "N/A", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-PCL-2", "lawCitation": "Priority Chemical List", "complianceRequirement": "Annual Reporting", "compliant": "N/A", "remarks": "", "category": "Reporting", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-CCO-1", "lawCitation": "Chemical Control Order", "complianceRequirement": "Biennial Report for those chemicals that are for issuance of CCO", "compliant": "N/A", "remarks": "", "category": "Reporting", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-CCO-2", "lawCitation": "Chemical Control Order", "complianceRequirement": "CCO Registration", "compliant": "N/A", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-IMP-1", "lawCitation": "Importation", "complianceRequirement": "Valid Small Quantity Importation Clearance", "compliant": "N/A", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-IMP-2", "lawCitation": "Importation", "complianceRequirement": "Valid Importation Clearance", "compliant": "N/A", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-IMP-3", "lawCitation": "Importation", "complianceRequirement": "Bill of Lading", "compliant": "N/A", "remarks": "", "category": "Documentation", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-HWG-1", "lawCitation": "Hazardous Waste Generator", "complianceRequirement": "Registration as Hazardous Waste Generator", "compliant": "N/A", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-HWG-2", "lawCitation": "Hazardous Waste Generator", "complianceRequirement": "With temporary Hazwaste Storage Facility", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-HWSL-1", "lawCitation": "Hazardous Waste Storage and Labeling", "complianceRequirement": "Hazardous Waste properly labeled", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-HWSL-2", "lawCitation": "Hazardous Waste Storage and Labeling", "complianceRequirement": "Valid Permit to Transport", "compliant": "N/A", "remarks": "", "category": "Permitting", "priority": "High", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-HWSL-3", "lawCitation": "Hazardous Waste Storage and Labeling", "complianceRequirement": "Valid Registration of Transporter and Treaters", "compliant": "N/A", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-WT-WTR-1", "lawCitation": "Waste Transporter, Waste Transport Record; Waste Treatment and Disposal Premises", "complianceRequirement": "WCompliance with Manifest system (Waste Transport Record)", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-WT-WTR-2", "lawCitation": "Waste Transporter, Waste Transport Record; Waste Treatment and Disposal Premises", "complianceRequirement": "Valid/Completed Cerfificate of Treatment(COT)", "compliant": "N/A", "remarks": "", "category": "Documentation", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "sample", "conditionId": "RA-8749-PO-1", "lawCitation": "RA 8749: Philippine Clean Air Act", "complianceRequirement": "With Valid POA", "compliant": "N/A", "remarks": "", "category": "Permitting", "priority": "High", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "Permit to Operate (Air)", "conditionId": "RA-8749-PO-2", "lawCitation": "RA 8749: Philippine Clean Air Act", "complianceRequirement": "All Emission Sources is Covered by a valid POA", "compliant": "N/A", "remarks": "", "category": "Permitting", "priority": "High", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-PO-3", "lawCitation": "Permit to Operate (Air)", "complianceRequirement": "POA is displayed in a conspicuous place near the installation", "compliant": "N/A", "remarks": "", "category": "Documentation", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-PO-4", "lawCitation": "Permit to Operate (Air)", "complianceRequirement": "All Permit Conditions are complied with", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-PO-5", "lawCitation": "Permit to Operate (Air)", "complianceRequirement": "Wind direction device installed (if applicable)", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Low", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-PO-6", "lawCitation": "Permit to Operate (Air)", "complianceRequirement": "Plant operational problems lasting for more than 1 hour should be reoprted to EMB w/in 24 hrs.", "compliant": "N/A", "remarks": "", "category": "Reporting", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-PO-7", "lawCitation": "Permit to Operate (Air)", "complianceRequirement": "CCTV installed (for large sources only)", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Low", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-PO-8", "lawCitation": "Permit to Operate (Air)", "complianceRequirement": "CEMS/PEMS installed (for petroleum refineries, power/cement plants or sources emitting (750Tons/yr.) Yearly RATA/Quarterly CGA conducted (for sources w/CEMS", "compliant": "N/A", "remarks": "", "category": "Monitoring", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-ET-1", "lawCitation": "Emission Testing (if applicable)", "complianceRequirement": "Compliance w/ emission standars?", "compliant": "N/A", "remarks": "", "category": "Monitoring", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-AT-1", "lawCitation": "Ambient Testing (if applicable)", "complianceRequirement": "Compliance w/ ambient air quality standards?", "compliant": "N/A", "remarks": "", "category": "Monitoring", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-DP-1", "lawCitation": "Discharge Permit (DP)", "complianceRequirement": "With Valid Discharge Permit", "compliant": "N/A", "remarks": "", "category": "Permitting", "priority": "High", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-DP-2", "lawCitation": "Discharge Permit (DP)", "complianceRequirement": "Volume if Duscgarge consistent with DP issued?", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-DP-3", "lawCitation": "Discharge Permit (DP)", "complianceRequirement": "All permit conditions are complied with?", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-DP-4", "lawCitation": "Discharge Permit (DP)", "complianceRequirement": "With working flow metering device (if applicable)", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-DP-5", "lawCitation": "Discharge Permit (DP)", "complianceRequirement": "Certificate of septage siphoning hauled by accredited service provider", "compliant": "N/A", "remarks": "", "category": "Documentation", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-ETR-1", "lawCitation": "Effluent Testing Report (if applicable)", "complianceRequirement": "In compliance with effluent standards", "compliant": "N/A", "remarks": "", "category": "Monitoring", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-AWQM-1", "lawCitation": "Ambient Water Quality Monitoring (if applicable)", "complianceRequirement": "With ambient water quality monitoring results.", "compliant": "N/A", "remarks": "", "category": "Monitoring", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-WCS-2", "lawCitation": "Wastewater Charge System (if applicable)", "complianceRequirement": "Payment of wastewater charges", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9003", "applicableLaw": "RA 9003: Ecological Solid Waste Management Act", "conditionId": "RA-9003-WS-1", "lawCitation": "Waste Segregation", "complianceRequirement": "With MRF on site", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9003", "applicableLaw": "RA 9003: Ecological Solid Waste Management Act", "conditionId": "RA-9003-WS-2", "lawCitation": "Waste Segregation", "complianceRequirement": "Segregated solid waste collected by LGU or Private Contractor Name of PC:", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9003", "applicableLaw": "RA 9003: Ecological Solid Waste Management Act", "conditionId": "RA-9003-WS-3", "lawCitation": "Waste Segregation", "complianceRequirement": "With composting facility (if applicable)", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Low", "remarksOption": ""}, {"lawId": "RA-9003", "applicableLaw": "RA 9003: Ecological Solid Waste Management Act", "conditionId": "RA-9003-SWD-1", "lawCitation": "Solid Waste Disposal", "complianceRequirement": "Residuals are disposed to a SLF", "compliant": "N/A", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9003", "applicableLaw": "RA 9003: Ecological Solid Waste Management Act", "conditionId": "RA-9003-SWD-2", "lawCitation": "Solid Waste Disposal", "complianceRequirement": "With MOA/Agreement w/ LGU", "compliant": "N/A", "remarks": "", "category": "Documentation", "priority": "Medium", "remarksOption": ""}, {"lawId": "Pollution-Control", "applicableLaw": "Pollution Control Officer Accreditation", "conditionId": "PCO-1", "lawCitation": "DAO 2014-02 or Revised Guidelines on PCO Accreditation", "complianceRequirement": "With valid PCO accreditation certificate", "compliant": "N/A", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": ""}, {"lawId": "Pollution-Control", "applicableLaw": "Pollution Control Officer Accreditation", "conditionId": "PCO-2", "lawCitation": "DAO 2014-02 or Revised Guidelines on PCO Accreditation", "complianceRequirement": "Managing head w/ 8 hrs. training certificate", "compliant": "N/A", "remarks": "", "category": "Training", "priority": "Medium", "remarksOption": ""}, {"lawId": "Self-Monitoring", "applicableLaw": "Self-Monitoring Report", "conditionId": "SMR-1", "lawCitation": "DAO 2003-27", "complianceRequirement": "Complete and timely submission of SMRs (quarterly)", "compliant": "N/A", "remarks": "", "category": "Reporting", "priority": "Medium", "remarksOption": ""}, {"lawId": "Self-Monitoring", "applicableLaw": "Self-Monitoring Report", "conditionId": "SMR-2", "lawCitation": "DAO 2003-27", "complianceRequirement": "Complete and timely submission of CMRs/CMVRs (semi-annualy)", "compliant": "N/A", "remarks": "", "category": "Reporting", "priority": "Medium", "remarksOption": ""}], "systems": [{"lawId": "PD-1586", "system": "Environmental Impact Statement System", "compliant": "No", "nonCompliant": true, "notApplicable": false, "remarks": "sdfsdsdfsd", "category": "Environmental Management"}, {"lawId": "RA-6969", "system": "Chemical Management", "compliant": false, "nonCompliant": false, "notApplicable": false, "remarks": "", "category": "Chemical Safety", "remarksOption": ""}, {"lawId": "RA-6969", "system": "Hazardous Waste Management", "compliant": false, "nonCompliant": false, "notApplicable": false, "remarks": "", "category": "Waste Management", "remarksOption": ""}, {"lawId": "RA-8749", "system": "Air Quality Management", "compliant": false, "nonCompliant": false, "notApplicable": false, "remarks": "", "category": "Air Pollution Control", "remarksOption": ""}, {"lawId": "RA-9275", "system": "Water Quality Management", "compliant": false, "nonCompliant": false, "notApplicable": false, "remarks": "", "category": "Water Pollution Control", "remarksOption": ""}, {"lawId": "RA-9003", "system": "Solid Waste Management", "compliant": false, "nonCompliant": false, "notApplicable": false, "remarks": "", "category": "Waste Management", "remarksOption": ""}, {"system": "Commitment/s from previous Technical Conference", "compliant": false, "nonCompliant": false, "notApplicable": true, "remarks": "", "category": "Compliance"}], "recommendationState": {"checked": ["For issuance of Notice of Violation(NOV)", "For issuance of suspension of ECC/5-day CDO", "For endorsement to Pollution Adjudication Board (PAB)"], "otherText": ""}, "lawFilter": ["PD-1586"], "findingImages": {}, "generalFindings": [{"id": "1763234297699-ltkijbwzo", "file": {}, "url": "http://127.0.0.1:8000/media/inspections/documents/2025/11/16/566552729_834844329503899_924404772532686992_n_52Uz0zI.jpg", "name": "566552729_834844329503899_924404772532686992_n.jpg", "type": "image/jpeg", "size": 373602, "caption": "dfsfsdfsd", "uploaded": true, "uploadProgress": 100, "error": null, "systemId": "general", "backendId": 1}, {"id": "1763234297699-vn5l3qbjt", "file": {}, "url": "http://127.0.0.1:8000/media/inspections/documents/2025/11/16/566636092_671519059057072_5870353076975172403_n_jPCeB6W.jpg", "name": "566636092_671519059057072_5870353076975172403_n.jpg", "type": "image/jpeg", "size": 282335, "caption": "sdfsdfsdfds", "uploaded": true, "uploadProgress": 100, "error": null, "systemId": "general", "backendId": 2}, {"id": "1763234297700-7xu5o2y88", "file": {}, "url": "http://127.0.0.1:8000/media/inspections/documents/2025/11/16/554324741_1314213570184901_8364270589079062708_n_HoZ1m8U.jpg", "name": "554324741_1314213570184901_8364270589079062708_n.jpg", "type": "image/jpeg", "size": 378276, "caption": "", "uploaded": true, "uploadProgress": 100, "error": null, "systemId": "general", "backendId": 3}, {"id": "1763234297701-9iy87ziat", "file": {}, "url": "http://127.0.0.1:8000/media/inspections/documents/2025/11/16/568203112_714476568346757_1987734501121662792_n_rd9rRSy.jpg", "name": "568203112_714476568346757_1987734501121662792_n.jpg", "type": "image/jpeg", "size": 417763, "caption": "sef", "uploaded": true, "uploadProgress": 100, "error": null, "systemId": "general", "backendId": 4}, {"id": "1763234297702-czqmjew87", "file": {}, "url": "http://127.0.0.1:8000/media/inspections/documents/2025/11/16/553984469_997150805931446_2592598999236687883_n_7s4R8zf.jpg", "name": "553984469_997150805931446_2592598999236687883_n.jpg", "type": "image/jpeg", "size": 367156, "caption": "", "uploaded": true, "uploadProgress": 100, "error": null, "systemId": "general", "backendId": 9}, {"id": "1763234297703-v0u3nw50v", "file": {}, "url": "http://127.0.0.1:8000/media/inspections/documents/2025/11/16/566559475_1786084815373631_8098760723510899684_n_zJoMQN5.jpg", "name": "566559475_1786084815373631_8098760723510899684_n.jpg", "type": "image/jpeg", "size": 301696, "caption": "", "uploaded": true, "uploadProgress": 100, "error": null, "systemId": "general", "backendId": 6}, {"id": "1763234297704-falg7f4yd", "file": {}, "url": "http://127.0.0.1:8000/media/inspections/documents/2025/11/16/553062913_806472652233164_5755714393897697295_n_tojavlf.jpg", "name": "553062913_806472652233164_5755714393897697295_n.jpg", "type": "image/jpeg", "size": 358371, "caption": "", "uploaded": true, "uploadProgress": 100, "error": null, "systemId": "general", "backendId": 5}, {"id": "1763234297705-xcwenv4f5", "file": {}, "url": "http://127.0.0.1:8000/media/inspections/documents/2025/11/16/552625367_1438612711597529_6241658369505092141_n_UbzHQmd.jpg", "name": "552625367_1438612711597529_6241658369505092141_n.jpg", "type": "image/jpeg", "size": 223856, "caption": "", "uploaded": true, "uploadProgress": 100, "error": null, "systemId": "general", "backendId": 7}, {"id": "1763234297705-fslzqrkqu", "file": {}, "url": "http://127.0.0.1:8000/media/inspections/documents/2025/11/16/566523799_1128390226024744_427216430872117575_n_J5tQI6N.jpg", "name": "566523799_1128390226024744_427216430872117575_n.jpg", "type": "image/jpeg", "size": 266061, "caption": "", "uploaded": true, "uploadProgress": 100, "error": null, "systemId": "general", "backendId": 8}], "is_draft": false, "completed_at": "2025-11-15T19:18:34.062242+00:00", "completed_by": 9}', 'NON_COMPLIANT', '1. PD-1586:, 1.1 Project Description: ASDAD  ASDASD, 1.2 Environmental Impact Statement System: sdfsdsdfsd', '2025-11-15 19:14:53.560273', '2025-11-15 19:18:34.080573', 9);

--
-- Table structure for table `inspections_inspectionhistory`
--
DROP TABLE IF EXISTS `inspections_inspectionhistory`;
CREATE TABLE `inspections_inspectionhistory` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `previous_status` varchar(40) DEFAULT NULL,
  `new_status` varchar(40) NOT NULL,
  `law` varchar(50) DEFAULT NULL,
  `section` varchar(50) DEFAULT NULL,
  `remarks` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `assigned_to_id` bigint(20) DEFAULT NULL,
  `changed_by_id` bigint(20) DEFAULT NULL,
  `inspection_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inspections_inspect_478b05_idx` (`inspection_id`,`created_at`),
  KEY `inspections_changed_7ba279_idx` (`changed_by_id`),
  KEY `inspections_assigne_eafdf9_idx` (`assigned_to_id`),
  CONSTRAINT `inspections_inspecti_assigned_to_id_9053c0dc_fk_users_use` FOREIGN KEY (`assigned_to_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspecti_changed_by_id_6b11b0da_fk_users_use` FOREIGN KEY (`changed_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspecti_inspection_id_29f23002_fk_inspectio` FOREIGN KEY (`inspection_id`) REFERENCES `inspections_inspection` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspectionhistory`
--
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (1, 'CREATED', 'SECTION_ASSIGNED', NULL, NULL, 'Inspection created and assigned to Section Chief', '2025-11-15 19:14:53.688699', NULL, 2, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (2, NULL, 'SECTION_ASSIGNED', 'PD-1586', NULL, 'Inspection EIA-2025-11-15-0001 created with 1 establishment(s)', '2025-11-15 19:14:58.505386', NULL, 2, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (3, 'SECTION_ASSIGNED', 'UNIT_ASSIGNED', 'PD-1586', 'PD-1586,RA-8749,RA-9275', 'Forwarded to next level', '2025-11-15 19:15:16.004997', 7, 6, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (4, 'UNIT_ASSIGNED', 'MONITORING_ASSIGNED', 'PD-1586', 'PD-1586', 'Forwarded to EIA MONITORING EMB SAMPLE (Monitoring Personnel)', '2025-11-15 19:15:49.066798', 9, 7, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (5, 'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS', 'PD-1586', 'PD-1586', 'Moved to My Inspections', '2025-11-15 19:15:58.579524', 9, 9, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (6, 'MONITORING_IN_PROGRESS', 'MONITORING_COMPLETED_NON_COMPLIANT', 'PD-1586', 'PD-1586', 'Inspection completed by Monitoring Personnel', '2025-11-15 19:18:34.090600', 9, 9, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (7, 'MONITORING_COMPLETED_NON_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT', NULL, NULL, 'Assigned to Unit Head for review', '2025-11-15 19:18:34.144113', NULL, 9, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (8, 'MONITORING_COMPLETED_NON_COMPLIANT', 'UNIT_REVIEWED', NULL, NULL, 'Unit Head approved and forwarded to Section Chief', '2025-11-15 19:19:02.662963', NULL, 7, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (9, 'UNIT_REVIEWED', 'SECTION_REVIEWED', NULL, NULL, 'Section Chief approved and forwarded to Division Chief', '2025-11-15 19:19:18.996990', NULL, 6, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (10, 'SECTION_REVIEWED', 'DIVISION_REVIEWED', NULL, NULL, 'Division Chief reviewed and marked as DIVISION_REVIEWED', '2025-11-16 09:35:30.280020', NULL, 2, 1);

--
-- Table structure for table `inspections_noticeoforder`
--
DROP TABLE IF EXISTS `inspections_noticeoforder`;
CREATE TABLE `inspections_noticeoforder` (
  `inspection_form_id` bigint(20) NOT NULL,
  `sent_date` date DEFAULT NULL,
  `violation_breakdown` longtext NOT NULL,
  `penalty_fees` decimal(10,2) DEFAULT NULL,
  `payment_deadline` date DEFAULT NULL,
  `payment_instructions` longtext NOT NULL,
  `remarks` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `sent_by_id` bigint(20) DEFAULT NULL,
  `contact_person` varchar(255) NOT NULL,
  `email_body` longtext NOT NULL,
  `email_subject` varchar(255) NOT NULL,
  `recipient_email` varchar(254) NOT NULL,
  `recipient_name` varchar(255) NOT NULL,
  PRIMARY KEY (`inspection_form_id`),
  KEY `inspections_noticeoforder_sent_by_id_a243dcbb_fk_users_user_id` (`sent_by_id`),
  CONSTRAINT `inspections_noticeof_inspection_form_id_ab2dd8ca_fk_inspectio` FOREIGN KEY (`inspection_form_id`) REFERENCES `inspections_inspectionform` (`inspection_id`),
  CONSTRAINT `inspections_noticeoforder_sent_by_id_a243dcbb_fk_users_user_id` FOREIGN KEY (`sent_by_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_noticeoforder`
--

--
-- Table structure for table `inspections_noticeofviolation`
--
DROP TABLE IF EXISTS `inspections_noticeofviolation`;
CREATE TABLE `inspections_noticeofviolation` (
  `inspection_form_id` bigint(20) NOT NULL,
  `sent_date` date DEFAULT NULL,
  `compliance_deadline` datetime(6) DEFAULT NULL,
  `violations` longtext NOT NULL,
  `compliance_instructions` longtext NOT NULL,
  `remarks` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `sent_by_id` bigint(20) DEFAULT NULL,
  `contact_person` varchar(255) NOT NULL,
  `email_body` longtext NOT NULL,
  `email_subject` varchar(255) NOT NULL,
  `recipient_email` varchar(254) NOT NULL,
  `recipient_name` varchar(255) NOT NULL,
  PRIMARY KEY (`inspection_form_id`),
  KEY `inspections_noticeof_sent_by_id_21f4d16f_fk_users_use` (`sent_by_id`),
  CONSTRAINT `inspections_noticeof_inspection_form_id_7af69606_fk_inspectio` FOREIGN KEY (`inspection_form_id`) REFERENCES `inspections_inspectionform` (`inspection_id`),
  CONSTRAINT `inspections_noticeof_sent_by_id_21f4d16f_fk_users_use` FOREIGN KEY (`sent_by_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_noticeofviolation`
--

--
-- Table structure for table `inspections_quarterlyevaluation`
--
DROP TABLE IF EXISTS `inspections_quarterlyevaluation`;
CREATE TABLE `inspections_quarterlyevaluation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `law` varchar(50) NOT NULL,
  `year` int(11) NOT NULL,
  `quarter` int(11) NOT NULL,
  `quarterly_target` int(11) NOT NULL,
  `quarterly_achieved` int(11) NOT NULL,
  `quarter_status` varchar(20) NOT NULL,
  `surplus` int(11) NOT NULL,
  `deficit` int(11) NOT NULL,
  `remarks` longtext DEFAULT NULL,
  `evaluated_at` datetime(6) NOT NULL,
  `is_archived` tinyint(1) NOT NULL,
  `evaluated_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inspections_quarterlyevaluation_law_year_quarter_7cdbebf0_uniq` (`law`,`year`,`quarter`),
  KEY `inspections_quarterl_evaluated_by_id_4994960a_fk_users_use` (`evaluated_by_id`),
  KEY `inspections_law_f4ff83_idx` (`law`,`year`,`quarter`),
  KEY `inspections_year_8605f9_idx` (`year`,`quarter`),
  CONSTRAINT `inspections_quarterl_evaluated_by_id_4994960a_fk_users_use` FOREIGN KEY (`evaluated_by_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_quarterlyevaluation`
--

--
-- Table structure for table `inspections_reinspectionschedule`
--
DROP TABLE IF EXISTS `inspections_reinspectionschedule`;
CREATE TABLE `inspections_reinspectionschedule` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `compliance_status` varchar(20) NOT NULL,
  `due_date` date NOT NULL,
  `reminder_sent` tinyint(1) NOT NULL,
  `reminder_sent_date` datetime(6) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `establishment_id` bigint(20) NOT NULL,
  `original_inspection_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inspections_reinspection_establishment_id_origina_62e56b0b_uniq` (`establishment_id`,`original_inspection_id`),
  KEY `inspections_reinspec_original_inspection__091aa76d_fk_inspectio` (`original_inspection_id`),
  KEY `inspections_due_dat_b20564_idx` (`due_date`),
  KEY `inspections_status_dc1c70_idx` (`status`),
  KEY `inspections_establi_102cfd_idx` (`establishment_id`),
  CONSTRAINT `inspections_reinspec_establishment_id_f78b8955_fk_establish` FOREIGN KEY (`establishment_id`) REFERENCES `establishments_establishment` (`id`),
  CONSTRAINT `inspections_reinspec_original_inspection__091aa76d_fk_inspectio` FOREIGN KEY (`original_inspection_id`) REFERENCES `inspections_inspection` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_reinspectionschedule`
--

--
-- Table structure for table `notifications_notification`
--
DROP TABLE IF EXISTS `notifications_notification`;
CREATE TABLE `notifications_notification` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `notification_type` varchar(30) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` longtext NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `related_object_type` varchar(50) NOT NULL,
  `related_object_id` int(11) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `recipient_id` bigint(20) NOT NULL,
  `sender_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notification_sender_id_feea9ca3_fk_users_user_id` (`sender_id`),
  KEY `notificatio_recipie_a972ce_idx` (`recipient_id`,`created_at`),
  KEY `notificatio_user_id_05b4bc_idx` (`user_id`,`created_at`),
  KEY `notificatio_related_f82ec2_idx` (`related_object_type`,`related_object_id`),
  CONSTRAINT `notifications_notifi_recipient_id_d055f3f0_fk_users_use` FOREIGN KEY (`recipient_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `notifications_notification_sender_id_feea9ca3_fk_users_user_id` FOREIGN KEY (`sender_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `notifications_notification_user_id_b5e8c0ff_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications_notification`
--
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (1, 'new_user', 'New Division Chief Created', 'A new Division Chief (jerichourbano.01.01.04@gmail.com) has been created.', 0, '', NULL, '2025-11-15 16:23:34.360427', 2, 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (2, 'new_establishment', 'New Establishment Created', 'A new establishment "SAINT LOUIS COLLEGE" has been created by jerichourbano.01.01.04@gmail.com.', 0, '', NULL, '2025-11-15 16:26:33.341024', 1, 2, 1);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (3, 'new_establishment', 'New Establishment Created', 'A new establishment "SAINT LOUIS COLLEGE" has been created by jerichourbano.01.01.04@gmail.com.', 0, '', NULL, '2025-11-15 16:26:33.349998', 2, 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (8, 'new_user', 'New Section Chief Created', 'A new Section Chief (22101222@slc-sflu.edu.ph) created for section: PD-1586,RA-8749,RA-9275.', 0, '', NULL, '2025-11-15 16:47:50.264919', 2, 6, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (9, 'new_user', 'New Unit Head Created', 'A new Unit Head (echo.010104@gmail.com) created for section: PD-1586.', 0, '', NULL, '2025-11-15 16:49:00.713794', 2, 7, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (12, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (emee46990@gmail.com) created for section: PD-1586.', 0, '', NULL, '2025-11-15 17:08:06.577228', 2, 9, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (13, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (emee46990@gmail.com) created in your section: PD-1586.', 0, '', NULL, '2025-11-15 17:08:06.657157', 7, 9, 7);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (14, 'new_inspection', 'New Inspection Assignment', 'You have been assigned inspection EIA-2025-11-15-0001 for SAINT LOUIS COLLEGE under PD-1586. Please review and take action.', 0, '', NULL, '2025-11-15 19:14:53.726507', 6, 2, 6);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (15, 'inspection_forward', 'Inspection Forwarded to You', 'Inspection EIA-2025-11-15-0001 for SAINT LOUIS COLLEGE has been forwarded to you by SECTION SAMPLE. Remarks: Forwarded to next level', 0, 'inspection', 1, '2025-11-15 19:15:15.988825', 7, 6, 7);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (16, 'inspection_forward', 'Inspection Forwarded to You', 'Inspection EIA-2025-11-15-0001 for SAINT LOUIS COLLEGE has been forwarded to you by UNIT SAMPLE. Remarks: Forwarded to EIA MONITORING EMB SAMPLE (Monitoring Personnel)', 0, 'inspection', 1, '2025-11-15 19:15:49.059602', 9, 7, 9);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (17, 'inspection_review', 'Inspection Review Required', 'Inspection EIA-2025-11-15-0001 for SAINT LOUIS COLLEGE has been reviewed by UNIT SAMPLE and forwarded to you. Remarks: Unit Head approved and forwarded to Section Chief', 0, 'inspection', 1, '2025-11-15 19:19:05.300641', 6, 7, 6);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (18, 'inspection_review', 'Inspection Review Required', 'Inspection EIA-2025-11-15-0001 for SAINT LOUIS COLLEGE has been reviewed by SECTION SAMPLE and forwarded to you. Remarks: Section Chief approved and forwarded to Division Chief', 0, 'inspection', 1, '2025-11-15 19:19:19.005580', 2, 6, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (19, 'new_user', 'New Legal Unit Created', 'A new Legal Unit (22100949@slc-sflu.edu.ph) has been created.', 0, '', NULL, '2025-11-16 09:36:55.758850', 2, 10, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (20, 'new_user', 'New Section Chief Created', 'A new Section Chief (harryzabate@gmail.com) created for section: RA-6969.', 0, '', NULL, '2025-11-16 10:21:00.296678', 2, 11, 2);

--
-- Table structure for table `reports_accomplishmentreport`
--
DROP TABLE IF EXISTS `reports_accomplishmentreport`;
CREATE TABLE `reports_accomplishmentreport` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `report_type` varchar(20) NOT NULL,
  `quarter` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `summary` longtext DEFAULT NULL,
  `key_achievements` longtext DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `pdf_file` varchar(100) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `created_by_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reports_accomplishme_created_by_id_79933dc4_fk_users_use` (`created_by_id`),
  CONSTRAINT `reports_accomplishme_created_by_id_79933dc4_fk_users_use` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports_accomplishmentreport`
--

--
-- Table structure for table `reports_accomplishmentreport_completed_inspections`
--
DROP TABLE IF EXISTS `reports_accomplishmentreport_completed_inspections`;
CREATE TABLE `reports_accomplishmentreport_completed_inspections` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `accomplishmentreport_id` bigint(20) NOT NULL,
  `inspection_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reports_accomplishmentre_accomplishmentreport_id__bd76ea05_uniq` (`accomplishmentreport_id`,`inspection_id`),
  KEY `reports_accomplishme_inspection_id_97774385_fk_inspectio` (`inspection_id`),
  CONSTRAINT `reports_accomplishme_accomplishmentreport_7bcc2b0d_fk_reports_a` FOREIGN KEY (`accomplishmentreport_id`) REFERENCES `reports_accomplishmentreport` (`id`),
  CONSTRAINT `reports_accomplishme_inspection_id_97774385_fk_inspectio` FOREIGN KEY (`inspection_id`) REFERENCES `inspections_inspection` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports_accomplishmentreport_completed_inspections`
--

--
-- Table structure for table `reports_reportmetric`
--
DROP TABLE IF EXISTS `reports_reportmetric`;
CREATE TABLE `reports_reportmetric` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `total_inspections` int(11) NOT NULL,
  `compliant_inspections` int(11) NOT NULL,
  `non_compliant_inspections` int(11) NOT NULL,
  `compliance_rate` decimal(5,2) NOT NULL,
  `by_law_stats` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`by_law_stats`)),
  `by_district_stats` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`by_district_stats`)),
  `created_at` datetime(6) NOT NULL,
  `report_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `report_id` (`report_id`),
  CONSTRAINT `reports_reportmetric_report_id_d1cdb94a_fk_reports_a` FOREIGN KEY (`report_id`) REFERENCES `reports_accomplishmentreport` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports_reportmetric`
--

--
-- Table structure for table `system_backuprecord`
--
DROP TABLE IF EXISTS `system_backuprecord`;
CREATE TABLE `system_backuprecord` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `fileName` varchar(255) NOT NULL,
  `location` varchar(500) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `backup_type` varchar(10) NOT NULL,
  `restored_from_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fileName` (`fileName`),
  KEY `system_backuprecord_restored_from_id_b15d8c33_fk_system_ba` (`restored_from_id`),
  CONSTRAINT `system_backuprecord_restored_from_id_b15d8c33_fk_system_ba` FOREIGN KEY (`restored_from_id`) REFERENCES `system_backuprecord` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_backuprecord`
--
INSERT INTO `system_backuprecord` (`id`, `fileName`, `location`, `created_at`, `backup_type`, `restored_from_id`) VALUES (1, 'backup_20251116_002302.sql', 'backup', '2025-11-15 16:23:02.786652', 'backup', NULL);
INSERT INTO `system_backuprecord` (`id`, `fileName`, `location`, `created_at`, `backup_type`, `restored_from_id`) VALUES (2, 'backup_20251116_005836.sql', 'backup', '2025-11-15 16:58:37.311955', 'backup', NULL);
INSERT INTO `system_backuprecord` (`id`, `fileName`, `location`, `created_at`, `backup_type`, `restored_from_id`) VALUES (3, 'backup_20251116_005846.sql', 'backup', '2025-11-15 16:58:46.591805', 'backup', NULL);
INSERT INTO `system_backuprecord` (`id`, `fileName`, `location`, `created_at`, `backup_type`, `restored_from_id`) VALUES (4, 'backup_20251116_011053.sql', 'backup', '2025-11-15 17:10:54.401448', 'backup', NULL);
INSERT INTO `system_backuprecord` (`id`, `fileName`, `location`, `created_at`, `backup_type`, `restored_from_id`) VALUES (5, 'backup_20251116_011302.sql', 'backup', '2025-11-15 17:13:02.655179', 'backup', NULL);
INSERT INTO `system_backuprecord` (`id`, `fileName`, `location`, `created_at`, `backup_type`, `restored_from_id`) VALUES (6, 'restore_20251116_011439_from_backup_20251116_011302.sql', 'backup', '2025-11-15 17:14:39.610160', 'restore', 5);
INSERT INTO `system_backuprecord` (`id`, `fileName`, `location`, `created_at`, `backup_type`, `restored_from_id`) VALUES (7, 'backup_20251116_181123.sql', 'backup', '2025-11-16 10:11:30.711883', 'backup', NULL);

--
-- Table structure for table `system_config_systemconfiguration`
--
DROP TABLE IF EXISTS `system_config_systemconfiguration`;
CREATE TABLE `system_config_systemconfiguration` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email_host` varchar(255) NOT NULL,
  `email_port` int(11) NOT NULL,
  `email_use_tls` tinyint(1) NOT NULL,
  `email_host_user` varchar(255) DEFAULT NULL,
  `email_host_password` varchar(255) DEFAULT NULL,
  `default_from_email` varchar(255) DEFAULT NULL,
  `email_from_name` varchar(255) DEFAULT NULL,
  `access_token_lifetime_minutes` int(11) NOT NULL,
  `refresh_token_lifetime_days` int(11) NOT NULL,
  `rotate_refresh_tokens` tinyint(1) NOT NULL,
  `blacklist_after_rotation` tinyint(1) NOT NULL,
  `backup_custom_path` varchar(500) DEFAULT NULL,
  `backup_schedule_frequency` varchar(20) NOT NULL,
  `backup_retention_days` int(11) NOT NULL,
  `quota_carry_over_policy` varchar(20) NOT NULL,
  `quota_carry_over_enabled` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_config_systemconfiguration`
--
INSERT INTO `system_config_systemconfiguration` (`id`, `email_host`, `email_port`, `email_use_tls`, `email_host_user`, `email_host_password`, `default_from_email`, `email_from_name`, `access_token_lifetime_minutes`, `refresh_token_lifetime_days`, `rotate_refresh_tokens`, `blacklist_after_rotation`, `backup_custom_path`, `backup_schedule_frequency`, `backup_retention_days`, `quota_carry_over_policy`, `quota_carry_over_enabled`, `created_at`, `updated_at`, `is_active`) VALUES (1, 'smtp.gmail.com', 587, 1, 'jerichourbano.01.01.04@gmail.com', 'pkfn htuz duyo nben', 'pkfn htuz duyo nben', 'Integrated Establishment Regulatory Management System', 60, 1, 1, 1, NULL, 'daily', 30, 'independent', 0, '2025-11-13 15:05:27.431872', '2025-11-15 16:22:15.267810', 1);

--
-- Table structure for table `token_blacklist_blacklistedtoken`
--
DROP TABLE IF EXISTS `token_blacklist_blacklistedtoken`;
CREATE TABLE `token_blacklist_blacklistedtoken` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `blacklisted_at` datetime(6) NOT NULL,
  `token_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_id` (`token_id`),
  CONSTRAINT `token_blacklist_blacklistedtoken_token_id_3cc7fe56_fk` FOREIGN KEY (`token_id`) REFERENCES `token_blacklist_outstandingtoken` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist_blacklistedtoken`
--
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (1, '2025-11-15 16:24:33.031936', 3);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (2, '2025-11-15 16:49:33.721662', 10);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (3, '2025-11-15 16:52:26.924341', 13);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (4, '2025-11-15 16:55:07.612700', 15);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (5, '2025-11-15 16:57:30.506655', 17);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (6, '2025-11-15 17:09:46.516862', 21);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (7, '2025-11-16 09:33:55.703828', 25);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (8, '2025-11-16 09:40:33.440412', 29);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (9, '2025-11-16 09:42:41.932958', 31);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (11, '2025-11-16 10:06:52.598309', 34);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (12, '2025-11-16 10:20:02.757630', 30);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (13, '2025-11-16 10:23:02.019876', 37);

--
-- Table structure for table `token_blacklist_outstandingtoken`
--
DROP TABLE IF EXISTS `token_blacklist_outstandingtoken`;
CREATE TABLE `token_blacklist_outstandingtoken` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `token` longtext NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `expires_at` datetime(6) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `jti` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_blacklist_outstandingtoken_jti_hex_d9bdf6f7_uniq` (`jti`),
  KEY `token_blacklist_outs_user_id_83bc629a_fk_users_use` (`user_id`),
  CONSTRAINT `token_blacklist_outs_user_id_83bc629a_fk_users_use` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist_outstandingtoken`
--
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzEzMjg2MywiaWF0IjoxNzYzMDQ2NDYzLCJqdGkiOiI3ZTExNTI1YzliZjU0N2YzOTdiY2E1YjRkZDJlOWJiYSIsInVzZXJfaWQiOiIxIn0.cyjlqQwypl5LVDsQzJUUzj0gnrmLvOscOo0zKNSrXb8', '2025-11-13 15:07:43.008284', '2025-11-14 15:07:43', 1, '7e11525c9bf547f397bca5b4dd2e9bba');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMDIxNCwiaWF0IjoxNzYzMjIzODE0LCJqdGkiOiIyYWY1YjVjMWEzODE0MTZhODc2MDk3ZTUwYjNkMTc3MSIsInVzZXJfaWQiOiIyIn0.QOVWBvb7wQ3Xg50qSFY-KZNpNWyW4Jhb6vrI8XLu3hI', '2025-11-15 16:23:34.390502', '2025-11-16 16:23:34', 2, '2af5b5c1a381416a876097e50b3d1771');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMDI1NSwiaWF0IjoxNzYzMjIzODU1LCJqdGkiOiJlYzE4YTg2NDdkNzA0MjY1YTVkMzFjZDAzMjZjMmE3NiIsInVzZXJfaWQiOiIyIn0.sIdspfVyvMbRrgI4fBmP9WAesq-ZWjMcohCvE6wg63U', '2025-11-15 16:24:15.875678', '2025-11-16 16:24:15', 2, 'ec18a8647d704265a5d31cd0326c2a76');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMDI4NywiaWF0IjoxNzYzMjIzODg3LCJqdGkiOiIxMmQwZWNjNGY0MjM0MjhkOGE2OGY0Y2UwMjE0ZDcxZCIsInVzZXJfaWQiOiIyIn0.QPYy6yXrdPdDx5DpWmzY54FFoukO2V3_Dwvc5xTmgbU', '2025-11-15 16:24:47.872271', '2025-11-16 16:24:47', 2, '12d0ecc4f423428d8a68f4ce0214d71d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMDQzNCwiaWF0IjoxNzYzMjI0MDM0LCJqdGkiOiJhMDJhNTM3ZDU1YTM0MGNhYWY4ZjU2NDVjYmNmMDc5NyIsInVzZXJfaWQiOiIzIn0.Wxp_yI2VPeLUoxWaXYhBYOXANsYbxMne6WjuGMngBh4', '2025-11-15 16:27:14.663906', '2025-11-16 16:27:14', NULL, 'a02a537d55a340caaf8f5645cbcf0797');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMDQ2MCwiaWF0IjoxNzYzMjI0MDYwLCJqdGkiOiI0MmM1YzVhOGY1ZDA0ZmExYmE5ZGYxNTk1MjQ5MmJmOSIsInVzZXJfaWQiOiI0In0.nL-aC2RqOwIk0XPqaFBzjv32KlcbZV_qYfowiRwpIoY', '2025-11-15 16:27:40.206376', '2025-11-16 16:27:40', NULL, '42c5c5a8f5d04fa1ba9df15952492bf9');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMDQ5MywiaWF0IjoxNzYzMjI0MDkzLCJqdGkiOiJkYzk3ZDQ4MWQ4M2Q0NzcwYTQ1OTNhMTA5NmQ5NzdkMyIsInVzZXJfaWQiOiI1In0.c1uCwn70j68T4oio7qNa5DuWJ82wZwnUFsA1T9Ua9Jk', '2025-11-15 16:28:13.181064', '2025-11-16 16:28:13', NULL, 'dc97d481d83d4770a4593a1096d977d3');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMTY3MCwiaWF0IjoxNzYzMjI1MjcwLCJqdGkiOiI2OTIxNzEzYTA0OWU0ZmJmOGUzYzYzM2Y2ZTFmMDk4MCIsInVzZXJfaWQiOiI2In0.0xdt_1gAxxIcwJnp0TN_CfiQ6opG9_67gOIfQg79EBI', '2025-11-15 16:47:50.286256', '2025-11-16 16:47:50', 6, '6921713a049e4fbf8e3c633f6e1f0980');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMTc0MCwiaWF0IjoxNzYzMjI1MzQwLCJqdGkiOiJmYzg1MDViYWE0MGU0YjQ2OWEyZmUzYzliZDIzNDQ2ZSIsInVzZXJfaWQiOiI3In0.4zGw_oXBXPZkhon0AdSjTgqAnU35yosYsqOApJ9fW2A', '2025-11-15 16:49:00.731393', '2025-11-16 16:49:00', 7, 'fc8505baa40e4b469a2fe3c9bd23446e');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMTc1NiwiaWF0IjoxNzYzMjI1MzU2LCJqdGkiOiIwNWFhNTMwNmFkOWI0MTE0YTNjZTA1OTM1Y2M1ZDgyMCIsInVzZXJfaWQiOiI2In0.jqxZZbSt_i7D8D4a9qjDcJm5DOOXOHln9H8fDRa6ue4', '2025-11-15 16:49:16.504446', '2025-11-16 16:49:16', 6, '05aa5306ad9b4114a3ce05935cc5d820');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMTc5MiwiaWF0IjoxNzYzMjI1MzkyLCJqdGkiOiI1Y2M4NDRiY2VhMjk0ZWM3YjBhNzAxYWYyYzFmY2IwZCIsInVzZXJfaWQiOiI2In0.VkV8JEl15PmMC_eXB0VlWc8G9kGD8J0Vaa8Qwu3_9dk', '2025-11-15 16:49:52.520538', '2025-11-16 16:49:52', 6, '5cc844bcea294ec7b0a701af2c1fcb0d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMTkwNywiaWF0IjoxNzYzMjI1NTA3LCJqdGkiOiJjYjhmZmRkN2MxYmI0ZGQwYmQ5Mzc0MTliMmM1M2M4MiIsInVzZXJfaWQiOiI4In0.bPvpqvUVBpmT6qM8rom1XGQEcdM-RF8e-YbKhFSOxSA', '2025-11-15 16:51:47.695151', '2025-11-16 16:51:47', NULL, 'cb8ffdd7c1bb4dd0bd937419b2c53c82');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (13, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMTkxOCwiaWF0IjoxNzYzMjI1NTE4LCJqdGkiOiI5ODFjM2ZhMzdmNDM0OTkwYWE0ODUxZTYzMGEzMDFkNSIsInVzZXJfaWQiOiI3In0.EVggW6DRuh5yU5ezrUWzuQZzcE6cfij6IWjuGsLbiq8', '2025-11-15 16:51:58.913256', '2025-11-16 16:51:58', 7, '981c3fa37f434990aa4851e630a301d5');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMjAyMiwiaWF0IjoxNzYzMjI1NjIyLCJqdGkiOiIyOTFkMzE1NDZhNDI0OTA1OTAxOGY2ZmQxZGQ4NTQxYyIsInVzZXJfaWQiOiI3In0.Ju9eVzu-0xs8V6wGv6Nv7xRWW_PWFMdtWVNjx85in5k', '2025-11-15 16:53:42.656561', '2025-11-16 16:53:42', 7, '291d31546a4249059018f6fd1dd8541c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMwODUwNSwiaWF0IjoxNzYzMjIyMTA1LCJqdGkiOiJiNmZhMTdhOWFhMDE0NmQzYWU3OGE5ODJmNTNmNzM0YiIsInVzZXJfaWQiOiIxIn0.sAZTXi4DswbZ69RPFqijTBKoXd-ARMtzIkMNxhLAL3E', '2025-11-15 16:55:07.580463', '2025-11-16 15:55:05', 1, 'b6fa17a9aa0146d3ae78a982f53f734b');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (16, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMjEwNywiaWF0IjoxNzYzMjI1NzA3LCJqdGkiOiJjYjIwMzk5NGY4YzY0ZjBhOGMzOGMzNWQ2ZDA2ODM4ZCIsInVzZXJfaWQiOiIxIn0.FVXKBjTdU6wiSQLS9nCZmkiYM0cKOomE90ztDFDyIyc', '2025-11-15 16:55:07.580463', '2025-11-16 16:55:07', 1, 'cb203994f8c64f0a8c38c35d6d06838d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (17, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMjIxNiwiaWF0IjoxNzYzMjI1ODE2LCJqdGkiOiI1NTFkNGRjNjAwNWU0YzY4OWQ3Nzg5OTAzN2I0NTRhMCIsInVzZXJfaWQiOiI4In0.9i0oYyn37S48x2_5uAt680nbwhsLl0J3XWgLvZ_7zA4', '2025-11-15 16:56:56.032962', '2025-11-16 16:56:56', NULL, '551d4dc6005e4c689d77899037b454a0');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (18, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMjI4OCwiaWF0IjoxNzYzMjI1ODg4LCJqdGkiOiJiMmRkZmM5MjhlM2I0N2Q5OGY1Zjg3ODhmNzQ5NDMxZiIsInVzZXJfaWQiOiI4In0.fO_4L5fHvbrO3AWGkHr0vGjVvCdPe6_zhIg-dEzgZE8', '2025-11-15 16:58:08.072115', '2025-11-16 16:58:08', NULL, 'b2ddfc928e3b47d98f5f8788f749431f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (19, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMjMwNiwiaWF0IjoxNzYzMjI1OTA2LCJqdGkiOiJmZGExMWNiMDczN2U0YmQ5OTJkNDcyZThkYzIxNjA1OCIsInVzZXJfaWQiOiIxIn0.dOKzNDG0GXUQSVWFKGzcABrLs9t9EY49oSUmAq65Q40', '2025-11-15 16:58:26.249564', '2025-11-16 16:58:26', 1, 'fda11cb0737e4bd992d472e8dc216058');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (20, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMjg4NiwiaWF0IjoxNzYzMjI2NDg2LCJqdGkiOiI1OWNiODA0MzRiYjQ0NjI2YmY2NjBmM2E3MDNkYTFkYSIsInVzZXJfaWQiOiI5In0.sk3jdPN9xpjVBqEhzIsVh_eIZsiK6ownacpObLwC9Z8', '2025-11-15 17:08:06.749031', '2025-11-16 17:08:06', 9, '59cb80434bb44626bf660f3a703da1da');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (21, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMjk2NiwiaWF0IjoxNzYzMjI2NTY2LCJqdGkiOiJjNzM5YTc4MTBjMzE0Yjg2OGVlMGIzM2MwNDhmYTljMyIsInVzZXJfaWQiOiI5In0.j-qfKFZvHoqz4TVXjbAuty_ZeEhdXPcIq5OtvK569tQ', '2025-11-15 17:09:26.514157', '2025-11-16 17:09:26', 9, 'c739a7810c314b868ee0b33c048fa9c3');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (22, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMxMzAxNSwiaWF0IjoxNzYzMjI2NjE1LCJqdGkiOiI1OTE2YmRjMGM5NGU0OWZlOWQ3ZjM3NThiNTk4Yzc3OSIsInVzZXJfaWQiOiI5In0.Tiw8O8kegQVaZCLqp03nmLmjh3n42mUuOPBgnOAcptw', '2025-11-15 17:10:15.519035', '2025-11-16 17:10:15', 9, '5916bdc0c94e49fe9d7f3758b598c779');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (23, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMyMDUzMywiaWF0IjoxNzYzMjM0MTMzLCJqdGkiOiJlMmFlYTcyNmIyMjE0NjQ0YmUyZmJkOTU5MzA4NmNmMiIsInVzZXJfaWQiOiI3In0.echgraED7zs0pgR_aoQtZemY7FOpGyp_t_QVhBCMD2s', '2025-11-15 19:15:33.710596', '2025-11-16 19:15:33', 7, 'e2aea726b2214644be2fbd9593086cf2');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (24, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzMyMDc3NiwiaWF0IjoxNzYzMjM0Mzc2LCJqdGkiOiJjNGMxNjg1MjIwMGQ0NGFiYWM4Y2M1NDMyMDUyMGQyNiIsInVzZXJfaWQiOiIxIn0.r1Nj9koqHLxsmkXhjoLSSKQTNeQS3CwxryFyP9qgYek', '2025-11-15 19:19:36.739411', '2025-11-16 19:19:36', 1, 'c4c16852200d44abac8cc54320520d26');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (25, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM2ODYyMywiaWF0IjoxNzYzMjgyMjIzLCJqdGkiOiJhYThkYmM3NWUzN2Q0N2YwYjYyYTIzNWZhZDg0MTJkNiIsInVzZXJfaWQiOiIxIn0.8JWOSlwl4a3gqKicmr-XmqC7NRbrr3gtwjMFvdfMVQo', '2025-11-16 09:33:55.623340', '2025-11-17 08:37:03', 1, 'aa8dbc75e37d47f0b62a235fad8412d6');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (26, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3MjAzNSwiaWF0IjoxNzYzMjg1NjM1LCJqdGkiOiI2NTk0OThiMDQ2Zjg0OTllYjNiMTVjM2EyZTg3NzZhMCIsInVzZXJfaWQiOiIxIn0.mqu4aAwcJDu1oBUq3i9y9CD0ZjHkLCNRsvI8_ohyBik', '2025-11-16 09:33:55.623340', '2025-11-17 09:33:55', 1, '659498b046f8499eb3b15c3a2e8776a0');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (27, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3MjAzNSwiaWF0IjoxNzYzMjg1NjM1LCJqdGkiOiJiYmRjYjM2ZmJmMGY0Y2U0YWI1MzhiNmM5NTc5MjAyNCIsInVzZXJfaWQiOiIxIn0.LrN2cLTN3ehHZ9Cg-lqzykPhRgOpvPo75mvq6jI1lxs', '2025-11-16 09:33:55.627026', '2025-11-17 09:33:55', 1, 'bbdcb36fbf0f4ce4ab538b6c95792024');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (28, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3MjIxNSwiaWF0IjoxNzYzMjg1ODE1LCJqdGkiOiI2NzU2ZDRjMWQxNTk0ZmQxOWFlMzJjNmVkMDBkZmRhOCIsInVzZXJfaWQiOiIxMCJ9.VueGhy3iPGYLzJc1pzT-8I6w003CU8_aRgSp83VLej4', '2025-11-16 09:36:55.866389', '2025-11-17 09:36:55', 10, '6756d4c1d1594fd19ae32c6ed00dfda8');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3MjM5NSwiaWF0IjoxNzYzMjg1OTk1LCJqdGkiOiIyM2Q1YThmNzg5NWQ0ODZmOTUxY2JjNzM4YTYzMGMxZSIsInVzZXJfaWQiOiIxMCJ9.sxm0DUTkcHRw9_Q0KoCQu4Izvyf179yPpwPTbbf6VOw', '2025-11-16 09:39:55.324001', '2025-11-17 09:39:55', 10, '23d5a8f7895d486f951cbc738a630c1e');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (30, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3MjQ1MCwiaWF0IjoxNzYzMjg2MDUwLCJqdGkiOiJhZmU3MjA3ZjNkNDc0MDBiODlmMTBiZGRlYjQzOTcwOCIsInVzZXJfaWQiOiIxMCJ9.69tI7T9_PMtQV5loy2479OOI299tEupA7PcRAuQyqTE', '2025-11-16 09:40:50.602496', '2025-11-17 09:40:50', 10, 'afe7207f3d47400b89f10bddeb439708');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (31, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM2ODkxMiwiaWF0IjoxNzYzMjgyNTEyLCJqdGkiOiIwM2VkYzFhYzZmMDI0NmEzODllMGI5M2NhZWM5NTQyYyIsInVzZXJfaWQiOiI3In0.KSzaDW3ZPX1x2hPXy0Q7V6Cak28qi9alG0Pj38D8EY0', '2025-11-16 09:42:41.898608', '2025-11-17 08:41:52', 7, '03edc1ac6f0246a389e0b93caec9542c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (32, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3MjU2MSwiaWF0IjoxNzYzMjg2MTYxLCJqdGkiOiI1MDZkNDg4ZGQ3Njk0ZDJiYTcyMjQzYzRlM2RjNzU4NSIsInVzZXJfaWQiOiI3In0.9VuKJ_SNCT6NbamtwaK3MEwhTJtC4jMETuedIaYU6Gw', '2025-11-16 09:42:41.907571', '2025-11-17 09:42:41', 7, '506d488dd7694d2ba72243c4e3dc7585');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (33, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3MjU2MSwiaWF0IjoxNzYzMjg2MTYxLCJqdGkiOiI0MjM5YjJmNGJjYzE0M2MwODIxYzRhYTliZDY2ODhhZSIsInVzZXJfaWQiOiI3In0.MlmkfmEWMLFLgwzocxEsRBjW7rbxqZyFvqW6pWtMy1o', '2025-11-16 09:42:41.898608', '2025-11-17 09:42:41', 7, '4239b2f4bcc143c0821c4aa9bd6688ae');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (34, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3MDQ0NiwiaWF0IjoxNzYzMjg0MDQ2LCJqdGkiOiIwZTM5MzViZTZlYzY0YTg1YWY4ZDEyM2Y1ZmQ0MDgyMCIsInVzZXJfaWQiOiI5In0.kUvI0sfXwvld8onQN-9E-k78tl59FhIbxlT0zq-HsCc', '2025-11-16 10:06:52.483584', '2025-11-17 09:07:26', 9, '0e3935be6ec64a85af8d123f5fd40820');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (35, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3NDAxMiwiaWF0IjoxNzYzMjg3NjEyLCJqdGkiOiI5MWRiNWY4MmI1NDk0NzZmOWQxZWM1Yjc5NjljNjBlNiIsInVzZXJfaWQiOiI5In0.YSFroarwPKMx8YONBrlXL4B9d3TlJ5o7IjUeZ4okuQs', '2025-11-16 10:06:52.483584', '2025-11-17 10:06:52', 9, '91db5f82b549476f9d1ec5b7969c60e6');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (36, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3NDg2MCwiaWF0IjoxNzYzMjg4NDYwLCJqdGkiOiI0ZjE1N2YxM2IwNTg0NTFlOGMyYWE0ZmZjNjg4MTBhYyIsInVzZXJfaWQiOiIxMSJ9.KP2ywieZxMUC1AqRqTMX3POH4vNi4tB_gcrCmQv2tOs', '2025-11-16 10:21:00.306909', '2025-11-17 10:21:00', 11, '4f157f13b058451e8c2aa4ffc68810ac');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (37, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3MTM0OSwiaWF0IjoxNzYzMjg0OTQ5LCJqdGkiOiI3MzZjYzYyOWM1YTA0YmJiOGYwOWQyYzY3MTM5MGE2ZiIsInVzZXJfaWQiOiIyIn0.V1rpddlKiw2jXdvG7dJ0zb2e2kZM0xQ5CazmotyXGRE', '2025-11-16 10:23:01.964705', '2025-11-17 09:22:29', 2, '736cc629c5a04bbb8f09d2c671390a6f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3NDk4MSwiaWF0IjoxNzYzMjg4NTgxLCJqdGkiOiJkYjgzNmIwNzU1MzY0ODFmOGU1MWM1ZWQ4OTkzYTRlOSIsInVzZXJfaWQiOiIyIn0.26VxIEYXnSfy4NdzFB3N7fEl3WUQTTf85MILkqoRYn8', '2025-11-16 10:23:01.976427', '2025-11-17 10:23:01', 2, 'db836b075536481f8e51c5ed8993a4e9');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (39, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MzM3NDk4MSwiaWF0IjoxNzYzMjg4NTgxLCJqdGkiOiIyOTU2NTFkYmQ1YjM0Y2FhOGZlMTkyMTgxYTdkNDNlZCIsInVzZXJfaWQiOiIyIn0.5yDMfH4QW31KqO5T0txz2-f6ji1RTZl8y_vOQH9bIK8', '2025-11-16 10:23:01.964705', '2025-11-17 10:23:01', 2, '295651dbd5b34caa8fe192181a7d43ed');

--
-- Table structure for table `users_user`
--
DROP TABLE IF EXISTS `users_user`;
CREATE TABLE `users_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `middle_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `userlevel` varchar(50) NOT NULL,
  `section` varchar(50) DEFAULT NULL,
  `avatar` varchar(100) DEFAULT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `is_first_login` tinyint(1) NOT NULL,
  `must_change_password` tinyint(1) NOT NULL,
  `failed_login_attempts` int(10) unsigned NOT NULL CHECK (`failed_login_attempts` >= 0),
  `last_failed_login` datetime(6) DEFAULT NULL,
  `account_locked_until` datetime(6) DEFAULT NULL,
  `is_account_locked` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `users_user_first_n_6d862e_idx` (`first_name`,`last_name`),
  KEY `users_user_email_6f2530_idx` (`email`),
  KEY `users_user_userlev_a37783_idx` (`userlevel`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users_user`
--
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `avatar`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (1, 'pbkdf2_sha256$600000$bWy6UN8OD1OkCyl8S0xof8$03TuzqU2TFovj7Y7GkAhUJHSJuXeXpfLmqwJLZm0rks=', '2025-11-15 19:19:36.733386', 1, 'admin@example.com', 'Administrator', '', '', 'Admin', NULL, 'avatars/hacker.png', 1, 1, '2025-11-13 15:06:15.385353', '2025-11-13 15:06:16.176367', 0, 0, 0, NULL, NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `avatar`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (2, 'pbkdf2_sha256$600000$YoOZJa7rDaTnIj05q3EsZR$duglgZ92qwFiexDeCutN0idtkfbJ0ykTjSVsxEJTnQo=', '2025-11-15 16:24:47.867861', 0, 'jerichourbano.01.01.04@gmail.com', 'DIVISION', 'EMB', 'SAMPLE', 'Division Chief', NULL, 'avatars/man_1.png', 0, 1, '2025-11-15 16:23:26.867425', '2025-11-16 09:45:39.624472', 0, 0, 0, NULL, NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `avatar`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (6, 'pbkdf2_sha256$600000$71xp10Cpll5O9CuRwqIXho$sV48IdWfeEJ8qViH6R5KOYdo3lTB5/tb0XCVS1Rs1J0=', '2025-11-15 16:49:52.506159', 0, '22101222@slc-sflu.edu.ph', 'SECTION EAW', 'EMB', 'SAMPLE', 'Section Chief', 'PD-1586,RA-8749,RA-9275', 'avatars/man.png', 0, 1, '2025-11-15 16:47:40.239313', '2025-11-16 10:19:24.410991', 0, 0, 0, NULL, NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `avatar`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (7, 'pbkdf2_sha256$600000$GdKCcdruBsM8vs4dU9FWEa$notWnZx9lecpjNp5SsNU5Tn8nzR5X9ASO9gYFM8SvVs=', '2025-11-15 19:15:33.705531', 0, 'echo.010104@gmail.com', 'UNIT', 'EMB', 'SAMPLE', 'Unit Head', 'PD-1586', 'avatars/man_2.png', 0, 1, '2025-11-15 16:48:54.851011', '2025-11-16 09:46:32.384315', 0, 0, 0, NULL, NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `avatar`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (9, 'pbkdf2_sha256$600000$gC2ASDHIZqgFKOKyC9aqXm$ObMKHx6UsTo38t3ccUo0UqHPGR+CCRpQ7ecWmW/uf+A=', '2025-11-15 17:10:15.513312', 0, 'emee46990@gmail.com', 'EIA MONITORING', 'EMB', 'SAMPLE', 'Monitoring Personnel', 'PD-1586', 'avatars/woman_1.png', 0, 1, '2025-11-15 17:07:50.552517', '2025-11-16 09:46:53.714550', 0, 0, 0, NULL, NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `avatar`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (10, 'pbkdf2_sha256$600000$zDV9MXyFn72eiKBp66CEAI$3MM6Reb/l9qShq0O9/xF/qDxt8nwhbnR7dTee686bnA=', '2025-11-16 09:40:50.596382', 0, '22100949@slc-sflu.edu.ph', 'LEGAL UNIT', 'EMB', 'SAMPLE', 'Legal Unit', NULL, 'avatars/woman.png', 0, 1, '2025-11-16 09:36:43.121010', '2025-11-16 09:47:08.115823', 0, 0, 0, NULL, NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `avatar`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (11, 'pbkdf2_sha256$600000$NfdAOVZM6hKvx6HYcsAGJv$1m9KXNukmh8vLDQF+Yz/+G07D2Xphph59RBXTGxRh78=', NULL, 0, 'harryzabate@gmail.com', 'SECTION TOXIC', 'EMB', 'SAMPLE', 'Section Chief', 'RA-6969', 'avatars/11-1763288453.webp', 0, 1, '2025-11-16 10:20:48.078978', '2025-11-16 10:20:52.745515', 1, 1, 0, NULL, NULL, 0);

--
-- Table structure for table `users_user_groups`
--
DROP TABLE IF EXISTS `users_user_groups`;
CREATE TABLE `users_user_groups` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_user_groups_user_id_group_id_b88eab82_uniq` (`user_id`,`group_id`),
  KEY `users_user_groups_group_id_9afc8d0e_fk_auth_group_id` (`group_id`),
  CONSTRAINT `users_user_groups_group_id_9afc8d0e_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `users_user_groups_user_id_5f6f5a90_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users_user_groups`
--

--
-- Table structure for table `users_user_user_permissions`
--
DROP TABLE IF EXISTS `users_user_user_permissions`;
CREATE TABLE `users_user_user_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_user_user_permissions_user_id_permission_id_43338c45_uniq` (`user_id`,`permission_id`),
  KEY `users_user_user_perm_permission_id_0b93982e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `users_user_user_perm_permission_id_0b93982e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `users_user_user_permissions_user_id_20aca447_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users_user_user_permissions`
--

SET FOREIGN_KEY_CHECKS=1;
-- Dump completed
