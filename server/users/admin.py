from django.contrib import admin
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils.html import format_html
from .models import User
from system_config.models import SystemConfiguration
from .signals import user_created_with_password

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = [
        'email', 'first_name', 'last_name', 'userlevel', 
        'section', 'district', 'is_active', 'is_staff', 'date_joined'
    ]
    list_filter = [
        'userlevel', 'section', 'district', 'is_active', 
        'is_staff', 'is_superuser', 'date_joined'
    ]
    search_fields = ['email', 'first_name', 'last_name']
    readonly_fields = ['date_joined', 'updated_at', 'is_first_login']
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('email', 'first_name', 'middle_name', 'last_name')
        }),
        ('Role & Permissions', {
            'fields': ('userlevel', 'section', 'district', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Password Settings', {
            'fields': ('must_change_password', 'is_first_login'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('date_joined', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def add_view(self, request, form_url='', extra_context=None):
        """Override add_view to check email configuration"""
        if not SystemConfiguration.is_system_email_configured():
            messages.error(
                request,
                format_html(
                    'Cannot create users until System Configuration email settings are complete. '
                    'Please configure the following fields in <a href="{}">System Configuration</a>:<br>'
                    '• Email host user<br>'
                    '• Email host password<br>'
                    '• Default from email',
                    reverse('admin:system_config_systemconfiguration_changelist')
                )
            )
            return HttpResponseRedirect(reverse('admin:system_config_systemconfiguration_changelist'))
        
        return super().add_view(request, form_url, extra_context)
    
    def has_add_permission(self, request):
        """Override to prevent adding users if email is not configured"""
        return SystemConfiguration.is_system_email_configured()
    
    def save_model(self, request, obj, form, change):
        """Ensure password is generated, saved, and emailed on admin creation."""
        if not change:
            # Newly created via admin: generate a secure password and email it
            generated_password = SystemConfiguration.generate_default_password()
            obj.set_password(generated_password)
            # Mark flags for first login
            if hasattr(obj, 'must_change_password'):
                obj.must_change_password = True
            if hasattr(obj, 'is_first_login'):
                obj.is_first_login = True
            super().save_model(request, obj, form, change)
            # Fire custom signal to send welcome email with password
            try:
                user_created_with_password.send(
                    sender=self.__class__,
                    user=obj,
                    password=generated_password,
                )
            except Exception:
                # Show an admin message if email sending failed; creation still succeeds
                messages.error(
                    request,
                    'User created, but sending the welcome email failed. Please verify email settings.'
                )
            return
        # Existing object update: save normally
        return super().save_model(request, obj, form, change)
    
    def changelist_view(self, request, extra_context=None):
        """Add warning message to changelist if email is not configured"""
        if not SystemConfiguration.is_system_email_configured():
            messages.warning(
                request,
                format_html(
                    'Email configuration is incomplete. User creation is disabled until '
                    '<a href="{}">System Configuration</a> email settings are configured.',
                    reverse('admin:system_config_systemconfiguration_changelist')
                )
            )
        return super().changelist_view(request, extra_context)
