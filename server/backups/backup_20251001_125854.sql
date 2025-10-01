-- MySQL dump created by Python
-- Database: db_ierms
-- Server: 127.0.0.1:3306
-- Generated: 2025-10-01 12:58:55
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
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_activitylog`
--
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (1, 'create', 'New user account created: admin@example.com', NULL, '', '2025-09-29 01:07:28.261000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (2, 'update', 'User account updated: admin@example.com', NULL, '', '2025-09-29 01:08:05.364000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (3, 'login', 'User admin@example.com logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 01:08:05.366000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (4, 'update', 'User account updated: admin@example.com', NULL, '', '2025-09-29 01:08:15.679000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (5, 'update', 'User account updated: admin@example.com', NULL, '', '2025-09-29 01:09:24.944000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (6, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 01:10:18.883000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (7, 'create', 'New user account created: 22101222@slc-sflu.edu.ph', NULL, '', '2025-09-29 01:22:13.490000', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (8, 'create', 'New user registered: 22101222@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 01:22:16.287000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (9, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-09-29 02:27:39.452000', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (10, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-09-29 02:27:50.727000', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (11, 'update', 'First-time password set for 22101222@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 02:27:50.730000', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (12, 'create', 'Created establishment: SAINT LOUIS COLLEGE', NULL, '', '2025-09-29 02:29:26.326000', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (13, 'update', 'Updated establishment: SAINT LOUIS COLLEGE', NULL, '', '2025-09-29 02:29:26.359000', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (14, 'update', 'Updated establishment: SAINT LOUIS COLLEGE', NULL, '', '2025-09-29 02:54:09.131000', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (15, 'update', 'User account updated: admin@example.com', NULL, '', '2025-09-29 06:14:50.325000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (16, 'update', 'Password changed for admin@example.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 06:14:50.331000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (17, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 06:18:42.121000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (18, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 06:19:32.652000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (19, 'create', 'New user account created: jerichourb.01.01.04@gmail.com', NULL, '', '2025-09-30 09:46:50.087000', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (20, 'create', 'New user registered: jerichourb.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 09:46:53.101000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (21, 'update', 'User account updated: jerichourb.01.01.04@gmail.com', NULL, '', '2025-09-30 09:56:44.800000', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (22, 'update', 'Updated user: jerichourb.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 09:56:44.810000', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (23, 'update', 'User account updated: admin@example.com', NULL, '', '2025-09-30 10:14:25.827493', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (24, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-09-30 10:14:25.859096', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (25, 'update', 'User account updated: jerichourb.01.01.04@gmail.com', NULL, '', '2025-09-30 10:14:25.893053', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (26, 'update', 'Updated establishment: SAINT LOUIS COLLEGE', NULL, '', '2025-09-30 10:14:25.934298', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (27, 'update', 'User account updated: jerichourb.01.01.04@gmail.com', NULL, '', '2025-09-30 16:12:34.753798', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (28, 'update', 'Updated user: jerichourb.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:12:34.768742', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (29, 'update', 'User account updated: jerichourb.01.01.04@gmail.com', NULL, '', '2025-09-30 16:23:05.234937', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (30, 'update', 'Updated user: jerichourb.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:23:05.243345', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (31, 'update', 'User account updated: jerichourb.01.01.04@gmail.com', NULL, '', '2025-09-30 16:31:29.193834', NULL);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (32, 'update', 'Updated user: jerichourb.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 16:31:29.217023', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (33, 'update', 'User account updated: admin@example.com', NULL, '', '2025-09-30 18:17:46.046792', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (34, 'login', 'User admin@example.com logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 18:17:46.050609', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (35, 'update', 'User account updated: jerichourb.01.01.04@gmail.com', NULL, '', '2025-10-01 00:15:30.188603', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (36, 'update', 'Updated user: jerichourb.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 00:15:30.211169', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (37, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-01 02:40:54.507196', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (38, 'login', 'User admin@example.com logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 02:40:54.510616', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (39, 'update', 'User account updated: jerichourb.01.01.04@gmail.com', NULL, '', '2025-10-01 02:51:07.343448', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (40, 'update', 'Updated user: jerichourb.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 02:51:07.345744', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (41, 'create', 'New user account created: echo.010104@gmail.com', NULL, '', '2025-10-01 02:51:59.794550', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (42, 'create', 'New user registered: echo.010104@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 02:52:02.262460', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (43, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-01 02:53:17.394395', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (44, 'update', 'Toggled active status for echo.010104@gmail.com → False', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 02:53:17.397713', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (45, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-01 03:31:47.702949', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (46, 'update', 'User account updated: jerichourb.01.01.04@gmail.com', NULL, '', '2025-10-01 04:41:45.966566', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (47, 'update', 'User account updated: jerichourb.01.01.04@gmail.com', NULL, '', '2025-10-01 04:42:15.023885', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (48, 'update', 'First-time password set for jerichourb.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 04:42:15.027373', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (49, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-01 04:43:24.717012', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (50, 'update', 'Toggled active status for echo.010104@gmail.com → True', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 04:43:24.719311', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (51, 'create', 'New user account created: division@example.com', NULL, '', '2025-10-01 04:44:41.209356', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (52, 'create', 'New user registered: division@example.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 04:44:43.919642', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (53, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-01 04:49:08.685929', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (54, 'update', 'Updated user: 22101222@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 04:49:08.690700', 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (49, 'Can add System Configuration', 13, 'add_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (50, 'Can change System Configuration', 13, 'change_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (51, 'Can delete System Configuration', 13, 'delete_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (52, 'Can view System Configuration', 13, 'view_systemconfiguration');

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
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (1, '2025-09-29 01:08:15.685000', '1', 'admin@example.com ()', 2, '[{"changed": {"fields": ["Is first login"]}}]', 8, 1);
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (2, '2025-09-29 01:09:24.949000', '1', 'admin@example.com (Admin)', 2, '[{"changed": {"fields": ["First name", "Userlevel"]}}]', 8, 1);
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (3, '2025-09-30 18:18:11.294605', '3', 'jerichourb.01.01.04@gmail.com (Unit Head)', 3, '', 8, 1);
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (4, '2025-10-01 03:31:47.707081', '1', 'admin@example.com (Admin)', 2, '[{"changed": {"fields": ["First name"]}}]', 8, 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (10, 'notifications', 'notification');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (5, 'sessions', 'session');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (13, 'system_config', 'systemconfiguration');
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
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_migrations`
--
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (1, 'contenttypes', '0001_initial', '2025-09-29 01:05:46.720915');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (2, 'contenttypes', '0002_remove_content_type_name', '2025-09-29 01:05:46.806251');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (3, 'auth', '0001_initial', '2025-09-29 01:05:47.063480');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (4, 'auth', '0002_alter_permission_name_max_length', '2025-09-29 01:05:47.127171');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (5, 'auth', '0003_alter_user_email_max_length', '2025-09-29 01:05:47.133748');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (6, 'auth', '0004_alter_user_username_opts', '2025-09-29 01:05:47.148630');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (7, 'auth', '0005_alter_user_last_login_null', '2025-09-29 01:05:47.157738');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (8, 'auth', '0006_require_contenttypes_0002', '2025-09-29 01:05:47.160897');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (9, 'auth', '0007_alter_validators_add_error_messages', '2025-09-29 01:05:47.170324');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (10, 'auth', '0008_alter_user_username_max_length', '2025-09-29 01:05:47.194204');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (11, 'auth', '0009_alter_user_last_name_max_length', '2025-09-29 01:05:47.203815');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (12, 'auth', '0010_alter_group_name_max_length', '2025-09-29 01:05:47.223201');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (13, 'auth', '0011_update_proxy_permissions', '2025-09-29 01:05:47.232207');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (14, 'auth', '0012_alter_user_first_name_max_length', '2025-09-29 01:05:47.239891');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (15, 'users', '0001_initial', '2025-09-29 01:05:47.511814');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (16, 'admin', '0001_initial', '2025-09-29 01:05:47.637110');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (17, 'admin', '0002_logentry_remove_auto_add', '2025-09-29 01:05:47.654746');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (18, 'admin', '0003_logentry_add_action_flag_choices', '2025-09-29 01:05:47.675073');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (19, 'audit', '0001_initial', '2025-09-29 01:05:47.748727');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (20, 'audit', '0002_alter_activitylog_user_agent', '2025-09-29 01:05:47.809719');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (21, 'establishments', '0001_initial', '2025-09-29 01:05:47.826624');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (22, 'establishments', '0002_alter_establishment_name', '2025-09-29 01:05:47.850647');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (23, 'establishments', '0003_auto_20250913_1901', '2025-09-29 01:05:47.856094');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (24, 'inspections', '0001_initial', '2025-09-29 01:05:48.129465');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (25, 'inspections', '0002_inspection_code', '2025-09-29 01:05:48.199657');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (26, 'inspections', '0003_inspection_applicable_laws_and_more', '2025-09-29 01:05:48.533764');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (27, 'notifications', '0001_initial', '2025-09-29 01:05:48.666785');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (28, 'sessions', '0001_initial', '2025-09-29 01:05:48.703564');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (29, 'system_config', '0001_initial', '2025-09-29 01:05:48.723502');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (30, 'token_blacklist', '0001_initial', '2025-09-29 01:05:48.912842');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (31, 'token_blacklist', '0002_outstandingtoken_jti_hex', '2025-09-29 01:05:48.936151');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (32, 'token_blacklist', '0003_auto_20171017_2007', '2025-09-29 01:05:48.967559');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (33, 'token_blacklist', '0004_auto_20171017_2013', '2025-09-29 01:05:49.060822');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (34, 'token_blacklist', '0005_remove_outstandingtoken_jti', '2025-09-29 01:05:49.087425');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (35, 'token_blacklist', '0006_auto_20171017_2113', '2025-09-29 01:05:49.112025');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (36, 'token_blacklist', '0007_auto_20171017_2214', '2025-09-29 01:05:49.627032');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (37, 'token_blacklist', '0008_migrate_to_bigautofield', '2025-09-29 01:05:49.984205');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (38, 'token_blacklist', '0010_fix_migrate_to_bigautofield', '2025-09-29 01:05:50.009395');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (39, 'token_blacklist', '0011_linearizes_history', '2025-09-29 01:05:50.020328');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (40, 'token_blacklist', '0012_alter_outstandingtoken_user', '2025-09-29 01:05:50.051895');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (41, 'token_blacklist', '0013_alter_blacklistedtoken_options_and_more', '2025-09-29 01:05:50.080827');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (42, 'users', '0002_user_middle_name_user_section_user_userlevel', '2025-09-29 01:05:50.173161');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (43, 'users', '0003_alter_user_userlevel', '2025-09-29 01:05:50.195436');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (44, 'users', '0004_alter_user_section', '2025-09-29 01:05:50.269154');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (45, 'users', '0005_user_is_first_login_user_must_change_password', '2025-09-29 01:05:50.330842');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (46, 'users', '0006_notification', '2025-09-29 01:05:50.491558');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (47, 'users', '0007_alter_notification_notification_type', '2025-09-29 01:05:50.508087');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (48, 'users', '0008_delete_notification', '2025-09-29 01:05:50.519136');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (49, 'users', '0009_user_updated_at_alter_user_section', '2025-09-29 01:05:50.567791');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (50, 'users', '0010_user_is_online_user_last_activity', '2025-09-29 01:05:50.608843');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (51, 'users', '0011_remove_user_is_online_remove_user_last_activity', '2025-09-29 01:05:50.665487');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (52, 'users', '0012_user_district', '2025-09-29 01:05:50.691687');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (53, 'users', '0013_alter_user_district', '2025-09-29 01:05:50.714138');

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
INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES ('vmsp9tovfeplycerbvwl1ga1omizdaye', '.eJxVTEsKwjAQvUvWEjqNaROX7j1DmMxMTVUSaNqVeHdT6EJ58OB93yrgtqawVVnCzOqiQJ1-vYj0lLwH_MB8L5pKXpc56r2ij7TqW2F5XY_u30HCmtpabC9iovFCYA0jSMM4dESNrXXnbgI7eE_GRHZubHpCAt9H9EAk6vMF4is4AA:1v3ev4:GEaIi6hxqb6eenvXVD-R4bYI1xXsizYBqLDvKuY7pJ4', '2025-10-14 18:17:46.055473');
INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES ('zfg0h4g7zuikqr1gjxxmil0vaoug9l0d', '.eJxVTEsKwjAQvUvWEjqNaROX7j1DmMxMTVUSaNqVeHdT6EJ58OB93yrgtqawVVnCzOqiQJ1-vYj0lLwH_MB8L5pKXpc56r2ij7TqW2F5XY_u30HCmtpabC9iovFCYA0jSMM4dESNrXXnbgI7eE_GRHZubHpCAt9H9EAk6vMF4is4AA:1v3mly:HKhRKyT_t4tQdwzY3ta2_PJwR0ml44isCej06Zvf_Jg', '2025-10-15 02:40:54.514622');

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
  UNIQUE KEY `establishments_establishment_name_4ba5effe_uniq` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `establishments_establishment`
