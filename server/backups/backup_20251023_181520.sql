-- MySQL dump created by Python
-- Database: db_ierms
-- Server: 127.0.0.1:3306
-- Generated: 2025-10-23 18:15:21
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
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_activitylog`
--
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (1, 'create', 'New user account created: admin@example.com with auto-generated password', NULL, '', '2025-10-23 09:50:41.912806', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (2, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-23 09:51:15.564616', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (3, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 09:52:22.567671', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (4, 'create', 'New user account created: jerichourbano.01.01.04@gmail.com with auto-generated password', NULL, '', '2025-10-23 09:53:30.819444', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (5, 'create', 'New user registered: jerichourbano.01.01.04@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 09:53:34.292862', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (6, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-23 09:54:20.740522', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (7, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-23 09:54:43.308822', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (8, 'update', 'First-time password set for jerichourbano.01.01.04@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 09:54:43.311218', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (9, 'update', 'User account updated: jerichourbano.01.01.04@gmail.com', NULL, '', '2025-10-23 09:54:50.862886', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (10, 'create', 'New user account created: 22101222@slc-sflu.edu.ph with auto-generated password', NULL, '', '2025-10-23 09:56:06.407916', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (11, 'create', 'New user registered: 22101222@slc-sflu.edu.ph with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 09:56:10.122321', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (12, 'create', 'New user account created: echo.010104@gmail.com with auto-generated password', NULL, '', '2025-10-23 09:58:11.574596', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (13, 'create', 'New user registered: echo.010104@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 09:58:18.068444', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (14, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-23 10:01:14.604070', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (15, 'login_failed', 'Failed login attempt for 22101222@slc-sflu.edu.ph (attempt #1)', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 10:01:14.606979', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (16, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-23 10:01:14.615244', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (17, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-23 10:01:24.242886', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (18, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-23 10:01:24.252826', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (19, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-23 10:01:38.903706', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (20, 'update', 'First-time password set for 22101222@slc-sflu.edu.ph', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 10:01:38.906541', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (21, 'update', 'User account updated: 22101222@slc-sflu.edu.ph', NULL, '', '2025-10-23 10:01:55.041260', 3);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (22, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-23 10:05:46.042276', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (23, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-23 10:06:02.963614', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (24, 'update', 'First-time password set for echo.010104@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-23 10:06:02.967998', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (25, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-23 10:06:23.998160', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (26, 'login_failed', 'Failed login attempt for echo.010104@gmail.com (attempt #1)', '127.0.0.1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36', '2025-10-23 10:06:24.002277', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (27, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-23 10:06:24.024999', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (28, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-23 10:06:32.393584', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (29, 'update', 'User account updated: echo.010104@gmail.com', NULL, '', '2025-10-23 10:06:32.418855', 4);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (30, 'create', 'New user account created: emee46990@gmail.com with auto-generated password', NULL, '', '2025-10-23 10:07:35.604979', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (31, 'create', 'New user registered: emee46990@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 10:07:38.148836', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (32, 'update', 'User account updated: emee46990@gmail.com', NULL, '', '2025-10-23 10:13:02.901249', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (33, 'update', 'User account updated: emee46990@gmail.com', NULL, '', '2025-10-23 10:13:21.751601', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (34, 'update', 'First-time password set for emee46990@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 10:13:21.754212', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (35, 'update', 'User account updated: emee46990@gmail.com', NULL, '', '2025-10-23 10:14:56.789990', 5);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (36, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-23 10:15:13.543647', 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (65, 'Can add inspection form', 17, 'add_inspectionform');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (66, 'Can change inspection form', 17, 'change_inspectionform');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (67, 'Can delete inspection form', 17, 'delete_inspectionform');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (68, 'Can view inspection form', 17, 'view_inspectionform');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (69, 'Can add Notice of Order', 18, 'add_noticeoforder');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (70, 'Can change Notice of Order', 18, 'change_noticeoforder');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (71, 'Can delete Notice of Order', 18, 'delete_noticeoforder');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (72, 'Can view Notice of Order', 18, 'view_noticeoforder');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (73, 'Can add Notice of Violation', 19, 'add_noticeofviolation');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (74, 'Can change Notice of Violation', 19, 'change_noticeofviolation');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (75, 'Can delete Notice of Violation', 19, 'delete_noticeofviolation');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (76, 'Can view Notice of Violation', 19, 'view_noticeofviolation');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (77, 'Can add System Configuration', 20, 'add_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (78, 'Can change System Configuration', 20, 'change_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (79, 'Can delete System Configuration', 20, 'delete_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (80, 'Can view System Configuration', 20, 'view_systemconfiguration');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (81, 'Can add Accomplishment Report', 21, 'add_accomplishmentreport');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (82, 'Can change Accomplishment Report', 21, 'change_accomplishmentreport');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (83, 'Can delete Accomplishment Report', 21, 'delete_accomplishmentreport');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (84, 'Can view Accomplishment Report', 21, 'view_accomplishmentreport');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (85, 'Can add Report Metric', 22, 'add_reportmetric');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (86, 'Can change Report Metric', 22, 'change_reportmetric');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (87, 'Can delete Report Metric', 22, 'delete_reportmetric');
INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES (88, 'Can view Report Metric', 22, 'view_reportmetric');

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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_content_type`
--
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (1, 'admin', 'logentry');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (11, 'audit', 'activitylog');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (3, 'auth', 'group');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (2, 'auth', 'permission');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (4, 'contenttypes', 'contenttype');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (9, 'establishments', 'establishment');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (12, 'inspections', 'billingrecord');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (13, 'inspections', 'compliancequota');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (14, 'inspections', 'inspection');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (15, 'inspections', 'inspectiondocument');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (17, 'inspections', 'inspectionform');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (16, 'inspections', 'inspectionhistory');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (18, 'inspections', 'noticeoforder');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (19, 'inspections', 'noticeofviolation');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (10, 'notifications', 'notification');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (21, 'reports', 'accomplishmentreport');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (22, 'reports', 'reportmetric');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (5, 'sessions', 'session');
INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES (20, 'system_config', 'systemconfiguration');
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
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_migrations`
--
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (1, 'contenttypes', '0001_initial', '2025-10-23 09:47:50.957871');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (2, 'contenttypes', '0002_remove_content_type_name', '2025-10-23 09:47:51.402869');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (3, 'auth', '0001_initial', '2025-10-23 09:47:52.629093');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (4, 'auth', '0002_alter_permission_name_max_length', '2025-10-23 09:47:53.170850');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (5, 'auth', '0003_alter_user_email_max_length', '2025-10-23 09:47:53.378066');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (6, 'auth', '0004_alter_user_username_opts', '2025-10-23 09:47:53.406384');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (7, 'auth', '0005_alter_user_last_login_null', '2025-10-23 09:47:53.437205');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (8, 'auth', '0006_require_contenttypes_0002', '2025-10-23 09:47:53.452641');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (9, 'auth', '0007_alter_validators_add_error_messages', '2025-10-23 09:47:53.490582');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (10, 'auth', '0008_alter_user_username_max_length', '2025-10-23 09:47:53.781131');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (11, 'auth', '0009_alter_user_last_name_max_length', '2025-10-23 09:47:54.026659');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (12, 'auth', '0010_alter_group_name_max_length', '2025-10-23 09:47:54.253348');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (13, 'auth', '0011_update_proxy_permissions', '2025-10-23 09:47:54.459082');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (14, 'auth', '0012_alter_user_first_name_max_length', '2025-10-23 09:47:54.546418');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (15, 'users', '0001_initial', '2025-10-23 09:47:56.637205');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (16, 'admin', '0001_initial', '2025-10-23 09:47:57.803892');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (17, 'admin', '0002_logentry_remove_auto_add', '2025-10-23 09:47:58.514851');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (18, 'admin', '0003_logentry_add_action_flag_choices', '2025-10-23 09:47:58.771499');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (19, 'audit', '0001_initial', '2025-10-23 09:47:59.426578');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (20, 'audit', '0002_initial', '2025-10-23 09:47:59.685457');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (21, 'establishments', '0001_initial', '2025-10-23 09:47:59.852783');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (22, 'inspections', '0001_initial', '2025-10-23 09:48:00.918066');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (23, 'inspections', '0002_initial', '2025-10-23 09:48:06.830573');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (24, 'notifications', '0001_initial', '2025-10-23 09:48:06.892752');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (25, 'notifications', '0002_initial', '2025-10-23 09:48:09.015550');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (26, 'reports', '0001_initial', '2025-10-23 09:48:10.093556');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (27, 'reports', '0002_initial', '2025-10-23 09:48:10.511669');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (28, 'sessions', '0001_initial', '2025-10-23 09:48:10.737222');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (29, 'system_config', '0001_initial', '2025-10-23 09:48:10.817144');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (30, 'token_blacklist', '0001_initial', '2025-10-23 09:48:12.042412');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (31, 'token_blacklist', '0002_outstandingtoken_jti_hex', '2025-10-23 09:48:12.224789');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (32, 'token_blacklist', '0003_auto_20171017_2007', '2025-10-23 09:48:12.539583');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (33, 'token_blacklist', '0004_auto_20171017_2013', '2025-10-23 09:48:13.166802');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (34, 'token_blacklist', '0005_remove_outstandingtoken_jti', '2025-10-23 09:48:13.377548');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (35, 'token_blacklist', '0006_auto_20171017_2113', '2025-10-23 09:48:13.607553');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (36, 'token_blacklist', '0007_auto_20171017_2214', '2025-10-23 09:48:16.589662');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (37, 'token_blacklist', '0008_migrate_to_bigautofield', '2025-10-23 09:48:18.365069');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (38, 'token_blacklist', '0010_fix_migrate_to_bigautofield', '2025-10-23 09:48:18.611978');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (39, 'token_blacklist', '0011_linearizes_history', '2025-10-23 09:48:18.619876');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (40, 'token_blacklist', '0012_alter_outstandingtoken_user', '2025-10-23 09:48:18.791616');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (41, 'token_blacklist', '0013_alter_blacklistedtoken_options_and_more', '2025-10-23 09:48:18.960606');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `establishments_establishment`
--

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `billing_code` (`billing_code`),
  UNIQUE KEY `inspection_id` (`inspection_id`),
  KEY `inspections_billingrecord_issued_by_id_0e4654b9_fk_users_user_id` (`issued_by_id`),
  KEY `inspections_billing_c5e0c5_idx` (`billing_code`),
  KEY `inspections_establi_edae83_idx` (`establishment_id`),
  KEY `inspections_created_9b7da4_idx` (`created_at`),
  KEY `inspections_related_d892c1_idx` (`related_law`),
  CONSTRAINT `inspections_billingr_establishment_id_c0d2c8c0_fk_establish` FOREIGN KEY (`establishment_id`) REFERENCES `establishments_establishment` (`id`),
  CONSTRAINT `inspections_billingr_inspection_id_c11afb13_fk_inspectio` FOREIGN KEY (`inspection_id`) REFERENCES `inspections_inspection` (`id`),
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
  `quarter` int(11) NOT NULL,
  `target` int(11) NOT NULL,
  `auto_adjusted` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `created_by_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inspections_compliancequota_law_year_quarter_de359e7e_uniq` (`law`,`year`,`quarter`),
  KEY `inspections_complian_created_by_id_f82088ee_fk_users_use` (`created_by_id`),
  KEY `inspections_law_bed71c_idx` (`law`,`year`,`quarter`),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_inspectionhistory`
