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
        
        return queryset.select_related(
            'created_by', 'assigned_to'
        ).prefetch_related('establishments', 'history').order_by('-created_at')
    
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
            # Inspections they forwarded (track by history or filter by law)
            # Special case: If user is in combined EIA section, also show PD-1586, RA-8749, RA-9275 inspections
            law_filter = Q(law=user.section)
            if user.section == 'PD-1586,RA-8749,RA-9275':
                law_filter = Q(law=user.section) | Q(law='PD-1586') | Q(law='RA-8749') | Q(law='RA-9275')
            
            return queryset.filter(
                law_filter,
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
            # Use law filter but don't restrict by district since Monitoring Personnel might be in different district
            law_filter = Q(law=user.section)
            if user.section == 'PD-1586,RA-8749,RA-9275':
                law_filter = Q(law=user.section) | Q(law='PD-1586') | Q(law='RA-8749') | Q(law='RA-9275')
            
            return queryset.filter(
                law_filter,
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
            # Show inspections that this Monitoring Personnel has completed
            return queryset.filter(
                assigned_to=user,
                current_status__in=['MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT']
            )
        else:
            # Default: show all assigned inspections
            return queryset.filter(
                assigned_to=user,
                current_status__in=['MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS', 'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT']
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
            remarks='Assigned to self'
        )
        
        serializer = self.get_serializer(inspection)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def inspect(self, request, pk=None):
        """Move inspection to My Inspections (Section/Unit only)"""
        inspection = self.get_object()
        user = request.user
        
        # Check if user can act
        if inspection.assigned_to != user:
            return Response(
                {'error': 'You are not assigned to this inspection'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if inspection is in correct status
        if inspection.current_status not in ['SECTION_ASSIGNED', 'UNIT_ASSIGNED']:
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
        
        inspection.save()
        
        # Log history
        remarks = request.data.get('remarks', 'Moved to My Inspections')
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=prev_status,
            new_status=inspection.current_status,
            changed_by=user,
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
        
        # Update scheduled_at if provided
        if 'general' in form_data and form_data['general'].get('inspectionDateTime'):
            try:
                form.scheduled_at = form_data['general']['inspectionDateTime']
            except:
                pass
        
        # Update inspection notes if provided
        if 'general' in form_data and form_data['general'].get('inspectionNotes'):
            form.inspection_notes = form_data['general']['inspectionNotes']
        
        form.save()
        
        # Log history
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
        
        # Update scheduled_at if provided
        if 'general' in form_data and form_data['general'].get('inspection_date_time'):
            try:
                form.scheduled_at = form_data['general']['inspection_date_time']
            except:
                pass
        
        # Update inspection notes if provided
        if 'general' in form_data and form_data['general'].get('inspection_notes'):
            form.inspection_notes = form_data['general']['inspection_notes']
        
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
            
            # Update scheduled_at if provided
            if 'general' in form_data and form_data['general'].get('inspection_date_time'):
                try:
                    from datetime import datetime
                    form.scheduled_at = datetime.fromisoformat(form_data['general']['inspection_date_time'].replace('Z', '+00:00'))
                except:
                    pass
            
            # Update inspection notes if provided
            if 'general' in form_data and form_data['general'].get('inspection_notes'):
                form.inspection_notes = form_data['general']['inspection_notes']
            
            form.save()

        # Validate other data using serializer
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
            elif compliance == 'PARTIALLY_COMPLIANT':
                next_status = 'MONITORING_COMPLETED_NON_COMPLIANT'  # Treat partially compliant as non-compliant for workflow
                # Validate violations for partially compliant
                if not data.get('violations_found'):
                    return Response(
                        {'error': 'Violations required for partially compliant decision'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
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
        
        # Auto-transition completed inspections to review
        if next_status in ['MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT']:
            self._auto_forward_to_review(inspection, user)
        elif next_status == 'SECTION_COMPLETED':
            # Section completed - forward to Division Chief for review
            self._auto_forward_to_division_review(inspection, user)
        elif next_status == 'UNIT_COMPLETED':
            # Unit completed - forward to Section Chief for review
            self._auto_forward_to_section_review(inspection, user)
        
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
            else:
                # Individual section: go directly to Monitoring Personnel
                unit_head = None
            
            if unit_head:
                next_status = 'UNIT_ASSIGNED'
            else:
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
                    # Fallback: No Monitoring Personnel found, return to Section Chief for inspection
                    # Change status to SECTION_IN_PROGRESS and assign back to current user (Section Chief)
                    inspection.current_status = 'SECTION_IN_PROGRESS'
                    inspection.assigned_to = user
                    inspection.save()
                    
                    # Log history
                    InspectionHistory.objects.create(
                        inspection=inspection,
                        previous_status=prev_status,
                        new_status='SECTION_IN_PROGRESS',
                        changed_by=user,
                        remarks=f'No Monitoring Personnel found for law {inspection.law} in district {inspection.district}. Returned to Section Chief for inspection.'
                    )
                    
                    serializer = self.get_serializer(inspection)
                    return Response({
                        'message': f'No Monitoring Personnel found for law {inspection.law} in district {inspection.district}. Inspection returned to Section Chief for inspection.',
                        'inspection': serializer.data
                    })
            else:
                next_assignee = monitoring_query.first()
                if not next_assignee:
                    # Fallback: No Monitoring Personnel found, return to Section Chief for inspection
                    inspection.current_status = 'SECTION_IN_PROGRESS'
                    inspection.assigned_to = user
                    inspection.save()
                    
                    # Log history
                    InspectionHistory.objects.create(
                        inspection=inspection,
                        previous_status=prev_status,
                        new_status='SECTION_IN_PROGRESS',
                        changed_by=user,
                        remarks=f'No Monitoring Personnel found for law {inspection.law}. Returned to Section Chief for inspection.'
                    )
                    
                    serializer = self.get_serializer(inspection)
                    return Response({
                        'message': f'No Monitoring Personnel found for law {inspection.law}. Inspection returned to Section Chief for inspection.',
                        'inspection': serializer.data
                    })
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