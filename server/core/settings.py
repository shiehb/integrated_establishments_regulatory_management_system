"""
Django settings for core project.
"""
from datetime import timedelta
from pathlib import Path
import os
from dotenv import load_dotenv
import secrets
import string


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env
load_dotenv()

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-rw-#y=jvoa+u33e(!5-f!q%)0fud1%ra3mxt)(q@f&95nequ!0")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",") if os.getenv("ALLOWED_HOSTS") else []


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',

    # Your apps
    'users',
    'establishments',
    'notifications',
    'audit',
    'inspections',
    'system_config.apps.SystemConfigConfig',
    'system',
]


AUTH_USER_MODEL = 'users.User'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# REST Framework + JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),      
    "ROTATE_REFRESH_TOKENS": True,                   
    "BLACKLIST_AFTER_ROTATION": True,
}

# Password generation function
def generate_secure_password(length=8):
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        if (any(c.islower() for c in password) and 
            any(c.isupper() for c in password) and 
            any(c.isdigit() for c in password)):
            return password

# System Configuration Management
# This will be overridden by database configuration if available
def get_database_config():
    """Get configuration from database if available"""
    try:
        from system_config.models import SystemConfiguration
        config = SystemConfiguration.get_active_config()
        return {
            'EMAIL_HOST': config.email_host,
            'EMAIL_PORT': config.email_port,
            'EMAIL_USE_TLS': config.email_use_tls,
            'EMAIL_HOST_USER': config.email_host_user,
            'EMAIL_HOST_PASSWORD': config.email_host_password,
            'DEFAULT_FROM_EMAIL': config.default_from_email,
            'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config.access_token_lifetime_minutes),
            'REFRESH_TOKEN_LIFETIME': timedelta(days=config.refresh_token_lifetime_days),
            'ROTATE_REFRESH_TOKENS': config.rotate_refresh_tokens,
            'BLACKLIST_AFTER_ROTATION': config.blacklist_after_rotation,
        }
    except Exception:
        # Fallback to environment variables if database config not available
        return None

# Try to get database configuration, fallback to environment variables
db_config = get_database_config()
if db_config:
    # Override settings with database configuration
    EMAIL_HOST = db_config['EMAIL_HOST']
    EMAIL_PORT = db_config['EMAIL_PORT']
    EMAIL_USE_TLS = db_config['EMAIL_USE_TLS']
    EMAIL_HOST_USER = db_config['EMAIL_HOST_USER']
    EMAIL_HOST_PASSWORD = db_config['EMAIL_HOST_PASSWORD']
    DEFAULT_FROM_EMAIL = db_config['DEFAULT_FROM_EMAIL']
    
    # Update JWT settings
    SIMPLE_JWT.update({
        "ACCESS_TOKEN_LIFETIME": db_config['ACCESS_TOKEN_LIFETIME'],
        "REFRESH_TOKEN_LIFETIME": db_config['REFRESH_TOKEN_LIFETIME'],
        "ROTATE_REFRESH_TOKENS": db_config['ROTATE_REFRESH_TOKENS'],
        "BLACKLIST_AFTER_ROTATION": db_config['BLACKLIST_AFTER_ROTATION'],
    })

ROOT_URLCONF = 'core.urls'

# Allow all origins in dev (restrict in prod)
CORS_ALLOW_ALL_ORIGINS = True 

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev
    "https://your-frontend.com"  # production frontend
]

# Email Configuration - Using Gmail for development
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
EMAIL_TIMEOUT = 30
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@ierms.denr.gov.ph")

# Email Security & Headers
EMAIL_SUBJECT_PREFIX = '[IERMS] '
EMAIL_HEADERS = {
    'X-Mailer': 'IERMS System v1.0',
    'X-Priority': '3',
    'X-MSMail-Priority': 'Normal',
}

# Email Retry Configuration
EMAIL_RETRY_ATTEMPTS = 3
EMAIL_RETRY_DELAY = 5  # seconds

# Email Verification
EMAIL_VERIFICATION_REQUIRED = True

# If email credentials are not set, fall back to console backend
if not EMAIL_HOST_USER or not EMAIL_HOST_PASSWORD:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
    print("⚠️  EMAIL CREDENTIALS NOT SET - Using console backend for development")
    print("   To enable email sending, set these environment variables:")
    print("   - EMAIL_HOST_USER (your Gmail address)")
    print("   - EMAIL_HOST_PASSWORD (your Gmail app password)")
    print("   - DEFAULT_FROM_EMAIL (sender email address)")
    print("   Emails will be printed to console instead of sent.")
else:
    print("✅ Email configuration loaded successfully")
    print(f"   SMTP Host: {EMAIL_HOST}:{EMAIL_PORT}")
    print(f"   From Email: {DEFAULT_FROM_EMAIL}")

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# Database
# MySQL configuration for both production and development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('DB_NAME', 'db_ierms'),
        'USER': os.getenv('DB_USER', 'root'),
        'PASSWORD': os.getenv('DB_PASSWORD', ''),
        'HOST': os.getenv('DB_HOST', '127.0.0.1'),
        'PORT': os.getenv('DB_PORT', '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        },
        'TEST': {
            'CHARSET': 'utf8mb4',
            'COLLATION': 'utf8mb4_unicode_ci',
        }
    }
}



CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = "Asia/Manila"
USE_I18N = True
USE_TZ = True


# Static files
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files (for future use if needed)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Ensure media directory exists
os.makedirs(MEDIA_ROOT, exist_ok=True)

# Default folder for database backups
DEFAULT_BACKUP_DIR = os.path.join(BASE_DIR, "backups")

# Ensure the folder exists
os.makedirs(DEFAULT_BACKUP_DIR, exist_ok=True)

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

