from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta

from .models_normalized import (
    Establishment, BusinessType, Province, City, Barangay,
    EstablishmentStatus, EstablishmentType, EstablishmentHistory, EstablishmentDocument
)
from .serializers_normalized import (
    EstablishmentSerializer, EstablishmentListSerializer, EstablishmentCreateSerializer, EstablishmentUpdateSerializer,
    BusinessTypeSerializer, ProvinceSerializer, CitySerializer, BarangaySerializer,
    EstablishmentStatusSerializer, EstablishmentTypeSerializer, EstablishmentHistorySerializer, EstablishmentDocumentSerializer
)
from notifications.models import Notification
from audit.utils import log_activity


# ---------------------------
# Lookup Table ViewSets
# ---------------------------
class BusinessTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for BusinessType model"""
    queryset = BusinessType.objects.filter(is_active=True)
    serializer_class = BusinessTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter business types based on query parameters"""
        queryset = BusinessType.objects.filter(is_active=True)
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__icontains=category)
        
        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__icontains=search)
            )
        
        return queryset.order_by('category', 'name')
    
    @action(detail=True, methods=['get'])
    def establishments(self, request, pk=None):
        """Get establishments with this business type"""
        business_type = self.get_object()
        establishments = business_type.establishments.filter(is_active=True)
        
        # Apply filters
        status = request.query_params.get('status')
        if status:
            establishments = establishments.filter(status__code=status)
        
        province = request.query_params.get('province')
        if province:
            establishments = establishments.filter(province__code=province)
        
        serializer = EstablishmentListSerializer(establishments, many=True)
        return Response({
            'business_type': BusinessTypeSerializer(business_type).data,
            'establishments': serializer.data,
            'count': establishments.count()
        })


class ProvinceViewSet(viewsets.ModelViewSet):
    """ViewSet for Province model"""
    queryset = Province.objects.filter(is_active=True)
    serializer_class = ProvinceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter provinces based on query parameters"""
        queryset = Province.objects.filter(is_active=True)
        
        # Filter by region
        region = self.request.query_params.get('region')
        if region:
            queryset = queryset.filter(region__icontains=region)
        
        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(region__icontains=search)
            )
        
        return queryset.order_by('region', 'name')
    
    @action(detail=True, methods=['get'])
    def cities(self, request, pk=None):
        """Get cities in this province"""
        province = self.get_object()
        cities = province.cities.filter(is_active=True)
        
        # Apply filters
        city_type = request.query_params.get('city_type')
        if city_type:
            cities = cities.filter(city_type=city_type)
        
        serializer = CitySerializer(cities, many=True)
        return Response({
            'province': ProvinceSerializer(province).data,
            'cities': serializer.data,
            'count': cities.count()
        })
    
    @action(detail=True, methods=['get'])
    def establishments(self, request, pk=None):
        """Get establishments in this province"""
        province = self.get_object()
        establishments = province.establishments.filter(is_active=True)
        
        # Apply filters
        business_type = request.query_params.get('business_type')
        if business_type:
            establishments = establishments.filter(business_type__code=business_type)
        
        status = request.query_params.get('status')
        if status:
            establishments = establishments.filter(status__code=status)
        
        serializer = EstablishmentListSerializer(establishments, many=True)
        return Response({
            'province': ProvinceSerializer(province).data,
            'establishments': serializer.data,
            'count': establishments.count()
        })


class CityViewSet(viewsets.ModelViewSet):
    """ViewSet for City model"""
    queryset = City.objects.filter(is_active=True)
    serializer_class = CitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter cities based on query parameters"""
        queryset = City.objects.filter(is_active=True).select_related('province')
        
        # Filter by province
        province = self.request.query_params.get('province')
        if province:
            queryset = queryset.filter(province__code=province)
        
        # Filter by city type
        city_type = self.request.query_params.get('city_type')
        if city_type:
            queryset = queryset.filter(city_type=city_type)
        
        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(province__name__icontains=search)
            )
        
        return queryset.order_by('province', 'name')
    
    @action(detail=True, methods=['get'])
    def barangays(self, request, pk=None):
        """Get barangays in this city"""
        city = self.get_object()
        barangays = city.barangays.filter(is_active=True)
        
        # Apply filters
        barangay_type = request.query_params.get('barangay_type')
        if barangay_type:
            barangays = barangays.filter(barangay_type=barangay_type)
        
        serializer = BarangaySerializer(barangays, many=True)
        return Response({
            'city': CitySerializer(city).data,
            'barangays': serializer.data,
            'count': barangays.count()
        })
    
    @action(detail=True, methods=['get'])
    def establishments(self, request, pk=None):
        """Get establishments in this city"""
        city = self.get_object()
        establishments = city.establishments.filter(is_active=True)
        
        # Apply filters
        business_type = request.query_params.get('business_type')
        if business_type:
            establishments = establishments.filter(business_type__code=business_type)
        
        status = request.query_params.get('status')
        if status:
            establishments = establishments.filter(status__code=status)
        
        serializer = EstablishmentListSerializer(establishments, many=True)
        return Response({
            'city': CitySerializer(city).data,
            'establishments': serializer.data,
            'count': establishments.count()
        })


