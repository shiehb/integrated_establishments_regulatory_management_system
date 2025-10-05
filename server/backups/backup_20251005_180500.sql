-- MySQL dump created by Python
-- Database: db_ierms
-- Server: 127.0.0.1:3306
-- Generated: 2025-10-05 18:05:01
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
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_activitylog`
--
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (1, 'create', 'New user account created: admin@example.com with auto-generated password', NULL, '', '2025-10-04 16:46:02.275464', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (2, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-04 16:46:35.570286', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (3, 'login', 'User admin@example.com logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 16:46:35.572610', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (4, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-04 16:47:11.444909', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (5, 'create', 'New user account created: jerichourbano.01.01.04@gmail.com with auto-generated password', NULL, '', '2025-10-04 17:30:46.516831', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (6, 'create', 'New user registered: jerichourbano.01.01.04@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 17:30:49.396443', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (7, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 17:33:36.456120', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (8, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 17:33:42.469190', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (9, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 17:35:46.883242', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (10, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-04 17:36:53.041235', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (11, 'update', 'Password reset via OTP for jerichourbano.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 17:36:53.059609', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (12, 'create', 'Created establishment: LORMA HOSPITAL', NULL, '', '2025-10-04 17:38:44.465248', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (13, 'update', 'Updated establishment: LORMA HOSPITAL', NULL, '', '2025-10-04 17:38:44.501146', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (14, 'create', 'New user account created: 22101222@slc-sflu.edu.ph with auto-generated password', NULL, '', '2025-10-04 17:39:47.911484', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (15, 'create', 'New user registered: 22101222@slc-sflu.edu.ph with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 17:39:50.839132', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (16, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-04 17:40:44.906725', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (17, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-04 17:41:15.716759', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (18, 'update', 'First-time password set for 22101222@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 17:41:15.719910', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (19, 'create', 'Inspection EIA-2025-0001 created for establishments: No establishments with law PD-1586', NULL, '', '2025-10-04 17:41:43.494160', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (20, 'status_change', 'Inspection EIA-2025-0001 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-04 17:41:43.523664', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (21, 'create', 'Inspection EIA-2025-0002 created for establishments: No establishments with law PD-1586', NULL, '', '2025-10-04 17:41:48.542630', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (22, 'status_change', 'Inspection EIA-2025-0002 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-04 17:41:48.570092', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (23, 'create', 'Inspection EIA-2025-0003 created for establishments: No establishments with law PD-1586', NULL, '', '2025-10-04 17:42:38.064632', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (24, 'status_change', 'Inspection EIA-2025-0003 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-04 17:42:38.087709', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (25, 'create', 'Inspection EIA-2025-0004 created for establishments: No establishments with law PD-1586', NULL, '', '2025-10-04 17:43:53.378101', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (26, 'status_change', 'Inspection EIA-2025-0004 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-04 17:43:53.404500', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (27, 'create', 'Inspection EIA-2025-0005 created for establishments: No establishments with law PD-1586', NULL, '', '2025-10-04 17:45:15.155540', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (28, 'status_change', 'Inspection EIA-2025-0005 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-04 17:45:15.192322', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (29, 'create', 'Inspection EIA-2025-0006 created for establishments: No establishments with law PD-1586', NULL, '', '2025-10-04 17:55:34.269662', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (30, 'status_change', 'Inspection EIA-2025-0006 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-04 17:55:34.374560', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (31, 'create', 'Inspection EIA-2025-0007 created for establishments: No establishments with law PD-1586', NULL, '', '2025-10-04 17:56:14.622836', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (32, 'status_change', 'Inspection EIA-2025-0007 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-04 17:56:14.661448', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (33, 'create', 'Inspection EIA-2025-0008 created for establishments: No establishments with law PD-1586', NULL, '', '2025-10-04 18:07:21.634971', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (34, 'status_change', 'Inspection EIA-2025-0008 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-04 18:07:21.671832', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (35, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-04 18:09:43.101932', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (36, 'update', 'Updated user: 22101222@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-04 18:09:43.112367', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (37, 'create', 'Inspection TOX-2025-0001 created for establishments: No establishments with law RA-6969', NULL, '', '2025-10-04 18:10:05.810450', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (38, 'status_change', 'Inspection TOX-2025-0001 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-04 18:10:05.837375', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (39, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 01:58:12.345696', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (40, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 01:58:58.703935', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (41, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 02:14:41.129799', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (42, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 02:14:50.538295', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (43, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 02:14:53.700685', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (44, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 02:16:28.550515', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (45, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 02:23:18.137313', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (46, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 02:24:26.661451', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (47, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 02:52:48.280388', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (48, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 02:52:56.934631', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (49, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 02:52:58.178224', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (50, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 02:52:58.392923', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (51, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 02:52:58.753547', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (52, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 02:52:58.992630', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (53, 'create', 'Inspection EIA-2025-0001 created for establishments: No establishments with law PD-1586', NULL, '', '2025-10-05 04:34:01.448865', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (54, 'create', 'Inspection TOX-2025-0002 created for establishments: No establishments with law RA-6969', NULL, '', '2025-10-05 04:34:25.634222', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (55, 'status_change', 'Inspection TOX-2025-0002 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-05 04:34:25.678631', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (56, 'status_change', 'Inspection TOX-2025-0002 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 06:14:06.135317', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (57, 'status_change', 'Inspection TOX-2025-0002 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 06:14:18.196835', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (58, 'status_change', 'Inspection TOX-2025-0002 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 06:36:47.434062', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (59, 'status_change', 'Inspection TOX-2025-0002 status changed from SECTION_ASSIGNED to SECTION_ASSIGNED', NULL, '', '2025-10-05 06:39:06.631723', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (60, 'status_change', 'Inspection TOX-2025-0002 status changed from SECTION_ASSIGNED to SECTION_IN_PROGRESS', NULL, '', '2025-10-05 06:44:39.489956', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (61, 'status_change', 'Inspection TOX-2025-0002 status changed from SECTION_IN_PROGRESS to SECTION_COMPLETED', NULL, '', '2025-10-05 06:58:27.651210', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (62, 'create', 'Inspection TOX-2025-0003 created for establishments: No establishments with law RA-6969', NULL, '', '2025-10-05 07:54:01.909577', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (63, 'create', 'Inspection TOX-2025-0004 created for establishments: No establishments with law RA-6969', NULL, '', '2025-10-05 07:55:48.531158', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (64, 'status_change', 'Inspection TOX-2025-0004 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-05 07:55:48.590570', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (65, 'status_change', 'Inspection TOX-2025-0004 status changed from SECTION_ASSIGNED to SECTION_IN_PROGRESS', NULL, '', '2025-10-05 08:21:46.768334', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (66, 'status_change', 'Inspection TOX-2025-0004 status changed from SECTION_IN_PROGRESS to SECTION_COMPLETED', NULL, '', '2025-10-05 08:21:59.800468', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (67, 'status_change', 'Inspection TOX-2025-0004 status changed from SECTION_COMPLETED to DIVISION_REVIEWED', NULL, '', '2025-10-05 08:21:59.808431', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (68, 'create', 'New user account created: echo.010104@gmail.com with auto-generated password', NULL, '', '2025-10-05 08:27:13.810012', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (69, 'create', 'New user registered: echo.010104@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 08:27:23.499156', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (70, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 08:32:11.634740', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (71, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-05 08:33:40.845969', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (72, 'update', 'Password reset via OTP for echo.010104@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 08:33:40.848876', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (73, 'create', 'Inspection WASTE-2025-0001 created for establishments: No establishments with law RA-9003', NULL, '', '2025-10-05 08:35:10.999960', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (74, 'status_change', 'Inspection WASTE-2025-0001 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-05 08:35:11.047176', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (75, 'status_change', 'Inspection WASTE-2025-0001 status changed from SECTION_ASSIGNED to SECTION_IN_PROGRESS', NULL, '', '2025-10-05 08:35:36.661508', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (76, 'status_change', 'Inspection WASTE-2025-0001 status changed from SECTION_IN_PROGRESS to SECTION_COMPLETED', NULL, '', '2025-10-05 08:35:43.167475', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (77, 'status_change', 'Inspection WASTE-2025-0001 status changed from SECTION_COMPLETED to DIVISION_REVIEWED', NULL, '', '2025-10-05 08:35:43.192262', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (78, 'create', 'New user account created: emee46990@gmail.com with auto-generated password', NULL, '', '2025-10-05 09:19:52.515901', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (79, 'create', 'New user registered: emee46990@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 09:19:56.359374', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (80, 'update', 'User account updated: emee46990@gmail.com', NULL, '', '2025-10-05 09:20:22.228459', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (81, 'update', 'User account updated: emee46990@gmail.com', NULL, '', '2025-10-05 09:20:40.985567', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (82, 'update', 'First-time password set for emee46990@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 09:20:40.988308', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (83, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-05 09:26:32.994330', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (84, 'update', 'Updated user: echo.010104@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 09:26:33.023874', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (85, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-05 09:35:57.044961', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (86, 'update', 'Updated user: echo.010104@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 09:35:57.053954', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (87, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-05 09:36:23.650394', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (88, 'update', 'Assigned district La Union - 1st District to echo.010104@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 09:36:23.657675', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (89, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-05 09:36:27.822018', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (90, 'update', 'Assigned district  to echo.010104@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 09:36:27.826355', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (91, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-05 09:36:58.111562', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (92, 'update', 'Updated user: echo.010104@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 09:36:58.117196', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (93, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-05 09:37:44.381991', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (94, 'update', 'Updated user: 22101222@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 09:37:44.394869', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (95, 'update', 'User account updated: emee46990@gmail.com', NULL, '', '2025-10-05 09:43:56.900603', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (96, 'update', 'Toggled active status for emee46990@gmail.com → False', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 09:43:56.906398', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (97, 'create', 'New user account created: eawsectionchief@example.com with auto-generated password', NULL, '', '2025-10-05 09:44:38.118684', 6);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (98, 'create', 'New user registered: eawsectionchief@example.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 09:44:44.824009', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (99, 'update', 'User account updated: eawsectionchief@example.com', NULL, '', '2025-10-05 09:44:59.122258', 6);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (100, 'update', 'Toggled active status for eawsectionchief@example.com → False', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 09:44:59.129308', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (101, 'update', 'User account updated: emee46990@gmail.com', NULL, '', '2025-10-05 09:45:02.591022', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (102, 'update', 'Toggled active status for emee46990@gmail.com → True', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-05 09:45:02.595464', 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_admin_log`
--
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (1, '2025-10-04 16:47:11.454156', '1', 'admin@example.com (Admin)', 2, '[{"changed": {"fields": ["First name", "Middle name", "Userlevel", "Is first login"]}}]', 8, 1);

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
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (1, 'contenttypes', '0001_initial', '2025-10-04 16:44:02.611829');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (2, 'contenttypes', '0002_remove_content_type_name', '2025-10-04 16:44:02.721354');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (3, 'auth', '0001_initial', '2025-10-04 16:44:03.028122');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (4, 'auth', '0002_alter_permission_name_max_length', '2025-10-04 16:44:03.113302');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (5, 'auth', '0003_alter_user_email_max_length', '2025-10-04 16:44:03.128526');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (6, 'auth', '0004_alter_user_username_opts', '2025-10-04 16:44:03.139012');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (7, 'auth', '0005_alter_user_last_login_null', '2025-10-04 16:44:03.156618');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (8, 'auth', '0006_require_contenttypes_0002', '2025-10-04 16:44:03.164327');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (9, 'auth', '0007_alter_validators_add_error_messages', '2025-10-04 16:44:03.174426');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (10, 'auth', '0008_alter_user_username_max_length', '2025-10-04 16:44:03.184301');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (11, 'auth', '0009_alter_user_last_name_max_length', '2025-10-04 16:44:03.194732');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (12, 'auth', '0010_alter_group_name_max_length', '2025-10-04 16:44:03.225352');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (13, 'auth', '0011_update_proxy_permissions', '2025-10-04 16:44:03.238250');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (14, 'auth', '0012_alter_user_first_name_max_length', '2025-10-04 16:44:03.248197');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (15, 'users', '0001_initial', '2025-10-04 16:44:03.621445');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (16, 'admin', '0001_initial', '2025-10-04 16:44:03.783474');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (17, 'admin', '0002_logentry_remove_auto_add', '2025-10-04 16:44:03.814049');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (18, 'admin', '0003_logentry_add_action_flag_choices', '2025-10-04 16:44:03.874775');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (19, 'audit', '0001_initial', '2025-10-04 16:44:03.908923');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (20, 'audit', '0002_initial', '2025-10-04 16:44:04.047023');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (21, 'establishments', '0001_initial', '2025-10-04 16:44:04.105104');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (22, 'inspections', '0001_initial', '2025-10-04 16:44:04.318699');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (23, 'inspections', '0002_initial', '2025-10-04 16:44:05.636512');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (24, 'notifications', '0001_initial', '2025-10-04 16:44:05.671107');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (25, 'notifications', '0002_initial', '2025-10-04 16:44:05.899754');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (26, 'sessions', '0001_initial', '2025-10-04 16:44:05.963235');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (27, 'system_config', '0001_initial', '2025-10-04 16:44:05.998364');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (28, 'token_blacklist', '0001_initial', '2025-10-04 16:44:06.267804');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (29, 'token_blacklist', '0002_outstandingtoken_jti_hex', '2025-10-04 16:44:06.308724');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (30, 'token_blacklist', '0003_auto_20171017_2007', '2025-10-04 16:44:06.344776');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (31, 'token_blacklist', '0004_auto_20171017_2013', '2025-10-04 16:44:06.456195');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (32, 'token_blacklist', '0005_remove_outstandingtoken_jti', '2025-10-04 16:44:06.514161');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (33, 'token_blacklist', '0006_auto_20171017_2113', '2025-10-04 16:44:06.580695');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (34, 'token_blacklist', '0007_auto_20171017_2214', '2025-10-04 16:44:07.344382');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (35, 'token_blacklist', '0008_migrate_to_bigautofield', '2025-10-04 16:44:07.931468');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (36, 'token_blacklist', '0010_fix_migrate_to_bigautofield', '2025-10-04 16:44:07.974404');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (37, 'token_blacklist', '0011_linearizes_history', '2025-10-04 16:44:07.979985');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (38, 'token_blacklist', '0012_alter_outstandingtoken_user', '2025-10-04 16:44:08.016921');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (39, 'token_blacklist', '0013_alter_blacklistedtoken_options_and_more', '2025-10-04 16:44:08.046957');

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
INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES ('7vfoa9ymvuoti18udp13g8vbb742q8kc', '.eJxVjEEOwiAQRe_C2hALZaAu3XsGMswMUjU0Ke3KeHdD0oVu_3vvv1XEfStxb7LGmdVFDer0uyWkp9QO-IH1vmha6rbOSXdFH7Tp28Lyuh7u30HBVnptOKO3Y_KUAzFDMNYFTxTOksRRQOZRAKYg1qXMkGBgbwF4ys4YVJ8vEzc44A:1v55P1:vQDbJts6OZAOn5KwF7w6EXbO_sLPC4QMkAKU2bWhwCQ', '2025-10-18 16:46:35.576414');

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
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `establishments_establishment`
--
INSERT INTO `establishments_establishment` (`id`, `name`, `nature_of_business`, `year_established`, `province`, `city`, `barangay`, `street_building`, `postal_code`, `latitude`, `longitude`, `polygon`, `is_active`, `created_at`, `updated_at`) VALUES (1, 'LORMA HOSPITAL', 'HEALTHCARE/MEDICAL', '2000', 'LA UNION', 'SAN FERNANDO', 'AGTARAP COMPOUND', 'MACARTHUR HIGHWAY', '2500', '16.631408', '120.318117', NULL, 1, '2025-10-04 17:38:44.455971', '2025-10-04 17:38:44.488603');

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
  KEY `inspections_current_6b932e_idx` (`current_status`),
  KEY `inspections_assigne_306954_idx` (`assigned_to_id`),
  KEY `inspections_created_282730_idx` (`created_by_id`),
  KEY `inspections_law_e1febf_idx` (`law`),
  CONSTRAINT `inspections_inspection_assigned_to_id_ad860202_fk_users_user_id` FOREIGN KEY (`assigned_to_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspection_created_by_id_23948284_fk_users_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspection`
--
INSERT INTO `inspections_inspection` (`id`, `code`, `law`, `district`, `current_status`, `created_at`, `updated_at`, `assigned_to_id`, `created_by_id`) VALUES (9, 'TOX-2025-0001', 'RA-6969', 'LA UNION - 1st District', 'UNIT_COMPLETED', '2025-10-04 18:10:05.805927', '2025-10-05 02:52:58.986820', 3, 2);
INSERT INTO `inspections_inspection` (`id`, `code`, `law`, `district`, `current_status`, `created_at`, `updated_at`, `assigned_to_id`, `created_by_id`) VALUES (10, 'EIA-2025-0001', 'PD-1586', 'LA UNION - 1st District', 'CREATED', '2025-10-05 04:34:01.436248', '2025-10-05 04:34:01.479257', NULL, 1);
INSERT INTO `inspections_inspection` (`id`, `code`, `law`, `district`, `current_status`, `created_at`, `updated_at`, `assigned_to_id`, `created_by_id`) VALUES (11, 'TOX-2025-0002', 'RA-6969', 'LA UNION - 1st District', 'SECTION_COMPLETED', '2025-10-05 04:34:25.622212', '2025-10-05 06:58:27.625362', 3, 2);
INSERT INTO `inspections_inspection` (`id`, `code`, `law`, `district`, `current_status`, `created_at`, `updated_at`, `assigned_to_id`, `created_by_id`) VALUES (12, 'TOX-2025-0003', 'RA-6969', 'LA UNION - 1st District', 'CREATED', '2025-10-05 07:54:01.905541', '2025-10-05 07:54:01.921032', NULL, 3);
INSERT INTO `inspections_inspection` (`id`, `code`, `law`, `district`, `current_status`, `created_at`, `updated_at`, `assigned_to_id`, `created_by_id`) VALUES (13, 'TOX-2025-0004', 'RA-6969', 'LA UNION - 1st District', 'DIVISION_REVIEWED', '2025-10-05 07:55:48.517853', '2025-10-05 08:21:59.803347', 2, 2);
INSERT INTO `inspections_inspection` (`id`, `code`, `law`, `district`, `current_status`, `created_at`, `updated_at`, `assigned_to_id`, `created_by_id`) VALUES (14, 'WASTE-2025-0001', 'RA-9003', 'LA UNION - 1st District', 'DIVISION_REVIEWED', '2025-10-05 08:35:10.987050', '2025-10-05 08:35:43.172985', 2, 2);

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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspection_establishments`
--
INSERT INTO `inspections_inspection_establishments` (`id`, `inspection_id`, `establishment_id`) VALUES (9, 9, 1);
INSERT INTO `inspections_inspection_establishments` (`id`, `inspection_id`, `establishment_id`) VALUES (10, 10, 1);
INSERT INTO `inspections_inspection_establishments` (`id`, `inspection_id`, `establishment_id`) VALUES (11, 11, 1);
INSERT INTO `inspections_inspection_establishments` (`id`, `inspection_id`, `establishment_id`) VALUES (12, 12, 1);
INSERT INTO `inspections_inspection_establishments` (`id`, `inspection_id`, `establishment_id`) VALUES (13, 13, 1);
INSERT INTO `inspections_inspection_establishments` (`id`, `inspection_id`, `establishment_id`) VALUES (14, 14, 1);

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
  `inspection_notes` longtext NOT NULL,
  `checklist` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`checklist`)),
  `findings_summary` longtext NOT NULL,
  `compliance_decision` varchar(30) NOT NULL,
  `violations_found` longtext NOT NULL,
  `compliance_plan` longtext NOT NULL,
  `compliance_deadline` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`inspection_id`),
  CONSTRAINT `inspections_inspecti_inspection_id_04525c09_fk_inspectio` FOREIGN KEY (`inspection_id`) REFERENCES `inspections_inspection` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspectionform`
--
INSERT INTO `inspections_inspectionform` (`inspection_id`, `scheduled_at`, `inspection_notes`, `checklist`, `findings_summary`, `compliance_decision`, `violations_found`, `compliance_plan`, `compliance_deadline`, `created_at`, `updated_at`) VALUES (9, NULL, 'Inspection for Toxic Chemicals Monitoring', '{}', '', 'PENDING', '', '', NULL, '2025-10-04 18:10:05.821667', '2025-10-04 18:10:05.821690');
INSERT INTO `inspections_inspectionform` (`inspection_id`, `scheduled_at`, `inspection_notes`, `checklist`, `findings_summary`, `compliance_decision`, `violations_found`, `compliance_plan`, `compliance_deadline`, `created_at`, `updated_at`) VALUES (10, NULL, 'Inspection for EIA Monitoring', '{}', '', 'PENDING', '', '', NULL, '2025-10-05 04:34:01.486338', '2025-10-05 04:34:01.486384');
INSERT INTO `inspections_inspectionform` (`inspection_id`, `scheduled_at`, `inspection_notes`, `checklist`, `findings_summary`, `compliance_decision`, `violations_found`, `compliance_plan`, `compliance_deadline`, `created_at`, `updated_at`) VALUES (11, NULL, 'Inspection for Toxic Chemicals Monitoring', '{}', '', 'PENDING', '', '', NULL, '2025-10-05 04:34:25.653474', '2025-10-05 04:34:25.653521');
INSERT INTO `inspections_inspectionform` (`inspection_id`, `scheduled_at`, `inspection_notes`, `checklist`, `findings_summary`, `compliance_decision`, `violations_found`, `compliance_plan`, `compliance_deadline`, `created_at`, `updated_at`) VALUES (12, NULL, 'Inspection for Toxic Chemicals Monitoring', '{}', '', 'PENDING', '', '', NULL, '2025-10-05 07:54:01.923955', '2025-10-05 07:54:01.923980');
INSERT INTO `inspections_inspectionform` (`inspection_id`, `scheduled_at`, `inspection_notes`, `checklist`, `findings_summary`, `compliance_decision`, `violations_found`, `compliance_plan`, `compliance_deadline`, `created_at`, `updated_at`) VALUES (13, NULL, 'Inspection for Toxic Chemicals Monitoring', '{}', '', 'PENDING', '', '', NULL, '2025-10-05 07:55:48.547221', '2025-10-05 07:55:48.547264');
INSERT INTO `inspections_inspectionform` (`inspection_id`, `scheduled_at`, `inspection_notes`, `checklist`, `findings_summary`, `compliance_decision`, `violations_found`, `compliance_plan`, `compliance_deadline`, `created_at`, `updated_at`) VALUES (14, NULL, 'Inspection for Solid Waste Management', '{}', '', 'PENDING', '', '', NULL, '2025-10-05 08:35:11.022310', '2025-10-05 08:35:11.022346');

--
-- Table structure for table `inspections_inspectionhistory`
--
DROP TABLE IF EXISTS `inspections_inspectionhistory`;
CREATE TABLE `inspections_inspectionhistory` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `previous_status` varchar(40) DEFAULT NULL,
  `new_status` varchar(40) NOT NULL,
  `remarks` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `changed_by_id` bigint(20) DEFAULT NULL,
  `inspection_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inspections_inspecti_changed_by_id_6b11b0da_fk_users_use` (`changed_by_id`),
  KEY `inspections_inspecti_inspection_id_29f23002_fk_inspectio` (`inspection_id`),
  CONSTRAINT `inspections_inspecti_changed_by_id_6b11b0da_fk_users_use` FOREIGN KEY (`changed_by_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspecti_inspection_id_29f23002_fk_inspectio` FOREIGN KEY (`inspection_id`) REFERENCES `inspections_inspection` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspectionhistory`
--
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (9, 'CREATED', 'SECTION_ASSIGNED', 'Inspection created and assigned to Section Chief', '2025-10-04 18:10:05.835469', 2, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (10, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 01:58:12.341417', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (11, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 01:58:58.701336', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (12, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 02:14:41.123512', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (13, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 02:14:50.533769', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (14, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 02:14:53.696720', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (15, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 02:16:28.545688', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (16, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 02:23:18.134629', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (17, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 02:24:26.658669', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (18, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 02:52:48.276870', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (19, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 02:52:56.932337', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (20, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 02:52:58.175740', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (21, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 02:52:58.390257', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (22, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 02:52:58.750271', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (23, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 02:52:58.990115', 3, 9);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (24, 'CREATED', 'SECTION_ASSIGNED', 'Inspection created and assigned to Section Chief', '2025-10-05 04:34:25.674832', 2, 11);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (25, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 06:14:06.117841', 3, 11);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (26, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 06:14:18.180991', 3, 11);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (27, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 06:36:47.427737', 3, 11);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (28, 'SECTION_ASSIGNED', 'SECTION_ASSIGNED', 'Assigned to self', '2025-10-05 06:39:06.620343', 3, 11);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (29, 'SECTION_ASSIGNED', 'SECTION_IN_PROGRESS', 'Assigned to self', '2025-10-05 06:44:39.461684', 3, 11);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (30, 'SECTION_IN_PROGRESS', 'SECTION_COMPLETED', 'Completed inspection', '2025-10-05 06:58:27.635409', 3, 11);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (31, 'CREATED', 'SECTION_ASSIGNED', 'Inspection created and assigned to Section Chief', '2025-10-05 07:55:48.576968', 2, 13);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (32, 'SECTION_ASSIGNED', 'SECTION_IN_PROGRESS', 'Moved to My Inspections', '2025-10-05 08:21:46.762011', 3, 13);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (33, 'SECTION_IN_PROGRESS', 'SECTION_COMPLETED', 'Completed inspection', '2025-10-05 08:21:59.792630', 3, 13);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (34, 'SECTION_COMPLETED', 'DIVISION_REVIEWED', 'Auto-forwarded to Division Chief for review', '2025-10-05 08:21:59.806057', 3, 13);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (35, 'CREATED', 'SECTION_ASSIGNED', 'Inspection created and assigned to Section Chief', '2025-10-05 08:35:11.043159', 2, 14);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (36, 'SECTION_ASSIGNED', 'SECTION_IN_PROGRESS', 'Moved to My Inspections', '2025-10-05 08:35:36.655676', 4, 14);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (37, 'SECTION_IN_PROGRESS', 'SECTION_COMPLETED', 'Completed inspection', '2025-10-05 08:35:43.162308', 4, 14);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (38, 'SECTION_COMPLETED', 'DIVISION_REVIEWED', 'Auto-forwarded to Division Chief for review', '2025-10-05 08:35:43.184538', 4, 14);

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications_notification`
--
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (1, 'new_user', 'New Division Chief Created', 'A new Division Chief (jerichourbano.01.01.04@gmail.com) has been created.', 0, '2025-10-04 17:30:49.598133', 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (2, 'new_establishment', 'New Establishment Created', 'A new establishment "LORMA HOSPITAL" has been created by jerichourbano.01.01.04@gmail.com.', 0, '2025-10-04 17:38:44.514019', 1, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (3, 'new_establishment', 'New Establishment Created', 'A new establishment "LORMA HOSPITAL" has been created by jerichourbano.01.01.04@gmail.com.', 0, '2025-10-04 17:38:44.524262', 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (4, 'new_user', 'New Section Chief Created', 'A new Section Chief (22101222@slc-sflu.edu.ph) created for section: PD-1586,RA-8749,RA-9275.', 0, '2025-10-04 17:39:50.865161', 2, 3);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (5, 'new_user', 'New Section Chief Created', 'A new Section Chief (echo.010104@gmail.com) created for section: RA-9003.', 0, '2025-10-05 08:27:23.530556', 2, 4);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (6, 'new_user', 'New Section Chief Created', 'A new Section Chief (emee46990@gmail.com) created for section: PD-1586,RA-8749,RA-9275.', 0, '2025-10-05 09:19:56.370009', 2, 5);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (7, 'new_user', 'New Section Chief Created', 'A new Section Chief (eawsectionchief@example.com) created for section: PD-1586,RA-8749,RA-9275.', 0, '2025-10-05 09:44:44.853025', 2, 6);

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
  `access_token_lifetime_minutes` int(11) NOT NULL,
  `refresh_token_lifetime_days` int(11) NOT NULL,
  `rotate_refresh_tokens` tinyint(1) NOT NULL,
  `blacklist_after_rotation` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_config_systemconfiguration`
--
INSERT INTO `system_config_systemconfiguration` (`id`, `email_host`, `email_port`, `email_use_tls`, `email_host_user`, `email_host_password`, `default_from_email`, `access_token_lifetime_minutes`, `refresh_token_lifetime_days`, `rotate_refresh_tokens`, `blacklist_after_rotation`, `created_at`, `updated_at`, `is_active`) VALUES (1, 'smtp.gmail.com', 587, 1, 'jerichourbano.01.01.04@gmail.com', 'pkfn htuz duyo nben', 'jerichourbano.01.01.04@gmail.com', 60, 1, 1, 1, '2025-10-04 16:44:54.634741', '2025-10-05 08:32:11.646489', 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist_blacklistedtoken`
--
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (1, '2025-10-04 16:47:20.965476', 1);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (2, '2025-10-04 16:47:30.484799', 4);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (3, '2025-10-04 17:31:40.598283', 5);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (4, '2025-10-04 17:41:15.748177', 10);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (5, '2025-10-04 18:39:02.727167', 6);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (7, '2025-10-04 18:39:02.877945', 14);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (9, '2025-10-04 18:41:51.557763', 11);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (10, '2025-10-04 19:07:18.589116', 12);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (12, '2025-10-04 19:40:18.616235', 17);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (13, '2025-10-04 19:42:18.593303', 19);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (14, '2025-10-04 20:07:18.577695', 21);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (15, '2025-10-04 20:40:18.623412', 23);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (16, '2025-10-04 20:42:18.583590', 25);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (18, '2025-10-04 21:07:18.601846', 27);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (20, '2025-10-04 21:40:18.582208', 29);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (21, '2025-10-04 21:42:18.590674', 31);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (22, '2025-10-04 22:07:18.738263', 33);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (24, '2025-10-04 22:40:18.637912', 34);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (25, '2025-10-04 22:42:18.675799', 36);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (27, '2025-10-04 23:07:18.582592', 38);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (28, '2025-10-04 23:40:18.596332', 40);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (29, '2025-10-04 23:42:18.584196', 42);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (30, '2025-10-05 00:07:18.608340', 44);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (32, '2025-10-05 00:40:18.707658', 46);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (34, '2025-10-05 00:42:18.589978', 48);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (36, '2025-10-05 01:08:06.597199', 50);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (37, '2025-10-05 01:40:18.698346', 52);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (38, '2025-10-05 01:42:32.824468', 54);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (39, '2025-10-05 01:42:33.103159', 57);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (40, '2025-10-05 02:45:14.404459', 58);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (41, '2025-10-05 02:45:16.170863', 60);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (42, '2025-10-05 02:57:52.974660', 59);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (45, '2025-10-05 03:46:18.605582', 63);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (46, '2025-10-05 03:58:18.569498', 65);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (47, '2025-10-05 05:16:57.087596', 69);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (49, '2025-10-05 05:17:07.712358', 67);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (50, '2025-10-05 05:28:32.934469', 70);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (51, '2025-10-05 06:18:18.580852', 74);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (52, '2025-10-05 06:32:18.748755', 76);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (53, '2025-10-05 06:34:39.228023', 72);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (54, '2025-10-05 07:18:27.925467', 78);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (55, '2025-10-05 07:18:28.350705', 83);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (56, '2025-10-05 07:41:14.496697', 81);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (57, '2025-10-05 07:57:59.550123', 82);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (59, '2025-10-05 08:42:18.605807', 87);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (60, '2025-10-05 08:55:18.629524', 88);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (61, '2025-10-05 09:00:50.072173', 90);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (63, '2025-10-05 09:20:41.047845', 98);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (64, '2025-10-05 09:27:26.582399', 92);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (65, '2025-10-05 09:42:18.613011', 93);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (66, '2025-10-05 09:55:20.861639', 94);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (67, '2025-10-05 10:01:26.992329', 96);

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
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist_outstandingtoken`
--
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY3NzcxNywiaWF0IjoxNzU5NTkxMzE3LCJqdGkiOiI2Y2U3YzZmZmY5M2Q0MmE1YTY3YTE5Zjg3MzVkNmVhYSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.QQB9vP-iAJLMfj3Qt8Cynd4iM8ASTud58Yt2vu78B64', '2025-10-04 16:47:20.890399', '2025-10-05 15:21:57', 1, '6ce7c6fff93d42a5a67a19f8735d6eaa');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4Mjg0MCwiaWF0IjoxNzU5NTk2NDQwLCJqdGkiOiJlOTgxZjIxODlmNWY0YTVhYTIyZjI3NDgyMmFlNjBmYiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.GTybdqsKh26PNhY3PBqE1k2vzdffIQR2mQp7skfMeqk', '2025-10-04 16:47:20.876406', '2025-10-05 16:47:20', 1, 'e981f2189f5f4a5aa22f274822ae60fb');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4Mjg0MCwiaWF0IjoxNzU5NTk2NDQwLCJqdGkiOiI5ZGUwMmU2MWJlMDM0Njg2YTUwZDU0M2Q2ZDI3MDhhYSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.mB8N9YYkzyn7bspl4lGoCmhk8gBB1xbHA_ck09AX394', '2025-10-04 16:47:20.890399', '2025-10-05 16:47:20', 1, '9de02e61be034686a50d543d6d2708aa');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4Mjg2MiwiaWF0IjoxNzU5NTk2NDYyLCJqdGkiOiJlNGM5M2QxMjM1OTQ0MWY5OTlhMzJhYjIxNTA4Mjk3YyIsInVzZXJfaWQiOiIxIn0.5EwmZWD0WBIQrtFQMiiNonVtWi6mSFeMaNOQV7HwBYI', '2025-10-04 16:47:42.253948', '2025-10-05 16:47:42', 1, 'e4c93d12359441f999a32ab21508297c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4NTM5NiwiaWF0IjoxNzU5NTk4OTk2LCJqdGkiOiJkYWI3ZmI5NmE5N2Q0Yjc4YTI1MGZlMzQyY2E2OGQ3NiIsInVzZXJfaWQiOiIxIn0.iaLnit943DLel6BZUst96-PmruMHgcBbaT3proDXAPA', '2025-10-04 17:29:56.828369', '2025-10-05 17:29:56', 1, 'dab7fb96a97d4b78a250fe342ca68d76');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4NTQ0OSwiaWF0IjoxNzU5NTk5MDQ5LCJqdGkiOiIyODc3YWIzMGU1ZDU0ZTJmOWJkYmRiNmY2NGM0OWY4ZSIsInVzZXJfaWQiOiIyIn0.BGo21VjiVN19QiWI2Yq5SDU6SJ3I1iSApp8AjQdGer0', '2025-10-04 17:30:49.618702', '2025-10-05 17:30:49', 2, '2877ab30e5d54e2f9bdbdb6f64c49f8e');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4NTgyOSwiaWF0IjoxNzU5NTk5NDI5LCJqdGkiOiJjZjE4MjBhMzIwMGQ0MjViOGE0ZmE1MTljOTc0YjEyNSIsInVzZXJfaWQiOiIyIn0.WlZwOxbMvU67PP0hwycP_tMxV-MjjYiKTVjw_Vo2xPU', '2025-10-04 17:37:09.812367', '2025-10-05 17:37:09', 2, 'cf1820a3200d425b8a4fa519c974b125');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4NTk5MCwiaWF0IjoxNzU5NTk5NTkwLCJqdGkiOiJiYjdmZTMyYzMwYjM0NmM2YWQ0MjM1YjU1NWM2YzRkZCIsInVzZXJfaWQiOiIzIn0.-aE2DwIYmJ5gt2rNNPnA_xHHTghgFzEQlzu7gYIpru4', '2025-10-04 17:39:50.870557', '2025-10-05 17:39:50', 3, 'bb7fe32c30b346c6ad4235b555c6c4dd');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4NjA0NCwiaWF0IjoxNzU5NTk5NjQ0LCJqdGkiOiJlYjI3MTRkZjRkM2Y0M2Q0YWFjZTE1MjI3NGMzYTU3OSIsInVzZXJfaWQiOiIzIn0.v6-d0gv76iO1HHvoCcPnOoKSERMoAbHq3MVoJOyOLR4', '2025-10-04 17:40:44.898659', '2025-10-05 17:40:44', 3, 'eb2714df4d3f43d4aace152274c3a579');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4NjA4OSwiaWF0IjoxNzU5NTk5Njg5LCJqdGkiOiJjYjU5NGExOTdlYTY0YTA0OTBiMzRkMjlkNmFhZTAyZSIsInVzZXJfaWQiOiIzIn0.CePSPk3cD4U_gsPLMQbhewEfFVSCqMLRr-E0mCduzyM', '2025-10-04 17:41:29.006994', '2025-10-05 17:41:29', 3, 'cb594a197ea64a0490b34d29d6aae02e');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4NzYyMywiaWF0IjoxNzU5NjAxMjIzLCJqdGkiOiJmN2ViZjZlNTBiNjg0MmFiOTEyM2Q4NDIyMWY1Y2IxMyIsInVzZXJfaWQiOiIyIn0.nCAmPMIkx38mgcrXqSUZ2qljn3YXBDZJr0LNL2tQ-L0', '2025-10-04 18:07:03.102627', '2025-10-05 18:07:03', 2, 'f7ebf6e50b6842ab9123d84221f5cb13');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (13, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4OTU0MiwiaWF0IjoxNzU5NjAzMTQyLCJqdGkiOiI5ZTIzZDFhOTM2NTU0NGJlODdhZDcyODQ2ZDZlOTIzMiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.-WeKD5z2rg3EBTYzsBL9SVr_9Ph9PHptS4zNV1nY7Lk', '2025-10-04 18:39:02.682951', '2025-10-05 18:39:02', 1, '9e23d1a9365544be87ad72846d6e9232');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4OTU0MiwiaWF0IjoxNzU5NjAzMTQyLCJqdGkiOiI4YTJlZGI5OGIyYmQ0NTRjOTEwMDFlODEwNzgwNTllMSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.qaoYcJlia0kAFSymR4smmb2Yqao-rKw9dnEwML4NxyE', '2025-10-04 18:39:02.688062', '2025-10-05 18:39:02', 1, '8a2edb98b2bd454c91001e81078059e1');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4OTU0MiwiaWF0IjoxNzU5NjAzMTQyLCJqdGkiOiJiZWE2ZmJiN2I1MmQ0MGUzOTRkNTI4OWY4YjRiNTZkMCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.DdWubkKoZcdsXQaviZt3rQlPrBvyoh5Ktfm4ALd338w', '2025-10-04 18:39:02.853480', '2025-10-05 18:39:02', 1, 'bea6fbb7b52d40e394d5289f8b4b56d0');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (16, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4OTU0MiwiaWF0IjoxNzU5NjAzMTQyLCJqdGkiOiI3NTQzYWU1OWU3ZGY0NmZjYjQ3MjczOTg3MWU5NjhkYiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.BB9Nxom0zCQUqBe2W8FqHtBlkyYsSyPCraKK1_zSFl8', '2025-10-04 18:39:02.857154', '2025-10-05 18:39:02', 1, '7543ae59e7df46fcb472739871e968db');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (17, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4OTU2MSwiaWF0IjoxNzU5NjAzMTYxLCJqdGkiOiJhMTNiZGQwZjdlMDg0YTlmYTQ3NzU2ODVlOWQ1NzZkYSIsInVzZXJfaWQiOiIxIn0.JPrP0uRm90WV20NV68-M6m3JzpoV1EBwQg3ZyHYJGYk', '2025-10-04 18:39:21.434870', '2025-10-05 18:39:21', 1, 'a13bdd0f7e084a9fa4775685e9d576da');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (18, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4OTcxMSwiaWF0IjoxNzU5NjAzMzExLCJqdGkiOiJlMTYyMWM3Yjc4NWM0NGFkYThjMzM0MGI5ODc4ODVmNiIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.OB6w8vioMct9WtV1QoASRi5vXC4goQlGdv9zkupt5qc', '2025-10-04 18:41:51.539745', '2025-10-05 18:41:51', 3, 'e1621c7b785c44ada8c3340b987885f6');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (19, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY4OTcxMSwiaWF0IjoxNzU5NjAzMzExLCJqdGkiOiIzN2I2NzVkMTQwYjc0NzI2YWY0ZGU2NmQ3MzExZjZmMSIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.KXB5VICpYVasCf40liCgvxdhOvsNDgME3prOlvzU08A', '2025-10-04 18:41:51.542272', '2025-10-05 18:41:51', 3, '37b675d140b74726af4de66d7311f6f1');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (20, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5MTIzOCwiaWF0IjoxNzU5NjA0ODM4LCJqdGkiOiJlMzVjMDQxYTU1MGY0YmRiYWFlMGMyMmRmYjczMzk2OSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.mhmrirS-DzIiekA-GAi6pPB0UAy88ndWhAM3ctIkPJY', '2025-10-04 19:07:18.561715', '2025-10-05 19:07:18', 2, 'e35c041a550f4bdbaae0c22dfb733969');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (21, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5MTIzOCwiaWF0IjoxNzU5NjA0ODM4LCJqdGkiOiI4N2NmZDg1ZGFjMGU0NjM1OTdmNTEyZTljMzdiMmVmYSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.UdNhdwnBk3EejfHhWwbyN7M1a-H_UcXSfmDgZebrMQw', '2025-10-04 19:07:18.565206', '2025-10-05 19:07:18', 2, '87cfd85dac0e463597f512e9c37b2efa');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (22, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5MzIxOCwiaWF0IjoxNzU5NjA2ODE4LCJqdGkiOiJlYjliZDUxNTc4YWE0MWNlYmNjMGI2YTVmZDY5ZWIxOCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.cyK3TWNkSElCBdJ6LSHJcJgtJS46Y7w0U2DxDj3dq8w', '2025-10-04 19:40:18.592852', '2025-10-05 19:40:18', 1, 'eb9bd51578aa41cebcc0b6a5fd69eb18');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (23, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5MzIxOCwiaWF0IjoxNzU5NjA2ODE4LCJqdGkiOiJiMzYxYzAwZjdjMDk0MmM5OTI0YjBkN2QxYmM0ZDQzNyIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.QSpxaoIv3yL1B7ok9zaOTRiyGSTHSdu_boq9wiaDDkw', '2025-10-04 19:40:18.599130', '2025-10-05 19:40:18', 1, 'b361c00f7c0942c9924b0d7d1bc4d437');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (24, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5MzMzOCwiaWF0IjoxNzU5NjA2OTM4LCJqdGkiOiI0OTM2ZGJhMzM2Nzc0MWE5YWI3NTQxMmVjNzkzZTc2ZCIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.w3vkCBcfMmS32VR_GQMVFPnlzeAGYp_m9zucCbWlJNw', '2025-10-04 19:42:18.558256', '2025-10-05 19:42:18', 3, '4936dba3367741a9ab75412ec793e76d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (25, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5MzMzOCwiaWF0IjoxNzU5NjA2OTM4LCJqdGkiOiI5NTQyZDY2MDY3OWE0OTI5YjNhNzRjOTMzNDkwZTg2OSIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.kE1HvCBL2g6CjlGSK31MMunwBdsfe0MNNk8kRStbjeo', '2025-10-04 19:42:18.579469', '2025-10-05 19:42:18', 3, '9542d660679a4929b3a74c933490e869');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (26, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5NDgzOCwiaWF0IjoxNzU5NjA4NDM4LCJqdGkiOiJkZWQ2YTc5MjVhZTk0MmM4OTZkMmNlN2U5MzA1Y2RkOSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.pgtVyGtXz4u3O34-fOMmjJfnlZEK0mm_J0dVNx75FLg', '2025-10-04 20:07:18.550187', '2025-10-05 20:07:18', 2, 'ded6a7925ae942c896d2ce7e9305cdd9');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (27, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5NDgzOCwiaWF0IjoxNzU5NjA4NDM4LCJqdGkiOiI4NGE3M2NjYTNjMmU0NzIwYTgzNGNlOTg2MTMzODUwZiIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.lDgOJcWqTrY3TzeEMRwOxfrNk6G6jZsa9wyEZ-NmK84', '2025-10-04 20:07:18.547593', '2025-10-05 20:07:18', 2, '84a73cca3c2e4720a834ce986133850f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (28, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5NjgxOCwiaWF0IjoxNzU5NjEwNDE4LCJqdGkiOiIwZTRjOWUwN2RmNjc0NTVlOTQ0NDMyNDhiNDRlNWZjYyIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ._IjknNkWLYJU-b5UT0rdi0Ajqk4m70VlLXKzPPThJkg', '2025-10-04 20:40:18.605604', '2025-10-05 20:40:18', 1, '0e4c9e07df67455e94443248b44e5fcc');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5NjgxOCwiaWF0IjoxNzU5NjEwNDE4LCJqdGkiOiJhNTAzZDI2ZDhkNWY0Yzc4ODhkYzNjZjUwN2M5NDc1ZiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.yfO9PBF5poFNLYdyas74V6gmi03fwtSN8U37geTRZuY', '2025-10-04 20:40:18.612722', '2025-10-05 20:40:18', 1, 'a503d26d8d5f4c7888dc3cf507c9475f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (30, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5NjkzOCwiaWF0IjoxNzU5NjEwNTM4LCJqdGkiOiI0ZGJhM2YwNjBiZTk0NzEyYTA2MDgwYTBlYWQzMWNiMSIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.A_XRfAEFkTwlhWNMpsU3BHBh2nN4ptMlEacxN2pAlDw', '2025-10-04 20:42:18.561023', '2025-10-05 20:42:18', 3, '4dba3f060be94712a06080a0ead31cb1');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (31, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5NjkzOCwiaWF0IjoxNzU5NjEwNTM4LCJqdGkiOiJjMDM1Y2E2ZjcyOWU0NjIxYjBiYjA2M2YwMDA1YjNhYiIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.dbDI_suRcdnRk7uMWJglcDxqXtL8G-mYjSkfUQVL8aE', '2025-10-04 20:42:18.565434', '2025-10-05 20:42:18', 3, 'c035ca6f729e4621b0bb063f0005b3ab');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (32, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5ODQzOCwiaWF0IjoxNzU5NjEyMDM4LCJqdGkiOiJkNTUzYTI3NjQ0MjM0NGE4Yjk0ZGU1ZDU0N2U0MGYxZSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.ZJ4jG9amVKygxrN6efc64Xod9IxYn-2Cw9Jve8PN5JY', '2025-10-04 21:07:18.568261', '2025-10-05 21:07:18', 2, 'd553a276442344a8b94de5d547e40f1e');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (33, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTY5ODQzOCwiaWF0IjoxNzU5NjEyMDM4LCJqdGkiOiI0ZDUwNGExZWI5N2Y0ODg1YjhiNGRiYTQ3NzcxMGE1MSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.eLLtbmHVT8_JbfqWoCs1_IZ4h6G2cpKX1s1o29E4gjU', '2025-10-04 21:07:18.575574', '2025-10-05 21:07:18', 2, '4d504a1eb97f4885b8b4dba477710a51');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (34, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwMDQxOCwiaWF0IjoxNzU5NjE0MDE4LCJqdGkiOiI0MmI5NmFhYWUwZDA0YmM1YTY1YWQ3MWRjMTdjZTExZSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.jVJx70kuJP8QtxCeRsvx09tePBu2HXOW9zwtdWi8OuA', '2025-10-04 21:40:18.555610', '2025-10-05 21:40:18', 1, '42b96aaae0d04bc5a65ad71dc17ce11e');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (35, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwMDUzOCwiaWF0IjoxNzU5NjE0MTM4LCJqdGkiOiJmZDZkYjVhZTE5OGI0ZTVjYmViNzgzZThlZThlMDc2NCIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.vrmBFB9_1fCRBTFqlBHmX7MA8GkHm0X4vbAO30u2oec', '2025-10-04 21:42:18.564212', '2025-10-05 21:42:18', 3, 'fd6db5ae198b4e5cbeb783e8ee8e0764');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (36, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwMDUzOCwiaWF0IjoxNzU5NjE0MTM4LCJqdGkiOiI4MWM0ZTBlZjg4MjQ0MGY1ODEwOWQ0MzU1MWQzN2MwZCIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.uTMLqec3pgBiJYs-KVruYml-SBIcqSyLBhAZFGo22SE', '2025-10-04 21:42:18.587232', '2025-10-05 21:42:18', 3, '81c4e0ef882440f58109d43551d37c0d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (37, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwMjAzOCwiaWF0IjoxNzU5NjE1NjM4LCJqdGkiOiJiMzU3YzhhNDdhMWI0MmUwYjEwODliNjFjMGFkMjM5YiIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.g4DAuQjkzOTghnvbu3WC_MyYrM8_FfaK6jEvQGAIEgE', '2025-10-04 22:07:18.716461', '2025-10-05 22:07:18', 2, 'b357c8a47a1b42e0b1089b61c0ad239b');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwMjAzOCwiaWF0IjoxNzU5NjE1NjM4LCJqdGkiOiIzMjJmZTNkM2M3OTg0MWFkYjI1YTRhMWFiOWEyZTRkZSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.zTgAnpbyxp74pPVcOzqK1xZRi9gTEX394lmajwdhhl8', '2025-10-04 22:07:18.713978', '2025-10-05 22:07:18', 2, '322fe3d3c79841adb25a4a1ab9a2e4de');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (39, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwNDAxOCwiaWF0IjoxNzU5NjE3NjE4LCJqdGkiOiJlNDViMmM0NGU0ZTA0MWQ5YTM5MjAzODY5MDFmMDBjYiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.aTvVu9liys8wzwGiBpwChoNZxFkvR6dx1gcm0ENBebM', '2025-10-04 22:40:18.618526', '2025-10-05 22:40:18', 1, 'e45b2c44e4e041d9a3920386901f00cb');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (40, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwNDAxOCwiaWF0IjoxNzU5NjE3NjE4LCJqdGkiOiI5MTE4YTk0ZThhNTQ0NTQwOTkzZmRiODdmYzk3Y2RiMyIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.HLyq_1c34rUIcfKMestds5C_K8s2poXJZrL-mZXoOVM', '2025-10-04 22:40:18.624621', '2025-10-05 22:40:18', 1, '9118a94e8a544540993fdb87fc97cdb3');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (41, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwNDEzOCwiaWF0IjoxNzU5NjE3NzM4LCJqdGkiOiI5NmE0NGU1NTU2N2Y0YjY4YjdlOTZmNGQwMzRkN2QxNiIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.gn4sS6DgbWMfpU2e-hpun9eVUV9ZKK568bB_XZ07CiY', '2025-10-04 22:42:18.641364', '2025-10-05 22:42:18', 3, '96a44e55567f4b68b7e96f4d034d7d16');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (42, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwNDEzOCwiaWF0IjoxNzU5NjE3NzM4LCJqdGkiOiI0MDY4M2VmYzVkZmU0NjE0OGU2Mzc5NWQ2N2NjOGZmYiIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ._XVazkxc_i9gfHxKsA3BcC4wtC_WlIZ494hRnl0n9Qw', '2025-10-04 22:42:18.644163', '2025-10-05 22:42:18', 3, '40683efc5dfe46148e63795d67cc8ffb');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (43, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwNTYzOCwiaWF0IjoxNzU5NjE5MjM4LCJqdGkiOiI0YzIwN2U4NDM2Mjc0ZjVjYThkNTk3ZjlhNmY5NDA4YiIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.p8t26I_Mf36Tp-Mdsscg90jOzWuhTONIUU48_wZTACw', '2025-10-04 23:07:18.547877', '2025-10-05 23:07:18', 2, '4c207e8436274f5ca8d597f9a6f9408b');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (44, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwNTYzOCwiaWF0IjoxNzU5NjE5MjM4LCJqdGkiOiIyMWNhYmI2MTdjY2Y0YjZhOGI1ZTQzYzNiOGUyM2M3NCIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.kIc49_0DIEee7zUEWmWRSOHw3GEVRrLOFlLacRYwBgk', '2025-10-04 23:07:18.552024', '2025-10-05 23:07:18', 2, '21cabb617ccf4b6a8b5e43c3b8e23c74');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (45, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwNzYxOCwiaWF0IjoxNzU5NjIxMjE4LCJqdGkiOiI0NjdhZjRhOGU4NGI0NmI4YmMzNWZkNjY0ODg3ZmRmNCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.Lsfp52GX75pzzZu7GCFt4_yqW035VNoCznoKgMFN49s', '2025-10-04 23:40:18.576074', '2025-10-05 23:40:18', 1, '467af4a8e84b46b8bc35fd664887fdf4');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (46, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwNzYxOCwiaWF0IjoxNzU5NjIxMjE4LCJqdGkiOiI2N2JjODEwNDFiMmY0NmI0YTYxMTcyZmRiZjAzZDk0NiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.O3BnX7-ULTkxOO0OUVxDiu8jp0wlB8rjfwOV-Fu0dmY', '2025-10-04 23:40:18.579947', '2025-10-05 23:40:18', 1, '67bc81041b2f46b4a61172fdbf03d946');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (47, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwNzczOCwiaWF0IjoxNzU5NjIxMzM4LCJqdGkiOiI0NjVkYjcwNWZmMTA0MTQ4OWQyMmMyYmQyOTE1ZmRmNSIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.aP7ZTB2o81z9zHnsnYf_eXepExizHM3-WQyT5v23ltQ', '2025-10-04 23:42:18.553890', '2025-10-05 23:42:18', 3, '465db705ff1041489d22c2bd2915fdf5');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (48, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwNzczOCwiaWF0IjoxNzU5NjIxMzM4LCJqdGkiOiJlMmI5ZGE3MTc1OWU0YzZmOWM2YjJlN2U5Y2Q2ZDRjNyIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.KNJXEupYigHA1yjZ-_h7a1_B4xYJAykSTC4gzZZt5Ak', '2025-10-04 23:42:18.573326', '2025-10-05 23:42:18', 3, 'e2b9da71759e4c6f9c6b2e7e9cd6d4c7');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwOTIzOCwiaWF0IjoxNzU5NjIyODM4LCJqdGkiOiJmNmUzNGU5OWYzM2E0OTdhOWFhZDA5OGI2MzAzNDhmZSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.mSoCJ4a7gg3mqXdIclAcrNlQHylAppwgOKX4D5C60ME', '2025-10-05 00:07:18.587610', '2025-10-06 00:07:18', 2, 'f6e34e99f33a497a9aad098b630348fe');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (50, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcwOTIzOCwiaWF0IjoxNzU5NjIyODM4LCJqdGkiOiI3MzliOWMyZDhiZDk0YTQwOGJmYzA3MWQ4OGQzYjg2MSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.eKPYXZ6GyGANs3FXbC5Bo_sG_RFaBiMHoyAntoPLPCs', '2025-10-05 00:07:18.590403', '2025-10-06 00:07:18', 2, '739b9c2d8bd94a408bfc071d88d3b861');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (51, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxMTIxOCwiaWF0IjoxNzU5NjI0ODE4LCJqdGkiOiI0ZGIyNWUwYTM4ZDE0OTFmOGQ0YjY4OGMyMTczZTBkZiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.cT2qczDN03mUwMdcqgzsJxISD1827MVi2kusE7_tJDE', '2025-10-05 00:40:18.684346', '2025-10-06 00:40:18', 1, '4db25e0a38d1491f8d4b688c2173e0df');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxMTIxOCwiaWF0IjoxNzU5NjI0ODE4LCJqdGkiOiJiOTc3ZDk4MmJkMTM0ZDBkYWI0MWI5NTQzMzQwYjM3ZiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.sbv2SyeabgrmAyFxVtOvqnn3slm-H5_6BLX4FLB8kqs', '2025-10-05 00:40:18.692131', '2025-10-06 00:40:18', 1, 'b977d982bd134d0dab41b9543340b37f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (53, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxMTMzOCwiaWF0IjoxNzU5NjI0OTM4LCJqdGkiOiI1NjQ0YTM5NmMyMGM0NjczOWU5OTJjMmJlOWM1YjJhYSIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.sra5FehDEraNRhAzvznRSSJYuyiXKZxPz7FcKma0HC4', '2025-10-05 00:42:18.549958', '2025-10-06 00:42:18', 3, '5644a396c20c46739e992c2be9c5b2aa');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (54, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxMTMzOCwiaWF0IjoxNzU5NjI0OTM4LCJqdGkiOiJhZDJiZTRiYzc1ZGY0NGNlYjUwMzYyZDNmMTUzMDZjZSIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.6-_AZ7EzIC2uXPBTbmijMJRij0Vl3cSreZm2jKPisRI', '2025-10-05 00:42:18.560747', '2025-10-06 00:42:18', 3, 'ad2be4bc75df44ceb50362d3f15306ce');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (55, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxMjg4NiwiaWF0IjoxNzU5NjI2NDg2LCJqdGkiOiI5NDJiNjU2OTQxNGY0ZWQ3YjRlNjE3Yjk4OWU4MWMyNSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.pL38kAzna7R27_eq3E34DYTT2yFVQhGp7LFWoYI3qa8', '2025-10-05 01:08:06.578518', '2025-10-06 01:08:06', 2, '942b6569414f4ed7b4e617b989e81c25');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (56, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxNDgxOCwiaWF0IjoxNzU5NjI4NDE4LCJqdGkiOiI1ZTc2N2UyNjI1NjQ0ZjgyYTA0NzZlYjZkZThhMjk3MyIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.fyZlwsCo7Hz2NLKk9D7s8gjgV-ifCbRuFlDMvfcU7dE', '2025-10-05 01:40:18.635292', '2025-10-06 01:40:18', 1, '5e767e2625644f82a0476eb6de8a2973');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (57, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxNDk1MiwiaWF0IjoxNzU5NjI4NTUyLCJqdGkiOiIwYjY4MDFlODA5MGU0NTIwOTY5OTYyZTBhNDBjNjM5MSIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.ivg9U0rDwvCfV9Vr_6AppPSdoTGtZZkT6JGrkyFAnZA', '2025-10-05 01:42:32.808656', '2025-10-06 01:42:32', 3, '0b6801e8090e4520969962e0a40c6391');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (58, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxNDk1MywiaWF0IjoxNzU5NjI4NTUzLCJqdGkiOiIwYTY1MTA0MmU5YjE0N2RiOTlhOTBhNjkzYmM0ZDBmMiIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.abuol0W8mek1t1VxZVuMG2TbQVpkJyNnY-zVflVFST4', '2025-10-05 01:42:33.088908', '2025-10-06 01:42:33', 3, '0a651042e9b147db99a90a693bc4d0f2');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxNTg1MCwiaWF0IjoxNzU5NjI5NDUwLCJqdGkiOiI1YWE4OGZhYTkwYTk0OThiYjkzM2FiZWJiYmJiOTM1YyIsInVzZXJfaWQiOiIyIn0.iRXqOxR1jgaMzYd-Zt9g0M-OhgTru24yxBlb8mT9k8A', '2025-10-05 01:57:30.271341', '2025-10-06 01:57:30', 2, '5aa88faa90a9498bb933abebbbbb935c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (60, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxODcxNCwiaWF0IjoxNzU5NjMyMzE0LCJqdGkiOiI0NDEyNDViOGFiNmE0OTFhOGQ5ODJiNTEzMzAxMjQwMCIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.GpWUaFa3fhAkugqGTwEb6hMtP-on1UBdOf2hxROcUUM', '2025-10-05 02:45:14.291127', '2025-10-06 02:45:14', 3, '441245b8ab6a491a8d982b5133012400');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (61, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxODcxNCwiaWF0IjoxNzU5NjMyMzE0LCJqdGkiOiI0ZTc0OWNiZmY2NzQ0Y2VhODVlOWI2MTJjOTBmNzI5NCIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.8_dAO29HxK20cXqgZIBPbHkBmCn7pbmKBxXEUwxlUi8', '2025-10-05 02:45:14.316184', '2025-10-06 02:45:14', 3, '4e749cbff6744cea85e9b612c90f7294');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (62, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxODcxNiwiaWF0IjoxNzU5NjMyMzE2LCJqdGkiOiJjZmFkZDBjZTkwMGY0Y2JkOWQxYjUyY2VlMTc2YTFjZSIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.CbA1cmUoondECLXT8IxlpHuxQvXOE_i_aVOywWSNIEI', '2025-10-05 02:45:16.124781', '2025-10-06 02:45:16', 3, 'cfadd0ce900f4cbd9d1b52cee176a1ce');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (63, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxODc3NSwiaWF0IjoxNzU5NjMyMzc1LCJqdGkiOiIxNzZlYmRmOGRmZDM0M2Y1YjE3NWJkMGZmMGQ2MTZlNyIsInVzZXJfaWQiOiIzIn0.RHcdoerkH7PXInF8PMeKDmetBH-Z-Bsr6pVnPQbEH5M', '2025-10-05 02:46:15.158648', '2025-10-06 02:46:15', 3, '176ebdf8dfd343f5b175bd0ff0d616e7');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxOTQ3MiwiaWF0IjoxNzU5NjMzMDcyLCJqdGkiOiIxM2YyNDcxMTEyMmU0MDE2YjQ4MmY1ZDdmMzIzZDcyNiIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.pXyHyYwvMCE5ohRI_cdsgI0LHPlL4lEwseub2Lpcclg', '2025-10-05 02:57:52.938521', '2025-10-06 02:57:52', 2, '13f24711122e4016b482f5d7f323d726');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (65, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcxOTQ3MiwiaWF0IjoxNzU5NjMzMDcyLCJqdGkiOiJjYmFlYmQ4OGI4ZTU0OTNlYjhhYmQwY2Y1N2VhNGVmMCIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.4_tQGrthhrYtuC4s6_0yv-uDf9EawnWg4BNRNIvqpgw', '2025-10-05 02:57:52.950199', '2025-10-06 02:57:52', 2, 'cbaebd88b8e5493eb8abd0cf57ea4ef0');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (66, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcyMjM3OCwiaWF0IjoxNzU5NjM1OTc4LCJqdGkiOiI1MDhmYWU1NjkwZDc0YzQyODU3ZjBiM2YzMGZhMmNmNiIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.48ePcXvxBW4dzX-9UahBLOjgypBmWIM1whxvvnkO9rk', '2025-10-05 03:46:18.566054', '2025-10-06 03:46:18', 3, '508fae5690d74c42857f0b3f30fa2cf6');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (67, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcyMjM3OCwiaWF0IjoxNzU5NjM1OTc4LCJqdGkiOiIyNDkxYjk3N2UzYjE0NDdhYmNiNTRjNjM1MzY4ZWQ3OSIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.CbOBEI14NFxM_LIc03DxeIrLiDeO-sPWUxvDLWciY7I', '2025-10-05 03:46:18.557118', '2025-10-06 03:46:18', 3, '2491b977e3b1447abcb54c635368ed79');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (68, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcyMzA5OCwiaWF0IjoxNzU5NjM2Njk4LCJqdGkiOiIyMGExMmM3OGIwOTY0MTZjOGNjNDY1YzJlZWZjMTM2YiIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.XtPRGS-DdazJKdZWry_yaSXvUOWgd0EokWgJVXE3lWM', '2025-10-05 03:58:18.550610', '2025-10-06 03:58:18', 2, '20a12c78b096416c8cc465c2eefc136b');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (69, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcyMzA5OCwiaWF0IjoxNzU5NjM2Njk4LCJqdGkiOiI4M2ZhMjYxOWRjMzg0YTQ0YjdiNzNkZjAzZjNjY2ZkZCIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.9H4redLwdmdkfYPDGfCZgyJ5G0bT8KJ0g0g9cI4lUec', '2025-10-05 03:58:18.561512', '2025-10-06 03:58:18', 2, '83fa2619dc384a44b7b73df03f3ccfdd');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (70, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcyNDQxMiwiaWF0IjoxNzU5NjM4MDEyLCJqdGkiOiI2NjJlOWFhYzhhNzE0OWNhYWFmN2Y3MjM2Zjc0YTMyMiIsInVzZXJfaWQiOiIxIn0.QGQRQc2K47bo7cdLPrPOT-6b8rZUdVwdWEI-wbq1Zlo', '2025-10-05 04:20:12.293857', '2025-10-06 04:20:12', 1, '662e9aac8a7149caaaf7f7236f74a322');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (71, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcyNzgxNywiaWF0IjoxNzU5NjQxNDE3LCJqdGkiOiI5OWYxZGI0M2I5MTc0NzlhODQ0NDc0MTcwNjIzMzk1YiIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.kAH4YNDNdW04LsqMRwvegb14GsPDd0DAs9RqrpXW1b4', '2025-10-05 05:16:57.033214', '2025-10-06 05:16:57', 2, '99f1db43b917479a844474170623395b');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (72, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcyNzgxNywiaWF0IjoxNzU5NjQxNDE3LCJqdGkiOiI5MTUzYTBlMDRiMzk0OWI3ODFmNWFkZTZhMTQyYTY5OSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.-SVugQZvh0325-hOJJbp8Iq69-xQeWjG7J_AnGReWlY', '2025-10-05 05:16:57.023124', '2025-10-06 05:16:57', 2, '9153a0e04b3949b781f5ade6a142a699');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (73, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcyNzgyNywiaWF0IjoxNzU5NjQxNDI3LCJqdGkiOiI3YWY3Y2UwMTU0NmY0Y2QyOGE3ZjQwMjk1NGZjMTcxYiIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.RC1Zgoe358nFH6QumFz1-5X2ilqhupRyBoHffrCn6wU', '2025-10-05 05:17:07.676422', '2025-10-06 05:17:07', 3, '7af7ce01546f4cd28a7f402954fc171b');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (74, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcyNzg1NSwiaWF0IjoxNzU5NjQxNDU1LCJqdGkiOiI0YmQzNTNjOWJiMjk0MTFhODhhZmEyMjRhOGJhOThhNCIsInVzZXJfaWQiOiIzIn0.gEewU3hlY_d-Q8c5F6nNtixvRUYHaeeIAZB_hs0JScY', '2025-10-05 05:17:35.388070', '2025-10-06 05:17:35', 3, '4bd353c9bb29411a88afa224a8ba98a4');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcyODUxMiwiaWF0IjoxNzU5NjQyMTEyLCJqdGkiOiI3MjZiZGMyMDBlYzc0OWE0YTE3OTJjM2M1ZjI0MDQ2OSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.uFu0aV1IwvDkTY6VewgV42cmJiRdrv-U0LrwXkOrRHk', '2025-10-05 05:28:32.917921', '2025-10-06 05:28:32', 1, '726bdc200ec749a4a1792c3c5f240469');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (76, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTcyODcxMiwiaWF0IjoxNzU5NjQyMzEyLCJqdGkiOiJiZjAxZTBjYjk2MjI0NzJhYTUyMTFmNGI5NzY4ODgyZiIsInVzZXJfaWQiOiIxIn0.EHhVnq7oeQd5Eqs79L-sgz2SHOPA-f2pZlKAvZtYijk', '2025-10-05 05:31:52.275241', '2025-10-06 05:31:52', 1, 'bf01e0cb9622472aa5211f4b9768882f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (77, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczMTQ5OCwiaWF0IjoxNzU5NjQ1MDk4LCJqdGkiOiI2MTlhZDk4ZDZlNTk0NDc3ODVjMjAwNzMwZGMzMTg3YyIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.RqLKsgZDPaVUXG3qQEk38oJrFsut38iyIDXkbj5gjgo', '2025-10-05 06:18:18.537295', '2025-10-06 06:18:18', 3, '619ad98d6e59447785c200730dc3187c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (78, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczMTQ5OCwiaWF0IjoxNzU5NjQ1MDk4LCJqdGkiOiI1NjZiMTUwYmMwZGM0OGExYmUwMzU5ODhmY2FmYjBhZCIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.M2AtOhPIX9B2qHGjITF7GAzjFDLYAPfA5YqfGHd9toc', '2025-10-05 06:18:18.542438', '2025-10-06 06:18:18', 3, '566b150bc0dc48a1be035988fcafb0ad');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (79, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczMjMzOCwiaWF0IjoxNzU5NjQ1OTM4LCJqdGkiOiI4NjNhN2Q1ZDZiMmU0ODk3YWE2Yzg2MTU4Y2Q4ZjAyNCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.rZuUs-VFXc_8K484lyEZZGm_n-ngE_OWFtKpL2DZuZc', '2025-10-05 06:32:18.712221', '2025-10-06 06:32:18', 1, '863a7d5d6b2e4897aa6c86158cd8f024');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (80, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczMjQ3OCwiaWF0IjoxNzU5NjQ2MDc4LCJqdGkiOiJjYWI4YTUyMjk2YzI0YmEwYjhhYTRlYmE5ZGNhYzg4ZCIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.G51jUMMy_TcHipa42bSHjwtFuvC6pVBJZukpbNSh55U', '2025-10-05 06:34:38.980303', '2025-10-06 06:34:38', 2, 'cab8a52296c24ba0b8aa4eba9dcac88d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (81, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczMjQ3OSwiaWF0IjoxNzU5NjQ2MDc5LCJqdGkiOiIxMDJlYWJiZmE2MTE0NDk3YmIyY2Y5MjNkYTgzYmE0NyIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.vManw-lc_t6v8A_H8Wmw4_n2VJgFiEmynnNB9FJQPtU', '2025-10-05 06:34:39.197933', '2025-10-06 06:34:39', 2, '102eabbfa6114497bb2cf923da83ba47');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (82, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczMzg3OCwiaWF0IjoxNzU5NjQ3NDc4LCJqdGkiOiI0YTA4MjhlNWM1OGE0NmNiOGVjNzIzNWQ1ZGEyNTA0YyIsInVzZXJfaWQiOiIzIn0.pQqbsarkzEh3bw8aFiod5EILNmk6y1gUI3HusMUGyvM', '2025-10-05 06:57:58.293315', '2025-10-06 06:57:58', 3, '4a0828e5c58a46cb8ec7235d5da2504c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (83, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczNTEwNywiaWF0IjoxNzU5NjQ4NzA3LCJqdGkiOiIwODM3MjFhMWRjNjU0ZDk3ODZjMTI4N2VkMDdlZjZhZiIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.Jkbir4A2uZ5rmruJlseodldoz_hgneZyNd2E34TWCWE', '2025-10-05 07:18:27.887760', '2025-10-06 07:18:27', 3, '083721a1dc654d9786c1287ed07ef6af');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (84, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczNTEwNywiaWF0IjoxNzU5NjQ4NzA3LCJqdGkiOiI2ZDQzYmMyNzQzMWU0YmY4ODA5MDc5NDUyZjIwZGIwNSIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.yPAzzNK_UKU1hoFNio-MgPyk1nCfZ5WnrN7RbWW1rpI', '2025-10-05 07:18:27.907272', '2025-10-06 07:18:27', 3, '6d43bc27431e4bf8809079452f20db05');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (85, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczNTEwOCwiaWF0IjoxNzU5NjQ4NzA4LCJqdGkiOiJkZGQ1YzE0MmNiYWM0NTI5OTQ0MmQzMzY3NmZhZTU3NyIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.6IxBgcZ_GYat1C2VK7CfnoqYONJgfUvfex8dxYNA_Z8', '2025-10-05 07:18:28.326312', '2025-10-06 07:18:28', 3, 'ddd5c142cbac45299442d33676fae577');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (86, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczNjQ3NCwiaWF0IjoxNzU5NjUwMDc0LCJqdGkiOiI5OTI3ZjMwYzg5N2I0YzM3OWQyNGExYzMyZDMwMzE2YSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.Fot1E2kL1zasFk7yyQFLJmIRMTxu1-sJQFZWkyEOjvQ', '2025-10-05 07:41:14.471389', '2025-10-06 07:41:14', 2, '9927f30c897b4c379d24a1c32d30316a');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (87, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczNjQ4OSwiaWF0IjoxNzU5NjUwMDg5LCJqdGkiOiIxODM1NzU4MDVkYjQ0YjhiODY1Mjg3ZDY1YmEwMjY2OSIsInVzZXJfaWQiOiIyIn0.kcOpvEFVGJJIRfNO_cE5aXW9DwJ1fM4RkiDFUYQ4890', '2025-10-05 07:41:29.842498', '2025-10-06 07:41:29', 2, '183575805db44b8b865287d65ba02669');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (88, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczNzI5MSwiaWF0IjoxNzU5NjUwODkxLCJqdGkiOiJmNmMxNmYwMGY4MGQ0NGQ2YjMyM2JjM2VhOTE4Zjc2NCIsInVzZXJfaWQiOiIxIn0.QvWL9qJHyH2JE5dAIH0DWRt4D55NrOMWPqQAh7lG5LE', '2025-10-05 07:54:51.792136', '2025-10-06 07:54:51', 1, 'f6c16f00f80d44d6b323bc3ea918f764');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (89, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczNzQ3OSwiaWF0IjoxNzU5NjUxMDc5LCJqdGkiOiJmYjNjMGNiYmM5YzQ0MzUyYmNhMmVjZjliYzM0N2JmYSIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.VuAeLFBxRJ22tvlqZ2IKtL5AZoTi1D4EZJbUez2RT6k', '2025-10-05 07:57:59.525441', '2025-10-06 07:57:59', 3, 'fb3c0cbbc9c44352bca2ecf9bc347bfa');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (90, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczNzQ3OSwiaWF0IjoxNzU5NjUxMDc5LCJqdGkiOiIwZDJhZDIyMTJiYmU0YzMxYTQ4M2Y2ZDIzNTU2ODliOSIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.QvEs37TCkirGsbAlpTL2cpqlRlie6O1NfrEc42AkSes', '2025-10-05 07:57:59.528153', '2025-10-06 07:57:59', 3, '0d2ad2212bbe4c31a483f6d2355689b9');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (91, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczOTI0MywiaWF0IjoxNzU5NjUyODQzLCJqdGkiOiJkNjRlY2Q1YjFjZTE0ZmFlOTBiNGQ0MjIyOGZlMzQzZSIsInVzZXJfaWQiOiI0In0.xJws05PAJLZYgpT7i5wTBS1j6PTeuoF2sOqPdANqoDI', '2025-10-05 08:27:23.538368', '2025-10-06 08:27:23', 4, 'd64ecd5b1ce14fae90b4d42228fe343e');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (92, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTczOTY4MiwiaWF0IjoxNzU5NjUzMjgyLCJqdGkiOiJjOTU5MTA2YTdiYmI0NmFhOGExMjY3NDNmMzE1ZDFkOSIsInVzZXJfaWQiOiI0In0.pbwRT4hbesx-70oSxJzfXfMuOUvWFgr4NuoS94QafDQ', '2025-10-05 08:34:42.278870', '2025-10-06 08:34:42', 4, 'c959106a7bbb46aa8a126743f315d1d9');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (93, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0MDEzOCwiaWF0IjoxNzU5NjUzNzM4LCJqdGkiOiI3NWQxNmZkMDQ1MzE0OTZlOGJkY2Y0MzEzOWI5OWJiYSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.IC9K-q0jBGVVZBlcQmcLddoppNQ-AR0bVTLRDBB5VBY', '2025-10-05 08:42:18.567820', '2025-10-06 08:42:18', 2, '75d16fd04531496e8bdcf43139b99bba');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (94, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0MDkxOCwiaWF0IjoxNzU5NjU0NTE4LCJqdGkiOiJkNjRjZGM0NzUzNmE0OTZlOTYyNGM4M2FiMDE0YWE3NSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.3qqjxTyXiAlwOQq_sAuTIz4fckSQ7Q7o3JpjOXG6dW4', '2025-10-05 08:55:18.589931', '2025-10-06 08:55:18', 1, 'd64cdc47536a496e9624c83ab014aa75');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (95, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0MTI1MCwiaWF0IjoxNzU5NjU0ODUwLCJqdGkiOiIyZTZlYWIwMDQyYzQ0ODZjYmVhNDIwZjZiZGFhZWNlYiIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.QOt6i072HC-z80Zm0ByPkSClcyAklwJgznP2ojwL7Do', '2025-10-05 09:00:50.051187', '2025-10-06 09:00:50', 3, '2e6eab0042c4486cbea420f6bdaaeceb');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (96, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0MTI1MCwiaWF0IjoxNzU5NjU0ODUwLCJqdGkiOiJiNGMxODM2MzRjOTc0NzZjOTJiNDQ3ZDk1NzM0OTZmZiIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.xecgzEE7RWYWi3pwDyQS4szu_o_I-pahh2MJE7GukPY', '2025-10-05 09:00:50.054843', '2025-10-06 09:00:50', 3, 'b4c183634c97476c92b447d9573496ff');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (97, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0MjM5NiwiaWF0IjoxNzU5NjU1OTk2LCJqdGkiOiIzOWVmZDgxNDU2Mzg0MmI4YWI5M2ZjMTIyMzgxNjFjZCIsInVzZXJfaWQiOiI1In0.qa6_wUBUdgPfUotxiejoHwe7PUoKUpxiBbb0Bx8abi4', '2025-10-05 09:19:56.374541', '2025-10-06 09:19:56', 5, '39efd814563842b8ab93fc12238161cd');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (98, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0MjQyMiwiaWF0IjoxNzU5NjU2MDIyLCJqdGkiOiJjMDRiODgzMmYwN2Q0NjNlOWZmZjcxYjYzNDUwNzhkMyIsInVzZXJfaWQiOiI1In0.7KRaGyqa_StpryHMBmYPbiFW1y19ae419WkasvbGc7c', '2025-10-05 09:20:22.222435', '2025-10-06 09:20:22', 5, 'c04b8832f07d463e9fff71b6345078d3');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (99, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0MjQ1MywiaWF0IjoxNzU5NjU2MDUzLCJqdGkiOiI4ZTVjODM0YjJmODI0NmVhOGUxNTRkZTA5ZWRiZmYxOCIsInVzZXJfaWQiOiI1In0.1EnR3OIs5tRvH6h8IPXTMi_STbEyI0kBwqFd3d9xf3c', '2025-10-05 09:20:53.617223', '2025-10-06 09:20:53', 5, '8e5c834b2f8246ea8e154de09edbff18');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (100, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0Mjg4OSwiaWF0IjoxNzU5NjU2NDg5LCJqdGkiOiI1YTdiNDg3M2I5NWE0YjBlOTM0MGFkYjBiMTU0NTc0ZiIsInVzZXJfaWQiOiI0In0.316gFHh58zQgLKazcblfKtihZ7a4ISkCGzih1CuakW0', '2025-10-05 09:28:09.821549', '2025-10-06 09:28:09', 4, '5a7b4873b95a4b0e9340adb0b154574f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (101, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0MzczOCwiaWF0IjoxNzU5NjU3MzM4LCJqdGkiOiIyMDRjM2NmZDI1MDY0ZDJlYmIwYjUxOGU5Mzk2NGQ2ZiIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.rtw6QohXxaUEBphWT_hIBFOqZ1u0Wfg1S4KuooofqhU', '2025-10-05 09:42:18.555949', '2025-10-06 09:42:18', 2, '204c3cfd25064d2ebb0b518e93964d6f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (102, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0MzczOCwiaWF0IjoxNzU5NjU3MzM4LCJqdGkiOiI4ZmM0MGY0NmRiODM0ZjkxYjBmYjVhM2VkMmI3ZjFlMSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.CjVx7yJ8EjwC9cGo8KptQkimX8vQrEKu49xjJb8PgSs', '2025-10-05 09:42:18.550144', '2025-10-06 09:42:18', 2, '8fc40f46db834f91b0fb5a3ed2b7f1e1');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (103, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0Mzg4NCwiaWF0IjoxNzU5NjU3NDg0LCJqdGkiOiI1ZjlhZDRhOTU5YjU0MjIxOTc4NzFhMzRjMzAyYWQ3MCIsInVzZXJfaWQiOiI2In0.MI-UGrpnDVPpK3T9B9dQfNLKHfehHpC2b8bGZIzLw2I', '2025-10-05 09:44:44.862171', '2025-10-06 09:44:44', 6, '5f9ad4a959b5422197871a34c302ad70');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (104, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0NDUyMCwiaWF0IjoxNzU5NjU4MTIwLCJqdGkiOiJhOWVkMzUyYzlkYTU0YTU4OWY0OWQ2ZTU3NWY0YTlkYSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.kRnHHPVBUIe3frdcyJ45vfz5wJVuNnPSwGJVL6L26zI', '2025-10-05 09:55:20.849957', '2025-10-06 09:55:20', 1, 'a9ed352c9da54a589f49d6e575f4a9da');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (105, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0NDUyMCwiaWF0IjoxNzU5NjU4MTIwLCJqdGkiOiJmMGJkODgxNWUxNjg0NTY2OTNiMTE2ZmRjODY0MDQ0MiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.t9QajsWGSvzDMLiYoen1gFDy6F5lgPDawI7xBhT_RG8', '2025-10-05 09:55:20.832387', '2025-10-06 09:55:20', 1, 'f0bd8815e168456693b116fdc8640442');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (106, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0NDU1MCwiaWF0IjoxNzU5NjU4MTUwLCJqdGkiOiJlZDQ5MDAyMjRmNzE0YTdkYTc0YmU3Y2EyOTFiYWYzNyIsInVzZXJfaWQiOiIxIn0.y9yH1EZPilUehBNUqcB1VlkTsQwHp6IrM5vnA_P3Skc', '2025-10-05 09:55:50.983513', '2025-10-06 09:55:50', 1, 'ed4900224f714a7da74be7ca291baf37');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (107, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTc0NDg4NiwiaWF0IjoxNzU5NjU4NDg2LCJqdGkiOiJhY2M2NmNjNjBlMjY0YTMzYjFkMGNiYmRmODAwMDMwOCIsInVzZXJfaWQiOiIzIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.vVvthx8wOYOYg650wUYP3dBeGbazLSHn0GaR0GKs_FY', '2025-10-05 10:01:26.751279', '2025-10-06 10:01:26', 3, 'acc66cc60e264a33b1d0cbbdf8000308');

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users_user`
--
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (1, 'pbkdf2_sha256$600000$gmRyN734E3WqPRSitS46a9$Tfk39Jg6p4N6MwZVl0CQ/mYZ8whexnU4QG1t9iUAFo4=', '2025-10-04 16:46:35', 1, 'admin@example.com', 'System', 'Administrator', '', 'Admin', NULL, NULL, 1, 1, '2025-10-04 16:46:01', '2025-10-04 16:47:11.442755', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (2, 'pbkdf2_sha256$600000$Olcao5YJS3WmwdetfAtCGa$uTcRMUO/dsQAEFY2T3Kd6FGvHe1+lQnIFfha+Tob8yQ=', NULL, 0, 'jerichourbano.01.01.04@gmail.com', 'JERICHO', 'SOTELO', 'URBANO', 'Division Chief', NULL, NULL, 0, 1, '2025-10-04 17:30:43.524197', '2025-10-04 17:36:53.037731', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (3, 'pbkdf2_sha256$600000$Ft8zxc7a047x1HHYQyciwK$9HY7z5L5CqtAaV3D2GGThYUJnGwLTDADRZwUAQM/aRA=', NULL, 0, '22101222@slc-sflu.edu.ph', 'TOXIC CHEMICALS & HAZARDOUS', 'SECTION', 'CHIEF', 'Section Chief', 'RA-6969', NULL, 0, 1, '2025-10-04 17:39:45.741948', '2025-10-05 09:37:44.373647', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (4, 'pbkdf2_sha256$600000$GBkFdPi80tmJgcjNxoPr65$L/f2D5h5tCdOlfKCVtwOsIzphpCeT7N8Bq/FWenAVSk=', NULL, 0, 'echo.010104@gmail.com', 'SOLID', 'SECTION', 'CHIEF', 'Section Chief', 'RA-9003', '', 0, 1, '2025-10-05 08:26:47.320664', '2025-10-05 09:36:58.102282', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (5, 'pbkdf2_sha256$600000$8duWma1lTC7L3i7wgHWhp4$zIfw12MhNmQP9MIEddbKyOdYGFkqmy+3dV00a/10XFE=', NULL, 0, 'emee46990@gmail.com', 'EIA, AIR & WATER', 'SECTION', 'CHIEF', 'Section Chief', 'PD-1586,RA-8749,RA-9275', NULL, 0, 1, '2025-10-05 09:19:50.254597', '2025-10-05 09:45:02.586915', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (6, 'pbkdf2_sha256$600000$1mecMrNNRBJHBCRdwGPLGj$+i6IHvvyRBqHSaWoqFDqeorct1zd2BM6DzKuCbncGeQ=', NULL, 0, 'eawsectionchief@example.com', 'JERICHO', 'SOTELO', 'URBANO', 'Section Chief', 'PD-1586,RA-8749,RA-9275', NULL, 0, 0, '2025-10-05 09:44:34.532707', '2025-10-05 09:44:59.115836', 1, 0);

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
