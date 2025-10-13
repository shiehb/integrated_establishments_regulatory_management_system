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
    assigned_to_name = serializers.SerializerMethodField()
    assigned_to_level = serializers.SerializerMethodField()
    
    class Meta:
        model = InspectionHistory
        fields = [
            'id', 'inspection', 'previous_status', 'new_status',
            'changed_by', 'changed_by_name', 'changed_by_level',
            'assigned_to', 'assigned_to_name', 'assigned_to_level',
            'law', 'section', 'remarks', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_changed_by_name(self, obj):
        if obj.changed_by:
            return f"{obj.changed_by.first_name} {obj.changed_by.last_name}".strip() or obj.changed_by.email
        return None
    
    def get_changed_by_level(self, obj):
        return obj.changed_by.userlevel if obj.changed_by else None
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip() or obj.assigned_to.email
        return None
    
    def get_assigned_to_level(self, obj):
        return obj.assigned_to.userlevel if obj.assigned_to else None


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
    inspected_by_name = serializers.SerializerMethodField()
    inspector_info = serializers.SerializerMethodField()
    
    class Meta:
        model = InspectionForm
        fields = [
            'inspection', 'scheduled_at', 'checklist',
            'findings_summary', 'compliance_decision', 'violations_found',
            'compliance_plan', 'compliance_deadline', 'documents',
            'inspected_by', 'inspected_by_name', 'inspector_info',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'created_at', 'updated_at', 'inspected_by'
        ]
    
    def get_inspected_by_name(self, obj):
        """Get the name of the user who inspected the form"""
        if obj.inspected_by:
            return f"{obj.inspected_by.first_name} {obj.inspected_by.last_name}".strip() or obj.inspected_by.email
        return None
    
    def get_inspector_info(self, obj):
        """Get formatted inspector information for display"""
        if not obj.inspected_by:
            return None
        
        return {
            'name': self.get_inspected_by_name(obj),
            'level': obj.inspected_by.userlevel if obj.inspected_by else None,
            'section': obj.inspected_by.section if obj.inspected_by else None,
            'district': obj.inspected_by.district if obj.inspected_by else None,
            'inspected_at': obj.created_at  # Use form creation time as inspection time
        }
    
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
    establishments = serializers.SerializerMethodField()
    establishments_detail = serializers.SerializerMethodField()
    form = InspectionFormSerializer(read_only=True)
    history = InspectionHistorySerializer(many=True, read_only=True)
    
    # User details
    created_by_name = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    assigned_to_level = serializers.SerializerMethodField()
    inspected_by_name = serializers.SerializerMethodField()
    
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
            'inspected_by_name',
            'current_status', 'simplified_status',
            'created_at', 'updated_at',
            'form', 'history',
            'can_user_act', 'available_actions'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']
    
    def get_establishments(self, obj):
        """Get establishment IDs"""
        return list(obj.establishments.values_list('id', flat=True))
    
    def get_establishments_detail(self, obj):
        """Get detailed establishment information"""
        establishments = obj.establishments.all()
        return [{
            'id': est.id,
            'name': est.name,
            'nature_of_business': est.nature_of_business,
            'year_established': est.year_established,
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
    
    def get_inspected_by_name(self, obj):
        """Get the name of the user who inspected this inspection"""
        if hasattr(obj, 'form') and obj.form and obj.form.inspected_by:
            inspector = obj.form.inspected_by
            return f"{inspector.first_name} {inspector.last_name}".strip() or inspector.email
        return None
    
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
        
        
        # Define actions based on status and user level - 5 Button Strategy
        actions_map = {
            # Initial creation - Division Chief can assign to sections
            ('CREATED', 'Division Chief'): ['assign_to_me', 'forward'],
            
            # Section Chief workflow
            ('SECTION_ASSIGNED', 'Section Chief'): ['inspect', 'forward'],
            ('SECTION_IN_PROGRESS', 'Section Chief'): ['continue'],
            ('SECTION_COMPLETED_COMPLIANT', 'Division Chief'): ['review'],  # NO forward, auto-assigned
            ('SECTION_COMPLETED_NON_COMPLIANT', 'Division Chief'): ['review'],  # NO forward, auto-assigned
            
            # Unit Head workflow
            ('UNIT_ASSIGNED', 'Unit Head'): ['inspect', 'forward'],
            ('UNIT_IN_PROGRESS', 'Unit Head'): ['continue', 'forward'],
            ('UNIT_COMPLETED_COMPLIANT', 'Section Chief'): ['review'],  # NO forward, auto-assigned
            ('UNIT_COMPLETED_NON_COMPLIANT', 'Section Chief'): ['review'],  # NO forward, auto-assigned
            
            # Monitoring Personnel workflow
            ('MONITORING_ASSIGNED', 'Monitoring Personnel'): ['inspect'],
            ('MONITORING_IN_PROGRESS', 'Monitoring Personnel'): ['continue'],
            ('MONITORING_COMPLETED_COMPLIANT', 'Unit Head'): ['review'],  # NO forward, auto-assigned
            ('MONITORING_COMPLETED_NON_COMPLIANT', 'Unit Head'): ['review'],  # NO forward, auto-assigned
            
            # Review statuses (have Forward button)
            ('UNIT_REVIEWED', 'Section Chief'): ['review', 'forward'],
            ('SECTION_REVIEWED', 'Division Chief'): ['review', 'forward'],
            ('DIVISION_REVIEWED', 'Division Chief'): ['review', 'send_to_legal', 'close'],
            
            # Legal Unit actions
            ('LEGAL_REVIEW', 'Legal Unit'): ['review', 'close'],
            ('NOV_SENT', 'Legal Unit'): ['review', 'close'],
            ('NOO_SENT', 'Legal Unit'): ['review', 'close'],
        }
        
        key = (status, user.userlevel)
        available_actions = actions_map.get(key, [])
        
        
        # Special case: Unassigned users can assign to themselves
        if status in ['SECTION_ASSIGNED', 'UNIT_ASSIGNED'] and obj.assigned_to != user:
            if (status == 'SECTION_ASSIGNED' and user.userlevel == 'Section Chief') or \
               (status == 'UNIT_ASSIGNED' and user.userlevel == 'Unit Head'):
                return ['assign_to_me', 'forward']
        
        # Special case: Monitoring Personnel with MONITORING_ASSIGNED status
        if status == 'MONITORING_ASSIGNED' and user.userlevel == 'Monitoring Personnel':
            return ['inspect']
        
        # Special case: Division Chief in "all_inspections" tab should have no actions
        # Check if this is a Division Chief viewing in "all_inspections" tab
        if user.userlevel == 'Division Chief' and status != 'DIVISION_REVIEWED':
            return []
        
        # Filter actions based on assignment status
        if obj.assigned_to == user:
            # User is assigned - can perform all available actions
            return available_actions
        else:
            # User is not assigned - can only assign to themselves or perform review actions
            filtered_actions = []
            for action in available_actions:
                if action == 'assign_to_me':
                    filtered_actions.append(action)
                elif action == 'review' and user.userlevel == 'Unit Head':
                    # Unit Head can review inspections even if not assigned (for review tab)
                    filtered_actions.append(action)
            
            
            # TEMPORARY FIX: If no actions found, return assign_to_me for Division Chief
            if not filtered_actions and user.userlevel == 'Division Chief':
                return ['assign_to_me']
            
            return filtered_actions


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
            scheduled_at=scheduled_at
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
            
            # Send notifications to assigned Section Chief
            if inspection.assigned_to:
                from notifications.models import Notification
                from .utils import send_inspection_assignment_notification
                import logging
                
                logger = logging.getLogger(__name__)
                
                # Get establishment names for notification message
                establishment_names = [est.name for est in inspection.establishments.all()]
                establishment_list = ", ".join(establishment_names) if establishment_names else "No establishments"
                
                # Create system notification
                Notification.objects.create(
                    recipient=inspection.assigned_to,
                    sender=user,
                    notification_type='new_inspection',
                    title='New Inspection Assignment',
                    message=f'You have been assigned inspection {inspection.code} for {establishment_list} under {inspection.law}. Please review and take action.'
                )
                
                # Send email notification
                try:
                    send_inspection_assignment_notification(inspection.assigned_to, inspection)
                    logger.info(f"Notification sent to {inspection.assigned_to.email} for inspection {inspection.code}")
                except Exception as e:
                    # Don't fail inspection creation if email fails
                    logger.error(f"Failed to send email notification for inspection {inspection.code}: {str(e)}")
        
        return inspection


class InspectionActionSerializer(serializers.Serializer):
    """Serializer for inspection actions (assign, start, complete, forward, review)"""
    remarks = serializers.CharField(required=False, allow_blank=True)
    
    # For complete action (monitoring)
    compliance_decision = serializers.ChoiceField(
        choices=['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT'],
        required=False
    )
    violations_found = serializers.CharField(required=False, allow_blank=True)
    findings_summary = serializers.CharField(required=False, allow_blank=True)
    
    # For form data
    form_data = serializers.JSONField(required=False)


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