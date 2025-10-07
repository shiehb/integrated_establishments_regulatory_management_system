-- MySQL dump created by Python
-- Database: db_ierms
-- Server: 127.0.0.1:3306
-- Generated: 2025-10-07 19:17:30
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_activitylog`
--
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (1, 'create', 'New user account created: admin@example.com with auto-generated password', NULL, '', '2025-10-07 11:10:21.905269', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (2, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-07 11:11:26.117930', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (3, 'login', 'User admin@example.com logged in', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 11:11:26.126388', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (4, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-07 11:12:02.773772', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (5, 'update', 'User account updated: admin@example.com', NULL, '', '2025-10-07 11:12:18.818414', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (6, 'create', 'New user account created: jerichourbano.01.01.04@gmail.com with auto-generated password', NULL, '', '2025-10-07 11:13:15.457722', 2);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (7, 'create', 'New user registered: jerichourbano.01.01.04@gmail.com with auto-generated password', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 11:13:21.333976', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (8, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 11:14:11.393498', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (9, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 11:16:23.580740', 1);
INSERT INTO `audit_activitylog` (`id`, `action`, `message`, `ip_address`, `user_agent`, `created_at`, `user_id`) VALUES (10, 'update', 'System configuration updated', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-07 11:17:23.591034', 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `django_admin_log`
--
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (1, '2025-10-07 11:12:02.774765', '1', 'admin@example.com (Admin)', 2, '[{"changed": {"fields": ["First name", "Userlevel"]}}]', 8, 1);
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES (2, '2025-10-07 11:12:18.821264', '1', 'admin@example.com (Admin)', 2, '[]', 8, 1);

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
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (1, 'contenttypes', '0001_initial', '2025-10-07 11:09:23.545248');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (2, 'contenttypes', '0002_remove_content_type_name', '2025-10-07 11:09:23.765346');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (3, 'auth', '0001_initial', '2025-10-07 11:09:25.156102');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (4, 'auth', '0002_alter_permission_name_max_length', '2025-10-07 11:09:26.489094');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (5, 'auth', '0003_alter_user_email_max_length', '2025-10-07 11:09:26.722808');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (6, 'auth', '0004_alter_user_username_opts', '2025-10-07 11:09:27.135658');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (7, 'auth', '0005_alter_user_last_login_null', '2025-10-07 11:09:27.617611');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (8, 'auth', '0006_require_contenttypes_0002', '2025-10-07 11:09:27.754698');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (9, 'auth', '0007_alter_validators_add_error_messages', '2025-10-07 11:09:27.910225');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (10, 'auth', '0008_alter_user_username_max_length', '2025-10-07 11:09:28.077581');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (11, 'auth', '0009_alter_user_last_name_max_length', '2025-10-07 11:09:28.237597');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (12, 'auth', '0010_alter_group_name_max_length', '2025-10-07 11:09:28.426759');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (13, 'auth', '0011_update_proxy_permissions', '2025-10-07 11:09:28.606576');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (14, 'auth', '0012_alter_user_first_name_max_length', '2025-10-07 11:09:28.661720');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (15, 'users', '0001_initial', '2025-10-07 11:09:31.118154');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (16, 'admin', '0001_initial', '2025-10-07 11:09:32.299576');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (17, 'admin', '0002_logentry_remove_auto_add', '2025-10-07 11:09:32.324358');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (18, 'admin', '0003_logentry_add_action_flag_choices', '2025-10-07 11:09:32.925967');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (19, 'audit', '0001_initial', '2025-10-07 11:09:32.980394');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (20, 'audit', '0002_initial', '2025-10-07 11:09:33.681484');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (21, 'establishments', '0001_initial', '2025-10-07 11:09:33.779433');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (22, 'inspections', '0001_initial', '2025-10-07 11:09:34.523735');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (23, 'inspections', '0002_initial', '2025-10-07 11:09:37.940643');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (24, 'notifications', '0001_initial', '2025-10-07 11:09:38.041299');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (25, 'notifications', '0002_initial', '2025-10-07 11:09:39.190130');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (26, 'sessions', '0001_initial', '2025-10-07 11:09:39.455187');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (27, 'system_config', '0001_initial', '2025-10-07 11:09:39.528879');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (28, 'token_blacklist', '0001_initial', '2025-10-07 11:09:40.051763');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (29, 'token_blacklist', '0002_outstandingtoken_jti_hex', '2025-10-07 11:09:40.121285');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (30, 'token_blacklist', '0003_auto_20171017_2007', '2025-10-07 11:09:40.257482');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (31, 'token_blacklist', '0004_auto_20171017_2013', '2025-10-07 11:09:40.477868');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (32, 'token_blacklist', '0005_remove_outstandingtoken_jti', '2025-10-07 11:09:40.544542');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (33, 'token_blacklist', '0006_auto_20171017_2113', '2025-10-07 11:09:40.598693');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (34, 'token_blacklist', '0007_auto_20171017_2214', '2025-10-07 11:09:41.808340');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (35, 'token_blacklist', '0008_migrate_to_bigautofield', '2025-10-07 11:09:43.564004');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (36, 'token_blacklist', '0010_fix_migrate_to_bigautofield', '2025-10-07 11:09:43.881611');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (37, 'token_blacklist', '0011_linearizes_history', '2025-10-07 11:09:43.916902');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (38, 'token_blacklist', '0012_alter_outstandingtoken_user', '2025-10-07 11:09:44.000866');
INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES (39, 'token_blacklist', '0013_alter_blacklistedtoken_options_and_more', '2025-10-07 11:09:44.111061');

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
INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES ('5vhm0t84tblxvtue6kgreifc919czxpo', '.eJxVjDsOwjAQBe_iGllrK_GHkp4zRLveNQ4gR4qTKuLuJFIKaN_MvE0NuC5lWJvMw8jqqoy6_G6E6SX1APzE-ph0muoyj6QPRZ-06fvE8r6d7t9BwVb2GmLvmCgiMPcRvM2JOqRsgkWMHQQ0wMk4DzZ75F6is2IFnNBuBlCfL_O3OH4:1v65bK:0JRUVevDmrOmPJTn0jztRLZ3FWMOhOpb37B9OaPBa4k', '2025-10-21 11:11:26.142917');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications_notification`
--
INSERT INTO `notifications_notification` (`id`, `notification_type`, `title`, `message`, `is_read`, `created_at`, `recipient_id`, `sender_id`) VALUES (1, 'new_user', 'New Division Chief Created', 'A new Division Chief (jerichourbano.01.01.04@gmail.com) has been created.', 0, '2025-10-07 11:13:21.449698', 2, 2);

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_config_systemconfiguration`
--
INSERT INTO `system_config_systemconfiguration` (`id`, `email_host`, `email_port`, `email_use_tls`, `email_host_user`, `email_host_password`, `default_from_email`, `access_token_lifetime_minutes`, `refresh_token_lifetime_days`, `rotate_refresh_tokens`, `blacklist_after_rotation`, `backup_custom_path`, `created_at`, `updated_at`, `is_active`) VALUES (1, 'smtp.gmail.com', 587, 1, 'jerichourbano.01.01.04@gmail.com', 'pkfn htuz duyo nben', 'jerichourbano.01.01.04@gmail.com', 60, 1, 1, 1, 'backups', '2025-10-07 11:10:01.149231', '2025-10-07 11:17:23.597198', 1);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `token_blacklist_outstandingtoken`
--
INSERT INTO `token_blacklist_outstandingtoken` (`id`, `token`, `created_at`, `expires_at`, `user_id`, `jti`) VALUES (1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc1OTkyMjAwMSwiaWF0IjoxNzU5ODM1NjAxLCJqdGkiOiI5ZThlNWM3NDI2ODM0YWZkOGYyNDM0Y2U3YTE3Y2YxMSIsInVzZXJfaWQiOiIyIn0.bL8FwkaqKtIB9pNJWcsORcODlH0GR21I5yL_4vWjP8Y', '2025-10-07 11:13:21.484207', '2025-10-08 11:13:21', 2, '9e8e5c7426834afd8f2434ce7a17cf11');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users_user`
--
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (1, 'pbkdf2_sha256$600000$4xMf9J8K3JoXEVvxiZLVgp$hSMt0mHFwQutXDBMRUfWjbHmBJ5tApsOCIScT050A4Q=', '2025-10-07 11:11:26.112556', 1, 'admin@example.com', 'Administrator', '', '', 'Admin', NULL, NULL, 1, 1, '2025-10-07 11:10:20.694784', '2025-10-07 11:12:18.815119', 1, 0);
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `email`, `first_name`, `middle_name`, `last_name`, `userlevel`, `section`, `district`, `is_staff`, `is_active`, `date_joined`, `updated_at`, `is_first_login`, `must_change_password`) VALUES (2, 'pbkdf2_sha256$600000$SvzICQ7nuI1EyH0UyufwPM$jooNrYnNSg6NP+jbpMU/fjc4BcQND00gIQ/4wrOaCi0=', NULL, 0, 'jerichourbano.01.01.04@gmail.com', 'JERICHO', 'SOTELO', 'URBANO', 'Division Chief', NULL, NULL, 0, 1, '2025-10-07 11:13:02.079760', '2025-10-07 11:13:15.444328', 1, 0);

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
