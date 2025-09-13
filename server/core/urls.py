# core/urls.py (or your main urls.py)
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),  # User authentication endpoints
    path('api/notifications/', include('notifications.urls')),  # Notification endpoints
    path('api/', include('establishments.urls')),  # Establishments endpoints
]