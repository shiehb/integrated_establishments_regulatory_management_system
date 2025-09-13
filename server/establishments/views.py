# establishments/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Establishment
from .serializers import EstablishmentSerializer

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
            
            # Send notifications to specific user roles
            self.send_establishment_creation_notification(establishment, request.user)
            
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            # Return validation errors with proper format
            return Response(
                {'error': str(e) if hasattr(e, 'detail') else serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
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
            # Import from notifications app
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
        
        if polygon_data:
            establishment.polygon = polygon_data
            establishment.save()
            return Response({'status': 'polygon set'})
        return Response({'error': 'No polygon data provided'}, status=400)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        active_establishments = Establishment.objects.filter(is_active=True)
        serializer = self.get_serializer(active_establishments, many=True)
        return Response(serializer.data)