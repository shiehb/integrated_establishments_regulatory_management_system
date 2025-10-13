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


def capture_inspector_info(form, user):
    """Capture inspector information on first form fill-out"""
    if form.inspected_by is None and user:
        form.inspected_by = user
        return True  # Indicates this was the first fill-out
    return False  # Not first fill-out


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
            pass  # Admin sees all
        elif user.userlevel == 'Division Chief':
            if tab == 'all_inspections':
                queryset = queryset.filter(
                    Q(created_by=user) | Q(current_status='DIVISION_REVIEWED')
                )
            elif tab == 'review':
                queryset = queryset.filter(
                    current_status='DIVISION_REVIEWED',
                    assigned_to=user
                )
            else:
                # Default to all inspections
                queryset = queryset.filter(
                    Q(created_by=user) | Q(current_status='DIVISION_REVIEWED')
                )
        elif user.userlevel == 'Section Chief':
            queryset = self._filter_section_chief(queryset, user, tab)
        elif user.userlevel == 'Unit Head':
            queryset = self._filter_unit_head(queryset, user, tab)
        elif user.userlevel == 'Monitoring Personnel':
            queryset = self._filter_monitoring_personnel(queryset, user, tab)
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
        
        # Search functionality
        if search:
            queryset = self._apply_search_filter(queryset, search)
        
        return queryset.select_related(
            'created_by', 'assigned_to'
        ).prefetch_related('establishments', 'history').distinct().order_by('-created_at')
    
    def _filter_section_chief(self, queryset, user, tab):
        """Filter for Section Chief based on tab"""
        if tab == 'received':
            # Show inspections assigned to this Section Chief but not yet started
            return queryset.filter(
                assigned_to=user,
                current_status='SECTION_ASSIGNED'
            )
        elif tab == 'my_inspections':
            # Show inspections that this Section Chief has started or is working on
            return queryset.filter(
                assigned_to=user,
                current_status__in=['SECTION_IN_PROGRESS', 'SECTION_COMPLETED']
            )
        elif tab == 'forwarded':
            # Show inspections that this Section Chief has forwarded
            # Get inspection IDs where this user has forwarded (from history)
            forwarded_inspection_ids = InspectionHistory.objects.filter(
                changed_by=user,
                new_status__in=['UNIT_ASSIGNED', 'MONITORING_ASSIGNED'],
                remarks__icontains='Forwarded'
            ).values_list('inspection_id', flat=True)
            
            # Also include inspections that match the law filter and are in forwarded statuses
            # This ensures we catch any inspections that might have been forwarded by other means
            law_filter = Q(law=user.section)
            if user.section == 'PD-1586,RA-8749,RA-9275':
                law_filter = Q(law=user.section) | Q(law='PD-1586') | Q(law='RA-8749') | Q(law='RA-9275')
            
            # Combine both conditions: either forwarded by this user OR matches law filter
            return queryset.filter(
                Q(id__in=forwarded_inspection_ids) | (
                    law_filter & Q(current_status__in=[
                        'UNIT_ASSIGNED', 'UNIT_IN_PROGRESS', 'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
                        'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS',
                    ])
                )
            )
        elif tab == 'review':
            return queryset.filter(
                assigned_to=user,
                current_status='SECTION_REVIEWED'
            )
        else:
            # Special case: If user is in combined EIA section, also show PD-1586, RA-8749, RA-9275 inspections
            law_filter = Q(law=user.section)
            if user.section == 'PD-1586,RA-8749,RA-9275':
                law_filter = Q(law=user.section) | Q(law='PD-1586') | Q(law='RA-8749') | Q(law='RA-9275')
            
            return queryset.filter(
                Q(assigned_to=user) | law_filter
            )
    
    def _filter_unit_head(self, queryset, user, tab):
        """Filter for Unit Head based on tab"""
        if tab == 'received':
            # Show inspections assigned to this Unit Head but not yet started
            return queryset.filter(
                assigned_to=user,
                current_status='UNIT_ASSIGNED'
            )
        elif tab == 'my_inspections':
            # Show inspections that this Unit Head has started or is working on
            return queryset.filter(
                assigned_to=user,
                current_status__in=['UNIT_IN_PROGRESS', 'UNIT_COMPLETED']
            )
        elif tab == 'forwarded':
            # Show inspections that this Unit Head has forwarded to Monitoring Personnel
            # Get inspection IDs where this user has forwarded (from history)
            forwarded_inspection_ids = InspectionHistory.objects.filter(
                changed_by=user,
                new_status='MONITORING_ASSIGNED',
                remarks__icontains='Forwarded'
            ).values_list('inspection_id', flat=True)
            
            # Also include inspections that match the law filter and are in forwarded statuses
            law_filter = Q(law=user.section)
            if user.section == 'PD-1586,RA-8749,RA-9275':
                law_filter = Q(law=user.section) | Q(law='PD-1586') | Q(law='RA-8749') | Q(law='RA-9275')
            
            # Combine both conditions: either forwarded by this user OR matches law filter
            return queryset.filter(
                Q(id__in=forwarded_inspection_ids) | (
                    law_filter & Q(current_status__in=[
                        'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS',
                    ])
                )
            )
        elif tab == 'review':
            # Show inspections that need Unit Head review
            return queryset.filter(
                current_status__in=[
                    'UNIT_REVIEWED'
                ]
            )
        else:
            # Special case: If user is in combined EIA section, also show PD-1586, RA-8749, RA-9275 inspections
            law_filter = Q(law=user.section)
            if user.section == 'PD-1586,RA-8749,RA-9275':
                law_filter = Q(law=user.section) | Q(law='PD-1586') | Q(law='RA-8749') | Q(law='RA-9275')
            
            return queryset.filter(
                Q(assigned_to=user) | law_filter
            )
    
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
        elif tab == 'completed':
            # Show inspections that this Monitoring Personnel has completed and progressed through reviews up to legal
            return queryset.filter(
                assigned_to=user,
                current_status__in=[
                    'UNIT_REVIEWED',
                    'SECTION_REVIEWED', 
                    'DIVISION_REVIEWED',
                    'LEGAL_REVIEW'
                ]
            )
        else:
            # Default: show all assigned inspections
            return queryset.filter(
                assigned_to=user,
                current_status__in=['MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS', 'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT']
            )
    
    def _apply_search_filter(self, queryset, search_term):
        """
        Apply comprehensive search across multiple fields
        Searches: Code, Establishment names, Law, Status, Assigned To
        """
        from django.db.models import Q
        
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
        
        # Determine the correct status based on user level and current status
        if user.userlevel == 'Section Chief':
            if inspection.current_status == 'CREATED':
                new_status = 'SECTION_ASSIGNED'
            elif inspection.current_status == 'SECTION_ASSIGNED':
                # When Section Chief assigns to themselves, move to in progress
                new_status = 'SECTION_IN_PROGRESS'
            else:
                new_status = inspection.current_status
        elif user.userlevel == 'Unit Head':
            if inspection.current_status == 'SECTION_COMPLETED':
                new_status = 'UNIT_ASSIGNED'
            elif inspection.current_status == 'UNIT_ASSIGNED':
                # When Unit Head assigns to themselves, move to in progress
                new_status = 'UNIT_IN_PROGRESS'
            else:
                new_status = inspection.current_status
        else:
            # If already in correct status, just assign
            new_status = inspection.current_status
        
        # Assign user and update status if needed
        prev_status = inspection.current_status
        inspection.assigned_to = user
        if new_status != prev_status:
            inspection.current_status = new_status
        inspection.save()
        
        # Log history
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status=inspection.current_status,
            changed_by=user,
            assigned_to=inspection.assigned_to,
            law=inspection.law,
            section=user.section,
            remarks='Assigned to self'
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def inspect(self, request, pk=None):
        """Move inspection to My Inspections (Section Chief/Unit Head/Monitoring Personnel)"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can act
        if inspection.assigned_to != user:
            return Response(
                {'error': 'You are not assigned to this inspection'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if inspection is in correct status
        if inspection.current_status not in ['SECTION_ASSIGNED', 'UNIT_ASSIGNED', 'MONITORING_ASSIGNED']:
            return Response(
                {'error': f'Cannot inspect from status {inspection.current_status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Move to IN_PROGRESS status (this moves it to My Inspections tab)
        prev_status = inspection.current_status
        if inspection.current_status == 'SECTION_ASSIGNED':
            inspection.current_status = 'SECTION_IN_PROGRESS'
        elif inspection.current_status == 'UNIT_ASSIGNED':
            inspection.current_status = 'UNIT_IN_PROGRESS'
        elif inspection.current_status == 'MONITORING_ASSIGNED':
            inspection.current_status = 'MONITORING_IN_PROGRESS'
        
        inspection.save()
        
        # Log history
        remarks = request.data.get('remarks', 'Moved to My Inspections')
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
            'is_draft': True,
            'last_saved': timezone.now().isoformat(),
            'saved_by': user.id
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
        else:
            # Log draft save without status change
            InspectionHistory.objects.create(
                inspection=inspection,
                previous_status=inspection.current_status,
                new_status=inspection.current_status,
                changed_by=user,
                remarks='Saved inspection form as draft'
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
            'is_draft': True,
            'last_saved': timezone.now().isoformat(),
            'saved_by': user.id,
            'auto_save': True  # Mark as auto-save
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
        
        # Check if user can act
        if inspection.assigned_to != user:
            return Response(
                {'error': 'You are not assigned to this inspection'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Handle form data for Monitoring Personnel
        form_data = request.data.get('form_data', {})
        if form_data and inspection.current_status == 'MONITORING_IN_PROGRESS':
            # Save form data as part of completion
            form, created = InspectionForm.objects.get_or_create(inspection=inspection)
            
            # Store all form data in the checklist JSON field
            form.checklist = {
                'general': form_data.get('general', {}),
                'purpose': form_data.get('purpose', {}),
                'permits': form_data.get('permits', []),
                'complianceItems': form_data.get('complianceItems', []),
                'systems': form_data.get('systems', []),
                'recommendationState': form_data.get('recommendationState', {}),
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
        
        # Determine next status based on current status and compliance decision
        compliance_decision = data.get('compliance_decision', 'COMPLIANT')
        
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
        """Auto-assign to Unit Head for review (status unchanged)"""
        # Find Unit Head based on law
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
    
    @action(detail=True, methods=['post'])
    def forward(self, request, pk=None):
        """Forward inspection to next level"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can act (allow forwarding even if not assigned)
        # This allows Section Chief to forward from "Received" tab without claiming first
        if inspection.assigned_to and inspection.assigned_to != user:
            return Response(
                {'error': f'Already assigned to {inspection.assigned_to}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
                # Combined section: look for Unit Head by specific law
                unit_head = User.objects.filter(
                    userlevel='Unit Head',
                    section=inspection.law,  # Use the specific law, not combined section
                    is_active=True
                ).first()
                
                if unit_head:
                    next_status = 'UNIT_ASSIGNED'
                else:
                    # No Unit Head found for combined section - return error
                    return Response(
                        {'error': f'No Unit Head assigned for {inspection.law}. Please assign a Unit Head before forwarding.'},
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
            # Special case: For combined section forwarding to Unit Head, use specific law
            next_assignee = User.objects.filter(
                userlevel='Unit Head',
                section=inspection.law,  # Use the specific law, not combined section
                is_active=True
            ).first()
        elif next_status == 'MONITORING_ASSIGNED':
            # Special case: For Monitoring Personnel, use specific law and prefer same district
            monitoring_query = User.objects.filter(
                userlevel='Monitoring Personnel',
                section=inspection.law,  # Use the specific law
                is_active=True
            )
            
            # Prefer same district if available
            if inspection.district:
                next_assignee = monitoring_query.filter(district=inspection.district).first()
                if not next_assignee:
                    # No Monitoring Personnel found - return error instead of changing status
                    return Response(
                        {'error': f'No Monitoring Personnel found for {inspection.law} in district {inspection.district}. Please assign Monitoring Personnel before forwarding.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                next_assignee = monitoring_query.first()
                if not next_assignee:
                    # No Monitoring Personnel found - return error instead of changing status
                    return Response(
                        {'error': f'No Monitoring Personnel found for {inspection.law}. Please assign Monitoring Personnel before forwarding.'},
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
        
        # Log history
        # Create full name from available fields
        full_name_parts = [next_assignee.first_name, next_assignee.middle_name, next_assignee.last_name]
        full_name = ' '.join([part for part in full_name_parts if part]).strip()
        display_name = full_name if full_name else next_assignee.email
        default_remarks = f'Forwarded to {display_name} ({next_assignee.userlevel})'
        remarks = request.data.get('remarks', default_remarks)
        
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
    def send_to_section(self, request, pk=None):
        """Send inspection to Section Chief for review (Unit Head only)"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user is Unit Head
        if user.userlevel != 'Unit Head':
            return Response(
                {'error': 'Only Unit Heads can send to Section'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if in correct status
        if inspection.current_status != 'UNIT_REVIEWED':
            return Response(
                {'error': 'Can only send to Section from Unit Reviewed status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get Section Chief assignee
        next_assignee = inspection.get_next_assignee('SECTION_REVIEWED')
        if not next_assignee:
            return Response(
                {'error': 'No Section Chief found for assignment'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Transition
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
            remarks=request.data.get('remarks', 'Sent to Section Chief for review')
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def send_to_division(self, request, pk=None):
        """Send inspection to Division Chief for review (Section Chief only)"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user is Section Chief
        if user.userlevel != 'Section Chief':
            return Response(
                {'error': 'Only Section Chiefs can send to Division'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if in correct status
        if inspection.current_status != 'SECTION_REVIEWED':
            return Response(
                {'error': 'Can only send to Division from Section Reviewed status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get Division Chief assignee
        next_assignee = inspection.get_next_assignee('DIVISION_REVIEWED')
        if not next_assignee:
            return Response(
                {'error': 'No Division Chief found for assignment'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Transition
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
            remarks=request.data.get('remarks', 'Sent to Division Chief for review')
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
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
            
        elif user.userlevel == 'Division Chief' and inspection.current_status == 'DIVISION_REVIEWED':
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
            
        elif user.userlevel == 'Legal Unit' and inspection.current_status == 'LEGAL_REVIEW':
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
        Get quarterly comparison data for finished inspections
        """
        from django.db.models import Count, Q
        from .models import InspectionForm
        from datetime import datetime, timedelta
        
        # Get year parameter (default to current year)
        year = int(request.query_params.get('year', datetime.now().year))
        
        # Calculate quarters
        def get_quarter_range(year, quarter):
            """Get start and end dates for a quarter"""
            if quarter == 1:
                return datetime(year, 1, 1), datetime(year, 3, 31, 23, 59, 59)
            elif quarter == 2:
                return datetime(year, 4, 1), datetime(year, 6, 30, 23, 59, 59)
            elif quarter == 3:
                return datetime(year, 7, 1), datetime(year, 9, 30, 23, 59, 59)
            else:  # quarter == 4
                return datetime(year, 10, 1), datetime(year, 12, 31, 23, 59, 59)
        
        # Get current quarter
        now = datetime.now()
        current_quarter = ((now.month - 1) // 3) + 1
        current_year = now.year
        
        # Calculate last quarter
        if current_quarter == 1:
            last_quarter = 4
            last_year = current_year - 1
        else:
            last_quarter = current_quarter - 1
            last_year = current_year
        
        # Get date ranges
        current_start, current_end = get_quarter_range(current_year, current_quarter)
        last_start, last_end = get_quarter_range(last_year, last_quarter)
        
        # Get current quarter stats (only finished inspections - not PENDING)
        current_stats = InspectionForm.objects.filter(
            created_at__range=[current_start, current_end],
            compliance_decision__in=['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT']
        ).aggregate(
            compliant=Count('inspection_id', filter=Q(compliance_decision='COMPLIANT')),
            non_compliant=Count('inspection_id', filter=Q(compliance_decision__in=['NON_COMPLIANT', 'PARTIALLY_COMPLIANT']))
        )
        
        # Get last quarter stats (only finished inspections - not PENDING)
        last_stats = InspectionForm.objects.filter(
            created_at__range=[last_start, last_end],
            compliance_decision__in=['COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT']
        ).aggregate(
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
        
        # Convert quarter numbers to month range format
        def get_quarter_name(quarter_num, year):
            quarter_names = {
                1: 'Jan-Mar',
                2: 'Apr-Jun', 
                3: 'Jul-Sep',
                4: 'Oct-Dec'
            }
            return f"{quarter_names[quarter_num]} {year}"

        return Response({
            'current_quarter': {
                'quarter': get_quarter_name(current_quarter, current_year),
                'year': current_year,
                'compliant': current_stats['compliant'],
                'non_compliant': current_stats['non_compliant'],
                'total_finished': current_total
            },
            'last_quarter': {
                'quarter': get_quarter_name(last_quarter, last_year),
                'year': last_year,
                'compliant': last_stats['compliant'],
                'non_compliant': last_stats['non_compliant'],
                'total_finished': last_total
            },
            'change_percentage': round(change_percentage, 1),
            'trend': trend
        })
    
    @action(detail=False, methods=['get'])
    def compliance_by_law(self, request):
        """
        Get compliance statistics grouped by law with role-based filtering
        """
        from django.db.models import Count, Q
        from .models import InspectionForm, Inspection
        
        user = request.user
        law_choices = [
            ("PD-1586", "PD-1586 (EIA)"),
            ("RA-6969", "RA-6969 (TOX)"),
            ("RA-8749", "RA-8749 (AIR)"),
            ("RA-9275", "RA-9275 (WATER)"),
            ("RA-9003", "RA-9003 (WASTE)")
        ]
        
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
            
            # Get compliance stats for these inspections
            law_stats = InspectionForm.objects.filter(inspection_id__in=inspection_ids).aggregate(
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
        
        return Response(stats_by_law)