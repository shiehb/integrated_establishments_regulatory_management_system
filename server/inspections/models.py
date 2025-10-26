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
        ('SECTION_COMPLETED_COMPLIANT', 'Section Completed - Compliant'),
        ('SECTION_COMPLETED_NON_COMPLIANT', 'Section Completed - Non-Compliant'),
        
        # Unit Head workflow
        ('UNIT_ASSIGNED', 'Unit Assigned'),
        ('UNIT_IN_PROGRESS', 'Unit In Progress'),
        ('UNIT_COMPLETED_COMPLIANT', 'Unit Completed - Compliant'),
        ('UNIT_COMPLETED_NON_COMPLIANT', 'Unit Completed - Non-Compliant'),
        
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
    law = models.CharField(max_length=50, help_text="Law code (e.g., PD-1586, RA-6969, RA-8749, RA-9275, RA-9003)", default='PD-1586')
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
            models.Index(fields=['code']),
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
            'SECTION_COMPLETED_COMPLIANT': 'Completed – Compliant',
            'SECTION_COMPLETED_NON_COMPLIANT': 'Completed – Non-Compliant',
            'UNIT_ASSIGNED': 'New – Waiting for Action',
            'UNIT_IN_PROGRESS': 'In Progress',
            'UNIT_COMPLETED_COMPLIANT': 'Completed – Compliant',
            'UNIT_COMPLETED_NON_COMPLIANT': 'Completed – Non-Compliant',
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
                'MONITORING_ASSIGNED': ['Section Chief'],  # Can forward directly if no unit head
            },
            'SECTION_IN_PROGRESS': {
                'SECTION_COMPLETED_COMPLIANT': ['Section Chief'],
                'SECTION_COMPLETED_NON_COMPLIANT': ['Section Chief'],
                'DIVISION_REVIEWED': ['Section Chief'],  # Direct submission to Division Chief review
            },
            'SECTION_COMPLETED_COMPLIANT': {
                'UNIT_ASSIGNED': ['Section Chief'],
                'MONITORING_ASSIGNED': ['Section Chief'],  # If no unit head
                'DIVISION_REVIEWED': ['Division Chief'],  # Auto-assign to Division Chief
            },
            'SECTION_COMPLETED_NON_COMPLIANT': {
                'UNIT_ASSIGNED': ['Section Chief'],
                'MONITORING_ASSIGNED': ['Section Chief'],  # If no unit head
                'DIVISION_REVIEWED': ['Division Chief'],  # Auto-assign to Division Chief
            },
            'UNIT_ASSIGNED': {
                'UNIT_IN_PROGRESS': ['Unit Head'],
                'MONITORING_ASSIGNED': ['Unit Head'],  # Can forward directly
            },
            'UNIT_IN_PROGRESS': {
                'UNIT_COMPLETED_COMPLIANT': ['Unit Head'],
                'UNIT_COMPLETED_NON_COMPLIANT': ['Unit Head'],
                'SECTION_REVIEWED': ['Unit Head'],  # Direct submission to Section Chief review
            },
            'UNIT_COMPLETED_COMPLIANT': {
                'MONITORING_ASSIGNED': ['Unit Head'],
                'SECTION_REVIEWED': ['Section Chief'],  # Can send to Section
            },
            'UNIT_COMPLETED_NON_COMPLIANT': {
                'MONITORING_ASSIGNED': ['Unit Head'],
                'SECTION_REVIEWED': ['Section Chief'],  # Can send to Section
            },
            'MONITORING_ASSIGNED': {
                'MONITORING_IN_PROGRESS': ['Monitoring Personnel'],
            },
            'MONITORING_IN_PROGRESS': {
                'MONITORING_COMPLETED_COMPLIANT': ['Monitoring Personnel'],
                'MONITORING_COMPLETED_NON_COMPLIANT': ['Monitoring Personnel'],
            },
            'MONITORING_COMPLETED_COMPLIANT': {
                'UNIT_REVIEWED': ['Unit Head'],  # Auto-assign to Unit Head
            },
            'MONITORING_COMPLETED_NON_COMPLIANT': {
                'UNIT_REVIEWED': ['Unit Head'],  # Auto-assign to Unit Head
            },
            'UNIT_REVIEWED': {
                'SECTION_REVIEWED': ['Section Chief'],  # Section Chief forwards to Division
            },
            'SECTION_REVIEWED': {
                'DIVISION_REVIEWED': ['Division Chief'],  # Division Chief forwards to finalize
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
        
        # Special case: PD-1586, RA-8749, RA-9275 should be assigned to combined section
        target_section = self.law
        if self.law in ['PD-1586', 'RA-8749', 'RA-9275']:
            target_section = 'PD-1586,RA-8749,RA-9275'  # EIA, Air & Water Combined
        
        # Auto-assign Section Chief
        section_chief = User.objects.filter(
            userlevel='Section Chief',
            section=target_section,
            district=self.district if self.district else None,
            is_active=True
        ).first()
        
        # If no district match, find any section chief for this target section
        if not section_chief and self.district:
            section_chief = User.objects.filter(
                userlevel='Section Chief',
                section=target_section,
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
            'SECTION_COMPLETED_COMPLIANT': 'Section Chief',
            'SECTION_COMPLETED_NON_COMPLIANT': 'Section Chief',
            'UNIT_ASSIGNED': 'Unit Head',
            'UNIT_IN_PROGRESS': 'Unit Head',
            'UNIT_COMPLETED_COMPLIANT': 'Unit Head',
            'UNIT_COMPLETED_NON_COMPLIANT': 'Unit Head',
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
            # Special case: For Section Chief and Unit Head, use combined section for PD-1586, RA-8749, RA-9275
            # But for Monitoring Personnel, always use the specific law
            if required_level == 'Monitoring Personnel':
                # Monitoring Personnel should be assigned by specific law
                query = query.filter(section=self.law)
            else:
                # Section Chief and Unit Head use combined section logic
                target_section = self.law
                if self.law in ['PD-1586', 'RA-8749', 'RA-9275']:
                    target_section = 'PD-1586,RA-8749,RA-9275'  # EIA, Air & Water Combined
                query = query.filter(section=target_section)
        
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
    
    # Schedule
    scheduled_at = models.DateTimeField(null=True, blank=True)
    
    # Checklist (JSON field)
    checklist = models.JSONField(default=dict, blank=True)
    
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
    
    # Violations tracking (initial inspection findings)
    violations_found = models.TextField(blank=True, help_text='List of violations found during inspection')
    
    # Inspector tracking (first fill-out only)
    inspected_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inspections_inspected',
        help_text='User who first filled out this inspection form'
    )
    
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


class NoticeOfViolation(models.Model):
    """
    Notice of Violation (NOV) - separate table for normalized data
    """
    inspection_form = models.OneToOneField(
        InspectionForm,
        on_delete=models.CASCADE,
        related_name='nov',
        primary_key=True
    )
    
    # NOV fields
    sent_date = models.DateField(null=True, blank=True, help_text='Date NOV was sent')
    compliance_deadline = models.DateTimeField(null=True, blank=True, 
        help_text='Deadline for establishment to comply with NOV')
    violations = models.TextField(blank=True, 
        help_text='Detailed list of violations found')
    compliance_instructions = models.TextField(blank=True,
        help_text='Required compliance actions for establishment')
    remarks = models.TextField(blank=True, help_text='Additional remarks for NOV')
    
    # Tracking
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='nov_sent',
        help_text='User who sent this NOV'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Notice of Violation'
        verbose_name_plural = 'Notices of Violation'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"NOV for {self.inspection_form.inspection.code}"


class NoticeOfOrder(models.Model):
    """
    Notice of Order (NOO) - separate table for normalized data
    """
    inspection_form = models.OneToOneField(
        InspectionForm,
        on_delete=models.CASCADE,
        related_name='noo',
        primary_key=True
    )
    
    # NOO fields
    sent_date = models.DateField(null=True, blank=True, help_text='Date NOO was sent')
    violation_breakdown = models.TextField(blank=True,
        help_text='Detailed breakdown of violations for NOO')
    penalty_fees = models.DecimalField(max_digits=10, decimal_places=2, 
        null=True, blank=True, help_text='Total penalty fees assessed')
    payment_deadline = models.DateField(null=True, blank=True,
        help_text='Deadline for penalty payment')
    payment_instructions = models.TextField(blank=True,
        help_text='Instructions for paying penalties')
    remarks = models.TextField(blank=True, help_text='Additional remarks for NOO')
    
    # Tracking
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='noo_sent',
        help_text='User who sent this NOO'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Notice of Order'
        verbose_name_plural = 'Notices of Order'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"NOO for {self.inspection_form.inspection.code}"


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
    
    # Additional tracking fields
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='inspection_assignments_tracked',
        help_text='User the inspection was assigned to at this point'
    )
    
    law = models.CharField(
        max_length=50, 
        null=True, 
        blank=True,
        help_text='Law code at the time of change'
    )
    
    section = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text='Section at the time of change'
    )
    
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Inspection Histories'
        indexes = [
            models.Index(fields=['inspection', '-created_at']),  # Fast timeline queries
            models.Index(fields=['changed_by']),
            models.Index(fields=['assigned_to']),
        ]
    
    def __str__(self):
        return f"{self.inspection.code}: {self.previous_status} → {self.new_status}"


