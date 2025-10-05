"""
Refactored Inspection Views with Complete Workflow
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import Inspection, InspectionForm, InspectionDocument, InspectionHistory
from .serializers import (
    InspectionSerializer, InspectionCreateSerializer, InspectionFormSerializer,
    InspectionHistorySerializer, InspectionDocumentSerializer,
    InspectionActionSerializer, NOVSerializer, NOOSerializer
)

User = get_user_model()


class InspectionViewSet(viewsets.ModelViewSet):
    """
    Complete Inspection ViewSet with workflow state machine
    """
    queryset = Inspection.objects.all()
    serializer_class = InspectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter inspections based on user role and tab"""
        user = self.request.user
        queryset = super().get_queryset()
        
        # Get filter parameters
        tab = self.request.query_params.get('tab')
        status_filter = self.request.query_params.get('status')
        assigned_to_me = self.request.query_params.get('assigned_to_me') == 'true'
        created_by_me = self.request.query_params.get('created_by_me') == 'true'
        
        # Role-based filtering
        if user.userlevel == 'Admin':
            pass  # Admin sees all
        elif user.userlevel == 'Division Chief':
            if tab == 'tracking':
                queryset = queryset.filter(
                    Q(created_by=user) | Q(current_status='DIVISION_REVIEWED')
                )
            else:
                queryset = queryset.filter(created_by=user)
        elif user.userlevel == 'Section Chief':
            queryset = self._filter_section_chief(queryset, user, tab)
        elif user.userlevel == 'Unit Head':
            queryset = self._filter_unit_head(queryset, user, tab)
        elif user.userlevel == 'Monitoring Personnel':
            queryset = queryset.filter(
                assigned_to=user,
                current_status__in=['MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS']
            )
        elif user.userlevel == 'Legal Unit':
            queryset = queryset.filter(
                current_status__in=['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT']
            )
        
        # Additional filters
        if status_filter:
            queryset = queryset.filter(current_status=status_filter)
        if assigned_to_me:
            queryset = queryset.filter(assigned_to=user)
        if created_by_me:
            queryset = queryset.filter(created_by=user)
        
        return queryset.select_related(
            'created_by', 'assigned_to'
        ).prefetch_related('establishments', 'history').order_by('-created_at')
    
    def _filter_section_chief(self, queryset, user, tab):
        """Filter for Section Chief based on tab"""
        if tab == 'received':
            return queryset.filter(
                assigned_to=user,
                current_status='SECTION_ASSIGNED'
            )
        elif tab == 'my_inspections':
            return queryset.filter(
                assigned_to=user,
                current_status__in=['SECTION_IN_PROGRESS', 'SECTION_COMPLETED']
            )
        elif tab == 'forwarded':
            # Inspections they forwarded (track by history or filter by law)
            return queryset.filter(
                law=user.section,
                current_status__in=[
                    'UNIT_ASSIGNED', 'UNIT_IN_PROGRESS', 'UNIT_COMPLETED',
                    'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS',
                    'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'
                ]
            )
        elif tab == 'review':
            return queryset.filter(
                assigned_to=user,
                current_status='SECTION_REVIEWED'
            )
        else:
            return queryset.filter(
                Q(assigned_to=user) | Q(law=user.section)
            )
    
    def _filter_unit_head(self, queryset, user, tab):
        """Filter for Unit Head based on tab"""
        if tab == 'received':
            return queryset.filter(
                assigned_to=user,
                current_status='UNIT_ASSIGNED'
            )
        elif tab == 'my_inspections':
            return queryset.filter(
                assigned_to=user,
                current_status__in=['UNIT_IN_PROGRESS', 'UNIT_COMPLETED']
            )
        elif tab == 'forwarded':
            return queryset.filter(
                law=user.section,
                district=user.district,
                current_status__in=[
                    'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS',
                    'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'
                ]
            )
        elif tab == 'review':
            return queryset.filter(
                assigned_to=user,
                current_status='UNIT_REVIEWED'
            )
        else:
            return queryset.filter(
                Q(assigned_to=user) | Q(law=user.section, district=user.district)
            )
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'create':
            return InspectionCreateSerializer
        return InspectionSerializer
    
    def perform_create(self, serializer):
        """Create inspection (Division Chief only)"""
        if self.request.user.userlevel != 'Division Chief':
            raise permissions.PermissionDenied('Only Division Chiefs can create inspections')
        serializer.save()
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get inspection history"""
        inspection = self.get_object()
        history = inspection.history.all()
        serializer = InspectionHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def documents(self, request, pk=None):
        """Upload documents to inspection form"""
        inspection = self.get_object()
        
        # Get or create inspection form
        form, created = InspectionForm.objects.get_or_create(inspection=inspection)
        
        # Handle file upload
        file = request.FILES.get('file')
        document_type = request.data.get('document_type', 'OTHER')
        description = request.data.get('description', '')
        
        if not file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create document
        document = InspectionDocument.objects.create(
            inspection_form=form,
            file=file,
            document_type=document_type,
            description=description,
            uploaded_by=request.user
        )
        
        serializer = InspectionDocumentSerializer(document, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def assign_to_me(self, request, pk=None):
        """Assign inspection to current user (Section/Unit only)"""
        inspection = self.get_object()
        user = request.user
        
        # Check user level
        if user.userlevel not in ['Section Chief', 'Unit Head']:
            return Response(
                {'error': 'Only Section Chiefs and Unit Heads can assign to themselves'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if already assigned
        if inspection.assigned_to and inspection.assigned_to != user:
            return Response(
                {'error': f'Already assigned to {inspection.assigned_to}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Assign
        inspection.assigned_to = user
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=inspection.current_status,
            new_status=inspection.current_status,
            changed_by=user,
            remarks='Assigned to self'
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start inspection (Section/Unit/Monitoring)"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can act
        if inspection.assigned_to != user:
            return Response(
                {'error': 'You are not assigned to this inspection'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Determine next status
        status_map = {
            'SECTION_ASSIGNED': 'SECTION_IN_PROGRESS',
            'UNIT_ASSIGNED': 'UNIT_IN_PROGRESS',
            'MONITORING_ASSIGNED': 'MONITORING_IN_PROGRESS',
        }
        
        next_status = status_map.get(inspection.current_status)
        if not next_status:
            return Response(
                {'error': f'Cannot start from status {inspection.current_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if transition is valid
        if not inspection.can_transition_to(next_status, user):
            return Response(
                {'error': f'Invalid transition to {next_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Transition
        prev_status = inspection.current_status
        inspection.current_status = next_status
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status=next_status,
            changed_by=user,
            remarks=request.data.get('remarks', 'Started inspection')
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete inspection"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can act
        if inspection.assigned_to != user:
            return Response(
                {'error': 'You are not assigned to this inspection'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = InspectionActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Determine next status based on current status
        if inspection.current_status == 'SECTION_IN_PROGRESS':
            next_status = 'SECTION_COMPLETED'
        elif inspection.current_status == 'UNIT_IN_PROGRESS':
            next_status = 'UNIT_COMPLETED'
        elif inspection.current_status == 'MONITORING_IN_PROGRESS':
            # Monitoring needs compliance decision
            compliance = data.get('compliance_decision')
            if not compliance:
                return Response(
                    {'error': 'Compliance decision required for monitoring completion'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if compliance == 'COMPLIANT':
                next_status = 'MONITORING_COMPLETED_COMPLIANT'
            else:
                next_status = 'MONITORING_COMPLETED_NON_COMPLIANT'
                # Validate violations
                if not data.get('violations_found'):
                    return Response(
                        {'error': 'Violations required for non-compliant decision'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Update form
            form, created = InspectionForm.objects.get_or_create(inspection=inspection)
            form.compliance_decision = compliance
            form.violations_found = data.get('violations_found', '')
            form.findings_summary = data.get('findings_summary', '')
            form.save()
        else:
            return Response(
                {'error': f'Cannot complete from status {inspection.current_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if transition is valid
        if not inspection.can_transition_to(next_status, user):
            return Response(
                {'error': f'Invalid transition to {next_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Transition
        prev_status = inspection.current_status
        inspection.current_status = next_status
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status=next_status,
            changed_by=user,
            remarks=data.get('remarks', 'Completed inspection')
        )
        
        # Auto-transition monitoring completed to review
        if next_status in ['MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT']:
            self._auto_forward_to_review(inspection, user)
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    def _auto_forward_to_review(self, inspection, user):
        """Auto-forward monitoring completed to Unit Head review"""
        prev_status = inspection.current_status
        inspection.current_status = 'UNIT_REVIEWED'
        
        # Find Unit Head
        next_assignee = inspection.get_next_assignee('UNIT_REVIEWED')
        if next_assignee:
            inspection.assigned_to = next_assignee
        
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status='UNIT_REVIEWED',
            changed_by=user,
            remarks='Auto-forwarded to Unit Head for review'
        )
    
    @action(detail=True, methods=['post'])
    def forward(self, request, pk=None):
        """Forward inspection to next level"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can act
        if inspection.assigned_to != user:
            return Response(
                {'error': 'You are not assigned to this inspection'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Determine next status
        status_map = {
            'SECTION_COMPLETED': 'UNIT_ASSIGNED',
            'UNIT_COMPLETED': 'MONITORING_ASSIGNED',
        }
        
        # Section Chief can forward directly to Unit or Monitoring
        if inspection.current_status == 'SECTION_ASSIGNED':
            # Check if unit head exists for this law
            unit_head = User.objects.filter(
                userlevel='Unit Head',
                section=inspection.law,
                is_active=True
            ).first()
            
            if unit_head:
                next_status = 'UNIT_ASSIGNED'
            else:
                next_status = 'MONITORING_ASSIGNED'
        else:
            next_status = status_map.get(inspection.current_status)
        
        if not next_status:
            return Response(
                {'error': f'Cannot forward from status {inspection.current_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if transition is valid
        if not inspection.can_transition_to(next_status, user):
            return Response(
                {'error': f'Invalid transition to {next_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get next assignee
        next_assignee = inspection.get_next_assignee(next_status)
        if not next_assignee:
            return Response(
                {'error': f'No personnel found for {next_status}'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Transition
        prev_status = inspection.current_status
        inspection.current_status = next_status
        inspection.assigned_to = next_assignee
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status=next_status,
            changed_by=user,
            remarks=request.data.get('remarks', f'Forwarded to {next_assignee}')
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Review and forward up the chain (Unit/Section/Division)"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can act
        if inspection.assigned_to != user:
            return Response(
                {'error': 'You are not assigned to this inspection'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Determine next status
        status_map = {
            'UNIT_REVIEWED': 'SECTION_REVIEWED',
            'SECTION_REVIEWED': 'DIVISION_REVIEWED',
        }
        
        next_status = status_map.get(inspection.current_status)
        if not next_status:
            return Response(
                {'error': f'Cannot review from status {inspection.current_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get next assignee
        next_assignee = inspection.get_next_assignee(next_status)
        if not next_assignee:
            return Response(
                {'error': f'No personnel found for {next_status}'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Transition
        prev_status = inspection.current_status
        inspection.current_status = next_status
        inspection.assigned_to = next_assignee
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status=next_status,
            changed_by=user,
            remarks=request.data.get('remarks', 'Reviewed and forwarded')
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def forward_to_legal(self, request, pk=None):
        """Forward non-compliant case to Legal Unit (Division Chief only)"""
        inspection = self.get_object()
        user = request.user
        
        # Check if Division Chief
        if user.userlevel != 'Division Chief':
            return Response(
                {'error': 'Only Division Chiefs can forward to Legal Unit'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if in correct status
        if inspection.current_status != 'DIVISION_REVIEWED':
            return Response(
                {'error': 'Can only forward to legal from Division Reviewed status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if non-compliant
        form = getattr(inspection, 'form', None)
        if not form or form.compliance_decision != 'NON_COMPLIANT':
            return Response(
                {'error': 'Can only forward non-compliant cases to Legal Unit'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find Legal Unit user
        legal_user = User.objects.filter(userlevel='Legal Unit', is_active=True).first()
        if not legal_user:
            return Response(
                {'error': 'No Legal Unit personnel found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Transition
        prev_status = inspection.current_status
        inspection.current_status = 'LEGAL_REVIEW'
        inspection.assigned_to = legal_user
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status='LEGAL_REVIEW',
            changed_by=user,
            remarks=request.data.get('remarks', 'Forwarded non-compliant case to Legal Unit')
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_nov(self, request, pk=None):
        """Send Notice of Violation (Legal Unit only)"""
        inspection = self.get_object()
        user = request.user
        
        # Check if Legal Unit
        if user.userlevel != 'Legal Unit':
            return Response(
                {'error': 'Only Legal Unit can send NOV'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate data
        serializer = NOVSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Update form
        form = getattr(inspection, 'form', None)
        if form:
            form.violations_found = data['violations']
            form.compliance_plan = data['compliance_instructions']
            form.compliance_deadline = data['compliance_deadline']
            form.save()
        
        # Transition
        prev_status = inspection.current_status
        inspection.current_status = 'NOV_SENT'
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status='NOV_SENT',
            changed_by=user,
            remarks=data.get('remarks', 'Notice of Violation sent')
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_noo(self, request, pk=None):
        """Send Notice of Order (Legal Unit only)"""
        inspection = self.get_object()
        user = request.user
        
        # Check if Legal Unit
        if user.userlevel != 'Legal Unit':
            return Response(
                {'error': 'Only Legal Unit can send NOO'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validate data
        serializer = NOOSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Update form
        form = getattr(inspection, 'form', None)
        if form:
            form.compliance_plan = data['violation_breakdown']
            form.compliance_deadline = data['payment_deadline']
            form.save()
        
        # Transition
        prev_status = inspection.current_status
        inspection.current_status = 'NOO_SENT'
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status='NOO_SENT',
            changed_by=user,
            remarks=f"Notice of Order sent. Penalties: {data['penalty_fees']}"
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close inspection (Division Chief for compliant, Legal for non-compliant)"""
        inspection = self.get_object()
        user = request.user
        
        # Determine final status based on compliance
        form = getattr(inspection, 'form', None)
        is_compliant = form and form.compliance_decision == 'COMPLIANT'
        
        if is_compliant:
            # Division Chief closes compliant cases
            if user.userlevel != 'Division Chief':
                return Response(
                    {'error': 'Only Division Chiefs can close compliant cases'},
                    status=status.HTTP_403_FORBIDDEN
                )
            final_status = 'CLOSED_COMPLIANT'
        else:
            # Legal Unit closes non-compliant cases
            if user.userlevel != 'Legal Unit':
                return Response(
                    {'error': 'Only Legal Unit can close non-compliant cases'},
                    status=status.HTTP_403_FORBIDDEN
                )
            final_status = 'CLOSED_NON_COMPLIANT'
        
        # Transition
        prev_status = inspection.current_status
        inspection.current_status = final_status
        inspection.assigned_to = None  # Clear assignment
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status=final_status,
            changed_by=user,
            remarks=request.data.get('remarks', f'Inspection closed - {"Compliant ✅" if is_compliant else "Non-Compliant ❌"}')
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)

