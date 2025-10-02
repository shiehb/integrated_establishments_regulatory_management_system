from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Inspection, InspectionWorkflowHistory
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
        
        # Role-based filtering
        if getattr(user, 'userlevel', '') == 'Admin':
            # Can see all
            pass
        elif getattr(user, 'userlevel', '') == 'Legal Unit':
            qs = qs.filter(assigned_legal_unit=user) | qs.filter(status='LEGAL_REVIEW')
        elif getattr(user, 'userlevel', '') == 'Division Chief':
            qs = qs.filter(assigned_division_head=user) | qs.filter(status='DIVISION_CREATED')
        elif getattr(user, 'userlevel', '') == 'Section Chief':
            qs = qs.filter(assigned_section_chief=user) | qs.filter(status='SECTION_REVIEW')
        elif getattr(user, 'userlevel', '') == 'Unit Head':
            qs = qs.filter(assigned_unit_head=user) | qs.filter(status='UNIT_REVIEW')
        elif getattr(user, 'userlevel', '') == 'Monitoring Personnel':
            qs = qs.filter(assigned_monitor=user) | qs.filter(status='MONITORING_INSPECTION')

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
            
            success, message = inspection.make_decision(
                user=request.user,
                action=action,
                comments=comments
            )
            
            if success:
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


