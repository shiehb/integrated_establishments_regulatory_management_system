from django.db.models.signals import post_save
from django.dispatch import receiver, Signal
from django.conf import settings
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.utils import timezone
from .models import User
from .utils.email_utils import send_welcome_email, send_security_alert
from audit.utils import log_activity  # ✅ FIX: Import from audit app
from system_config.models import SystemConfiguration  # Import for password generation

# Custom signal for user creation with password
user_created_with_password = Signal()

# 🔹 User created or updated
@receiver(post_save, sender=User)
def log_user_activity(sender, instance, created, **kwargs):
    if created:
        # Log user creation
        log_activity(
            instance,
            "create",
            f"New user account created: {instance.email} with auto-generated password",
            request=None  # No request available in post_save
        )
    else:
        # Log user update
        log_activity(
            instance,
            "update",
            f"User account updated: {instance.email}",
            request=None  # No request available in post_save
        )

# 🔹 Handle user creation with password
@receiver(user_created_with_password)
def send_welcome_email_on_creation(sender, user, password, **kwargs):
    """Send welcome email when user is created with a specific password"""
    send_welcome_email(user, password)


# 🔹 Log successful login
@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    # Reset failed login attempts on successful login
    user.reset_failed_logins()
    
    log_activity(
        user,
        "login",
        f"User {user.email} logged in successfully",
        request=request
    )


# 🔹 Log logout
@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    log_activity(
        user,
        "logout",
        f"User {user.email} logged out",
        request=request
    )


# 🔹 Handle failed login attempts
@receiver(user_login_failed)
def handle_failed_login(sender, credentials, request, **kwargs):
    """Handle failed login attempts and send security alerts"""
    email = credentials.get('email') or credentials.get('username')
    
    if email:
        try:
            user = User.objects.get(email=email)
            
            # Get request information
            ip_address = get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
            
            # Increment failed login attempts
            user.increment_failed_login()
            
            # Log the failed attempt
            log_activity(
                user,
                "login_failed",
                f"Failed login attempt for {user.email} (attempt #{user.failed_login_attempts})",
                request=request
            )
            
        except User.DoesNotExist:
            # Log failed attempt for non-existent user
            log_activity(
                None,
                "login_failed",
                f"Failed login attempt for non-existent user: {email}",
                request=request
            )


def get_client_ip(request):
    """Get client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip