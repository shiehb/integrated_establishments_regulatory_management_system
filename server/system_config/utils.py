from django.conf import settings
from django.core.cache import cache
from .models import SystemConfiguration

def update_django_settings():
    """Update Django settings with database configuration"""
    try:
        config = SystemConfiguration.get_active_config()
        
        # Update email settings
        settings.EMAIL_HOST = config.email_host
        settings.EMAIL_PORT = config.email_port
        settings.EMAIL_USE_TLS = config.email_use_tls
        settings.EMAIL_HOST_USER = config.email_host_user
        settings.EMAIL_HOST_PASSWORD = config.email_host_password
        settings.DEFAULT_FROM_EMAIL = config.default_from_email or config.email_host_user
        
        # Update default password
        settings.DEFAULT_USER_PASSWORD = config.default_user_password
        
        # Update JWT settings
        from datetime import timedelta
        settings.SIMPLE_JWT.update({
            "ACCESS_TOKEN_LIFETIME": timedelta(minutes=config.access_token_lifetime_minutes),
            "REFRESH_TOKEN_LIFETIME": timedelta(days=config.refresh_token_lifetime_days),
            "ROTATE_REFRESH_TOKENS": config.rotate_refresh_tokens,
            "BLACKLIST_AFTER_ROTATION": config.blacklist_after_rotation,
        })
        
        # Clear cache to ensure new settings take effect
        cache.clear()
        
        return True
    except Exception as e:
        print(f"Error updating Django settings: {e}")
        return False

def get_configuration_summary():
    """Get a summary of current configuration for display"""
    try:
        config = SystemConfiguration.get_active_config()
        return {
            'email_configured': bool(config.email_host_user and config.email_host_password),
            'email_host': config.email_host,
            'email_port': config.email_port,
            'default_password_set': bool(config.default_user_password),
            'access_token_minutes': config.access_token_lifetime_minutes,
            'refresh_token_days': config.refresh_token_lifetime_days,
            'last_updated': config.updated_at,
        }
    except Exception:
        return None
