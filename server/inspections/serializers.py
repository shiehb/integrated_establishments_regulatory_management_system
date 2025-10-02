from rest_framework import serializers
from .models import Inspection, InspectionWorkflowHistory


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
        current_assignee = obj.get_current_assignee()
        return self._full_name(current_assignee)

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


