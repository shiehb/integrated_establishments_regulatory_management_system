from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Inspection, InspectionHistory
from audit.utils import log_activity
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@receiver(post_save, sender=Inspection)
def log_inspection_creation(sender, instance, created, **kwargs):
    """Log inspection creation"""
    if created and instance.created_by:
        try:
            # Get establishment names for logging
            establishment_names = [est.name for est in instance.establishments.all()]
            establishment_list = ", ".join(establishment_names) if establishment_names else "No establishments"
            
            log_activity(
                instance.created_by,
                "create",
                f"Inspection {instance.code} created for establishments: {establishment_list} with law {instance.law}",
                request=None
            )
            
            logger.info(f"Inspection {instance.code} created by {instance.created_by.email}")
            
        except Exception as e:
            logger.error(f"Failed to log inspection creation: {str(e)}")


@receiver(post_save, sender=InspectionHistory)
def log_inspection_status_change(sender, instance, created, **kwargs):
    """Log inspection status changes"""
    if created and instance.changed_by:
        try:
            log_activity(
                instance.changed_by,
                "status_change",
                f"Inspection {instance.inspection.code} status changed from {instance.previous_status} to {instance.new_status}",
                request=None
            )
            
            logger.info(f"Inspection {instance.inspection.code} status changed by {instance.changed_by.email}")
            
        except Exception as e:
            logger.error(f"Failed to log inspection status change: {str(e)}")

