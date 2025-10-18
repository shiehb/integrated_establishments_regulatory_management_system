-- MySQL dump created by Python
-- Database: db_ierms
-- Server: 127.0.0.1:3306
-- Generated: 2025-10-18 16:50:10
SET FOREIGN_KEY_CHECKS=0;

--
-- Table structure for table `audit_activitylog`
--
DROP TABLE IF EXISTS `audit_activitylog`;
CREATE TABLE `audit_activitylog` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `action` varchar(50) NOT NULL,
  `message` longtext NOT NULL,
  `ip_address` char(39) DEFAULT NULL,
  `user_agent` longtext DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_activitylog_user_id_3cff121f_fk_users_user_id` (`user_id`),
  CONSTRAINT `audit_activitylog_user_id_3cff121f_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_activitylog`
--
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (1, 'create', 'New user account created: admin@example.com with auto-generated password', NULL, '', '2025-10-18 02:03:41.310794', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (2, 'login', 'User admin@example.com logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 02:09:23.966554', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (3, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-18 02:09:23.972982', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (4, 'login', 'User admin@example.com logged in successfully', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 02:12:49.610387', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (5, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-18 02:12:49.633286', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (6, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 02:15:40.714649', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (7, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 02:21:49.234027', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (8, 'create', 'New user account created: jerichourbano.01.01.04@gmail.com with auto-generated password', NULL, '', '2025-10-18 02:27:33.185716', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (9, 'create', 'New user registered: jerichourbano.01.01.04@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 02:27:49.786201', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (10, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-18 02:33:04.784465', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (11, 'login_failed', 'Failed login attempt for jerichourbano.01.01.04@gmail.com (attempt #1)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 02:33:04.788186', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (12, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-18 02:33:04.800466', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (13, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-18 02:33:15.669700', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (14, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-18 02:33:48.195483', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (15, 'update', 'First-time password set for jerichourbano.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 02:33:48.199488', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (16, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-18 02:34:06.079425', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (17, 'login_failed', 'Failed login attempt for admin@example.com (attempt #1)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 02:34:06.082975', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (18, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-18 02:34:06.093026', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (19, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-18 02:34:15.321903', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (20, 'login_failed', 'Failed login attempt for admin@example.com (attempt #3)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 02:34:18.327186', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (21, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-18 02:34:18.335083', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (22, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-18 02:35:24.307929', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (23, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-18 02:35:40.343562', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (24, 'update', 'Updated user email from jerichourbano.01.01.04@gmail.com to 22101222@slc-sflu.edu.ph. New password generated and sent.', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 02:36:06.920931', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (25, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-18 02:38:56.924260', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (26, 'update', 'First-time password set for 22101222@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 02:38:56.926630', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (27, 'create', 'Created establishment: SAINT LOUIS COLLEGE', NULL, '', '2025-10-18 02:49:31.137548', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (28, 'update', 'Updated establishment: SAINT LOUIS COLLEGE', NULL, '', '2025-10-18 02:49:31.213200', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (29, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-18 02:58:36.267559', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (30, 'update', 'Updated user: 22101222@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 02:58:36.288940', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (31, 'create', 'New user account created: jerichourbano.01.01.04@gmail.com with auto-generated password', NULL, '', '2025-10-18 03:00:19.268416', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (32, 'create', 'New user registered: jerichourbano.01.01.04@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 03:00:39.550925', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (33, 'update', 'Updated establishment: SAINT LOUIS COLLEGE', NULL, '', '2025-10-18 03:12:05.952489', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (34, 'update', 'Updated establishment: SAINT LOUIS COLLEGE', NULL, '', '2025-10-18 03:12:06.047821', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (35, 'update', 'Updated establishment: SAINT LOUIS COLLEGE', NULL, '', '2025-10-18 03:13:57.264263', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (36, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-18 03:15:26.817021', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (37, 'update', 'First-time password set for jerichourbano.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 03:15:26.824161', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (38, 'create', 'Inspection EIA-2025-0001 created for establishments: No establishments with law PD-1586', NULL, '', '2025-10-18 03:16:10.185903', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (39, 'status_change', 'Inspection EIA-2025-0001 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-18 03:16:10.439583', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (40, 'status_change', 'Inspection EIA-2025-0001 status changed from SECTION_ASSIGNED to SECTION_IN_PROGRESS', NULL, '', '2025-10-18 04:17:47.700307', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (41, 'create', 'Created establishment: COCA-COLA DISTRIBUTION', NULL, '', '2025-10-18 07:28:38.938822', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (42, 'update', 'Updated establishment: COCA-COLA DISTRIBUTION', NULL, '', '2025-10-18 07:28:39.255300', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (43, 'update', 'Updated establishment: COCA-COLA DISTRIBUTION', NULL, '', '2025-10-18 07:29:13.098673', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (44, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-18 07:34:05.547458', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (45, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-18 07:35:26.626632', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (46, 'update', 'Toggled active status for 22101222@slc-sflu.edu.ph → False', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 07:35:26.646255', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (47, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-18 07:35:33.602852', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (48, 'update', 'Toggled active status for 22101222@slc-sflu.edu.ph → True', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 07:35:33.615547', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (49, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-18 07:56:00.946703', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (50, 'update', 'Toggled active status for jerichourbano.01.01.04@gmail.com → False', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 07:56:01.393209', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (51, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-18 07:57:46.891748', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (52, 'update', 'Toggled active status for jerichourbano.01.01.04@gmail.com → True', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 07:57:46.900368', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (53, 'create', 'New user account created: echo.010104@gmail.com with auto-generated password', NULL, '', '2025-10-18 08:12:01.997213', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (54, 'create', 'New user registered: echo.010104@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 08:12:21.693361', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (55, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-18 08:15:52.997826', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (56, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-18 08:16:30.859222', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (57, 'login_failed', 'Failed login attempt for 22101222@slc-sflu.edu.ph (attempt #1)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 08:16:30.863617', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (58, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-18 08:16:30.879383', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (59, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-18 08:16:41.066775', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (60, 'login_failed', 'Failed login attempt for 22101222@slc-sflu.edu.ph (attempt #3)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 08:17:04.358427', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (61, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-18 08:17:04.377063', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (62, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-18 08:17:14.519434', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (63, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-18 08:17:14.531012', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (64, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-18 08:20:05.296578', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (65, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-18 08:20:23.485129', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (66, 'update', 'First-time password set for echo.010104@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 08:20:23.527703', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (67, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-18 08:20:39.016753', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (68, 'create', 'Inspection EIA-2025-0002 created for establishments: No establishments with law PD-1586', NULL, '', '2025-10-18 08:20:59.479257', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (69, 'status_change', 'Inspection EIA-2025-0002 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-18 08:21:01.314711', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (70, 'status_change', 'Inspection EIA-2025-0002 status changed from SECTION_ASSIGNED to UNIT_ASSIGNED', NULL, '', '2025-10-18 08:22:04.722123', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (71, 'create', 'New user account created: emee46990@gmail.com with auto-generated password', NULL, '', '2025-10-18 08:25:49.228745', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (72, 'create', 'New user registered: emee46990@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 08:25:52.702564', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (73, 'update', 'User account updated: emee46990@gmail.com', NULL, '', '2025-10-18 08:29:16.126711', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (74, 'update', 'User account updated: emee46990@gmail.com', NULL, '', '2025-10-18 08:29:42.825614', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (75, 'update', 'First-time password set for emee46990@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-18 08:29:42.829370', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (76, 'update', 'User account updated: emee46990@gmail.com', NULL, '', '2025-10-18 08:30:00.394937', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (77, 'update', 'User account updated: emee46990@gmail.com', NULL, '', '2025-10-18 08:34:10.810712', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (78, 'update', 'Assigned district La Union - 1st District to emee46990@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-18 08:34:10.813503', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (79, 'status_change', 'Inspection EIA-2025-0002 status changed from UNIT_ASSIGNED to MONITORING_ASSIGNED', NULL, '', '2025-10-18 08:42:05.386872', 4);

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
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (45, 'Can add inspection', 12, 'add_inspection');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (46, 'Can change inspection', 12, 'change_inspection');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (47, 'Can delete inspection', 12, 'delete_inspection');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (48, 'Can view inspection', 12, 'view_inspection');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (49, 'Can add inspection document', 13, 'add_inspectiondocument');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (50, 'Can change inspection document', 13, 'change_inspectiondocument');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (51, 'Can delete inspection document', 13, 'delete_inspectiondocument');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (52, 'Can view inspection document', 13, 'view_inspectiondocument');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (53, 'Can add inspection history', 14, 'add_inspectionhistory');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (54, 'Can change inspection history', 14, 'change_inspectionhistory');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (55, 'Can delete inspection history', 14, 'delete_inspectionhistory');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (56, 'Can view inspection history', 14, 'view_inspectionhistory');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (57, 'Can add inspection form', 15, 'add_inspectionform');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (58, 'Can change inspection form', 15, 'change_inspectionform');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (59, 'Can delete inspection form', 15, 'delete_inspectionform');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (60, 'Can view inspection form', 15, 'view_inspectionform');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (61, 'Can add System Configuration', 16, 'add_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (62, 'Can change System Configuration', 16, 'change_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (63, 'Can delete System Configuration', 16, 'delete_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (64, 'Can view System Configuration', 16, 'view_systemconfiguration');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_admin_log`
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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_content_type`
--
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (1, 'admin', 'logentry');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (11, 'audit', 'activitylog');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (3, 'auth', 'group');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (2, 'auth', 'permission');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (4, 'contenttypes', 'contenttype');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (9, 'establishments', 'establishment');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (12, 'inspections', 'inspection');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (13, 'inspections', 'inspectiondocument');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (15, 'inspections', 'inspectionform');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (14, 'inspections', 'inspectionhistory');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (10, 'notifications', 'notification');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (5, 'sessions', 'session');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (16, 'system_config', 'systemconfiguration');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (6, 'token_blacklist', 'blacklistedtoken');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (7, 'token_blacklist', 'outstandingtoken');
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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_migrations`
--
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (1, 'contenttypes', '0001_initial', '2025-10-18 02:02:26.086399');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (2, 'contenttypes', '0002_remove_content_type_name', '2025-10-18 02:02:26.184612');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (3, 'auth', '0001_initial', '2025-10-18 02:02:26.497286');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (4, 'auth', '0002_alter_permission_name_max_length', '2025-10-18 02:02:26.587672');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (5, 'auth', '0003_alter_user_email_max_length', '2025-10-18 02:02:26.599763');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (6, 'auth', '0004_alter_user_username_opts', '2025-10-18 02:02:26.613494');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (7, 'auth', '0005_alter_user_last_login_null', '2025-10-18 02:02:26.650539');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (8, 'auth', '0006_require_contenttypes_0002', '2025-10-18 02:02:26.658190');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (9, 'auth', '0007_alter_validators_add_error_messages', '2025-10-18 02:02:26.714975');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (10, 'auth', '0008_alter_user_username_max_length', '2025-10-18 02:02:26.731169');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (11, 'auth', '0009_alter_user_last_name_max_length', '2025-10-18 02:02:26.767780');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (12, 'auth', '0010_alter_group_name_max_length', '2025-10-18 02:02:26.813232');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (13, 'auth', '0011_update_proxy_permissions', '2025-10-18 02:02:26.836038');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (14, 'auth', '0012_alter_user_first_name_max_length', '2025-10-18 02:02:26.851328');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (15, 'users', '0001_initial', '2025-10-18 02:02:27.324222');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (16, 'admin', '0001_initial', '2025-10-18 02:02:27.488142');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (17, 'admin', '0002_logentry_remove_auto_add', '2025-10-18 02:02:27.510555');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (18, 'admin', '0003_logentry_add_action_flag_choices', '2025-10-18 02:02:27.536909');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (19, 'audit', '0001_initial', '2025-10-18 02:02:27.573779');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (20, 'audit', '0002_initial', '2025-10-18 02:02:27.677430');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (21, 'establishments', '0001_initial', '2025-10-18 02:02:27.803292');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (22, 'inspections', '0001_initial', '2025-10-18 02:02:27.943499');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (23, 'inspections', '0002_initial', '2025-10-18 02:02:29.334333');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (24, 'notifications', '0001_initial', '2025-10-18 02:02:29.360684');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (25, 'notifications', '0002_initial', '2025-10-18 02:02:29.599989');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (26, 'sessions', '0001_initial', '2025-10-18 02:02:29.699500');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (27, 'system_config', '0001_initial', '2025-10-18 02:02:29.723942');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (28, 'token_blacklist', '0001_initial', '2025-10-18 02:02:30.007931');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (29, 'token_blacklist', '0002_outstandingtoken_jti_hex', '2025-10-18 02:02:30.063534');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (30, 'token_blacklist', '0003_auto_20171017_2007', '2025-10-18 02:02:30.145971');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (31, 'token_blacklist', '0004_auto_20171017_2013', '2025-10-18 02:02:30.303063');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (32, 'token_blacklist', '0005_remove_outstandingtoken_jti', '2025-10-18 02:02:30.356721');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (33, 'token_blacklist', '0006_auto_20171017_2113', '2025-10-18 02:02:30.395453');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (34, 'token_blacklist', '0007_auto_20171017_2214', '2025-10-18 02:02:31.035438');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (35, 'token_blacklist', '0008_migrate_to_bigautofield', '2025-10-18 02:02:31.670245');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (36, 'token_blacklist', '0010_fix_migrate_to_bigautofield', '2025-10-18 02:02:31.748861');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (37, 'token_blacklist', '0011_linearizes_history', '2025-10-18 02:02:31.756265');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (38, 'token_blacklist', '0012_alter_outstandingtoken_user', '2025-10-18 02:02:31.857926');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (39, 'token_blacklist', '0013_alter_blacklistedtoken_options_and_more', '2025-10-18 02:02:31.896516');

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
INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES ('sz70l80df9suzqz3ymj7tanaycsq0jrw', '.eJxVjDsOwyAQBe9CHSFAfFOmzxnQwi7BSQSSsSsrd48tuUjamXlvYxHWpcZ10BwnZFcm2eWXJcgvaofAJ7RH57m3ZZ4SPxJ-2sHvHel9O9u_gwqj7mvnUWKBIEF4VSyQcQV1FmSKd0Io4YuXsIOgdbJOOyMNIPmQhbahKPb5AuSPN38:1v9wR7:Le6xjKK9sLa7i0VaNwFJwW_aL8JpXG2CqS-ImD9ch7A', '2025-11-01 02:12:49.640379');
INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES ('szefojz5a5sikqpov8jc1r7s3zsdd37x', '.eJxVjDsOwyAQBe9CHSFAfFOmzxnQwi7BSQSSsSsrd48tuUjamXlvYxHWpcZ10BwnZFcm2eWXJcgvaofAJ7RH57m3ZZ4SPxJ-2sHvHel9O9u_gwqj7mvnUWKBIEF4VSyQcQV1FmSKd0Io4YuXsIOgdbJOOyMNIPmQhbahKPb5AuSPN38:1v9wNn:dQ8fXtUjZv8VA7nI19MPwJ8d0MejY57Ns2YbDZg2zUA', '2025-11-01 02:09:23.977606');

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
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `establishme_name_9f5395_idx` (`name`),
  KEY `establishme_nature__7f0240_idx` (`nature_of_business`),
  KEY `establishme_city_6fc21b_idx` (`city`),
  KEY `establishme_baranga_fe31e9_idx` (`barangay`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `establishments_establishment`
--
INSERT INTO `establishments_establishment` (`id`, `name`, `nature_of_business`, `year_established`, `province`, `city`, `barangay`, `street_building`, `postal_code`, `latitude`, `longitude`, `polygon`, `is_active`, `created_at`, `updated_at`) VALUES (1, 'SAINT LOUIS COLLEGE', 'EDUCATION/TRAINING', '1964', 'LA UNION', 'SAN FERNANDO', 'Carlatan', 'STREET', '2500', '16.636644', '120.312974', '[[16.637177366928217, 120.31212301882158], [16.637405964238397, 120.3131343235257], [16.63827411783225, 120.31304848333862], [16.63836144667439, 120.31378080743472], [16.638289528807288, 120.31379958497564], [16.638346035705144, 120.31411880317134], [16.636715034456664, 120.314247563452], [16.636368284371432, 120.31401955045503], [16.636375989935697, 120.31394444029134], [16.63643249739748, 120.31384250506919], [16.636447908520537, 120.31377812492885], [16.63580320881492, 120.31370569727103], [16.63580064028585, 120.31343744668635], [16.635728721458246, 120.31324162375957], [16.635633685823255, 120.31325235378294], [16.63561313757165, 120.31313164101985], [16.635546355738747, 120.3131343235257], [16.63549241654905, 120.31290362802288]]', 1, '2025-10-18 02:49:31.077753', '2025-10-18 03:13:57.255952');
INSERT INTO `establishments_establishment` (`id`, `name`, `nature_of_business`, `year_established`, `province`, `city`, `barangay`, `street_building`, `postal_code`, `latitude`, `longitude`, `polygon`, `is_active`, `created_at`, `updated_at`) VALUES (2, 'COCA-COLA DISTRIBUTION', 'RETAIL/WHOLESALE', '2000', 'LA UNION', 'SAN FERNANDO', 'Carlatan', 'STREET', '2500', '16.632584', '120.314568', '[[16.631598597531447, 120.31466588654192], [16.631639694892716, 120.3138745473172], [16.631822064327086, 120.3137243269898], [16.63283665167638, 120.31403013265631], [16.633137173987482, 120.31442177850988], [16.63296508007207, 120.31504411986626]]', 1, '2025-10-18 07:28:38.887243', '2025-10-18 07:29:13.086850');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspection`
--
INSERT INTO `inspections_inspection` (`id`, `code`, `law`, `district`, `current_status`, `created_at`, `updated_at`, `assigned_to_id`, `created_by_id`) VALUES (1, 'EIA-2025-0001', 'PD-1586', 'LA UNION - 1st District', 'SECTION_IN_PROGRESS', '2025-10-18 03:16:10.168099', '2025-10-18 04:17:47.495575', 2, 3);
INSERT INTO `inspections_inspection` (`id`, `code`, `law`, `district`, `current_status`, `created_at`, `updated_at`, `assigned_to_id`, `created_by_id`) VALUES (2, 'EIA-2025-0002', 'PD-1586', 'LA UNION - 1st District', 'MONITORING_ASSIGNED', '2025-10-18 08:20:59.086557', '2025-10-18 08:41:54.138387', 5, 3);

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspection_establishments`
--
INSERT INTO `inspections_inspection_establishments` (`id`, `inspection_id`, `establishment_id`) VALUES (1, 1, 1);
INSERT INTO `inspections_inspection_establishments` (`id`, `inspection_id`, `establishment_id`) VALUES (2, 2, 2);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspectiondocument`
--

--
-- Table structure for table `inspections_inspectionform`
--
DROP TABLE IF EXISTS `inspections_inspectionform`;
CREATE TABLE `inspections_inspectionform` (
  `inspection_id` bigint(20) NOT NULL,
  `scheduled_at` datetime(6) DEFAULT NULL,
  `checklist` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`checklist`)),
  `findings_summary` longtext NOT NULL,
  `compliance_decision` varchar(30) NOT NULL,
  `violations_found` longtext NOT NULL,
  `compliance_plan` longtext NOT NULL,
  `compliance_deadline` date DEFAULT NULL,
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
INSERT INTO `inspections_inspectionform` (`inspection_id`, `scheduled_at`, `checklist`, `findings_summary`, `compliance_decision`, `violations_found`, `compliance_plan`, `compliance_deadline`, `created_at`, `updated_at`, `inspected_by_id`) VALUES (1, NULL, '{}', '', 'PENDING', '', '', NULL, '2025-10-18 03:16:10.372279', '2025-10-18 03:16:10.372322', NULL);
INSERT INTO `inspections_inspectionform` (`inspection_id`, `scheduled_at`, `checklist`, `findings_summary`, `compliance_decision`, `violations_found`, `compliance_plan`, `compliance_deadline`, `created_at`, `updated_at`, `inspected_by_id`) VALUES (2, NULL, '{}', '', 'PENDING', '', '', NULL, '2025-10-18 08:21:01.014093', '2025-10-18 08:21:01.014206', NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspectionhistory`
--
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (1, 'CREATED', 'SECTION_ASSIGNED', NULL, NULL, 'Inspection created and assigned to Section Chief', '2025-10-18 03:16:10.431514', NULL, 3, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (2, 'SECTION_ASSIGNED', 'SECTION_IN_PROGRESS', 'PD-1586', 'PD-1586,RA-8749,RA-9275', 'Moved to My Inspections', '2025-10-18 04:17:47.651848', 2, 2, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (3, 'CREATED', 'SECTION_ASSIGNED', NULL, NULL, 'Inspection created and assigned to Section Chief', '2025-10-18 08:21:01.295061', NULL, 3, 2);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (4, 'SECTION_ASSIGNED', 'UNIT_ASSIGNED', 'PD-1586', 'PD-1586,RA-8749,RA-9275', 'Forwarded to next level', '2025-10-18 08:22:04.711671', 4, 2, 2);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `law`, `section`, `remarks`, `created_at`, `assigned_to_id`, `changed_by_id`, `inspection_id`) VALUES (5, 'UNIT_ASSIGNED', 'MONITORING_ASSIGNED', 'PD-1586', 'PD-1586', 'Forwarded to next level', '2025-10-18 08:42:05.380656', 5, 4, 2);

--
-- Table structure for table `notifications_notification`
--
DROP TABLE IF EXISTS `notifications_notification`;
CREATE TABLE `notifications_notification` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `notification_type` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` longtext NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `recipient_id` bigint(20) NOT NULL,
  `sender_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifi_recipient_id_d055f3f0_fk_users_use` (`recipient_id`),
  KEY `notifications_notification_sender_id_feea9ca3_fk_users_user_id` (`sender_id`),
  CONSTRAINT `notifications_notifi_recipient_id_d055f3f0_fk_users_use` FOREIGN KEY (`recipient_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `notifications_notification_sender_id_feea9ca3_fk_users_user_id` FOREIGN KEY (`sender_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications_notification`
--
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (1, 'new_user', 'New Division Chief Created', 'A new Division Chief (jerichourbano.01.01.04@gmail.com) has been created.', 0, '2025-10-18 02:27:49.819570', 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (2, 'new_establishment', 'New Establishment Created', 'A new establishment "SAINT LOUIS COLLEGE" has been created by 22101222@slc-sflu.edu.ph.', 0, '2025-10-18 02:49:31.346903', 1, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (3, 'new_establishment', 'New Establishment Created', 'A new establishment "SAINT LOUIS COLLEGE" has been created by 22101222@slc-sflu.edu.ph.', 0, '2025-10-18 02:49:31.433691', 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (4, 'new_user', 'New Division Chief Created', 'A new Division Chief (jerichourbano.01.01.04@gmail.com) has been created.', 0, '2025-10-18 03:00:39.669992', 3, 3);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (5, 'new_inspection', 'New Inspection Assignment', 'You have been assigned inspection EIA-2025-0001 for SAINT LOUIS COLLEGE under PD-1586. Please review and take action.', 0, '2025-10-18 03:16:10.516690', 2, 3);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (6, 'new_establishment', 'New Establishment Created', 'A new establishment "COCA-COLA DISTRIBUTION" has been created by 22101222@slc-sflu.edu.ph.', 0, '2025-10-18 07:28:39.445546', 1, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (7, 'new_establishment', 'New Establishment Created', 'A new establishment "COCA-COLA DISTRIBUTION" has been created by 22101222@slc-sflu.edu.ph.', 0, '2025-10-18 07:28:39.497342', 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (8, 'new_establishment', 'New Establishment Created', 'A new establishment "COCA-COLA DISTRIBUTION" has been created by 22101222@slc-sflu.edu.ph.', 0, '2025-10-18 07:28:39.525194', 3, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (9, 'new_user', 'New Unit Head Created', 'A new Unit Head (echo.010104@gmail.com) created for section: PD-1586.', 0, '2025-10-18 08:12:21.722730', 3, 4);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (10, 'new_inspection', 'New Inspection Assignment', 'You have been assigned inspection EIA-2025-0002 for COCA-COLA DISTRIBUTION under PD-1586. Please review and take action.', 0, '2025-10-18 08:21:01.522114', 2, 3);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (11, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (emee46990@gmail.com) created for section: PD-1586.', 0, '2025-10-18 08:25:52.708462', 3, 5);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (12, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (emee46990@gmail.com) created in your section: PD-1586.', 0, '2025-10-18 08:25:52.721633', 4, 5);

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
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_config_systemconfiguration`
--
INSERT INTO `system_config_systemconfiguration` (`id`, `email_host`, `email_port`, `email_use_tls`, `email_host_user`, `email_host_password`, `default_from_email`, `email_from_name`, `access_token_lifetime_minutes`, `refresh_token_lifetime_days`, `rotate_refresh_tokens`, `blacklist_after_rotation`, `backup_custom_path`, `created_at`, `updated_at`, `is_active`) VALUES (1, 'smtp.gmail.com', 587, 1, 'jerichourbano.01.01.04@gmail.com', 'pkfn htuz duyo nben', 'jerichourbano.01.01.04@gmail.com', 'Integrated Establishment Regulatory Management System', 60, 1, 1, 1, 'backups', '2025-10-18 02:03:04.529014', '2025-10-18 02:21:49.251579', 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist_blacklistedtoken`
--
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (1, '2025-10-18 02:33:48.409176', 3);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (2, '2025-10-18 02:38:56.956510', 5);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (3, '2025-10-18 03:13:20.108727', 1);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (5, '2025-10-18 03:15:26.878088', 10);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (7, '2025-10-18 03:39:32.733786', 6);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (8, '2025-10-18 04:18:42.882572', 9);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (9, '2025-10-18 04:43:39.338425', 13);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (10, '2025-10-18 04:43:39.552027', 15);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (11, '2025-10-18 05:19:09.167125', 14);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (12, '2025-10-18 05:43:54.080175', 16);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (13, '2025-10-18 06:19:11.626458', 17);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (14, '2025-10-18 06:44:00.085136', 18);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (15, '2025-10-18 07:19:17.795338', 19);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (16, '2025-10-18 08:20:23.597702', 26);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (17, '2025-10-18 08:29:42.877762', 29);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (18, '2025-10-18 08:34:09.579119', 22);

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
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist_outstandingtoken`
--
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDgzOTk4MiwiaWF0IjoxNzYwNzUzNTgyLCJqdGkiOiJmZmE3NGNiYTM1MjE0MmRmYTc4YzI0MWViZDc4Y2FhYyIsInVzZXJfaWQiOiIxIn0.GCyUEOqlASdnMIV_ab0CvEJfdZXFkRP2i23V68dgNBw', '2025-10-18 02:13:02.667077', '2025-10-19 02:13:02', 1, 'ffa74cba352142dfa78c241ebd78caac');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0MDg2OSwiaWF0IjoxNzYwNzU0NDY5LCJqdGkiOiI3YTM0NGY2YmMwYTI0ZDQxYTUwYjI0MmZiMzJiMzZkMCIsInVzZXJfaWQiOiIyIn0._Yl0z1JvjXZXCNh611NhXZhhN5I5-HW59scPa4qIF9Q', '2025-10-18 02:27:49.828049', '2025-10-19 02:27:49', 2, '7a344f6bc0a24d41a50b242fb32b36d0');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0MTE5NSwiaWF0IjoxNzYwNzU0Nzk1LCJqdGkiOiI5YTlkMTYyNDc0MGI0N2Q5YTM5N2FiNzMzNWU1OTk5MCIsInVzZXJfaWQiOiIyIn0.Ra-5bS4_P-nd5d5YgPjnVLcKsN1k2FRtcgrJbDJPXrE', '2025-10-18 02:33:15.671875', '2025-10-19 02:33:15', 2, '9a9d1624740b47d9a397ab7335e59990');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0MTI4NSwiaWF0IjoxNzYwNzU0ODg1LCJqdGkiOiJkNjVhNTk4OTQzN2Q0NmZiOGU3MDZkNDcwYmE4MzNiNyIsInVzZXJfaWQiOiIyIn0.uGjq2NZ-dwbLyM70zJq6KOJU6aN8Pg1Y7x1Cc4hZ5I4', '2025-10-18 02:34:45.974843', '2025-10-19 02:34:45', 2, 'd65a5989437d46fb8e706d470ba833b7');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0MTUyMiwiaWF0IjoxNzYwNzU1MTIyLCJqdGkiOiJiZTQ1NjdjODJiZWU0NWVlOGEyZWM2Mzc1ZjBjZDk0NSIsInVzZXJfaWQiOiIyIn0.oHrq8eviQOwcjoT8Ae5b8LXKTveXRLzEAHdbf2uV8wc', '2025-10-18 02:38:42.302890', '2025-10-19 02:38:42', 2, 'be4567c82bee45ee8a2ec6375f0cd945');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0MTU0OSwiaWF0IjoxNzYwNzU1MTQ5LCJqdGkiOiJiZmNjM2Q3NWZhMWI0NjAwOTk3ODQwMjc2NzdmNjEwNCIsInVzZXJfaWQiOiIyIn0.1PLUZSU7iK3Hq_Bhe8lX_ooWPICsKxziVRpz_VFOEUA', '2025-10-18 02:39:09.941144', '2025-10-19 02:39:09', 2, 'bfcc3d75fa1b460099784027677f6104');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0MjgzOSwiaWF0IjoxNzYwNzU2NDM5LCJqdGkiOiJkY2E4Y2ZhNGNiNGM0NTIzYWViNWQ4YWM1OTFjZTM3MSIsInVzZXJfaWQiOiIzIn0.iPo9M0FvID3Yn8RdeRD0ClOSjb6EhGa3iEkWec8Kj9U', '2025-10-18 03:00:39.700763', '2025-10-19 03:00:39', 3, 'dca8cfa4cb4c4523aeb5d8ac591ce371');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0MzYwMCwiaWF0IjoxNzYwNzU3MjAwLCJqdGkiOiJkMmE1ZTg3YjE4NjA0ZWM2OWNiY2IyMDFiNzAxNjgyNyIsInVzZXJfaWQiOiIxIn0.mFQNyC9DLcU64TVTdivhHZOZHALhg0OvPg_VCYQy9oQ', '2025-10-18 03:13:20.078367', '2025-10-19 03:13:20', 1, 'd2a5e87b18604ec69cbcb201b7016827');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0MzYwMCwiaWF0IjoxNzYwNzU3MjAwLCJqdGkiOiJlZGQzZDUyMTY2MTI0YWI4OWUwNzM3NzJjOGQxYWQzYyIsInVzZXJfaWQiOiIxIn0.w3OKYymTkc1zeEG2nW2RFcWl5HMVgUqDI6AvN1KwlqE', '2025-10-18 03:13:20.075280', '2025-10-19 03:13:20', 1, 'edd3d52166124ab89e073772c8d1ad3c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0MzcwNiwiaWF0IjoxNzYwNzU3MzA2LCJqdGkiOiJkN2NkYTE4MTAwOGM0NmM5OGQ0NmU1M2FhZmQ3NTcwMiIsInVzZXJfaWQiOiIzIn0.oDoHK0CoMerXc7a80vdQH0iw8mVOt7FJ0FwM-rj___w', '2025-10-18 03:15:06.484901', '2025-10-19 03:15:06', 3, 'd7cda181008c46c98d46e53aafd75702');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0Mzc0NSwiaWF0IjoxNzYwNzU3MzQ1LCJqdGkiOiIzYWQwMWU2ZDZhOWE0ZDgxODQxYmVkOTNhMzVhNTExNiIsInVzZXJfaWQiOiIzIn0.8UidoZ-_JlmsgbduVkkGslPCBogJqFz8mVhv2ZpjJB4', '2025-10-18 03:15:45.229689', '2025-10-19 03:15:45', 3, '3ad01e6d6a9a4d81841bed93a35a5116');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0NTE3MiwiaWF0IjoxNzYwNzU4NzcyLCJqdGkiOiJmNGRjNjFmZjg3ZWU0YzZiYjdjN2E5MjBiYzU0ZDVjZSIsInVzZXJfaWQiOiIyIn0.65fZ-U4-qB6vDy26sguMsjLrWE9ZGA3cG46WXcUmLFg', '2025-10-18 03:39:32.688549', '2025-10-19 03:39:32', 2, 'f4dc61ff87ee4c6bb7c7a920bc54d5ce');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (13, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0NTE3MiwiaWF0IjoxNzYwNzU4NzcyLCJqdGkiOiJkZGVmZDM2YzM4ZGM0MGM1OTNkNjI2N2E4MWNkNDkwNSIsInVzZXJfaWQiOiIyIn0.PotGj157oZhB18MlNMGJwQLwwYCHmW2YzrPwj210-GY', '2025-10-18 03:39:32.683513', '2025-10-19 03:39:32', 2, 'ddefd36c38dc40c593d6267a81cd4905');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0NzUyMiwiaWF0IjoxNzYwNzYxMTIyLCJqdGkiOiI0YTg5MzQxZDRmNDM0YTZiYWE5YjIyOWJiYjRkOWVmYSIsInVzZXJfaWQiOiIxIn0.I4quHxNpZito6w5Wbucr4ApGe5nC05K0tzuQab--Ldg', '2025-10-18 04:18:42.856401', '2025-10-19 04:18:42', 1, '4a89341d4f434a6baa9b229bbb4d9efa');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0OTAxOSwiaWF0IjoxNzYwNzYyNjE5LCJqdGkiOiJkMzExOWRmYzIyMWQ0YjJjOWRhMGE3NDljNzMwYWJkYyIsInVzZXJfaWQiOiIyIn0.TMRhi0gHOsXAvXtjqFtIkA8CiDyjf9TBD5bvA8FGnbk', '2025-10-18 04:43:39.173435', '2025-10-19 04:43:39', 2, 'd3119dfc221d4b2c9da0a749c730abdc');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (16, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg0OTAxOSwiaWF0IjoxNzYwNzYyNjE5LCJqdGkiOiI2MDg0YjUxZjQyMjQ0N2I5YmI0ZDYxYTAyNGUwYjY4MiIsInVzZXJfaWQiOiIyIn0.qtLL8ZiafhK8Q2udL9UlLSJMNRQo8Hsc9yzLZZ2UlYI', '2025-10-18 04:43:39.471907', '2025-10-19 04:43:39', 2, '6084b51f422447b9bb4d61a024e0b682');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (17, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg1MTE0OSwiaWF0IjoxNzYwNzY0NzQ5LCJqdGkiOiI1YTJmYmMwMGVlNzE0NzgyOWMyZDZmZjM5YzY0YWExOCIsInVzZXJfaWQiOiIxIn0.4yV_iN2-CaFq6tZHbXJDvOIkagVnXthwf0J1KbWdnQs', '2025-10-18 05:19:09.141490', '2025-10-19 05:19:09', 1, '5a2fbc00ee7147829c2d6ff39c64aa18');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (18, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg1MjYzNCwiaWF0IjoxNzYwNzY2MjM0LCJqdGkiOiI5MjdiM2U5ZGNmYWM0MDg4OGRkYjU5ZGVkMDViMTVmZiIsInVzZXJfaWQiOiIyIn0.PJmRFICVQdhiUWXkJGvS29SBKX0KboYj4yZXvZqiELY', '2025-10-18 05:43:54.060145', '2025-10-19 05:43:54', 2, '927b3e9dcfac40888ddb59ded05b15ff');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (19, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg1NDc1MSwiaWF0IjoxNzYwNzY4MzUxLCJqdGkiOiIxMDVkMjA0N2ViYzE0ZTNkOGNkYTgyYzU4NjI1OTE4ZCIsInVzZXJfaWQiOiIxIn0.B1T5VqXvgdzLOsvBDUbux5AMKmmTrZIng_4bKWiEFL8', '2025-10-18 06:19:11.602551', '2025-10-19 06:19:11', 1, '105d2047ebc14e3d8cda82c58625918d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (20, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg1NjI0MCwiaWF0IjoxNzYwNzY5ODQwLCJqdGkiOiI1Zjk3NGQ2MmExNDU0MWM4OGI5MDE4ZjE5ZWZkYTI1OSIsInVzZXJfaWQiOiIyIn0.bcVBMZPIQ6kG0r6wbrNgElj8pWlcQKc4-chhiJV5xP0', '2025-10-18 06:44:00.062371', '2025-10-19 06:44:00', 2, '5f974d62a14541c88b9018f19efda259');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (21, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg1ODM1NywiaWF0IjoxNzYwNzcxOTU3LCJqdGkiOiI5YzQ5NTQzMmYxODI0M2M5YmIzYjNlOGI3NTQxYWMxZCIsInVzZXJfaWQiOiIxIn0.EuXHRcDrvf7KM5ee_iK3PpdvGtC83pSLQ7ge1m6wGGg', '2025-10-18 07:19:17.758881', '2025-10-19 07:19:17', 1, '9c495432f18243c9bb3b3e8b7541ac1d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (22, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg1OTI0NSwiaWF0IjoxNzYwNzcyODQ1LCJqdGkiOiIyZGZhYTE1Mjk0OTg0NjhkOTFjODMxMjJkODM1MWNmMCIsInVzZXJfaWQiOiIxIn0.ZwjJ7tJicprwWrJiOWSLQ01KvZm8p2BU9fGiPatq1Ow', '2025-10-18 07:34:05.551660', '2025-10-19 07:34:05', 1, '2dfaa1529498468d91c83122d8351cf0');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (23, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg2MTU0MSwiaWF0IjoxNzYwNzc1MTQxLCJqdGkiOiJkNjAwYjQzOTY4MDg0YmVmODYyOGFlZmZkNDcwN2EzZCIsInVzZXJfaWQiOiI0In0.jl_PPUwjI5GQOEGtqgIUUC6WD6YpqV1K289oSUAvIcg', '2025-10-18 08:12:21.786023', '2025-10-19 08:12:21', 4, 'd600b43968084bef8628aeffd4707a3d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (24, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg2MTc1MywiaWF0IjoxNzYwNzc1MzUzLCJqdGkiOiJmNGI2MTc1YWM0YTE0MjVkODlhZDFhNWUzN2Q4ZTY0NSIsInVzZXJfaWQiOiIzIn0.C25XWBlV3ejb_JOcczJKa9HewIMsqLznJYRwyGxeUjE', '2025-10-18 08:15:53.003263', '2025-10-19 08:15:53', 3, 'f4b6175ac4a1425d89ad1a5e37d8e645');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (25, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg2MTgzNCwiaWF0IjoxNzYwNzc1NDM0LCJqdGkiOiIzM2YwOTI3ZDQyMDQ0MzViYjFiODQwMTY3NDg0ZTFlNCIsInVzZXJfaWQiOiIyIn0.Nn6YcnBlO6Cg8eD2dQmAwhPMKxsEVlQwCc6HRjxdFIg', '2025-10-18 08:17:14.537881', '2025-10-19 08:17:14', 2, '33f0927d4204435bb1b840167484e1e4');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (26, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg2MjAwNSwiaWF0IjoxNzYwNzc1NjA1LCJqdGkiOiJiOWVkMGRiOTAyNWU0NDQ3YTcxNzIwMWM4N2I0ZTIwNSIsInVzZXJfaWQiOiI0In0.2QVcJn22owt1C4zwMJKMyT--PvNySNGCAaCHyC8MoUM', '2025-10-18 08:20:05.299140', '2025-10-19 08:20:05', 4, 'b9ed0db9025e4447a717201c87b4e205');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (27, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg2MjAzOSwiaWF0IjoxNzYwNzc1NjM5LCJqdGkiOiI2MzIzMDE3ZGYyMGM0NGIwOWY4MjgzMDBmYmJlZjI4YiIsInVzZXJfaWQiOiI0In0.tJnkm53RAC2rxdTqrLwn04JLQgFgqISCfgh-NosBR8c', '2025-10-18 08:20:39.020286', '2025-10-19 08:20:39', 4, '6323017df20c44b09f828300fbbef28b');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (28, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg2MjM1MiwiaWF0IjoxNzYwNzc1OTUyLCJqdGkiOiI2OGFiZTVjNTcxNDY0MDk4YmQ2ZThkODczMWJiY2FlOCIsInVzZXJfaWQiOiI1In0.HrtWJMgzPT8dhfsncP-0Oe9WvOHG9J5CBLB1O3hvqg4', '2025-10-18 08:25:52.725969', '2025-10-19 08:25:52', 5, '68abe5c571464098bd6e8d8731bbcae8');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg2MjU1NiwiaWF0IjoxNzYwNzc2MTU2LCJqdGkiOiJjMjAzMjYwODA2ZmU0YTJjYjMzZjZjNzAxZjA0NWQ3MSIsInVzZXJfaWQiOiI1In0.5ZYWnHKRqRx4ZKKTTq55gv20PyrHSyDEVMjbM7q5_oE', '2025-10-18 08:29:16.129639', '2025-10-19 08:29:16', 5, 'c203260806fe4a2cb33f6c701f045d71');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (30, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg2MjYwMCwiaWF0IjoxNzYwNzc2MjAwLCJqdGkiOiJmNTAwNTkxMzdkOTU0MDkwYmU2ODA2ODQwNjdlY2EyMyIsInVzZXJfaWQiOiI1In0.fbfasKVKhaVBwjbhNZbDrnj78GVIZabceD6hNJHbQVM', '2025-10-18 08:30:00.398103', '2025-10-19 08:30:00', 5, 'f50059137d954090be680684067eca23');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (31, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg2Mjg0OSwiaWF0IjoxNzYwNzc2NDQ5LCJqdGkiOiJiYTEyYjA2MjU0MDk0NjgxYTUyMDhhM2I2YjQxOTNmZCIsInVzZXJfaWQiOiIxIn0.u4t57D_MFitXhf5Mdwqk2hyVG-GBoH1PYnOwTktFROg', '2025-10-18 08:34:09.551940', '2025-10-19 08:34:09', 1, 'ba12b06254094681a5208a3b6b4193fd');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (32, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MDg2Mjg0OSwiaWF0IjoxNzYwNzc2NDQ5LCJqdGkiOiJmNjIzM2NhY2QxY2U0MzUzOTIyOTAwOTJhODMxMDFmZSIsInVzZXJfaWQiOiIxIn0._IiSOZxDmKpOOMZ4L3w5k411oxmSaTny6YeYmqN5Ed8', '2025-10-18 08:34:09.548587', '2025-10-19 08:34:09', 1, 'f6233cacd1ce435392290092a83101fe');

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
  `district` varchar(100) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users_user`
--
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (1, 'pbkdf2_sha256$600000$yLPT3TUiUD9gLb9JhBA7sI$3Hpv9mfnjud2AcLi630uJk+UPgOlxN+Ubc7AkE5b6Bo=', '2025-10-18 02:12:49.614551', 1, 'admin@example.com', 'Administrator', '', '', 'Admin', NULL, NULL, 1, 1, '2025-10-18 02:03:40.479349', '2025-10-18 02:03:41.304942', 0, 0, 0, '2025-10-18 02:34:18.332144', NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (2, 'pbkdf2_sha256$600000$w8oPJTkcBt5wqNDe73q0in$pytIRLPlK/zPjb89PsLQ466D4dqRzpBjydjU2WJbeyE=', '2025-10-18 08:17:14.523462', 0, '22101222@slc-sflu.edu.ph', 'COMBINED', 'EMB', 'SECTION', 'Section Chief', 'PD-1586,RA-8749,RA-9275', NULL, 0, 1, '2025-10-18 02:26:36.632819', '2025-10-18 07:35:33.581284', 0, 0, 0, '2025-10-18 08:17:04.369351', NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (3, 'pbkdf2_sha256$600000$qnyCm9EiBi46jhz99TlGrP$2Ivx7BzRA15xOaJFYQZbJjptyiZxKNj03MJEdljdPrQ=', '2025-10-18 08:15:52.991446', 0, 'jerichourbano.01.01.04@gmail.com', 'DVISION', 'EMB', 'CHIEF', 'Division Chief', NULL, NULL, 0, 1, '2025-10-18 02:59:09.527188', '2025-10-18 07:57:46.864871', 0, 0, 0, NULL, NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (4, 'pbkdf2_sha256$600000$3rAkzfdUpBgLA8jQkkjBdh$HhTLNSgSmT9ISzDWI0UEhho7zNVCImHaMNbZcKxyL2s=', '2025-10-18 08:20:38.990293', 0, 'echo.010104@gmail.com', 'EIA', 'EMB', 'UNIT', 'Unit Head', 'PD-1586', NULL, 0, 1, '2025-10-18 08:11:18.292036', '2025-10-18 08:20:23.478012', 0, 0, 0, NULL, NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (5, 'pbkdf2_sha256$600000$IsPpqzI69fDcYzjLFKaCTd$0rXWPB/e0CYmhWhSAxCNK1op+9vWqHUWAguxoavFUy4=', '2025-10-18 08:30:00.391444', 0, 'emee46990@gmail.com', 'EIA', 'EMB', 'MONITORING', 'Monitoring Personnel', 'PD-1586', 'La Union - 1st District', 0, 1, '2025-10-18 08:25:35.348278', '2025-10-18 08:34:10.805491', 0, 0, 0, NULL, NULL, 0);

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
