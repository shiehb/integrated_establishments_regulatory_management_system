# establishments/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Establishment
from .serializers import EstablishmentSerializer
from django.db.models import Q

try:
    from shapely.geometry import Polygon as ShapelyPolygon, MultiPolygon as ShapelyMultiPolygon
    from shapely.ops import unary_union
except Exception:
    ShapelyPolygon = None
    ShapelyMultiPolygon = None
    unary_union = None

User = get_user_model()

class EstablishmentViewSet(viewsets.ModelViewSet):
    queryset = Establishment.objects.all()
    serializer_class = EstablishmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            establishment = serializer.save()

            # Attach the acting user for activity log
            establishment._action_user = request.user
            establishment.save()

            # Send notifications to specific user roles
            self.send_establishment_creation_notification(establishment, request.user)
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            return Response(
                {'error': str(e) if hasattr(e, 'detail') else serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop('partial', False))
            serializer.is_valid(raise_exception=True)
            establishment = serializer.save()

            # Attach the acting user for activity log
            establishment._action_user = request.user
            establishment.save()

            return Response(serializer.data)
        except Exception as e:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data)
            serializer.is_valid(raise_exception=False)
            return Response(
                {'error': str(e) if hasattr(e, 'detail') else serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def send_establishment_creation_notification(self, establishment, created_by):
        # Users who should be notified about new establishments
        notify_userlevels = ["Admin", "Legal Unit", "Division Chief", "Section Chief", "Unit Head"]
        
        # Get all users with these levels
        users_to_notify = User.objects.filter(userlevel__in=notify_userlevels, is_active=True)
        
        for recipient in users_to_notify:
            from notifications.models import Notification
            Notification.objects.create(
                recipient=recipient,
                sender=created_by,
                notification_type='new_establishment',
                title='New Establishment Created',
                message=f'A new establishment "{establishment.name}" has been created by {created_by.email}.'
            )
    
    @action(detail=True, methods=['post'])
    def set_polygon(self, request, pk=None):
        establishment = self.get_object()
        polygon_data = request.data.get('polygon')
        
        if polygon_data is not None:
            if not isinstance(polygon_data, list):
                return Response({'error': 'Polygon data must be a list of coordinates'}, status=status.HTTP_400_BAD_REQUEST)
            
            for coord in polygon_data:
                if not isinstance(coord, list) or len(coord) != 2:
                    return Response({'error': 'Each coordinate must be a [lat, lng] pair'}, status=status.HTTP_400_BAD_REQUEST)
                try:
                    float(coord[0]), float(coord[1])
                except (ValueError, TypeError):
                    return Response({'error': 'Coordinates must be valid numbers'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Optional server-side non-overlap enforcement if shapely available
            result_polygon = polygon_data
            if ShapelyPolygon is not None and polygon_data and len(polygon_data) >= 3:
                # Build current polygon
                try:
                    drawn = ShapelyPolygon([(float(lng), float(lat)) for lat, lng in polygon_data])
                except Exception:
                    return Response({'error': 'Invalid polygon geometry'}, status=status.HTTP_400_BAD_REQUEST)
                if not drawn.is_valid or drawn.area == 0:
                    return Response({'error': 'Invalid or empty polygon'}, status=status.HTTP_400_BAD_REQUEST)

                # Collect other establishment polygons
                others = Establishment.objects.exclude(pk=establishment.pk).values_list('polygon', flat=True)
                shapes = []
                for poly in others:
                    if isinstance(poly, list) and len(poly) >= 3:
                        try:
                            shp = ShapelyPolygon([(float(lng), float(lat)) for lat, lng in poly])
                            if shp.is_valid and shp.area > 0:
                                shapes.append(shp)
                        except Exception:
                            continue
                if shapes:
                    union = unary_union(shapes)
                    diff = drawn.difference(union)
                    # Choose largest polygon if multipolygon
                    if diff.is_empty:
                        result_polygon = []
                    elif isinstance(diff, ShapelyPolygon):
                        coords = list(diff.exterior.coords)
                        result_polygon = [[lat, lng] for (lng, lat) in coords[:-1]]
                    else:
                        # MultiPolygon: pick largest by area
                        biggest = None
                        biggest_area = -1
                        for geom in diff.geoms:
                            if geom.area > biggest_area:
                                biggest_area = geom.area
                                biggest = geom
                        if biggest is not None:
                            coords = list(biggest.exterior.coords)
                            result_polygon = [[lat, lng] for (lng, lat) in coords[:-1]]
                        else:
                            result_polygon = []

            establishment.polygon = result_polygon
            establishment._action_user = request.user  # log who updated polygon
            establishment.save()
            return Response({'status': 'polygon set', 'polygon': establishment.polygon})
        
        return Response({'error': 'No polygon data provided'}, status=400)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        active_establishments = Establishment.objects.filter(is_active=True)
        serializer = self.get_serializer(active_establishments, many=True)
        return Response(serializer.data)
