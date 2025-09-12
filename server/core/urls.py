# core/urls.py (or your main urls.py)
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),  # Your existing auth URLs
    path('api/', include('establishments.urls')),  # Add this line
]