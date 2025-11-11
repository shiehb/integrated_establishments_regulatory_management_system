"""
Refactored Inspection Views with Complete Workflow
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.utils import timezone

from audit.constants import AUDIT_ACTIONS, AUDIT_MODULES
from audit.utils import log_activity

from .models import Inspection, InspectionForm, InspectionDocument, InspectionHistory, NoticeOfViolation, NoticeOfOrder, BillingRecord
from .serializers import (
    InspectionSerializer, InspectionCreateSerializer, InspectionFormSerializer,
    InspectionHistorySerializer, InspectionDocumentSerializer,
    InspectionActionSerializer, NOVSerializer, NOOSerializer, BillingRecordSerializer
)
from .utils import send_inspection_forward_notification, create_forward_notification

User = get_user_model()
USER_HAS_DISTRICT = any(field.name == 'district' for field in User._meta.get_fields())


def capture_inspector_info(form, user):
    """Capture inspector information on first form fill-out"""
    if form.inspected_by is None and user:
        form.inspected_by = user
        return True  # Indicates this was the first fill-out
    return False  # Not first fill-out


def audit_inspection_event(user, inspection, action, description, request, metadata=None):
    """Helper to standardize inspection audit logging."""
    reference = getattr(inspection, "reference_no", None) or getattr(inspection, "reference_number", None)
    payload = {
        "entity_id": inspection.id,
        "entity_name": reference or f"Inspection #{inspection.id}",
        "status": "success",
        "current_status": inspection.current_status,
        "assigned_to": getattr(inspection.assigned_to, "email", None),
    }
    if metadata:
        payload.update(metadata)

    log_activity(
        user,
        action,
        module=AUDIT_MODULES["INSPECTIONS"],
        description=description,
        metadata=payload,
        request=request,
    )


class InspectionViewSet(viewsets.ModelViewSet):
    """
    Complete Inspection ViewSet with workflow state machine
    """
    queryset = Inspection.objects.all()
    serializer_class = InspectionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return InspectionCreateSerializer
        return InspectionSerializer
    
    def create(self, request, *args, **kwargs):
        """Create inspection using InspectionCreateSerializer"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inspection = serializer.save()
        
        # Return the created inspection using the main serializer
        response_serializer = InspectionSerializer(inspection, context={'request': request})
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """Update inspection with access control validation"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user is trying to update recommendation
        if 'recommendation' in request.data:
            # Only Division Chief can update recommendations
            if user.userlevel != 'Division Chief':
                return Response(
                    {'error': 'Only Division Chief can update recommendations'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Update the recommendation in the form's checklist
            form, created = InspectionForm.objects.get_or_create(inspection=inspection)
            if not form.checklist:
                form.checklist = {}
            
            form.checklist['recommendationState'] = request.data['recommendation']
            form.save()
            
            return Response({
                'message': 'Recommendation updated successfully',
                'inspection': self.get_serializer(inspection).data
            })
        
        # Call the parent update method for other fields
        return super().update(request, *args, **kwargs)
    
    def list(self, request, *args, **kwargs):
        """List inspections with pagination"""
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    def get_queryset(self):
        """Filter inspections based on user role and tab"""
        user = self.request.user
        queryset = super().get_queryset()
        
        # Get filter parameters
        tab = self.request.query_params.get('tab')
        status_filter = self.request.query_params.get('status')
        assigned_to_me = self.request.query_params.get('assigned_to_me') == 'true'
        created_by_me = self.request.query_params.get('created_by_me') == 'true'
        search = self.request.query_params.get('search')
        
        # Role-based filtering
        if user.userlevel == 'Admin':
            # Admin sees all inspections but can filter by workflow stage tabs
            final_statuses = [
                'SECTION_COMPLETED_COMPLIANT',
                'SECTION_COMPLETED_NON_COMPLIANT',
                'UNIT_COMPLETED_COMPLIANT',
                'UNIT_COMPLETED_NON_COMPLIANT',
                'MONITORING_COMPLETED_COMPLIANT',
                'MONITORING_COMPLETED_NON_COMPLIANT',
                'SECTION_REVIEWED',
                'UNIT_REVIEWED',
                'DIVISION_REVIEWED',
                'LEGAL_REVIEW',
                'NOV_SENT',
                'NOO_SENT',
                'CLOSED_COMPLIANT',
                'CLOSED_NON_COMPLIANT'
            ]
            completed_statuses = [
                'SECTION_COMPLETED_COMPLIANT',
                'SECTION_COMPLETED_NON_COMPLIANT',
                'UNIT_COMPLETED_COMPLIANT',
                'UNIT_COMPLETED_NON_COMPLIANT',
                'MONITORING_COMPLETED_COMPLIANT',
                'MONITORING_COMPLETED_NON_COMPLIANT'
            ]
            review_statuses = ['UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED']
            legal_statuses = ['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT']

            if tab == 'inspection_complete':
                queryset = queryset.filter(current_status__in=completed_statuses)
            elif tab == 'under_review':
                queryset = queryset.filter(current_status__in=review_statuses)
            elif tab == 'legal_action':
                queryset = queryset.filter(current_status__in=legal_statuses)
            elif tab == 'compliant':
                queryset = queryset.filter(
                    form__compliance_decision='COMPLIANT',
                    current_status__in=final_statuses
                )
            elif tab == 'non_compliant':
                queryset = queryset.filter(
                    form__compliance_decision__in=['NON_COMPLIANT', 'PARTIALLY_COMPLIANT'],
                    current_status__in=final_statuses
                )
            # All other tabs fall back to the unfiltered queryset for Admin
        elif user.userlevel == 'Division Chief':
            queryset = self._filter_division_chief(queryset, user, tab)
        elif user.userlevel == 'Section Chief':
            queryset = self._filter_section_chief(queryset, user, tab)
        elif user.userlevel == 'Unit Head':
            queryset = self._filter_unit_head(queryset, user, tab)
        elif user.userlevel == 'Monitoring Personnel':
            queryset = self._filter_monitoring_personnel(queryset, user, tab)
        elif user.userlevel == 'Legal Unit':
            queryset = self._filter_legal_unit(queryset, user, tab)
        
        # Additional filters
        if status_filter:
            queryset = queryset.filter(current_status=status_filter)
        if assigned_to_me:
            queryset = queryset.filter(assigned_to=user)
        if created_by_me:
            queryset = queryset.filter(created_by=user)
        
        # Law filter
        law_param = self.request.query_params.get('law')
        if law_param:
            # Support comma-separated laws for multiple selection
            laws = [l.strip() for l in law_param.split(',') if l.strip()]
            if laws:
                queryset = queryset.filter(law__in=laws)
        
        # Establishment filter
        establishment_id = self.request.query_params.get('establishment')
        if establishment_id:
            queryset = queryset.filter(establishments__id=establishment_id)
        
        # Date range filters
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            try:
                from datetime import datetime
                date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                queryset = queryset.filter(created_at__gte=date_from_obj)
            except (ValueError, AttributeError):
                pass  # Invalid date format, skip filter
        if date_to:
            try:
                from datetime import datetime
                date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                # Add one day to include the entire end date
                from datetime import timedelta
                date_to_obj = date_to_obj + timedelta(days=1)
                queryset = queryset.filter(created_at__lt=date_to_obj)
            except (ValueError, AttributeError):
                pass  # Invalid date format, skip filter
        
        # Search functionality
        if search:
            queryset = self._apply_search_filter(queryset, search)
        
        # Sorting
        order_by = self.request.query_params.get('order_by', 'created_at')
        order_direction = self.request.query_params.get('order_direction', 'desc')
        
        # Validate sort field
        valid_sort_fields = ['code', 'created_at', 'updated_at', 'current_status', 'law']
        if order_by in valid_sort_fields:
            # Apply direction
            if order_direction == 'desc':
                order_by = f'-{order_by}'
            queryset = queryset.order_by(order_by)
        else:
            # Default sorting
            queryset = queryset.order_by('-created_at')
        
        return queryset.select_related(
            'created_by', 'assigned_to'
        ).prefetch_related('establishments', 'history').distinct()
    
    def _filter_section_chief(self, queryset, user, tab):
        """Filter for Section Chief based on tab"""
        # Setup law filter for combined EIA section
        law_filter = Q(law=user.section)
        if user.section == 'PD-1586,RA-8749,RA-9275':
            law_filter = Q(law=user.section) | Q(law='PD-1586') | Q(law='RA-8749') | Q(law='RA-9275')
        
        if tab == 'section_assigned' or tab == 'received':
            # Show inspections assigned to this Section Chief but not yet started
            return queryset.filter(
                law_filter,
                current_status='SECTION_ASSIGNED'
            )
        elif tab == 'section_in_progress' or tab == 'my_inspections':
            # Show inspections that this Section Chief is currently working on
            return queryset.filter(
                law_filter,
                assigned_to=user,
                current_status__in=[
                    'SECTION_IN_PROGRESS'
                ]
            )
        elif tab == 'forwarded':
            # Show inspections forwarded to Unit Head or Monitoring Personnel (status-based)
            return queryset.filter(
                law_filter,
                current_status__in=[
                    'UNIT_ASSIGNED',
                    'UNIT_IN_PROGRESS',
                    'MONITORING_ASSIGNED',
                    'MONITORING_IN_PROGRESS'
                ]
            )
        elif tab == 'inspection_complete':
            # Show inspections completed by Section Chiefs or forwarded units
            complete_statuses = [
                'SECTION_COMPLETED_COMPLIANT',
                'SECTION_COMPLETED_NON_COMPLIANT',
                'UNIT_COMPLETED_COMPLIANT',
                'UNIT_COMPLETED_NON_COMPLIANT',
                'MONITORING_COMPLETED_COMPLIANT',
                'MONITORING_COMPLETED_NON_COMPLIANT'
            ]
            return queryset.filter(
                law_filter,
                current_status__in=complete_statuses
            )
        elif tab == 'under_review':
            # Show inspections that are in any review stage
            review_statuses = [
                'UNIT_REVIEWED',
                'SECTION_REVIEWED',
                'DIVISION_REVIEWED'
            ]
            return queryset.filter(
                law_filter,
                current_status__in=review_statuses
            )
        elif tab == 'legal_action':
            # Show inspections that have progressed to legal action
            return queryset.filter(
                law_filter,
                current_status__in=['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT']
            )
        elif tab == 'compliant':
            # Show only COMPLIANT inspections
            return queryset.filter(
                law_filter,
                Q(form__inspected_by=user) | 
                Q(form__inspected_by__userlevel='Section Chief', form__inspected_by__section=user.section) |
                Q(form__inspected_by__userlevel='Unit Head', form__inspected_by__section=user.section) |
                Q(form__inspected_by__userlevel='Monitoring Personnel', form__inspected_by__section=user.section),
                form__compliance_decision='COMPLIANT',
                current_status__in=[
                    'SECTION_COMPLETED_COMPLIANT',
                    'SECTION_COMPLETED_NON_COMPLIANT',
                    'SECTION_REVIEWED',
                    'DIVISION_REVIEWED',
                    'LEGAL_REVIEW',
                    'NOV_SENT',
                    'NOO_SENT',
                    'CLOSED_COMPLIANT',
                    'CLOSED_NON_COMPLIANT'
                ]
            )
        elif tab == 'non_compliant':
            # Show only NON_COMPLIANT inspections
            return queryset.filter(
                law_filter,
                Q(form__inspected_by=user) | 
                Q(form__inspected_by__userlevel='Section Chief', form__inspected_by__section=user.section) |
                Q(form__inspected_by__userlevel='Unit Head', form__inspected_by__section=user.section) |
                Q(form__inspected_by__userlevel='Monitoring Personnel', form__inspected_by__section=user.section),
                form__compliance_decision__in=['NON_COMPLIANT', 'PARTIALLY_COMPLIANT'],
                current_status__in=[
                    'SECTION_COMPLETED_COMPLIANT',
                    'SECTION_COMPLETED_NON_COMPLIANT',
                    'SECTION_REVIEWED',
                    'DIVISION_REVIEWED',
                    'LEGAL_REVIEW',
                    'NOV_SENT',
                    'NOO_SENT',
                    'CLOSED_COMPLIANT',
                    'CLOSED_NON_COMPLIANT'
                ]
            )
        else:
            # Default: show all inspections for this section
            return queryset.filter(law_filter)
    
    def _filter_unit_head(self, queryset, user, tab):
        """Filter for Unit Head based on tab"""
        # Setup law filter for combined EIA section
        law_filter = Q(law=user.section)
        if user.section == 'PD-1586,RA-8749,RA-9275':
            law_filter = Q(law=user.section) | Q(law='PD-1586') | Q(law='RA-8749') | Q(law='RA-9275')
        
        if tab == 'unit_assigned' or tab == 'received':
            # Show inspections assigned to this Unit Head but not yet started
            return queryset.filter(
                law_filter,
                current_status='UNIT_ASSIGNED'
            )
        elif tab == 'unit_in_progress' or tab == 'my_inspections':
            # Show inspections that this Unit Head is currently working on
            return queryset.filter(
                law_filter,
                assigned_to=user,
                current_status__in=[
                    'UNIT_IN_PROGRESS'
                ]
            )
        elif tab == 'forwarded':
            # Show inspections forwarded to Monitoring Personnel (status-based)
            return queryset.filter(
                law_filter,
                current_status__in=[
                    'MONITORING_ASSIGNED',
                    'MONITORING_IN_PROGRESS'
                ]
            )
        elif tab == 'inspection_complete':
            # Show inspections completed by Unit Heads or Monitoring Personnel
            return queryset.filter(
                law_filter,
                current_status__in=[
                    'UNIT_COMPLETED_COMPLIANT',
                    'UNIT_COMPLETED_NON_COMPLIANT',
                    'MONITORING_COMPLETED_COMPLIANT',
                    'MONITORING_COMPLETED_NON_COMPLIANT'
                ]
            )
        elif tab == 'under_review':
            # Show inspections in review stages after Unit Head evaluation
            return queryset.filter(
                law_filter,
                current_status__in=[
                    'UNIT_REVIEWED',
                    'SECTION_REVIEWED',
                    'DIVISION_REVIEWED'
                ]
            )
        elif tab == 'compliant':
            # Show only COMPLIANT inspections
            return queryset.filter(
                law_filter,
                Q(form__inspected_by=user) | 
                Q(form__inspected_by__userlevel='Unit Head', form__inspected_by__section=user.section) | 
                Q(form__inspected_by__userlevel='Monitoring Personnel', form__inspected_by__section=user.section),
                form__compliance_decision='COMPLIANT',
                current_status__in=[
                    'UNIT_COMPLETED_COMPLIANT',
                    'UNIT_COMPLETED_NON_COMPLIANT',
                    'UNIT_REVIEWED',
                    'SECTION_REVIEWED',
                    'DIVISION_REVIEWED',
                    'CLOSED_COMPLIANT',
                    'CLOSED_NON_COMPLIANT'
                ]
            )
        elif tab == 'non_compliant':
            # Show only NON_COMPLIANT inspections
            return queryset.filter(
                law_filter,
                Q(form__inspected_by=user) | 
                Q(form__inspected_by__userlevel='Unit Head', form__inspected_by__section=user.section) | 
                Q(form__inspected_by__userlevel='Monitoring Personnel', form__inspected_by__section=user.section),
                form__compliance_decision__in=['NON_COMPLIANT', 'PARTIALLY_COMPLIANT'],
                current_status__in=[
                    'UNIT_COMPLETED_COMPLIANT',
                    'UNIT_COMPLETED_NON_COMPLIANT',
                    'UNIT_REVIEWED',
                    'SECTION_REVIEWED',
                    'DIVISION_REVIEWED',
                    'CLOSED_COMPLIANT',
                    'CLOSED_NON_COMPLIANT'
                ]
            )
        else:
            # Default: show all inspections for this section
            return queryset.filter(law_filter)
    
    def _filter_monitoring_personnel(self, queryset, user, tab):
        """Filter for Monitoring Personnel based on tab"""
        if tab == 'assigned':
            # Show inspections assigned to this Monitoring Personnel but not yet started
            return queryset.filter(
                assigned_to=user,
                current_status='MONITORING_ASSIGNED'
            )
        elif tab == 'in_progress':
            # Show inspections that this Monitoring Personnel has started (in progress or with draft)
            return queryset.filter(
                assigned_to=user,
                current_status='MONITORING_IN_PROGRESS'
            )
        elif tab == 'inspection_complete' or tab == 'completed':
            # Show inspections that this Monitoring Personnel has completed
            return queryset.filter(
                Q(form__inspected_by=user) | Q(assigned_to=user, form__inspected_by__isnull=True),
                current_status__in=[
                    'MONITORING_COMPLETED_COMPLIANT',
                    'MONITORING_COMPLETED_NON_COMPLIANT',
                    'UNIT_REVIEWED',
                    'SECTION_REVIEWED', 
                    'DIVISION_REVIEWED'
                ]
            )
        elif tab == 'under_review':
            # Show inspections currently under review after Monitoring completion
            return queryset.filter(
                Q(form__inspected_by=user) | Q(assigned_to=user, form__inspected_by__isnull=True),
                current_status__in=[
                    'UNIT_REVIEWED',
                    'SECTION_REVIEWED', 
                    'DIVISION_REVIEWED'
                ]
            )
        elif tab == 'compliant':
            # Show only COMPLIANT inspections
            return queryset.filter(
                Q(form__inspected_by=user) | Q(assigned_to=user, form__inspected_by__isnull=True),
                form__compliance_decision='COMPLIANT',
                current_status__in=[
                    'MONITORING_COMPLETED_COMPLIANT',
                    'MONITORING_COMPLETED_NON_COMPLIANT',
                    'UNIT_REVIEWED',
                    'SECTION_REVIEWED', 
                    'DIVISION_REVIEWED',
                    'LEGAL_REVIEW',
                    'NOV_SENT',
                    'NOO_SENT',
                    'CLOSED_COMPLIANT',
                    'CLOSED_NON_COMPLIANT'
                ]
            )
        elif tab == 'non_compliant':
            # Show only NON_COMPLIANT inspections
            return queryset.filter(
                Q(form__inspected_by=user) | Q(assigned_to=user, form__inspected_by__isnull=True),
                form__compliance_decision__in=['NON_COMPLIANT', 'PARTIALLY_COMPLIANT'],
                current_status__in=[
                    'MONITORING_COMPLETED_COMPLIANT',
                    'MONITORING_COMPLETED_NON_COMPLIANT',
                    'UNIT_REVIEWED',
                    'SECTION_REVIEWED', 
                    'DIVISION_REVIEWED',
                    'LEGAL_REVIEW',
                    'NOV_SENT',
                    'NOO_SENT',
                    'CLOSED_COMPLIANT',
                    'CLOSED_NON_COMPLIANT'
                ]
            )
        else:
            # Default: show all assigned inspections
            return queryset.filter(
                assigned_to=user,
                current_status__in=['MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS', 'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT']
            )
    
    def _filter_division_chief(self, queryset, user, tab):
        """Filter for Division Chief based on tab"""
        if tab == 'all_inspections':
            # Show ALL inspections they created - covers entire workflow
            return queryset.filter(created_by=user)
        elif tab == 'draft':
            # Show inspections still in draft state created by the Division Chief
            return queryset.filter(
                created_by=user,
                current_status='CREATED'
            )
        elif tab == 'section_assigned':
            # Show inspections assigned to Section Chiefs
            return queryset.filter(current_status='SECTION_ASSIGNED')
        elif tab == 'section_in_progress':
            # Show inspections actively being worked on by Section Chiefs
            return queryset.filter(current_status='SECTION_IN_PROGRESS')
        elif tab == 'inspection_complete':
            # Show inspections marked complete at any operational level
            return queryset.filter(
                current_status__in=[
                    'SECTION_COMPLETED_COMPLIANT',
                    'SECTION_COMPLETED_NON_COMPLIANT',
                    'UNIT_COMPLETED_COMPLIANT',
                    'UNIT_COMPLETED_NON_COMPLIANT',
                    'MONITORING_COMPLETED_COMPLIANT',
                    'MONITORING_COMPLETED_NON_COMPLIANT'
                ]
            )
        elif tab == 'under_review':
            # Show inspections currently under review
            return queryset.filter(
                current_status__in=[
                    'UNIT_REVIEWED',
                    'SECTION_REVIEWED',
                    'DIVISION_REVIEWED'
                ]
            )
        elif tab == 'legal_action':
            # Show inspections that have progressed to legal action
            return queryset.filter(
                current_status__in=['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT']
            )
        elif tab == 'compliant':
            # Show only COMPLIANT inspections
            return queryset.filter(
                form__compliance_decision='COMPLIANT',
                current_status__in=[
                    'SECTION_COMPLETED_COMPLIANT',
                    'SECTION_COMPLETED_NON_COMPLIANT',
                    'SECTION_REVIEWED',
                    'DIVISION_REVIEWED',
                    'LEGAL_REVIEW',
                    'NOV_SENT',
                    'NOO_SENT',
                    'CLOSED_COMPLIANT',
                    'CLOSED_NON_COMPLIANT'
                ]
            )
        elif tab == 'non_compliant':
            # Show only NON_COMPLIANT inspections
            return queryset.filter(
                form__compliance_decision__in=['NON_COMPLIANT', 'PARTIALLY_COMPLIANT'],
                current_status__in=[
                    'SECTION_COMPLETED_COMPLIANT',
                    'SECTION_COMPLETED_NON_COMPLIANT',
                    'SECTION_REVIEWED',
                    'DIVISION_REVIEWED',
                    'LEGAL_REVIEW',
                    'NOV_SENT',
                    'NOO_SENT',
                    'CLOSED_COMPLIANT',
                    'CLOSED_NON_COMPLIANT'
                ]
            )
        else:
            # Default to all inspections created by them
            return queryset.filter(created_by=user)

    def _filter_legal_unit(self, queryset, user, tab):
        """Filter for Legal Unit based on tab"""
        if tab == 'legal_review':
            # Show only inspections in legal review status
            return queryset.filter(current_status='LEGAL_REVIEW')
        elif tab == 'nov_sent':
            # Show only inspections with NOV sent
            return queryset.filter(current_status='NOV_SENT')
        elif tab == 'noo_sent':
            # Show NOO sent and closed non-compliant (per tabStatusMapping)
            return queryset.filter(
                current_status__in=['NOO_SENT', 'CLOSED_NON_COMPLIANT']
            )
        elif tab == 'compliant':
            # Show only COMPLIANT inspections
            return queryset.filter(
                form__compliance_decision='COMPLIANT',
                current_status__in=[
                    'DIVISION_REVIEWED',
                    'LEGAL_REVIEW',
                    'NOV_SENT',
                    'NOO_SENT',
                    'CLOSED_COMPLIANT',
                    'CLOSED_NON_COMPLIANT'
                ]
            )
        elif tab == 'non_compliant':
            # Show only NON_COMPLIANT inspections
            return queryset.filter(
                form__compliance_decision__in=['NON_COMPLIANT', 'PARTIALLY_COMPLIANT'],
                current_status__in=[
                    'DIVISION_REVIEWED',
                    'LEGAL_REVIEW',
                    'NOV_SENT',
                    'NOO_SENT',
                    'CLOSED_COMPLIANT',
                    'CLOSED_NON_COMPLIANT'
                ]
            )
        else:
            # Default: show all legal unit inspections
            return queryset.filter(
                current_status__in=['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT', 'CLOSED_NON_COMPLIANT']
            )
    
    def _apply_search_filter(self, queryset, search_term):
        """
        Apply comprehensive search across multiple fields
        Searches: Code, Establishment names, Law, Status, Assigned To
        """
        # Build complex Q query for OR search
        search_query = Q()
        
        # Search in inspection code
        search_query |= Q(code__icontains=search_term)
        
        # Search in law field
        search_query |= Q(law__icontains=search_term)
        
        # Search in current status
        search_query |= Q(current_status__icontains=search_term)
        
        # Search in assigned user's name
        search_query |= Q(assigned_to__first_name__icontains=search_term)
        search_query |= Q(assigned_to__last_name__icontains=search_term)
        search_query |= Q(assigned_to__email__icontains=search_term)
        
        # Search in establishments (name, city, province, nature of business)
        search_query |= Q(establishments__name__icontains=search_term)
        search_query |= Q(establishments__city__icontains=search_term)
        search_query |= Q(establishments__province__icontains=search_term)
        search_query |= Q(establishments__nature_of_business__icontains=search_term)
        
        return queryset.filter(search_query).distinct()
    
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
    
    @action(detail=True, methods=['post'], url_path='findings/documents')
    def findings_documents(self, request, pk=None):
        """Upload finding documents with system association"""
        inspection = self.get_object()
        
        # Get or create inspection form
        form, created = InspectionForm.objects.get_or_create(inspection=inspection)
        
        # Handle file upload
        file = request.FILES.get('file')
        system_id = request.data.get('system_id', 'general')
        caption = request.data.get('caption', '')
        finding_type = request.data.get('finding_type', 'individual')
        
        if not file:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create document with finding-specific metadata
        document = InspectionDocument.objects.create(
            inspection_form=form,
            file=file,
            document_type='PHOTO',  # Default to PHOTO for finding documents
            description=caption,
            uploaded_by=request.user
        )
        
        # Store additional metadata in the description field
        # Format: "system_id:general|finding_type:general|caption:user_caption"
        metadata = f"system_id:{system_id}|finding_type:{finding_type}|caption:{caption}"
        document.description = metadata
        document.save()
        
        serializer = InspectionDocumentSerializer(document, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get', 'post', 'delete'], url_path='findings/documents')
    def findings_documents(self, request, pk=None):
        """Get, upload, or delete finding documents with system association"""
        inspection = self.get_object()
        
        if request.method == 'GET':
            # Get finding documents for an inspection
            form, created = InspectionForm.objects.get_or_create(inspection=inspection)
            
            # Get all documents for this inspection form
            documents = form.documents.all()
            
            # Filter by system_id if provided
            system_id = request.query_params.get('system_id')
            if system_id:
                documents = documents.filter(description__contains=f"system_id:{system_id}")
            
            serializer = InspectionDocumentSerializer(documents, many=True, context={'request': request})
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Upload finding documents with system association
            form, created = InspectionForm.objects.get_or_create(inspection=inspection)
            
            # Handle file upload
            file = request.FILES.get('file')
            system_id = request.data.get('system_id', 'general')
            caption = request.data.get('caption', '')
            finding_type = request.data.get('finding_type', 'individual')
            
            if not file:
                return Response(
                    {'error': 'No file provided'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create document with finding-specific metadata
            document = InspectionDocument.objects.create(
                inspection_form=form,
                file=file,
                document_type='PHOTO',  # Default to PHOTO for finding documents
                description=caption,
                uploaded_by=request.user
            )
            
            # Store additional metadata in the description field
            # Format: "system_id:general|finding_type:general|caption:user_caption"
            metadata = f"system_id:{system_id}|finding_type:{finding_type}|caption:{caption}"
            document.description = metadata
            document.save()
            
            serializer = InspectionDocumentSerializer(document, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        elif request.method == 'DELETE':
            # Delete finding document
            document_id = request.data.get('document_id')
            if not document_id:
                return Response(
                    {'error': 'Document ID is required for deletion'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                # Get or create inspection form
                form, created = InspectionForm.objects.get_or_create(inspection=inspection)
                
                # Find and delete the document
                document = form.documents.filter(id=document_id).first()
                if not document:
                    return Response(
                        {'error': 'Document not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Delete the document
                document.delete()
                
                return Response(
                    {'message': 'Document deleted successfully'},
                    status=status.HTTP_200_OK
                )
                
            except Exception as e:
                return Response(
                    {'error': f'Failed to delete document: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
    
    @action(detail=True, methods=['post'])
    def inspect(self, request, pk=None):
        """Move inspection to My Inspections (Section Chief/Unit Head/Monitoring Personnel)"""
        inspection = self.get_object()
        user = request.user
        
        valid_statuses = ['SECTION_ASSIGNED', 'UNIT_ASSIGNED', 'MONITORING_ASSIGNED']
        if inspection.current_status not in valid_statuses:
            return Response(
                {'error': f'Cannot inspect from status {inspection.current_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        status_map = {
            'SECTION_ASSIGNED': 'SECTION_IN_PROGRESS',
            'UNIT_ASSIGNED': 'UNIT_IN_PROGRESS',
            'MONITORING_ASSIGNED': 'MONITORING_IN_PROGRESS',
        }
        next_status = status_map.get(inspection.current_status)

        if not inspection.can_transition_to(next_status, user):
            return Response(
                {'error': f'You are not authorized to transition to {next_status}'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Assign to current user if needed
        reassigned = False
        if inspection.assigned_to != user:
            inspection.assigned_to = user
            reassigned = True

        prev_status = inspection.current_status
        inspection.current_status = next_status
        inspection.save()
        
        # Log history
        default_remarks = 'Moved to My Inspections'
        if reassigned:
            default_remarks = 'Self-assigned and moved to My Inspections'
        remarks = request.data.get('remarks', default_remarks)
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status=inspection.current_status,
            changed_by=user,
            assigned_to=inspection.assigned_to,
            law=inspection.law,
            section=user.section,
            remarks=remarks
        )
        
        audit_inspection_event(
            user,
            inspection,
            AUDIT_ACTIONS["UPDATE"],
            f"{user.email} moved inspection to {inspection.current_status}",
            request,
            metadata={
                "previous_status": prev_status,
                "new_status": inspection.current_status,
                "remarks": remarks,
            },
        )

        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start inspection (Section/Unit/Monitoring)"""
        inspection = self.get_object()
        user = request.user
        
        # If user is not assigned, assign them first
        if inspection.assigned_to != user:
            # Check if user can be assigned (not already assigned to someone else)
            if inspection.assigned_to and inspection.assigned_to != user:
                return Response(
                    {'error': f'Already assigned to {inspection.assigned_to}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            # Assign the user
            inspection.assigned_to = user
        
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
        remarks = request.data.get('remarks', 'Started inspection')
        if inspection.assigned_to == user and prev_status != inspection.current_status:
            remarks = f'Assigned to self and {remarks.lower()}'
        
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status=next_status,
            changed_by=user,
            remarks=remarks
        )
        
        audit_inspection_event(
            user,
            inspection,
            AUDIT_ACTIONS["UPDATE"],
            f"{user.email} started inspection (status {next_status})",
            request,
            metadata={
                "previous_status": prev_status,
                "new_status": next_status,
                "remarks": remarks,
            },
        )

        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=["post"])
    def return_to_previous(self, request, pk=None):
        """Return inspection to previous assignment stage."""
        inspection = self.get_object()
        user = request.user

        next_status = None
        next_assignee = None

        if inspection.current_status == "MONITORING_ASSIGNED":
            if user.userlevel not in ["Monitoring Personnel", "Unit Head"]:
                return Response(
                    {"error": "Only Monitoring Personnel or Unit Heads can return monitoring assignments"},
                    status=status.HTTP_403_FORBIDDEN,
                )

            previous_stage = (
                InspectionHistory.objects.filter(
                    inspection=inspection,
                    new_status__in=["UNIT_ASSIGNED", "SECTION_ASSIGNED"],
                )
                .order_by("-created_at")
                .first()
            )

            if previous_stage:
                next_status = previous_stage.new_status
                next_assignee = previous_stage.assigned_to

            if not next_status:
                target = request.data.get("target", "unit")
                next_status = "SECTION_ASSIGNED" if target == "section" else "UNIT_ASSIGNED"
        elif inspection.current_status == "UNIT_ASSIGNED":
            if user.userlevel != "Unit Head":
                return Response(
                    {"error": "Only Unit Heads can return unit assignments"},
                    status=status.HTTP_403_FORBIDDEN,
                )
            previous_stage = (
                InspectionHistory.objects.filter(
                    inspection=inspection,
                    new_status="SECTION_ASSIGNED",
                )
                .order_by("-created_at")
                .first()
            )
            if previous_stage:
                next_status = "SECTION_ASSIGNED"
                next_assignee = previous_stage.assigned_to
            else:
                next_status = "SECTION_ASSIGNED"
        else:
            return Response(
                {"error": f"Return not allowed from status {inspection.current_status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not inspection.can_transition_to(next_status, user):
            return Response(
                {"error": f"Invalid transition to {next_status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not next_assignee:
            next_assignee = inspection.get_next_assignee(next_status)

        if not next_assignee and next_status == "UNIT_ASSIGNED":
            # Fallback to Section Chief when no Unit Head is available
            next_status = "SECTION_ASSIGNED"
            next_assignee = inspection.get_next_assignee(next_status)

        if not next_assignee:
            return Response(
                {"error": f"No assignee found for status {next_status}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        prev_status = inspection.current_status
        inspection.current_status = next_status
        inspection.assigned_to = next_assignee
        inspection.save()

        remarks = request.data.get("remarks")
        if not remarks:
            status_messages = {
                "UNIT_ASSIGNED": "Returned to Unit Head",
                "SECTION_ASSIGNED": "Returned to Section Chief",
            }
            remarks = status_messages.get(next_status, "Returned to previous stage")

        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status=next_status,
            changed_by=user,
            assigned_to=inspection.assigned_to,
            law=inspection.law,
            section=user.section,
            remarks=remarks,
        )

        audit_inspection_event(
            user,
            inspection,
            AUDIT_ACTIONS["UPDATE"],
            f"{user.email} returned inspection to {inspection.assigned_to}",
            request,
            metadata={
                "previous_status": prev_status,
                "new_status": next_status,
                "remarks": remarks,
            },
        )

        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def continue_inspection(self, request, pk=None):
        """Continue inspection (Monitoring Personnel only)"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can act
        if inspection.assigned_to != user:
            return Response(
                {'error': 'You are not assigned to this inspection'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Only allow for MONITORING_IN_PROGRESS status
        if inspection.current_status != 'MONITORING_IN_PROGRESS':
            return Response(
                {'error': f'Cannot continue from status {inspection.current_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Log history
        remarks = request.data.get('remarks', 'Continued inspection')
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=inspection.current_status,
            new_status=inspection.current_status,
            changed_by=user,
            remarks=remarks
        )
        
        audit_inspection_event(
            user,
            inspection,
            AUDIT_ACTIONS["UPDATE"],
            f"{user.email} continued inspection",
            request,
            metadata={
                "remarks": remarks,
            },
        )

        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def save_draft(self, request, pk=None):
        """Save inspection form as draft"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can act
        if inspection.assigned_to != user:
            return Response(
                {'error': 'You are not assigned to this inspection'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create inspection form
        form, created = InspectionForm.objects.get_or_create(
            inspection=inspection
        )
        
        # Update form with draft data
        form_data = request.data.get('form_data', {})
        
        # Store all form data in the checklist JSON field
        form.checklist = {
            'general': form_data.get('general', {}),
            'purpose': form_data.get('purpose', {}),
            'permits': form_data.get('permits', []),
            'complianceItems': form_data.get('complianceItems', []),
            'systems': form_data.get('systems', []),
            'recommendationState': form_data.get('recommendationState', {}),
            'lawFilter': form_data.get('lawFilter', []),
            'findingImages': form_data.get('findingImages', {}),
            'generalFindings': form_data.get('generalFindings', []),
            'is_draft': True,
            'last_saved': timezone.now().isoformat(),
            'saved_by': user.id
        }
        
        # Update direct fields from general data
        general_data = form_data.get('general', {})
        if general_data.get('violations_found'):
            form.violations_found = general_data['violations_found']
        if general_data.get('compliance_observations'):
            form.compliance_decision = general_data['compliance_observations']
        
        # Update scheduled_at if provided
        if 'general' in form_data and form_data['general'].get('inspectionDateTime'):
            try:
                form.scheduled_at = form_data['general']['inspectionDateTime']
            except:
                pass
        
        
        # Capture inspector information if this is the first time
        is_first_fill = capture_inspector_info(form, user)
        
        form.save()
        
        # If inspection is in MONITORING_ASSIGNED status, change to MONITORING_IN_PROGRESS when draft is saved
        if inspection.current_status == 'MONITORING_ASSIGNED':
            prev_status = inspection.current_status
            inspection.current_status = 'MONITORING_IN_PROGRESS'
            inspection.save()
            
            # Log status change
            InspectionHistory.objects.create(
                inspection=inspection,
                previous_status=prev_status,
                new_status=inspection.current_status,
                changed_by=user,
                remarks='Status changed to In Progress when draft was saved'
            )
            audit_metadata = {
                "previous_status": prev_status,
                "new_status": inspection.current_status,
                "remarks": "Status changed to In Progress when draft was saved",
                "draft": True,
            }
        else:
            # Log draft save without status change
            InspectionHistory.objects.create(
                inspection=inspection,
                previous_status=inspection.current_status,
                new_status=inspection.current_status,
                changed_by=user,
                remarks='Saved inspection form as draft'
            )
            audit_metadata = {
                "previous_status": inspection.current_status,
                "new_status": inspection.current_status,
                "remarks": "Saved inspection form as draft",
                "draft": True,
            }

        audit_inspection_event(
            user,
            inspection,
            AUDIT_ACTIONS["UPDATE"],
            f"{user.email} saved inspection draft",
            request,
            metadata=audit_metadata,
        )
        
        serializer = self.get_serializer(inspection)
        return Response({
            'message': 'Draft saved successfully',
            'inspection': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def auto_save(self, request, pk=None):
        """Auto-save inspection form (optimized for frequent saves)"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can act
        if inspection.assigned_to != user:
            return Response(
                {'error': 'You are not assigned to this inspection'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create inspection form
        form, created = InspectionForm.objects.get_or_create(
            inspection=inspection
        )
        
        # Get form data
        form_data = request.data
        
        # Validate form data structure
        required_sections = ['general', 'purpose', 'permits', 'complianceItems', 'systems', 'recommendationState']
        for section in required_sections:
            if section not in form_data:
                return Response(
                    {'error': f'Missing required section: {section}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Store all form data in the checklist JSON field
        form.checklist = {
            'general': form_data.get('general', {}),
            'purpose': form_data.get('purpose', {}),
            'permits': form_data.get('permits', []),
            'complianceItems': form_data.get('complianceItems', []),
            'systems': form_data.get('systems', []),
            'recommendationState': form_data.get('recommendationState', {}),
            'lawFilter': form_data.get('lawFilter', []),
            'findingImages': form_data.get('findingImages', {}),
            'generalFindings': form_data.get('generalFindings', []),
            'is_draft': True,
            'last_saved': timezone.now().isoformat(),
            'saved_by': user.id,
            'auto_save': True  # Mark as auto-save
        }
        
        # Update direct fields from general data
        general_data = form_data.get('general', {})
        if general_data.get('violations_found'):
            form.violations_found = general_data['violations_found']
        if general_data.get('compliance_observations'):
            form.compliance_decision = general_data['compliance_observations']
        
        # Update scheduled_at if provided
        if 'general' in form_data and form_data['general'].get('inspection_date_time'):
            try:
                form.scheduled_at = form_data['general']['inspection_date_time']
            except:
                pass
        
        
        # Capture inspector information if this is the first time
        is_first_fill = capture_inspector_info(form, user)
        
        form.save()
        
        # Only log history for significant changes (not every auto-save)
        # This reduces database writes for frequent auto-saves
        last_history = InspectionHistory.objects.filter(
            inspection=inspection
        ).order_by('-created_at').first()
        
        # Only create history entry if it's been more than 5 minutes since last save
        should_log = True
        if last_history and last_history.remarks == 'Auto-saved inspection form':
            time_diff = timezone.now() - last_history.created_at
            if time_diff.total_seconds() < 300:  # 5 minutes
                should_log = False
        
        if should_log:
            InspectionHistory.objects.create(
                inspection=inspection,
                previous_status=inspection.current_status,
                new_status=inspection.current_status,
                changed_by=user,
                remarks='Auto-saved inspection form'
            )
            audit_inspection_event(
                user,
                inspection,
                AUDIT_ACTIONS["UPDATE"],
                f"{user.email} auto-saved inspection form",
                request,
                metadata={
                    "auto_save": True,
                    "remarks": "Auto-saved inspection form",
                },
            )
        
        return Response({
            'message': 'Auto-save successful',
            'last_saved': form.checklist.get('last_saved'),
            'is_draft': True
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def check_form_data(self, request, pk=None):
        """Check if inspection form has any data"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can access this inspection
        if inspection.assigned_to != user and inspection.created_by != user:
            return Response(
                {'error': 'You are not authorized to access this inspection'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            form = InspectionForm.objects.get(inspection=inspection)
            checklist = form.checklist or {}
            
            # Check if any form section has meaningful data
            has_data = False
            
            # Check general information
            general = checklist.get('general', {})
            if general:
                # Check for any non-empty fields
                for key, value in general.items():
                    if value and str(value).strip():
                        has_data = True
                        break
            
            # Check purpose
            purpose = checklist.get('purpose', {})
            if purpose:
                for key, value in purpose.items():
                    if value and str(value).strip():
                        has_data = True
                        break
            
            # Check permits
            permits = checklist.get('permits', [])
            if permits:
                for permit in permits:
                    for key, value in permit.items():
                        if value and str(value).strip():
                            has_data = True
                            break
                    if has_data:
                        break
            
            # Check compliance items
            compliance_items = checklist.get('complianceItems', [])
            if compliance_items:
                for item in compliance_items:
                    for key, value in item.items():
                        if value and str(value).strip():
                            has_data = True
                            break
                    if has_data:
                        break
            
            # Check systems
            systems = checklist.get('systems', [])
            if systems:
                for system in systems:
                    for key, value in system.items():
                        if value and str(value).strip():
                            has_data = True
                            break
                    if has_data:
                        break
            
            # Check recommendations
            recommendations = checklist.get('recommendationState', {})
            if recommendations:
                for key, value in recommendations.items():
                    if value and str(value).strip():
                        has_data = True
                        break
            
            return Response({
                'has_form_data': has_data,
                'is_draft': checklist.get('is_draft', False),
                'last_saved': checklist.get('last_saved'),
                'form_exists': True
            })
            
        except InspectionForm.DoesNotExist:
            return Response({
                'has_form_data': False,
                'is_draft': False,
                'last_saved': None,
                'form_exists': False
            })
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete inspection"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can act based on role and status
        can_act = False
        
        # Check if user is assigned to this inspection
        if inspection.assigned_to == user:
            can_act = True
        else:
            # Check if user can act based on role and status
            user_level = user.userlevel
            current_status = inspection.current_status
            
            # Monitoring Personnel can complete MONITORING_IN_PROGRESS inspections
            if user_level == 'Monitoring Personnel' and current_status == 'MONITORING_IN_PROGRESS':
                can_act = True
            # Unit Head can complete UNIT_IN_PROGRESS inspections
            elif user_level == 'Unit Head' and current_status == 'UNIT_IN_PROGRESS':
                can_act = True
            # Section Chief can complete SECTION_IN_PROGRESS inspections
            elif user_level == 'Section Chief' and current_status == 'SECTION_IN_PROGRESS':
                can_act = True
        
        if not can_act:
            return Response(
                {'error': f'You are not authorized to complete this inspection. User: {user.userlevel}, Status: {inspection.current_status}, Assigned to: {inspection.assigned_to}'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Handle form data for all roles
        form_data = request.data.get('form_data', {})
        if form_data:
            # Save form data as part of completion for all roles
            form, created = InspectionForm.objects.get_or_create(inspection=inspection)
            
            # Store all form data in the checklist JSON field
            form.checklist = {
                'general': form_data.get('general', {}),
                'purpose': form_data.get('purpose', {}),
                'permits': form_data.get('permits', []),
                'complianceItems': form_data.get('complianceItems', []),
                'systems': form_data.get('systems', []),
                'recommendationState': form_data.get('recommendationState', {}),
                'lawFilter': form_data.get('lawFilter', []),
                'findingImages': form_data.get('findingImages', {}),
                'generalFindings': form_data.get('generalFindings', []),
                'is_draft': False,
                'completed_at': timezone.now().isoformat(),
                'completed_by': user.id
            }
            
            # Update direct fields from general data
            general_data = form_data.get('general', {})
            if general_data.get('findings_summary'):
                form.findings_summary = general_data['findings_summary']
            if general_data.get('violations_found'):
                form.violations_found = general_data['violations_found']
            if general_data.get('compliance_observations'):
                form.compliance_decision = general_data['compliance_observations']
            if general_data.get('recommendations'):
                form.compliance_plan = general_data['recommendations']
            
            # Update scheduled_at if provided
            if 'general' in form_data and form_data['general'].get('inspection_date_time'):
                try:
                    from datetime import datetime
                    form.scheduled_at = datetime.fromisoformat(form_data['general']['inspection_date_time'].replace('Z', '+00:00'))
                except:
                    pass
            
            
            # Capture inspector information if this is the first time
            is_first_fill = capture_inspector_info(form, user)
            
            form.save()

        # Validate other data using serializer
        serializer = InspectionActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Handle violations_found from main payload (convert list to string if needed)
        violations_found = data.get('violations_found', [])
        if isinstance(violations_found, list):
            violations_found_str = ', '.join(violations_found) if violations_found else ''
        else:
            violations_found_str = str(violations_found) if violations_found else ''
        
        # Determine compliance decision from request data
        compliance_decision = data.get('compliance_decision', 'COMPLIANT')
        
        # Always update form with compliance_decision - this is critical for all completion scenarios
        form, created = InspectionForm.objects.get_or_create(inspection=inspection)
        form.compliance_decision = compliance_decision
        
        # Update violations_found if form_data exists
        if form_data:
            if not form.violations_found:
                form.violations_found = violations_found_str if violations_found_str else 'None'
        
        form.save()
        
        if inspection.current_status == 'SECTION_IN_PROGRESS':
            # Section Chief completes inspection
            next_status = 'SECTION_COMPLETED_COMPLIANT' if compliance_decision == 'COMPLIANT' else 'SECTION_COMPLETED_NON_COMPLIANT'
        elif inspection.current_status == 'UNIT_IN_PROGRESS':
            # Unit Head completes inspection
            next_status = 'UNIT_COMPLETED_COMPLIANT' if compliance_decision == 'COMPLIANT' else 'UNIT_COMPLETED_NON_COMPLIANT'
        elif inspection.current_status == 'MONITORING_IN_PROGRESS':
            # Monitoring Personnel completes inspection
            next_status = 'MONITORING_COMPLETED_COMPLIANT' if compliance_decision == 'COMPLIANT' else 'MONITORING_COMPLETED_NON_COMPLIANT'
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
            assigned_to=inspection.assigned_to,
            law=inspection.law,
            section=user.section,
            remarks=data.get('remarks', 'Completed inspection')
        )
        
        # Send notifications based on completion status
        try:
            # Determine if this is a non-compliant path
            is_non_compliant = 'NON_COMPLIANT' in next_status
            
            # Get next assignee based on completion status
            next_assignee = None
            if next_status in ['MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT']:
                next_assignee = inspection.get_next_assignee('UNIT_REVIEWED')
            elif next_status in ['UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT']:
                next_assignee = inspection.get_next_assignee('SECTION_REVIEWED')
            elif next_status in ['SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT']:
                next_assignee = inspection.get_next_assignee('DIVISION_REVIEWED')
            
            if next_assignee:
                # For non-compliant: send email + system notification
                if is_non_compliant:
                    from .utils import send_inspection_completion_notification
                    send_inspection_completion_notification(inspection, user, next_assignee, next_status)
                
                # For all: create system notification
                from .utils import create_completion_notification
                create_completion_notification(next_assignee, inspection, user, next_status, data.get('remarks'))
                
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send completion notifications for {inspection.code}: {str(e)}")
            # Don't fail the completion if notifications fail
        
        # Auto-assign completed inspections to appropriate reviewers
        if next_status in ['SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT']:
            self._auto_assign_to_division_chief(inspection, user)
        elif next_status in ['UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT']:
            self._auto_assign_to_section_chief(inspection, user)
        elif next_status in ['MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT']:
            self._auto_assign_to_unit_head(inspection, user)
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    def _auto_forward_to_unit_review(self, inspection, user):
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
    
    def _auto_forward_to_division_review(self, inspection, user):
        """Auto-forward section completed to Division Chief review"""
        prev_status = inspection.current_status
        inspection.current_status = 'DIVISION_REVIEWED'
        
        # Find Division Chief (creator of the inspection)
        if inspection.created_by:
            inspection.assigned_to = inspection.created_by
        else:
            # Fallback: find any Division Chief
            from users.models import User
            division_chief = User.objects.filter(userlevel='Division Chief').first()
            if division_chief:
                inspection.assigned_to = division_chief
        
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status='DIVISION_REVIEWED',
            changed_by=user,
            remarks='Auto-forwarded to Division Chief for review'
        )
    
    def _auto_forward_to_section_review(self, inspection, user):
        """Auto-forward unit completed to Section Chief review"""
        prev_status = inspection.current_status
        inspection.current_status = 'SECTION_REVIEWED'
        
        # Find Section Chief (original assignee or based on law)
        from users.models import User
        # Special case: PD-1586, RA-8749, RA-9275 should use combined section
        target_section = inspection.law
        if inspection.law in ['PD-1586', 'RA-8749', 'RA-9275']:
            target_section = 'PD-1586,RA-8749,RA-9275'  # EIA, Air & Water Combined
        
        section_chief = User.objects.filter(
            userlevel='Section Chief',
            section=target_section
        ).first()
        
        if section_chief:
            inspection.assigned_to = section_chief
        else:
            # Fallback: find any Section Chief
            section_chief = User.objects.filter(userlevel='Section Chief').first()
            if section_chief:
                inspection.assigned_to = section_chief
        
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status='SECTION_REVIEWED',
            changed_by=user,
            remarks='Auto-forwarded to Section Chief for review'
        )
    
    def _auto_assign_to_section_chief(self, inspection, user):
        """Auto-assign to Section Chief for review (status unchanged)"""
        # Find Section Chief based on law
        target_section = inspection.law
        if inspection.law in ['PD-1586', 'RA-8749', 'RA-9275']:
            target_section = 'PD-1586,RA-8749,RA-9275'
        
        section_chief = User.objects.filter(
            userlevel='Section Chief',
            section=target_section,
            is_active=True
        ).first()
        
        if section_chief:
            inspection.assigned_to = section_chief
            inspection.save()
            
            InspectionHistory.objects.create(
                inspection=inspection,
                previous_status=inspection.current_status,
                new_status=inspection.current_status,
                changed_by=user,
                assigned_to=inspection.assigned_to,
                law=inspection.law,
                section=user.section,
                remarks=f'Assigned to Section Chief for review'
            )
    
    def _auto_assign_to_division_chief(self, inspection, user):
        """Auto-assign to Division Chief for review (status unchanged)"""
        # Find Division Chief (creator of the inspection)
        if inspection.created_by:
            inspection.assigned_to = inspection.created_by
        else:
            # Fallback: find any Division Chief
            division_chief = User.objects.filter(userlevel='Division Chief', is_active=True).first()
            if division_chief:
                inspection.assigned_to = division_chief
        
        if inspection.assigned_to:
            inspection.save()
            
            InspectionHistory.objects.create(
                inspection=inspection,
                previous_status=inspection.current_status,
                new_status=inspection.current_status,
                changed_by=user,
                remarks=f'Assigned to Division Chief for review'
            )
    
    def _auto_assign_to_unit_head(self, inspection, user):
        """Auto-assign to Unit Head (combined section) or Section Chief (individual section) for review"""
        # Check if this is a combined section inspection
        is_combined_section = inspection.law in ['PD-1586', 'RA-8749', 'RA-9275']
        
        if is_combined_section:
            # Combined section: Assign to Unit Head
            unit_head = User.objects.filter(
                userlevel='Unit Head',
                section=inspection.law,
                is_active=True
            ).first()
            
            if unit_head:
                inspection.assigned_to = unit_head
                inspection.save()
                
                InspectionHistory.objects.create(
                    inspection=inspection,
                    previous_status=inspection.current_status,
                    new_status=inspection.current_status,
                    changed_by=user,
                    remarks=f'Assigned to Unit Head for review'
                )
        else:
            # Individual section: NO Unit Head, assign to Section Chief
            section_chief = User.objects.filter(
                userlevel='Section Chief',
                section=inspection.law,
                is_active=True
            ).first()
            
            if section_chief:
                inspection.assigned_to = section_chief
                inspection.save()
                
                InspectionHistory.objects.create(
                    inspection=inspection,
                    previous_status=inspection.current_status,
                    new_status=inspection.current_status,
                    changed_by=user,
                    remarks=f'Assigned to Section Chief for review (no Unit Head in workflow)'
                )
    
    @action(detail=True, methods=['get'])
    def available_monitoring_personnel(self, request, pk=None):
        """Get available monitoring personnel for an inspection"""
        inspection = self.get_object()
        
        # Get all monitoring personnel for the inspection's law
        ordering = ['first_name', 'last_name']
        if USER_HAS_DISTRICT:
            ordering = ['district'] + ordering
        
        monitoring_personnel = User.objects.filter(
            userlevel='Monitoring Personnel',
            section=inspection.law,
            is_active=True
        ).order_by(*ordering)
        
        # Separate district-based and other personnel
        district_personnel = []
        other_personnel = []
        
        for person in monitoring_personnel:
            district_value = getattr(person, 'district', None) if USER_HAS_DISTRICT else None
            person_data = {
                'id': person.id,
                'first_name': person.first_name,
                'last_name': person.last_name,
                'email': person.email,
                'district': district_value,
                'is_district_match': USER_HAS_DISTRICT and inspection.district and district_value == inspection.district
            }
            
            if USER_HAS_DISTRICT and inspection.district and district_value == inspection.district:
                district_personnel.append(person_data)
            else:
                other_personnel.append(person_data)
        
        return Response({
            'district_personnel': district_personnel,
            'other_personnel': other_personnel,
            'inspection_district': inspection.district,
            'inspection_law': inspection.law
        })

    @action(detail=True, methods=['post'])
    def forward(self, request, pk=None):
        """Forward inspection to next level"""
        inspection = self.get_object()
        user = request.user
        
        # Determine next status
        status_map = {
            'SECTION_COMPLETED': 'UNIT_ASSIGNED',
            'UNIT_COMPLETED': 'MONITORING_ASSIGNED',
        }
        
        # Section Chief can forward directly to Unit or Monitoring
        if inspection.current_status == 'SECTION_ASSIGNED':
            # Check if unit head exists for this law
            # Special logic based on user's section:
            # - If user is in combined section: look for Unit Head by specific law
            # - If user is in individual section: go directly to Monitoring Personnel
            if user.section == 'PD-1586,RA-8749,RA-9275':
                # Combined section: look for Unit Head by specific law first, then by combined section
                unit_head = User.objects.filter(
                    userlevel='Unit Head',
                    section=inspection.law,  # Try specific law first
                    is_active=True
                ).first()
                
                # If no Unit Head found for specific law, try combined section
                if not unit_head:
                    unit_head = User.objects.filter(
                        userlevel='Unit Head',
                        section='PD-1586,RA-8749,RA-9275',  # Try combined section
                        is_active=True
                    ).first()
                
                if unit_head:
                    next_status = 'UNIT_ASSIGNED'
                else:
                    # No Unit Head found - return error with more helpful message
                    return Response(
                        {'error': f'No Unit Head assigned for {inspection.law} or combined section. Please assign a Unit Head before forwarding.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # Individual section: go directly to Monitoring Personnel
                next_status = 'MONITORING_ASSIGNED'
        # Unit Head can forward directly to Monitoring Personnel
        elif inspection.current_status == 'UNIT_ASSIGNED':
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
        if next_status == 'UNIT_ASSIGNED' and user.section == 'PD-1586,RA-8749,RA-9275':
            # Special case: For combined section forwarding to Unit Head, try specific law first, then combined section
            next_assignee = User.objects.filter(
                userlevel='Unit Head',
                section=inspection.law,  # Try specific law first
                is_active=True
            ).first()
            
            # If no Unit Head found for specific law, try combined section
            if not next_assignee:
                next_assignee = User.objects.filter(
                    userlevel='Unit Head',
                    section='PD-1586,RA-8749,RA-9275',  # Try combined section
                    is_active=True
                ).first()
        elif next_status == 'MONITORING_ASSIGNED':
            # Special case: For Monitoring Personnel, use specific law and prefer same district
            monitoring_query = User.objects.filter(
                userlevel='Monitoring Personnel',
                section=inspection.law,  # Use the specific law
                is_active=True
            )
            
            # Check if specific monitoring personnel is provided in request
            assigned_monitoring_id = request.data.get('assigned_monitoring_id')
            if assigned_monitoring_id:
                try:
                    next_assignee = monitoring_query.get(id=assigned_monitoring_id)
                except User.DoesNotExist:
                    return Response(
                        {'error': f'Invalid monitoring personnel ID: {assigned_monitoring_id}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                # Auto-assignment: Prefer same district if available
                if USER_HAS_DISTRICT and inspection.district:
                    next_assignee = monitoring_query.filter(district=inspection.district).first()
                    if not next_assignee:
                        # No district match - return available options instead of error
                        value_fields = ['id', 'first_name', 'last_name', 'email']
                        if USER_HAS_DISTRICT:
                            value_fields.append('district')
                        available_personnel = monitoring_query.values(*value_fields)
                        return Response(
                            {
                                'error': f'No Monitoring Personnel found for {inspection.law} in district {inspection.district}.',
                                'available_personnel': list(available_personnel),
                                'requires_selection': True
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    next_assignee = monitoring_query.first()
                    if not next_assignee:
                        # No Monitoring Personnel found - return error
                        error_message = f'No Monitoring Personnel found for {inspection.law}. Please assign Monitoring Personnel before forwarding.'
                        return Response(
                            {'error': error_message},
                            status=status.HTTP_400_BAD_REQUEST
                        )
        else:
            # Use normal assignment logic
            next_assignee = inspection.get_next_assignee(next_status)
        
        if not next_assignee:
            # This should not happen for MONITORING_ASSIGNED as we handle it above
            # Only for other statuses
            error_msg = f'No personnel found for {next_status}'
            
            return Response(
                {'error': error_msg},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Transition
        prev_status = inspection.current_status
        inspection.current_status = next_status
        inspection.assigned_to = next_assignee
        inspection.save()
        
        # Get remarks before logging history (needed for both notifications and history)
        full_name_parts = [next_assignee.first_name, next_assignee.middle_name, next_assignee.last_name]
        full_name = ' '.join([part for part in full_name_parts if part]).strip()
        display_name = full_name if full_name else next_assignee.email
        default_remarks = f'Forwarded to {display_name} ({next_assignee.userlevel})'
        remarks = request.data.get('remarks', default_remarks)
        
        # Send notifications to the assigned user
        try:
            import logging
            logger = logging.getLogger(__name__)
            
            # Send email notification
            send_inspection_forward_notification(
                user=next_assignee,
                inspection=inspection,
                forwarded_by=user,
                remarks=remarks
            )
            
            # Create in-app notification
            create_forward_notification(
                recipient=next_assignee,
                inspection=inspection,
                forwarded_by=user,
                remarks=remarks
            )
            
            logger.info(f"Forward notifications sent to {next_assignee.email} for inspection {inspection.code}")
        except Exception as e:
            # Log the error but don't fail the forward operation
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send forward notifications for inspection {inspection.code}: {str(e)}")
        
        # Log history
        
        # Ensure remarks contains "Forwarded" for proper tab filtering
        if 'Forwarded' not in remarks:
            remarks = f'Forwarded: {remarks}'
        
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status=next_status,
            changed_by=user,
            assigned_to=inspection.assigned_to,
            law=inspection.law,
            section=user.section,
            remarks=remarks
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        """Review inspection - grants access to view form without changing status"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can review this inspection
        user_can_review = False
        
        if inspection.assigned_to == user:
            # User is assigned - can always review
            user_can_review = True
        else:
            # User is not assigned - check special cases
            if user.userlevel == 'Unit Head' and inspection.current_status in ['UNIT_REVIEWED']:
                # Unit Head can review UNIT_REVIEWED inspections even if not assigned
                user_can_review = True
            elif user.userlevel == 'Section Chief' and inspection.current_status in ['SECTION_REVIEWED']:
                # Section Chief can review SECTION_REVIEWED inspections even if not assigned
                user_can_review = True
            elif user.userlevel == 'Division Chief' and inspection.current_status in ['DIVISION_REVIEWED']:
                # Division Chief can review DIVISION_REVIEWED inspections even if not assigned
                user_can_review = True
            elif user.userlevel == 'Legal Unit' and inspection.current_status == 'LEGAL_REVIEW':
                # Legal Unit can review inspections in LEGAL_REVIEW status even if not assigned
                user_can_review = True
            else:
                user_can_review = False
        
        if not user_can_review:
            return Response(
                {'error': 'You are not authorized to review this inspection'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Review action only grants access - no status change
        return Response({
            'message': 'Review access granted - no status change',
            'status': inspection.current_status,
            'id': inspection.id
        })
    
    @action(detail=True, methods=['post'])
    def review_and_forward_unit(self, request, pk=None):
        """Unit Head reviews and forwards to Section Chief"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user is Unit Head
        if user.userlevel != 'Unit Head':
            return Response(
                {'error': 'Only Unit Heads can perform this action'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check valid statuses
        if inspection.current_status not in ['MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT']:
            return Response(
                {'error': f'Cannot review from status {inspection.current_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Handle form data if provided
        form_data = request.data.get('form_data', {})
        if form_data:
            form, created = InspectionForm.objects.get_or_create(inspection=inspection)
            
            # Store all form data in the checklist JSON field
            form.checklist = {
                'general': form_data.get('general', {}),
                'purpose': form_data.get('purpose', {}),
                'permits': form_data.get('permits', []),
                'complianceItems': form_data.get('complianceItems', []),
                'systems': form_data.get('systems', []),
                'recommendationState': form_data.get('recommendationState', {}),
                'lawFilter': form_data.get('lawFilter', []),
                'findingImages': form_data.get('findingImages', {}),
                'generalFindings': form_data.get('generalFindings', []),
                'is_draft': False,
                'completed_at': timezone.now().isoformat(),
                'completed_by': user.id
            }
            
            # Update direct fields from general data
            general_data = form_data.get('general', {})
            if general_data.get('findings_summary'):
                form.findings_summary = general_data['findings_summary']
            if general_data.get('violations_found'):
                form.violations_found = general_data['violations_found']
            if general_data.get('compliance_observations'):
                form.compliance_decision = general_data['compliance_observations']
            if general_data.get('recommendations'):
                form.compliance_plan = general_data['recommendations']
            
            # Update scheduled_at if provided
            if 'general' in form_data and form_data['general'].get('inspection_date_time'):
                try:
                    from datetime import datetime
                    form.scheduled_at = datetime.fromisoformat(form_data['general']['inspection_date_time'].replace('Z', '+00:00'))
                except:
                    pass
            
            # Capture inspector information if this is the first time
            is_first_fill = capture_inspector_info(form, user)
            
            form.save()
        
        # Get Section Chief assignee
        next_assignee = inspection.get_next_assignee('SECTION_REVIEWED')
        if not next_assignee:
            return Response(
                {'error': 'No Section Chief found for assignment'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Transition to UNIT_REVIEWED
        prev_status = inspection.current_status
        inspection.current_status = 'UNIT_REVIEWED'
        inspection.assigned_to = next_assignee
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status='UNIT_REVIEWED',
            changed_by=user,
            remarks=request.data.get('remarks', 'Unit Head reviewed and forwarded to Section Chief')
        )
        
        # Send notifications to Section Chief
        try:
            # Check if inspection is on non-compliant path
            is_non_compliant = 'NON_COMPLIANT' in prev_status
            
            # For non-compliant: send email + system notification
            if is_non_compliant:
                from .utils import send_inspection_review_notification
                send_inspection_review_notification(inspection, user, next_assignee, 'UNIT_REVIEWED', False)
            
            # For all: create system notification
            from .utils import create_review_notification
            create_review_notification(next_assignee, inspection, user, 'UNIT_REVIEWED', 
                                     request.data.get('remarks', 'Unit Head reviewed'))
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send review notifications for {inspection.code}: {str(e)}")
            # Don't fail the review if notifications fail
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def review_and_forward_section(self, request, pk=None):
        """Section Chief reviews and forwards to Division Chief"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user is Section Chief
        if user.userlevel != 'Section Chief':
            return Response(
                {'error': 'Only Section Chiefs can perform this action'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check valid statuses based on section type
        valid_statuses = ['UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT', 'UNIT_REVIEWED']
        
        # For individual sections (non-combined), also accept MONITORING_COMPLETED
        if user.section != 'PD-1586,RA-8749,RA-9275':
            valid_statuses.extend(['MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT'])
        
        if inspection.current_status not in valid_statuses:
            return Response(
                {'error': f'Cannot review from status {inspection.current_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Handle form data if provided
        form_data = request.data.get('form_data', {})
        if form_data:
            form, created = InspectionForm.objects.get_or_create(inspection=inspection)
            
            # Store all form data in the checklist JSON field
            form.checklist = {
                'general': form_data.get('general', {}),
                'purpose': form_data.get('purpose', {}),
                'permits': form_data.get('permits', []),
                'complianceItems': form_data.get('complianceItems', []),
                'systems': form_data.get('systems', []),
                'recommendationState': form_data.get('recommendationState', {}),
                'lawFilter': form_data.get('lawFilter', []),
                'findingImages': form_data.get('findingImages', {}),
                'generalFindings': form_data.get('generalFindings', []),
                'is_draft': False,
                'completed_at': timezone.now().isoformat(),
                'completed_by': user.id
            }
            
            # Update direct fields from general data
            general_data = form_data.get('general', {})
            if general_data.get('findings_summary'):
                form.findings_summary = general_data['findings_summary']
            if general_data.get('violations_found'):
                form.violations_found = general_data['violations_found']
            if general_data.get('compliance_observations'):
                form.compliance_decision = general_data['compliance_observations']
            if general_data.get('recommendations'):
                form.compliance_plan = general_data['recommendations']
            
            # Update scheduled_at if provided
            if 'general' in form_data and form_data['general'].get('inspection_date_time'):
                try:
                    from datetime import datetime
                    form.scheduled_at = datetime.fromisoformat(form_data['general']['inspection_date_time'].replace('Z', '+00:00'))
                except:
                    pass
            
            # Capture inspector information if this is the first time
            is_first_fill = capture_inspector_info(form, user)
            
            form.save()
        
        # Get Division Chief assignee
        next_assignee = inspection.get_next_assignee('DIVISION_REVIEWED')
        if not next_assignee:
            return Response(
                {'error': 'No Division Chief found for assignment'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Transition to SECTION_REVIEWED
        prev_status = inspection.current_status
        inspection.current_status = 'SECTION_REVIEWED'
        inspection.assigned_to = next_assignee
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status='SECTION_REVIEWED',
            changed_by=user,
            remarks=request.data.get('remarks', 'Section Chief reviewed and forwarded to Division Chief')
        )
        
        # Send notifications to Division Chief
        try:
            # Check if inspection is on non-compliant path
            is_non_compliant = 'NON_COMPLIANT' in prev_status
            
            # For non-compliant: send email + system notification
            if is_non_compliant:
                from .utils import send_inspection_review_notification
                send_inspection_review_notification(inspection, user, next_assignee, 'SECTION_REVIEWED', False)
            
            # For all: create system notification
            from .utils import create_review_notification
            create_review_notification(next_assignee, inspection, user, 'SECTION_REVIEWED', 
                                     request.data.get('remarks', 'Section Chief reviewed'))
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send review notifications for {inspection.code}: {str(e)}")
            # Don't fail the review if notifications fail
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
        
    
    @action(detail=True, methods=['post'])
    def review_division(self, request, pk=None):
        """Division Chief reviews and marks as DIVISION_REVIEWED"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user is Division Chief
        if user.userlevel != 'Division Chief':
            return Response(
                {'error': 'Only Division Chiefs can perform this action'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check valid status - allow SECTION_REVIEWED and SECTION_COMPLETED_* statuses
        valid_statuses = ['SECTION_REVIEWED', 'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT']
        if inspection.current_status not in valid_statuses:
            return Response(
                {'error': f'Cannot review from status {inspection.current_status}. Expected one of: {", ".join(valid_statuses)}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate other data using serializer
        serializer = InspectionActionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Transition to DIVISION_REVIEWED
        prev_status = inspection.current_status
        inspection.current_status = 'DIVISION_REVIEWED'
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status='DIVISION_REVIEWED',
            changed_by=user,
            remarks=data.get('remarks', 'Division Chief reviewed and marked as DIVISION_REVIEWED')
        )
        
        # Return updated inspection
        response_serializer = InspectionSerializer(inspection, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def forward_to_legal(self, request, pk=None):
        """Forward case to Legal Unit (Division Chief only)"""
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
        
        # Removed compliance validation - Division Chief can decide to forward any case to Legal Unit
        
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
            remarks=request.data.get('remarks', 'Forwarded case to Legal Unit')
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
        
        # Get or create form
        form, created = InspectionForm.objects.get_or_create(inspection=inspection)
        
        # Create or update NOV record
        nov, nov_created = NoticeOfViolation.objects.get_or_create(
            inspection_form=form,
            defaults={
                'sent_date': timezone.now().date(),
                'violations': data['violations'],
                'compliance_instructions': data['compliance_instructions'],
                'compliance_deadline': data['compliance_deadline'],
                'remarks': data.get('remarks', ''),
                'sent_by': user
            }
        )
        
        # If NOV already exists, update it
        if not nov_created:
            nov.sent_date = timezone.now().date()
            nov.violations = data['violations']
            nov.compliance_instructions = data['compliance_instructions']
            nov.compliance_deadline = data['compliance_deadline']
            nov.remarks = data.get('remarks', '')
            nov.sent_by = user
            nov.save()
        
        # Update violations_found for initial inspection tracking
        form.violations_found = data['violations']
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
        
        # Get or create form
        form, created = InspectionForm.objects.get_or_create(inspection=inspection)
        
        # Create or update NOO record
        noo, noo_created = NoticeOfOrder.objects.get_or_create(
            inspection_form=form,
            defaults={
                'sent_date': timezone.now().date(),
                'violation_breakdown': data['violation_breakdown'],
                'penalty_fees': data['penalty_fees'],
                'payment_deadline': data['payment_deadline'],
                'payment_instructions': data.get('payment_instructions', ''),
                'remarks': data.get('remarks', ''),
                'sent_by': user
            }
        )
        
        # If NOO already exists, update it
        if not noo_created:
            noo.sent_date = timezone.now().date()
            noo.violation_breakdown = data['violation_breakdown']
            noo.penalty_fees = data['penalty_fees']
            noo.payment_deadline = data['payment_deadline']
            noo.payment_instructions = data.get('payment_instructions', '')
            noo.remarks = data.get('remarks', '')
            noo.sent_by = user
            noo.save()
        
        # Create billing record
        establishment = inspection.establishments.first()
        if not establishment:
            return Response(
                {'error': 'No establishment associated with this inspection'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        billing = BillingRecord.objects.create(
            inspection=inspection,
            establishment=establishment,
            establishment_name=establishment.name,
            contact_person=getattr(establishment, 'contact_person', ''),
            related_law=inspection.law,
            billing_type='PENALTY',
            description=data['violation_breakdown'],
            amount=data['penalty_fees'],
            due_date=data['payment_deadline'],
            recommendations=data.get('remarks', ''),
            issued_by=user
        )
        
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
            remarks=f"Notice of Order sent. Penalties: ₱{data['penalty_fees']}"
        )
        
        serializer = self.get_serializer(inspection)
        return Response({
            'inspection': serializer.data,
            'billing': {
                'id': billing.id,
                'billing_code': billing.billing_code,
                'amount': str(billing.amount)
            }
        })
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close inspection (Section/Division/Legal)"""
        inspection = self.get_object()
        user = request.user
        
        if user.userlevel == 'Section Chief' and inspection.current_status == 'SECTION_REVIEWED':
            # Section Chief closing - send to Division
            next_assignee = inspection.get_next_assignee('DIVISION_REVIEWED')
            if not next_assignee:
                return Response({'error': 'No Division Chief found'}, status=status.HTTP_404_NOT_FOUND)
            
            prev_status = inspection.current_status
            inspection.current_status = 'DIVISION_REVIEWED'
            inspection.assigned_to = next_assignee
            inspection.save()
            
            InspectionHistory.objects.create(
                inspection=inspection,
                previous_status=prev_status,
                new_status='DIVISION_REVIEWED',
                changed_by=user,
                remarks=request.data.get('remarks', 'Closed by Section Chief')
            )
            
        elif user.userlevel == 'Division Chief' and inspection.current_status in ['DIVISION_REVIEWED', 'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT']:
            # Division Chief finalizing
            final_status = request.data.get('final_status', 'CLOSED')
            
            prev_status = inspection.current_status
            inspection.current_status = final_status
            inspection.assigned_to = None
            inspection.save()
            
            InspectionHistory.objects.create(
                inspection=inspection,
                previous_status=prev_status,
                new_status=final_status,
                changed_by=user,
                remarks=request.data.get('remarks', 'Closed by Division Chief')
            )
            
        elif user.userlevel == 'Legal Unit' and inspection.current_status in ['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT']:
            # Legal Unit finalizing
            final_status = request.data.get('final_status', 'CLOSED_NON_COMPLIANT')
            
            prev_status = inspection.current_status
            inspection.current_status = final_status
            inspection.assigned_to = None
            inspection.save()
            
            InspectionHistory.objects.create(
                inspection=inspection,
                previous_status=prev_status,
                new_status=final_status,
                changed_by=user,
                remarks=request.data.get('remarks', 'Legal review completed')
            )
        else:
            return Response(
                {'error': 'Invalid status or user level for close action'},
                status=status.HTTP_400_BAD_REQUEST
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def return_to_division(self, request, pk=None):
        """Legal Unit returns inspection to Division Chief"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user is Legal Unit
        if user.userlevel != 'Legal Unit':
            return Response(
                {'error': 'Only Legal Unit can perform this action'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check valid status
        if inspection.current_status != 'LEGAL_REVIEW':
            return Response(
                {'error': f'Cannot return from status {inspection.current_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find Division Chief assignee
        next_assignee = inspection.get_next_assignee('DIVISION_REVIEWED')
        if not next_assignee:
            return Response(
                {'error': 'No Division Chief found for assignment'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Transition back to DIVISION_REVIEWED
        prev_status = inspection.current_status
        inspection.current_status = 'DIVISION_REVIEWED'
        inspection.assigned_to = next_assignee
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status='DIVISION_REVIEWED',
            changed_by=user,
            remarks=request.data.get('remarks', 'Returned to Division Chief by Legal Unit')
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='compliance-expired')
    def check_compliance_expired(self, request):
        """Check for inspections with expired compliance deadlines (Legal Unit only)"""
        user = request.user
        
        # Check if Legal Unit
        if user.userlevel != 'Legal Unit':
            return Response(
                {'error': 'Only Legal Unit can access this endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        from .models import InspectionForm
        
        # Find inspections with expired NOV compliance deadlines
        expired = []
        now = timezone.now()
        
        # Query inspections in NOV_SENT or NOO_SENT with expired deadlines
        inspections = Inspection.objects.filter(
            current_status__in=['NOV_SENT', 'NOO_SENT']
        ).select_related('form')
        
        for inspection in inspections:
            form = getattr(inspection, 'form', None)
            if form and form.nov_compliance_date:
                if form.nov_compliance_date < now:
                    days_overdue = (now.date() - form.nov_compliance_date.date()).days
                    expired.append({
                        'id': inspection.id,
                        'code': inspection.code,
                        'establishment': inspection.establishments.first().name if inspection.establishments.exists() else 'N/A',
                        'status': inspection.current_status,
                        'compliance_deadline': form.nov_compliance_date,
                        'days_overdue': days_overdue,
                        'violations': form.nov_violations or form.violations_found
                    })
        
        return Response({
            'count': len(expired),
            'expired_inspections': expired
        })
    
    @action(detail=False, methods=['get'])
    def compliance_stats(self, request):
        """
        Get compliance statistics based on InspectionForm.compliance_decision
        """
        from django.db.models import Count, Q
        from .models import InspectionForm
        
        # Get compliance statistics
        stats = InspectionForm.objects.aggregate(
            pending=Count('inspection_id', filter=Q(compliance_decision='PENDING')),
            compliant=Count('inspection_id', filter=Q(compliance_decision='COMPLIANT')),
            non_compliant=Count('inspection_id', filter=Q(compliance_decision__in=['NON_COMPLIANT', 'PARTIALLY_COMPLIANT']))
        )
        
        # Calculate total completed
        stats['total_completed'] = stats['compliant'] + stats['non_compliant']
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def quarterly_comparison(self, request):
        """
        Get comparison data for finished inspections with optional law filtering.
        Supports monthly, quarterly, and yearly period types.
        """
        from django.db.models import Count, Q
        from .models import InspectionForm
        from datetime import datetime, timedelta
        from django.utils import timezone as tz
        from calendar import month_name
        
        # Get period type (monthly, quarterly, yearly) - default to quarterly for backward compatibility
        period_type = request.query_params.get('period_type', 'quarterly')
        if period_type not in ['monthly', 'quarterly', 'yearly']:
            period_type = 'quarterly'
        
        # Get year parameter (default to current year)
        year = int(request.query_params.get('year', datetime.now().year))
        
        # Get law parameter for filtering
        law_filter = request.query_params.get('law', 'all')
        
        # Define law choices
        law_choices = [
            ("PD-1586", "PD-1586 (EIA)"),
            ("RA-6969", "RA-6969 (TOX)"),
            ("RA-8749", "RA-8749 (CAA)"),
            ("RA-9275", "RA-9275 (CWA)"),
            ("RA-9003", "RA-9003 (SWM)")
        ]
        
        # Helper functions for date ranges
        def get_quarter_range(year, quarter):
            """Get start and end dates for a quarter"""
            if quarter == 1:
                return tz.datetime(year, 1, 1, 0, 0, 0), tz.datetime(year, 3, 31, 23, 59, 59)
            elif quarter == 2:
                return tz.datetime(year, 4, 1, 0, 0, 0), tz.datetime(year, 6, 30, 23, 59, 59)
            elif quarter == 3:
                return tz.datetime(year, 7, 1, 0, 0, 0), tz.datetime(year, 9, 30, 23, 59, 59)
            else:  # quarter == 4
                return tz.datetime(year, 10, 1, 0, 0, 0), tz.datetime(year, 12, 31, 23, 59, 59)
        
        def get_month_range(year, month):
            """Get start and end dates for a month"""
            if month == 12:
                end_date = tz.datetime(year + 1, 1, 1, 0, 0, 0) - timedelta(seconds=1)
            else:
                end_date = tz.datetime(year, month + 1, 1, 0, 0, 0) - timedelta(seconds=1)
            return tz.datetime(year, month, 1, 0, 0, 0), end_date
        
        def get_year_range(year):
            """Get start and end dates for a year"""
            return tz.datetime(year, 1, 1, 0, 0, 0), tz.datetime(year, 12, 31, 23, 59, 59)
        
        # Get current date info
        now = datetime.now()
        current_year = now.year
        current_month = now.month
        current_quarter = ((current_month - 1) // 3) + 1
        
        # Calculate date ranges based on period type
        if period_type == 'monthly':
            # Current month vs previous month
            current_start, current_end = get_month_range(current_year, current_month)
            
            # Calculate previous month
            if current_month == 1:
                last_month = 12
                last_year = current_year - 1
            else:
                last_month = current_month - 1
                last_year = current_year
            
            last_start, last_end = get_month_range(last_year, last_month)
            
            # Format labels
            def get_period_label(year, month):
                month_abbr = month_name[month][:3] if month_name[month] else f"Month {month}"
                return f"{month_abbr} {year}"
            
            current_period_label = get_period_label(current_year, current_month)
            last_period_label = get_period_label(last_year, last_month)
            
        elif period_type == 'yearly':
            # Current year vs previous year
            current_start, current_end = get_year_range(current_year)
            last_year = current_year - 1
            last_start, last_end = get_year_range(last_year)
            
            # Format labels
            current_period_label = str(current_year)
            last_period_label = str(last_year)
            
        else:  # quarterly (default)
            # Current quarter vs previous quarter
            if current_quarter == 1:
                last_quarter = 4
                last_year = current_year - 1
            else:
                last_quarter = current_quarter - 1
                last_year = current_year
            
            current_start, current_end = get_quarter_range(current_year, current_quarter)
            last_start, last_end = get_quarter_range(last_year, last_quarter)
            
            # Format labels
            def get_quarter_name(quarter_num, year):
                quarter_names = {
                    1: 'Jan-Mar',
                    2: 'Apr-Jun', 
                    3: 'Jul-Sep',
                    4: 'Oct-Dec'
                }
                return f"{quarter_names[quarter_num]} {year}"
            
            current_period_label = get_quarter_name(current_quarter, current_year)
            last_period_label = get_quarter_name(last_quarter, last_year)
        
        # Build base query filters
        base_filters = {
            'compliance_decision__in': ['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT']
        }
        
        # Add law filter if specified
        if law_filter != 'all' and law_filter in [choice[0] for choice in law_choices]:
            base_filters['inspection__law'] = law_filter
        
        # Get current period stats (only finished inspections - not PENDING)
        current_filters = {
            'created_at__range': [current_start, current_end],
            **base_filters
        }
        current_stats = InspectionForm.objects.filter(**current_filters).aggregate(
            compliant=Count('inspection_id', filter=Q(compliance_decision='COMPLIANT')),
            non_compliant=Count('inspection_id', filter=Q(compliance_decision__in=['NON_COMPLIANT', 'PARTIALLY_COMPLIANT']))
        )
        
        # Get last period stats (only finished inspections - not PENDING)
        last_filters = {
            'created_at__range': [last_start, last_end],
            **base_filters
        }
        last_stats = InspectionForm.objects.filter(**last_filters).aggregate(
            compliant=Count('inspection_id', filter=Q(compliance_decision='COMPLIANT')),
            non_compliant=Count('inspection_id', filter=Q(compliance_decision__in=['NON_COMPLIANT', 'PARTIALLY_COMPLIANT']))
        )
        
        # Calculate totals
        current_total = current_stats['compliant'] + current_stats['non_compliant']
        last_total = last_stats['compliant'] + last_stats['non_compliant']
        
        # Calculate percentage change
        if last_total > 0:
            change_percentage = ((current_total - last_total) / last_total) * 100
        else:
            change_percentage = 100.0 if current_total > 0 else 0.0
        
        # Determine trend
        if change_percentage > 5:
            trend = 'up'
        elif change_percentage < -5:
            trend = 'down'
        else:
            trend = 'stable'
        
        # Get law name for display
        law_name = None
        if law_filter != 'all':
            for choice in law_choices:
                if choice[0] == law_filter:
                    law_name = choice[1]
                    break
        
        # Build response with period-agnostic structure
        response_data = {
            'current_period': {
                'period': current_period_label,
                'year': current_year if period_type != 'yearly' else current_year,
                'compliant': current_stats['compliant'],
                'non_compliant': current_stats['non_compliant'],
                'total_finished': current_total
            },
            'last_period': {
                'period': last_period_label,
                'year': last_year if period_type != 'yearly' else last_year,
                'compliant': last_stats['compliant'],
                'non_compliant': last_stats['non_compliant'],
                'total_finished': last_total
            },
            'change_percentage': round(change_percentage, 1),
            'trend': trend,
            'period_type': period_type,
            'filter': {
                'law': law_filter,
                'law_name': law_name,
                'is_filtered': law_filter != 'all'
            }
        }
        
        # For backward compatibility, also include old structure
        response_data['current_quarter'] = response_data['current_period']
        response_data['last_quarter'] = response_data['last_period']
        
        return Response(response_data)
    
    @action(detail=False, methods=['get'])
    def compliance_by_law(self, request):
        """
        Get compliance statistics grouped by law with role-based filtering.
        Supports monthly, quarterly, and yearly period filtering (defaults to quarterly).
        """
        from django.db.models import Count, Q
        from .models import InspectionForm, Inspection
        from datetime import datetime, timedelta
        from django.utils import timezone as tz
        from calendar import month_name
        
        # Get period type (monthly, quarterly, yearly) - default to 'quarterly'
        period_type = request.query_params.get('period_type', 'quarterly')
        if period_type not in ['monthly', 'quarterly', 'yearly']:
            period_type = 'quarterly'
        
        user = request.user
        law_choices = [
            ("PD-1586", "PD-1586 (EIA)"),
            ("RA-6969", "RA-6969 (TOX)"),
            ("RA-8749", "RA-8749 (AIR)"),
            ("RA-9275", "RA-9275 (WATER)"),
            ("RA-9003", "RA-9003 (WASTE)")
        ]
        
        # Helper functions for date ranges (same as quarterly_comparison)
        def get_quarter_range(year, quarter):
            """Get start and end dates for a quarter"""
            if quarter == 1:
                return tz.datetime(year, 1, 1, 0, 0, 0), tz.datetime(year, 3, 31, 23, 59, 59)
            elif quarter == 2:
                return tz.datetime(year, 4, 1, 0, 0, 0), tz.datetime(year, 6, 30, 23, 59, 59)
            elif quarter == 3:
                return tz.datetime(year, 7, 1, 0, 0, 0), tz.datetime(year, 9, 30, 23, 59, 59)
            else:  # quarter == 4
                return tz.datetime(year, 10, 1, 0, 0, 0), tz.datetime(year, 12, 31, 23, 59, 59)
        
        def get_month_range(year, month):
            """Get start and end dates for a month"""
            if month == 12:
                end_date = tz.datetime(year + 1, 1, 1, 0, 0, 0) - timedelta(seconds=1)
            else:
                end_date = tz.datetime(year, month + 1, 1, 0, 0, 0) - timedelta(seconds=1)
            return tz.datetime(year, month, 1, 0, 0, 0), end_date
        
        def get_year_range(year):
            """Get start and end dates for a year"""
            return tz.datetime(year, 1, 1, 0, 0, 0), tz.datetime(year, 12, 31, 23, 59, 59)
        
        # Calculate date range based on period type
        now = datetime.now()
        current_year = now.year
        current_month = now.month
        current_quarter = ((current_month - 1) // 3) + 1
        
        if period_type == 'monthly':
            current_start, current_end = get_month_range(current_year, current_month)
        elif period_type == 'quarterly':
            current_start, current_end = get_quarter_range(current_year, current_quarter)
        else:  # yearly
            current_start, current_end = get_year_range(current_year)
        
        date_filter = Q(created_at__range=[current_start, current_end])
        
        # Get selected laws from query parameter
        selected_laws = request.query_params.getlist('laws')
        if selected_laws:
            law_choices = [(code, name) for code, name in law_choices if code in selected_laws]
        
        # Section-based filtering for Section Chief and Unit Head
        if user.userlevel in ['Section Chief', 'Unit Head']:
            if user.section == 'PD-1586,RA-8749,RA-9275':
                # Combined EIA section - show PD-1586, RA-8749, RA-9275
                allowed_laws = ['PD-1586', 'RA-8749', 'RA-9275']
            else:
                # Single section - show only that law
                allowed_laws = [user.section]
            
            # Filter law_choices to only include allowed laws
            law_choices = [(code, name) for code, name in law_choices if code in allowed_laws]
        
        stats_by_law = []
        
        for law_code, law_name in law_choices:
            # Get base inspection queryset for this law
            base_inspections = Inspection.objects.filter(law=law_code)
            
            # Apply role-based filtering (similar to get_queryset logic)
            if user.userlevel == 'Admin':
                # Admin sees all inspections
                filtered_inspections = base_inspections
            elif user.userlevel == 'Division Chief':
                # Division Chief sees inspections they created or are assigned for review
                filtered_inspections = base_inspections.filter(
                    Q(created_by=user) | Q(current_status='DIVISION_REVIEWED')
                )
            elif user.userlevel == 'Section Chief':
                # Section Chief sees inspections related to their section
                if user.section == 'PD-1586,RA-8749,RA-9275':
                    # Special case for combined EIA section
                    filtered_inspections = base_inspections.filter(
                        Q(assigned_to=user) | 
                        Q(law__in=['PD-1586', 'RA-8749', 'RA-9275'])
                    )
                else:
                    filtered_inspections = base_inspections.filter(
                        Q(assigned_to=user) | Q(law=user.section)
                    )
            elif user.userlevel == 'Unit Head':
                # Unit Head sees inspections related to their section
                if user.section == 'PD-1586,RA-8749,RA-9275':
                    # Special case for combined EIA section
                    filtered_inspections = base_inspections.filter(
                        Q(assigned_to=user) | 
                        Q(law__in=['PD-1586', 'RA-8749', 'RA-9275'])
                    )
                else:
                    filtered_inspections = base_inspections.filter(
                        Q(assigned_to=user) | Q(law=user.section)
                    )
            elif user.userlevel == 'Monitoring Personnel':
                # Monitoring Personnel sees inspections assigned to them
                filtered_inspections = base_inspections.filter(assigned_to=user)
            elif user.userlevel == 'Legal Unit':
                # Legal Unit sees inspections in legal review status
                filtered_inspections = base_inspections.filter(
                    current_status__in=['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT']
                )
            else:
                # Default: only see inspections assigned to user
                filtered_inspections = base_inspections.filter(assigned_to=user)
            
            # Get inspection IDs for compliance stats
            inspection_ids = filtered_inspections.values_list('id', flat=True)
            
            # Build compliance stats query with optional date filter
            compliance_query = Q(inspection_id__in=inspection_ids)
            if date_filter:
                compliance_query &= date_filter
            
            # Get compliance stats for these inspections
            law_stats = InspectionForm.objects.filter(compliance_query).aggregate(
                pending=Count('inspection_id', filter=Q(compliance_decision='PENDING')),
                compliant=Count('inspection_id', filter=Q(compliance_decision='COMPLIANT')),
                non_compliant=Count('inspection_id', filter=Q(compliance_decision__in=['NON_COMPLIANT', 'PARTIALLY_COMPLIANT']))
            )
            
            total = law_stats['pending'] + law_stats['compliant'] + law_stats['non_compliant']
            
            stats_by_law.append({
                'law': law_code,
                'law_name': law_name,
                'pending': law_stats['pending'],
                'compliant': law_stats['compliant'],
                'non_compliant': law_stats['non_compliant'],
                'total': total
            })
        
        # Return data with period_type for frontend reference
        return Response({
            'data': stats_by_law,
            'period_type': period_type
        })
    
    @action(detail=False, methods=['get'])
    def tab_counts(self, request):
        """Get tab counts for role-based dashboard"""
        from django.http import QueryDict
        
        user = request.user
        
        # Define tab mappings (simplified - use existing get_queryset logic)
        tab_list = {
            'Admin': ['all_inspections', 'inspection_complete', 'compliant', 'non_compliant'],
            'Division Chief': ['all_inspections', 'draft', 'section_assigned', 'section_in_progress', 'inspection_complete', 'under_review', 'legal_action', 'compliant', 'non_compliant'],
            'Section Chief': ['section_assigned', 'section_in_progress', 'forwarded', 'inspection_complete', 'under_review', 'legal_action', 'compliant', 'non_compliant'],
            'Unit Head': ['unit_assigned', 'unit_in_progress', 'forwarded', 'inspection_complete', 'under_review', 'compliant', 'non_compliant'],
            'Monitoring Personnel': ['assigned', 'in_progress', 'inspection_complete', 'under_review', 'compliant', 'non_compliant'],
            'Legal Unit': ['legal_review', 'nov_sent', 'noo_sent', 'compliant', 'non_compliant']
        }
        
        user_level = user.userlevel
        tabs = tab_list.get(user_level, [])
        counts = {}
        
        # Save original query params
        original_params = self.request.query_params
        
        for tab_name in tabs:
            # Create a mutable copy of query params and set tab
            query_params = QueryDict('', mutable=True)
            query_params.update(original_params)
            query_params['tab'] = tab_name
            
            # Temporarily replace query_params
            self.request._request.GET = query_params
            
            # Get queryset with tab filtering applied
            queryset = self.get_queryset()
            counts[tab_name] = queryset.count()
        
        # Restore original query params
        self.request._request.GET = original_params
        
        return Response(counts)

    @action(detail=False, methods=['get'])
    def get_quotas(self, request):
        """Get quotas with support for monthly, quarterly, and yearly views"""
        from datetime import datetime
        from .models import ComplianceQuota
        
        user = request.user
        year = int(request.query_params.get('year', datetime.now().year))
        # Accept both snake_case and camelCase for view_mode
        view_mode = request.query_params.get('view_mode') or request.query_params.get('viewMode', 'monthly')
        
        # Support both month and quarter parameters (month takes precedence)
        month = request.query_params.get('month')
        quarter = request.query_params.get('quarter')
        
        # Base queryset - filter by month or quarter
        if view_mode == 'yearly':
            # For yearly view, get all monthly quotas for the year
            quotas = ComplianceQuota.objects.filter(year=year)
        elif view_mode == 'monthly' and month:
            # For monthly view, filter by specific month
            month = int(month)
            quotas = ComplianceQuota.objects.filter(year=year, month=month)
        elif view_mode == 'quarterly' and quarter:
            # For quarterly view, get all months in the quarter
            quarter = int(quarter)
            quarter_months = ComplianceQuota.get_months_in_quarter(quarter)
            quotas = ComplianceQuota.objects.filter(year=year, month__in=quarter_months)
        else:
            # Default to current quarter
            quarter = ((datetime.now().month - 1) // 3) + 1
            quarter_months = ComplianceQuota.get_months_in_quarter(quarter)
            quotas = ComplianceQuota.objects.filter(year=year, month__in=quarter_months)
        
        # Apply role-based filtering
        if user.userlevel == 'Section Chief':
            if hasattr(user, 'section') and user.section:
                if user.section == 'PD-1586,RA-8749,RA-9275':
                    # Combined section: show 3 laws
                    quotas = quotas.filter(law__in=['PD-1586', 'RA-8749', 'RA-9275'])
                else:
                    # Individual section: show only their law
                    quotas = quotas.filter(law=user.section)
        elif user.userlevel == 'Unit Head':
            if hasattr(user, 'section') and user.section:
                # Unit Heads always see only their specific law
                quotas = quotas.filter(law=user.section)
        # Admin and Division Chief see all quotas (no filter)
        
        quota_data = []
        
        # For quarterly and yearly views, aggregate monthly quotas by law
        if view_mode == 'quarterly' or view_mode == 'yearly':
            # Group quotas by law and aggregate
            from collections import defaultdict
            aggregated_quotas = defaultdict(lambda: {
                'target': 0,
                'accomplished': 0,
                'months': [],
                'quota_obj': None,
                'auto_adjusted': False
            })
            
            for quota in quotas:
                law_key = quota.law
                aggregated_quotas[law_key]['target'] += quota.target
                aggregated_quotas[law_key]['accomplished'] += quota.accomplished
                aggregated_quotas[law_key]['months'].append(quota.month)
                # Keep the first quota object for metadata (id, year, etc.)
                if aggregated_quotas[law_key]['quota_obj'] is None:
                    aggregated_quotas[law_key]['quota_obj'] = quota
                # If any quota is auto-adjusted, mark as auto-adjusted
                if quota.auto_adjusted:
                    aggregated_quotas[law_key]['auto_adjusted'] = True
            
            # Convert aggregated data to response format
            for law, data in aggregated_quotas.items():
                quota = data['quota_obj']
                total_target = data['target']
                total_accomplished = data['accomplished']
                
                percentage = round((total_accomplished / total_target * 100), 1) if total_target > 0 else 0
                exceeded = total_accomplished > total_target
                
                quota_data.append({
                    'id': quota.id,  # Use first quota's ID
                    'law': law,
                    'year': quota.year,
                    'quarter': quota.quarter if view_mode == 'quarterly' else None,  # Only set quarter for quarterly view
                    'month': None,  # No specific month for aggregated views
                    'target': total_target,
                    'accomplished': total_accomplished,
                    'auto_adjusted': data['auto_adjusted'],
                    'percentage': percentage,
                    'exceeded': exceeded,
                    'created_at': quota.created_at,
                    'updated_at': quota.updated_at
                })
        else:
            # For monthly view only, return individual records
            for quota in quotas:
                # Use actual month from quota
                month_value = quota.month
                
                # For monthly view, use month-specific accomplished
                accomplished = quota.accomplished  # Already uses month dates
                
                # Calculate percentage and exceeded status
                percentage = round((accomplished / quota.target * 100), 1) if quota.target > 0 else 0
                exceeded = accomplished > quota.target
                
                quota_data.append({
                    'id': quota.id,
                    'law': quota.law,
                    'year': quota.year,
                    'quarter': quota.quarter,
                    'month': quota.month,  # Return actual month
                    'target': quota.target,  # Monthly target
                    'accomplished': accomplished,  # Month-specific accomplished
                    'auto_adjusted': quota.auto_adjusted,
                    'percentage': percentage,
                    'exceeded': exceeded,
                    'created_at': quota.created_at,
                    'updated_at': quota.updated_at
                })
        
        return Response(quota_data)

    @action(detail=False, methods=['post'])
    def set_quota(self, request):
        """Set or update quota(s) - supports single or bulk creation"""
        from datetime import datetime
        from .models import ComplianceQuota
        
        # Check if it's a list (bulk) or single quota
        data = request.data
        if isinstance(data, list):
            # Bulk create/update
            results = []
            errors = []
            for quota_data in data:
                try:
                    result = self._create_single_quota(quota_data, request.user)
                    results.append(result)
                except Exception as e:
                    errors.append({
                        'law': quota_data.get('law'),
                        'month': quota_data.get('month'),
                        'error': str(e)
                    })
            
            if errors:
                return Response(
                    {
                        'results': results,
                        'errors': errors,
                        'message': f'Created {len(results)} quotas, {len(errors)} failed'
                    },
                    status=status.HTTP_207_MULTI_STATUS
                )
            return Response({
                'results': results,
                'message': f'Successfully created {len(results)} quotas'
            })
        else:
            # Single quota
            try:
                result = self._create_single_quota(data, request.user)
                return Response(result)
            except Exception as e:
                return Response(
                    {'error': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
    
    def _create_single_quota(self, quota_data, user):
        """Helper method to create/update a single quota"""
        from datetime import datetime
        from .models import ComplianceQuota
        
        law = quota_data.get('law')
        year = int(quota_data.get('year'))
        target = int(quota_data.get('target'))
        
        # Support both month and quarter (month takes precedence)
        month = quota_data.get('month')
        quarter = quota_data.get('quarter')
        
        if not law or not target:
            raise ValueError('Law and target are required')
        
        # Validate law code
        valid_laws = ['PD-1586', 'RA-6969', 'RA-8749', 'RA-9275', 'RA-9003']
        if law not in valid_laws:
            raise ValueError(f'Invalid law code. Must be one of: {", ".join(valid_laws)}')
        
        # Month is required for monthly quotas
        if not month:
            raise ValueError('Month is required for quota creation')
        
        month = int(month)
        if month < 1 or month > 12:
            raise ValueError('Month must be between 1 and 12')
        
        # Derive quarter from month
        quarter = ComplianceQuota.get_quarter_from_month(month)
        
        # Validate that month is not in the past
        current_year = datetime.now().year
        current_month = datetime.now().month
        if year < current_year or (year == current_year and month < current_month):
            raise ValueError('Cannot create or edit quotas for past months')
        
        # Validate target
        if target <= 0:
            raise ValueError('Target must be greater than 0')
        
        # Check for duplicate (same law + year + month)
        existing_quota = ComplianceQuota.objects.filter(
            law=law,
            year=year,
            month=month
        ).first()
        
        # Check if updating existing quota by ID
        quota_id = quota_data.get('id')
        if quota_id:
            try:
                quota = ComplianceQuota.objects.get(id=quota_id)
                quota.target = target
                quota.month = month  # Ensure month is set
                quota.quarter = quarter  # Update quarter from month
                quota.created_by = user
                quota.auto_adjusted = False
                quota.save()
                created = False
            except ComplianceQuota.DoesNotExist:
                raise ValueError('Quota with provided ID does not exist')
        else:
            # Check for duplicate (same law + year + month)
            if existing_quota:
                month_names = ['January', 'February', 'March', 'April', 'May', 'June', 
                              'July', 'August', 'September', 'October', 'November', 'December']
                raise ValueError(f'Quota for {month_names[month-1]} {year} already exists')
            
            quota, created = ComplianceQuota.objects.update_or_create(
                law=law,
                year=year,
                month=month,  # Use month for unique constraint
                defaults={
                    'quarter': quarter,  # Store quarter for reference
                    'target': target,
                    'created_by': user,
                    'auto_adjusted': False  # Manual setting overrides auto-adjustment
                }
            )
        
        # Use the actual month from the quota
        month_value = quota.month
        
        return {
            'id': quota.id,
            'law': quota.law,
            'year': quota.year,
            'quarter': quota.quarter,
            'month': quota.month,  # Return actual month
            'target': quota.target,
            'accomplished': quota.accomplished,
            'auto_adjusted': quota.auto_adjusted,
            'percentage': quota.percentage,
            'exceeded': quota.exceeded,
            'created': created,
            'message': 'Quota created successfully' if created else 'Quota updated successfully'
        }

    @action(detail=False, methods=['post'])
    def auto_adjust_quotas(self, request):
        """Auto-adjust next quarter quotas based on current accomplishments"""
        from datetime import datetime
        from .models import ComplianceQuota
        
        year = int(request.data.get('year', datetime.now().year))
        quarter = int(request.data.get('quarter', ((datetime.now().month - 1) // 3) + 1))
        
        current_quotas = ComplianceQuota.objects.filter(year=year, quarter=quarter)
        adjusted_quotas = []
        
        for quota in current_quotas:
            if quota.accomplished > quota.target:
                next_quota = quota.auto_adjust_next_quarter()
                if next_quota:
                    adjusted_quotas.append({
                        'law': quota.law,
                        'current_quarter': f"Q{quota.quarter} {quota.year}",
                        'accomplished': quota.accomplished,
                        'next_quarter': f"Q{next_quota.quarter} {next_quota.year}",
                        'new_target': next_quota.target,
                        'auto_adjusted': next_quota.auto_adjusted
                    })
        
        return Response({
            'adjusted_quotas': adjusted_quotas,
            'message': f"Auto-adjusted {len(adjusted_quotas)} quotas for next quarter",
            'total_adjusted': len(adjusted_quotas)
        })

    @action(detail=False, methods=['post'])
    def evaluate_quarter(self, request):
        """Evaluate a quarter: calculate totals, determine status, create/update evaluation"""
        from datetime import datetime
        from .models import ComplianceQuota, QuarterlyEvaluation
        
        law = request.data.get('law')
        year = int(request.data.get('year'))
        quarter = int(request.data.get('quarter'))
        remarks = request.data.get('remarks', '')
        
        # Validate inputs
        if not law or not year or not quarter:
            return Response(
                {'error': 'Law, year, and quarter are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if quarter not in [1, 2, 3, 4]:
            return Response(
                {'error': 'Quarter must be 1, 2, 3, or 4'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate quarterly totals
        total_target, total_achieved = ComplianceQuota.get_quarterly_totals(law, year, quarter)
        
        # Determine status
        if total_achieved >= total_target:
            quarter_status = 'EXCEEDED' if total_achieved > total_target else 'ACHIEVED'
        else:
            quarter_status = 'NOT_ACHIEVED'
        
        # Calculate surplus/deficit
        surplus = max(0, total_achieved - total_target)
        deficit = max(0, total_target - total_achieved)
        
        # Create or update evaluation
        evaluation, created = QuarterlyEvaluation.objects.update_or_create(
            law=law,
            year=year,
            quarter=quarter,
            defaults={
                'quarterly_target': total_target,
                'quarterly_achieved': total_achieved,
                'quarter_status': quarter_status,
                'surplus': surplus,
                'deficit': deficit,
                'remarks': remarks,
                'evaluated_by': request.user,
                'is_archived': True
            }
        )
        
        # Apply carry-over if enabled and policy is auto
        carry_over_applied = False
        if deficit > 0:
            from system_config.models import SystemConfiguration
            config = SystemConfiguration.get_active_config()
            if config.quota_carry_over_enabled and config.quota_carry_over_policy == 'auto':
                # Calculate next quarter
                next_quarter = quarter + 1 if quarter < 4 else 1
                next_year = year if quarter < 4 else year + 1
                
                # Get first month of next quarter
                next_quarter_months = ComplianceQuota.get_months_in_quarter(next_quarter)
                if next_quarter_months:
                    first_month = next_quarter_months[0]
                    # Add deficit to first month's target (if monthly quotas exist)
                    # For now, we'll need to handle this when monthly structure is in place
                    carry_over_applied = True
        
        return Response({
            'id': evaluation.id,
            'law': evaluation.law,
            'year': evaluation.year,
            'quarter': evaluation.quarter,
            'quarterly_target': evaluation.quarterly_target,
            'quarterly_achieved': evaluation.quarterly_achieved,
            'quarter_status': evaluation.quarter_status,
            'surplus': evaluation.surplus,
            'deficit': evaluation.deficit,
            'percentage': evaluation.percentage,
            'remarks': evaluation.remarks,
            'evaluated_at': evaluation.evaluated_at,
            'evaluated_by': evaluation.evaluated_by.email if evaluation.evaluated_by else None,
            'is_archived': evaluation.is_archived,
            'created': created,
            'carry_over_applied': carry_over_applied,
            'message': 'Quarter evaluated successfully'
        })

    @action(detail=False, methods=['get'])
    def get_quarterly_evaluations(self, request):
        """Get all evaluated quarters (archived)"""
        from .models import QuarterlyEvaluation
        
        year = request.query_params.get('year')
        quarter = request.query_params.get('quarter')
        law = request.query_params.get('law')
        
        evaluations = QuarterlyEvaluation.objects.all()
        
        if year:
            evaluations = evaluations.filter(year=int(year))
        if quarter:
            evaluations = evaluations.filter(quarter=int(quarter))
        if law:
            evaluations = evaluations.filter(law=law)
        
        # Apply role-based filtering
        user = request.user
        if user.userlevel == 'Section Chief':
            if hasattr(user, 'section') and user.section:
                if user.section == 'PD-1586,RA-8749,RA-9275':
                    evaluations = evaluations.filter(law__in=['PD-1586', 'RA-8749', 'RA-9275'])
                else:
                    evaluations = evaluations.filter(law=user.section)
        elif user.userlevel == 'Unit Head':
            if hasattr(user, 'section') and user.section:
                evaluations = evaluations.filter(law=user.section)
        
        evaluation_data = []
        for eval in evaluations:
            evaluation_data.append({
                'id': eval.id,
                'law': eval.law,
                'year': eval.year,
                'quarter': eval.quarter,
                'quarterly_target': eval.quarterly_target,
                'quarterly_achieved': eval.quarterly_achieved,
                'quarter_status': eval.quarter_status,
                'surplus': eval.surplus,
                'deficit': eval.deficit,
                'percentage': eval.percentage,
                'remarks': eval.remarks,
                'evaluated_at': eval.evaluated_at,
                'evaluated_by': eval.evaluated_by.email if eval.evaluated_by else None,
                'is_archived': eval.is_archived
            })
        
        return Response(evaluation_data)

    @action(detail=False, methods=['post'])
    def manual_evaluate_quarter(self, request):
        """Manually trigger quarter evaluation (admin only)"""
        # This is essentially the same as evaluate_quarter, but with validation
        # that the quarter has ended (or allow override for current quarter)
        from datetime import datetime
        
        current_date = datetime.now()
        current_year = current_date.year
        current_quarter = ((current_date.month - 1) // 3) + 1
        
        year = int(request.data.get('year'))
        quarter = int(request.data.get('quarter'))
        
        # Allow evaluation of current or past quarters
        if year > current_year or (year == current_year and quarter > current_quarter):
            return Response(
                {'error': 'Cannot evaluate future quarters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Use the same evaluation logic
        return self.evaluate_quarter(request)

    @action(detail=False, methods=['post'])
    def apply_carry_over(self, request):
        """Apply carry-over from evaluated quarter to next quarter"""
        from .models import QuarterlyEvaluation, ComplianceQuota
        from system_config.models import SystemConfiguration
        
        evaluation_id = request.data.get('evaluation_id')
        if not evaluation_id:
            return Response(
                {'error': 'Evaluation ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            evaluation = QuarterlyEvaluation.objects.get(id=evaluation_id)
        except QuarterlyEvaluation.DoesNotExist:
            return Response(
                {'error': 'Evaluation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        config = SystemConfiguration.get_active_config()
        if not config.quota_carry_over_enabled:
            return Response(
                {'error': 'Carry-over is not enabled in system settings'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if evaluation.deficit <= 0:
            return Response(
                {'error': 'No deficit to carry over'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate next quarter
        next_quarter = evaluation.quarter + 1 if evaluation.quarter < 4 else 1
        next_year = evaluation.year if evaluation.quarter < 4 else evaluation.year + 1
        
        # For now, apply to quarterly quota (will update when monthly structure is in place)
        next_quota, created = ComplianceQuota.objects.get_or_create(
            law=evaluation.law,
            year=next_year,
            quarter=next_quarter,
            defaults={
                'target': evaluation.deficit,  # Add deficit to target
                'created_by': request.user,
                'auto_adjusted': True
            }
        )
        
        if not created:
            next_quota.target += evaluation.deficit
            next_quota.auto_adjusted = True
            next_quota.save()
        
        return Response({
            'message': f'Carry-over applied: {evaluation.deficit} added to Q{next_quarter} {next_year}',
            'next_quota': {
                'id': next_quota.id,
                'law': next_quota.law,
                'year': next_quota.year,
                'quarter': next_quota.quarter,
                'target': next_quota.target
            }
        })

    @action(detail=False, methods=['get'], url_path='yearly-summary')
    def get_yearly_summary(self, request):
        """Get yearly summary of all quarters"""
        from datetime import datetime
        from .models import QuarterlyEvaluation
        
        year = int(request.query_params.get('year', datetime.now().year))
        
        evaluations = QuarterlyEvaluation.objects.filter(year=year).order_by('quarter', 'law')
        
        # Aggregate by law
        summary = {}
        for eval in evaluations:
            if eval.law not in summary:
                summary[eval.law] = {
                    'law': eval.law,
                    'year': year,
                    'total_target': 0,
                    'total_achieved': 0,
                    'total_surplus': 0,
                    'total_deficit': 0,
                    'quarters': []
                }
            
            summary[eval.law]['total_target'] += eval.quarterly_target
            summary[eval.law]['total_achieved'] += eval.quarterly_achieved
            summary[eval.law]['total_surplus'] += eval.surplus
            summary[eval.law]['total_deficit'] += eval.deficit
            summary[eval.law]['quarters'].append({
                'quarter': eval.quarter,
                'target': eval.quarterly_target,
                'achieved': eval.quarterly_achieved,
                'status': eval.quarter_status,
                'percentage': eval.percentage
            })
        
        # Calculate overall percentages
        for law_data in summary.values():
            if law_data['total_target'] > 0:
                law_data['overall_percentage'] = round(
                    (law_data['total_achieved'] / law_data['total_target']) * 100, 1
                )
            else:
                law_data['overall_percentage'] = 0
        
        return Response(list(summary.values()))

    @action(detail=False, methods=['get'], url_path='reinspection-reminders')
    def reinspection_reminders(self, request):
        """Get all reinspection schedules for Division Chiefs"""
        from django.utils import timezone
        from datetime import timedelta
        from .models import ReinspectionSchedule
        
        # Only allow Division Chiefs
        if request.user.userlevel != 'Division Chief':
            return Response(
                {'error': 'Access denied. Only Division Chiefs can view reinspection reminders.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all reinspection schedules (not just upcoming ones)
        schedules = ReinspectionSchedule.objects.filter(
            status='PENDING'
        ).select_related('establishment', 'original_inspection')
        
        reminders = []
        today = timezone.now().date()
        
        for schedule in schedules:
            days_until_due = (schedule.due_date - today).days
            
            # Construct address manually since get_full_address doesn't exist
            establishment = schedule.establishment
            address_parts = [
                establishment.street_building,
                establishment.barangay,
                establishment.city,
                establishment.province
            ]
            full_address = ', '.join(filter(None, address_parts))
            
            reminders.append({
                'id': schedule.id,
                'establishment_name': establishment.name,
                'establishment_address': full_address,
                'original_inspection_code': schedule.original_inspection.code,
                'compliance_status': schedule.compliance_status,
                'due_date': schedule.due_date,
                'days_until_due': days_until_due,
                'is_overdue': days_until_due < 0
            })
        
        return Response(reminders)


class BillingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Billing Records
    """
    queryset = BillingRecord.objects.all().order_by('-created_at')
    serializer_class = BillingRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter billing records based on user level and permissions"""
        user = self.request.user
        queryset = BillingRecord.objects.all()
        
        # Legal Unit can see all billing records
        if user.userlevel == 'Legal Unit':
            pass  # No filter, see all
        # Division/Section Chiefs can see all
        elif user.userlevel in ['Division Chief', 'Section Chief']:
            pass  # No filter, see all
        # Others can only see their related law
        elif hasattr(user, 'law') and user.law:
            queryset = queryset.filter(related_law=user.law)
        else:
            # No access for others
            queryset = queryset.none()
        
        # Apply filters from query params
        law = self.request.query_params.get('law', None)
        if law:
            # Normalize law format - try multiple formats
            law_normalized = law.replace(' ', '').replace('-', '')
            # Try to add dashes if it's a law code like RA8749 -> RA-8749
            if law.startswith('RA') and len(law) > 2:
                law_with_dash = f"RA-{law[2:]}"
                law_with_spaces = f"RA {law[2:]}"
            elif law.startswith('PD') and len(law) > 2:
                law_with_dash = f"PD-{law[2:]}"
                law_with_spaces = f"PD {law[2:]}"
            else:
                law_with_dash = law
                law_with_spaces = law
            
            queryset = queryset.filter(
                Q(related_law=law) | 
                Q(related_law=law_normalized) |
                Q(related_law=law_with_dash) |
                Q(related_law=law_with_spaces) |
                Q(related_law__icontains=law.replace(' ', '').replace('-', ''))
            )
        
        establishment_id = self.request.query_params.get('establishment', None)
        if establishment_id:
            queryset = queryset.filter(establishment_id=establishment_id)
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(billing_code__icontains=search) |
                Q(establishment_name__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.select_related('inspection', 'establishment', 'issued_by')
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get billing statistics"""
        from django.db.models import Sum, Count, Avg
        
        queryset = self.get_queryset()
        
        stats = {
            'total_records': queryset.count(),
            'total_amount': queryset.aggregate(Sum('amount'))['amount__sum'] or 0,
            'average_amount': queryset.aggregate(Avg('amount'))['amount__avg'] or 0,
            'by_type': [],
            'by_law': []
        }
        
        # Stats by billing type
        type_stats = queryset.values('billing_type').annotate(
            count=Count('id'),
            total=Sum('amount')
        ).order_by('-count')
        
        for item in type_stats:
            stats['by_type'].append({
                'type': item['billing_type'],
                'count': item['count'],
                'total': float(item['total'] or 0)
            })
        
        # Stats by law
        law_stats = queryset.values('related_law').annotate(
            count=Count('id'),
            total=Sum('amount')
        ).order_by('-count')
        
        for item in law_stats:
            stats['by_law'].append({
                'law': item['related_law'],
                'count': item['count'],
                'total': float(item['total'] or 0)
            })
        
        return Response(stats)
    
    @action(detail=True, methods=['get'])
    def print_receipt(self, request, pk=None):
        """Generate printable billing receipt"""
        billing = self.get_object()
        serializer = self.get_serializer(billing)
        
        # Return formatted data for printing
        return Response({
            'billing': serializer.data,
            'generated_at': timezone.now().isoformat()
        })