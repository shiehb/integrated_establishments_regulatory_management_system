from django.db import models
from django.utils import timezone
from django.conf import settings
from establishments.models import Establishment


class Inspection(models.Model):
    code = models.CharField(max_length=30, unique=True, null=True, blank=True)
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("LEGAL_REVIEW", "Legal Review"),
        ("DIVISION_CREATED", "Division Created"),
        ("SECTION_REVIEW", "Section Review"),
        ("UNIT_REVIEW", "Unit Review"),
        ("MONITORING_INSPECTION", "Monitoring Inspection"),
        ("COMPLETED", "Completed"),
        ("REJECTED", "Rejected"),
    ]

    establishment = models.ForeignKey(Establishment, on_delete=models.CASCADE, related_name="inspections")
    section = models.CharField(max_length=50)  # PD-1586, RA-6969, etc.
    district = models.CharField(max_length=100, null=True, blank=True)

    # Assignment chain
    assigned_legal_unit = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="legal_unit_assignments")
    assigned_division_head = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="division_head_assignments")
    assigned_section_chief = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="section_chief_assignments")
    assigned_unit_head = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="unit_head_assignments")
    assigned_monitor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="monitor_assignments")

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="PENDING")

    # Inspection details
    inspection_list = models.TextField(null=True, blank=True, help_text="List of inspections to be conducted")
    applicable_laws = models.TextField(null=True, blank=True, help_text="Applicable laws and regulations")
    billing_record = models.TextField(null=True, blank=True, help_text="Billing record created by legal unit")
    compliance_call = models.TextField(null=True, blank=True, help_text="Compliance call details")
    inspection_notes = models.TextField(null=True, blank=True, help_text="Inspection notes and findings")
    
    # Workflow tracking
    current_assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="current_inspection_assignments")
    workflow_comments = models.TextField(null=True, blank=True, help_text="Comments from current reviewer")

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="created_inspections")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Inspection {self.pk} - {self.establishment.name}"

    def get_current_assignee(self):
        """Get the current person assigned to this inspection based on status"""
        status_assignee_map = {
            'LEGAL_REVIEW': self.assigned_legal_unit,
            'DIVISION_CREATED': self.assigned_division_head,
            'SECTION_REVIEW': self.assigned_section_chief,
            'UNIT_REVIEW': self.assigned_unit_head,
            'MONITORING_INSPECTION': self.assigned_monitor,
        }
        return status_assignee_map.get(self.status)

    def can_user_act(self, user):
        """Check if a user can act on this inspection"""
        current_assignee = self.get_current_assignee()
        return current_assignee == user

    def get_next_status(self):
        """Get the next status in the workflow"""
        status_flow = {
            'PENDING': 'LEGAL_REVIEW',
            'LEGAL_REVIEW': 'DIVISION_CREATED',
            'DIVISION_CREATED': 'SECTION_REVIEW',
            'SECTION_REVIEW': 'UNIT_REVIEW',
            'UNIT_REVIEW': 'MONITORING_INSPECTION',
            'MONITORING_INSPECTION': 'COMPLETED',
        }
        return status_flow.get(self.status)

    def advance_status(self, user, comments=None):
        """Advance the inspection to the next status"""
        if not self.can_user_act(user):
            return False
        
        next_status = self.get_next_status()
        if next_status:
            self.status = next_status
            self.current_assigned_to = self.get_current_assignee()
            if comments:
                self.workflow_comments = comments
            self.save()
            return True
        return False

    def save(self, *args, **kwargs):
        # Generate unique human-readable code if not set
        if not self.code and self.section:
            prefix_map = {
                "PD-1586": "EIA",
                "RA-6969": "TOX",
                "RA-8749": "AIR",
                "RA-9275": "WATER",
                "RA-9003": "WASTE",
            }
            prefix = prefix_map.get(self.section, "GEN")
            year = timezone.now().year
            # Simple sequencer per section+year
            base_qs = Inspection.objects.filter(section=self.section, created_at__year=year).exclude(pk=self.pk)
            seq = base_qs.count() + 1
            candidate = f"{prefix}-{year}-{str(seq).zfill(4)}"
            # Ensure uniqueness
            while Inspection.objects.filter(code=candidate).exclude(pk=self.pk).exists():
                seq += 1
                candidate = f"{prefix}-{year}-{str(seq).zfill(4)}"
            self.code = candidate
        super().save(*args, **kwargs)


