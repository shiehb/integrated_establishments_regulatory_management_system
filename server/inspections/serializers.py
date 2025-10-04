from rest_framework import serializers
from .models import Inspection, InspectionWorkflowHistory, InspectionLawAssignment


class InspectionSerializer(serializers.ModelSerializer):
    establishment_detail = serializers.SerializerMethodField(read_only=True)
    assigned_legal_unit_name = serializers.SerializerMethodField(read_only=True)
    assigned_division_head_name = serializers.SerializerMethodField(read_only=True)
    assigned_section_chief_name = serializers.SerializerMethodField(read_only=True)
    assigned_unit_head_name = serializers.SerializerMethodField(read_only=True)
    assigned_monitor_name = serializers.SerializerMethodField(read_only=True)
    current_assignee_name = serializers.SerializerMethodField(read_only=True)
    can_act = serializers.SerializerMethodField(read_only=True)
    routing_info = serializers.SerializerMethodField(read_only=True)
    available_actions = serializers.SerializerMethodField(read_only=True)
    workflow_history = serializers.SerializerMethodField(read_only=True)
    law_assignments = serializers.SerializerMethodField(read_only=True)
    compliance_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Inspection
        fields = '__all__'
        read_only_fields = ('code', 'created_by', 'created_at', 'updated_at')

    def get_establishment_detail(self, obj):
        e = obj.establishment
        return {
        'id': e.id,
        'name': e.name,
        'nature_of_business': e.nature_of_business,
        'year_established': e.year_established,  # ✅ added
        'province': e.province,
        'city': e.city,
        'barangay': e.barangay,
        'street_building': e.street_building,
        'postal_code': e.postal_code,
        'latitude': str(e.latitude),
        'longitude': str(e.longitude),
    }

    def _full_name(self, u):
        if not u:
            return None
        return f"{u.first_name} {u.last_name}".strip() or u.email

    def get_assigned_legal_unit_name(self, obj):
        return self._full_name(obj.assigned_legal_unit)

    def get_assigned_division_head_name(self, obj):
        return self._full_name(obj.assigned_division_head)

    def get_assigned_section_chief_name(self, obj):
        return self._full_name(obj.assigned_section_chief)

    def get_assigned_unit_head_name(self, obj):
        return self._full_name(obj.assigned_unit_head)

    def get_assigned_monitor_name(self, obj):
        return self._full_name(obj.assigned_monitor)

    def get_current_assignee_name(self, obj):
        return self._full_name(obj.current_assigned_to)

    def get_can_act(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.can_user_act(request.user)
        return False

    def get_routing_info(self, obj):
        """Get routing information for the inspection"""
        return {
            'district_info': {
                'district': obj.district,
                'establishment_location': f"{obj.establishment.city}, {obj.establishment.province}" if obj.establishment else None
            },
            'assigned_personnel': {
                'section_chief': {
                    'id': obj.assigned_section_chief.id if obj.assigned_section_chief else None,
                    'name': self._full_name(obj.assigned_section_chief),
                    'email': obj.assigned_section_chief.email if obj.assigned_section_chief else None,
                    'district': obj.assigned_section_chief.district if obj.assigned_section_chief else None,
                    'section': obj.assigned_section_chief.section if obj.assigned_section_chief else None,
                } if obj.assigned_section_chief else None,
                'unit_head': {
                    'id': obj.assigned_unit_head.id if obj.assigned_unit_head else None,
                    'name': self._full_name(obj.assigned_unit_head),
                    'email': obj.assigned_unit_head.email if obj.assigned_unit_head else None,
                    'district': obj.assigned_unit_head.district if obj.assigned_unit_head else None,
                    'section': obj.assigned_unit_head.section if obj.assigned_unit_head else None,
                } if obj.assigned_unit_head else None,
                'monitoring_personnel': {
                    'id': obj.assigned_monitor.id if obj.assigned_monitor else None,
                    'name': self._full_name(obj.assigned_monitor),
                    'email': obj.assigned_monitor.email if obj.assigned_monitor else None,
                    'district': obj.assigned_monitor.district if obj.assigned_monitor else None,
                    'section': obj.assigned_monitor.section if obj.assigned_monitor else None,
                } if obj.assigned_monitor else None,
            },
            'law_mapping': {
                'section': obj.section,
                'law_description': self._get_law_description(obj.section)
            }
        }

    def _get_law_description(self, section):
        """Get human-readable description for the law/section"""
        law_descriptions = {
            "PD-1586": "Environmental Impact Assessment System",
            "RA-6969": "Toxic Substances and Hazardous Waste Management",
            "RA-8749": "Clean Air Act",
            "RA-9275": "Clean Water Act", 
            "RA-9003": "Ecological Solid Waste Management",
            "PD-1586,RA-8749,RA-9275": "EIA, Air & Water Quality Monitoring (Combined)"
        }
        return law_descriptions.get(section, section)

    def get_available_actions(self, obj):
        """Get available actions for the current user"""
        request = self.context.get('request')
        if request and request.user:
            return obj.get_available_actions(request.user)
        return []

    def get_workflow_history(self, obj):
        """Get workflow history for this inspection"""
        history = obj.workflow_history.all()[:10]  # Last 10 actions
        return [
            {
                'id': h.id,
                'action': h.action,
                'performed_by': {
                    'id': h.performed_by.id,
                    'name': self._full_name(h.performed_by),
                    'userlevel': h.performed_by.userlevel
                },
                'comments': h.comments,
                'timestamp': h.timestamp
            }
            for h in history
        ]

    def get_law_assignments(self, obj):
        """Get law assignments for this inspection"""
        assignments = obj.law_assignments.all()
        return [
            {
                'id': assignment.id,
                'law_code': assignment.law_code,
                'law_name': assignment.law_name,
                'law_status': assignment.law_status,
                'can_section_chief_forward': assignment.can_section_chief_forward(),
                'available_forward_options': assignment.get_available_forward_options(),
                'assigned_to_section_chief': {
                    'id': assignment.assigned_to_section_chief.id if assignment.assigned_to_section_chief else None,
                    'name': self._full_name(assignment.assigned_to_section_chief),
                    'email': assignment.assigned_to_section_chief.email if assignment.assigned_to_section_chief else None,
                    'section': assignment.assigned_to_section_chief.section if assignment.assigned_to_section_chief else None,
                    'district': assignment.assigned_to_section_chief.district if assignment.assigned_to_section_chief else None
                } if assignment.assigned_to_section_chief else None,
                'assigned_to_unit_head': {
                    'id': assignment.assigned_to_unit_head.id if assignment.assigned_to_unit_head else None,
                    'name': self._full_name(assignment.assigned_to_unit_head),
                    'email': assignment.assigned_to_unit_head.email if assignment.assigned_to_unit_head else None,
                    'section': assignment.assigned_to_unit_head.section if assignment.assigned_to_unit_head else None,
                    'district': assignment.assigned_to_unit_head.district if assignment.assigned_to_unit_head else None
                } if assignment.assigned_to_unit_head else None,
                'assigned_to_monitoring_personnel': {
                    'id': assignment.assigned_to_monitoring_personnel.id if assignment.assigned_to_monitoring_personnel else None,
                    'name': self._full_name(assignment.assigned_to_monitoring_personnel),
                    'email': assignment.assigned_to_monitoring_personnel.email if assignment.assigned_to_monitoring_personnel else None,
                    'section': assignment.assigned_to_monitoring_personnel.section if assignment.assigned_to_monitoring_personnel else None,
                    'district': assignment.assigned_to_monitoring_personnel.district if assignment.assigned_to_monitoring_personnel else None
                } if assignment.assigned_to_monitoring_personnel else None,
                'created_at': assignment.created_at,
                'updated_at': assignment.updated_at
            }
            for assignment in assignments
        ]

    def get_compliance_info(self, obj):
        """Get compliance tracking information"""
        return {
            'compliance_status': obj.compliance_status,
            'compliance_notes': obj.compliance_notes,
            'violations_found': obj.violations_found,
            'compliance_plan': obj.compliance_plan,
            'compliance_deadline': obj.compliance_deadline,
            'notice_of_violation_sent': obj.notice_of_violation_sent,
            'notice_of_order_sent': obj.notice_of_order_sent,
            'penalties_imposed': obj.penalties_imposed,
            'legal_unit_comments': obj.legal_unit_comments,
            'is_compliant': obj.compliance_status == 'COMPLIANT',
            'requires_legal_review': obj.compliance_status == 'NON_COMPLIANT' and obj.status == 'LEGAL_REVIEW'
        }

    def validate(self, data):
        # Require district for Section Chief/Unit Head/Monitoring Personnel assignments
        if data.get('assigned_monitor') or data.get('assigned_unit_head') or data.get('assigned_section_chief'):
            if not data.get('district'):
                raise serializers.ValidationError({'district': 'District is required when assigning personnel.'})
        return data


class WorkflowDecisionSerializer(serializers.Serializer):
    """Serializer for workflow decisions"""
    action = serializers.ChoiceField(choices=Inspection.ACTION_CHOICES)
    comments = serializers.CharField(required=False, allow_blank=True, max_length=1000)
    compliance_status = serializers.ChoiceField(choices=Inspection.COMPLIANCE_CHOICES, required=False)
    violations_found = serializers.CharField(required=False, allow_blank=True, max_length=2000)
    compliance_notes = serializers.CharField(required=False, allow_blank=True, max_length=2000)


class InspectionLawAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for law assignments"""
    assigned_to_section_chief_name = serializers.SerializerMethodField(read_only=True)
    assigned_to_unit_head_name = serializers.SerializerMethodField(read_only=True)
    assigned_to_monitoring_personnel_name = serializers.SerializerMethodField(read_only=True)
    inspection_code = serializers.SerializerMethodField(read_only=True)
    can_section_chief_forward = serializers.SerializerMethodField(read_only=True)
    available_forward_options = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = InspectionLawAssignment
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_assigned_to_section_chief_name(self, obj):
        if obj.assigned_to_section_chief:
            return f"{obj.assigned_to_section_chief.first_name} {obj.assigned_to_section_chief.last_name}".strip() or obj.assigned_to_section_chief.email
        return None
    
    def get_assigned_to_unit_head_name(self, obj):
        if obj.assigned_to_unit_head:
            return f"{obj.assigned_to_unit_head.first_name} {obj.assigned_to_unit_head.last_name}".strip() or obj.assigned_to_unit_head.email
        return None
    
    def get_assigned_to_monitoring_personnel_name(self, obj):
        if obj.assigned_to_monitoring_personnel:
            return f"{obj.assigned_to_monitoring_personnel.first_name} {obj.assigned_to_monitoring_personnel.last_name}".strip() or obj.assigned_to_monitoring_personnel.email
        return None
    
    def get_inspection_code(self, obj):
        return obj.inspection.code if obj.inspection else None
    
    def get_can_section_chief_forward(self, obj):
        return obj.can_section_chief_forward()
    
    def get_available_forward_options(self, obj):
        return obj.get_available_forward_options()


