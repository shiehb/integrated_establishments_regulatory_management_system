from rest_framework import serializers
from .models import Inspection


class InspectionSerializer(serializers.ModelSerializer):
    establishment_detail = serializers.SerializerMethodField(read_only=True)
    assigned_legal_unit_name = serializers.SerializerMethodField(read_only=True)
    assigned_division_head_name = serializers.SerializerMethodField(read_only=True)
    assigned_section_chief_name = serializers.SerializerMethodField(read_only=True)
    assigned_unit_head_name = serializers.SerializerMethodField(read_only=True)
    assigned_monitor_name = serializers.SerializerMethodField(read_only=True)
    current_assignee_name = serializers.SerializerMethodField(read_only=True)
    can_act = serializers.SerializerMethodField(read_only=True)

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
        current_assignee = obj.get_current_assignee()
        return self._full_name(current_assignee)

    def get_can_act(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.can_user_act(request.user)
        return False

    def validate(self, data):
        # Require district for Section Chief/Unit Head/Monitoring Personnel assignments
        if data.get('assigned_monitor') or data.get('assigned_unit_head') or data.get('assigned_section_chief'):
            if not data.get('district'):
                raise serializers.ValidationError({'district': 'District is required when assigning personnel.'})
        return data