--
INSERT INTO `establishments_establishment` (`id`, `name`, `nature_of_business`, `year_established`, `province`, `city`, `barangay`, `street_building`, `postal_code`, `latitude`, `longitude`, `polygon`, `is_active`, `created_at`, `updated_at`) VALUES (1, 'SAINT LOUIS COLLEGE', 'EDUCATION', '1964', 'LA UNION', 'SAN FERNANDO', 'CARLATAN', 'MACARTHUR HIGHWAY', '2500', '16.636925', '120.313207', '[[16.638429373213555, 120.314137422738], [16.6382649981934, 120.31304333422544], [16.63739175353592, 120.3131505978051], [16.637222240876767, 120.31214768333531], [16.63558947970582, 120.31284267779758], [16.635661394797953, 120.31316715012606], [16.635741015047063, 120.31314301582063], [16.635794951326073, 120.3136900600769], [16.6364524590313, 120.31377587094063], [16.636442185490747, 120.31384022908844], [16.636370270691444, 120.31394212948912], [16.636401091323012, 120.31396626379453], [16.63637797584978, 120.3139957612789], [16.636709297366288, 120.31421565161722]]', 1, '2025-09-29 02:29:26.322000', '2025-09-29 02:54:09.108000');

--
-- Table structure for table `inspections_inspection`
--
DROP TABLE IF EXISTS `inspections_inspection`;
CREATE TABLE `inspections_inspection` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `section` varchar(50) NOT NULL,
  `district` varchar(100) DEFAULT NULL,
  `status` varchar(30) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `assigned_monitor_id` bigint(20) DEFAULT NULL,
  `assigned_section_chief_id` bigint(20) DEFAULT NULL,
  `assigned_unit_head_id` bigint(20) DEFAULT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  `establishment_id` bigint(20) NOT NULL,
  `code` varchar(30) DEFAULT NULL,
  `applicable_laws` longtext DEFAULT NULL,
  `assigned_division_head_id` bigint(20) DEFAULT NULL,
  `assigned_legal_unit_id` bigint(20) DEFAULT NULL,
  `billing_record` longtext DEFAULT NULL,
  `compliance_call` longtext DEFAULT NULL,
  `current_assigned_to_id` bigint(20) DEFAULT NULL,
  `inspection_list` longtext DEFAULT NULL,
  `inspection_notes` longtext DEFAULT NULL,
  `workflow_comments` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `inspections_inspecti_assigned_monitor_id_a28248a2_fk_users_use` (`assigned_monitor_id`),
  KEY `inspections_inspecti_assigned_section_chi_8921404a_fk_users_use` (`assigned_section_chief_id`),
  KEY `inspections_inspecti_assigned_unit_head_i_641e9831_fk_users_use` (`assigned_unit_head_id`),
  KEY `inspections_inspection_created_by_id_23948284_fk_users_user_id` (`created_by_id`),
  KEY `inspections_inspecti_establishment_id_eabdd328_fk_establish` (`establishment_id`),
  KEY `inspections_inspecti_assigned_division_he_663040cf_fk_users_use` (`assigned_division_head_id`),
  KEY `inspections_inspecti_assigned_legal_unit__1d8ddabd_fk_users_use` (`assigned_legal_unit_id`),
  KEY `inspections_inspecti_current_assigned_to__c7c8204d_fk_users_use` (`current_assigned_to_id`),
  CONSTRAINT `inspections_inspecti_assigned_division_he_663040cf_fk_users_use` FOREIGN KEY (`assigned_division_head_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspecti_assigned_legal_unit__1d8ddabd_fk_users_use` FOREIGN KEY (`assigned_legal_unit_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspecti_assigned_monitor_id_a28248a2_fk_users_use` FOREIGN KEY (`assigned_monitor_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspecti_assigned_section_chi_8921404a_fk_users_use` FOREIGN KEY (`assigned_section_chief_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspecti_assigned_unit_head_i_641e9831_fk_users_use` FOREIGN KEY (`assigned_unit_head_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspecti_current_assigned_to__c7c8204d_fk_users_use` FOREIGN KEY (`current_assigned_to_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `inspections_inspecti_establishment_id_eabdd328_fk_establish` FOREIGN KEY (`establishment_id`) REFERENCES `establishments_establishment` (`id`),
  CONSTRAINT `inspections_inspection_created_by_id_23948284_fk_users_user_id` FOREIGN KEY (`created_by_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspection`
--
INSERT INTO `inspections_inspection` (`id`, `section`, `district`, `status`, `created_at`, `updated_at`, `assigned_monitor_id`, `assigned_section_chief_id`, `assigned_unit_head_id`, `created_by_id`, `establishment_id`, `code`, `applicable_laws`, `assigned_division_head_id`, `assigned_legal_unit_id`, `billing_record`, `compliance_call`, `current_assigned_to_id`, `inspection_list`, `inspection_notes`, `workflow_comments`) VALUES (1, 'RA-8749', 'LA UNION', 'DIVISION_CREATED', '2025-09-29 03:10:18.302000', '2025-09-29 03:10:18.326000', NULL, NULL, NULL, 2, 1, 'AIR-2025-0001', NULL, 2, NULL, NULL, NULL, 2, NULL, NULL, NULL);

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
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (1, 'new_user', 'New Division Chief Created', 'A new Division Chief (22101222@slc-sflu.edu.ph) has been created.', 0, '2025-09-29 01:22:16.339000', 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (2, 'new_establishment', 'New Establishment Created', 'A new establishment "SAINT LOUIS COLLEGE" has been created by 22101222@slc-sflu.edu.ph.', 1, '2025-09-29 02:29:26.378000', 1, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (3, 'new_establishment', 'New Establishment Created', 'A new establishment "SAINT LOUIS COLLEGE" has been created by 22101222@slc-sflu.edu.ph.', 0, '2025-09-29 02:29:26.386000', 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (5, 'new_user', 'New Section Chief Created', 'A new Section Chief (echo.010104@gmail.com) created for section: RA-6969.', 0, '2025-10-01 02:52:02.334784', 2, 4);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (6, 'new_user', 'New Division Chief Created', 'A new Division Chief (division@example.com) has been created.', 0, '2025-10-01 04:44:43.929031', 2, 5);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (7, 'new_user', 'New Division Chief Created', 'A new Division Chief (division@example.com) has been created.', 0, '2025-10-01 04:44:43.933246', 5, 5);

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
  `default_user_password` varchar(255) NOT NULL,
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
INSERT INTO `system_config_systemconfiguration` (`id`, `email_host`, `email_port`, `email_use_tls`, `email_host_user`, `email_host_password`, `default_from_email`, `default_user_password`, `access_token_lifetime_minutes`, `refresh_token_lifetime_days`, `rotate_refresh_tokens`, `blacklist_after_rotation`, `created_at`, `updated_at`, `is_active`) VALUES (1, 'smtp.gmail.com', 587, 1, 'jerichourbano.0101.04@gmail.com', 'pkfn htuz duyo nben', 'jerichourbano.0101.04@gmail.com', 'password123', 60, 1, 1, 1, '2025-09-29 01:09:57.494000', '2025-09-29 06:19:32.656000', 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist_blacklistedtoken`
--
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (1, '2025-09-29 01:08:33.798000', 1);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (2, '2025-09-29 01:09:40.450000', 2);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (3, '2025-09-29 02:23:23.893000', 3);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (4, '2025-09-29 02:27:30.130000', 6);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (5, '2025-09-29 03:28:01.184000', 7);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (7, '2025-09-29 04:13:20.436000', 9);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (8, '2025-09-29 05:13:52.843000', 10);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (9, '2025-09-29 06:14:10.224000', 12);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (10, '2025-09-29 06:14:59.531000', 14);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (11, '2025-09-29 06:15:18.362000', 15);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (12, '2025-09-29 07:42:47.596000', 16);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (14, '2025-09-29 08:59:19.460000', 18);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (15, '2025-09-29 10:00:05.156000', 20);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (17, '2025-09-29 11:22:25.434000', 22);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (19, '2025-09-29 12:22:31.046000', 24);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (20, '2025-09-29 15:10:41.183000', 26);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (22, '2025-09-29 16:11:12.679000', 28);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (23, '2025-09-29 17:15:43.173000', 30);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (26, '2025-09-29 18:16:05.204000', 32);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (27, '2025-09-29 23:35:35.991000', 34);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (28, '2025-09-30 00:39:06.202000', 36);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (30, '2025-09-30 03:01:55.431000', 39);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (32, '2025-09-30 04:02:13.303000', 41);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (34, '2025-09-30 04:16:08.181000', 43);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (35, '2025-09-30 04:24:28.706000', 44);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (36, '2025-09-30 05:25:02.132000', 45);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (38, '2025-09-30 06:25:05.136000', 47);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (39, '2025-09-30 09:02:20.140000', 49);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (41, '2025-09-30 10:05:29.707000', 51);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (42, '2025-09-30 10:05:29.789000', 53);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (43, '2025-09-30 12:09:05.066818', 54);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (45, '2025-09-30 12:13:57.217386', 56);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (46, '2025-09-30 13:14:27.952823', 57);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (47, '2025-09-30 13:17:27.276294', 59);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (49, '2025-09-30 14:18:51.063518', 60);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (51, '2025-09-30 15:18:53.333092', 62);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (52, '2025-09-30 16:19:50.766831', 64);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (53, '2025-09-30 16:19:51.122635', 65);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (54, '2025-09-30 16:22:06.459826', 66);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (55, '2025-09-30 17:22:13.370096', 67);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (57, '2025-09-30 18:22:23.510675', 69);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (59, '2025-09-30 23:26:20.639814', 71);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (61, '2025-09-30 23:26:35.222864', 72);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (62, '2025-10-01 00:27:04.253013', 74);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (64, '2025-10-01 01:45:45.161060', 76);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (66, '2025-10-01 02:11:44.538029', 78);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (67, '2025-10-01 03:48:55.173718', 79);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (68, '2025-10-01 04:38:08.113100', 83);

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
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist_outstandingtoken`
--
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTE5MjQ1NiwiaWF0IjoxNzU5MTA2MDU2LCJqdGkiOiI3M2FmMzcwZWNjYTA0MzM1OTYzZmIyYTIxN2RlYmYxMCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.KWXX6bhjro3KU6zc1ngDH3CiVhZkQNk57OA8d4Iv43w', '2025-09-29 01:08:33.788000', '2025-09-30 00:34:16', 1, '73af370ecca04335963fb2a217debf10');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTE5NDUyMSwiaWF0IjoxNzU5MTA4MTIxLCJqdGkiOiIwNjIzMTBiYWViYmU0NTYyOTc4YWYxMzkyNjE3ZmZlOCIsInVzZXJfaWQiOiIxIn0.QHz9yu_BZ0edskPmG5opG-fUN6kdgIU5AHkidCKx2cw', '2025-09-29 01:08:41.620000', '2025-09-30 01:08:41', 1, '062310baebbe4562978af1392617ffe8');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTE5NDU5MywiaWF0IjoxNzU5MTA4MTkzLCJqdGkiOiI5MGQ1YjhiOGFkODM0ZjA0YWEyNDc4OTc4ZmQxM2RkYyIsInVzZXJfaWQiOiIxIn0.swoIPQ7pMY2OugONgi3s1xBtQsGbi8hwU8p5RFMfuw4', '2025-09-29 01:09:53.353000', '2025-09-30 01:09:53', 1, '90d5b8b8ad834f04aa2478978fd13ddc');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTE5NTMzNiwiaWF0IjoxNzU5MTA4OTM2LCJqdGkiOiI1NTdiMGU2NjI0MGI0NzA5OGRhM2UyZjg3NmU1ZTgwOSIsInVzZXJfaWQiOiIyIn0.azGe9xo_ATKya52CKFYSph01sYsGZELYA3HUjuL2qZo', '2025-09-29 01:22:16.348000', '2025-09-30 01:22:16', 2, '557b0e66240b47098da3e2f876e5e809');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTE5OTAwMywiaWF0IjoxNzU5MTEyNjAzLCJqdGkiOiIyMTdjODMxZjk4OTc0YTYzYjZhNjMzNjc0ZGZiMDAwZSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.seGNV1G6QjmWvBBUMTWjVIJiKAYdemIUn5KgpV0f-ZQ', '2025-09-29 02:23:23.879000', '2025-09-30 02:23:23', 1, '217c831f98974a63b6a633674dfb000e');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTE5OTAwMywiaWF0IjoxNzU5MTEyNjAzLCJqdGkiOiIyYWYwZjA1NDhiYjE0YTk1YWFhNTg3N2IxYTNmYzQwNCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.kTb-T-xrx0PYSonOSDlBhVvf3_mbexNRidXDyETnKjg', '2025-09-29 02:23:23.883000', '2025-09-30 02:23:23', 1, '2af0f0548bb14a95aaa5877b1a3fc404');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTE5OTI1OSwiaWF0IjoxNzU5MTEyODU5LCJqdGkiOiJhMmQxMDY3NDQ0ZDU0ZTk1OTc2YTQ1ZWViNWI3YzVhYyIsInVzZXJfaWQiOiIyIn0.zG0LBIH3eiO3YiQnHA4-VjF6HA_c5P2QZIAXVNLjOUI', '2025-09-29 02:27:39.445000', '2025-09-30 02:27:39', 2, 'a2d1067444d54e95976a45eeb5b7c5ac');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIwMjg4MSwiaWF0IjoxNzU5MTE2NDgxLCJqdGkiOiJjNTY5Mzk3YjUwNmI0YjQ1YjhmMDRiY2MyYzRmNzA5ZiIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.sROX9BZG6BagE9Pb3OcUAhvD0c0RxkMvM9-ffIOSzdQ', '2025-09-29 03:28:01.164000', '2025-09-30 03:28:01', 2, 'c569397b506b4b45b8f04bcc2c4f709f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIwMjg4MSwiaWF0IjoxNzU5MTE2NDgxLCJqdGkiOiIzOGViYWM5MWUwMzg0YTllYTA1ZDQzYWY4NmEzZDJmZSIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.VvuG-c-cTPBKqdEFet_kwkl0RyJtcKpWS7hTAzaH9Ew', '2025-09-29 03:28:01.167000', '2025-09-30 03:28:01', 2, '38ebac91e0384a9ea05d43af86a3d2fe');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIwNTYwOCwiaWF0IjoxNzU5MTE5MjA4LCJqdGkiOiIzZWJlZTI3MmMwODM0MzFjODVhNWIwNjE1NGY3ODJhZSIsInVzZXJfaWQiOiIxIn0.fyE4FUM9p0271JhR2Q1TiUxCrIlcYdLS-On_b08nEZQ', '2025-09-29 04:13:28.444000', '2025-09-30 04:13:28', 1, '3ebee272c083431c85a5b06154f782ae');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIwOTIzMiwiaWF0IjoxNzU5MTIyODMyLCJqdGkiOiI1MTU1YjUwMzQ1MTY0ZGRlODk1ZTAxZTA3ZmFlZWU1YyIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.OAw_kEBmjHii-0zlmV-TbGZiNSNmsJIHGraVm0BB058', '2025-09-29 05:13:52.831000', '2025-09-30 05:13:52', 1, '5155b50345164dde895e01e07faeee5c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIwOTIzMiwiaWF0IjoxNzU5MTIyODMyLCJqdGkiOiIxNjViMzI2YThmNzA0NDU3YmExNjE2MDQ4ZWE0MWM3MiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.o-pT5Xx1GOeK5r9I3dwiUaohfylcRFTsK7GrX1O1BLA', '2025-09-29 05:13:52.834000', '2025-09-30 05:13:52', 1, '165b326a8f704457ba1616048ea41c72');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (13, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIxMjg1MCwiaWF0IjoxNzU5MTI2NDUwLCJqdGkiOiJjZTg2MTUyYzlmNjc0ODQwYjk1NWY0NjQ3ZWY4YWYxNSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.o_XnIsptyrmDWeB-fuCCq56qrKJQDAbyeqbBZuqZTeY', '2025-09-29 06:14:10.217000', '2025-09-30 06:14:10', 1, 'ce86152c9f674840b955f4647ef8af15');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (14, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIxMjg1MCwiaWF0IjoxNzU5MTI2NDUwLCJqdGkiOiI5NDE3YWZiNWY3NTc0ZWI0OWEwOTk3M2M1N2NhOTE5YyIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.656QA5cbDOaDBLbHqQI2znceTeoq5IMrY3ieQBnA620', '2025-09-29 06:14:10.210000', '2025-09-30 06:14:10', 1, '9417afb5f7574eb49a09973c57ca919c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (15, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIxMjkxMywiaWF0IjoxNzU5MTI2NTEzLCJqdGkiOiI0OTc1ZDYwOTA3YTQ0ZmQyYjZiZGM0N2I5MjZjZmE2YyIsInVzZXJfaWQiOiIxIn0.SiavGSgmwpkUPldqdx0FDy4MASG6paHavNzjVgDkfZI', '2025-09-29 06:15:13.536000', '2025-09-30 06:15:13', 1, '4975d60907a44fd2b6bdc47b926cfa6c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (16, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIxMjk5OCwiaWF0IjoxNzU5MTI2NTk4LCJqdGkiOiI5MDQ4MzkxNWYwZjc0NDVkOTE3OTBhYjFmNGYzZWJiNCIsInVzZXJfaWQiOiIxIn0.qHPpSaGH3l3JV30XdINr7d0V8tn09cYWrAa-_fhIQxU', '2025-09-29 06:16:38.136000', '2025-09-30 06:16:38', 1, '90483915f0f7445d91790ab1f4f3ebb4');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (17, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIxODE2NywiaWF0IjoxNzU5MTMxNzY3LCJqdGkiOiJhOTMxYmIxYzNhZTY0OWRjOWU0MmExNzczYTU2Y2JlMCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.nMqEGUEgEjejysBX4P-XKyHwQVosrM8DT2EJ1d0VCtg', '2025-09-29 07:42:47.580000', '2025-09-30 07:42:47', 1, 'a931bb1c3ae649dc9e42a1773a56cbe0');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (18, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIxODE2NywiaWF0IjoxNzU5MTMxNzY3LCJqdGkiOiJjMzRmNzc5ZWQ0ZDM0MjI2ODZlOWEyMTE0NDlmNzNhMSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.zNWvNs0xnIh488PwGbErXTMrw2kAIMgEz0NCmkTC5Wo', '2025-09-29 07:42:47.590000', '2025-09-30 07:42:47', 1, 'c34f779ed4d3422686e9a211449f73a1');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (19, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIyMjc1OSwiaWF0IjoxNzU5MTM2MzU5LCJqdGkiOiIwMmJjMWRhMzYwNDg0YTIxODFiMWU4ZGFmZjQ1MDZkOCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.wgMzv-erARn0hxIZ6ZnacNaQPI3CAHGPe1WVvh6n3gw', '2025-09-29 08:59:19.436000', '2025-09-30 08:59:19', 1, '02bc1da360484a2181b1e8daff4506d8');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (20, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIyMjc1OSwiaWF0IjoxNzU5MTM2MzU5LCJqdGkiOiJkYmNkM2I0MDgyZmU0Nzc1OWMyMzg3MWYwOWRlZWYwZCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.ZyyRToCaGc_DqJjncgFCEhforARY1un8hZQHlv8OM7I', '2025-09-29 08:59:19.431000', '2025-09-30 08:59:19', 1, 'dbcd3b4082fe47759c23871f09deef0d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (21, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIyNjQwNSwiaWF0IjoxNzU5MTQwMDA1LCJqdGkiOiI0ZTEwNjA4MzIwMjg0YmYzOTI1MzhiZGM0YjI3OTU1YSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.cN1RHMr3IBrY8XyUQ67d6OopmryL78RJ0Lq8D8alBjY', '2025-09-29 10:00:05.142000', '2025-09-30 10:00:05', 1, '4e10608320284bf392538bdc4b27955a');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (22, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIyNjQwNSwiaWF0IjoxNzU5MTQwMDA1LCJqdGkiOiI0ZTk3OWFmNzRmYWM0ZWFlYWMzN2E2MWMxZTY5ZjQ1ZiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.aTwmY0azBvhFIyM0fo_0NbbUTJS_5ir3CR0IbU78KYg', '2025-09-29 10:00:05.138000', '2025-09-30 10:00:05', 1, '4e979af74fac4eaeac37a61c1e69f45f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (23, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIzMTM0NSwiaWF0IjoxNzU5MTQ0OTQ1LCJqdGkiOiJhYzc1M2M3MDg0MGE0ZmE2YjQxNjIxZjVjNDkyMGIyZCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.JASrxFsYFuuPqpSNp_BP2bWyrMz2SxoqDZ8oex9wX7s', '2025-09-29 11:22:25.418000', '2025-09-30 11:22:25', 1, 'ac753c70840a4fa6b41621f5c4920b2d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (24, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIzMTM0NSwiaWF0IjoxNzU5MTQ0OTQ1LCJqdGkiOiIwYTI0NThkNDAwMDE0MzM3YTVkODVhMWUwZDUxNzJlNiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.wGy4WUgylUVJ9KW5duQ5Ybcfin7WOAsvkCmP7urFn-g', '2025-09-29 11:22:25.421000', '2025-09-30 11:22:25', 1, '0a2458d400014337a5d85a1e0d5172e6');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (25, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIzNDk1MSwiaWF0IjoxNzU5MTQ4NTUxLCJqdGkiOiIyMTczZTZmNzc0OGY0MGUzYjIwNTI0YTZmYjZhNWQxMiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.CWUyX3JNSx8IqqYg8RYPbaZTf7Es5WfzAmjf-Ltqo7g', '2025-09-29 12:22:31.032000', '2025-09-30 12:22:31', 1, '2173e6f7748f40e3b20524a6fb6a5d12');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (26, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTIzNDk1MSwiaWF0IjoxNzU5MTQ4NTUxLCJqdGkiOiJlODZiODAzNjc1YjA0ZDY3YThmMTlkOWNjMzFiMzllOCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.rtJRpMAVuhv3WcmWofOCw9uMGiRc4FHsvbCc2Kukx0w', '2025-09-29 12:22:31.035000', '2025-09-30 12:22:31', 1, 'e86b803675b04d67a8f19d9cc31b39e8');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (27, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI0NTA0MSwiaWF0IjoxNzU5MTU4NjQxLCJqdGkiOiIwNjdhN2JkZjZiMDQ0OTU0YmFkZjg4OGFkYTA1Y2RmMSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.f2MLvYSlmyO8MTdebUPZZBwpqJty_v2esfRY3y_NjKA', '2025-09-29 15:10:41.169000', '2025-09-30 15:10:41', 1, '067a7bdf6b044954badf888ada05cdf1');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (28, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI0NTA0MSwiaWF0IjoxNzU5MTU4NjQxLCJqdGkiOiI3Yzk5MDEzZjgyMDU0ODFjYTkyOGU4OTVkZjAzNjc2OSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.sNmfDROukdCGrvfQjou4OeVh1DWinNvXCQzIAldkcu4', '2025-09-29 15:10:41.171000', '2025-09-30 15:10:41', 1, '7c99013f8205481ca928e895df036769');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (29, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI0ODY3MSwiaWF0IjoxNzU5MTYyMjcxLCJqdGkiOiJkMTY1MGNjZGRmNGM0YjkxODlmZmFmODhiNjQwMGNmZiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.W2h2QXioNifWPCsl-o0-dkHWE1rOAf6PXRuSjTD-gd4', '2025-09-29 16:11:11.593000', '2025-09-30 16:11:11', 1, 'd1650ccddf4c4b9189ffaf88b6400cff');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (30, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI0ODkxNSwiaWF0IjoxNzU5MTYyNTE1LCJqdGkiOiIwYmJiNjNlYzEzNjY0MmRiYWU5NDBiYzQ1YmNmN2E2YyIsInVzZXJfaWQiOiIxIn0.-YWZmm_lKyPY_eDsDR6jMit96_QeLIRSawNX-jVMRNs', '2025-09-29 16:15:15.785000', '2025-09-30 16:15:15', 1, '0bbb63ec136642dbae940bc45bcf7a6c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (31, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI1MjU0MywiaWF0IjoxNzU5MTY2MTQzLCJqdGkiOiJlYmFiYWZlZDZlYmM0OGMxYmFhYmRlODY5ZGRhNTg0ZCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.YGc2UDl5qQfS97I0IqmDhYFhD6zra1Qkn9dH4xY3AaQ', '2025-09-29 17:15:43.147000', '2025-09-30 17:15:43', 1, 'ebabafed6ebc48c1baabde869dda584d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (32, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI1MjU0MywiaWF0IjoxNzU5MTY2MTQzLCJqdGkiOiJkYTJhN2Q1NWVlNzY0Y2I3YWFjMDljOGU5MjQ1MTlkZiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.fNm6Sqo-XIbK1yp3E3XDYl0sjVbpfwPtK7MriEBk2AE', '2025-09-29 17:15:43.152000', '2025-09-30 17:15:43', 1, 'da2a7d55ee764cb7aac09c8e924519df');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (33, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI1NjE2NSwiaWF0IjoxNzU5MTY5NzY1LCJqdGkiOiI2YmMwNzZjOTllMDU0ZGE5OTU0ODVhMjRmNjM4NTMyMiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.Mv7nohpBZ7JY41oIMYjMknhGuuxykk8x2_kqCaE7IwM', '2025-09-29 18:16:05.168000', '2025-09-30 18:16:05', 1, '6bc076c99e054da995485a24f6385322');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (34, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI1NjE2NSwiaWF0IjoxNzU5MTY5NzY1LCJqdGkiOiI0Zjg0NjY0NTBhM2Q0ZGZkOWM4YjI4MjYzNmQxZjRhZiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.B7Csi6aKUPtsNLEAlsyWymaRzvSiU4aHD9Ye58zb2aM', '2025-09-29 18:16:05.175000', '2025-09-30 18:16:05', 1, '4f8466450a3d4dfd9c8b282636d1f4af');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (35, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI3NTMzNSwiaWF0IjoxNzU5MTg4OTM1LCJqdGkiOiIwNWRiMjg4ZDI0MTM0YzQ3OGY5MzlhMGUzZDE3NjdiYiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.8nDcB3alHdEwpiWHVmzaJYz3rHqhH1V-avBaLD7KcBc', '2025-09-29 23:35:35.977000', '2025-09-30 23:35:35', 1, '05db288d24134c478f939a0e3d1767bb');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (36, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI3NTM3MiwiaWF0IjoxNzU5MTg4OTcyLCJqdGkiOiIzODViYjc3ZmE0OTM0MGEzOTQ4ZDIxOWQxYzhmMTA2MSIsInVzZXJfaWQiOiIxIn0.pJVnJ_0e9ZbCEXslRmmJSZ0tchBKCaLZjokQs1uQMmg', '2025-09-29 23:36:12.248000', '2025-09-30 23:36:12', 1, '385bb77fa49340a3948d219d1c8f1061');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (37, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI3OTE0NiwiaWF0IjoxNzU5MTkyNzQ2LCJqdGkiOiI2MWQ2MTUwMmM3MGQ0ZTQyYTNjNjJjNDNmOTYwNTM3NCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.ti2HjGUox4OZUtoUWLhQlC1vgmmdz6KRaGFVDdpAL20', '2025-09-30 00:39:06.181000', '2025-10-01 00:39:06', 1, '61d61502c70d4e42a3c62c43f9605374');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (38, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI3OTE0NiwiaWF0IjoxNzU5MTkyNzQ2LCJqdGkiOiI0ZmE2Yjc5NGRlN2U0YTRlYmY4ZjZmNmVmMzQ3NTQ3ZiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.fG0EDJPXt4nGAqxVgSe5iq-povynf28xcLy9zkOvHRo', '2025-09-30 00:39:06.186000', '2025-10-01 00:39:06', 1, '4fa6b794de7e4a4ebf8f6f6ef347547f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (39, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI4MjcwMSwiaWF0IjoxNzU5MTk2MzAxLCJqdGkiOiI2YjI5Y2NiZTg2YWQ0MGUyODUxMzU0MTBkOTNjMTQyNyIsInVzZXJfaWQiOiIxIn0.ofyCF9GlBiURwHdl8n9y_BDQ1WQ_TOkWH3aq-BbTG3s', '2025-09-30 01:38:21.577000', '2025-10-01 01:38:21', 1, '6b29ccbe86ad40e285135410d93c1427');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (40, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI4NzcxNSwiaWF0IjoxNzU5MjAxMzE1LCJqdGkiOiI5MDEyYWZhZDgxYTQ0ZWZiYjg5MjYzOTgwMDI0NmI1NCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.srFT3DlzKg7qTmgqKboedllZ6H_GuCWNZQJv05gNXv8', '2025-09-30 03:01:55.414000', '2025-10-01 03:01:55', 1, '9012afad81a44efbb892639800246b54');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (41, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI4NzcxNSwiaWF0IjoxNzU5MjAxMzE1LCJqdGkiOiJkNmUwN2Q5NDA2YmQ0YTk2OTNlODAyNzczZjA1YWU5MCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.vhG9WJEafPNwNu-moX20_Vo7ryw1QDZfskZiMHheAqk', '2025-09-30 03:01:55.417000', '2025-10-01 03:01:55', 1, 'd6e07d9406bd4a9693e802773f05ae90');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (42, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI5MTMzMywiaWF0IjoxNzU5MjA0OTMzLCJqdGkiOiI4MTM0MjM1YWU0NmU0NTlhYTQ5OWVjZTFhNTk2YmM4ZiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.EhPpLJLWqS8P73r-te7E1W09sucCHMkZ4NrB1PXiaNE', '2025-09-30 04:02:13.283000', '2025-10-01 04:02:13', 1, '8134235ae46e459aa499ece1a596bc8f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (43, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI5MTMzMywiaWF0IjoxNzU5MjA0OTMzLCJqdGkiOiJmMzliY2IwYWE2YmY0ZTE0ODNmNWU3NzVlYmZjOWNhZCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.KrUONGmMjUUu_QXC8VNw8Hw-UByvSiK97lZi66hmLBU', '2025-09-30 04:02:13.286000', '2025-10-01 04:02:13', 1, 'f39bcb0aa6bf4e1483f5e775ebfc9cad');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (44, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI5MjE3NiwiaWF0IjoxNzU5MjA1Nzc2LCJqdGkiOiJjNjk1YmU1YjMzYTY0NDNiYTZkMjY0ZjFmOTZlZWQxOCIsInVzZXJfaWQiOiIyIn0.lQup3IrlxBXlF45HUeWtfDpjRU68zpm6OKOnAsy2xdQ', '2025-09-30 04:16:16.638000', '2025-10-01 04:16:16', 2, 'c695be5b33a6443ba6d264f1f96eed18');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (45, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI5MjY3NywiaWF0IjoxNzU5MjA2Mjc3LCJqdGkiOiJlOTQyYTFlZjQ4N2Y0MGFiYjllOGVhZWUxNjNlNGMwYSIsInVzZXJfaWQiOiIxIn0.4XH9c1hGbmDsdFu7LXeDBB0BzbkMeH9PPLKycVRCsr0', '2025-09-30 04:24:37.162000', '2025-10-01 04:24:37', 1, 'e942a1ef487f40abb9e8eaee163e4c0a');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (46, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI5NjMwMiwiaWF0IjoxNzU5MjA5OTAyLCJqdGkiOiIxYTc2OWM1NjVmZmI0ODYzODJkYzFjNDU4OGQxYmFiZSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.GiTd6MhPk2qJ2R1B098RGXeIQ4V5h0fgJ2d-4GR_rlc', '2025-09-30 05:25:02.115000', '2025-10-01 05:25:02', 1, '1a769c565ffb486382dc1c4588d1babe');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (47, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI5NjMwMiwiaWF0IjoxNzU5MjA5OTAyLCJqdGkiOiIwNWZkOTNkMDk1N2U0YThkYTI1OGY1Zjk0MTEzNGRiNiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.7i-7BNXGPbOXbVKQgSKxo-uzL_pfUOZjODkaZ031xxw', '2025-09-30 05:25:02.118000', '2025-10-01 05:25:02', 1, '05fd93d0957e4a8da258f5f941134db6');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (48, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTI5OTkwNSwiaWF0IjoxNzU5MjEzNTA1LCJqdGkiOiI0MTRmNDRhMzI5OTQ0YmJkYThmYWZhMDUyZjBjNGNjZCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.Mdl0ri6XCEf6lzLBSXihw326GnI-Xt9KEp9o--c7pEM', '2025-09-30 06:25:05.122000', '2025-10-01 06:25:05', 1, '414f44a329944bbda8fafa052f0c4ccd');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (49, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMwNTcyNiwiaWF0IjoxNzU5MjE5MzI2LCJqdGkiOiIyMGFlZTMwMmE5YWE0ZWIyYmVmYThjYmNmNDRiZGE4OCIsInVzZXJfaWQiOiIxIn0.Q9DzSUWyVr-k6EH5R3WCSGFqIQAlkh1zsZmOnYHKFso', '2025-09-30 08:02:06.014000', '2025-10-01 08:02:06', 1, '20aee302a9aa4eb2befa8cbcf44bda88');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (50, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMwOTM0MCwiaWF0IjoxNzU5MjIyOTQwLCJqdGkiOiI1Yzg0YzBlYzRkNTc0ZTdiOTg2OTI2ZjY1YWM3NTljNCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.bkdcQcf3tLX8FefnHFSTx_cWFQ42xoLhuHrlPAPsBgM', '2025-09-30 09:02:20.117000', '2025-10-01 09:02:20', 1, '5c84c0ec4d574e7b986926f65ac759c4');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (51, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMwOTM0MCwiaWF0IjoxNzU5MjIyOTQwLCJqdGkiOiJlZWFlZDkwZDhhNWM0NmY4ODg1OWUwZDRmNWY0ZTE4NiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.8f9-r4FMbR6pqzPCemkLrnFXbMP9ia6wGF_IDzGY7Nc', '2025-09-30 09:02:20.127000', '2025-10-01 09:02:20', 1, 'eeaed90d8a5c46f88859e0d4f5f4e186');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (52, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMxMjAxMywiaWF0IjoxNzU5MjI1NjEzLCJqdGkiOiIxZjdkYzg0MGNhMjU0NWU0OGFmN2Q2ZGMyMDAxODllYiIsInVzZXJfaWQiOiIzIn0.ocMAnGv3rKnDrtg7EaRUBPGZ_3VIPMLqKKNjLmYlFFE', '2025-09-30 09:46:53.164000', '2025-10-01 09:46:53', NULL, '1f7dc840ca2545e48af7d6dc200189eb');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (53, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMxMzEyOSwiaWF0IjoxNzU5MjI2NzI5LCJqdGkiOiJlM2VmNzFlM2RlZDM0MWVjOGFmMmY4Y2M4NDRhNjg4ZSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.3GcQHJe8I0awyCczse_Y37ybzdClqGPTltkd9tA7P_Q', '2025-09-30 10:05:29.691000', '2025-10-01 10:05:29', 1, 'e3ef71e3ded341ec8af2f8cc844a688e');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (54, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMxMzEyOSwiaWF0IjoxNzU5MjI2NzI5LCJqdGkiOiI3NDAyYjdmZmVmZjY0Y2RjOWNmNGEzYmZmMTZjNjUxOSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.Dv0kezittPvwMaxdQ2FBIHs5JCF8QIheh7PSaKED1Q4', '2025-09-30 10:05:29.779000', '2025-10-01 10:05:29', 1, '7402b7ffeff64cdc9cf4a3bff16c6519');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (55, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMyMDU0NSwiaWF0IjoxNzU5MjM0MTQ1LCJqdGkiOiJkNmNkZDZhN2E3NDc0OTkxOWEyMTM2MmNjZGM4ZWFiNSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.X88Ll7dNrtK3QVGytkD-tSKmMM0On9oa0swe2MOPhAc', '2025-09-30 12:09:05.045065', '2025-10-01 12:09:05', 1, 'd6cdd6a7a74749919a21362ccdc8eab5');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (56, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMyMDU0NSwiaWF0IjoxNzU5MjM0MTQ1LCJqdGkiOiJlZjgwMTg1OTUyOTY0MzE1OTA1M2YyZTQ2ZTRlZjhhOCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.86hS-xOYfg51q5VhQbaWYEszX4FTWOgisaFdUyG_WI4', '2025-09-30 12:09:05.048537', '2025-10-01 12:09:05', 1, 'ef801859529643159053f2e46e4ef8a8');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (57, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMyMDg0NiwiaWF0IjoxNzU5MjM0NDQ2LCJqdGkiOiI0YjhhY2Y4NjJlNDU0OGIyYjBiZDgyZDg3MjRkZGEyYyIsInVzZXJfaWQiOiIyIn0.xtMVKKjQrSRWypRKcsVDmVJUzk4dcH7Y-3GS3y5zRsc', '2025-09-30 12:14:06.118119', '2025-10-01 12:14:06', 2, '4b8acf862e4548b2b0bd82d8724dda2c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (58, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMyNDQ2NywiaWF0IjoxNzU5MjM4MDY3LCJqdGkiOiI2NjAyYjViYzc1NDY0ZDE4OTU0MWQwNDc1NTZjODJmYiIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.ylGSZR3u2XtVHR2xHLWDmWCDZN7Y59-wE1TT_8Lglzc', '2025-09-30 13:14:27.925144', '2025-10-01 13:14:27', 2, '6602b5bc75464d189541d047556c82fb');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (59, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMyNDQ2NywiaWF0IjoxNzU5MjM4MDY3LCJqdGkiOiJmYTcwMTcwODExYTU0NmU5YmE4MjU1OTcyZGQ1MTkzNyIsInVzZXJfaWQiOiIyIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.Rwyo-tkNPiRep1ud1RucRhkGFZWhzSuzhcI1vh_87nQ', '2025-09-30 13:14:27.941526', '2025-10-01 13:14:27', 2, 'fa70170811a546e9ba8255972dd51937');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (60, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMyNDY3MiwiaWF0IjoxNzU5MjM4MjcyLCJqdGkiOiI4MWI5NGE0OTAxYzE0ZGEwYWRiMGQ1MjFkNmU2NTY0MCIsInVzZXJfaWQiOiIxIn0.7kvv1uTnZGpZH0pbTeKiUGh1azgLO433do9vmkS5X0k', '2025-09-30 13:17:52.609763', '2025-10-01 13:17:52', 1, '81b94a4901c14da0adb0d521d6e65640');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (61, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMyODMzMSwiaWF0IjoxNzU5MjQxOTMxLCJqdGkiOiIwYzczOTZmZmRmZTg0YjQzOTZjNmM3MzAyN2YxMTdmMiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.3dgjqFIRzSi4bZ9vQclyROGx3BsZ4FEL2h7snZGxXPw', '2025-09-30 14:18:51.044039', '2025-10-01 14:18:51', 1, '0c7396ffdfe84b4396c6c73027f117f2');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (62, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMyODMzMSwiaWF0IjoxNzU5MjQxOTMxLCJqdGkiOiIwN2Y1OWNiMTg0MDM0Mzg4YmU1ODY2OTM5OWM5NmZiNSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.yIWO90ncJduCk7U5ncJ_dQ9pCgWw5gSi_SHWsU8e3A4', '2025-09-30 14:18:51.040226', '2025-10-01 14:18:51', 1, '07f59cb184034388be58669399c96fb5');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (63, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMzMTkzMywiaWF0IjoxNzU5MjQ1NTMzLCJqdGkiOiJhMzA0OTY0MGE1ZTI0M2Y3OTk1NjUwNDkzM2YyM2NhZSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.uG58dr8HS_Xmh7qHWw-cw80pJyLggUleky5BO4YEkgY', '2025-09-30 15:18:53.309196', '2025-10-01 15:18:53', 1, 'a3049640a5e243f79956504933f23cae');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (64, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMzMTkzMywiaWF0IjoxNzU5MjQ1NTMzLCJqdGkiOiIyOWM2NzkwYWQ0ODQ0NzQzYjVlOTc5N2E3YWVjMWQ4YiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.yFBxTNOTgP8fvZFiFBpBoHx4f8bzV351M1Gc1Aak9hg', '2025-09-30 15:18:53.305210', '2025-10-01 15:18:53', 1, '29c6790ad4844743b5e9797a7aec1d8b');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (65, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMzNTU5MCwiaWF0IjoxNzU5MjQ5MTkwLCJqdGkiOiJjM2ZkMmZlMDI0NGQ0YzUyODFkZjljOGQzNjUxYWRiNiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.ZWBwzc9mI437HgIRiii5YJFLBYSyW_DFecuCrmo7Ukc', '2025-09-30 16:19:50.736338', '2025-10-01 16:19:50', 1, 'c3fd2fe0244d4c5281df9c8d3651adb6');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (66, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMzNTU5MSwiaWF0IjoxNzU5MjQ5MTkxLCJqdGkiOiJkN2I1Y2VkMTg3OTU0ZmZhYjE1ZDA3YjlhYTU3NTY0NSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.BKGWxPXw42vABcY0uxXRjGF-SBd9TJVS5U5aXjVdyZE', '2025-09-30 16:19:51.107193', '2025-10-01 16:19:51', 1, 'd7b5ced187954ffab15d07b9aa575645');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (67, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMzNTczMywiaWF0IjoxNzU5MjQ5MzMzLCJqdGkiOiJkNzllNmNiZmJkMmE0ZGZhODU4MjlkYThjMmZiMzg5MSIsInVzZXJfaWQiOiIxIn0.iz2M98e2VlBLi1JuLq1UrM5dP2pOxlLsAmpY_y4XP9Y', '2025-09-30 16:22:13.947108', '2025-10-01 16:22:13', 1, 'd79e6cbfbd2a4dfa85829da8c2fb3891');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (68, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMzOTMzMywiaWF0IjoxNzU5MjUyOTMzLCJqdGkiOiI3Y2MzNzVkMTRlMjU0N2Q2YTUxMzg1ZGM4N2VhNTIzOSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.IpGvSk3xof8O4LvhRCeowH_tSEfT9zde1Euhbme17mg', '2025-09-30 17:22:13.329190', '2025-10-01 17:22:13', 1, '7cc375d14e2547d6a51385dc87ea5239');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (69, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTMzOTMzMywiaWF0IjoxNzU5MjUyOTMzLCJqdGkiOiJhOTNiNjIzOWQyMTk0NTg2OGIwMWU5NjE2OTk4ODA2NyIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.QLc3dFqwKYRKMbQ46afA1-vas91pG2wD05vLM5jk9TM', '2025-09-30 17:22:13.341768', '2025-10-01 17:22:13', 1, 'a93b6239d21945868b01e96169988067');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (70, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM0Mjk0MywiaWF0IjoxNzU5MjU2NTQzLCJqdGkiOiJjNWYwMWE0MGZhNmQ0MTFmYmUwNzU1MWM0MTRhZGQwYyIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.7xP8ItRJJX9ywDfFfIcFxHktE6isFplF8nMyU0Y6sEM', '2025-09-30 18:22:23.462002', '2025-10-01 18:22:23', 1, 'c5f01a40fa6d411fbe07551c414add0c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (71, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM0Mjk0MywiaWF0IjoxNzU5MjU2NTQzLCJqdGkiOiJmODRlMjFjNzJhMjk0N2FkYWFiZTVlYmNhZWJmZmJmMCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.Wcuqez-6PnTP3SR7pQKm0HGdguiBqOuEhfUugCLqYhw', '2025-09-30 18:22:23.476082', '2025-10-01 18:22:23', 1, 'f84e21c72a2947adaabe5ebcaebffbf0');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (72, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM2MTE4MCwiaWF0IjoxNzU5Mjc0NzgwLCJqdGkiOiJjNGJkMDY1MWU5ODI0YmQ2YWY2MzVhMTY2ZGFmYTc0ZSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.lKk-WgaB2Ehv0lU35gHpDww3WVOSuXC94Ps4PLEj5jQ', '2025-09-30 23:26:20.578046', '2025-10-01 23:26:20', 1, 'c4bd0651e9824bd6af635a166dafa74e');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (73, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM2MTE4MCwiaWF0IjoxNzU5Mjc0NzgwLCJqdGkiOiJmNmY2NjcxNjA3YTU0ZjBiOGZhOGQzYmY2YmM2MTE0NiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.XPEoCkaKjX5A839sjS2BXOki-JADTO1L2BLF0_O1Cpk', '2025-09-30 23:26:20.604796', '2025-10-01 23:26:20', 1, 'f6f6671607a54f0b8fa8d3bf6bc61146');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (74, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM2MTE5NSwiaWF0IjoxNzU5Mjc0Nzk1LCJqdGkiOiI1ZjlkOTg1ZDdkNjE0MzgyOTc1YzkwMWMyMzIxMzBkNiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.z7_cP-MdbE9jbfevW0hqXeeits1zI3jouaVoX7ckQhM', '2025-09-30 23:26:35.210902', '2025-10-01 23:26:35', 1, '5f9d985d7d614382975c901c232130d6');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (75, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM2NDgyNCwiaWF0IjoxNzU5Mjc4NDI0LCJqdGkiOiI3MjE3Yjc5NDM3MjM0N2UwYmE5MjdjMDUyYmI5YTljYyIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.4wIg3DyIDl5uvUnsFGDMBBgNmAFDHaHR9PjeoUJmXTA', '2025-10-01 00:27:04.234549', '2025-10-02 00:27:04', 1, '7217b794372347e0ba927c052bb9a9cc');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (76, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM2NDgyNCwiaWF0IjoxNzU5Mjc4NDI0LCJqdGkiOiI4MGY5ZWUzM2YyNDU0ZTBmOTE5YzI5N2ZlODg3ZWUzZiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.7_3kt4_i2MucvOsfTxiEXcHLmffqAyWj4NOAGUfYp90', '2025-10-01 00:27:04.238169', '2025-10-02 00:27:04', 1, '80f9ee33f2454e0f919c297fe887ee3f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (77, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM2OTU0NSwiaWF0IjoxNzU5MjgzMTQ1LCJqdGkiOiI5Zjc5ZjNjOTM5ZDY0MDQ1OTI3OTY2YzBjZDRiMGMxMCIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.WqPGRRk4znEZNS6BQWdqd4KOHGOj7ntN0LBzEnSVO6E', '2025-10-01 01:45:45.143771', '2025-10-02 01:45:45', 1, '9f79f3c939d64045927966c0cd4b0c10');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (78, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM2OTU0NSwiaWF0IjoxNzU5MjgzMTQ1LCJqdGkiOiJmOGFiNTUzNTA0ODM0ZTNiOTk3NzMzZDA4NWEzYWVlYyIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.gjUfa321kbfbTjwFmk34L0ENNyOh7jf_-kUJ72vgBVM', '2025-10-01 01:45:45.140178', '2025-10-02 01:45:45', 1, 'f8ab553504834e3b997733d085a3aeec');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (79, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM3Mjg5NiwiaWF0IjoxNzU5Mjg2NDk2LCJqdGkiOiI4MWVhOTFkOTQ3YTk0NGU1OWE1YmFmYTBiMmUwMjJiYiIsInVzZXJfaWQiOiIxIn0.naviXA6JPkCsnDkBhqEV62ClOyh4x_i46XJV_FxwHQU', '2025-10-01 02:41:36.967124', '2025-10-02 02:41:36', 1, '81ea91d947a944e59a5bafa0b2e022bb');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (80, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM3MzUyMiwiaWF0IjoxNzU5Mjg3MTIyLCJqdGkiOiJiZjFmNWVjMmY0Mzg0NDRlYTEwM2M1MWVjYzRiZDAyOCIsInVzZXJfaWQiOiI0In0.yrrETbaTVqRmRsWbKejyanlRuOf7pFs43F4rikTVPdo', '2025-10-01 02:52:02.345662', '2025-10-02 02:52:02', 4, 'bf1f5ec2f438444ea103c51ecc4bd028');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (81, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM3NjkzNSwiaWF0IjoxNzU5MjkwNTM1LCJqdGkiOiI5YTljYzZiNGE3Mjg0OWQxOTNjZWI2NjJkNTc0NWMyNSIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.985gu9PEJc0HkGmQDyb8KhRaZlAZZwNRFCTmmiGVtPs', '2025-10-01 03:48:55.114777', '2025-10-02 03:48:55', 1, '9a9cc6b4a72849d193ceb662d5745c25');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (82, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM3NjkzNSwiaWF0IjoxNzU5MjkwNTM1LCJqdGkiOiJlNzg1NjFjMmE0ZjA0MDk4OGYzNjc5YTcwZjU4NzhmMiIsInVzZXJfaWQiOiIxIiwibXVzdF9jaGFuZ2VfcGFzc3dvcmQiOmZhbHNlfQ.0mv0ZKfrG5XQeVfmEnFmQA1zTWS4NBaGAokboPLyw7o', '2025-10-01 03:48:55.107954', '2025-10-02 03:48:55', 1, 'e78561c2a4f040988f3679a70f5878f2');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (83, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM3NzE3NiwiaWF0IjoxNzU5MjkwNzc2LCJqdGkiOiJkNWY5MjJjNDFjYjc0MDMwODJjMWJkZDQ5MzBjODFjNSIsInVzZXJfaWQiOiIxIn0.W5Y3_9hObh3oJMmD-ZB9zbnJnzgdL55gQNnh3KF0UWw', '2025-10-01 03:52:56.604607', '2025-10-02 03:52:56', 1, 'd5f922c41cb7403082c1bdd4930c81c5');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (84, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM4MDEwNSwiaWF0IjoxNzU5MjkzNzA1LCJqdGkiOiJiN2FkMWVlMzY1NTA0OTc3YTA4MjBjMGI0NTNmY2EwNyIsInVzZXJfaWQiOiIzIn0.ajTGnEaIxSXzhB92ZiZQQ0_k6OlqALXuOkhUIrAy2_Q', '2025-10-01 04:41:45.958866', '2025-10-02 04:41:45', 3, 'b7ad1ee365504977a0820c0b453fca07');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (85, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM4MDE4NCwiaWF0IjoxNzU5MjkzNzg0LCJqdGkiOiIxOTJhMTM0MDhiOTI0NjExYjQ0M2JlMDJjYjZlNTQzOCIsInVzZXJfaWQiOiIxIn0.n4wG83-J4ejDVuSJuq2mJdfwx86A5sNvdQKd4UPsVIY', '2025-10-01 04:43:04.363322', '2025-10-02 04:43:04', 1, '192a13408b924611b443be02cb6e5438');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (86, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTM4MDI4MywiaWF0IjoxNzU5MjkzODgzLCJqdGkiOiJlZGViMzc5MjNiZjE0OWI3OGM0YWY4M2ZhN2JhOGFkZCIsInVzZXJfaWQiOiI1In0.VM5MXbE1abyGuAR6L4EEAzs1edJWrdjGV4vm43r1ek8', '2025-10-01 04:44:43.938483', '2025-10-02 04:44:43', 5, 'edeb37923bf149b78c4af83fa7ba8add');

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
  `last_name` varchar(150) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `middle_name` varchar(150) NOT NULL,
  `section` varchar(50) DEFAULT NULL,
  `userlevel` varchar(50) NOT NULL,
  `is_first_login` tinyint(1) NOT NULL,
  `must_change_password` tinyint(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `district` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users_user`
--
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `last_name`, `is_staff`, `is_active`, `date_joined`, `middle_name`, `section`, `userlevel`, `is_first_login`, `must_change_password`, `updated_at`, `district`) VALUES (1, 'pbkdf2_sha256$600000$E2mCfSBbFdFKmhf4VD6FcH$rbH//+9050N6Tu6kbS5SXH69C8BKvzjGK/zyTeR209w=', '2025-10-01 02:40:54', 1, 'admin@example.com', 'Administrator', '', 1, 1, '2025-09-29 01:07:21', '', NULL, 'Admin', 0, 0, '2025-10-01 03:31:47.700986', NULL);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `last_name`, `is_staff`, `is_active`, `date_joined`, `middle_name`, `section`, `userlevel`, `is_first_login`, `must_change_password`, `updated_at`, `district`) VALUES (2, 'pbkdf2_sha256$600000$RQ9zEfusVCwaG97ckEHpdA$ELjr4hH8006hkiSYvtlcmwfjuLwKuWnFM+e2z+pD0Zk=', NULL, 0, '22101222@slc-sflu.edu.ph', 'JERICHO', 'URBANO', 0, 1, '2025-09-29 01:22:05.601000', 'SOTELO', NULL, 'Legal Unit', 0, 0, '2025-10-01 04:49:08.675261', NULL);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `last_name`, `is_staff`, `is_active`, `date_joined`, `middle_name`, `section`, `userlevel`, `is_first_login`, `must_change_password`, `updated_at`, `district`) VALUES (3, 'pbkdf2_sha256$600000$90aMbdhfs5AycarR2QK28C$sZhdMMIgBZyaK8C8Y1C2fh+ngekPRCKD/m7L3A4DVog=', NULL, 0, 'jerichourb.01.01.04@gmail.com', 'MONITORING1', 'SAMPLE', 0, 1, '2025-09-30 09:46:24.537000', 'EMB', 'RA-6969', 'Monitoring Personnel', 0, 0, '2025-10-01 04:42:15.019582', NULL);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `last_name`, `is_staff`, `is_active`, `date_joined`, `middle_name`, `section`, `userlevel`, `is_first_login`, `must_change_password`, `updated_at`, `district`) VALUES (4, 'pbkdf2_sha256$600000$WuqYFNJhh38oNDFZTCK5pA$VEW3bCh8kdwhONRWWTbgJq6hFEBXjKN9g9V5wWRQOTo=', NULL, 0, 'echo.010104@gmail.com', 'SECTION', 'TOXIC', 0, 1, '2025-10-01 02:51:54.301005', 'CHIEF', 'RA-6969', 'Section Chief', 1, 0, '2025-10-01 04:43:24.713545', NULL);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `last_name`, `is_staff`, `is_active`, `date_joined`, `middle_name`, `section`, `userlevel`, `is_first_login`, `must_change_password`, `updated_at`, `district`) VALUES (5, 'pbkdf2_sha256$600000$KAgIrkZxCGjFQkCUw5foCt$4i3Z2fRkvNgcXosi206cspjxU6pOvnMxvMgynQZCt+I=', NULL, 0, 'division@example.com', 'DIVISION', 'SAMPLE', 0, 1, '2025-10-01 04:44:37.036541', 'SAMPLE', NULL, 'Division Chief', 1, 0, '2025-10-01 04:44:38.537213', NULL);

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