class BarangayViewSet(viewsets.ModelViewSet):
    """ViewSet for Barangay model"""
    queryset = Barangay.objects.filter(is_active=True)
    serializer_class = BarangaySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter barangays based on query parameters"""
        queryset = Barangay.objects.filter(is_active=True).select_related('city__province')
        
        # Filter by city
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__code=city)
        
        # Filter by province
        province = self.request.query_params.get('province')
        if province:
            queryset = queryset.filter(city__province__code=province)
        
        # Filter by barangay type
        barangay_type = self.request.query_params.get('barangay_type')
        if barangay_type:
            queryset = queryset.filter(barangay_type=barangay_type)
        
        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(city__name__icontains=search) |
                Q(city__province__name__icontains=search)
            )
        
        return queryset.order_by('city__province', 'city', 'name')
    
    @action(detail=True, methods=['get'])
    def establishments(self, request, pk=None):
        """Get establishments in this barangay"""
        barangay = self.get_object()
        establishments = barangay.establishments.filter(is_active=True)
        
        # Apply filters
        business_type = request.query_params.get('business_type')
        if business_type:
            establishments = establishments.filter(business_type__code=business_type)
        
        status = request.query_params.get('status')
        if status:
            establishments = establishments.filter(status__code=status)
        
        serializer = EstablishmentListSerializer(establishments, many=True)
        return Response({
            'barangay': BarangaySerializer(barangay).data,
            'establishments': serializer.data,
            'count': establishments.count()
        })


class EstablishmentStatusViewSet(viewsets.ModelViewSet):
    """ViewSet for EstablishmentStatus model"""
    queryset = EstablishmentStatus.objects.filter(is_active=True)
    serializer_class = EstablishmentStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter establishment statuses based on query parameters"""
        queryset = EstablishmentStatus.objects.filter(is_active=True)
        
        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.order_by('name')
    
    @action(detail=True, methods=['get'])
    def establishments(self, request, pk=None):
        """Get establishments with this status"""
        status = self.get_object()
        establishments = status.establishments.filter(is_active=True)
        
        # Apply filters
        business_type = request.query_params.get('business_type')
        if business_type:
            establishments = establishments.filter(business_type__code=business_type)
        
        province = request.query_params.get('province')
        if province:
            establishments = establishments.filter(province__code=province)
        
        serializer = EstablishmentListSerializer(establishments, many=True)
        return Response({
            'status': EstablishmentStatusSerializer(status).data,
            'establishments': serializer.data,
            'count': establishments.count()
        })


class EstablishmentTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for EstablishmentType model"""
    queryset = EstablishmentType.objects.filter(is_active=True)
    serializer_class = EstablishmentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter establishment types based on query parameters"""
        queryset = EstablishmentType.objects.filter(is_active=True)
        
        # Filter by requires_license
        requires_license = self.request.query_params.get('requires_license')
        if requires_license is not None:
            queryset = queryset.filter(requires_license=requires_license.lower() == 'true')
        
        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.order_by('name')
    
    @action(detail=True, methods=['get'])
    def establishments(self, request, pk=None):
        """Get establishments of this type"""
        establishment_type = self.get_object()
        establishments = establishment_type.establishments.filter(is_active=True)
        
        # Apply filters
        business_type = request.query_params.get('business_type')
        if business_type:
            establishments = establishments.filter(business_type__code=business_type)
        
        status = request.query_params.get('status')
        if status:
            establishments = establishments.filter(status__code=status)
        
        serializer = EstablishmentListSerializer(establishments, many=True)
        return Response({
            'establishment_type': EstablishmentTypeSerializer(establishment_type).data,
            'establishments': serializer.data,
            'count': establishments.count()
        })