class BillingRecord(models.Model):
    """
    Billing records created when NOO (Notice of Order) is sent
    Links to inspection and tracks penalty fees
    """
    # Auto-generated billing code
    billing_code = models.CharField(max_length=30, unique=True, 
        help_text='Format: BILL-YYYY-NNNN')
    
    # Relationships
    inspection = models.OneToOneField(Inspection, on_delete=models.CASCADE,
        related_name='billing_record')
    establishment = models.ForeignKey('establishments.Establishment',
        on_delete=models.CASCADE, related_name='billing_records')
    
    # Establishment info (snapshot at time of billing)
    establishment_name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=255, blank=True)
    related_law = models.CharField(max_length=50)
    
    # Billing details
    BILLING_TYPE_CHOICES = [
        ('PENALTY', 'Penalty'),
        ('FEE', 'Fee'),
        ('FINE', 'Fine'),
    ]
    billing_type = models.CharField(max_length=20, choices=BILLING_TYPE_CHOICES,
        default='PENALTY')
    description = models.TextField(help_text='Detailed description of billing reason')
    amount = models.DecimalField(max_digits=10, decimal_places=2, 
        help_text='Total billing amount')
    due_date = models.DateField(help_text='Payment deadline')
    recommendations = models.TextField(blank=True, 
        help_text='Additional recommendations or instructions')
    
    # Tracking
    issued_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='issued_billings',
        help_text='User who issued this billing (typically Legal Unit)'
    )
    sent_date = models.DateTimeField(auto_now_add=True, 
        help_text='When billing was created and sent')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Billing Record'
        verbose_name_plural = 'Billing Records'
        indexes = [
            models.Index(fields=['billing_code']),
            models.Index(fields=['establishment']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['related_law']),
        ]
    
    def __str__(self):
        return f"{self.billing_code} - {self.establishment_name}"
    
    def save(self, *args, **kwargs):
        """Generate unique billing code if not set"""
        if not self.billing_code:
            year = timezone.now().year
            # Get count for this year
            count = BillingRecord.objects.filter(
                created_at__year=year
            ).count() + 1
            # Generate code
            candidate = f"BILL-{year}-{str(count).zfill(4)}"
            # Ensure uniqueness
            while BillingRecord.objects.filter(billing_code=candidate).exists():
                count += 1
                candidate = f"BILL-{year}-{str(count).zfill(4)}"
            self.billing_code = candidate
        super().save(*args, **kwargs)


