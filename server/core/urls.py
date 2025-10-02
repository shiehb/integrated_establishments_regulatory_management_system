from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from establishments.views import EstablishmentViewSet
from inspections.views import InspectionViewSet
from audit.views import ActivityLogViewSet
from .views import GlobalSearchView, SearchFilterOptionsView, SearchSuggestionsView  

# DRF router for ViewSets
router = DefaultRouter()
router.register(r'establishments', EstablishmentViewSet, basename='establishment')
router.register(r'activity-logs', ActivityLogViewSet, basename='activitylog')
router.register(r'inspections', InspectionViewSet, basename='inspection')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Users / Notifications / System config
    path('api/auth/', include('users.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/system/', include('system_config.urls')),

    # 🔹 Backup & Restore endpoints
    path('api/db/', include('system.urls')),   # <---- add this line

    # Search
    path('api/search/', GlobalSearchView.as_view()),
    path('api/search/suggestions/', SearchSuggestionsView.as_view()),
    path('api/search/options/', SearchFilterOptionsView.as_view()),

    # DRF router
    path('api/', include(router.urls)),
]
