from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Prefetch
from django.shortcuts import get_object_or_404
from .models_normalized import (
    Law, InspectionStatus, WorkflowAction, ComplianceStatus, 
    WorkflowRule, Inspection, InspectionDecision, InspectionWorkflowHistory,
    InspectionLawAssignment
)
from .serializers_normalized import (
    LawSerializer, InspectionStatusSerializer, WorkflowActionSerializer,
    ComplianceStatusSerializer, WorkflowRuleSerializer, InspectionSerializer,
    InspectionCreateSerializer, InspectionUpdateSerializer, InspectionListSerializer,
    InspectionDecisionSerializer, InspectionDecisionCreateSerializer,
    InspectionWorkflowHistorySerializer, InspectionLawAssignmentSerializer
)


class LawViewSet(viewsets.ModelViewSet):
    """ViewSet for Law model"""
    queryset = Law.objects.filter(is_active=True)
    serializer_class = LawSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter laws based on query parameters"""
        queryset = Law.objects.filter(is_active=True)
        
        # Filter by has_unit_head
        has_unit_head = self.request.query_params.get('has_unit_head')
        if has_unit_head is not None:
            queryset = queryset.filter(has_unit_head=has_unit_head.lower() == 'true')
        
        return queryset.order_by('code')


class InspectionStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for InspectionStatus model"""
    queryset = InspectionStatus.objects.filter(is_active=True)
    serializer_class = InspectionStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter statuses based on query parameters"""
        queryset = InspectionStatus.objects.filter(is_active=True)
        
        # Filter by is_final
        is_final = self.request.query_params.get('is_final')
        if is_final is not None:
            queryset = queryset.filter(is_final=is_final.lower() == 'true')
        
        return queryset.order_by('code')


class WorkflowActionViewSet(viewsets.ModelViewSet):
    """ViewSet for WorkflowAction model"""
    queryset = WorkflowAction.objects.filter(is_active=True)
    serializer_class = WorkflowActionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter actions based on query parameters"""
        queryset = WorkflowAction.objects.filter(is_active=True)
        
        # Filter by status and user level for available actions
        status_code = self.request.query_params.get('status')
        user_level = self.request.query_params.get('user_level')
        
        if status_code and user_level:
            # Get available actions for specific status and user level
            available_actions = WorkflowRule.objects.filter(
                status__code=status_code,
                user_level=user_level,
                is_active=True
            ).values_list('action', flat=True)
            queryset = queryset.filter(id__in=available_actions)
        
        return queryset.order_by('code')


class ComplianceStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for ComplianceStatus model"""
    queryset = ComplianceStatus.objects.filter(is_active=True)
    serializer_class = ComplianceStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter compliance statuses based on query parameters"""
        queryset = ComplianceStatus.objects.filter(is_active=True)
        return queryset.order_by('code')


