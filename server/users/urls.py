from django.urls import path
from .views import RegisterView, ProfileView, UserListView, LogoutView, UserUpdateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', ProfileView.as_view(), name='me'),
    path('list/', UserListView.as_view(), name='user-list'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('users/<int:id>/', UserUpdateView.as_view(), name='user-update'),  # ✅ new edit endpoint
    path('toggle-active/<int:pk>/', views.toggle_user_active, name='toggle-user-active'),
]
