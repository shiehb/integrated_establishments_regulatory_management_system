from django.db import models
from django.utils import timezone
import secrets
import string

def generate_secure_password(length=8):
    """Generate a secure random password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        if (any(c.islower() for c in password) and 
            any(c.isupper() for c in password) and 
            any(c.isdigit() for c in password)):
            return password

class SystemConfiguration(models.Model):
    """Model to store system configuration settings"""
    
    # Email Configuration
    email_host = models.CharField(max_length=255, default='smtp.gmail.com')
    email_port = models.IntegerField(default=587)
    email_use_tls = models.BooleanField(default=True)
    email_host_user = models.EmailField(max_length=255, blank=True, null=True)
    email_host_password = models.CharField(max_length=255, blank=True, null=True)
    default_from_email = models.EmailField(max_length=255, blank=True, null=True)
    
    # JWT Token Configuration
    access_token_lifetime_minutes = models.IntegerField(default=60)
    refresh_token_lifetime_days = models.IntegerField(default=1)
    rotate_refresh_tokens = models.BooleanField(default=True)
    blacklist_after_rotation = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "System Configuration"
        verbose_name_plural = "System Configurations"
    
    def __str__(self):
        return f"System Configuration (Updated: {self.updated_at.strftime('%Y-%m-%d %H:%M')})"
    
    def save(self, *args, **kwargs):
        # Ensure only one active configuration exists
        if self.is_active:
            SystemConfiguration.objects.filter(is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)
    
    @classmethod
    def get_active_config(cls):
        """Get the active system configuration"""
        config, created = cls.objects.get_or_create(
            is_active=True,
            defaults={
                'email_host': 'smtp.gmail.com',
                'email_port': 587,
                'email_use_tls': True,
                'access_token_lifetime_minutes': 60,
                'refresh_token_lifetime_days': 1,
                'rotate_refresh_tokens': True,
                'blacklist_after_rotation': True,
            }
        )
        return config
    
    @staticmethod
    def generate_default_password():
        """Generate a secure default password for new users"""
        return generate_secure_password(8)