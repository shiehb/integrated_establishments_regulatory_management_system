from django.urls import path
from .views import RegisterView, ProfileView, UserListView, LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("me/", ProfileView.as_view(), name="me"),
    path("list/", UserListView.as_view(), name="user-list"),
    path("logout/", LogoutView.as_view(), name="logout"),  # ✅ new
]
