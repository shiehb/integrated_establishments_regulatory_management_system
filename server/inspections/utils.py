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


def send_inspection_forward_notification(user, inspection, forwarded_by, remarks=None):
    """
    Send email notification when inspection is forwarded to a user
    """
    try:
        # Get establishment names
        establishment_names = [est.name for est in inspection.establishments.all()]
        establishment_list = ", ".join(establishment_names) if establishment_names else "No establishments"
        
        subject = f"Inspection Forwarded: {inspection.code} - {establishment_list}"
        
        # Prepare email context
        context = {
            'user': user,
            'inspection': inspection,
            'establishment_list': establishment_list,
            'law': inspection.law,
            'forwarded_by': forwarded_by,
            'remarks': remarks,
            'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        }
        
        # Render email content
        html_message = render_to_string('emails/inspection_forward_notification.html', context)
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
        
        logger.info(f"Inspection forward notification sent to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send inspection forward notification to {user.email}: {str(e)}")
        return False


def create_forward_notification(recipient, inspection, forwarded_by, remarks=None):
    """
    Create in-app notification when inspection is forwarded to a user
    """
    try:
        from notifications.models import Notification
        
        # Get establishment names
        establishment_names = [est.name for est in inspection.establishments.all()]
        establishment_list = ", ".join(establishment_names) if establishment_names else "No establishments"
        
        # Create notification message
        forwarded_by_name = f"{forwarded_by.first_name} {forwarded_by.last_name}" if forwarded_by.first_name else forwarded_by.email
        message = f"Inspection {inspection.code} for {establishment_list} has been forwarded to you by {forwarded_by_name}."
        
        if remarks:
            message += f" Remarks: {remarks}"
        
        # Create notification
        notification = Notification.objects.create(
            recipient=recipient,
            sender=forwarded_by,
            notification_type='inspection_forward',
            title='Inspection Forwarded to You',
            message=message,
            related_inspection_id=inspection.id if hasattr(inspection, 'id') else None
        )
        
        logger.info(f"In-app forward notification created for {recipient.email}")
        return notification
        
    except Exception as e:
        logger.error(f"Failed to create in-app forward notification for {recipient.email}: {str(e)}")
        return None

