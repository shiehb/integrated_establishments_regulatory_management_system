# core/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from establishments.views import EstablishmentViewSet
from inspections.views import InspectionViewSet
from audit.views import ActivityLogViewSet
from .views import GlobalSearchView, SearchFilterOptionsView, SearchSuggestionsView  # Add SearchSuggestionsView

# Use DRF router for automatic ViewSet routing
router = DefaultRouter()
router.register(r'establishments', EstablishmentViewSet, basename='establishment')
router.register(r'activity-logs', ActivityLogViewSet, basename='activitylog')
router.register(r'inspections', InspectionViewSet, basename='inspection')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),  # User authentication endpoints
    path('api/notifications/', include('notifications.urls')),  # Notification endpoints
    path('api/system/', include('system_config.urls')),  # System configuration endpoints
    path('api/search/', GlobalSearchView.as_view()),
    path('api/search/suggestions/', SearchSuggestionsView.as_view()),  # Add this line
    path('api/search/options/', SearchFilterOptionsView.as_view()),
    path('api/', include(router.urls)),  # Establishments + Activity Logs endpoints
]