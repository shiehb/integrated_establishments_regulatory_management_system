from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .serializers import RegisterSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from django.conf import settings


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]  # or IsAdminUser if only admins can create users

    def post(self, request):
        # Ensure frontend cannot override the password
        data = request.data.copy()
        if "password" in data:
            data.pop("password")

        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()  # password automatically set from .env
            refresh = RefreshToken.for_user(user)
            data = {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # ✅ Exclude Admin accounts from the user list
        return User.objects.exclude(userlevel="Admin")


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()  # ⛔ blacklist refresh token
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