# ---------------------------
# Main Establishment ViewSet
# ---------------------------
class EstablishmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Establishment model with normalized relationships"""
    queryset = Establishment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return EstablishmentCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return EstablishmentUpdateSerializer
        elif self.action == 'list':
            return EstablishmentListSerializer
        else:
            return EstablishmentSerializer
    
    def get_queryset(self):
        """Filter establishments based on query parameters and permissions"""
        queryset = Establishment.objects.select_related(
            'business_type', 'establishment_type', 'status',
            'province', 'city', 'barangay', 'created_by', 'updated_by'
        ).prefetch_related('documents', 'history')
        
        # Apply filters
        queryset = self.apply_filters(queryset)
        
        return queryset.order_by('-updated_at')
    
    def apply_filters(self, queryset):
        """Apply various filters to the queryset"""
        # Filter by business type
        business_type = self.request.query_params.get('business_type')
        if business_type:
            queryset = queryset.filter(business_type__code=business_type)
        
        # Filter by establishment type
        establishment_type = self.request.query_params.get('establishment_type')
        if establishment_type:
            queryset = queryset.filter(establishment_type__code=establishment_type)
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status__code=status)
        
        # Filter by province
        province = self.request.query_params.get('province')
        if province:
            queryset = queryset.filter(province__code=province)
        
        # Filter by city
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__code=city)
        
        # Filter by barangay
        barangay = self.request.query_params.get('barangay')
        if barangay:
            queryset = queryset.filter(barangay__code=barangay)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by compliance status
        compliance_status = self.request.query_params.get('compliance_status')
        if compliance_status:
            if compliance_status == 'COMPLIANT':
                queryset = queryset.filter(
                    license_expiry__gt=timezone.now().date(),
                    permit_expiry__gt=timezone.now().date()
                )
            elif compliance_status == 'NON_COMPLIANT':
                queryset = queryset.filter(
                    Q(license_expiry__lt=timezone.now().date()) |
                    Q(permit_expiry__lt=timezone.now().date())
                )
            elif compliance_status == 'EXPIRING_SOON':
                thirty_days_from_now = timezone.now().date() + timedelta(days=30)
                queryset = queryset.filter(
                    Q(license_expiry__lte=thirty_days_from_now, license_expiry__gte=timezone.now().date()) |
                    Q(permit_expiry__lte=thirty_days_from_now, permit_expiry__gte=timezone.now().date())
                )
        
        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(registration_number__icontains=search) |
                Q(tin_number__icontains=search) |
                Q(contact_person__icontains=search) |
                Q(contact_phone__icontains=search) |
                Q(contact_email__icontains=search) |
                Q(license_number__icontains=search) |
                Q(permit_number__icontains=search) |
                Q(business_type__name__icontains=search) |
                Q(establishment_type__name__icontains=search) |
                Q(province__name__icontains=search) |
                Q(city__name__icontains=search) |
                Q(barangay__name__icontains=search) |
                Q(street_building__icontains=search)
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """Create a new establishment with audit logging"""
        establishment = serializer.save(created_by=self.request.user)
        
        # Log establishment creation
        log_activity(
            self.request.user,
            "create",
            f"New establishment created: {establishment.name}",
            request=self.request
        )
        
        # Create establishment history
        EstablishmentHistory.objects.create(
            establishment=establishment,
            changed_by=self.request.user,
            change_type='CREATE',
            new_values=serializer.data,
            reason="Establishment created"
        )
        
        # Send notifications
        self.send_establishment_creation_notification(establishment, self.request.user)
    
    def perform_update(self, serializer):
        """Update establishment with audit logging"""
        old_establishment = self.get_object()
        new_establishment = serializer.save(updated_by=self.request.user)
        
        # Log establishment update
        log_activity(
            self.request.user,
            "update",
            f"Updated establishment: {new_establishment.name}",
            request=self.request
        )
        
        # Record changes in history
        self.record_establishment_changes(old_establishment, new_establishment, self.request.user)
    
    def record_establishment_changes(self, old_establishment, new_establishment, changed_by):
        """Record changes to establishment in history"""
        changes = []
        old_values = {}
        new_values = {}
        
        # Check for changes in key fields
        if old_establishment.name != new_establishment.name:
            changes.append('name')
            old_values['name'] = old_establishment.name
            new_values['name'] = new_establishment.name
        
        if old_establishment.business_type != new_establishment.business_type:
            changes.append('business_type')
            old_values['business_type'] = old_establishment.business_type.name
            new_values['business_type'] = new_establishment.business_type.name
        
        if old_establishment.status != new_establishment.status:
            changes.append('status')
            old_values['status'] = old_establishment.status.name
            new_values['status'] = new_establishment.status.name
        
        if old_establishment.province != new_establishment.province:
            changes.append('location')
            old_values['province'] = old_establishment.province.name
            new_values['province'] = new_establishment.province.name
        
        if old_establishment.city != new_establishment.city:
            changes.append('location')
            old_values['city'] = old_establishment.city.name
            new_values['city'] = new_establishment.city.name
        
        if old_establishment.barangay != new_establishment.barangay:
            changes.append('location')
            old_values['barangay'] = old_establishment.barangay.name
            new_values['barangay'] = new_establishment.barangay.name
        
        if old_establishment.is_active != new_establishment.is_active:
            changes.append('status')
            old_values['is_active'] = old_establishment.is_active
            new_values['is_active'] = new_establishment.is_active
        
        # Create history record if there are changes
        if changes:
            change_type = 'UPDATE'
            if 'status' in changes:
                change_type = 'STATUS_CHANGE'
            elif 'location' in changes:
                change_type = 'LOCATION_CHANGE'
            elif 'business_type' in changes:
                change_type = 'BUSINESS_CHANGE'
            
            EstablishmentHistory.objects.create(
                establishment=new_establishment,
                changed_by=changed_by,
                change_type=change_type,
                old_values=old_values,
                new_values=new_values,
                reason=f"Updated via API: {', '.join(changes)}"
            )
    
    def send_establishment_creation_notification(self, establishment, created_by):
        """Send notifications for new establishment creation"""
        # Users who should be notified about new establishments
        notify_userlevels = ["Admin", "Legal Unit", "Division Chief", "Section Chief", "Unit Head"]
        
        # Get all users with these levels
        from django.contrib.auth import get_user_model
        User = get_user_model()
        users_to_notify = User.objects.filter(
            userlevel__code__in=notify_userlevels,
            is_active=True
        )
        
        for recipient in users_to_notify:
            Notification.objects.create(
                recipient=recipient,
                sender=created_by,
                notification_type='new_establishment',
                title='New Establishment Created',
                message=f'A new establishment "{establishment.name}" has been created by {created_by.email}.'
            )
    
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get establishment history"""
        establishment = self.get_object()
        history = establishment.history.all()
        serializer = EstablishmentHistorySerializer(history, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get establishment documents"""
        establishment = self.get_object()
        documents = establishment.documents.filter(is_active=True)
        serializer = EstablishmentDocumentSerializer(documents, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle establishment active status"""
        establishment = self.get_object()
        new_active_status = not establishment.is_active
        
        establishment.is_active = new_active_status
        establishment.updated_by = request.user
        establishment.updated_at = timezone.now()
        establishment.save()
        
        # Record in history
        EstablishmentHistory.objects.create(
            establishment=establishment,
            changed_by=request.user,
            change_type='STATUS_CHANGE',
            old_values={'is_active': not new_active_status},
            new_values={'is_active': new_active_status},
            reason=f"Status changed to {'Active' if new_active_status else 'Inactive'}"
        )
        
        log_activity(
            request.user,
            "update",
            f"Toggled active status for {establishment.name} → {establishment.is_active}",
            request=request
        )
        
        return Response({
            'is_active': establishment.is_active,
            'updated_at': establishment.updated_at
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def set_polygon(self, request, pk=None):
        """Set establishment polygon"""
        establishment = self.get_object()
        polygon_data = request.data.get('polygon')
        
        if polygon_data is not None:
            if not isinstance(polygon_data, list):
                return Response(
                    {'error': 'Polygon data must be a list of coordinates'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate polygon coordinates
            for coord in polygon_data:
                if not isinstance(coord, list) or len(coord) != 2:
                    return Response(
                        {'error': 'Each coordinate must be a [lat, lng] pair'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                try:
                    float(coord[0]), float(coord[1])
                except (ValueError, TypeError):
                    return Response(
                        {'error': 'Coordinates must be valid numbers'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Update polygon
            establishment.polygon = polygon_data
            establishment.updated_by = request.user
            establishment.updated_at = timezone.now()
            establishment.save()
            
            # Record in history
            EstablishmentHistory.objects.create(
                establishment=establishment,
                changed_by=request.user,
                change_type='UPDATE',
                new_values={'polygon': polygon_data},
                reason="Polygon updated"
            )
            
            return Response({
                'status': 'polygon set',
                'polygon': establishment.polygon
            })
        
        return Response(
            {'error': 'No polygon data provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get establishment statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_establishments': queryset.count(),
            'active_establishments': queryset.filter(is_active=True).count(),
            'inactive_establishments': queryset.filter(is_active=False).count(),
            'by_business_type': {},
            'by_establishment_type': {},
            'by_status': {},
            'by_province': {},
            'compliance_stats': {
                'compliant': 0,
                'non_compliant': 0,
                'expiring_soon': 0
            }
        }
        
        # Statistics by business type
        for business_type in BusinessType.objects.filter(is_active=True):
            count = queryset.filter(business_type=business_type).count()
            if count > 0:
                stats['by_business_type'][business_type.code] = {
                    'name': business_type.name,
                    'count': count
                }
        
        # Statistics by establishment type
        for establishment_type in EstablishmentType.objects.filter(is_active=True):
            count = queryset.filter(establishment_type=establishment_type).count()
            if count > 0:
                stats['by_establishment_type'][establishment_type.code] = {
                    'name': establishment_type.name,
                    'count': count
                }
        
        # Statistics by status
        for status in EstablishmentStatus.objects.filter(is_active=True):
            count = queryset.filter(status=status).count()
            if count > 0:
                stats['by_status'][status.code] = {
                    'name': status.name,
                    'count': count
                }
        
        # Statistics by province
        for province in Province.objects.filter(is_active=True):
            count = queryset.filter(province=province).count()
            if count > 0:
                stats['by_province'][province.code] = {
                    'name': province.name,
                    'count': count
                }
        
        # Compliance statistics
        now = timezone.now().date()
        thirty_days_from_now = now + timedelta(days=30)
        
        stats['compliance_stats']['compliant'] = queryset.filter(
            license_expiry__gt=now,
            permit_expiry__gt=now
        ).count()
        
        stats['compliance_stats']['non_compliant'] = queryset.filter(
            Q(license_expiry__lt=now) | Q(permit_expiry__lt=now)
        ).count()
        
        stats['compliance_stats']['expiring_soon'] = queryset.filter(
            Q(license_expiry__lte=thirty_days_from_now, license_expiry__gte=now) |
            Q(permit_expiry__lte=thirty_days_from_now, permit_expiry__gte=now)
        ).count()
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search establishments"""
        query = request.GET.get('q', '').strip()
        
        if not query or len(query) < 2:
            return Response({'results': [], 'count': 0})
        
        # Search across multiple fields
        establishments = Establishment.objects.filter(
            Q(name__icontains=query) |
            Q(registration_number__icontains=query) |
            Q(tin_number__icontains=query) |
            Q(contact_person__icontains=query) |
            Q(contact_phone__icontains=query) |
            Q(contact_email__icontains=query) |
            Q(license_number__icontains=query) |
            Q(permit_number__icontains=query) |
            Q(business_type__name__icontains=query) |
            Q(establishment_type__name__icontains=query) |
            Q(province__name__icontains=query) |
            Q(city__name__icontains=query) |
            Q(barangay__name__icontains=query) |
            Q(street_building__icontains=query)
        ).select_related(
            'business_type', 'establishment_type', 'status',
            'province', 'city', 'barangay'
        )
        
        serializer = EstablishmentListSerializer(establishments, many=True)
        return Response({
            'results': serializer.data,
            'count': establishments.count()
        })


# ---------------------------
# Document Management
# ---------------------------
class EstablishmentDocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for EstablishmentDocument model"""
    queryset = EstablishmentDocument.objects.filter(is_active=True)
    serializer_class = EstablishmentDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter documents based on query parameters"""
        queryset = EstablishmentDocument.objects.filter(is_active=True).select_related(
            'establishment', 'uploaded_by'
        )
        
        # Filter by establishment
        establishment = self.request.query_params.get('establishment')
        if establishment:
            queryset = queryset.filter(establishment_id=establishment)
        
        # Filter by document type
        document_type = self.request.query_params.get('document_type')
        if document_type:
            queryset = queryset.filter(document_type=document_type)
        
        return queryset.order_by('-uploaded_at')
    
    def perform_create(self, serializer):
        """Create a new document with audit logging"""
        document = serializer.save(uploaded_by=self.request.user)
        
        log_activity(
            self.request.user,
            "create",
            f"Document uploaded for establishment: {document.establishment.name}",
            request=self.request
        )
    
    def perform_destroy(self, instance):
        """Soft delete document"""
        instance.is_active = False
        instance.save()
        
        log_activity(
            self.request.user,
            "delete",
            f"Document deleted for establishment: {instance.establishment.name}",
            request=self.request
        )
