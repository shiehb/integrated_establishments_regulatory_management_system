"""
Refactored Inspection Models
Implements the complete workflow state machine with proper transitions and validations.
"""
from django.db import models
from django.utils import timezone
from django.conf import settings
from django.core.exceptions import ValidationError
from establishments.models import Establishment


class Inspection(models.Model):
    """
    Main inspection model with M2M to establishments and comprehensive workflow states
    """
    
    # Workflow states
    STATUS_CHOICES = [
        # Initial creation
        ('CREATED', 'Created'),
        
        # Section Chief workflow
        ('SECTION_ASSIGNED', 'Section Assigned'),
        ('SECTION_IN_PROGRESS', 'Section In Progress'),
        ('SECTION_COMPLETED', 'Section Completed'),
        
        # Unit Head workflow
        ('UNIT_ASSIGNED', 'Unit Assigned'),
        ('UNIT_IN_PROGRESS', 'Unit In Progress'),
        ('UNIT_COMPLETED', 'Unit Completed'),
        
        # Monitoring workflow
        ('MONITORING_ASSIGNED', 'Monitoring Assigned'),
        ('MONITORING_IN_PROGRESS', 'Monitoring In Progress'),
        ('MONITORING_COMPLETED_COMPLIANT', 'Monitoring Completed - Compliant'),
        ('MONITORING_COMPLETED_NON_COMPLIANT', 'Monitoring Completed - Non-Compliant'),
        
        # Review workflow (compliant path)
        ('UNIT_REVIEWED', 'Unit Reviewed'),
        ('SECTION_REVIEWED', 'Section Reviewed'),
        ('DIVISION_REVIEWED', 'Division Reviewed'),
        
        # Legal workflow (non-compliant path)
        ('LEGAL_REVIEW', 'Legal Review'),
        ('NOV_SENT', 'NOV Sent'),
        ('NOO_SENT', 'NOO Sent'),
        
        # Final states
        ('CLOSED_COMPLIANT', 'Closed - Compliant'),
        ('CLOSED_NON_COMPLIANT', 'Closed - Non-Compliant'),
    ]
    
    # Core fields
    code = models.CharField(max_length=30, unique=True, null=True, blank=True)
    establishments = models.ManyToManyField(Establishment, related_name='inspections_new')
    law = models.CharField(max_length=50, help_text="Law code (e.g., PD-1586, RA-6969, RA-8749, RA-9275, RA-9003)")
    district = models.CharField(max_length=100, null=True, blank=True)
    
    # Assignment fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inspections_created_new'
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inspections_assigned_new',
        help_text='Current assignee'
    )
    
    # Workflow tracking
    current_status = models.CharField(max_length=40, choices=STATUS_CHOICES, default='CREATED')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['current_status']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['created_by']),
            models.Index(fields=['law']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.get_simplified_status()}"
    
    def save(self, *args, **kwargs):
        """Generate unique inspection code if not set"""
        if not self.code:
            prefix_map = {
                "PD-1586": "EIA",
                "RA-6969": "TOX",
                "RA-8749": "AIR",
                "RA-9275": "WATER",
                "RA-9003": "WASTE",
            }
            prefix = prefix_map.get(self.law, "INS")
            year = timezone.now().year
            
            # Get the count for this law+year
            base_qs = Inspection.objects.filter(law=self.law, created_at__year=year).exclude(pk=self.pk)
            seq = base_qs.count() + 1
            candidate = f"{prefix}-{year}-{str(seq).zfill(4)}"
            
            # Ensure uniqueness
            while Inspection.objects.filter(code=candidate).exclude(pk=self.pk).exists():
                seq += 1
                candidate = f"{prefix}-{year}-{str(seq).zfill(4)}"
            
            self.code = candidate
        
        super().save(*args, **kwargs)
    
    def get_simplified_status(self):
        """Return user-friendly status labels"""
        status_map = {
            'CREATED': 'Created',
            'SECTION_ASSIGNED': 'New – Waiting for Action',
            'SECTION_IN_PROGRESS': 'In Progress',
            'SECTION_COMPLETED': 'Completed',
            'UNIT_ASSIGNED': 'New – Waiting for Action',
            'UNIT_IN_PROGRESS': 'In Progress',
            'UNIT_COMPLETED': 'Completed',
            'MONITORING_ASSIGNED': 'New – Waiting for Action',
            'MONITORING_IN_PROGRESS': 'In Progress',
            'MONITORING_COMPLETED_COMPLIANT': 'Completed – Compliant',
            'MONITORING_COMPLETED_NON_COMPLIANT': 'Completed – Non-Compliant',
            'UNIT_REVIEWED': 'Reviewed',
            'SECTION_REVIEWED': 'Reviewed',
            'DIVISION_REVIEWED': 'For Legal Review',
            'LEGAL_REVIEW': 'For Legal Review',
            'NOV_SENT': 'NOV Sent',
            'NOO_SENT': 'NOO Sent',
            'CLOSED_COMPLIANT': 'Closed ✅',
            'CLOSED_NON_COMPLIANT': 'Closed ❌',
        }
        return status_map.get(self.current_status, self.current_status)
    
    def can_transition_to(self, new_status, user):
        """Check if transition to new_status is valid for the current state and user"""
        
        # Define valid transitions based on current status
        valid_transitions = {
            'CREATED': {
                'SECTION_ASSIGNED': ['Division Chief'],
            },
            'SECTION_ASSIGNED': {
                'SECTION_IN_PROGRESS': ['Section Chief'],
                'UNIT_ASSIGNED': ['Section Chief'],  # Can forward directly
            },
            'SECTION_IN_PROGRESS': {
                'SECTION_COMPLETED': ['Section Chief'],
            },
            'SECTION_COMPLETED': {
                'UNIT_ASSIGNED': ['Section Chief'],
                'MONITORING_ASSIGNED': ['Section Chief'],  # If no unit head
            },
            'UNIT_ASSIGNED': {
                'UNIT_IN_PROGRESS': ['Unit Head'],
                'MONITORING_ASSIGNED': ['Unit Head'],  # Can forward directly
            },
            'UNIT_IN_PROGRESS': {
                'UNIT_COMPLETED': ['Unit Head'],
            },
            'UNIT_COMPLETED': {
                'MONITORING_ASSIGNED': ['Unit Head'],
            },
            'MONITORING_ASSIGNED': {
                'MONITORING_IN_PROGRESS': ['Monitoring Personnel'],
            },
            'MONITORING_IN_PROGRESS': {
                'MONITORING_COMPLETED_COMPLIANT': ['Monitoring Personnel'],
                'MONITORING_COMPLETED_NON_COMPLIANT': ['Monitoring Personnel'],
            },
            'MONITORING_COMPLETED_COMPLIANT': {
                'UNIT_REVIEWED': ['Monitoring Personnel'],  # Auto-transition
            },
            'MONITORING_COMPLETED_NON_COMPLIANT': {
                'UNIT_REVIEWED': ['Monitoring Personnel'],  # Auto-transition
            },
            'UNIT_REVIEWED': {
                'SECTION_REVIEWED': ['Unit Head'],
            },
            'SECTION_REVIEWED': {
                'DIVISION_REVIEWED': ['Section Chief'],
            },
            'DIVISION_REVIEWED': {
                'CLOSED_COMPLIANT': ['Division Chief'],  # If compliant
                'LEGAL_REVIEW': ['Division Chief'],  # If non-compliant
            },
            'LEGAL_REVIEW': {
                'NOV_SENT': ['Legal Unit'],
                'NOO_SENT': ['Legal Unit'],
                'CLOSED_NON_COMPLIANT': ['Legal Unit'],
            },
            'NOV_SENT': {
                'NOO_SENT': ['Legal Unit'],
                'CLOSED_NON_COMPLIANT': ['Legal Unit'],
            },
            'NOO_SENT': {
                'CLOSED_NON_COMPLIANT': ['Legal Unit'],
            },
        }
        
        # Get allowed transitions from current status
        allowed = valid_transitions.get(self.current_status, {})
        
        # Check if new_status is allowed
        if new_status not in allowed:
            return False
        
        # Check if user has the right level
        required_levels = allowed[new_status]
        return user.userlevel in required_levels
    
    def auto_assign_personnel(self):
        """Auto-assign personnel based on law and district"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Auto-assign Section Chief
        section_chief = User.objects.filter(
            userlevel='Section Chief',
            section=self.law,
            district=self.district if self.district else None,
            is_active=True
        ).first()
        
        # If no district match, find any section chief for this law
        if not section_chief and self.district:
            section_chief = User.objects.filter(
                userlevel='Section Chief',
                section=self.law,
                is_active=True
            ).first()
        
        if section_chief and self.current_status == 'SECTION_ASSIGNED':
            self.assigned_to = section_chief
            self.save()
    
    def get_next_assignee(self, next_status):
        """Get the next assignee based on the target status"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Map status to user level
        status_to_level = {
            'SECTION_ASSIGNED': 'Section Chief',
            'SECTION_IN_PROGRESS': 'Section Chief',
            'SECTION_COMPLETED': 'Section Chief',
            'UNIT_ASSIGNED': 'Unit Head',
            'UNIT_IN_PROGRESS': 'Unit Head',
            'UNIT_COMPLETED': 'Unit Head',
            'MONITORING_ASSIGNED': 'Monitoring Personnel',
            'MONITORING_IN_PROGRESS': 'Monitoring Personnel',
            'UNIT_REVIEWED': 'Unit Head',
            'SECTION_REVIEWED': 'Section Chief',
            'DIVISION_REVIEWED': 'Division Chief',
            'LEGAL_REVIEW': 'Legal Unit',
        }
        
        required_level = status_to_level.get(next_status)
        if not required_level:
            return None
        
        # Find user with required level, law, and district
        query = User.objects.filter(
            userlevel=required_level,
            is_active=True
        )
        
        # For non-division/legal roles, filter by law
        if required_level not in ['Division Chief', 'Legal Unit']:
            query = query.filter(section=self.law)
        
        # For all roles except division/legal, prefer same district
        if self.district and required_level not in ['Division Chief', 'Legal Unit']:
            district_user = query.filter(district=self.district).first()
            if district_user:
                return district_user
        
        # Fallback to any user with required level
        return query.first()


