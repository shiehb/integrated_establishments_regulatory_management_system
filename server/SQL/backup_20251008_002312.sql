-- MySQL dump created by Python
-- Database: db_ierms
-- Server: 127.0.0.1:3306
-- Generated: 2025-10-08 00:23:12
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
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `establishments_establishment`
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
  KEY `inspections_current_6b932e_idx` (`current_status`),
  KEY `inspections_assigne_306954_idx` (`assigned_to_id`),
  KEY `inspections_created_282730_idx` (`created_by_id`),
  KEY `inspections_law_e1febf_idx` (`law`),
  CONSTRAINT `inspections_inspection_assigned_to_id_ad860202_fk_users_user_id` FOREIGN KEY (`assigned_to_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspection_created_by_id_23948284_fk_users_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `inspections_inspection`
--

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `inspections_inspection_establishments`
--

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `inspections_inspectionhistory`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (15, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (robep4296@gmail.com) created in your section: RA-6969.', 0, '2025-10-07 16:03:56.030116', 3, 12);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (16, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (echo.010104@gmail.com) created for section: RA-9003.', 0, '2025-10-07 16:04:37.206290', 2, 13);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (17, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (echo.010104@gmail.com) created in your section: RA-9003.', 0, '2025-10-07 16:04:37.207720', 4, 13);

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
INSERT INTO `system_config_systemconfiguration` (`id`, `email_host`, `email_port`, `email_use_tls`, `email_host_user`, `email_host_password`, `default_from_email`, `access_token_lifetime_minutes`, `refresh_token_lifetime_days`, `rotate_refresh_tokens`, `blacklist_after_rotation`, `backup_custom_path`, `created_at`, `updated_at`, `is_active`) VALUES (1, 'smtp.gmail.com', 587, 1, 'jerichourbano.01.01.04@gmail.com', 'pkfn htuz duyo nben', 'jerichourbano.01.01.04@gmail.com', 60, 1, 1, 1, 'SQL', '2025-10-07 15:18:08.588665', '2025-10-07 16:23:07.045793', 1);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `token_blacklist_blacklistedtoken`
--

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (9, 'pbkdf2_sha256$1000000$jLxkj48BSUipc0wc9ThbFt$j0z8ZrYpUKM7zmw2Mff/08aEusOCZl79Fie+fn50UHM=', NULL, 0, 'fixkruxi@gmail.com', 'KRU', 'XI', 'FIX', 'Monitoring Personnel', 'RA-9275', NULL, 0, 1, '2025-10-07 16:01:46.084039', '2025-10-07 16:16:27.954418', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (10, 'pbkdf2_sha256$1000000$5rzRXXNQlYzofus9AHcPBX$F6Ny9uPuuvB2paGOq1sCpvDw8MRUylX+/ivSPYaaZoE=', NULL, 0, 'maum52621@gmail.com', 'MAU', 'U', 'MAU', 'Monitoring Personnel', 'PD-1586', NULL, 0, 1, '2025-10-07 16:02:22.111306', '2025-10-07 16:17:17.425763', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (11, 'pbkdf2_sha256$1000000$i22F7QNL0fli8cq1JtCWgD$ugzTiWKfEJjntMg/Qfa8LgIHSADCOZ8AYEKelThlEXU=', NULL, 0, 'shanemabalot7@gmail.com', 'SHANE', 'T', 'MABALOT', 'Monitoring Personnel', 'RA-8749', NULL, 0, 1, '2025-10-07 16:03:01.553683', '2025-10-07 16:18:54.402381', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (12, 'pbkdf2_sha256$1000000$712hZw1Bn5qSObth4omKVE$NSG1eiQzLUGVqQi3ZK4b5E5tVpR+9XaugaZUz2WCbwM=', NULL, 0, 'robep4296@gmail.com', 'ROB', 'BEE', 'PIEP', 'Monitoring Personnel', 'RA-6969', NULL, 0, 1, '2025-10-07 16:03:52.602255', '2025-10-07 16:19:47.913879', 0, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (13, 'pbkdf2_sha256$1000000$2VqzLV9QQ6MU2sdtGbmBe9$KtBIBU4OwfCgbyI3NjEPkKfQ8NiXCA6SmNZlRP9wFGw=', NULL, 0, 'echo.010104@gmail.com', 'ECHO', 'EKONG', 'SOTELO', 'Monitoring Personnel', 'RA-9003', NULL, 0, 1, '2025-10-07 16:04:33.485866', '2025-10-07 16:22:15.929417', 0, 0);

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
