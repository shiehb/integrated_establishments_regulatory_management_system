from django.db import models
from django.utils import timezone
from django.conf import settings
from establishments.models import Establishment


class Law(models.Model):
    """Normalized model for laws and regulations"""
    code = models.CharField(max_length=20, unique=True, help_text="Law code (e.g., PD-1586, RA-8749)")
    name = models.CharField(max_length=200, help_text="Full name of the law")
    description = models.TextField(blank=True, null=True, help_text="Description of the law")
    has_unit_head = models.BooleanField(default=False, help_text="Whether this law requires unit head review")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['code']
        verbose_name = "Law"
        verbose_name_plural = "Laws"
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class InspectionStatus(models.Model):
    """Normalized model for inspection statuses"""
    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_final = models.BooleanField(default=False, help_text="Whether this is a final status")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['code']
        verbose_name = "Inspection Status"
        verbose_name_plural = "Inspection Statuses"
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class WorkflowAction(models.Model):
    """Normalized model for workflow actions"""
    code = models.CharField(max_length=35, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['code']
        verbose_name = "Workflow Action"
        verbose_name_plural = "Workflow Actions"
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class ComplianceStatus(models.Model):
    """Normalized model for compliance statuses"""
    code = models.CharField(max_length=30, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['code']
        verbose_name = "Compliance Status"
        verbose_name_plural = "Compliance Statuses"
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Inspection(models.Model):
    """Main inspection model with normalized relationships"""
    code = models.CharField(max_length=30, unique=True, null=True, blank=True)
    
    # Core relationships
    establishment = models.ForeignKey(Establishment, on_delete=models.CASCADE, related_name="inspections")
    law = models.ForeignKey(Law, on_delete=models.CASCADE, related_name="inspections")
    status = models.ForeignKey(InspectionStatus, on_delete=models.PROTECT, related_name="inspections")
    district = models.CharField(max_length=100, null=True, blank=True)

    # Assignment chain - normalized to User model
    assigned_legal_unit = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name="legal_unit_assignments"
    )
    assigned_division_head = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name="division_head_assignments"
    )
    assigned_section_chief = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name="section_chief_assignments"
    )
    assigned_unit_head = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name="unit_head_assignments"
    )
    assigned_monitor = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name="monitor_assignments"
    )

    # Inspection details
    inspection_list = models.TextField(null=True, blank=True, help_text="List of inspections to be conducted")
    applicable_laws = models.TextField(null=True, blank=True, help_text="Applicable laws and regulations")
    billing_record = models.TextField(null=True, blank=True, help_text="Billing record created by legal unit")
    compliance_call = models.TextField(null=True, blank=True, help_text="Compliance call details")
    inspection_notes = models.TextField(null=True, blank=True, help_text="Inspection notes and findings")
    
    # Compliance tracking
    compliance_status = models.ForeignKey(
        ComplianceStatus, 
        on_delete=models.PROTECT, 
        related_name="inspections",
        help_text="Overall compliance status"
    )
    compliance_notes = models.TextField(null=True, blank=True, help_text="Detailed compliance assessment")
    violations_found = models.TextField(null=True, blank=True, help_text="List of violations found during inspection")
    compliance_plan = models.TextField(null=True, blank=True, help_text="Establishment's compliance plan")
    compliance_deadline = models.DateField(null=True, blank=True, help_text="Deadline for compliance")
    
    # Legal Unit tracking
    notice_of_violation_sent = models.BooleanField(default=False, help_text="Notice of Violation sent to establishment")
    notice_of_order_sent = models.BooleanField(default=False, help_text="Notice of Order sent to establishment")
    penalties_imposed = models.TextField(null=True, blank=True, help_text="Penalties and fines imposed")
    legal_unit_comments = models.TextField(null=True, blank=True, help_text="Legal unit assessment and recommendations")
    
    # Workflow tracking
    current_assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name="current_inspection_assignments"
    )
    workflow_comments = models.TextField(null=True, blank=True, help_text="Comments from current reviewer")

    # Audit fields
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name="created_inspections"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['law']),
            models.Index(fields=['establishment']),
            models.Index(fields=['current_assigned_to']),
        ]

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
        return status_assignee_map.get(self.status.code)

    def can_user_act(self, user):
        """Check if a user can act on this inspection"""
        return self.current_assigned_to == user

    def get_available_actions(self, user):
        """Get available actions for the current user based on status and user level"""
        if not self.can_user_act(user):
            return []
        
        # Get available actions based on current status and user level
        return WorkflowAction.objects.filter(
            workflowrules__status=self.status,
            workflowrules__user_level=user.userlevel,
            is_active=True
        ).values_list('code', flat=True)

    def make_decision(self, user, action_code, comments=None, compliance_status=None, violations_found=None, compliance_notes=None):
        """Make a workflow decision (inspect/forward/complete)"""
        if not self.can_user_act(user):
            return False, "User cannot act on this inspection"
        
        try:
            action = WorkflowAction.objects.get(code=action_code, is_active=True)
        except WorkflowAction.DoesNotExist:
            return False, f"Action '{action_code}' not found"
        
        available_actions = self.get_available_actions(user)
        if action_code not in available_actions:
            return False, f"Action '{action_code}' not available for current status"
        
        # Create decision record
        decision = InspectionDecision.objects.create(
            inspection=self,
            action=action,
            performed_by=user,
            comments=comments,
            compliance_status=compliance_status,
            violations_found=violations_found,
            compliance_notes=compliance_notes
        )
        
        # Update inspection based on action
        success, message = self._process_workflow_action(action, user, decision)
        
        if success:
            # Update workflow comments
            if comments:
                self.workflow_comments = comments
            self.save()
            
        return success, message

    def _process_workflow_action(self, action, user, decision):
        """Process the workflow action and update inspection status"""
        # This would contain the logic from the original make_decision method
        # but using the normalized action and status models
        # Implementation would depend on your specific workflow rules
        
        # For now, return a placeholder
        return True, f"Decision '{action.code}' recorded successfully"

    def save(self, *args, **kwargs):
        # Generate unique human-readable code if not set
        if not self.code and self.law:
            prefix_map = {
                "PD-1586": "EIA",
                "RA-6969": "TOX",
                "RA-8749": "AIR",
                "RA-9275": "WATER",
                "RA-9003": "WASTE",
            }
            prefix = prefix_map.get(self.law.code, "GEN")
            year = timezone.now().year
            # Simple sequencer per law+year
            base_qs = Inspection.objects.filter(law=self.law, created_at__year=year).exclude(pk=self.pk)
            seq = base_qs.count() + 1
            candidate = f"{prefix}-{year}-{str(seq).zfill(4)}"
            # Ensure uniqueness
            while Inspection.objects.filter(code=candidate).exclude(pk=self.pk).exists():
                seq += 1
                candidate = f"{prefix}-{year}-{str(seq).zfill(4)}"
            self.code = candidate
        super().save(*args, **kwargs)