class WorkflowRuleViewSet(viewsets.ModelViewSet):
    """ViewSet for WorkflowRule model"""
    queryset = WorkflowRule.objects.filter(is_active=True)
    serializer_class = WorkflowRuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter workflow rules based on query parameters"""
        queryset = WorkflowRule.objects.filter(is_active=True)
        
        # Filter by status
        status_code = self.request.query_params.get('status')
        if status_code:
            queryset = queryset.filter(status__code=status_code)
        
        # Filter by user level
        user_level = self.request.query_params.get('user_level')
        if user_level:
            queryset = queryset.filter(user_level=user_level)
        
        return queryset.select_related('status', 'action', 'next_status')


class InspectionViewSet(viewsets.ModelViewSet):
    """ViewSet for Inspection model"""
    queryset = Inspection.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return InspectionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return InspectionUpdateSerializer
        elif self.action == 'list':
            return InspectionListSerializer
        else:
            return InspectionSerializer
    
    def get_queryset(self):
        """Filter inspections based on query parameters and user permissions"""
        queryset = Inspection.objects.select_related(
            'establishment', 'law', 'status', 'compliance_status',
            'assigned_legal_unit', 'assigned_division_head', 'assigned_section_chief',
            'assigned_unit_head', 'assigned_monitor', 'current_assigned_to', 'created_by'
        ).prefetch_related(
            'decisions', 'workflow_history', 'law_assignments'
        )
        
        # Filter by establishment
        establishment_id = self.request.query_params.get('establishment')
        if establishment_id:
            queryset = queryset.filter(establishment_id=establishment_id)
        
        # Filter by law
        law_code = self.request.query_params.get('law')
        if law_code:
            queryset = queryset.filter(law__code=law_code)
        
        # Filter by status
        status_code = self.request.query_params.get('status')
        if status_code:
            queryset = queryset.filter(status__code=status_code)
        
        # Filter by compliance status
        compliance_status_code = self.request.query_params.get('compliance_status')
        if compliance_status_code:
            queryset = queryset.filter(compliance_status__code=compliance_status_code)
        
        # Filter by district
        district = self.request.query_params.get('district')
        if district:
            queryset = queryset.filter(district=district)
        
        # Filter by assigned user
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(current_assigned_to_id=assigned_to)
        
        # Filter by user's assignments
        user = self.request.user
        if user and not user.is_superuser:
            # Show inspections assigned to the user or created by the user
            queryset = queryset.filter(
                Q(current_assigned_to=user) |
                Q(created_by=user) |
                Q(assigned_legal_unit=user) |
                Q(assigned_division_head=user) |
                Q(assigned_section_chief=user) |
                Q(assigned_unit_head=user) |
                Q(assigned_monitor=user)
            )
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        """Create a new inspection"""
        # Set default status if not provided
        if 'status' not in serializer.validated_data:
            default_status = InspectionStatus.objects.get(code='DIVISION_CREATED')
            serializer.validated_data['status'] = default_status
        
        # Set default compliance status if not provided
        if 'compliance_status' not in serializer.validated_data:
            default_compliance_status = ComplianceStatus.objects.get(code='PENDING')
            serializer.validated_data['compliance_status'] = default_compliance_status
        
        # Set created_by
        serializer.validated_data['created_by'] = self.request.user
        
        return serializer.save()
    
    @action(detail=True, methods=['post'])
    def make_decision(self, request, pk=None):
        """Make a workflow decision for an inspection"""
        inspection = self.get_object()
        
        # Get action code from request
        action_code = request.data.get('action')
        if not action_code:
            return Response(
                {'error': 'Action code is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get additional data
        comments = request.data.get('comments')
        compliance_status_code = request.data.get('compliance_status')
        violations_found = request.data.get('violations_found')
        compliance_notes = request.data.get('compliance_notes')
        
        # Get compliance status if provided
        compliance_status = None
        if compliance_status_code:
            try:
                compliance_status = ComplianceStatus.objects.get(code=compliance_status_code)
            except ComplianceStatus.DoesNotExist:
                return Response(
                    {'error': f'Compliance status {compliance_status_code} not found'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Make the decision
        success, message = inspection.make_decision(
            user=request.user,
            action_code=action_code,
            comments=comments,
            compliance_status=compliance_status,
            violations_found=violations_found,
            compliance_notes=compliance_notes
        )
        
        if success:
            # Return updated inspection
            serializer = self.get_serializer(inspection)
            return Response(serializer.data)
        else:
            return Response(
                {'error': message}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def available_actions(self, request, pk=None):
        """Get available actions for the current user"""
        inspection = self.get_object()
        actions = inspection.get_available_actions(request.user)
        
        # Get action details
        action_objects = WorkflowAction.objects.filter(code__in=actions, is_active=True)
        serializer = WorkflowActionSerializer(action_objects, many=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def workflow_history(self, request, pk=None):
        """Get workflow history for an inspection"""
        inspection = self.get_object()
        history = inspection.workflow_history.all()
        serializer = InspectionWorkflowHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def decisions(self, request, pk=None):
        """Get decisions for an inspection"""
        inspection = self.get_object()
        decisions = inspection.decisions.all()
        serializer = InspectionDecisionSerializer(decisions, many=True)
        return Response(serializer.data)


class InspectionDecisionViewSet(viewsets.ModelViewSet):
    """ViewSet for InspectionDecision model"""
    queryset = InspectionDecision.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return InspectionDecisionCreateSerializer
        else:
            return InspectionDecisionSerializer
    
    def get_queryset(self):
        """Filter decisions based on query parameters"""
        queryset = InspectionDecision.objects.select_related(
            'inspection', 'action', 'performed_by', 'compliance_status'
        )
        
        # Filter by inspection
        inspection_id = self.request.query_params.get('inspection')
        if inspection_id:
            queryset = queryset.filter(inspection_id=inspection_id)
        
        # Filter by action
        action_code = self.request.query_params.get('action')
        if action_code:
            queryset = queryset.filter(action__code=action_code)
        
        # Filter by performed_by
        performed_by = self.request.query_params.get('performed_by')
        if performed_by:
            queryset = queryset.filter(performed_by_id=performed_by)
        
        # Filter by compliance status
        compliance_status_code = self.request.query_params.get('compliance_status')
        if compliance_status_code:
            queryset = queryset.filter(compliance_status__code=compliance_status_code)
        
        return queryset.order_by('-timestamp')
    
    def perform_create(self, serializer):
        """Create a new inspection decision"""
        # Set performed_by
        serializer.validated_data['performed_by'] = self.request.user
        return serializer.save()


class InspectionWorkflowHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for InspectionWorkflowHistory model (read-only)"""
    queryset = InspectionWorkflowHistory.objects.all()
    serializer_class = InspectionWorkflowHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter workflow history based on query parameters"""
        queryset = InspectionWorkflowHistory.objects.select_related(
            'inspection', 'action', 'performed_by'
        )
        
        # Filter by inspection
        inspection_id = self.request.query_params.get('inspection')
        if inspection_id:
            queryset = queryset.filter(inspection_id=inspection_id)
        
        # Filter by action
        action_code = self.request.query_params.get('action')
        if action_code:
            queryset = queryset.filter(action__code=action_code)
        
        # Filter by performed_by
        performed_by = self.request.query_params.get('performed_by')
        if performed_by:
            queryset = queryset.filter(performed_by_id=performed_by)
        
        return queryset.order_by('-timestamp')


class InspectionLawAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for InspectionLawAssignment model"""
    queryset = InspectionLawAssignment.objects.all()
    serializer_class = InspectionLawAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter law assignments based on query parameters"""
        queryset = InspectionLawAssignment.objects.select_related(
            'inspection', 'law', 'assigned_to_section_chief', 
            'assigned_to_unit_head', 'assigned_to_monitoring_personnel'
        )
        
        # Filter by inspection
        inspection_id = self.request.query_params.get('inspection')
        if inspection_id:
            queryset = queryset.filter(inspection_id=inspection_id)
        
        # Filter by law
        law_code = self.request.query_params.get('law')
        if law_code:
            queryset = queryset.filter(law__code=law_code)
        
        # Filter by law status
        law_status = self.request.query_params.get('law_status')
        if law_status:
            queryset = queryset.filter(law_status=law_status)
        
        # Filter by assigned user
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(
                Q(assigned_to_section_chief_id=assigned_to) |
                Q(assigned_to_unit_head_id=assigned_to) |
                Q(assigned_to_monitoring_personnel_id=assigned_to)
            )
        
        return queryset.order_by('-created_at')
