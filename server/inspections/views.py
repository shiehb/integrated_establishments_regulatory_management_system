from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from .models import Inspection
from .serializers import InspectionSerializer
from .regions import get_district_by_city, list_districts
from establishments.models import Establishment
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class InspectionViewSet(viewsets.ModelViewSet):
    queryset = Inspection.objects.select_related('establishment').all()
    serializer_class = InspectionSerializer
    permission_classes = [permissions.IsAuthenticated]

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

    def perform_create(self, serializer):
        # Auto-derive district if not provided using province+city mapping
        district = serializer.validated_data.get('district')
        establishment = serializer.validated_data.get('establishment')
        section = serializer.validated_data.get('section')

        if not district and isinstance(establishment, Establishment):
            derived = get_district_by_city(establishment.province, establishment.city)
        else:
            derived = district

        inspection = serializer.save(created_by=self.request.user, district=derived)

        # Auto-assign based on user role and workflow
        user_level = getattr(self.request.user, 'userlevel', '')
        
        if user_level == 'Legal Unit':
            inspection.assigned_legal_unit = self.request.user
            inspection.status = 'LEGAL_REVIEW'
            inspection.current_assigned_to = self.request.user
        elif user_level == 'Division Chief':
            inspection.assigned_division_head = self.request.user
            inspection.status = 'DIVISION_CREATED'
            inspection.current_assigned_to = self.request.user
            
            if section:
                section_chief = User.objects.filter(userlevel='Section Chief', section=section, is_active=True).first()
                if section_chief:
                    inspection.assigned_section_chief = section_chief
        elif user_level == 'Section Chief':
            inspection.assigned_section_chief = self.request.user
            inspection.status = 'SECTION_REVIEW'
            inspection.current_assigned_to = self.request.user
        elif user_level == 'Unit Head':
            inspection.assigned_unit_head = self.request.user
            inspection.status = 'UNIT_REVIEW'
            inspection.current_assigned_to = self.request.user
        elif user_level == 'Monitoring Personnel':
            inspection.assigned_monitor = self.request.user
            inspection.status = 'MONITORING_INSPECTION'
            inspection.current_assigned_to = self.request.user
        
        inspection.save()


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


