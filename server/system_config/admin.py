from django.contrib import admin
from django.contrib import messages
from django.utils.html import format_html
from .models import SystemConfiguration

@admin.register(SystemConfiguration)
class SystemConfigurationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'email_host', 'email_port', 'email_host_user', 
        'email_config_status', 'access_token_lifetime_minutes',
        'refresh_token_lifetime_days', 'is_active', 'updated_at'
    ]
    list_filter = ['is_active', 'email_use_tls', 'rotate_refresh_tokens', 'blacklist_after_rotation']
    search_fields = ['email_host', 'email_host_user', 'default_from_email']
    readonly_fields = ['id', 'created_at', 'updated_at', 'email_config_status']
    
    fieldsets = (
        ('Email Configuration (Required for User Creation)', {
            'fields': (
                'email_host', 'email_port', 'email_use_tls',
                'email_host_user', 'email_host_password', 'default_from_email',
                'email_config_status'
            ),
            'description': 'These email settings are required before users can be created in the system.'
        }),
        ('JWT Token Configuration', {
            'fields': (
                'access_token_lifetime_minutes', 'refresh_token_lifetime_days',
                'rotate_refresh_tokens', 'blacklist_after_rotation'
            )
        }),
        ('Backup Configuration', {
            'fields': ('backup_custom_path', 'backup_schedule_frequency', 'backup_retention_days'),
            'classes': ('collapse',)
        }),
        ('Quota Carry-Over Configuration', {
            'fields': ('quota_carry_over_enabled', 'quota_carry_over_policy'),
            'description': 'Configure how deficit amounts are handled between quarters.'
        }),
        ('Metadata', {
            'fields': ('is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def email_config_status(self, obj):
        """Display email configuration status"""
        if obj.is_email_configured():
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Complete</span>'
            )
        else:
            missing_fields = []
            if not obj.email_host_user:
                missing_fields.append('Email host user')
            if not obj.email_host_password:
                missing_fields.append('Email host password')
            if not obj.default_from_email:
                missing_fields.append('Default from email')
            
            return format_html(
                '<span style="color: red; font-weight: bold;">✗ Incomplete</span><br>'
                '<small>Missing: {}</small>',
                ', '.join(missing_fields)
            )
    email_config_status.short_description = 'Email Config Status'
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ['id']
        return self.readonly_fields
    
    def save_model(self, request, obj, form, change):
        """Add success message when email configuration is completed"""
        super().save_model(request, obj, form, change)
        
        if obj.is_email_configured():
            messages.success(
                request,
                'Email configuration is now complete! You can now create users in the system.'
            )
        else:
            messages.warning(
                request,
                'Email configuration is incomplete. User creation will remain disabled until all required fields are filled.'
            )