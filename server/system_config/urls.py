from django.urls import path
from . import views

urlpatterns = [
    path('config/', views.get_system_configuration, name='get_system_configuration'),
    path('config/update/', views.update_system_configuration, name='update_system_configuration'),
    path('config/test-email/', views.test_email_configuration, name='test_email_configuration'),
    path('config/current-settings/', views.get_current_settings, name='get_current_settings'),
]