--

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
  PRIMARY KEY (`inspection_form_id`),
  KEY `inspections_noticeof_sent_by_id_21f4d16f_fk_users_use` (`sent_by_id`),
  CONSTRAINT `inspections_noticeof_inspection_form_id_7af69606_fk_inspectio` FOREIGN KEY (`inspection_form_id`) REFERENCES `inspections_inspectionform` (`inspection_id`),
  CONSTRAINT `inspections_noticeof_sent_by_id_21f4d16f_fk_users_use` FOREIGN KEY (`sent_by_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inspections_noticeofviolation`
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications_notification`
--
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (1, 'new_user', 'New Division Chief Created', 'A new Division Chief (jerichourbano.01.01.04@gmail.com) has been created.', 0, '', NULL, '2025-10-23 09:53:34.333747', 2, 2, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (2, 'new_user', 'New Section Chief Created', 'A new Section Chief (22101222@slc-sflu.edu.ph) created for section: PD-1586,RA-8749,RA-9275.', 0, '', NULL, '2025-10-23 09:56:10.159290', 2, 3, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (3, 'new_user', 'New Unit Head Created', 'A new Unit Head (echo.010104@gmail.com) created for section: PD-1586.', 0, '', NULL, '2025-10-23 09:58:18.291581', 2, 4, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (4, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (emee46990@gmail.com) created for section: PD-1586.', 0, '', NULL, '2025-10-23 10:07:38.172802', 2, 5, 2);
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `related_object_type`, `related_object_id`, `created_at`, `recipient_id`, `sender_id`, `user_id`) VALUES (5, 'new_user', 'New Monitoring Personnel Created', 'New Monitoring Personnel (emee46990@gmail.com) created in your section: PD-1586.', 0, '', NULL, '2025-10-23 10:07:38.236892', 4, 5, 4);

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
  `summary` longtext NOT NULL,
  `key_achievements` longtext NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
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
INSERT INTO `system_config_systemconfiguration` (`id`, `email_host`, `email_port`, `email_use_tls`, `email_host_user`, `email_host_password`, `default_from_email`, `email_from_name`, `access_token_lifetime_minutes`, `refresh_token_lifetime_days`, `rotate_refresh_tokens`, `blacklist_after_rotation`, `backup_custom_path`, `created_at`, `updated_at`, `is_active`) VALUES (1, 'smtp.gmail.com', 587, 1, 'jerichourbano.01.01.04@gmail.com', 'pkfn htuz duyo nben', 'jerichourbano.01.01.04@gmail.com', NULL, 60, 1, 1, 1, 'backups', '2025-10-23 09:48:16.057403', '2025-10-23 10:15:13.548417', 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist_blacklistedtoken`
--
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (1, '2025-10-23 09:54:43.442370', 3);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (2, '2025-10-23 10:01:38.941614', 7);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (3, '2025-10-23 10:06:03.034837', 9);
INSERT INTO `token_blacklist_blacklistedtoken` (`id`, `blacklisted_at`, `token_id`) VALUES (4, '2025-10-23 10:13:21.790605', 12);

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist_outstandingtoken`
--
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTI5OTQ3NSwiaWF0IjoxNzYxMjEzMDc1LCJqdGkiOiJkMjJkZTE5MDgxODA0Zjk2OTJiNjQ3NDFhNGE4ZGE1MCIsInVzZXJfaWQiOiIxIn0.4PAUkNwx6oaYw0b1VZOkuBjshi56MjSd8BfiAuGUIo4', '2025-10-23 09:51:15.566622', '2025-10-24 09:51:15', 1, 'd22de19081804f9692b64741a4a8da50');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTI5OTYxNCwiaWF0IjoxNzYxMjEzMjE0LCJqdGkiOiIxMDk4NzUyZTI1MGM0YTAwYjc5MDAyNWE1OGM4NDZjNyIsInVzZXJfaWQiOiIyIn0.wTGBLqFpheYEicy3hNDlbwZFOci_7ohYTmmwe3fRRTk', '2025-10-23 09:53:34.352998', '2025-10-24 09:53:34', 2, '1098752e250c4a00b790025a58c846c7');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTI5OTY2MCwiaWF0IjoxNzYxMjEzMjYwLCJqdGkiOiJiZTAzMTQxMzVmZGI0MzNlOTJkMmQ3NzNlNzIxZjkzZCIsInVzZXJfaWQiOiIyIn0.tHCP7gWMstyXiNCIn7d3e6jNR_2F0TrlCLKytImE80c', '2025-10-23 09:54:20.743175', '2025-10-24 09:54:20', 2, 'be0314135fdb433e92d2d773e721f93d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTI5OTY5MCwiaWF0IjoxNzYxMjEzMjkwLCJqdGkiOiJiZjNmYTEzNzc1MTU0ODJmODVkZDNmZmJkMjAxZmViMyIsInVzZXJfaWQiOiIyIn0.nesW_G4Q61ezHcFFHNGnegNLKkGsyeYV6nH0TmdieVM', '2025-10-23 09:54:50.864869', '2025-10-24 09:54:50', 2, 'bf3fa1377515482f85dd3ffbd201feb3');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTI5OTc3MCwiaWF0IjoxNzYxMjEzMzcwLCJqdGkiOiI3NTNlYThjZjk5ZTE0ZmVlOWUxMjc2YjQyNzZlMTRlOCIsInVzZXJfaWQiOiIzIn0.kT8m3kpsNakW05hGxa3R1UiraUxnwUF6pMA-QlUOiHM', '2025-10-23 09:56:10.174048', '2025-10-24 09:56:10', 3, '753ea8cf99e14fee9e1276b4276e14e8');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTI5OTg5OCwiaWF0IjoxNzYxMjEzNDk4LCJqdGkiOiJlNTA0NjJiNTAzMGQ0NWI1Yjg4NjBjMTEzNmNlMjJjYyIsInVzZXJfaWQiOiI0In0.cKT6V7sCohZedd3uFw1yo7LCP0sSFXos8Zxt4JSrYGU', '2025-10-23 09:58:18.353429', '2025-10-24 09:58:18', 4, 'e50462b5030d45b5b8860c1136ce22cc');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (7, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTMwMDA4NCwiaWF0IjoxNzYxMjEzNjg0LCJqdGkiOiIzZDMzYzMwYzQ1OGE0NDdiYjUwZDI4NGNlNjA0YzdlNyIsInVzZXJfaWQiOiIzIn0.k46JdSir7fV0luBIPPHnun5NiwyAeSsjQg1sl6Tqjsg', '2025-10-23 10:01:24.256582', '2025-10-24 10:01:24', 3, '3d33c30c458a447bb50d284ce604c7e7');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (8, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTMwMDExNSwiaWF0IjoxNzYxMjEzNzE1LCJqdGkiOiIwOTYwNDgxZTkxMjU0NjJhYTBjYTE5YzI3ZDIxMTA0YyIsInVzZXJfaWQiOiIzIn0.o43ZLxE87ifKYWZp_1GM0bd4cA4og10qjCobKMlHPCg', '2025-10-23 10:01:55.043744', '2025-10-24 10:01:55', 3, '0960481e9125462aa0ca19c27d21104c');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (9, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTMwMDM0NiwiaWF0IjoxNzYxMjEzOTQ2LCJqdGkiOiJiYmI4NGE3Y2I3NjQ0MzVmODRiMjAzMmJiMWMyNzU4ZCIsInVzZXJfaWQiOiI0In0.1GNuddSxKENvRfI6cO4UjBQXtXmQBMQYgkubOKO9Hb0', '2025-10-23 10:05:46.046280', '2025-10-24 10:05:46', 4, 'bbb84a7cb764435f84b2032bb1c2758d');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (10, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTMwMDM5MiwiaWF0IjoxNzYxMjEzOTkyLCJqdGkiOiI4MGFhNGIyYTU5YzI0YjRjODYwZjg0OTg2YWQ3YjUyMCIsInVzZXJfaWQiOiI0In0.vstCsGK2XmUTyNdhlPpFLYHkdZ7J1FLrn81SsW6hsEk', '2025-10-23 10:06:32.423234', '2025-10-24 10:06:32', 4, '80aa4b2a59c24b4c860f84986ad7b520');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTMwMDQ1OCwiaWF0IjoxNzYxMjE0MDU4LCJqdGkiOiI4ZmQ0YzEzZWY4OWY0Y2ViOTU2MmNmNzUxZTViN2M4ZiIsInVzZXJfaWQiOiI1In0.2b5MZYyuSoSGDbQ-zx6NKW4QMTrghl78tsRhss2H2z8', '2025-10-23 10:07:38.253899', '2025-10-24 10:07:38', 5, '8fd4c13ef89f4ceb9562cf751e5b7c8f');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (12, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTMwMDc4MiwiaWF0IjoxNzYxMjE0MzgyLCJqdGkiOiJkZDkwMjVlYjhlYWE0NzBiYjU0ODljZjE0NTE5YzExOSIsInVzZXJfaWQiOiI1In0.KBSH9-bfDNsvnYdHm4jlsfbqTMxvj5PVw3W_jcEgJyI', '2025-10-23 10:13:02.903521', '2025-10-24 10:13:02', 5, 'dd9025eb8eaa470bb5489cf14519c119');
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (13, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc2MTMwMDg5NiwiaWF0IjoxNzYxMjE0NDk2LCJqdGkiOiI0OGU2Y2IyN2JhZGI0OTc2OTJmNWEzMDk5ODBlYmQ2NiIsInVzZXJfaWQiOiI1In0.Ev-lpjYgm_IFCe1d__EkQEgnK--a1BJwzgigygXcf3E', '2025-10-23 10:14:56.792270', '2025-10-24 10:14:56', 5, '48e6cb27badb497692f5a309980ebd66');

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
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (1, 'pbkdf2_sha256$600000$sVC2NFysvH4g5l0MRBy8jZ$9l0J3DGgvB2lBgyOVGaxi+x+seux5r2+Q416XzdHnjI=', '2025-10-23 09:51:15.560926', 1, 'admin@example.com', 'Administrator', '', '', 'Admin', NULL, NULL, 1, 1, '2025-10-23 09:50:41.186566', '2025-10-23 09:50:41.908836', 0, 0, 0, NULL, NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (2, 'pbkdf2_sha256$600000$tWiPzoq5RDyshTbskEZ4Ex$WNYHkcwgU2BY5noCVq6t3N39yf7+L1rk2uN7hI1HY1U=', '2025-10-23 09:54:50.859572', 0, 'jerichourbano.01.01.04@gmail.com', 'DVISION', 'EMB', 'SAMPLE', 'Division Chief', NULL, NULL, 0, 1, '2025-10-23 09:53:23.510770', '2025-10-23 09:54:43.305369', 0, 0, 0, NULL, NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (3, 'pbkdf2_sha256$600000$MZw9mbA74kGewOFvyy7o83$mM0+ejXzKAzJpmaU95np8IBGdRLsGOHnVUmcWCiS7Lg=', '2025-10-23 10:01:55.037694', 0, '22101222@slc-sflu.edu.ph', 'COMBINED', 'EMB', 'SECTION', 'Section Chief', 'PD-1586,RA-8749,RA-9275', NULL, 0, 1, '2025-10-23 09:55:57.851323', '2025-10-23 10:01:38.900122', 0, 0, 0, '2025-10-23 10:01:14.612339', NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (4, 'pbkdf2_sha256$600000$i5V6edZG75gyO89HnEjrVw$cGSvmgxA5/PizyuVI6puOJtR7eoH7X6odev/MVkKnXA=', '2025-10-23 10:06:32.400579', 0, 'echo.010104@gmail.com', 'UNIT', 'EMB', 'HEAD', 'Unit Head', 'PD-1586', NULL, 0, 1, '2025-10-23 09:57:57.447928', '2025-10-23 10:06:02.958556', 0, 0, 0, '2025-10-23 10:06:24.018257', NULL, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`, `failed_login_attempts`, `last_failed_login`, `account_locked_until`, `is_account_locked`) VALUES (5, 'pbkdf2_sha256$600000$BsTbPg5RYgpk0MB1HeobUI$ed0eTArmX+7WQh/SzYm1mpkbDDWwoSOuQMoRgIfMb18=', '2025-10-23 10:14:56.786776', 0, 'emee46990@gmail.com', 'EIA', 'EMB', 'MONITORING', 'Monitoring Personnel', 'PD-1586', NULL, 0, 1, '2025-10-23 10:07:33.101371', '2025-10-23 10:13:21.748074', 0, 0, 0, NULL, NULL, 0);

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
