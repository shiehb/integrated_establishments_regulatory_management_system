from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import User
from .utils.email_utils import send_user_welcome_email

@receiver(post_save, sender=User)
def send_welcome_email(sender, instance, created, **kwargs):
    if created:
        # Send welcome email
        default_password = getattr(settings, "DEFAULT_USER_PASSWORD", "Temp1234")
        send_user_welcome_email(instance, default_password)