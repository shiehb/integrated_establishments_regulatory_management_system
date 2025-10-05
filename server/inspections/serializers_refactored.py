"""
Serializers for Refactored Inspection Models
"""
from rest_framework import serializers
from .models import Inspection, InspectionForm, InspectionDocument, InspectionHistory
from establishments.models import Establishment


class InspectionHistorySerializer(serializers.ModelSerializer):
    """Serializer for inspection history"""
    changed_by_name = serializers.SerializerMethodField()
    changed_by_level = serializers.SerializerMethodField()
    
    class Meta:
        model = InspectionHistory
        fields = [
            'id', 'inspection', 'previous_status', 'new_status',
            'changed_by', 'changed_by_name', 'changed_by_level',
            'remarks', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return f"{obj.changed_by.first_name} {obj.changed_by.last_name}".strip() or obj.changed_by.email
        return None
    
    def get_changed_by_level(self, obj):
        return obj.changed_by.userlevel if obj.changed_by else None


class InspectionDocumentSerializer(serializers.ModelSerializer):
    """Serializer for inspection documents"""
    uploaded_by_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = InspectionDocument
        fields = [
            'id', 'inspection_form', 'file', 'file_url', 'document_type',
            'description', 'uploaded_by', 'uploaded_by_name', 'uploaded_at'
        ]
        read_only_fields = ['id', 'uploaded_at']
    
    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return f"{obj.uploaded_by.first_name} {obj.uploaded_by.last_name}".strip() or obj.uploaded_by.email
        return None
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None


class InspectionFormSerializer(serializers.ModelSerializer):
    """Serializer for inspection form"""
    documents = InspectionDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = InspectionForm
        fields = [
            'inspection', 'scheduled_at', 'inspection_notes', 'checklist',
            'findings_summary', 'compliance_decision', 'violations_found',
            'compliance_plan', 'compliance_deadline', 'documents',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        """Ensure violations are provided if non-compliant"""
        if data.get('compliance_decision') == 'NON_COMPLIANT':
            if not data.get('violations_found'):
                raise serializers.ValidationError({
                    'violations_found': 'Violations must be specified for non-compliant inspections'
                })
        return data


class InspectionSerializer(serializers.ModelSerializer):
    """Main inspection serializer with all related data"""
    
    # Related data
    establishments_detail = serializers.SerializerMethodField()
    form = InspectionFormSerializer(read_only=True)
    history = InspectionHistorySerializer(many=True, read_only=True)
    
    # User details
    created_by_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    assigned_to_level = serializers.SerializerMethodField()
    
    # Status helpers
    simplified_status = serializers.SerializerMethodField()
    can_user_act = serializers.SerializerMethodField()
    available_actions = serializers.SerializerMethodField()
    
    class Meta:
        model = Inspection
        fields = [
            'id', 'code', 'establishments', 'establishments_detail',
            'law', 'district', 'created_by', 'created_by_name',
            'assigned_to', 'assigned_to_name', 'assigned_to_level',
            'current_status', 'simplified_status',
            'created_at', 'updated_at',
            'form', 'history',
            'can_user_act', 'available_actions'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']
    
    def get_establishments_detail(self, obj):
        """Get detailed establishment information"""
        establishments = obj.establishments.all()
        return [{
            'id': est.id,
            'name': est.name,
            'nature_of_business': est.nature_of_business,
            'province': est.province,
            'city': est.city,
            'barangay': est.barangay,
            'street_building': est.street_building,
            'postal_code': est.postal_code,
            'latitude': str(est.latitude),
            'longitude': str(est.longitude),
        } for est in establishments]
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.email
        return None
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip() or obj.assigned_to.email
        return None
    
    def get_assigned_to_level(self, obj):
        return obj.assigned_to.userlevel if obj.assigned_to else None
    
    def get_simplified_status(self, obj):
        return obj.get_simplified_status()
    
    def get_can_user_act(self, obj):
        """Check if current user can act on this inspection"""
        request = self.context.get('request')
        if request and request.user:
            return obj.assigned_to == request.user
        return False
    
    def get_available_actions(self, obj):
        """Get available actions for current user"""
        request = self.context.get('request')
        if not request or not request.user:
            return []
        
        user = request.user
        status = obj.current_status
        
        # Can only act if assigned to you
        if obj.assigned_to != user:
            return []
        
        # Define actions based on status and user level
        actions_map = {
            ('SECTION_ASSIGNED', 'Section Chief'): ['assign_to_me', 'forward'],
            ('SECTION_IN_PROGRESS', 'Section Chief'): ['start', 'complete'],
            ('SECTION_COMPLETED', 'Section Chief'): ['forward'],
            
            ('UNIT_ASSIGNED', 'Unit Head'): ['assign_to_me', 'forward'],
            ('UNIT_IN_PROGRESS', 'Unit Head'): ['start', 'complete'],
            ('UNIT_COMPLETED', 'Unit Head'): ['forward'],
            
            ('MONITORING_ASSIGNED', 'Monitoring Personnel'): ['start'],
            ('MONITORING_IN_PROGRESS', 'Monitoring Personnel'): ['complete'],
            
            ('UNIT_REVIEWED', 'Unit Head'): ['review'],
            ('SECTION_REVIEWED', 'Section Chief'): ['review'],
            ('DIVISION_REVIEWED', 'Division Chief'): ['forward_to_legal', 'close'],
            
            ('LEGAL_REVIEW', 'Legal Unit'): ['send_nov', 'send_noo', 'close'],
            ('NOV_SENT', 'Legal Unit'): ['send_noo', 'close'],
            ('NOO_SENT', 'Legal Unit'): ['close'],
        }
        
        key = (status, user.userlevel)
        return actions_map.get(key, [])


class InspectionCreateSerializer(serializers.Serializer):
    """Serializer for creating inspections via wizard"""
    establishments = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1,
        help_text='List of establishment IDs'
    )
    law = serializers.ChoiceField(
        choices=['PD-1586', 'RA-6969', 'RA-8749', 'RA-9275', 'RA-9003']
    )
    scheduled_at = serializers.DateTimeField(required=False, allow_null=True)
    inspection_notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_establishments(self, value):
        """Validate that all establishment IDs exist"""
        existing_ids = set(Establishment.objects.filter(id__in=value).values_list('id', flat=True))
        invalid_ids = set(value) - existing_ids
        if invalid_ids:
            raise serializers.ValidationError(
                f"Invalid establishment IDs: {', '.join(map(str, invalid_ids))}"
            )
        return value
    
    def create(self, validated_data):
        """Create inspection with form"""
        establishment_ids = validated_data.pop('establishments')
        scheduled_at = validated_data.pop('scheduled_at', None)
        inspection_notes = validated_data.pop('inspection_notes', '')
        
        # Get request user
        request = self.context.get('request')
        user = request.user if request else None
        
        # Create inspection
        inspection = Inspection.objects.create(
            law=validated_data['law'],
            created_by=user,
            current_status='CREATED'
        )
        
        # Add establishments
        inspection.establishments.set(establishment_ids)
        
        # Determine district from first establishment
        first_establishment = Establishment.objects.get(id=establishment_ids[0])
        from inspections.regions import get_district_by_city
        district = get_district_by_city(first_establishment.province, first_establishment.city)
        if district:
            inspection.district = f"{first_establishment.province} - {district}"
            inspection.save()
        
        # Create inspection form
        InspectionForm.objects.create(
            inspection=inspection,
            scheduled_at=scheduled_at,
            inspection_notes=inspection_notes
        )
        
        # Transition to SECTION_ASSIGNED and auto-assign
        if user and user.userlevel == 'Division Chief':
            inspection.current_status = 'SECTION_ASSIGNED'
            inspection.auto_assign_personnel()
            inspection.save()
            
            # Log history
            InspectionHistory.objects.create(
                inspection=inspection,
                previous_status='CREATED',
                new_status='SECTION_ASSIGNED',
                changed_by=user,
                remarks='Inspection created and assigned to Section Chief'
            )
        
        return inspection


class InspectionActionSerializer(serializers.Serializer):
    """Serializer for inspection actions (assign, start, complete, forward, review)"""
    remarks = serializers.CharField(required=False, allow_blank=True)
    
    # For complete action (monitoring)
    compliance_decision = serializers.ChoiceField(
        choices=['COMPLIANT', 'NON_COMPLIANT'],
        required=False
    )
    violations_found = serializers.CharField(required=False, allow_blank=True)
    findings_summary = serializers.CharField(required=False, allow_blank=True)


class NOVSerializer(serializers.Serializer):
    """Serializer for sending Notice of Violation"""
    violations = serializers.CharField(required=True)
    compliance_instructions = serializers.CharField(required=True)
    compliance_deadline = serializers.DateField(required=True)
    required_office_visit = serializers.BooleanField(default=False)
    remarks = serializers.CharField(required=False, allow_blank=True)


class NOOSerializer(serializers.Serializer):
    """Serializer for sending Notice of Order"""
    penalty_fees = serializers.CharField(required=True)
    violation_breakdown = serializers.CharField(required=True)
    payment_deadline = serializers.DateField(required=True)
    remarks = serializers.CharField(required=False, allow_blank=True)

