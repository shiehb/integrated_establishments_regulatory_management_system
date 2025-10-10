from django.conf import settings
from django.core.cache import cache
from .models import SystemConfiguration

def construct_from_email(default_from_email, email_host_user, from_name=None):
    """
    Construct the proper from email address.
    If default_from_email ends with '@', append the domain from email_host_user.
    If from_name is provided, format as "Display Name <email@domain.com>".
    """
    if not default_from_email:
        email_address = email_host_user
    elif default_from_email.endswith('@'):
        # Extract domain from email_host_user
        if email_host_user and '@' in email_host_user:
            domain = email_host_user.split('@')[1]
            email_address = f"{default_from_email.rstrip('@')}@{domain}"
        else:
            # If no domain available, return as-is
            email_address = default_from_email
    else:
        # Complete email address, return as-is
        email_address = default_from_email
    
    # If from_name is provided and not empty, format with display name
    if from_name and from_name.strip():
        return f'"{from_name.strip()}" <{email_address}>'
    
    # Return just the email address (backward compatible)
    return email_address

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
        settings.DEFAULT_FROM_EMAIL = construct_from_email(config.default_from_email, config.email_host_user, config.email_from_name)
        
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
            'access_token_minutes': config.access_token_lifetime_minutes,
            'refresh_token_days': config.refresh_token_lifetime_days,
            'last_updated': config.updated_at,
        }
    except Exception:
        return None