# establishments/views.py
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Establishment
from .serializers import EstablishmentSerializer

class EstablishmentViewSet(viewsets.ModelViewSet):
    queryset = Establishment.objects.all()
    serializer_class = EstablishmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
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