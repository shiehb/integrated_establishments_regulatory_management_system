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
        ("SECTION_INSPECTING", "Section Inspecting"),
        ("UNIT_REVIEW", "Unit Review"),
        ("UNIT_INSPECTING", "Unit Inspecting"),
        ("MONITORING_INSPECTION", "Monitoring Inspection"),
        ("COMPLETED", "Completed"),
        ("REJECTED", "Rejected"),
    ]
    
    # Workflow decision tracking
    ACTION_CHOICES = [
        ("INSPECT", "Inspect"),
        ("FORWARD", "Forward"),
        ("FORWARD_TO_MONITORING", "Forward to Monitoring"),
        ("COMPLETE", "Complete"),
        ("REJECT", "Reject"),
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
    
    # Workflow decision tracking
    section_chief_decision = models.CharField(max_length=25, choices=ACTION_CHOICES, null=True, blank=True, help_text="Section Chief's decision")
    section_chief_decision_date = models.DateTimeField(null=True, blank=True)
    section_chief_comments = models.TextField(null=True, blank=True)
    
    unit_head_decision = models.CharField(max_length=25, choices=ACTION_CHOICES, null=True, blank=True, help_text="Unit Head's decision")
    unit_head_decision_date = models.DateTimeField(null=True, blank=True)
    unit_head_comments = models.TextField(null=True, blank=True)

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
            'SECTION_INSPECTING': self.assigned_section_chief,
            'UNIT_REVIEW': self.assigned_unit_head,
            'UNIT_INSPECTING': self.assigned_unit_head,
            'MONITORING_INSPECTION': self.assigned_monitor,
        }
        return status_assignee_map.get(self.status)

    def can_user_act(self, user):
        """Check if a user can act on this inspection"""
        current_assignee = self.get_current_assignee()
        return current_assignee == user

    def get_available_actions(self, user):
        """Get available actions for the current user based on status and user level"""
        if not self.can_user_act(user):
            return []
        
        if self.status == 'SECTION_REVIEW' and user.userlevel == 'Section Chief':
            # Special case: Toxic and Solid Section Chief can assign directly to monitoring
            if self.section in ['RA-6969', 'RA-9003']:  # Toxic Substances and Solid Waste
                return ['INSPECT', 'FORWARD_TO_MONITORING']
            else:
                return ['INSPECT', 'FORWARD']
        elif self.status == 'UNIT_REVIEW' and user.userlevel == 'Unit Head':
            return ['INSPECT', 'FORWARD']
        elif self.status in ['SECTION_INSPECTING', 'UNIT_INSPECTING', 'MONITORING_INSPECTION']:
            return ['COMPLETE']
        elif self.status == 'DIVISION_CREATED' and user.userlevel == 'Division Chief':
            return ['FORWARD']
        
        return []

    def make_decision(self, user, action, comments=None):
        """Make a workflow decision (inspect/forward/complete)"""
        if not self.can_user_act(user):
            return False, "User cannot act on this inspection"
        
        available_actions = self.get_available_actions(user)
        if action not in available_actions:
            return False, f"Action '{action}' not available for current status"
        
        # Record the decision
        if user.userlevel == 'Section Chief' and self.status == 'SECTION_REVIEW':
            self.section_chief_decision = action
            self.section_chief_decision_date = timezone.now()
            self.section_chief_comments = comments
            
            if action == 'INSPECT':
                self.status = 'SECTION_INSPECTING'
            elif action == 'FORWARD':
                self.status = 'UNIT_REVIEW'
                # Auto-assign unit head based on law/section
                self._assign_unit_head()
            elif action == 'FORWARD_TO_MONITORING':
                self.status = 'MONITORING_INSPECTION'
                # Auto-assign monitoring personnel directly
                self._assign_monitoring_personnel()
                
        elif user.userlevel == 'Unit Head' and self.status == 'UNIT_REVIEW':
            self.unit_head_decision = action
            self.unit_head_decision_date = timezone.now()
            self.unit_head_comments = comments
            
            if action == 'INSPECT':
                self.status = 'UNIT_INSPECTING'
            elif action == 'FORWARD':
                self.status = 'MONITORING_INSPECTION'
                # Auto-assign monitoring personnel based on district and law
                self._assign_monitoring_personnel()
                
        elif action == 'COMPLETE':
            self.status = 'COMPLETED'
            
        # Update workflow comments
        if comments:
            self.workflow_comments = comments
            
        self.save()
        
        # Record in workflow history
        InspectionWorkflowHistory.objects.create(
            inspection=self,
            action=action,
            performed_by=user,
            comments=comments
        )
        
        return True, f"Decision '{action}' recorded successfully"

    def _assign_unit_head(self):
        """Auto-assign unit head based on law/section"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Find unit head for the same section
        unit_head = User.objects.filter(
            userlevel='Unit Head',
            section=self.section,
            is_active=True
        ).first()
        
        if unit_head:
            self.assigned_unit_head = unit_head
            self.current_assigned_to = unit_head

    def _assign_monitoring_personnel(self):
        """Auto-assign monitoring personnel based on district and law"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Find monitoring personnel for the same section and district
        monitoring_personnel = User.objects.filter(
            userlevel='Monitoring Personnel',
            section=self.section,
            district=self.district,
            is_active=True
        ).first()
        
        if monitoring_personnel:
            self.assigned_monitor = monitoring_personnel
            self.current_assigned_to = monitoring_personnel

    def advance_status(self, user, comments=None):
        """Legacy method - now delegates to make_decision"""
        if self.status == 'DIVISION_CREATED':
            return self.make_decision(user, 'FORWARD', comments)
        elif self.status in ['SECTION_INSPECTING', 'UNIT_INSPECTING', 'MONITORING_INSPECTION']:
            return self.make_decision(user, 'COMPLETE', comments)
        return False, "No automatic advancement available"

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


class InspectionWorkflowHistory(models.Model):
    """Track the complete workflow history of an inspection"""
    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, related_name='workflow_history')
    action = models.CharField(max_length=25, choices=Inspection.ACTION_CHOICES)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comments = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Inspection Workflow History"
        verbose_name_plural = "Inspection Workflow Histories"
    
    def __str__(self):
        return f"{self.inspection.code} - {self.action} by {self.performed_by.email}"


