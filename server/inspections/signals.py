from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Inspection, InspectionLawAssignment
from .utils import send_law_assignment_notification
from audit.utils import log_activity
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@receiver(post_save, sender=InspectionLawAssignment)
def notify_section_chief_on_law_assignment(sender, instance, created, **kwargs):
    """Send notification to section chief when laws are assigned to them"""
    if created and instance.assigned_to_section_chief:
        try:
            # Send email notification
            send_law_assignment_notification(
                section_chief=instance.assigned_to_section_chief,
                inspection=instance.inspection,
                law_code=instance.law_code,
                law_name=instance.law_name
            )
            
            # Log the assignment
            log_activity(
                instance.assigned_to_section_chief,
                "assign",
                f"Law {instance.law_code} assigned to {instance.assigned_to_section_chief.email} for inspection {instance.inspection.code}",
                request=None
            )
            
            logger.info(f"Law assignment notification sent to {instance.assigned_to_section_chief.email} for {instance.law_code}")
            
        except Exception as e:
            logger.error(f"Failed to send law assignment notification: {str(e)}")


@receiver(post_save, sender=Inspection)
def log_inspection_creation(sender, instance, created, **kwargs):
    """Log inspection creation"""
    if created:
        log_activity(
            instance.created_by,
            "create",
            f"Inspection created for establishment {instance.establishment.name} with section {instance.section}",
            request=None
        )

