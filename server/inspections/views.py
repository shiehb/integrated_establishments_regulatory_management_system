"""
Refactored Inspection Views with Complete Workflow
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import Inspection, InspectionForm, InspectionDocument, InspectionHistory, NoticeOfViolation, NoticeOfOrder, BillingRecord
from .serializers import (
    InspectionSerializer, InspectionCreateSerializer, InspectionFormSerializer,
    InspectionHistorySerializer, InspectionDocumentSerializer,
    InspectionActionSerializer, NOVSerializer, NOOSerializer, BillingRecordSerializer
)
from .utils import send_inspection_forward_notification, create_forward_notification

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
        
        if tab == 'received':
            # Show inspections assigned to this Section Chief but not yet started
            return queryset.filter(
                law_filter,
                current_status='SECTION_ASSIGNED'
            )
        elif tab == 'my_inspections':
            # Show inspections that this Section Chief is working on (in-progress AND completed)
            # Only show inspections assigned to this user
            return queryset.filter(
                law_filter,
                assigned_to=user,
                current_status__in=[
                    'SECTION_IN_PROGRESS',
                    'SECTION_COMPLETED_COMPLIANT',
                    'SECTION_COMPLETED_NON_COMPLIANT'
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
        elif tab == 'review':
            # Show inspections that need Section Chief review (completed work from Unit/Monitoring)
            # Differentiate based on section type
            if user.section == 'PD-1586,RA-8749,RA-9275':
                # Combined section: has Unit Head in hierarchy
                # Show ONLY Unit completed work and Unit reviewed (monitoring goes through Unit Head)
                return queryset.filter(
                    law_filter,
                    current_status__in=[
                        'UNIT_COMPLETED_COMPLIANT',
                        'UNIT_COMPLETED_NON_COMPLIANT',
                        'UNIT_REVIEWED'
                    ]
                )
            else:
                # Individual sections: NO Unit Head, goes directly to Monitoring
                # Show only Monitoring completed work
                return queryset.filter(
                    law_filter,
                    current_status__in=[
                        'MONITORING_COMPLETED_COMPLIANT',
                        'MONITORING_COMPLETED_NON_COMPLIANT'
                    ]
                )
        elif tab == 'compliance':
            # Show final status inspections (completed work through entire workflow)
            # Filter by Section Chief's own work or their section's work
            from django.db.models import Q
            return queryset.filter(
                law_filter,
                Q(form__inspected_by=user) | 
                Q(form__inspected_by__userlevel='Section Chief', form__inspected_by__section=user.section) |
                Q(form__inspected_by__userlevel='Unit Head', form__inspected_by__section=user.section) |
                Q(form__inspected_by__userlevel='Monitoring Personnel', form__inspected_by__section=user.section),
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
        
        if tab == 'received':
            # Show inspections assigned to this Unit Head but not yet started
            return queryset.filter(
                law_filter,
                current_status='UNIT_ASSIGNED'
            )
        elif tab == 'my_inspections':
            # Show inspections that this Unit Head is working on (in-progress AND completed)
            # Only show inspections assigned to this user
            return queryset.filter(
                law_filter,
                assigned_to=user,
                current_status__in=[
                    'UNIT_IN_PROGRESS',
                    'UNIT_COMPLETED_COMPLIANT',
                    'UNIT_COMPLETED_NON_COMPLIANT'
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
        elif tab == 'review':
            # Show inspections that need Unit Head review (completed work from Monitoring)
            return queryset.filter(
                law_filter,
                current_status__in=[
                    'MONITORING_COMPLETED_COMPLIANT',
                    'MONITORING_COMPLETED_NON_COMPLIANT',
                    'UNIT_REVIEWED'
                ]
            )
        elif tab == 'compliance':
            # Show final status inspections (completed work through entire workflow)
            # Filter by Unit Head's own work or their section's work
            from django.db.models import Q
            return queryset.filter(
                law_filter,
                Q(form__inspected_by=user) | 
                Q(form__inspected_by__userlevel='Unit Head', form__inspected_by__section=user.section) | 
                Q(form__inspected_by__userlevel='Monitoring Personnel', form__inspected_by__section=user.section),
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
        elif tab == 'completed':
            # Show inspections that this Monitoring Personnel has completed and those in review
            # Filter by who actually performed the inspection, not current assignee
            from django.db.models import Q
            return queryset.filter(
                Q(form__inspected_by=user) | Q(assigned_to=user, form__inspected_by__isnull=True),
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
        elif tab == 'review':
            # Show inspections that need Division Chief review
            # Includes section completed and section reviewed (awaiting division review)
            return queryset.filter(
                current_status__in=[
                    'SECTION_COMPLETED_COMPLIANT',
                    'SECTION_COMPLETED_NON_COMPLIANT',
                    'SECTION_REVIEWED'
                ]
            )
        elif tab == 'reviewed':
            # Show inspections that Division Chief has reviewed (DIVISION_REVIEWED status)
            return queryset.filter(
                current_status='DIVISION_REVIEWED'
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
        monitoring_personnel = User.objects.filter(
            userlevel='Monitoring Personnel',
            section=inspection.law,
            is_active=True
        ).order_by('district', 'first_name', 'last_name')
        
        # Separate district-based and other personnel
        district_personnel = []
        other_personnel = []
        
        for person in monitoring_personnel:
            person_data = {
                'id': person.id,
                'first_name': person.first_name,
                'last_name': person.last_name,
                'email': person.email,
                'district': person.district,
                'is_district_match': person.district == inspection.district
            }
            
            if person.district == inspection.district:
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
                if inspection.district:
                    next_assignee = monitoring_query.filter(district=inspection.district).first()
                    if not next_assignee:
                        # No district match - return available options instead of error
                        available_personnel = monitoring_query.values('id', 'first_name', 'last_name', 'email', 'district')
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
    
    @action(detail=False, methods=['get'])
    def tab_counts(self, request):
        """Get tab counts for role-based dashboard"""
        from django.http import QueryDict
        
        user = request.user
        
        # Define tab mappings (simplified - use existing get_queryset logic)
        tab_list = {
            'Division Chief': ['all_inspections', 'review', 'reviewed'],
            'Section Chief': ['received', 'my_inspections', 'forwarded', 'review', 'compliance'],
            'Unit Head': ['received', 'my_inspections', 'forwarded', 'review', 'compliance'],
            'Monitoring Personnel': ['assigned', 'in_progress', 'completed'],
            'Legal Unit': ['legal_review', 'nov_sent', 'noo_sent']
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
            queryset = queryset.filter(related_law=law)
        
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
        
        return queryset.select_related('inspection', 'establishment', 'issued_by').prefetch_related('items')
    
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