class InspectionDecision(models.Model):
    """Normalized model for tracking inspection decisions"""
    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, related_name="decisions")
    action = models.ForeignKey(WorkflowAction, on_delete=models.PROTECT, related_name="decisions")
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="inspection_decisions")
    comments = models.TextField(null=True, blank=True)
    
    # Compliance-related fields
    compliance_status = models.ForeignKey(
        ComplianceStatus, 
        null=True, blank=True, 
        on_delete=models.PROTECT, 
        related_name="decisions"
    )
    violations_found = models.TextField(null=True, blank=True)
    compliance_notes = models.TextField(null=True, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Inspection Decision"
        verbose_name_plural = "Inspection Decisions"
        indexes = [
            models.Index(fields=['inspection', 'timestamp']),
            models.Index(fields=['performed_by', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.inspection.code} - {self.action.code} by {self.performed_by.email}"


class WorkflowRule(models.Model):
    """Model to define workflow rules for different statuses and user levels"""
    status = models.ForeignKey(InspectionStatus, on_delete=models.CASCADE, related_name="workflow_rules")
    user_level = models.CharField(max_length=50, choices=settings.AUTH_USER_MODEL.USERLEVEL_CHOICES)
    action = models.ForeignKey(WorkflowAction, on_delete=models.CASCADE, related_name="workflow_rules")
    next_status = models.ForeignKey(
        InspectionStatus, 
        null=True, blank=True, 
        on_delete=models.PROTECT, 
        related_name="workflow_rules_from"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['status', 'user_level', 'action']
        verbose_name = "Workflow Rule"
        verbose_name_plural = "Workflow Rules"
    
    def __str__(self):
        return f"{self.status.code} + {self.user_level} -> {self.action.code}"


class InspectionLawAssignment(models.Model):
    """Model to track which laws are assigned to which inspections"""
    LAW_STATUS_CHOICES = [
        ('PENDING', 'Pending Section Chief Review'),
        ('SECTION_REVIEW', 'Section Chief Reviewing'),
        ('FORWARDED_TO_UNIT', 'Forwarded to Unit Head'),
        ('FORWARDED_TO_MONITORING', 'Forwarded to Monitoring Personnel'),
        ('UNIT_REVIEW', 'Unit Head Reviewing'),
        ('MONITORING_INSPECTION', 'Monitoring Personnel Inspecting'),
        ('COMPLETED', 'Completed'),
    ]
    
    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, related_name="law_assignments")
    law = models.ForeignKey(Law, on_delete=models.CASCADE, related_name="assignments")
    assigned_to_section_chief = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name="assigned_laws",
        help_text="Section Chief responsible for this law"
    )
    assigned_to_unit_head = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name="assigned_unit_laws",
        help_text="Unit Head responsible for this law"
    )
    assigned_to_monitoring_personnel = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True, 
        on_delete=models.SET_NULL, 
        related_name="assigned_monitoring_laws",
        help_text="Monitoring Personnel responsible for this law"
    )
    law_status = models.CharField(max_length=30, choices=LAW_STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['inspection', 'law']
        verbose_name = "Inspection Law Assignment"
        verbose_name_plural = "Inspection Law Assignments"
    
    def __str__(self):
        return f"{self.inspection.code} - {self.law.code} -> {self.assigned_to_section_chief}"
    
    def can_section_chief_forward(self):
        """Check if section chief can forward this law assignment"""
        return self.law_status in ['PENDING', 'SECTION_REVIEW']
    
    def get_available_forward_options(self):
        """Get available forward options for section chief based on law type"""
        if self.law.has_unit_head:
            return ['FORWARD_TO_UNIT', 'FORWARD_TO_MONITORING']
        else:
            return ['FORWARD_TO_MONITORING']


class InspectionWorkflowHistory(models.Model):
    """Track the complete workflow history of an inspection"""
    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, related_name='workflow_history')
    action = models.ForeignKey(WorkflowAction, on_delete=models.PROTECT, related_name='workflow_history')
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workflow_history')
    comments = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Inspection Workflow History"
        verbose_name_plural = "Inspection Workflow Histories"
        indexes = [
            models.Index(fields=['inspection', 'timestamp']),
            models.Index(fields=['performed_by', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.inspection.code} - {self.action.code} by {self.performed_by.email}"
