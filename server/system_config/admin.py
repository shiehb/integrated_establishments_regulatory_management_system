from django.contrib import admin
from .models import SystemConfiguration

@admin.register(SystemConfiguration)
class SystemConfigurationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'email_host', 'email_port', 'email_host_user', 
        'default_user_password', 'access_token_lifetime_minutes',
        'refresh_token_lifetime_days', 'is_active', 'updated_at'
    ]
    list_filter = ['is_active', 'email_use_tls', 'rotate_refresh_tokens', 'blacklist_after_rotation']
    search_fields = ['email_host', 'email_host_user', 'default_from_email']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Email Configuration', {
            'fields': (
                'email_host', 'email_port', 'email_use_tls',
                'email_host_user', 'email_host_password', 'default_from_email'
            )
        }),
        ('Password Configuration', {
            'fields': ('default_user_password',)
        }),
        ('JWT Token Configuration', {
            'fields': (
                'access_token_lifetime_minutes', 'refresh_token_lifetime_days',
                'rotate_refresh_tokens', 'blacklist_after_rotation'
            )
        }),
        ('Metadata', {
            'fields': ('is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ['id']
        return self.readonly_fields
