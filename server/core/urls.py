# core/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from establishments.views import EstablishmentViewSet
from audit.views import ActivityLogViewSet  # 👈 import ActivityLog API

# Use DRF router for automatic ViewSet routing
router = DefaultRouter()
router.register(r'establishments', EstablishmentViewSet, basename='establishment')
router.register(r'activity-logs', ActivityLogViewSet, basename='activitylog')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),  # User authentication endpoints
    path('api/notifications/', include('notifications.urls')),  # Notification endpoints
    path('api/', include(router.urls)),  # Establishments + Activity Logs endpoints
]
