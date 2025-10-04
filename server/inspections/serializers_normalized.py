from rest_framework import serializers
from .models_normalized import (
    Law, InspectionStatus, WorkflowAction, ComplianceStatus, 
    WorkflowRule, Inspection, InspectionDecision, InspectionWorkflowHistory,
    InspectionLawAssignment
)
from establishments.models import Establishment
from users.models import User


class LawSerializer(serializers.ModelSerializer):
    """Serializer for Law model"""
    
    class Meta:
        model = Law
        fields = ['id', 'code', 'name', 'description', 'has_unit_head', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class InspectionStatusSerializer(serializers.ModelSerializer):
    """Serializer for InspectionStatus model"""
    
    class Meta:
        model = InspectionStatus
        fields = ['id', 'code', 'name', 'description', 'is_final', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class WorkflowActionSerializer(serializers.ModelSerializer):
    """Serializer for WorkflowAction model"""
    
    class Meta:
        model = WorkflowAction
        fields = ['id', 'code', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ComplianceStatusSerializer(serializers.ModelSerializer):
    """Serializer for ComplianceStatus model"""
    
    class Meta:
        model = ComplianceStatus
        fields = ['id', 'code', 'name', 'description', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class WorkflowRuleSerializer(serializers.ModelSerializer):
    """Serializer for WorkflowRule model"""
    status_name = serializers.CharField(source='status.name', read_only=True)
    action_name = serializers.CharField(source='action.name', read_only=True)
    next_status_name = serializers.CharField(source='next_status.name', read_only=True)
    
    class Meta:
        model = WorkflowRule
        fields = [
            'id', 'status', 'status_name', 'user_level', 'action', 'action_name', 
            'next_status', 'next_status_name', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class InspectionDecisionSerializer(serializers.ModelSerializer):
    """Serializer for InspectionDecision model"""
    action_name = serializers.CharField(source='action.name', read_only=True)
    compliance_status_name = serializers.CharField(source='compliance_status.name', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.email', read_only=True)
    
    class Meta:
        model = InspectionDecision
        fields = [
            'id', 'inspection', 'action', 'action_name', 'performed_by', 'performed_by_name',
            'comments', 'compliance_status', 'compliance_status_name', 'violations_found',
            'compliance_notes', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class InspectionWorkflowHistorySerializer(serializers.ModelSerializer):
    """Serializer for InspectionWorkflowHistory model"""
    action_name = serializers.CharField(source='action.name', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.email', read_only=True)
    
    class Meta:
        model = InspectionWorkflowHistory
        fields = [
            'id', 'inspection', 'action', 'action_name', 'performed_by', 'performed_by_name',
            'comments', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class InspectionLawAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for InspectionLawAssignment model"""
    law_name = serializers.CharField(source='law.name', read_only=True)
    law_code = serializers.CharField(source='law.code', read_only=True)
    assigned_to_section_chief_name = serializers.CharField(source='assigned_to_section_chief.email', read_only=True)
    assigned_to_unit_head_name = serializers.CharField(source='assigned_to_unit_head.email', read_only=True)
    assigned_to_monitoring_personnel_name = serializers.CharField(source='assigned_to_monitoring_personnel.email', read_only=True)
    
    class Meta:
        model = InspectionLawAssignment
        fields = [
            'id', 'inspection', 'law', 'law_name', 'law_code', 'assigned_to_section_chief',
            'assigned_to_section_chief_name', 'assigned_to_unit_head', 'assigned_to_unit_head_name',
            'assigned_to_monitoring_personnel', 'assigned_to_monitoring_personnel_name',
            'law_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InspectionSerializer(serializers.ModelSerializer):
    """Serializer for Inspection model with normalized relationships"""
    # Related object names for display
    establishment_name = serializers.CharField(source='establishment.name', read_only=True)
    law_name = serializers.CharField(source='law.name', read_only=True)
    law_code = serializers.CharField(source='law.code', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    compliance_status_name = serializers.CharField(source='compliance_status.name', read_only=True)
    
    # Assignment names
    assigned_legal_unit_name = serializers.CharField(source='assigned_legal_unit.email', read_only=True)
    assigned_division_head_name = serializers.CharField(source='assigned_division_head.email', read_only=True)
    assigned_section_chief_name = serializers.CharField(source='assigned_section_chief.email', read_only=True)
    assigned_unit_head_name = serializers.CharField(source='assigned_unit_head.email', read_only=True)
    assigned_monitor_name = serializers.CharField(source='assigned_monitor.email', read_only=True)
    current_assigned_to_name = serializers.CharField(source='current_assigned_to.email', read_only=True)
    created_by_name = serializers.CharField(source='created_by.email', read_only=True)
    
    # Related objects
    decisions = InspectionDecisionSerializer(many=True, read_only=True)
    workflow_history = InspectionWorkflowHistorySerializer(many=True, read_only=True)
    law_assignments = InspectionLawAssignmentSerializer(many=True, read_only=True)
    
    # Available actions for current user
    available_actions = serializers.SerializerMethodField()
    
    class Meta:
        model = Inspection
        fields = [
            'id', 'code', 'establishment', 'establishment_name', 'law', 'law_name', 'law_code',
            'status', 'status_name', 'district', 'assigned_legal_unit', 'assigned_legal_unit_name',
            'assigned_division_head', 'assigned_division_head_name', 'assigned_section_chief',
            'assigned_section_chief_name', 'assigned_unit_head', 'assigned_unit_head_name',
            'assigned_monitor', 'assigned_monitor_name', 'current_assigned_to', 'current_assigned_to_name',
            'inspection_list', 'applicable_laws', 'billing_record', 'compliance_call', 'inspection_notes',
            'compliance_status', 'compliance_status_name', 'compliance_notes', 'violations_found',
            'compliance_plan', 'compliance_deadline', 'notice_of_violation_sent', 'notice_of_order_sent',
            'penalties_imposed', 'legal_unit_comments', 'workflow_comments', 'created_by', 'created_by_name',
            'created_at', 'updated_at', 'decisions', 'workflow_history', 'law_assignments', 'available_actions'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at', 'available_actions']
    
    def get_available_actions(self, obj):
        """Get available actions for the current user"""
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return obj.get_available_actions(request.user)
        return []


class InspectionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new inspections"""
    
    class Meta:
        model = Inspection
        fields = [
            'establishment', 'law', 'district', 'assigned_legal_unit', 'assigned_division_head',
            'assigned_section_chief', 'assigned_unit_head', 'assigned_monitor', 'inspection_list',
            'applicable_laws', 'compliance_call', 'inspection_notes', 'compliance_plan',
            'compliance_deadline', 'workflow_comments'
        ]
    
    def create(self, validated_data):
        """Create a new inspection with default values"""
        # Set default status
        if 'status' not in validated_data:
            validated_data['status'] = InspectionStatus.objects.get(code='DIVISION_CREATED')
        
        # Set default compliance status
        if 'compliance_status' not in validated_data:
            validated_data['compliance_status'] = ComplianceStatus.objects.get(code='PENDING')
        
        # Set created_by
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        
        return super().create(validated_data)


class InspectionUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating inspections"""
    
    class Meta:
        model = Inspection
        fields = [
            'status', 'district', 'assigned_legal_unit', 'assigned_division_head',
            'assigned_section_chief', 'assigned_unit_head', 'assigned_monitor', 'current_assigned_to',
            'inspection_list', 'applicable_laws', 'billing_record', 'compliance_call', 'inspection_notes',
            'compliance_status', 'compliance_notes', 'violations_found', 'compliance_plan',
            'compliance_deadline', 'notice_of_violation_sent', 'notice_of_order_sent',
            'penalties_imposed', 'legal_unit_comments', 'workflow_comments'
        ]


class InspectionDecisionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating inspection decisions"""
    
    class Meta:
        model = InspectionDecision
        fields = [
            'inspection', 'action', 'comments', 'compliance_status', 'violations_found', 'compliance_notes'
        ]
    
    def create(self, validated_data):
        """Create a new inspection decision"""
        # Set performed_by
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            validated_data['performed_by'] = request.user
        
        return super().create(validated_data)


class InspectionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for inspection lists"""
    establishment_name = serializers.CharField(source='establishment.name', read_only=True)
    law_name = serializers.CharField(source='law.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    compliance_status_name = serializers.CharField(source='compliance_status.name', read_only=True)
    current_assigned_to_name = serializers.CharField(source='current_assigned_to.email', read_only=True)
    
    class Meta:
        model = Inspection
        fields = [
            'id', 'code', 'establishment_name', 'law_name', 'status_name', 'district',
            'compliance_status_name', 'current_assigned_to_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'updated_at']
