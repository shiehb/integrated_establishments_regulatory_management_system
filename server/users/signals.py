from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from .models import User
from .utils.email_utils import send_user_welcome_email
from audit.utils import log_activity  # ✅ FIX: Import from audit app


# 🔹 User created or updated
@receiver(post_save, sender=User)
def send_welcome_email_and_log(sender, instance, created, **kwargs):
    if created:
        # Send welcome email with default password
        default_password = getattr(settings, "DEFAULT_USER_PASSWORD", "Temp1234")
        send_user_welcome_email(instance, default_password)

        # Log user creation
        log_activity(
            instance,
            "create",
            f"New user account created: {instance.email}",  # ✅ FIX: Use email instead of username
            request=None  # No request available in post_save
        )
    else:
        # Log user update
        log_activity(
            instance,
            "update",
            f"User account updated: {instance.email}",  # ✅ FIX: Use email instead of username
            request=None  # No request available in post_save
        )


# 🔹 Log successful login
@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    log_activity(
        user,
        "login",
        f"User {user.email} logged in",  # ✅ FIX: Use email instead of username
        request=request
    )


# 🔹 Log logout
@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    log_activity(
        user,
        "logout",
        f"User {user.email} logged out",  # ✅ FIX: Use email instead of username
        request=request
    )


