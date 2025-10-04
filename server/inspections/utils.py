"""
Utility functions for inspections app
"""
import logging
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)


def send_law_assignment_notification(section_chief, inspection, law_code, law_name):
    """
    Send email notification to section chief when laws are assigned to them
    """
    try:
        subject = f"New Law Assignment: {law_code} - {inspection.establishment.name}"
        
        # Prepare email context
        context = {
            'section_chief': section_chief,
            'inspection': inspection,
            'law_code': law_code,
            'law_name': law_name,
            'establishment': inspection.establishment,
            'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        }
        
        # Render email content
        html_message = render_to_string('emails/law_assignment_notification.html', context)
        plain_message = strip_tags(html_message)
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[section_chief.email],
            html_message=html_message,
            fail_silently=False
        )
        
        logger.info(f"Law assignment notification sent to {section_chief.email}")
        
    except Exception as e:
        logger.error(f"Failed to send law assignment notification to {section_chief.email}: {str(e)}")
        raise


def send_multiple_law_assignment_summary(section_chief, inspection, assigned_laws):
    """
    Send email notification to section chief when multiple laws are assigned to them
    """
    try:
        subject = f"Multiple Law Assignments: {inspection.establishment.name} ({len(assigned_laws)} laws)"
        
        # Prepare email context
        context = {
            'section_chief': section_chief,
            'inspection': inspection,
            'assigned_laws': assigned_laws,
            'establishment': inspection.establishment,
            'site_url': getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        }
        
        # Render email content
        html_message = render_to_string('emails/multiple_law_assignment_notification.html', context)
        plain_message = strip_tags(html_message)
        
        # Send email
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[section_chief.email],
            html_message=html_message,
            fail_silently=False
        )
        
        logger.info(f"Multiple law assignment notification sent to {section_chief.email} for {len(assigned_laws)} laws")
        
    except Exception as e:
        logger.error(f"Failed to send multiple law assignment notification to {section_chief.email}: {str(e)}")
        raise

