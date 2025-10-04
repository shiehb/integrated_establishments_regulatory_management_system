from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Inspection, InspectionWorkflowHistory, InspectionLawAssignment
from .serializers import InspectionSerializer, WorkflowDecisionSerializer
from .regions import get_district_by_city, list_districts
from establishments.models import Establishment
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class InspectionViewSet(viewsets.ModelViewSet):
    queryset = Inspection.objects.select_related('establishment').all()
    serializer_class = InspectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """Override create to handle automatic assignment routing"""
        inspection = serializer.save(created_by=self.request.user)
        
        # Auto-assign based on user level and section
        user = self.request.user
        section = inspection.section
        
        # Determine district from establishment location
        establishment_district = self._get_establishment_district(inspection.establishment)
        if establishment_district:
            inspection.district = establishment_district
        
        if user.userlevel == "Division Chief":
            # Auto-assign Division Chief
            inspection.assigned_division_head = user
            inspection.status = "DIVISION_CREATED"
            inspection.current_assigned_to = user
            
            # Handle multiple law assignments
            assigned_laws = self._handle_law_assignments(inspection, section, establishment_district)
            
            # Auto-route to Section Chief based on law/section and district
            self._assign_section_chief(inspection, section)
            
            # Also assign other personnel based on district
            if establishment_district:
                self._assign_district_personnel(inspection, section, establishment_district)
                
        elif user.userlevel == "Legal Unit":
            # Auto-assign Legal Unit
            inspection.assigned_legal_unit = user
            inspection.status = "LEGAL_REVIEW"
            inspection.current_assigned_to = user
            
        inspection.save()
        
        # Record initial workflow history
        InspectionWorkflowHistory.objects.create(
            inspection=inspection,
            action='FORWARD' if user.userlevel == "Division Chief" else 'INSPECT',
            performed_by=user,
            comments=f"Inspection created by {user.userlevel}"
        )

    def _assign_section_chief(self, inspection, section):
        """Auto-assign Section Chief based on law/section and district"""
        # First try to find Section Chief in the same district
        if inspection.district:
            # Try exact section match first
            section_chief = User.objects.filter(
                userlevel='Section Chief',
                section=section,
                district=inspection.district,
                is_active=True
            ).first()
            
            if section_chief:
                inspection.assigned_section_chief = section_chief
                inspection.current_assigned_to = section_chief
                logger.info(f"Assigned Section Chief {section_chief.email} for {section} in district {inspection.district}")
                return
            
            # Try combined section match (for EIA, Air, Water combined)
            if section in ['PD-1586', 'RA-8749', 'RA-9275']:
                section_chief = User.objects.filter(
                    userlevel='Section Chief',
                    section='PD-1586,RA-8749,RA-9275',
                    district=inspection.district,
                    is_active=True
                ).first()
                
                if section_chief:
                    inspection.assigned_section_chief = section_chief
                    inspection.current_assigned_to = section_chief
                    logger.info(f"Assigned combined Section Chief {section_chief.email} for {section} in district {inspection.district}")
                    return
        
        # If no district-specific Section Chief found, find any active Section Chief for this section
        section_chief = User.objects.filter(
            userlevel='Section Chief',
            section=section,
            is_active=True
        ).first()
        
        if section_chief:
            inspection.assigned_section_chief = section_chief
            inspection.current_assigned_to = section_chief
            logger.info(f"Assigned Section Chief {section_chief.email} for {section} (no district-specific match)")
        else:
            # Try combined section match (for EIA, Air, Water combined)
            if section in ['PD-1586', 'RA-8749', 'RA-9275']:
                section_chief = User.objects.filter(
                    userlevel='Section Chief',
                    section='PD-1586,RA-8749,RA-9275',
                    is_active=True
                ).first()
                
                if section_chief:
                    inspection.assigned_section_chief = section_chief
                    inspection.current_assigned_to = section_chief
                    logger.info(f"Assigned combined Section Chief {section_chief.email} for {section} (no district-specific match)")
                else:
                    logger.warning(f"No Section Chief found for section {section} or combined section")
            else:
                logger.warning(f"No Section Chief found for section {section}")

    def _find_section_chief_for_law(self, law, district=None):
        """Find the appropriate Section Chief for a given law"""
        
        # Map laws to section values
        law_to_section_map = {
            "PD-1586": "PD-1586",  # EIA
            "RA-8749": "RA-8749",  # Air Quality
            "RA-9275": "RA-9275",  # Water Quality
            "RA-6969": "RA-6969",  # Toxic Chemicals
            "RA-9003": "RA-9003",  # Solid Waste
            # Handle combined section for general EIA/Air/Water management
            "PD-1586,RA-8749,RA-9275": "PD-1586,RA-8749,RA-9275"
        }
        
        section_value = law_to_section_map.get(law)
        if not section_value:
            logger.warning(f"No section mapping found for law: {law}")
            return None
        
        # Find active Section Chief for this law
        query = User.objects.filter(
            userlevel="Section Chief",
            section=section_value,
            is_active=True
        )
        
        # If district is specified, prioritize Section Chiefs in that district
        if district:
            # First try to find Section Chief in the same district
            district_chief = query.filter(district=district).first()
            if district_chief:
                logger.info(f"Found Section Chief in same district: {district_chief.email}")
                return district_chief
            
            # If no district-specific chief, find any active Section Chief for this law
            logger.info(f"No Section Chief found in district {district}, looking for any active Section Chief for law {law}")
        
        # Find any active Section Chief for this law
        section_chief = query.first()
        if section_chief:
            logger.info(f"Found Section Chief for law {law}: {section_chief.email}")
        else:
            logger.warning(f"No active Section Chief found for law: {law}")
            
        return section_chief

    def _get_establishment_district(self, establishment):
        """Get district based on establishment's province and city"""
        from .regions import get_district_by_city
        
        province = establishment.province
        city = establishment.city
        
        # Get district from city
        district = get_district_by_city(province, city)
        
        if district:
            # Format as "Province - District" to match User.DISTRICT_CHOICES
            formatted_district = f"{province} - {district}"
            logger.info(f"Establishment {establishment.name} ({city}, {province}) mapped to district: {formatted_district}")
            return formatted_district
        else:
            logger.warning(f"No district found for establishment {establishment.name} in {city}, {province}")
            return None

    def _assign_district_personnel(self, inspection, section, district):
        """Assign Section Chief, Unit Head, and Monitoring Personnel based on district"""
        from users.models import User
        
        if not district:
            logger.warning(f"No district available for assignment, skipping personnel assignment")
            return
        
        # Map laws to section values
        law_to_section_map = {
            "PD-1586": "PD-1586",  # EIA
            "RA-8749": "RA-8749",  # Air Quality
            "RA-9275": "RA-9275",  # Water Quality
            "RA-6969": "RA-6969",  # Toxic Chemicals
            "RA-9003": "RA-9003",  # Solid Waste
            "PD-1586,RA-8749,RA-9275": "PD-1586,RA-8749,RA-9275"  # Combined
        }
        
        section_value = law_to_section_map.get(section)
        if not section_value:
            logger.warning(f"No section mapping found for law: {section}")
            return
        
        # Assign Section Chief for this law in this district
        section_chief = User.objects.filter(
            userlevel="Section Chief",
            section=section_value,
            district=district,
            is_active=True
        ).first()
        
        if section_chief:
            inspection.assigned_section_chief = section_chief
            logger.info(f"Assigned Section Chief {section_chief.email} for {section} in {district}")
        else:
            # Try combined section match (for EIA, Air, Water combined)
            if section_value in ['PD-1586', 'RA-8749', 'RA-9275']:
                section_chief = User.objects.filter(
                    userlevel="Section Chief",
                    section='PD-1586,RA-8749,RA-9275',
                    district=district,
                    is_active=True
                ).first()
                
                if section_chief:
                    inspection.assigned_section_chief = section_chief
                    logger.info(f"Assigned combined Section Chief {section_chief.email} for {section} in {district}")
                else:
                    logger.warning(f"No Section Chief found for {section} or combined section in district {district}")
            else:
                logger.warning(f"No Section Chief found for {section} in district {district}")
        
        # Assign Unit Head for this law in this district (if applicable)
        if section_value in ["PD-1586", "RA-8749", "RA-9275"]:  # EIA, Air, Water have Unit Heads
            unit_head = User.objects.filter(
                userlevel="Unit Head",
                section=section_value,
                district=district,
                is_active=True
            ).first()
            
            if unit_head:
                inspection.assigned_unit_head = unit_head
                logger.info(f"Assigned Unit Head {unit_head.email} for {section} in {district}")
            else:
                logger.warning(f"No Unit Head found for {section} in district {district}")
        
        # Assign Monitoring Personnel for this law in this district
        monitoring_personnel = User.objects.filter(
            userlevel="Monitoring Personnel",
            section=section_value,
            district=district,
            is_active=True
        ).first()
        
        if monitoring_personnel:
            inspection.assigned_monitor = monitoring_personnel
            logger.info(f"Assigned Monitoring Personnel {monitoring_personnel.email} for {section} in {district}")
        else:
            logger.warning(f"No Monitoring Personnel found for {section} in district {district}")

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        
        # Get tab parameter for structured filtering
        tab = self.request.query_params.get('tab')
        
        # Role-based filtering with tab support
        if getattr(user, 'userlevel', '') == 'Admin':
            # Can see all
            pass
        elif getattr(user, 'userlevel', '') == 'Legal Unit':
            qs = qs.filter(assigned_legal_unit=user) | qs.filter(status='LEGAL_REVIEW')
        elif getattr(user, 'userlevel', '') == 'Division Chief':
            qs = qs.filter(assigned_division_head=user) | qs.filter(status='DIVISION_CREATED')
        elif getattr(user, 'userlevel', '') == 'Section Chief':
            qs = self._filter_section_chief_tabs(qs, user, tab)
        elif getattr(user, 'userlevel', '') == 'Unit Head':
            qs = self._filter_unit_head_tabs(qs, user, tab)
        elif getattr(user, 'userlevel', '') == 'Monitoring Personnel':
            qs = qs.filter(assigned_monitor=user) | qs.filter(status__in=['MONITORING_ASSIGN', 'MONITORING_INSPECTION'])

        # Query param filters
        district = self.request.query_params.get('district')
        section = self.request.query_params.get('section')
        status = self.request.query_params.get('status')
        search = self.request.query_params.get('search')
        
        if district:
            qs = qs.filter(district=district)
        if section:
            qs = qs.filter(section=section)
        if status:
            qs = qs.filter(status=status)
            
        # Search functionality
        if search:
            qs = qs.filter(
                Q(code__icontains=search) |
                Q(establishment__name__icontains=search) |
                Q(establishment__city__icontains=search) |
                Q(establishment__province__icontains=search) |
                Q(section__icontains=search) |
                Q(status__icontains=search) |
                Q(current_assigned_to__first_name__icontains=search) |
                Q(current_assigned_to__last_name__icontains=search) |
                Q(workflow_comments__icontains=search)
            )
        
        return qs.order_by('-created_at')

    def _filter_section_chief_tabs(self, qs, user, tab):
        """Filter inspections for Section Chief based on tab"""
        if tab == 'created_inspections':
            # Tab 1: Created Inspections (from Division Chief)
            return qs.filter(
                assigned_section_chief=user,
                status='SECTION_REVIEW',
                section_chief_decision__isnull=True
            )
        elif tab == 'my_inspections':
            # Tab 2: My Inspections (after Inspect button)
            return qs.filter(
                assigned_section_chief=user,
                status__in=['SECTION_INSPECTING', 'COMPLETED'],
                section_chief_decision='INSPECT'
            )
        elif tab == 'forwarded_list':
            # Tab 3: Forwarded List (inspections forwarded to Unit Head/Monitoring)
            return qs.filter(
                assigned_section_chief=user,
                section_chief_decision__in=['FORWARD_TO_UNIT', 'FORWARD_TO_MONITORING'],
                status__in=['UNIT_REVIEW', 'MONITORING_ASSIGN', 'MONITORING_INSPECTION']
            )
        else:
            # Default: show all assigned to this Section Chief
            return qs.filter(assigned_section_chief=user)

    def _filter_unit_head_tabs(self, qs, user, tab):
        """Filter inspections for Unit Head based on tab"""
        if tab == 'received_from_section':
            # Tab 1: Received from Section
            return qs.filter(
                assigned_unit_head=user,
                status='UNIT_REVIEW',
                unit_head_decision__isnull=True
            )
        elif tab == 'my_inspections':
            # Tab 2: My Inspections (after Inspect button)
            return qs.filter(
                assigned_unit_head=user,
                status__in=['UNIT_INSPECTING', 'COMPLETED'],
                unit_head_decision='INSPECT'
            )
        elif tab == 'forwarded_list':
            # Tab 3: Forwarded List (inspections forwarded to Monitoring)
            return qs.filter(
                assigned_unit_head=user,
                unit_head_decision='FORWARD_TO_MONITORING',
                status__in=['MONITORING_ASSIGN', 'MONITORING_INSPECTION']
            )
        else:
            # Default: show all assigned to this Unit Head
            return qs.filter(assigned_unit_head=user)

    def list(self, request, *args, **kwargs):
        # Get pagination parameters
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        # Get filtered queryset
        queryset = self.filter_queryset(self.get_queryset())
        
        # Calculate pagination
        total_count = queryset.count()
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        
        # Apply pagination
        inspections = queryset[start_index:end_index]
        
        # Serialize data
        serializer = self.get_serializer(inspections, many=True)
        
        # Return paginated response
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size,
            'results': serializer.data
        })

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Dedicated search endpoint with debouncing support"""
        search_query = request.query_params.get('q', '').strip()
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        if not search_query or len(search_query) < 2:
            return Response({
                'count': 0,
                'page': page,
                'page_size': page_size,
                'total_pages': 0,
                'results': []
            })
        
        # Apply search filters
        queryset = self.get_queryset().filter(
            Q(code__icontains=search_query) |
            Q(establishment__name__icontains=search_query) |
            Q(establishment__city__icontains=search_query) |
            Q(establishment__province__icontains=search_query) |
            Q(section__icontains=search_query) |
            Q(status__icontains=search_query) |
            Q(current_assigned_to__first_name__icontains=search_query) |
            Q(current_assigned_to__last_name__icontains=search_query) |
            Q(workflow_comments__icontains=search_query)
        )
        
        # Calculate pagination
        total_count = queryset.count()
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        
        # Apply pagination
        inspections = queryset[start_index:end_index]
        
        # Serialize data
        serializer = self.get_serializer(inspections, many=True)
        
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size,
            'search_query': search_query,
            'results': serializer.data
        })

    @action(detail=False, methods=['get'])
    def search_suggestions(self, request):
        """Quick search suggestions for autocomplete"""
        search_query = request.query_params.get('q', '').strip()
        
        if not search_query or len(search_query) < 2:
            return Response({'suggestions': []})
        
        queryset = self.get_queryset().filter(
            Q(code__icontains=search_query) |
            Q(establishment__name__icontains=search_query) |
            Q(section__icontains=search_query)
        )[:5]  # Limit to 5 suggestions
        
        suggestions = []
        for inspection in queryset:
            suggestions.append({
                'id': inspection.id,
                'code': inspection.code,
                'establishment_name': inspection.establishment.name if inspection.establishment else '',
                'section': inspection.section,
                'type': 'inspection'
            })
        
        return Response({'suggestions': suggestions})



    @action(detail=True, methods=['post'])
    def make_decision(self, request, pk=None):
        """Make a workflow decision (inspect/forward/complete)"""
        inspection = self.get_object()
        serializer = WorkflowDecisionSerializer(data=request.data)
        
        if serializer.is_valid():
            action = serializer.validated_data['action']
            comments = serializer.validated_data.get('comments', '')
            
            # Get compliance-related data for monitoring personnel
            compliance_status = request.data.get('compliance_status')
            violations_found = request.data.get('violations_found')
            compliance_notes = request.data.get('compliance_notes')
            
            success, message = inspection.make_decision(
                user=request.user,
                action=action,
                comments=comments,
                compliance_status=compliance_status,
                violations_found=violations_found,
                compliance_notes=compliance_notes
            )
            
            if success:
                # Handle return path advancement for compliant/non-compliant inspections
                if inspection.status in ['COMPLIANT_COMPLETE', 'NON_COMPLIANT_RETURN']:
                    inspection.advance_return_path(request.user)
                
                return Response({
                    'message': message,
                    'inspection': InspectionSerializer(inspection, context={'request': request}).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': message
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def advance_return_path(self, request, pk=None):
        """Advance inspection through return path (for compliant/non-compliant cases)"""
        inspection = self.get_object()
        
        # Check if user can act on this inspection
        if not inspection.can_user_act(request.user):
            return Response({
                'error': 'User cannot act on this inspection'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if inspection is in return path status
        if inspection.status not in ['COMPLIANT_COMPLETE', 'NON_COMPLIANT_RETURN']:
            return Response({
                'error': 'Inspection is not in return path status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Advance the return path
        inspection.advance_return_path(request.user)
        
        return Response({
            'message': 'Return path advanced successfully',
            'inspection': InspectionSerializer(inspection, context={'request': request}).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def send_notice_of_violation(self, request, pk=None):
        """Send Notice of Violation (NOV) to establishment"""
        inspection = self.get_object()
        
        # Check if user is Legal Unit and can act on this inspection
        if request.user.userlevel != 'Legal Unit' or not inspection.can_user_act(request.user):
            return Response({
                'error': 'Only Legal Unit can send Notice of Violation'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if inspection is in legal review status
        if inspection.status != 'LEGAL_REVIEW':
            return Response({
                'error': 'Inspection must be in Legal Review status to send NOV'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get NOV details from request
        violations = request.data.get('violations', '')
        compliance_instructions = request.data.get('compliance_instructions', '')
        required_office_visit = request.data.get('required_office_visit', False)
        compliance_deadline = request.data.get('compliance_deadline', '')
        
        # Update inspection with NOV details
        inspection.notice_of_violation_sent = True
        inspection.legal_unit_comments = f"Notice of Violation sent. Violations: {violations}. Instructions: {compliance_instructions}"
        inspection.compliance_deadline = compliance_deadline if compliance_deadline else None
        
        # Record workflow history
        InspectionWorkflowHistory.objects.create(
            inspection=inspection,
            action='SEND_NOV',
            performed_by=request.user,
            comments=f"Notice of Violation sent to {inspection.establishment.name}. Violations: {violations}"
        )
        
        inspection.save()
        
        return Response({
            'message': 'Notice of Violation sent successfully',
            'inspection': InspectionSerializer(inspection, context={'request': request}).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def send_notice_of_order(self, request, pk=None):
        """Send Notice of Order (NOO) to establishment"""
        inspection = self.get_object()
        
        # Check if user is Legal Unit and can act on this inspection
        if request.user.userlevel != 'Legal Unit' or not inspection.can_user_act(request.user):
            return Response({
                'error': 'Only Legal Unit can send Notice of Order'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if inspection is in legal review status
        if inspection.status != 'LEGAL_REVIEW':
            return Response({
                'error': 'Inspection must be in Legal Review status to send NOO'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get NOO details from request
        penalty_fees = request.data.get('penalty_fees', '')
        violation_breakdown = request.data.get('violation_breakdown', '')
        deadlines = request.data.get('deadlines', '')
        
        # Update inspection with NOO details
        inspection.notice_of_order_sent = True
        inspection.penalties_imposed = penalty_fees
        inspection.legal_unit_comments = f"Notice of Order sent. Penalties: {penalty_fees}. Breakdown: {violation_breakdown}"
        
        # Record workflow history
        InspectionWorkflowHistory.objects.create(
            inspection=inspection,
            action='SEND_NOO',
            performed_by=request.user,
            comments=f"Notice of Order sent to {inspection.establishment.name}. Penalties: {penalty_fees}"
        )
        
        inspection.save()
        
        return Response({
            'message': 'Notice of Order sent successfully',
            'inspection': InspectionSerializer(inspection, context={'request': request}).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def close_case(self, request, pk=None):
        """Close case by Legal Unit"""
        inspection = self.get_object()
        
        # Check if user is Legal Unit and can act on this inspection
        if request.user.userlevel != 'Legal Unit' or not inspection.can_user_act(request.user):
            return Response({
                'error': 'Only Legal Unit can close cases'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if inspection is in legal review status
        if inspection.status != 'LEGAL_REVIEW':
            return Response({
                'error': 'Inspection must be in Legal Review status to close case'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get closure details from request
        closure_reason = request.data.get('closure_reason', 'Case closed by Legal Unit')
        
        # Update inspection status
        inspection.status = 'COMPLETED'
        inspection.legal_unit_comments = f"Case closed. Reason: {closure_reason}"
        
        # Record workflow history
        InspectionWorkflowHistory.objects.create(
            inspection=inspection,
            action='CLOSE_CASE',
            performed_by=request.user,
            comments=f"Case closed for {inspection.establishment.name}. Reason: {closure_reason}"
        )
        
        inspection.save()
        
        return Response({
            'message': 'Case closed successfully',
            'inspection': InspectionSerializer(inspection, context={'request': request}).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def update_compliance(self, request, pk=None):
        """Update compliance status and tracking information"""
        inspection = self.get_object()
        
        # Check if user can act on this inspection
        if not inspection.can_user_act(request.user):
            return Response({
                'error': 'User cannot act on this inspection'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get compliance data from request
        compliance_status = request.data.get('compliance_status')
        violations_found = request.data.get('violations_found', '')
        compliance_notes = request.data.get('compliance_notes', '')
        compliance_plan = request.data.get('compliance_plan', '')
        compliance_deadline = request.data.get('compliance_deadline')
        
        # Update inspection with compliance data
        if compliance_status:
            inspection.compliance_status = compliance_status
        if violations_found:
            inspection.violations_found = violations_found
        if compliance_notes:
            inspection.compliance_notes = compliance_notes
        if compliance_plan:
            inspection.compliance_plan = compliance_plan
        if compliance_deadline:
            inspection.compliance_deadline = compliance_deadline
        
        # Record workflow history
        InspectionWorkflowHistory.objects.create(
            inspection=inspection,
            action='UPDATE_COMPLIANCE',
            performed_by=request.user,
            comments=f"Compliance status updated to {compliance_status}. Notes: {compliance_notes}"
        )
        
        inspection.save()
        
        return Response({
            'message': 'Compliance status updated successfully',
            'inspection': InspectionSerializer(inspection, context={'request': request}).data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def workflow_history(self, request, pk=None):
        """Get workflow history for an inspection"""
        inspection = self.get_object()
        history = inspection.workflow_history.all()
        
        history_data = []
        for h in history:
            history_data.append({
                'id': h.id,
                'action': h.action,
                'performed_by': {
                    'id': h.performed_by.id,
                    'name': f"{h.performed_by.first_name} {h.performed_by.last_name}".strip() or h.performed_by.email,
                    'userlevel': h.performed_by.userlevel
                },
                'comments': h.comments,
                'timestamp': h.timestamp
            })
        
        return Response(history_data)

    @action(detail=False, methods=['get'])
    def available_personnel(self, request):
        """Get available personnel for assignment based on filters"""
        section = request.query_params.get('section')
        district = request.query_params.get('district')
        userlevel = request.query_params.get('userlevel')
        
        queryset = User.objects.filter(is_active=True)
        
        if section:
            queryset = queryset.filter(section=section)
        if district:
            queryset = queryset.filter(district=district)
        if userlevel:
            queryset = queryset.filter(userlevel=userlevel)
        
        personnel_data = []
        for user in queryset:
            personnel_data.append({
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}".strip() or user.email,
                'email': user.email,
                'userlevel': user.userlevel,
                'section': user.section,
                'district': user.district
            })
        
        return Response(personnel_data)

    @action(detail=False, methods=['get'])
    def tab_counts(self, request):
        """Get tab counts for Section Chief and Unit Head dashboards"""
        user = request.user
        user_level = getattr(user, 'userlevel', '')
        
        if user_level == 'Section Chief':
            counts = {
                'created_inspections': Inspection.objects.filter(
                    current_assigned_to=user,
                    status__in=['DIVISION_CREATED', 'SECTION_ASSIGNED']
                ).count(),
                'my_inspections': Inspection.objects.filter(
                    current_assigned_to=user,
                    status='SECTION_IN_PROGRESS'
                ).count(),
                'forwarded_list': Inspection.objects.filter(
                    assigned_section_chief=user,
                    status__in=['UNIT_ASSIGNED', 'UNIT_IN_PROGRESS', 'UNIT_COMPLETED', 'MONITORING_ASSIGN', 'MONITORING_IN_PROGRESS', 'MONITORING_COMPLETED_COMPLIANT', 'NON_COMPLIANT_RETURN', 'LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT']
                ).count(),
                'review_list': Inspection.objects.filter(
                    current_assigned_to=user,
                    status='SECTION_REVIEWED'
                ).count()
            }
        elif user_level == 'Unit Head':
            counts = {
                'received_inspections': Inspection.objects.filter(
                    current_assigned_to=user,
                    status='UNIT_ASSIGNED'
                ).count(),
                'my_inspections': Inspection.objects.filter(
                    current_assigned_to=user,
                    status='UNIT_IN_PROGRESS'
                ).count(),
                'forwarded_list': Inspection.objects.filter(
                    assigned_unit_head=user,
                    status__in=['MONITORING_ASSIGN', 'MONITORING_IN_PROGRESS', 'MONITORING_COMPLETED_COMPLIANT', 'NON_COMPLIANT_RETURN']
                ).count(),
                'review_list': Inspection.objects.filter(
                    current_assigned_to=user,
                    status='UNIT_REVIEWED'
                ).count()
            }
        elif user_level == 'Monitoring Personnel':
            counts = {
                'assigned_inspections': Inspection.objects.filter(
                    current_assigned_to=user,
                    status__in=['MONITORING_ASSIGN', 'MONITORING_IN_PROGRESS']
                ).count()
            }
        elif user_level == 'Legal Unit':
            counts = {
                'legal_review': Inspection.objects.filter(
                    current_assigned_to=user,
                    status__in=['LEGAL_REVIEW', 'NOV_SENT', 'NOO_SENT']
                ).count()
            }
        elif user_level == 'Division Chief':
            counts = {
                'create_inspection': 0,  # This is a form tab, not a list
                'review_list': Inspection.objects.filter(
                    current_assigned_to=user,
                    status='DIVISION_REVIEWED'
                ).count()
            }
        else:
            counts = {}
        
        return Response({
            'user_level': user_level,
            'tab_counts': counts
        })

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        inspection = self.get_object()
        legal_unit_id = request.data.get('legal_unit_id')
        division_head_id = request.data.get('division_head_id')
        section_chief_id = request.data.get('section_chief_id')
        unit_head_id = request.data.get('unit_head_id')
        monitor_id = request.data.get('monitor_id')
        district = request.data.get('district')

        if legal_unit_id:
            inspection.assigned_legal_unit = User.objects.filter(pk=legal_unit_id).first()
        if division_head_id:
            inspection.assigned_division_head = User.objects.filter(pk=division_head_id).first()
        if section_chief_id:
            inspection.assigned_section_chief = User.objects.filter(pk=section_chief_id).first()
        if unit_head_id:
            inspection.assigned_unit_head = User.objects.filter(pk=unit_head_id).first()
        if monitor_id:
            inspection.assigned_monitor = User.objects.filter(pk=monitor_id).first()

        # Auto-pick personnel by district/section when IDs not provided
        if district:
            qs = User.objects.filter(is_active=True, district=district)
            if inspection.section:
                qs = qs.filter(section=inspection.section)
            
            if not legal_unit_id:
                lu = qs.filter(userlevel='Legal Unit').first()
                if lu:
                    inspection.assigned_legal_unit = lu
            if not division_head_id:
                dh = qs.filter(userlevel='Division Chief').first()
                if dh:
                    inspection.assigned_division_head = dh
            if not section_chief_id:
                sc = qs.filter(userlevel='Section Chief').first()
                if sc:
                    inspection.assigned_section_chief = sc
            if not unit_head_id:
                uh = qs.filter(userlevel='Unit Head').first()
                if uh:
                    inspection.assigned_unit_head = uh
            if not monitor_id:
                mp = qs.filter(userlevel='Monitoring Personnel').first()
                if mp:
                    inspection.assigned_monitor = mp

        if district:
            inspection.district = district
        
        inspection.save()
        return Response(self.get_serializer(inspection).data)

    @action(detail=True, methods=['post'])
    def advance(self, request, pk=None):
        """Advance the inspection to the next status in the workflow"""
        inspection = self.get_object()
        comments = request.data.get('comments', '')
        
        if inspection.advance_status(self.request.user, comments):
            return Response(self.get_serializer(inspection).data)
        else:
            return Response({'detail': 'Cannot advance this inspection'}, status=400)

    @action(detail=True, methods=['post'])
    def legal_review(self, request, pk=None):
        """Legal unit reviews and creates billing record or compliance call"""
        inspection = self.get_object()
        if not inspection.can_user_act(self.request.user):
            return Response({'detail': 'You cannot act on this inspection'}, status=403)
        
        billing_record = request.data.get('billing_record')
        compliance_call = request.data.get('compliance_call')
        comments = request.data.get('comments', '')
        
        if billing_record:
            inspection.billing_record = billing_record
        if compliance_call:
            inspection.compliance_call = compliance_call
        if comments:
            inspection.workflow_comments = comments
            
        inspection.advance_status(self.request.user, comments)
        return Response(self.get_serializer(inspection).data)

    @action(detail=True, methods=['post'])
    def division_create(self, request, pk=None):
        """Division head creates inspection list and applicable laws"""
        inspection = self.get_object()
        if not inspection.can_user_act(self.request.user):
            return Response({'detail': 'You cannot act on this inspection'}, status=403)
        
        inspection_list = request.data.get('inspection_list')
        applicable_laws = request.data.get('applicable_laws')
        comments = request.data.get('comments', '')
        
        if inspection_list:
            inspection.inspection_list = inspection_list
        if applicable_laws:
            inspection.applicable_laws = applicable_laws
        if comments:
            inspection.workflow_comments = comments
            
        inspection.advance_status(self.request.user, comments)
        return Response(self.get_serializer(inspection).data)

    @action(detail=True, methods=['post'])
    def section_review(self, request, pk=None):
        """Section chief reviews and forwards"""
        inspection = self.get_object()
        if not inspection.can_user_act(self.request.user):
            return Response({'detail': 'You cannot act on this inspection'}, status=403)
        
        comments = request.data.get('comments', '')
        inspection.workflow_comments = comments
        inspection.advance_status(self.request.user, comments)
        return Response(self.get_serializer(inspection).data)

    @action(detail=True, methods=['post'])
    def forward_to_another_section(self, request, pk=None):
        """EIA, Air, Water section chiefs can forward establishment to another section chief"""
        inspection = self.get_object()
        
        # Check if user is a section chief
        if request.user.userlevel != 'Section Chief':
            return Response({'error': 'Only Section Chiefs can forward to another section'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user can act on this inspection
        if not inspection.can_user_act(request.user):
            return Response({'detail': 'You cannot act on this inspection'}, status=403)
        
        # Check if this is an EIA, Air, or Water section chief
        if inspection.section not in ['PD-1586', 'RA-8749', 'RA-9275']:
            return Response({'error': 'Only EIA, Air, and Water section chiefs can forward to another section'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get the target section chief ID from request
        target_section_chief_id = request.data.get('target_section_chief_id')
        if not target_section_chief_id:
            return Response({'error': 'target_section_chief_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find the target section chief
        try:
            target_section_chief = User.objects.get(
                id=target_section_chief_id,
                userlevel='Section Chief',
                is_active=True
            )
        except User.DoesNotExist:
            return Response({'error': 'Target section chief not found or inactive'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get comments
        comments = request.data.get('comments', '')
        
        # Record the decision
        inspection.section_chief_decision = 'FORWARD_TO_ANOTHER_SECTION'
        inspection.section_chief_decision_date = timezone.now()
        inspection.section_chief_comments = comments
        inspection.workflow_comments = comments
        
        # Reassign to the target section chief
        inspection.assigned_section_chief = target_section_chief
        inspection.current_assigned_to = target_section_chief
        # Keep status as SECTION_REVIEW since it's still with a section chief
        
        inspection.save()
        
        # Record in workflow history
        InspectionWorkflowHistory.objects.create(
            inspection=inspection,
            action='FORWARD_TO_ANOTHER_SECTION',
            performed_by=request.user,
            comments=f"Forwarded to {target_section_chief.email} - {comments}"
        )
        
        return Response({
            'message': f'Inspection successfully forwarded to {target_section_chief.email}',
            'inspection': self.get_serializer(inspection).data
        })

    @action(detail=True, methods=['get'])
    def available_section_chiefs(self, request, pk=None):
        """Get available section chiefs that the current section chief can forward to"""
        inspection = self.get_object()
        
        # Check if user is a section chief
        if request.user.userlevel != 'Section Chief':
            return Response({'error': 'Only Section Chiefs can view available section chiefs'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user can act on this inspection
        if not inspection.can_user_act(request.user):
            return Response({'detail': 'You cannot act on this inspection'}, status=403)
        
        # Check if this is an EIA, Air, or Water section chief
        if inspection.section not in ['PD-1586', 'RA-8749', 'RA-9275']:
            return Response({'error': 'Only EIA, Air, and Water section chiefs can forward to another section'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all active section chiefs except the current one
        available_chiefs = User.objects.filter(
            userlevel='Section Chief',
            is_active=True
        ).exclude(id=request.user.id)
        
        # If there's a district, prioritize section chiefs in the same district
        if inspection.district:
            district_chiefs = available_chiefs.filter(district=inspection.district)
            other_chiefs = available_chiefs.exclude(district=inspection.district)
            
            # Combine with district chiefs first
            available_chiefs = list(district_chiefs) + list(other_chiefs)
        else:
            available_chiefs = list(available_chiefs)
        
        chiefs_data = []
        for chief in available_chiefs:
            chiefs_data.append({
                'id': chief.id,
                'name': f"{chief.first_name} {chief.last_name}".strip() or chief.email,
                'email': chief.email,
                'section': chief.section,
                'district': chief.district,
                'is_same_district': chief.district == inspection.district if inspection.district else False
            })
        
        return Response({
            'available_section_chiefs': chiefs_data,
            'current_inspection': {
                'id': inspection.id,
                'code': inspection.code,
                'section': inspection.section,
                'district': inspection.district,
                'establishment': inspection.establishment.name
            }
        })

    @action(detail=True, methods=['post'])
    def forward_to_monitoring(self, request, pk=None):
        """
        Forward inspection to monitoring personnel with auto-assignment based on district and law
        """
        try:
            inspection = self.get_object()
            user = request.user
            
            # Validate user level
            if user.userlevel != 'Unit Head':
                return Response({
                    'error': 'Only Unit Heads can forward to monitoring personnel'
                }, status=403)
            
            # Get target monitor ID and comments from request
            target_monitor_id = request.data.get('target_monitor_id')
            comments = request.data.get('comments', '')
            
            if not target_monitor_id:
                return Response({
                    'error': 'Target monitoring personnel ID is required'
                }, status=400)
            
            # Find the monitoring personnel
            try:
                target_monitor = User.objects.get(
                    id=target_monitor_id,
                    userlevel='Monitoring Personnel',
                    is_active=True
                )
            except User.DoesNotExist:
                return Response({
                    'error': 'Target monitoring personnel not found or inactive'
                }, status=404)
            
            # Validate that the monitoring personnel is appropriate for this inspection
            if (target_monitor.district != inspection.district or 
                target_monitor.section != inspection.section):
                return Response({
                    'error': f'Monitoring personnel {target_monitor.email} is not assigned to district {inspection.district} for law {inspection.section}'
                }, status=400)
            
            # Update inspection
            inspection.assigned_monitor = target_monitor
            inspection.status = 'MONITORING_INSPECTION'
            inspection.workflow_comments = comments or f'Forwarded to monitoring personnel: {target_monitor.email}'
            inspection.save()
            
            # Create workflow history entry
            InspectionWorkflowHistory.objects.create(
                inspection=inspection,
                user=user,
                action='FORWARD_TO_MONITORING_PERSONNEL',
                comments=comments or f'Forwarded to monitoring personnel: {target_monitor.email}',
                timestamp=timezone.now()
            )
            
            # Send notification to monitoring personnel
            try:
                send_mail(
                    subject=f'New Inspection Assignment: {inspection.code}',
                    message=f'You have been assigned a new inspection: {inspection.code} for establishment {inspection.establishment.name} in {inspection.establishment.city}, {inspection.establishment.province}.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[target_monitor.email],
                    fail_silently=True
                )
            except Exception as e:
                logger.warning(f"Failed to send notification to monitoring personnel {target_monitor.email}: {e}")
            
            return Response({
                'message': f'Inspection forwarded to monitoring personnel {target_monitor.email} successfully',
                'inspection': {
                    'id': inspection.id,
                    'code': inspection.code,
                    'status': inspection.status,
                    'assigned_monitor': {
                        'id': target_monitor.id,
                        'email': target_monitor.email,
                        'name': target_monitor.name
                    }
                }
            })
            
        except Exception as e:
            logger.error(f"Error forwarding inspection to monitoring personnel: {e}")
            return Response({
                'error': 'Failed to forward inspection to monitoring personnel'
            }, status=500)

    @action(detail=False, methods=['get'])
    def available_monitoring_personnel(self, request):
        """
        Get available monitoring personnel for auto-assignment
        """
        try:
            user = request.user
            
            # Validate user level
            if user.userlevel != 'Unit Head':
                return Response({
                    'error': 'Only Unit Heads can view available monitoring personnel'
                }, status=403)
            
            # Get district and section from query parameters
            district = request.query_params.get('district')
            section = request.query_params.get('section')
            
            if not district or not section:
                return Response({
                    'error': 'District and section parameters are required'
                }, status=400)
            
            # Find monitoring personnel for the specific district and section
            monitoring_personnel = User.objects.filter(
                userlevel='Monitoring Personnel',
                district=district,
                section=section,
                is_active=True
            ).order_by('name')
            
            # Format response
            personnel_data = []
            for person in monitoring_personnel:
                personnel_data.append({
                    'id': person.id,
                    'name': person.name,
                    'email': person.email,
                    'district': person.district,
                    'section': person.section
                })
            
            return Response({
                'message': 'Available monitoring personnel retrieved successfully',
                'monitoring_personnel': personnel_data
            })
            
        except Exception as e:
            logger.error(f"Error retrieving available monitoring personnel: {e}")
            return Response({
                'error': 'Failed to retrieve available monitoring personnel'
            }, status=500)

    @action(detail=True, methods=['post'])
    def unit_review(self, request, pk=None):
        """Unit head reviews and forwards"""
        inspection = self.get_object()
        if not inspection.can_user_act(self.request.user):
            return Response({'detail': 'You cannot act on this inspection'}, status=403)
        
        comments = request.data.get('comments', '')
        inspection.workflow_comments = comments
        inspection.advance_status(self.request.user, comments)
        return Response(self.get_serializer(inspection).data)

    @action(detail=True, methods=['post'])
    def monitoring_inspection(self, request, pk=None):
        """Monitoring personnel conducts final inspection"""
        inspection = self.get_object()
        if not inspection.can_user_act(self.request.user):
            return Response({'detail': 'You cannot act on this inspection'}, status=403)
        
        inspection_notes = request.data.get('inspection_notes')
        comments = request.data.get('comments', '')
        
        if inspection_notes:
            inspection.inspection_notes = inspection_notes
        if comments:
            inspection.workflow_comments = comments
            
        inspection.advance_status(self.request.user, comments)
        return Response(self.get_serializer(inspection).data)

    @action(detail=False, methods=['get'])
    def districts(self, request):
        province = request.query_params.get('province')
        return Response(list_districts(province))

    @action(detail=False, methods=['get'])
    def assignable_users(self, request):
        # Filter users by district and optional role
        district = request.query_params.get('district')
        role = request.query_params.get('role')  # Legal Unit, Division Chief, Section Chief, Unit Head, Monitoring Personnel
        if not district:
            return Response({'detail': 'district query param is required'}, status=400)
        qs = User.objects.filter(district=district, is_active=True)
        if role:
            qs = qs.filter(userlevel=role)
        users = qs.values('id', 'first_name', 'last_name', 'email', 'userlevel', 'section', 'district')
        return Response(list(users))

    @action(detail=True, methods=['get'])
    def law_assignments(self, request, pk=None):
        """Get law assignments for an inspection"""
        inspection = self.get_object()
        assignments = inspection.law_assignments.all()
        
        assignment_data = []
        for assignment in assignments:
            assignment_data.append({
                'id': assignment.id,
                'law_code': assignment.law_code,
                'law_name': assignment.law_name,
                'assigned_to_section_chief': {
                    'id': assignment.assigned_to_section_chief.id if assignment.assigned_to_section_chief else None,
                    'name': f"{assignment.assigned_to_section_chief.first_name} {assignment.assigned_to_section_chief.last_name}".strip() if assignment.assigned_to_section_chief else None,
                    'email': assignment.assigned_to_section_chief.email if assignment.assigned_to_section_chief else None,
                    'section': assignment.assigned_to_section_chief.section if assignment.assigned_to_section_chief else None,
                    'district': assignment.assigned_to_section_chief.district if assignment.assigned_to_section_chief else None
                } if assignment.assigned_to_section_chief else None,
                'created_at': assignment.created_at
            })
        
        return Response(assignment_data)

    @action(detail=True, methods=['post'])
    def assign_multiple_laws(self, request, pk=None):
        """Manually assign multiple laws to an inspection"""
        inspection = self.get_object()
        laws_to_assign = request.data.get('laws', [])
        
        if not laws_to_assign:
            return Response({'error': 'No laws provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Clear existing law assignments for this inspection
        inspection.law_assignments.all().delete()
        
        # Create new law assignments
        created_assignments = []
        for law_data in laws_to_assign:
            law_code = law_data.get('law_code')
            section_chief_id = law_data.get('section_chief_id')
            
            if not law_code:
                continue
                
            # Find section chief if provided
            section_chief = None
            if section_chief_id:
                section_chief = User.objects.filter(id=section_chief_id).first()
            else:
                # Auto-assign based on law and district
                section_chief = self._find_section_chief_for_law(law_code, inspection.district)
            
            # Get law details
            law_details = {
                "PD-1586": "Presidential Decree No. 1586 - Environmental Impact Statement System",
                "RA-8749": "Republic Act No. 8749 - Philippine Clean Air Act", 
                "RA-9275": "Republic Act No. 9275 - Philippine Clean Water Act",
                "RA-6969": "Republic Act No. 6969 - Toxic Substances and Hazardous and Nuclear Wastes Control Act",
                "RA-9003": "Republic Act No. 9003 - Ecological Solid Waste Management Act"
            }
            
            assignment = InspectionLawAssignment.objects.create(
                inspection=inspection,
                law_code=law_code,
                law_name=law_details.get(law_code, law_code),
                assigned_to_section_chief=section_chief
            )
            created_assignments.append(assignment)
        
        return Response({
            'message': f'Successfully assigned {len(created_assignments)} laws',
            'assignments': [
                {
                    'law_code': a.law_code,
                    'law_name': a.law_name,
                    'assigned_to': a.assigned_to_section_chief.email if a.assigned_to_section_chief else None
                } for a in created_assignments
            ]
        })

    @action(detail=True, methods=['post'])
    def section_chief_forward_laws(self, request, pk=None):
        """Section Chief forwards law assignments based on law type"""
        inspection = self.get_object()
        
        # Check if user is a section chief
        if request.user.userlevel != 'Section Chief':
            return Response({'error': 'Only Section Chiefs can forward law assignments'}, status=status.HTTP_403_FORBIDDEN)
        
        forward_actions = request.data.get('forward_actions', [])
        
        if not forward_actions:
            return Response({'error': 'No forward actions provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        results = []
        
        for action_data in forward_actions:
            law_code = action_data.get('law_code')
            forward_to = action_data.get('forward_to')  # 'unit' or 'monitoring'
            
            if not law_code or not forward_to:
                results.append({
                    'law_code': law_code,
                    'success': False,
                    'message': 'Missing law_code or forward_to parameter'
                })
                continue
            
            # Find the law assignment
            law_assignment = inspection.law_assignments.filter(
                law_code=law_code,
                assigned_to_section_chief=request.user
            ).first()
            
            if not law_assignment:
                results.append({
                    'law_code': law_code,
                    'success': False,
                    'message': f'Law assignment not found or not assigned to you'
                })
                continue
            
            # Forward based on the specified action
            if forward_to == 'unit':
                success, message = law_assignment.forward_to_unit_head(request.user)
            elif forward_to == 'monitoring':
                success, message = law_assignment.forward_to_monitoring_personnel(request.user)
            else:
                success, message = False, f'Invalid forward_to option: {forward_to}'
            
            results.append({
                'law_code': law_code,
                'forward_to': forward_to,
                'success': success,
                'message': message
            })
        
        # Check if all law assignments have been forwarded
        pending_assignments = inspection.law_assignments.filter(
            assigned_to_section_chief=request.user,
            law_status__in=['PENDING', 'SECTION_REVIEW']
        ).count()
        
        return Response({
            'message': 'Law forwarding completed',
            'results': results,
            'pending_assignments': pending_assignments,
            'inspection_status': inspection.status
        })

    @action(detail=True, methods=['get'])
    def section_chief_law_assignments(self, request, pk=None):
        """Get law assignments that section chief can act on"""
        inspection = self.get_object()
        
        # Check if user is a section chief
        if request.user.userlevel != 'Section Chief':
            return Response({'error': 'Only Section Chiefs can view law assignments'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get law assignments assigned to this section chief
        law_assignments = inspection.law_assignments.filter(
            assigned_to_section_chief=request.user
        )
        
        assignment_data = []
        for assignment in law_assignments:
            assignment_data.append({
                'id': assignment.id,
                'law_code': assignment.law_code,
                'law_name': assignment.law_name,
                'law_status': assignment.law_status,
                'can_forward': assignment.can_section_chief_forward(),
                'available_forward_options': assignment.get_available_forward_options(),
                'assigned_to_unit_head': {
                    'id': assignment.assigned_to_unit_head.id if assignment.assigned_to_unit_head else None,
                    'name': f"{assignment.assigned_to_unit_head.first_name} {assignment.assigned_to_unit_head.last_name}".strip() if assignment.assigned_to_unit_head else None,
                    'email': assignment.assigned_to_unit_head.email if assignment.assigned_to_unit_head else None,
                } if assignment.assigned_to_unit_head else None,
                'assigned_to_monitoring_personnel': {
                    'id': assignment.assigned_to_monitoring_personnel.id if assignment.assigned_to_monitoring_personnel else None,
                    'name': f"{assignment.assigned_to_monitoring_personnel.first_name} {assignment.assigned_to_monitoring_personnel.last_name}".strip() if assignment.assigned_to_monitoring_personnel else None,
                    'email': assignment.assigned_to_monitoring_personnel.email if assignment.assigned_to_monitoring_personnel else None,
                } if assignment.assigned_to_monitoring_personnel else None,
                'created_at': assignment.created_at,
                'updated_at': assignment.updated_at
            })
        
        return Response({
            'inspection_id': inspection.id,
            'inspection_code': inspection.code,
            'establishment': {
                'name': inspection.establishment.name,
                'location': f"{inspection.establishment.city}, {inspection.establishment.province}"
            },
            'law_assignments': assignment_data
        })

    def _handle_law_assignments(self, inspection, primary_section, district=None):
        """Handle assignment of multiple laws to appropriate section chiefs"""
        # Define law mappings and their full names
        law_details = {
            "PD-1586": "Presidential Decree No. 1586 - Environmental Impact Statement System",
            "RA-8749": "Republic Act No. 8749 - Philippine Clean Air Act", 
            "RA-9275": "Republic Act No. 9275 - Philippine Clean Water Act",
            "RA-6969": "Republic Act No. 6969 - Toxic Substances and Hazardous and Nuclear Wastes Control Act",
            "RA-9003": "Republic Act No. 9003 - Ecological Solid Waste Management Act"
        }
        
        # Define which laws should be assigned based on the primary section
        # This implements the requirement: if EIA, Air & Water combined section chief exists,
        # they should receive all related laws
        assigned_laws = []
        
        # Check if there's a combined section chief for EIA, Air & Water
        combined_section_chief = None
        if district:
            combined_section_chief = User.objects.filter(
                userlevel='Section Chief',
                section='PD-1586,RA-8749,RA-9275',
                district=district,
                is_active=True
            ).first()
        
        # If no district-specific combined chief, find any combined chief
        if not combined_section_chief:
            combined_section_chief = User.objects.filter(
                userlevel='Section Chief',
                section='PD-1586,RA-8749,RA-9275',
                is_active=True
            ).first()
        
        # Determine which laws to assign based on primary section and combined chief availability
        laws_to_assign = []
        
        if primary_section in ['PD-1586', 'RA-8749', 'RA-9275']:
            # If it's EIA, Air, or Water law and there's a combined section chief
            if combined_section_chief:
                # Assign all EIA, Air, and Water laws to the combined section chief
                laws_to_assign = [
                    ('PD-1586', law_details['PD-1586'], combined_section_chief),
                    ('RA-8749', law_details['RA-8749'], combined_section_chief),
                    ('RA-9275', law_details['RA-9275'], combined_section_chief)
                ]
                logger.info(f"Assigned EIA, Air & Water laws to combined section chief: {combined_section_chief.email}")
            else:
                # No combined chief, assign only the primary law to its specific section chief
                laws_to_assign = [
                    (primary_section, law_details[primary_section], None)
                ]
        else:
            # For other laws (RA-6969, RA-9003), assign to their specific section chiefs
            laws_to_assign = [
                (primary_section, law_details[primary_section], None)
            ]
        
        # Create law assignments
        created_assignments = []
        section_chief_assignments = {}  # Track assignments by section chief for summary notifications
        
        for law_code, law_name, section_chief in laws_to_assign:
            # If no section chief specified, find the appropriate one
            if not section_chief:
                section_chief = self._find_section_chief_for_law(law_code, district)
            
            # Create the law assignment
            assignment = InspectionLawAssignment.objects.create(
                inspection=inspection,
                law_code=law_code,
                law_name=law_name,
                assigned_to_section_chief=section_chief
            )
            created_assignments.append(assignment)
            
            # Track assignments by section chief
            if section_chief:
                if section_chief.email not in section_chief_assignments:
                    section_chief_assignments[section_chief.email] = {
                        'section_chief': section_chief,
                        'laws': []
                    }
                section_chief_assignments[section_chief.email]['laws'].append(assignment)
            
            logger.info(f"Created law assignment: {law_code} -> {section_chief.email if section_chief else 'No Section Chief'}")
        
        # Send summary notifications for section chiefs with multiple law assignments
        self._send_summary_notifications(inspection, section_chief_assignments)
        
        return created_assignments

    def _send_summary_notifications(self, inspection, section_chief_assignments):
        """Send summary notifications to section chiefs with multiple law assignments"""
        from .utils import send_multiple_law_assignment_summary
        
        for email, assignment_data in section_chief_assignments.items():
            section_chief = assignment_data['section_chief']
            assigned_laws = assignment_data['laws']
            
            # Only send summary notification if multiple laws are assigned to the same section chief
            if len(assigned_laws) > 1:
                try:
                    send_multiple_law_assignment_summary(
                        section_chief=section_chief,
                        inspection=inspection,
                        assigned_laws=assigned_laws
                    )
                    logger.info(f"Multiple law assignment summary sent to {section_chief.email} for {len(assigned_laws)} laws")
                except Exception as e:
                    logger.error(f"Failed to send multiple law assignment summary to {section_chief.email}: {str(e)}")


