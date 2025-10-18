from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InspectionViewSet, BillingViewSet

router = DefaultRouter()
router.register(r'inspections', InspectionViewSet, basename='inspection')
router.register(r'billing', BillingViewSet, basename='billing')

urlpatterns = [
    path('', include(router.urls)),
    
    # Additional endpoints for search
    path('inspections/search/', InspectionViewSet.as_view({'get': 'search'}), name='inspection-search'),
    path('inspections/search_suggestions/', InspectionViewSet.as_view({'get': 'search_suggestions'}), name='inspection-search-suggestions'),
    
    # Dashboard endpoints
    path('inspections/compliance_stats/', InspectionViewSet.as_view({'get': 'compliance_stats'}), name='inspection-compliance-stats'),
    path('inspections/quarterly_comparison/', InspectionViewSet.as_view({'get': 'quarterly_comparison'}), name='inspection-quarterly-comparison'),
    path('inspections/compliance_by_law/', InspectionViewSet.as_view({'get': 'compliance_by_law'}), name='inspection-compliance-by-law'),
    path('inspections/tab_counts/', InspectionViewSet.as_view({'get': 'tab_counts'}), name='inspection-tab-counts'),
]