class ComplianceQuota(models.Model):
    """
    Quarterly quota management for compliance law inspections.
    Supports auto-adjustment when accomplishments exceed targets.
    """
    law = models.CharField(
        max_length=50, 
        help_text="Law code (e.g., PD-1586, RA-6969, RA-8749, RA-9275, RA-9003)"
    )
    year = models.IntegerField(help_text="Year of the quota")
    quarter = models.IntegerField(
        choices=[(1, 'Q1'), (2, 'Q2'), (3, 'Q3'), (4, 'Q4')],
        help_text="Quarter 1-4"
    )
    target = models.IntegerField(help_text="Target number of inspections")
    auto_adjusted = models.BooleanField(
        default=False, 
        help_text="True if auto-set from previous quarter"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True,
        help_text="User who created this quota"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['law', 'year', 'quarter']
        ordering = ['year', 'quarter', 'law']
        indexes = [
            models.Index(fields=['law', 'year', 'quarter']),
            models.Index(fields=['year', 'quarter']),
        ]

    def __str__(self):
        return f"{self.law} Q{self.quarter} {self.year}: {self.accomplished}/{self.target}"

    @property
    def accomplished(self):
        """
        Calculate accomplished inspections for this quota period.
        Counts finished inspections where this law is in their applicable environmental laws.
        """
        from datetime import datetime
        
        # Get quarter date range
        quarter_start, quarter_end = self.get_quarter_dates()
        
        # Count finished inspections
        finished_statuses = [
            'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
            'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
            'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
            'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
        ]
        
        # Get all finished inspections in this quarter
        finished_inspections = Inspection.objects.filter(
            current_status__in=finished_statuses,
            updated_at__range=[quarter_start, quarter_end]
        ).prefetch_related('form')
        
        # Count inspections where this law is in their applicable environmental laws
        count = 0
        for inspection in finished_inspections:
            if hasattr(inspection, 'form') and inspection.form:
                checklist = inspection.form.checklist if hasattr(inspection.form, 'checklist') else {}
                general = checklist.get('general', {})
                applicable_laws = general.get('environmental_laws', [])
                
                # Check if this quota's law is in the inspection's applicable laws
                if self.law in applicable_laws:
                    count += 1
        
        return count

    def get_quarter_dates(self):
        """Get start and end dates for this quarter"""
        from django.utils import timezone
        from datetime import datetime
        
        if self.quarter == 1:
            start = timezone.datetime(self.year, 1, 1, 0, 0, 0)
            end = timezone.datetime(self.year, 3, 31, 23, 59, 59)
        elif self.quarter == 2:
            start = timezone.datetime(self.year, 4, 1, 0, 0, 0)
            end = timezone.datetime(self.year, 6, 30, 23, 59, 59)
        elif self.quarter == 3:
            start = timezone.datetime(self.year, 7, 1, 0, 0, 0)
            end = timezone.datetime(self.year, 9, 30, 23, 59, 59)
        else:  # quarter == 4
            start = timezone.datetime(self.year, 10, 1, 0, 0, 0)
            end = timezone.datetime(self.year, 12, 31, 23, 59, 59)
        return start, end

    def auto_adjust_next_quarter(self):
        """Auto-set next quarter quota if current accomplishments exceed target"""
        if self.accomplished > self.target:
            next_quarter = self.quarter + 1 if self.quarter < 4 else 1
            next_year = self.year if self.quarter < 4 else self.year + 1
            
            # Create or update next quarter quota
            next_quota, created = ComplianceQuota.objects.get_or_create(
                law=self.law,
                year=next_year,
                quarter=next_quarter,
                defaults={
                    'target': self.accomplished,
                    'created_by': self.created_by,
                    'auto_adjusted': True
                }
            )
            
            # If quota already exists but wasn't auto-adjusted, update it
            if not created and not next_quota.auto_adjusted:
                next_quota.target = self.accomplished
                next_quota.auto_adjusted = True
                next_quota.save()
            
            return next_quota
        return None

    @property
    def percentage(self):
        """Calculate percentage of target achieved"""
        if self.target == 0:
            return 0
        return round((self.accomplished / self.target) * 100, 1)

    @property
    def exceeded(self):
        """Check if accomplishments exceed target"""
        return self.accomplished > self.target




