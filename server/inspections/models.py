from django.db import models
from django.utils import timezone
from django.conf import settings
from establishments.models import Establishment


class Inspection(models.Model):
    code = models.CharField(max_length=30, unique=True, null=True, blank=True)
    STATUS_CHOICES = [
        ("DIVISION_CREATED", "Division Created"),
        ("SECTION_ASSIGNED", "Section Assigned"),
        ("SECTION_IN_PROGRESS", "Section In Progress"),
        ("SECTION_COMPLETED", "Section Completed"),
        ("UNIT_ASSIGNED", "Unit Assigned"),
        ("UNIT_IN_PROGRESS", "Unit In Progress"),
        ("UNIT_COMPLETED", "Unit Completed"),
        ("MONITORING_ASSIGN", "Monitoring Assignment"),
        ("MONITORING_IN_PROGRESS", "Monitoring In Progress"),
        ("MONITORING_COMPLETED_COMPLIANT", "Monitoring Completed - Compliant"),
        ("NON_COMPLIANT_RETURN", "Non-Compliant Return"),
        ("UNIT_REVIEWED", "Unit Reviewed"),
        ("SECTION_REVIEWED", "Section Reviewed"),
        ("DIVISION_REVIEWED", "Division Reviewed"),
        ("LEGAL_REVIEW", "Legal Review"),
        ("NOV_SENT", "Notice of Violation Sent"),
        ("NOO_SENT", "Notice of Order Sent"),
        ("CLOSED", "Closed"),
        ("REJECTED", "Rejected"),
    ]
    
    # Workflow decision tracking
    ACTION_CHOICES = [
        ("INSPECT", "Inspect"),
        ("START_INSPECTION", "Start Inspection"),
        ("COMPLETE_INSPECTION", "Complete Inspection"),
        ("FORWARD", "Forward"),
        ("FORWARD_TO_UNIT", "Forward to Unit Head"),
        ("FORWARD_TO_MONITORING", "Forward to Monitoring"),
        ("FORWARD_TO_ANOTHER_SECTION", "Forward to Another Section"),
        ("FORWARD_TO_MONITORING_PERSONNEL", "Forward to Monitoring Personnel"),
        ("COMPLETE", "Complete"),
        ("COMPLETE_COMPLIANT", "Complete - Compliant"),
        ("COMPLETE_NON_COMPLIANT", "Complete - Non-Compliant"),
        ("REVIEW", "Review"),
        ("FORWARD_TO_DIVISION", "Forward to Division"),
        ("FORWARD_TO_SECTION", "Forward to Section"),
        ("FORWARD_TO_LEGAL", "Forward to Legal Unit"),
        ("SEND_NOV", "Send Notice of Violation"),
        ("SEND_NOO", "Send Notice of Order"),
        ("CLOSE_CASE", "Close Case"),
        ("REJECT", "Reject"),
    ]
    
    # Compliance tracking
    COMPLIANCE_CHOICES = [
        ("PENDING", "Pending Inspection"),
        ("COMPLIANT", "Compliant"),
        ("NON_COMPLIANT", "Non-Compliant"),
        ("PARTIALLY_COMPLIANT", "Partially Compliant"),
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

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="DIVISION_CREATED")

    # Inspection details
    inspection_list = models.TextField(null=True, blank=True, help_text="List of inspections to be conducted")
    applicable_laws = models.TextField(null=True, blank=True, help_text="Applicable laws and regulations")
    billing_record = models.TextField(null=True, blank=True, help_text="Billing record created by legal unit")
    compliance_call = models.TextField(null=True, blank=True, help_text="Compliance call details")
    inspection_notes = models.TextField(null=True, blank=True, help_text="Inspection notes and findings")
    
    # Compliance tracking
    compliance_status = models.CharField(max_length=30, choices=COMPLIANCE_CHOICES, default="PENDING", help_text="Overall compliance status")
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
    current_assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="current_inspection_assignments")
    workflow_comments = models.TextField(null=True, blank=True, help_text="Comments from current reviewer")
    
    # Workflow decision tracking
    section_chief_decision = models.CharField(max_length=35, choices=ACTION_CHOICES, null=True, blank=True, help_text="Section Chief's decision")
    section_chief_decision_date = models.DateTimeField(null=True, blank=True)
    section_chief_comments = models.TextField(null=True, blank=True)
    
    unit_head_decision = models.CharField(max_length=35, choices=ACTION_CHOICES, null=True, blank=True, help_text="Unit Head's decision")
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
        return self.current_assigned_to == user

    def get_available_actions(self, user):
        """Get available actions for the current user based on status and user level"""
        if not self.can_user_act(user):
            return []
        
        # Division Chief actions
        if user.userlevel == 'Division Chief':
            if self.status == 'DIVISION_CREATED':
                return ['FORWARD_TO_SECTION']
            elif self.status == 'DIVISION_REVIEWED':
                return ['REVIEW']  # Can close compliant or forward non-compliant to legal
        
        # Section Chief actions
        elif user.userlevel == 'Section Chief':
            if self.status == 'DIVISION_CREATED':
                has_unit_head = self._has_unit_head_for_section()
                if has_unit_head:
                    return ['INSPECT', 'FORWARD_TO_UNIT']
                else:
                    return ['INSPECT', 'FORWARD_TO_MONITORING']
            elif self.status == 'SECTION_IN_PROGRESS':
                return ['COMPLETE_INSPECTION']
            elif self.status == 'SECTION_REVIEWED':
                return ['REVIEW']  # Forward to Division
        
        # Unit Head actions
        elif user.userlevel == 'Unit Head':
            if self.status == 'UNIT_ASSIGNED':
                return ['INSPECT', 'FORWARD_TO_MONITORING']
            elif self.status == 'UNIT_IN_PROGRESS':
                return ['COMPLETE_INSPECTION']
            elif self.status == 'UNIT_REVIEWED':
                return ['REVIEW']  # Forward to Section
        
        # Monitoring Personnel actions
        elif user.userlevel == 'Monitoring Personnel':
            if self.status == 'MONITORING_ASSIGN':
                return ['START_INSPECTION']
            elif self.status == 'MONITORING_IN_PROGRESS':
                return ['COMPLETE_COMPLIANT', 'COMPLETE_NON_COMPLIANT']
        
        # Legal Unit actions
        elif user.userlevel == 'Legal Unit':
            if self.status == 'LEGAL_REVIEW':
                return ['SEND_NOV', 'SEND_NOO', 'CLOSE_CASE']
            elif self.status == 'NOV_SENT':
                return ['SEND_NOO', 'CLOSE_CASE']
            elif self.status == 'NOO_SENT':
                return ['CLOSE_CASE']
        
        return []

    def make_decision(self, user, action, comments=None, compliance_status=None, violations_found=None, compliance_notes=None):
        """Make a workflow decision (inspect/forward/complete)"""
        if not self.can_user_act(user):
            return False, "User cannot act on this inspection"
        
        available_actions = self.get_available_actions(user)
        if action not in available_actions:
            return False, f"Action '{action}' not available for current status"
        
        # Division Chief actions
        if user.userlevel == 'Division Chief':
            if action == 'FORWARD_TO_SECTION':
                self.status = 'SECTION_ASSIGNED'
                self.current_assigned_to = self.assigned_section_chief
            elif action == 'REVIEW' and self.status == 'DIVISION_REVIEWED':
                if self.compliance_status == 'COMPLIANT':
                    self.status = 'CLOSED'
                else:
                    self.status = 'LEGAL_REVIEW'
                    self.current_assigned_to = self._get_legal_unit_user()
        
        # Section Chief actions
        elif user.userlevel == 'Section Chief':
            if action == 'INSPECT' and self.status == 'DIVISION_CREATED':
                self.status = 'SECTION_IN_PROGRESS'
            elif action == 'FORWARD_TO_UNIT' and self.status == 'DIVISION_CREATED':
                self.status = 'UNIT_ASSIGNED'
                self._assign_unit_head()
                self.current_assigned_to = self.assigned_unit_head
            elif action == 'FORWARD_TO_MONITORING' and self.status == 'DIVISION_CREATED':
                self.status = 'MONITORING_ASSIGN'
                self._assign_monitoring_personnel()
                self.current_assigned_to = self.assigned_monitor
            elif action == 'COMPLETE_INSPECTION' and self.status == 'SECTION_IN_PROGRESS':
                # Forward to Unit Head or Monitoring
                has_unit_head = self._has_unit_head_for_section()
                if has_unit_head:
                    self.status = 'UNIT_ASSIGNED'
                    self._assign_unit_head()
                    self.current_assigned_to = self.assigned_unit_head
                else:
                    self.status = 'MONITORING_ASSIGN'
                    self._assign_monitoring_personnel()
                    self.current_assigned_to = self.assigned_monitor
            elif action == 'REVIEW' and self.status == 'SECTION_REVIEWED':
                self.status = 'DIVISION_REVIEWED'
                self.current_assigned_to = self.assigned_division_chief
        
        # Unit Head actions
        elif user.userlevel == 'Unit Head':
            if action == 'INSPECT' and self.status == 'UNIT_ASSIGNED':
                self.status = 'UNIT_IN_PROGRESS'
            elif action == 'FORWARD_TO_MONITORING' and self.status == 'UNIT_ASSIGNED':
                self.status = 'MONITORING_ASSIGN'
                self._assign_monitoring_personnel()
                self.current_assigned_to = self.assigned_monitor
            elif action == 'COMPLETE_INSPECTION' and self.status == 'UNIT_IN_PROGRESS':
                self.status = 'MONITORING_ASSIGN'
                self._assign_monitoring_personnel()
                self.current_assigned_to = self.assigned_monitor
            elif action == 'REVIEW' and self.status == 'UNIT_REVIEWED':
                self.status = 'SECTION_REVIEWED'
                self.current_assigned_to = self.assigned_section_chief
        
        # Monitoring Personnel actions
        elif user.userlevel == 'Monitoring Personnel':
            if action == 'START_INSPECTION' and self.status == 'MONITORING_ASSIGN':
                self.status = 'MONITORING_IN_PROGRESS'
            elif action == 'COMPLETE_COMPLIANT' and self.status == 'MONITORING_IN_PROGRESS':
                self.status = 'MONITORING_COMPLETED_COMPLIANT'
                self.compliance_status = 'COMPLIANT'
                # Start compliant review path
                self.status = 'UNIT_REVIEWED'
                self.current_assigned_to = self.assigned_unit_head
            elif action == 'COMPLETE_NON_COMPLIANT' and self.status == 'MONITORING_IN_PROGRESS':
                self.status = 'NON_COMPLIANT_RETURN'
                self.compliance_status = 'NON_COMPLIANT'
                # Start non-compliant review path
                self.status = 'UNIT_REVIEWED'
                self.current_assigned_to = self.assigned_unit_head
        
        # Legal Unit actions
        elif user.userlevel == 'Legal Unit':
            if action == 'SEND_NOV' and self.status == 'LEGAL_REVIEW':
                self.status = 'NOV_SENT'
                self.notice_of_violation_sent = True
            elif action == 'SEND_NOO' and self.status in ['LEGAL_REVIEW', 'NOV_SENT']:
                self.status = 'NOO_SENT'
                self.notice_of_order_sent = True
            elif action == 'CLOSE_CASE' and self.status in ['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT']:
                self.status = 'CLOSED'
                
        # Update workflow comments
        if comments:
            self.workflow_comments = comments
            
        # Save the model
        self.save()
        return True, "Decision made successfully"
    
    def _get_legal_unit_user(self):
        """Get a Legal Unit user for assignment"""
        from users.models import User
        legal_user = User.objects.filter(userlevel='Legal Unit').first()
        return legal_user

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

    def _has_unit_head_for_section(self):
        """Check if a Unit Head exists for this section"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Check if there's a Unit Head for this section
        unit_head = User.objects.filter(
            userlevel='Unit Head',
            section=self.section,
            is_active=True
        ).first()
        
        return unit_head is not None

    def _return_compliant_inspection(self):
        """Return compliant inspection through the chain: Monitoring → Unit Head → Section Chief → Division Chief"""
        # Set current assignee back to Unit Head if exists
        if self.assigned_unit_head:
            self.current_assigned_to = self.assigned_unit_head
            self.status = 'UNIT_REVIEW'
        else:
            # Skip Unit Head and go directly to Section Chief
            self.current_assigned_to = self.assigned_section_chief
            self.status = 'SECTION_REVIEW'
        
        # Record workflow history
        InspectionWorkflowHistory.objects.create(
            inspection=self,
            action='RETURN_COMPLIANT',
            performed_by=self.assigned_monitor,
            comments='Inspection completed - compliant. Returning through workflow chain.'
        )

    def _return_non_compliant_inspection(self):
        """Return non-compliant inspection through the chain: Monitoring → Unit Head → Section Chief → Division Chief → Legal Unit"""
        # Set current assignee back to Unit Head if exists
        if self.assigned_unit_head:
            self.current_assigned_to = self.assigned_unit_head
            self.status = 'UNIT_REVIEW'
        else:
            # Skip Unit Head and go directly to Section Chief
            self.current_assigned_to = self.assigned_section_chief
            self.status = 'SECTION_REVIEW'
        
        # Record workflow history
        InspectionWorkflowHistory.objects.create(
            inspection=self,
            action='RETURN_NON_COMPLIANT',
            performed_by=self.assigned_monitor,
            comments='Inspection completed - non-compliant. Returning through workflow chain for legal review.'
        )

    def forward_to_legal_unit(self):
        """Forward non-compliant inspection to Legal Unit"""
        if self.assigned_legal_unit:
            self.current_assigned_to = self.assigned_legal_unit
            self.status = 'LEGAL_REVIEW'
            
            # Record workflow history
            InspectionWorkflowHistory.objects.create(
                inspection=self,
                action='FORWARD_TO_LEGAL',
                performed_by=self.assigned_division_head,
                comments='Non-compliant inspection forwarded to Legal Unit for review and action.'
            )
    
    def advance_return_path(self, user):
        """Advance inspection through return path based on compliance status"""
        if self.status == 'COMPLIANT_COMPLETE':
            # Compliant return path: Monitoring → Unit Head → Section Chief → Division Chief (Final Close)
            if self.current_assigned_to == self.assigned_unit_head:
                # Unit Head completes - move to Section Chief
                self.current_assigned_to = self.assigned_section_chief
                self.status = 'SECTION_REVIEW'
            elif self.current_assigned_to == self.assigned_section_chief:
                # Section Chief completes - move to Division Chief
                self.current_assigned_to = self.assigned_division_head
                self.status = 'DIVISION_CREATED'
            elif self.current_assigned_to == self.assigned_division_head:
                # Division Chief completes - final close
                self.status = 'COMPLETED'
                
        elif self.status == 'NON_COMPLIANT_RETURN':
            # Non-compliant return path: Monitoring → Unit Head → Section Chief → Division Chief → Legal Unit
            if self.current_assigned_to == self.assigned_unit_head:
                # Unit Head completes - move to Section Chief
                self.current_assigned_to = self.assigned_section_chief
                self.status = 'SECTION_REVIEW'
            elif self.current_assigned_to == self.assigned_section_chief:
                # Section Chief completes - move to Division Chief
                self.current_assigned_to = self.assigned_division_head
                self.status = 'DIVISION_CREATED'
            elif self.current_assigned_to == self.assigned_division_head:
                # Division Chief forwards to Legal Unit
                self.forward_to_legal_unit()
        
        self.save()

    def _assign_monitoring_personnel(self):
        """Auto-assign monitoring personnel based on district and law"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # First try to find monitoring personnel for the same section and district
        monitoring_personnel = User.objects.filter(
            userlevel='Monitoring Personnel',
            section=self.section,
            district=self.district,
            is_active=True
        ).first()
        
        if monitoring_personnel:
            self.assigned_monitor = monitoring_personnel
            self.current_assigned_to = monitoring_personnel
            return True
        
        # If no district match, try to find monitoring personnel for the same section only
        monitoring_personnel = User.objects.filter(
            userlevel='Monitoring Personnel',
            section=self.section,
            is_active=True
        ).first()
        
        if monitoring_personnel:
            self.assigned_monitor = monitoring_personnel
            self.current_assigned_to = monitoring_personnel
            return True
        
        # If no match found, leave unassigned for Division Chief manual reassignment
        return False

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
    law_code = models.CharField(max_length=20, help_text="Law code (e.g., PD-1586, RA-8749)")
    law_name = models.CharField(max_length=200, help_text="Full name of the law")
    assigned_to_section_chief = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL, 
        related_name="assigned_laws",
        help_text="Section Chief responsible for this law"
    )
    assigned_to_unit_head = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL, 
        related_name="assigned_unit_laws",
        help_text="Unit Head responsible for this law"
    )
    assigned_to_monitoring_personnel = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL, 
        related_name="assigned_monitoring_laws",
        help_text="Monitoring Personnel responsible for this law"
    )
    law_status = models.CharField(max_length=30, choices=LAW_STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['inspection', 'law_code']
    
    def __str__(self):
        return f"{self.inspection.code} - {self.law_code} -> {self.assigned_to_section_chief}"
    
    def can_section_chief_forward(self):
        """Check if section chief can forward this law assignment"""
        return self.law_status in ['PENDING', 'SECTION_REVIEW']
    
    def get_available_forward_options(self):
        """Get available forward options for section chief based on law type"""
        # Laws that have unit heads: PD-1586 (EIA), RA-8749 (Air), RA-9275 (Water)
        laws_with_unit_heads = ['PD-1586', 'RA-8749', 'RA-9275']
        
        # Laws that go directly to monitoring: RA-6969 (Toxic), RA-9003 (Solid Waste)
        laws_direct_to_monitoring = ['RA-6969', 'RA-9003']
        
        if self.law_code in laws_with_unit_heads:
            return ['FORWARD_TO_UNIT', 'FORWARD_TO_MONITORING']
        elif self.law_code in laws_direct_to_monitoring:
            return ['FORWARD_TO_MONITORING']
        else:
            return ['FORWARD_TO_MONITORING']  # Default fallback
    
    def forward_to_unit_head(self, section_chief_user):
        """Forward this law assignment to unit head"""
        if not self.can_section_chief_forward():
            return False, "Cannot forward this law assignment"
        
        # Find appropriate unit head based on law and district
        unit_head = self._find_unit_head_for_law()
        
        if unit_head:
            self.assigned_to_unit_head = unit_head
            self.law_status = 'FORWARDED_TO_UNIT'
            self.save()
            
            # Record workflow history
            InspectionWorkflowHistory.objects.create(
                inspection=self.inspection,
                action='FORWARD_TO_UNIT',
                performed_by=section_chief_user,
                comments=f"Law {self.law_code} forwarded to Unit Head {unit_head.email}"
            )
            
            return True, f"Law {self.law_code} forwarded to Unit Head {unit_head.email}"
        else:
            return False, f"No Unit Head found for law {self.law_code}"
    
    def forward_to_monitoring_personnel(self, section_chief_user):
        """Forward this law assignment directly to monitoring personnel"""
        if not self.can_section_chief_forward():
            return False, "Cannot forward this law assignment"
        
        # Find appropriate monitoring personnel based on law and district
        monitoring_personnel = self._find_monitoring_personnel_for_law()
        
        if monitoring_personnel:
            self.assigned_to_monitoring_personnel = monitoring_personnel
            self.law_status = 'FORWARDED_TO_MONITORING'
            self.save()
            
            # Record workflow history
            InspectionWorkflowHistory.objects.create(
                inspection=self.inspection,
                action='FORWARD_TO_MONITORING',
                performed_by=section_chief_user,
                comments=f"Law {self.law_code} forwarded to Monitoring Personnel {monitoring_personnel.email}"
            )
            
            return True, f"Law {self.law_code} forwarded to Monitoring Personnel {monitoring_personnel.email}"
        else:
            return False, f"No Monitoring Personnel found for law {self.law_code}"
    
    def _find_unit_head_for_law(self):
        """Find appropriate unit head for this law"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Try to find unit head in same district first
        if self.inspection.district:
            unit_head = User.objects.filter(
                userlevel='Unit Head',
                section=self.law_code,
                district=self.inspection.district,
                is_active=True
            ).first()
            
            if unit_head:
                return unit_head
        
        # If no district-specific unit head, find any unit head for this law
        unit_head = User.objects.filter(
            userlevel='Unit Head',
            section=self.law_code,
            is_active=True
        ).first()
        
        return unit_head
    
    def _find_monitoring_personnel_for_law(self):
        """Find appropriate monitoring personnel for this law"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Try to find monitoring personnel in same district first
        if self.inspection.district:
            monitoring_personnel = User.objects.filter(
                userlevel='Monitoring Personnel',
                section=self.law_code,
                district=self.inspection.district,
                is_active=True
            ).first()
            
            if monitoring_personnel:
                return monitoring_personnel
        
        # If no district-specific monitoring personnel, find any for this law
        monitoring_personnel = User.objects.filter(
            userlevel='Monitoring Personnel',
            section=self.law_code,
            is_active=True
        ).first()
        
        return monitoring_personnel

    def save(self, *args, **kwargs):
        # Update the updated_at field on every save
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)


class InspectionWorkflowHistory(models.Model):
    """Track the complete workflow history of an inspection"""
    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, related_name='workflow_history')
    action = models.CharField(max_length=35, choices=Inspection.ACTION_CHOICES)
    performed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comments = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        verbose_name = "Inspection Workflow History"
        verbose_name_plural = "Inspection Workflow Histories"
    
    def __str__(self):
        return f"{self.inspection.code} - {self.action} by {self.performed_by.email}"
