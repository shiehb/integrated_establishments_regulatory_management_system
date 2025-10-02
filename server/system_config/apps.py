from django.apps import AppConfig


class SystemConfigConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'system_config'
    verbose_name = 'System Configuration'
    
    def ready(self):
        """Called when Django starts up"""
        # Update Django settings with database configuration on startup
        try:
            from .utils import update_django_settings
            update_django_settings()
        except Exception as e:
            # Silently fail if there's no configuration yet
            pass
