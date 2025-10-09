from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InspectionViewSet

router = DefaultRouter()
router.register(r'inspections', InspectionViewSet, basename='inspection')

urlpatterns = [
    path('', include(router.urls)),
    
    # Additional endpoints for search
    path('inspections/search/', InspectionViewSet.as_view({'get': 'search'}), name='inspection-search'),
    path('inspections/search_suggestions/', InspectionViewSet.as_view({'get': 'search_suggestions'}), name='inspection-search-suggestions'),
    
    # Dashboard endpoints
    path('inspections/compliance_stats/', InspectionViewSet.as_view({'get': 'compliance_stats'}), name='inspection-compliance-stats'),
    path('inspections/quarterly_comparison/', InspectionViewSet.as_view({'get': 'quarterly_comparison'}), name='inspection-quarterly-comparison'),
]