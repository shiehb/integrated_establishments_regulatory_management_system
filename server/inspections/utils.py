"""
Utility functions for inspections app
"""
import logging
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def send_inspection_assignment_notification(user, inspection):
    """
    Send email notification when inspection is assigned to a user
    """
    try:
        # Get establishment names
        establishment_names = [est.name for est in inspection.establishments.all()]
        establishment_list = ", ".join(establishment_names) if establishment_names else "No establishments"
        
        subject = f"New Inspection Assignment: {inspection.code} - {establishment_list}"
        
        # Prepare email context
        context = {
            'user': user,
            'inspection': inspection,
            'establishment_list': establishment_list,
            'law': inspection.law,
            'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        }
        
        # Render email content
        html_message = render_to_string('emails/inspection_assignment_notification.html', context)
        plain_message = strip_tags(html_message)
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False
        )
        
        logger.info(f"Inspection assignment notification sent to {user.email}")
        
    except Exception as e:
        logger.error(f"Failed to send inspection assignment notification to {user.email}: {str(e)}")
        raise


def send_inspection_status_change_notification(user, inspection, old_status, new_status):
    """
    Send email notification when inspection status changes
    """
    try:
        # Get establishment names
        establishment_names = [est.name for est in inspection.establishments.all()]
        establishment_list = ", ".join(establishment_names) if establishment_names else "No establishments"
        
        subject = f"Inspection Status Update: {inspection.code} - {new_status}"
        
        # Prepare email context
        context = {
            'user': user,
            'inspection': inspection,
            'establishment_list': establishment_list,
            'old_status': old_status,
            'new_status': new_status,
            'law': inspection.law,
            'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        }
        
        # Render email content
        html_message = render_to_string('emails/inspection_status_change_notification.html', context)
        plain_message = strip_tags(html_message)
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False
        )
        
        logger.info(f"Inspection status change notification sent to {user.email}")
        
    except Exception as e:
        logger.error(f"Failed to send inspection status change notification to {user.email}: {str(e)}")
        raise

