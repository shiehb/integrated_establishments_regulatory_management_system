-- MySQL dump created by Python
-- Database: db_ierms
-- Server: 127.0.0.1:3306
-- Generated: 2025-10-08 01:24:18
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
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `audit_activitylog`
--
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (1, 'create', 'New user account created: mabalotmarvijohn0902@gmail.com with auto-generated password', NULL, '', '2025-10-07 15:18:51.916487', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (2, 'update', 'User account updated: mabalotmarvijohn0902@gmail.com', NULL, '', '2025-10-07 15:25:02.263524', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (3, 'login', 'User mabalotmarvijohn0902@gmail.com logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 15:25:02.266459', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (4, 'update', 'User account updated: mabalotmarvijohn0902@gmail.com', NULL, '', '2025-10-07 15:25:31.989776', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (5, 'update', 'User account updated: mabalotmarvijohn0902@gmail.com', NULL, '', '2025-10-07 15:25:34.869924', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (6, 'update', 'User account updated: mabalotmarvijohn0902@gmail.com', NULL, '', '2025-10-07 15:30:02.817923', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (7, 'update', 'Password reset via OTP for mabalotmarvijohn0902@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 15:30:02.825576', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (8, 'create', 'New user account created: 22101024@slc-sflu.edu.ph with auto-generated password', NULL, '', '2025-10-07 15:56:26.813988', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (9, 'create', 'New user registered: 22101024@slc-sflu.edu.ph with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 15:56:29.920889', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (10, 'create', 'New user account created: gallardoangelajane2@gmail.com with auto-generated password', NULL, '', '2025-10-07 15:56:56.388273', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (11, 'create', 'New user registered: gallardoangelajane2@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 15:56:59.867632', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (12, 'create', 'New user account created: 22100670@slc-sflu.edu.ph with auto-generated password', NULL, '', '2025-10-07 15:57:35.706310', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (13, 'create', 'New user registered: 22100670@slc-sflu.edu.ph with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 15:57:39.118363', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (14, 'create', 'New user account created: jerichourbano.01.01.04@gmail.com with auto-generated password', NULL, '', '2025-10-07 15:58:12.042549', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (15, 'create', 'New user registered: jerichourbano.01.01.04@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 15:58:14.867882', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (16, 'create', 'New user account created: 22101222@slc-sflu.edu.ph with auto-generated password', NULL, '', '2025-10-07 15:59:03.956412', 6);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (17, 'create', 'New user registered: 22101222@slc-sflu.edu.ph with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 15:59:06.786048', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (18, 'create', 'New user account created: 22100949@slc-sflu.edu.ph with auto-generated password', NULL, '', '2025-10-07 15:59:36.793434', 7);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (19, 'create', 'New user registered: 22100949@slc-sflu.edu.ph with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 15:59:40.046603', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (20, 'create', 'New user account created: harryzabate@gmail.com with auto-generated password', NULL, '', '2025-10-07 16:00:56.855454', 8);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (21, 'create', 'New user registered: harryzabate@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:01:01.643191', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (22, 'create', 'New user account created: fixkruxi@gmail.com with auto-generated password', NULL, '', '2025-10-07 16:01:46.424661', 9);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (23, 'create', 'New user registered: fixkruxi@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:01:49.399969', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (24, 'create', 'New user account created: maum52621@gmail.com with auto-generated password', NULL, '', '2025-10-07 16:02:22.442628', 10);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (25, 'create', 'New user registered: maum52621@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:02:25.844362', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (26, 'create', 'New user account created: shanemabalot7@gmail.com with auto-generated password', NULL, '', '2025-10-07 16:03:01.873352', 11);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (27, 'create', 'New user registered: shanemabalot7@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:03:04.834209', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (28, 'create', 'New user account created: robep4296@gmail.com with auto-generated password', NULL, '', '2025-10-07 16:03:52.957906', 12);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (29, 'create', 'New user registered: robep4296@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:03:56.026164', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (30, 'create', 'New user account created: echo.010104@gmail.com with auto-generated password', NULL, '', '2025-10-07 16:04:33.803071', 13);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (31, 'create', 'New user registered: echo.010104@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:04:37.203589', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (32, 'update', 'User account updated: 22101024@slc-sflu.edu.ph', NULL, '', '2025-10-07 16:07:09.084620', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (33, 'update', 'Password reset via OTP for 22101024@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:07:09.085376', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (34, 'update', 'User account updated: gallardoangelajane2@gmail.com', NULL, '', '2025-10-07 16:08:40.821037', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (35, 'update', 'Password reset via OTP for gallardoangelajane2@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:08:40.821760', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (36, 'update', 'User account updated: 22100670@slc-sflu.edu.ph', NULL, '', '2025-10-07 16:10:15.464289', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (37, 'update', 'Password reset via OTP for 22100670@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:10:15.465473', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (38, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-07 16:12:23.784808', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (39, 'update', 'Password reset via OTP for jerichourbano.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:12:23.785497', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (40, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-07 16:13:27.687950', 6);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (41, 'update', 'Password reset via OTP for 22101222@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:13:27.688804', 6);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (42, 'update', 'User account updated: 22100949@slc-sflu.edu.ph', NULL, '', '2025-10-07 16:14:37.872642', 7);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (43, 'update', 'Password reset via OTP for 22100949@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:14:37.873604', 7);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (44, 'update', 'User account updated: harryzabate@gmail.com', NULL, '', '2025-10-07 16:15:30.535825', 8);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (45, 'update', 'Password reset via OTP for harryzabate@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:15:30.536587', 8);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (46, 'update', 'User account updated: fixkruxi@gmail.com', NULL, '', '2025-10-07 16:16:27.955769', 9);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (47, 'update', 'Password reset via OTP for fixkruxi@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:16:27.956344', 9);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (48, 'update', 'User account updated: maum52621@gmail.com', NULL, '', '2025-10-07 16:17:17.428450', 10);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (49, 'update', 'Password reset via OTP for maum52621@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:17:17.429206', 10);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (50, 'update', 'User account updated: shanemabalot7@gmail.com', NULL, '', '2025-10-07 16:18:54.403702', 11);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (51, 'update', 'Password reset via OTP for shanemabalot7@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:18:54.404462', 11);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (52, 'update', 'User account updated: robep4296@gmail.com', NULL, '', '2025-10-07 16:19:47.916184', 12);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (53, 'update', 'Password reset via OTP for robep4296@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:19:47.917268', 12);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (54, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-07 16:22:15.931010', 13);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (55, 'update', 'Password reset via OTP for echo.010104@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:22:15.931942', 13);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (56, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:23:07.035256', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (57, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:24:14.344805', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (58, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:30:23.506723', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (59, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:32:11.298755', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (60, 'update', 'User account updated: maum52621@gmail.com', NULL, '', '2025-10-07 16:42:28.782729', 10);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (61, 'update', 'Assigned district La Union - 1st District to maum52621@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:42:28.785182', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (62, 'update', 'User account updated: robep4296@gmail.com', NULL, '', '2025-10-07 16:42:42.747560', 12);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (63, 'update', 'Assigned district Ilocos Norte - 1st District to robep4296@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:42:42.748532', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (64, 'update', 'User account updated: fixkruxi@gmail.com', NULL, '', '2025-10-07 16:42:51.676196', 9);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (65, 'update', 'Assigned district Ilocos Sur - 2nd District to fixkruxi@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:42:51.678046', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (66, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-07 16:43:02.935547', 13);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (67, 'update', 'Assigned district Pangasinan - 4th District to echo.010104@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:43:02.936602', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (68, 'update', 'User account updated: shanemabalot7@gmail.com', NULL, '', '2025-10-07 16:43:16.765655', 11);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (69, 'update', 'Assigned district La Union - 2nd District to shanemabalot7@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 16:43:16.767076', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (70, 'create', 'Created establishment: AGOO FAMILY HOSPITAL', NULL, '', '2025-10-07 16:44:49.597954', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (71, 'update', 'Updated establishment: AGOO FAMILY HOSPITAL', NULL, '', '2025-10-07 16:44:49.603757', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (72, 'update', 'Updated establishment: AGOO FAMILY HOSPITAL', NULL, '', '2025-10-07 16:48:05.377043', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (73, 'create', 'Created establishment: JOLLIBEE', NULL, '', '2025-10-07 16:50:44.900327', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (74, 'update', 'Updated establishment: JOLLIBEE', NULL, '', '2025-10-07 16:50:44.905157', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (75, 'update', 'Updated establishment: JOLLIBEE', NULL, '', '2025-10-07 16:51:20.438762', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (76, 'create', 'Created establishment: FLYING V', NULL, '', '2025-10-07 17:03:45.319610', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (77, 'update', 'Updated establishment: FLYING V', NULL, '', '2025-10-07 17:03:45.323327', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (78, 'update', 'Updated establishment: FLYING V', NULL, '', '2025-10-07 17:04:13.855021', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (79, 'create', 'Inspection TOX-2025-0001 created for establishments: No establishments with law RA-6969', NULL, '', '2025-10-07 17:05:21.071254', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (80, 'status_change', 'Inspection TOX-2025-0001 status changed from CREATED to SECTION_ASSIGNED', NULL, '', '2025-10-07 17:05:21.120580', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (81, 'update', 'User account updated: robep4296@gmail.com', NULL, '', '2025-10-07 17:11:08.378716', 12);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (82, 'update', 'Assigned district Ilocos Norte - 2nd District to robep4296@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 17:11:08.379221', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (83, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_ASSIGNED to SECTION_IN_PROGRESS', NULL, '', '2025-10-07 17:13:03.005642', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (84, 'status_change', 'Inspection TOX-2025-0001 status changed from SECTION_IN_PROGRESS to SECTION_IN_PROGRESS', NULL, '', '2025-10-07 17:16:00.246710', 3);

--
-- Table structure for table `auth_group`
--
DROP TABLE IF EXISTS `auth_group`;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `django_admin_log`
--
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (1, '2025-10-07 15:25:31.990396', '1', 'mabalotmarvijohn0902@gmail.com (Admin)', 2, '[{"changed": {"fields": ["First name", "Middle name", "Last name", "Userlevel"]}}]', 8, 1);
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (2, '2025-10-07 15:25:34.870409', '1', 'mabalotmarvijohn0902@gmail.com (Admin)', 2, '[]', 8, 1);
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (3, '2025-10-07 15:26:24.035576', '1', 'System Configuration (Updated: 2025-10-07 15:26)', 2, '[{"changed": {"fields": ["Email host user", "Email host password", "Default from email"]}}]', 16, 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `django_migrations`
--
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (1, 'contenttypes', '0001_initial', '2025-10-07 15:17:35.655140');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (2, 'contenttypes', '0002_remove_content_type_name', '2025-10-07 15:17:35.701176');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (3, 'auth', '0001_initial', '2025-10-07 15:17:35.849585');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (4, 'auth', '0002_alter_permission_name_max_length', '2025-10-07 15:17:35.888005');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (5, 'auth', '0003_alter_user_email_max_length', '2025-10-07 15:17:35.893592');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (6, 'auth', '0004_alter_user_username_opts', '2025-10-07 15:17:35.897528');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (7, 'auth', '0005_alter_user_last_login_null', '2025-10-07 15:17:35.901209');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (8, 'auth', '0006_require_contenttypes_0002', '2025-10-07 15:17:35.903370');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (9, 'auth', '0007_alter_validators_add_error_messages', '2025-10-07 15:17:35.906608');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (10, 'auth', '0008_alter_user_username_max_length', '2025-10-07 15:17:35.910935');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (11, 'auth', '0009_alter_user_last_name_max_length', '2025-10-07 15:17:35.915063');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (12, 'auth', '0010_alter_group_name_max_length', '2025-10-07 15:17:35.925703');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (13, 'auth', '0011_update_proxy_permissions', '2025-10-07 15:17:35.929751');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (14, 'auth', '0012_alter_user_first_name_max_length', '2025-10-07 15:17:35.933543');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (15, 'users', '0001_initial', '2025-10-07 15:17:36.150534');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (16, 'admin', '0001_initial', '2025-10-07 15:17:36.234439');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (17, 'admin', '0002_logentry_remove_auto_add', '2025-10-07 15:17:36.239995');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (18, 'admin', '0003_logentry_add_action_flag_choices', '2025-10-07 15:17:36.245216');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (19, 'audit', '0001_initial', '2025-10-07 15:17:36.252516');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (20, 'audit', '0002_initial', '2025-10-07 15:17:36.282116');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (21, 'establishments', '0001_initial', '2025-10-07 15:17:36.294916');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (22, 'inspections', '0001_initial', '2025-10-07 15:17:36.365374');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (23, 'inspections', '0002_initial', '2025-10-07 15:17:36.768666');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (24, 'notifications', '0001_initial', '2025-10-07 15:17:36.782961');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (25, 'notifications', '0002_initial', '2025-10-07 15:17:36.863683');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (26, 'sessions', '0001_initial', '2025-10-07 15:17:36.897384');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (27, 'system_config', '0001_initial', '2025-10-07 15:17:36.905515');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (28, 'token_blacklist', '0001_initial', '2025-10-07 15:17:36.998152');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (29, 'token_blacklist', '0002_outstandingtoken_jti_hex', '2025-10-07 15:17:37.013598');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (30, 'token_blacklist', '0003_auto_20171017_2007', '2025-10-07 15:17:37.031208');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (31, 'token_blacklist', '0004_auto_20171017_2013', '2025-10-07 15:17:37.078077');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (32, 'token_blacklist', '0005_remove_outstandingtoken_jti', '2025-10-07 15:17:37.095410');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (33, 'token_blacklist', '0006_auto_20171017_2113', '2025-10-07 15:17:37.120990');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (34, 'token_blacklist', '0007_auto_20171017_2214', '2025-10-07 15:17:37.764068');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (35, 'token_blacklist', '0008_migrate_to_bigautofield', '2025-10-07 15:17:38.030056');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (36, 'token_blacklist', '0010_fix_migrate_to_bigautofield', '2025-10-07 15:17:38.040257');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (37, 'token_blacklist', '0011_linearizes_history', '2025-10-07 15:17:38.042530');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (38, 'token_blacklist', '0012_alter_outstandingtoken_user', '2025-10-07 15:17:38.053019');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (39, 'token_blacklist', '0013_alter_blacklistedtoken_options_and_more', '2025-10-07 15:17:38.063787');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `django_session`
--
INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES ('e1tgb0reei6ew40c84fj3lrvz8k8pbkj', '.eJxVjEEOwiAQRe_C2hAoFIJL956BzAyDVA0kpV013t026UK3773_NxFhXUpcO89xSuIqtLj8MgR6cT1EekJ9NEmtLvOE8kjkabu8t8Tv29n-HRToZV8rIM5M7FIK6LVBDJ5MMM6pMBgeQQ06cMbkiRxmBjdq6-2OHSoNVny-Dyk4gg:1v69Yk:tRrPAJ5YwhcknvKAZv2Tu1oqz4QApvgp-PPP1Ma32ZQ', '2025-10-21 15:25:02.269106');

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `establishments_establishment`
--
INSERT INTO `establishments_establishment` (`id`, `name`, `nature_of_business`, `year_established`, `province`, `city`, `barangay`, `street_building`, `postal_code`, `latitude`, `longitude`, `polygon`, `is_active`, `created_at`, `updated_at`) VALUES (1, 'AGOO FAMILY HOSPITAL', 'HEALTHCARE/MEDICAL', '1990', 'LA UNION', 'AGOO', 'SECTOR 3', 'MACARTHUR HIGHWAY', '2504', '16.343820', '120.360256', '[[16.343988103334677, 120.36025375127794], [16.3439327662035, 120.36025911569598], [16.343986816424824, 120.36048844456674], [16.343645785015994, 120.36063998937608], [16.343598169262496, 120.3604428470135], [16.34365608031252, 120.36042273044588], [16.343620046772298, 120.36018133163454], [16.343544118933657, 120.36019474267961], [16.343527389066928, 120.3601196408272], [16.343659941048568, 120.36008745431901], [16.34365093266432, 120.36004185676576], [16.343713991345385, 120.36002844572069], [16.343666375608503, 120.35981923341753], [16.34357114409994, 120.35960465669635], [16.343966225866083, 120.35937398672105], [16.344128376457437, 120.36022827029228]]', 1, '2025-10-07 16:44:49.594540', '2025-10-07 16:48:05.370206');
INSERT INTO `establishments_establishment` (`id`, `name`, `nature_of_business`, `year_established`, `province`, `city`, `barangay`, `street_building`, `postal_code`, `latitude`, `longitude`, `polygon`, `is_active`, `created_at`, `updated_at`) VALUES (2, 'JOLLIBEE', 'RESTAURANT/FOOD SERVICE', '2024', 'LA UNION', 'BACNOTAN', 'NAGSIMBAANAN', 'MANILA NORTH ROAD', '2515', '16.718962', '120.348294', '[[16.718963967020578, 120.34809932112697], [16.719231124621043, 120.34823343157771], [16.719184885832348, 120.34849628806114], [16.71898837085537, 120.34849762916566], [16.718888186671546, 120.34843057394029], [16.718841947799735, 120.34840509295464], [16.71886378282393, 120.34836485981943], [16.718811121878954, 120.34832462668422], [16.718940847595253, 120.34809798002244]]', 1, '2025-10-07 16:50:44.896987', '2025-10-07 16:51:20.437171');
INSERT INTO `establishments_establishment` (`id`, `name`, `nature_of_business`, `year_established`, `province`, `city`, `barangay`, `street_building`, `postal_code`, `latitude`, `longitude`, `polygon`, `is_active`, `created_at`, `updated_at`) VALUES (3, 'FLYING V', 'ENERGY/POWER', '2022', 'ILOCOS SUR', 'SAN ESTEBAN', 'POBLACION', 'ROUTE 2', '2705', '17.320513', '120.441361', '[[17.32035578445872, 120.4413288831711], [17.320414677892472, 120.44105529785158], [17.32064000911687, 120.44110894203187], [17.32066305434015, 120.44105798006059], [17.32072194767542, 120.44106602668764], [17.320642569697377, 120.44141471385957]]', 1, '2025-10-07 17:03:45.314352', '2025-10-07 17:04:13.853131');

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `inspections_inspection`
--
INSERT INTO `inspections_inspection` (`id`, `code`, `law`, `district`, `current_status`, `created_at`, `updated_at`, `assigned_to_id`, `created_by_id`) VALUES (1, 'TOX-2025-0001', 'RA-6969', 'ILOCOS SUR - 2nd District', 'SECTION_IN_PROGRESS', '2025-10-07 17:05:21.050743', '2025-10-07 17:13:03.004233', 3, 2);

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `inspections_inspection_establishments`
--
INSERT INTO `inspections_inspection_establishments` (`id`, `inspection_id`, `establishment_id`) VALUES (1, 1, 3);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `inspections_inspectionform`
--
INSERT INTO `inspections_inspectionform` (`inspection_id`, `scheduled_at`, `inspection_notes`, `checklist`, `findings_summary`, `compliance_decision`, `violations_found`, `compliance_plan`, `compliance_deadline`, `created_at`, `updated_at`) VALUES (1, NULL, 'Inspection for Toxic Chemicals Monitoring', '{"general": {"establishment_name": "FLYING V", "address": "ROUTE 2, POBLACION, SAN ESTEBAN, ILOCOS SUR, 2705", "coordinates": "17.320513, 120.441361", "nature_of_business": "ENERGY/POWER", "year_established": "2022", "inspection_date_time": "", "environmental_laws": ["RA-6969"], "operating_hours": "", "operating_days_per_week": "", "operating_days_per_year": "", "phone_fax_no": "09071638436", "email_address": "flyingv@gmail.com"}, "purpose": {"verify_accuracy": true, "verify_accuracy_details": ["Permit to Operate Air (POA)"], "verify_accuracy_others": "", "determine_compliance": true, "investigate_complaints": true, "check_commitment_status": true, "commitment_status_details": ["Industrial Ecowatch", "Philippine Environmental Partnership Program (PEPP)", "Pollution Adjudication Board (PAB)"], "commitment_status_others": "", "other_purpose": false, "other_purpose_specify": ""}, "permits": [{"lawId": "PD-1586", "permitType": "ECC1", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Environmental Compliance Certificate Type 1", "required": true}, {"lawId": "PD-1586", "permitType": "ECC2", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Environmental Compliance Certificate Type 2", "required": false}, {"lawId": "PD-1586", "permitType": "ECC3", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Environmental Compliance Certificate Type 3", "required": false}, {"lawId": "RA-6969", "permitType": "DENR Registry ID", "permitNumber": "213123", "dateIssued": "2025-01-28", "expiryDate": "2030-12-25", "description": "Chemical Control Order Registry Identification", "required": true}, {"lawId": "RA-6969", "permitType": "PCL Compliance Certificate", "permitNumber": "", "dateIssued": "2025-09-28", "expiryDate": "", "description": "Priority Chemicals List Compliance Certificate", "required": true}, {"lawId": "RA-6969", "permitType": "CCO Registry", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Chemical Control Order Registry", "required": false}, {"lawId": "RA-6969", "permitType": "Importer Clearance No.", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Importer Clearance Number for Hazardous Substances", "required": false}, {"lawId": "RA-6969", "permitType": "Permit to Transport", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Hazardous Waste Transport Permit", "required": true}, {"lawId": "RA-6969", "permitType": "Copy of COT issued by licensed TSD Facility", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Certificate of Treatment from Treatment, Storage, and Disposal Facility", "required": false}, {"lawId": "RA-8749", "permitType": "POA No.", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Permit to Operate Air Pollution Source", "required": true}, {"lawId": "RA-9275", "permitType": "Discharge Permit No.", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Wastewater Discharge Permit", "required": true}, {"lawId": "RA-9003", "permitType": "With MOA/Agreement for residuals disposed of to a SLF w/ ECC", "permitNumber": "", "dateIssued": "", "expiryDate": "", "description": "Memorandum of Agreement for Residual Waste Disposal", "required": false}], "complianceItems": [{"lawId": "PD-1586", "applicableLaw": "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities", "conditionId": "PD-1586-1", "conditionNumber": "", "complianceRequirement": "", "compliant": "", "remarks": "", "category": "Documentation", "priority": "High", "lawCitation": "", "remarksOption": ""}, {"lawId": "PD-1586", "applicableLaw": "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities", "conditionId": "PD-1586-2", "conditionNumber": "", "complianceRequirement": "", "compliant": "", "remarks": "", "category": "Documentation", "priority": "High", "lawCitation": "", "remarksOption": ""}, {"lawId": "PD-1586", "applicableLaw": "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities", "conditionId": "PD-1586-3", "conditionNumber": "", "complianceRequirement": "", "compliant": "", "remarks": "", "category": "Documentation", "priority": "High", "lawCitation": "", "remarksOption": ""}, {"lawId": "PD-1586", "applicableLaw": "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities", "conditionId": "PD-1586-4", "conditionNumber": "", "complianceRequirement": "", "compliant": "", "remarks": "", "category": "Documentation", "priority": "High", "lawCitation": "", "remarksOption": ""}, {"lawId": "PD-1586", "applicableLaw": "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities", "conditionId": "PD-1586-5", "conditionNumber": "", "complianceRequirement": "", "compliant": "", "remarks": "", "category": "Documentation", "priority": "High", "lawCitation": "", "remarksOption": ""}, {"lawId": "PD-1586", "applicableLaw": "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities", "conditionId": "PD-1586-6", "conditionNumber": "", "complianceRequirement": "", "compliant": "", "remarks": "", "category": "Documentation", "priority": "High", "lawCitation": "", "remarksOption": ""}, {"lawId": "PD-1586", "applicableLaw": "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities", "conditionId": "PD-1586-7", "conditionNumber": "", "complianceRequirement": "", "compliant": "", "remarks": "", "category": "Documentation", "priority": "High", "lawCitation": "", "remarksOption": ""}, {"lawId": "PD-1586", "applicableLaw": "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities", "conditionId": "PD-1586-8", "conditionNumber": "", "complianceRequirement": "", "compliant": "", "remarks": "", "category": "Documentation", "priority": "High", "lawCitation": "", "remarksOption": ""}, {"lawId": "PD-1586", "applicableLaw": "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities", "conditionId": "PD-1586-9", "conditionNumber": "", "complianceRequirement": "", "compliant": "", "remarks": "", "category": "Documentation", "priority": "High", "lawCitation": "", "remarksOption": ""}, {"lawId": "PD-1586", "applicableLaw": "PD-1586: Environmental Compliance Certificate (ECC) Conditionalities", "conditionId": "PD-1586-2", "conditionNumber": "", "complianceRequirement": "Provide EIS document", "compliant": "", "remarks": "", "category": "Documentation", "priority": "High", "lawCitation": "", "remarksOption": ""}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-PCL-1", "lawCitation": "Priority Chemical List", "complianceRequirement": "Valid PCL Compliance Certificate", "compliant": "Yes", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-PCL-2", "lawCitation": "Priority Chemical List", "complianceRequirement": "Annual Reporting", "compliant": "Yes", "remarks": "", "category": "Reporting", "priority": "Medium", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-CCO-1", "lawCitation": "Chemical Control Order", "complianceRequirement": "Biennial Report for those chemicals that are for issuance of CCO", "compliant": "Yes", "remarks": "", "category": "Reporting", "priority": "Medium", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-CCO-2", "lawCitation": "Chemical Control Order", "complianceRequirement": "CCO Registration", "compliant": "Yes", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-IMP-1", "lawCitation": "Importation", "complianceRequirement": "Valid Small Quantity Importation Clearance", "compliant": "Yes", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-IMP-2", "lawCitation": "Importation", "complianceRequirement": "Valid Importation Clearance", "compliant": "Yes", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-IMP-3", "lawCitation": "Importation", "complianceRequirement": "Bill of Lading", "compliant": "Yes", "remarks": "", "category": "Documentation", "priority": "Medium", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-HWG-1", "lawCitation": "Hazardous Waste Generator", "complianceRequirement": "Registration as Hazardous Waste Generator", "compliant": "Yes", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-HWG-2", "lawCitation": "Hazardous Waste Generator", "complianceRequirement": "With temporary Hazwaste Storage Facility", "compliant": "Yes", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-HWSL-1", "lawCitation": "Hazardous Waste Storage and Labeling", "complianceRequirement": "Hazardous Waste properly labeled", "compliant": "Yes", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-HWSL-2", "lawCitation": "Hazardous Waste Storage and Labeling", "complianceRequirement": "Valid Permit to Transport", "compliant": "Yes", "remarks": "", "category": "Permitting", "priority": "High", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-HWSL-3", "lawCitation": "Hazardous Waste Storage and Labeling", "complianceRequirement": "Valid Registration of Transporter and Treaters", "compliant": "Yes", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-WT-WTR-1", "lawCitation": "Waste Transporter, Waste Transport Record; Waste Treatment and Disposal Premises", "complianceRequirement": "WCompliance with Manifest system (Waste Transport Record)", "compliant": "Yes", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "applicableLaw": "RA 6969: Toxic Substances and Hazardous and Nuclear Waste Control Act", "conditionId": "RA-6969-WT-WTR-2", "lawCitation": "Waste Transporter, Waste Transport Record; Waste Treatment and Disposal Premises", "complianceRequirement": "Valid/Completed Cerfificate of Treatment(COT)", "compliant": "Yes", "remarks": "", "category": "Documentation", "priority": "Medium", "remarksOption": "Compliant"}, {"lawId": "RA-8749", "applicableLaw": "sample", "conditionId": "RA-8749-PO-1", "lawCitation": "RA 8749: Philippine Clean Air Act", "complianceRequirement": "With Valid POA", "compliant": "", "remarks": "", "category": "Permitting", "priority": "High", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "Permit to Operate (Air)", "conditionId": "RA-8749-PO-2", "lawCitation": "RA 8749: Philippine Clean Air Act", "complianceRequirement": "All Emission Sources is Covered by a valid POA", "compliant": "", "remarks": "", "category": "Permitting", "priority": "High", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-PO-3", "lawCitation": "Permit to Operate (Air)", "complianceRequirement": "POA is displayed in a conspicuous place near the installation", "compliant": "", "remarks": "", "category": "Documentation", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-PO-4", "lawCitation": "Permit to Operate (Air)", "complianceRequirement": "All Permit Conditions are complied with", "compliant": "", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-PO-5", "lawCitation": "Permit to Operate (Air)", "complianceRequirement": "Wind direction device installed (if applicable)", "compliant": "", "remarks": "", "category": "Operational", "priority": "Low", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-PO-6", "lawCitation": "Permit to Operate (Air)", "complianceRequirement": "Plant operational problems lasting for more than 1 hour should be reoprted to EMB w/in 24 hrs.", "compliant": "", "remarks": "", "category": "Reporting", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-PO-7", "lawCitation": "Permit to Operate (Air)", "complianceRequirement": "CCTV installed (for large sources only)", "compliant": "", "remarks": "", "category": "Operational", "priority": "Low", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-PO-8", "lawCitation": "Permit to Operate (Air)", "complianceRequirement": "CEMS/PEMS installed (for petroleum refineries, power/cement plants or sources emitting (750Tons/yr.) Yearly RATA/Quarterly CGA conducted (for sources w/CEMS", "compliant": "", "remarks": "", "category": "Monitoring", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-ET-1", "lawCitation": "Emission Testing (if applicable)", "complianceRequirement": "Compliance w/ emission standars?", "compliant": "", "remarks": "", "category": "Monitoring", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-8749", "applicableLaw": "RA 8749: Philippine Clean Air Act", "conditionId": "RA-8749-AT-1", "lawCitation": "Ambient Testing (if applicable)", "complianceRequirement": "Compliance w/ ambient air quality standards?", "compliant": "", "remarks": "", "category": "Monitoring", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-DP-1", "lawCitation": "Discharge Permit (DP)", "complianceRequirement": "With Valid Discharge Permit", "compliant": "", "remarks": "", "category": "Permitting", "priority": "High", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-DP-2", "lawCitation": "Discharge Permit (DP)", "complianceRequirement": "Volume if Duscgarge consistent with DP issued?", "compliant": "", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-DP-3", "lawCitation": "Discharge Permit (DP)", "complianceRequirement": "All permit conditions are complied with?", "compliant": "", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-DP-4", "lawCitation": "Discharge Permit (DP)", "complianceRequirement": "With working flow metering device (if applicable)", "compliant": "", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-DP-5", "lawCitation": "Discharge Permit (DP)", "complianceRequirement": "Certificate of septage siphoning hauled by accredited service provider", "compliant": "", "remarks": "", "category": "Documentation", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-ETR-1", "lawCitation": "Effluent Testing Report (if applicable)", "complianceRequirement": "In compliance with effluent standards", "compliant": "", "remarks": "", "category": "Monitoring", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-AWQM-1", "lawCitation": "Ambient Water Quality Monitoring (if applicable)", "complianceRequirement": "With ambient water quality monitoring results.", "compliant": "", "remarks": "", "category": "Monitoring", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9275", "applicableLaw": "RA 9275: Philippine Clean Water Act", "conditionId": "RA-9275-WCS-2", "lawCitation": "Wastewater Charge System (if applicable)", "complianceRequirement": "Payment of wastewater charges", "compliant": "", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9003", "applicableLaw": "RA 9003: Ecological Solid Waste Management Act", "conditionId": "RA-9003-WS-1", "lawCitation": "Waste Segregation", "complianceRequirement": "With MRF on site", "compliant": "", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9003", "applicableLaw": "RA 9003: Ecological Solid Waste Management Act", "conditionId": "RA-9003-WS-2", "lawCitation": "Waste Segregation", "complianceRequirement": "Segregated solid waste collected by LGU or Private Contractor Name of PC:", "compliant": "", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9003", "applicableLaw": "RA 9003: Ecological Solid Waste Management Act", "conditionId": "RA-9003-WS-3", "lawCitation": "Waste Segregation", "complianceRequirement": "With composting facility (if applicable)", "compliant": "", "remarks": "", "category": "Operational", "priority": "Low", "remarksOption": ""}, {"lawId": "RA-9003", "applicableLaw": "RA 9003: Ecological Solid Waste Management Act", "conditionId": "RA-9003-SWD-1", "lawCitation": "Solid Waste Disposal", "complianceRequirement": "Residuals are disposed to a SLF", "compliant": "", "remarks": "", "category": "Operational", "priority": "Medium", "remarksOption": ""}, {"lawId": "RA-9003", "applicableLaw": "RA 9003: Ecological Solid Waste Management Act", "conditionId": "RA-9003-SWD-2", "lawCitation": "Solid Waste Disposal", "complianceRequirement": "With MOA/Agreement w/ LGU", "compliant": "", "remarks": "", "category": "Documentation", "priority": "Medium", "remarksOption": ""}, {"lawId": "Pollution-Control", "applicableLaw": "Pollution Control Officer Accreditation", "conditionId": "PCO-1", "lawCitation": "DAO 2014-02 or Revised Guidelines on PCO Accreditation", "complianceRequirement": "With valid PCO accreditation certificate", "compliant": "Yes", "remarks": "", "category": "Certification", "priority": "High", "remarksOption": "Compliant"}, {"lawId": "Pollution-Control", "applicableLaw": "Pollution Control Officer Accreditation", "conditionId": "PCO-2", "lawCitation": "DAO 2014-02 or Revised Guidelines on PCO Accreditation", "complianceRequirement": "Managing head w/ 8 hrs. training certificate", "compliant": "Yes", "remarks": "", "category": "Training", "priority": "Medium", "remarksOption": "Compliant"}, {"lawId": "Self-Monitoring", "applicableLaw": "Self-Monitoring Report", "conditionId": "SMR-1", "lawCitation": "DAO 2003-27", "complianceRequirement": "Complete and timely submission of SMRs (quarterly)", "compliant": "Yes", "remarks": "", "category": "Reporting", "priority": "Medium", "remarksOption": "Compliant"}, {"lawId": "Self-Monitoring", "applicableLaw": "Self-Monitoring Report", "conditionId": "SMR-2", "lawCitation": "DAO 2003-27", "complianceRequirement": "Complete and timely submission of CMRs/CMVRs (semi-annualy)", "compliant": "Yes", "remarks": "", "category": "Reporting", "priority": "Medium", "remarksOption": "Compliant"}], "systems": [{"lawId": "PD-1586", "system": "Environmental Impact Statement System", "compliant": false, "nonCompliant": false, "notApplicable": false, "remarks": "", "category": "Environmental Management", "remarksOption": ""}, {"lawId": "RA-6969", "system": "Chemical Management", "compliant": "Yes", "nonCompliant": false, "notApplicable": false, "remarks": "", "category": "Chemical Safety", "remarksOption": "Compliant"}, {"lawId": "RA-6969", "system": "Hazardous Waste Management", "compliant": "Yes", "nonCompliant": false, "notApplicable": false, "remarks": "", "category": "Waste Management", "remarksOption": "Compliant"}, {"lawId": "RA-8749", "system": "Air Quality Management", "compliant": false, "nonCompliant": false, "notApplicable": false, "remarks": "", "category": "Air Pollution Control", "remarksOption": ""}, {"lawId": "RA-9275", "system": "Water Quality Management", "compliant": false, "nonCompliant": false, "notApplicable": false, "remarks": "", "category": "Water Pollution Control", "remarksOption": ""}, {"lawId": "RA-9003", "system": "Solid Waste Management", "compliant": false, "nonCompliant": false, "notApplicable": false, "remarks": "", "category": "Waste Management", "remarksOption": ""}, {"system": "Commitment/s from previous Technical Conference", "compliant": "Yes", "nonCompliant": false, "notApplicable": false, "remarks": "", "category": "Compliance", "remarksOption": "Compliant"}], "recommendationState": {"checked": [], "otherText": ""}, "is_draft": true, "last_saved": "2025-10-07T17:16:00.239674+00:00", "saved_by": 3}', '', 'PENDING', '', '', NULL, '2025-10-07 17:05:21.112594', '2025-10-07 17:16:00.239755');

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `inspections_inspectionhistory`
--
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (1, 'CREATED', 'SECTION_ASSIGNED', 'Inspection created and assigned to Section Chief', '2025-10-07 17:05:21.119413', 2, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (2, 'SECTION_ASSIGNED', 'SECTION_IN_PROGRESS', 'Moved to My Inspections', '2025-10-07 17:13:03.005146', 3, 1);
INSERT INTO `inspections_inspectionhistory` (`id`, `previous_status`, `new_status`, `remarks`, `created_at`, `changed_by_id`, `inspection_id`) VALUES (3, 'SECTION_IN_PROGRESS', 'SECTION_IN_PROGRESS', 'Saved inspection form as draft', '2025-10-07 17:16:00.246068', 3, 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `notifications_notification`
--
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (1, 'new_user', 'New Division Chief Created', 'A new Division Chief (22101024@slc-sflu.edu.ph) has been created.', 0, '2025-10-07 15:56:29.924374', 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (2, 'new_user', 'New Section Chief Created', 'A new Section Chief (gallardoangelajane2@gmail.com) created for section: RA-6969.', 0, '2025-10-07 15:56:59.870003', 2, 3);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (3, 'new_user', 'New Section Chief Created', 'A new Section Chief (22100670@slc-sflu.edu.ph) created for section: RA-9003.', 0, '2025-10-07 15:57:39.120846', 2, 4);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (4, 'new_user', 'New Section Chief Created', 'A new Section Chief (jerichourbano.01.01.04@gmail.com) created for section: PD-1586,RA-8749,RA-9275.', 0, '2025-10-07 15:58:14.870860', 2, 5);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (5, 'new_user', 'New Unit Head Created', 'A new Unit Head (22101222@slc-sflu.edu.ph) created for section: RA-9275.', 0, '2025-10-07 15:59:06.787841', 2, 6);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (6, 'new_user', 'New Unit Head Created', 'A new Unit Head (22100949@slc-sflu.edu.ph) created for section: RA-8749.', 0, '2025-10-07 15:59:40.049661', 2, 7);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (7, 'new_user', 'New Unit Head Created', 'A new Unit Head (harryzabate@gmail.com) created for section: PD-1586.', 0, '2025-10-07 16:01:01.645609', 2, 8);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (8, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (fixkruxi@gmail.com) created for section: RA-9275.', 0, '2025-10-07 16:01:49.402652', 2, 9);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (9, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (fixkruxi@gmail.com) created in your section: RA-9275.', 0, '2025-10-07 16:01:49.405312', 6, 9);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (10, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (maum52621@gmail.com) created for section: PD-1586.', 0, '2025-10-07 16:02:25.847469', 2, 10);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (11, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (maum52621@gmail.com) created in your section: PD-1586.', 0, '2025-10-07 16:02:25.849834', 8, 10);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (12, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (shanemabalot7@gmail.com) created for section: RA-8749.', 0, '2025-10-07 16:03:04.836995', 2, 11);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (13, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (shanemabalot7@gmail.com) created in your section: RA-8749.', 0, '2025-10-07 16:03:04.838583', 7, 11);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (14, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (robep4296@gmail.com) created for section: RA-6969.', 0, '2025-10-07 16:03:56.028740', 2, 12);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (15, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (robep4296@gmail.com) created in your section: RA-6969.', 1, '2025-10-07 16:03:56.030116', 3, 12);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (16, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (echo.010104@gmail.com) created for section: RA-9003.', 0, '2025-10-07 16:04:37.206290', 2, 13);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (17, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (echo.010104@gmail.com) created in your section: RA-9003.', 0, '2025-10-07 16:04:37.207720', 4, 13);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (18, 'new_establishment', 'New Establishment Created', 'A new establishment "AGOO FAMILY HOSPITAL" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:44:49.607170', 1, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (19, 'new_establishment', 'New Establishment Created', 'A new establishment "AGOO FAMILY HOSPITAL" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:44:49.609656', 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (20, 'new_establishment', 'New Establishment Created', 'A new establishment "AGOO FAMILY HOSPITAL" has been created by 22101024@slc-sflu.edu.ph.', 1, '2025-10-07 16:44:49.611040', 3, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (21, 'new_establishment', 'New Establishment Created', 'A new establishment "AGOO FAMILY HOSPITAL" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:44:49.612307', 4, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (22, 'new_establishment', 'New Establishment Created', 'A new establishment "AGOO FAMILY HOSPITAL" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:44:49.614494', 5, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (23, 'new_establishment', 'New Establishment Created', 'A new establishment "AGOO FAMILY HOSPITAL" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:44:49.616708', 6, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (24, 'new_establishment', 'New Establishment Created', 'A new establishment "AGOO FAMILY HOSPITAL" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:44:49.619170', 7, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (25, 'new_establishment', 'New Establishment Created', 'A new establishment "AGOO FAMILY HOSPITAL" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:44:49.621376', 8, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (26, 'new_establishment', 'New Establishment Created', 'A new establishment "JOLLIBEE" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:50:44.907137', 1, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (27, 'new_establishment', 'New Establishment Created', 'A new establishment "JOLLIBEE" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:50:44.909416', 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (28, 'new_establishment', 'New Establishment Created', 'A new establishment "JOLLIBEE" has been created by 22101024@slc-sflu.edu.ph.', 1, '2025-10-07 16:50:44.911427', 3, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (29, 'new_establishment', 'New Establishment Created', 'A new establishment "JOLLIBEE" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:50:44.913666', 4, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (30, 'new_establishment', 'New Establishment Created', 'A new establishment "JOLLIBEE" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:50:44.914682', 5, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (31, 'new_establishment', 'New Establishment Created', 'A new establishment "JOLLIBEE" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:50:44.915958', 6, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (32, 'new_establishment', 'New Establishment Created', 'A new establishment "JOLLIBEE" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:50:44.917941', 7, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (33, 'new_establishment', 'New Establishment Created', 'A new establishment "JOLLIBEE" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 16:50:44.919869', 8, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (34, 'new_establishment', 'New Establishment Created', 'A new establishment "FLYING V" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 17:03:45.325320', 1, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (35, 'new_establishment', 'New Establishment Created', 'A new establishment "FLYING V" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 17:03:45.326094', 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (36, 'new_establishment', 'New Establishment Created', 'A new establishment "FLYING V" has been created by 22101024@slc-sflu.edu.ph.', 1, '2025-10-07 17:03:45.326615', 3, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (37, 'new_establishment', 'New Establishment Created', 'A new establishment "FLYING V" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 17:03:45.327115', 4, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (38, 'new_establishment', 'New Establishment Created', 'A new establishment "FLYING V" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 17:03:45.327630', 5, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (39, 'new_establishment', 'New Establishment Created', 'A new establishment "FLYING V" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 17:03:45.328075', 6, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (40, 'new_establishment', 'New Establishment Created', 'A new establishment "FLYING V" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 17:03:45.328477', 7, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (41, 'new_establishment', 'New Establishment Created', 'A new establishment "FLYING V" has been created by 22101024@slc-sflu.edu.ph.', 0, '2025-10-07 17:03:45.328828', 8, 2);

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
  `backup_custom_path` varchar(500) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `system_config_systemconfiguration`
--
INSERT INTO `system_config_systemconfiguration` (`id`, `email_host`, `email_port`, `email_use_tls`, `email_host_user`, `email_host_password`, `default_from_email`, `access_token_lifetime_minutes`, `refresh_token_lifetime_days`, `rotate_refresh_tokens`, `blacklist_after_rotation`, `backup_custom_path`, `created_at`, `updated_at`, `is_active`) VALUES (1, 'smtp.gmail.com', 587, 1, 'jerichourbano.01.01.04@gmail.com', 'pkfn htuz duyo nben', 'jerichourbano.01.01.04@gmail.com', 60, 1, 1, 1, 'backups', '2025-10-07 15:18:08.588665', '2025-10-07 16:32:11.301110', 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `token_blacklist_blacklistedtoken`
--
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (1, '2025-10-07 16:30:23.474229', 1);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (2, '2025-10-07 16:35:36.737967', 15);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (3, '2025-10-07 16:35:36.786794', 16);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (4, '2025-10-07 16:35:49.110812', 19);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (5, '2025-10-07 16:35:49.169716', 22);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (6, '2025-10-07 17:06:48.414118', 25);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (7, '2025-10-07 17:09:09.656246', 26);

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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `token_blacklist_outstandingtoken`
--
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzNzQwOCwiaWF0IjoxNzU5ODUxMDA4LCJqdGkiOiI1MjgzOGJiZDg0NWE0YzVkYTE1NjZkOTMyNjI4YWM2NSIsInVzZXJfaWQiOiIxIn0.UjJCUY9JtjEj7rdpISHkt0HpY5YnBAg_nYBknFoTdkI', '2025-10-07 15:30:08.381193', '2025-10-08 15:30:08', 1, '52838bbd845a4c5da1566d932628ac65');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzODk4OSwiaWF0IjoxNzU5ODUyNTg5LCJqdGkiOiJmNjY2OTYzNmU5N2Y0ZThmYmY2M2IzMDczY2Q0NzBmMCIsInVzZXJfaWQiOiIyIn0.6t4any6aSH8yOfDabo1lODxBys-8AhRgluAVs82Gn9U', '2025-10-07 15:56:29.925344', '2025-10-08 15:56:29', 2, 'f6669636e97f4e8fbf63b3073cd470f0');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzOTAxOSwiaWF0IjoxNzU5ODUyNjE5LCJqdGkiOiJiYTQ1ZWE4NWJmMjE0MzM2ODI4ODdlYzA4OWEzN2E3YiIsInVzZXJfaWQiOiIzIn0.2cTU77kl5iejqLXk9epYVRzvilvz4sJAwkd9j9tXsG0', '2025-10-07 15:56:59.870521', '2025-10-08 15:56:59', 3, 'ba45ea85bf21433682887ec089a37a7b');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzOTA1OSwiaWF0IjoxNzU5ODUyNjU5LCJqdGkiOiJlYTY0NTYxYTU4OTM0MjI4YmEwMWRiOTZmMGNjNDczZiIsInVzZXJfaWQiOiI0In0.s1dSbwl7afUCpbDs-reCRrlSl8Zn8ZK3SCXGnH2s0Xo', '2025-10-07 15:57:39.121236', '2025-10-08 15:57:39', 4, 'ea64561a58934228ba01db96f0cc473f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzOTA5NCwiaWF0IjoxNzU5ODUyNjk0LCJqdGkiOiI2OTkyMDZiMmM1YmU0NWExYjJjYzc1NmJmZjQ4YjEwMCIsInVzZXJfaWQiOiI1In0.-a39i68GSos08HgYYGBXzVbMRaFd61BgVTJNu8GSTtA', '2025-10-07 15:58:14.871475', '2025-10-08 15:58:14', 5, '699206b2c5be45a1b2cc756bff48b100');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzOTE0NiwiaWF0IjoxNzU5ODUyNzQ2LCJqdGkiOiI3OTVlZmQ0ZGFmMGY0NzU5OWZhZjQ1NzcwMDkwNjdkYiIsInVzZXJfaWQiOiI2In0.mQgK1zz5YnuBfdhskRN8zKpJfUnkFVCiR8pfMxR9330', '2025-10-07 15:59:06.789135', '2025-10-08 15:59:06', 6, '795efd4daf0f47599faf4577009067db');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzOTE4MCwiaWF0IjoxNzU5ODUyNzgwLCJqdGkiOiJjZTIwZDUzMDA2OWE0YmVjYTQxZWFkMjlhNDg1MWMyYSIsInVzZXJfaWQiOiI3In0.TT4BGLZ4d6eHUslD5JGPxDh6XyHTZaqtlDz6mwWrJt8', '2025-10-07 15:59:40.051205', '2025-10-08 15:59:40', 7, 'ce20d530069a4beca41ead29a4851c2a');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzOTI2MSwiaWF0IjoxNzU5ODUyODYxLCJqdGkiOiI2ZTM4YjU2MGMzZTU0OGRmOGFiYjJjMTQ2MzRlYzViZiIsInVzZXJfaWQiOiI4In0.G9rbc_IU-ieBPBqk6ofmYseigJJKYKxgjzJKRPdeyRI', '2025-10-07 16:01:01.646730', '2025-10-08 16:01:01', 8, '6e38b560c3e548df8abb2c14634ec5bf');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzOTMwOSwiaWF0IjoxNzU5ODUyOTA5LCJqdGkiOiIwOTQ5ZDY2OTg1ODk0ZWY2OWY5ZDE1MmVlMjYyMTJhZSIsInVzZXJfaWQiOiI5In0.G9Bw0rYn2HkHYbk879QS2sKxzSPZKoTYXd7BbZ43KH8', '2025-10-07 16:01:49.406213', '2025-10-08 16:01:49', 9, '0949d66985894ef69f9d152ee26212ae');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzOTM0NSwiaWF0IjoxNzU5ODUyOTQ1LCJqdGkiOiI4ZjUzNjlmY2Y4ZTM0YzlhYjNiYjE4NWU1YmZhODkyNiIsInVzZXJfaWQiOiIxMCJ9.-gQ_VCvqmODSqbsOGdSj-_WNTUdvtM_9NsgHX8AZ9Oc', '2025-10-07 16:02:25.850646', '2025-10-08 16:02:25', 10, '8f5369fcf8e34c9ab3bb185e5bfa8926');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzOTM4NCwiaWF0IjoxNzU5ODUyOTg0LCJqdGkiOiIwZWY3ZmVlNzQ0ZmE0MTVkOTBmNGU1NjM1MzlhYzQ3NyIsInVzZXJfaWQiOiIxMSJ9.i8KxnT9lBUznsenme3Nt573wCywQykPSHHiPdvxZNEE', '2025-10-07 16:03:04.838883', '2025-10-08 16:03:04', 11, '0ef7fee744fa415d90f4e563539ac477');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzOTQzNiwiaWF0IjoxNzU5ODUzMDM2LCJqdGkiOiJlODRkMDdlN2VmZDM0ODAyOTJiZjM5YzA3NDk4ODkzNyIsInVzZXJfaWQiOiIxMiJ9.AKptNt6E5JuQ_f_nvVu6sAiSx7CPB9BlHrWqOzaPnpo', '2025-10-07 16:03:56.031216', '2025-10-08 16:03:56', 12, 'e84d07e7efd3480292bf39c074988937');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (13, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzOTQ3NywiaWF0IjoxNzU5ODUzMDc3LCJqdGkiOiJiNzJlMWVjMjZkMTM0NmUxYTZjMTk1MTExYWY2NDZkMyIsInVzZXJfaWQiOiIxMyJ9.ZVEvvtcb8Av7NGnp2iu8IfJzRLFlm3grM-Wv7cnSoRc', '2025-10-07 16:04:37.209055', '2025-10-08 16:04:37', 13, 'b72e1ec26d1346e1a6c195111af646d3');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTk0MTAyMywiaWF0IjoxNzU5ODU0NjIzLCJqdGkiOiJiMTE2YWIxYTZmZjc0OWQ4YTVkNGZhMWRkY2I3MDhiNSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.rNDMkA0nXK94cUs9VFFi4wy87OOvWUVeqYooH3izmeA', '2025-10-07 16:30:23.407884', '2025-10-08 16:30:23', 1, 'b116ab1a6ff749d8a5d4fa1ddcb708b5');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzMzc3NSwiaWF0IjoxNzU5ODQ3Mzc1LCJqdGkiOiJiY2UyYTI3YmZhOGE0ZjA1OTZhZjQwMTBjMjE5MTlmYiIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.p3nrQDlJwPD0iEmbt0Bw8NFLy8vIUVj9mWUDLYhvcDY', '2025-10-07 16:35:36.693528', '2025-10-08 14:29:35', 2, 'bce2a27bfa8a4f0596af4010c21919fb');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (16, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTk0MTMzNiwiaWF0IjoxNzU5ODU0OTM2LCJqdGkiOiI1MDg2YmUyNWQyMGQ0NTY0YjUwNTU4NWIxMDM2NTMxYiIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.kpxKRxx9WEJWaPqHroR14tBv_O6dyF2uKERcDahCGOs', '2025-10-07 16:35:36.693528', '2025-10-08 16:35:36', 2, '5086be25d20d4564b505585b1036531b');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (17, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTk0MTMzNiwiaWF0IjoxNzU5ODU0OTM2LCJqdGkiOiJlY2MxMzE1NmM4ZjE0NWRjODZjMDMxYTQ2MTc3ZGJiNCIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.yYz_Rt_cir0P0W79EC7xsm5r_OVue9_J75Ltw86rTxg', '2025-10-07 16:35:36.700372', '2025-10-08 16:35:36', 2, 'ecc13156c8f145dc86c031a46177dbb4');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (18, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTk0MTMzNiwiaWF0IjoxNzU5ODU0OTM2LCJqdGkiOiIyYzRjZmNmMDE3MDU0OTZjODI0Zjk4YzU1ZGQxMGQxNCIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.AKTdtNcZndN5XrLTm0PoMPpCW7p9M1Z68XFkXUyzgp8', '2025-10-07 16:35:36.773678', '2025-10-08 16:35:36', 2, '2c4cfcf01705496c824f98c55dd10d14');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (19, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkzNDczNSwiaWF0IjoxNzU5ODQ4MzM1LCJqdGkiOiI1MzE3NzhmYzIzMTk0YzY0OGZhNmYzMTA4YTcyMjYwMyIsInVzZXJfaWQiOiIxMCIsIm11c3RfY2hhbmdlX3Bhc3N3b3JkIjpmYWxzZX0.kOPlUMHCUA8N0ZDQlt6H6t8BFZqFQih7Ezhy-FI8v8w', '2025-10-07 16:35:49.073049', '2025-10-08 14:45:35', 10, '531778fc23194c648fa6f3108a722603');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (21, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTk0MTM0OSwiaWF0IjoxNzU5ODU0OTQ5LCJqdGkiOiI0ZDNmY2E3NDk4Y2Y0MjI3YWU0ODFjZmU4ZmViMzlmNyIsInVzZXJfaWQiOiIxMCIsIm11c3RfY2hhbmdlX3Bhc3N3b3JkIjpmYWxzZX0.mtnav_McauqmamjwgHto208k_nYJ5pH6biw-LlA3N80', '2025-10-07 16:35:49.073049', '2025-10-08 16:35:49', 10, '4d3fca7498cf4227ae481cfe8feb39f7');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (22, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTk0MTM0OSwiaWF0IjoxNzU5ODU0OTQ5LCJqdGkiOiI3MWIyMDg2Yjc5ZWY0OWRjOTUwMzNiNmYwOWU0YWY4YyIsInVzZXJfaWQiOiIxMCIsIm11c3RfY2hhbmdlX3Bhc3N3b3JkIjpmYWxzZX0._DTBeI_AnHrXmlHUj68ySXKzBSdbi6hYdzXPYbNN3kg', '2025-10-07 16:35:49.074209', '2025-10-08 16:35:49', 10, '71b2086b79ef49dc95033b6f09e4af8c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (23, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTk0MTM0OSwiaWF0IjoxNzU5ODU0OTQ5LCJqdGkiOiJkMjlmNjI4NjllYTg0ZDJjOTRmOTU0YjM1YThkYWE2MiIsInVzZXJfaWQiOiIxMCIsIm11c3RfY2hhbmdlX3Bhc3N3b3JkIjpmYWxzZX0.ZQmV7dnSU9XvxKEBzU0OcEJnxzA667x5tXRECyF36p8', '2025-10-07 16:35:49.095589', '2025-10-08 16:35:49', 10, 'd29f62869ea84d2c94f954b35a8daa62');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (24, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTk0MTM0OSwiaWF0IjoxNzU5ODU0OTQ5LCJqdGkiOiI2NWYzM2FiNjYyMjM0MzZkOGExMzg5NGExNTc2MTc5ZCIsInVzZXJfaWQiOiIxMCIsIm11c3RfY2hhbmdlX3Bhc3N3b3JkIjpmYWxzZX0.YG9Dorsh2WBokLoQ7xcRFdmdX_YlTNiCBz6brtQ8IPA', '2025-10-07 16:35:49.162380', '2025-10-08 16:35:49', 10, '65f33ab66223436d8a13894a1576179d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (25, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTk0MTU5NSwiaWF0IjoxNzU5ODU1MTk1LCJqdGkiOiI4Mzc4NDU5OTg2ZTk0NTBjYjIzMWZkNDBjMDYwZGMxNCIsInVzZXJfaWQiOiI0In0.JDBsgnFX4dVC-udxYy46SpA84oTgzswbTjpIqWOcjJ0', '2025-10-07 16:39:55.137066', '2025-10-08 16:39:55', 4, '8378459986e9450cb231fd40c060dc14');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (26, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTk0MTYyNiwiaWF0IjoxNzU5ODU1MjI2LCJqdGkiOiIwZDU1OWZkN2RkNjA0MGEwOTIzNmJhZWYwYTFjM2U5MyIsInVzZXJfaWQiOiI1In0.Tyqa4yI6aJQHjyPM9lSB_-zl5GkaKwqOIHNJvwSq3ys', '2025-10-07 16:40:26.146427', '2025-10-08 16:40:26', 5, '0d559fd7dd6040a09236baef0a1c3e93');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (27, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTk0MzIyMywiaWF0IjoxNzU5ODU2ODIzLCJqdGkiOiIyZDMxMWJhMzY2ZjU0ZGQ3OWUxMTZkMjlhYWQ3NjZlMCIsInVzZXJfaWQiOiIzIn0.DBZmgMTaj3qX0MKA-VPtxwn8f29U-B2KEHPZ2ctx5Kc', '2025-10-07 17:07:03.962842', '2025-10-08 17:07:03', 3, '2d311ba366f54dd79e116d29aad766e0');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (28, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTk0MzM2NCwiaWF0IjoxNzU5ODU2OTY0LCJqdGkiOiJkOTA3NTk4ZTljNGM0MTlmYTQwMmE0YTZmOGNjYTVjYiIsInVzZXJfaWQiOiIxMiJ9.VnR7ssvxKT9pdwoQr3JvEbmnnSf_OJzDLvRbnqP8RdQ', '2025-10-07 17:09:24.197866', '2025-10-08 17:09:24', 12, 'd907598e9c4c419fa402a4a6f8cca5cb');

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `users_user`
--
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (1, 'pbkdf2_sha256$1000000$ddZWNh6HAHuEJpkHYg9254$baRJPE9HzgbzbROOcldbJYeP/HC1zf5w5F9OsKeb5ZA=', '2025-10-07 15:25:02.259541', 1, 'mabalotmarvijohn0902@gmail.com', 'Marvijohn', 'Borja', 'Mabalot', 'Admin', NULL, NULL, 1, 1, '2025-10-07 15:18:51.611678', '2025-10-07 15:30:02.815346', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (2, 'pbkdf2_sha256$1000000$nmKGelkJGYGv2KHbzbOYdW$J68mHoXWN89u0O+/X1o6jFmLWdJnZ9ckpp9jWOowABo=', NULL, 0, '22101024@slc-sflu.edu.ph', 'MAR', 'VI', 'JOHN', 'Division Chief', NULL, NULL, 0, 1, '2025-10-07 15:56:26.482479', '2025-10-07 16:07:09.081227', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (3, 'pbkdf2_sha256$1000000$wZgi8nUd7vMCNafVyGSsoK$C1RfI8qKalb/Jgx96lT1IpJWpuhUPh5LfGw4jRzs/6g=', NULL, 0, 'gallardoangelajane2@gmail.com', 'ANGELA', 'JANE', 'GALLARDO', 'Section Chief', 'RA-6969', NULL, 0, 1, '2025-10-07 15:56:56.061025', '2025-10-07 16:08:40.819520', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (4, 'pbkdf2_sha256$1000000$Hg7TPjjKWYkTjkTRo2VaOe$WzYycAzf5MZhvQEqWgiqI2KU/XipoJ+jQET84KOtGHo=', NULL, 0, '22100670@slc-sflu.edu.ph', 'ANJ', 'FLORES', 'JANE', 'Section Chief', 'RA-9003', NULL, 0, 1, '2025-10-07 15:57:35.364373', '2025-10-07 16:10:15.462759', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (5, 'pbkdf2_sha256$1000000$Pt7gWQ99dRDE8Gm2P1TMzn$8tp3vI4wAxCWBRqtkQAKoiJh6cZClInh4JLUuZRBQME=', NULL, 0, 'jerichourbano.01.01.04@gmail.com', 'JER', 'ICH', 'HOOOO', 'Section Chief', 'PD-1586,RA-8749,RA-9275', NULL, 0, 1, '2025-10-07 15:58:11.703347', '2025-10-07 16:12:23.782461', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (6, 'pbkdf2_sha256$1000000$hnuGKlyZcdDo6QSZiGLSej$6ABPzs4hUqEu/qS13s3u8jsO5Hdpikpf6bAXzsiOVHE=', NULL, 0, '22101222@slc-sflu.edu.ph', 'JER', 'SOTELO', 'URBANO', 'Unit Head', 'RA-9275', NULL, 0, 1, '2025-10-07 15:59:03.647571', '2025-10-07 16:13:27.685713', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (7, 'pbkdf2_sha256$1000000$1tFpM9px7rpT236FEZIuHD$cnn7gHT8zyvh4UhFXp32tmdVHpQNclJhXY8ruEpxUIk=', NULL, 0, '22100949@slc-sflu.edu.ph', 'HARRY', 'JUSTINE', 'ZABATE', 'Unit Head', 'RA-8749', NULL, 0, 1, '2025-10-07 15:59:36.461703', '2025-10-07 16:14:37.871094', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (8, 'pbkdf2_sha256$1000000$gyEsDGUq3UN8JalAI08pDM$y+UZzKsKlwtAdVoDRozzVRv6zOXWpCsCT2zWVSjPmVE=', NULL, 0, 'harryzabate@gmail.com', 'JUSTINE', 'HARRY', 'MAN', 'Unit Head', 'PD-1586', NULL, 0, 1, '2025-10-07 16:00:56.539316', '2025-10-07 16:15:30.534565', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (9, 'pbkdf2_sha256$1000000$jLxkj48BSUipc0wc9ThbFt$j0z8ZrYpUKM7zmw2Mff/08aEusOCZl79Fie+fn50UHM=', NULL, 0, 'fixkruxi@gmail.com', 'KRU', 'XI', 'FIX', 'Monitoring Personnel', 'RA-9275', 'Ilocos Sur - 2nd District', 0, 1, '2025-10-07 16:01:46.084039', '2025-10-07 16:42:51.674259', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (10, 'pbkdf2_sha256$1000000$5rzRXXNQlYzofus9AHcPBX$F6Ny9uPuuvB2paGOq1sCpvDw8MRUylX+/ivSPYaaZoE=', NULL, 0, 'maum52621@gmail.com', 'MAU', 'U', 'MAU', 'Monitoring Personnel', 'PD-1586', 'La Union - 1st District', 0, 1, '2025-10-07 16:02:22.111306', '2025-10-07 16:42:28.768287', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (11, 'pbkdf2_sha256$1000000$i22F7QNL0fli8cq1JtCWgD$ugzTiWKfEJjntMg/Qfa8LgIHSADCOZ8AYEKelThlEXU=', NULL, 0, 'shanemabalot7@gmail.com', 'SHANE', 'T', 'MABALOT', 'Monitoring Personnel', 'RA-8749', 'La Union - 2nd District', 0, 1, '2025-10-07 16:03:01.553683', '2025-10-07 16:43:16.763102', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (12, 'pbkdf2_sha256$1000000$712hZw1Bn5qSObth4omKVE$NSG1eiQzLUGVqQi3ZK4b5E5tVpR+9XaugaZUz2WCbwM=', NULL, 0, 'robep4296@gmail.com', 'ROB', 'BEE', 'PIEP', 'Monitoring Personnel', 'RA-6969', 'Ilocos Norte - 2nd District', 0, 1, '2025-10-07 16:03:52.602255', '2025-10-07 17:11:08.376714', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (13, 'pbkdf2_sha256$1000000$2VqzLV9QQ6MU2sdtGbmBe9$KtBIBU4OwfCgbyI3NjEPkKfQ8NiXCA6SmNZlRP9wFGw=', NULL, 0, 'echo.010104@gmail.com', 'ECHO', 'EKONG', 'SOTELO', 'Monitoring Personnel', 'RA-9003', 'Pangasinan - 4th District', 0, 1, '2025-10-07 16:04:33.485866', '2025-10-07 16:43:02.931682', 0, 0);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `users_user_user_permissions`
--

SET FOREIGN_KEY_CHECKS=1;
-- Dump completed