class InspectionForm(models.Model):
    """
    OneToOne relationship with Inspection for form data
    """
    inspection = models.OneToOneField(
        Inspection,
        on_delete=models.CASCADE,
        related_name='form',
        primary_key=True
    )
    
    # Schedule and notes
    scheduled_at = models.DateTimeField(null=True, blank=True)
    inspection_notes = models.TextField(blank=True)
    
    # Checklist (JSON field)
    checklist = models.JSONField(default=dict, blank=True)
    
    # Findings
    findings_summary = models.TextField(blank=True)
    
    # Compliance decision
    COMPLIANCE_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLIANT', 'Compliant'),
        ('NON_COMPLIANT', 'Non-Compliant'),
        ('PARTIALLY_COMPLIANT', 'Partially Compliant'),
    ]
    compliance_decision = models.CharField(
        max_length=30,
        choices=COMPLIANCE_CHOICES,
        default='PENDING'
    )
    
    # Additional compliance tracking
    violations_found = models.TextField(blank=True, help_text='List of violations if non-compliant')
    compliance_plan = models.TextField(blank=True, help_text='Establishment compliance plan')
    compliance_deadline = models.DateField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Form for {self.inspection.code}"
    
    def clean(self):
        """Validate that non-compliant requires violations"""
        if self.compliance_decision == 'NON_COMPLIANT' and not self.violations_found:
            raise ValidationError({
                'violations_found': 'Violations must be specified for non-compliant inspections'
            })


class InspectionDocument(models.Model):
    """
    Documents attached to inspection forms
    """
    DOCUMENT_TYPE_CHOICES = [
        ('REPORT', 'Inspection Report'),
        ('PHOTO', 'Photo Evidence'),
        ('PERMIT', 'Permit/License'),
        ('NOTICE', 'Notice'),
        ('OTHER', 'Other'),
    ]
    
    inspection_form = models.ForeignKey(
        InspectionForm,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    
    file = models.FileField(upload_to='inspections/documents/%Y/%m/%d/')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES, default='OTHER')
    description = models.CharField(max_length=255, blank=True)
    
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_inspection_documents'
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.document_type} - {self.inspection_form.inspection.code}"


class InspectionHistory(models.Model):
    """
    Track all status changes and actions in the inspection workflow
    """
    inspection = models.ForeignKey(
        Inspection,
        on_delete=models.CASCADE,
        related_name='history'
    )
    
    previous_status = models.CharField(max_length=40, null=True, blank=True)
    new_status = models.CharField(max_length=40)
    
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='inspection_changes'
    )
    
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Inspection Histories'
    
    def __str__(self):
        return f"{self.inspection.code}: {self.previous_status} → {self.new_status}"

