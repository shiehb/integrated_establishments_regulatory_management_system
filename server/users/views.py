from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .serializers import RegisterSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]  # Or IsAdminUser if only admins can register

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


class UserUpdateView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"  # URL will use /users/<id>/

    def perform_update(self, serializer):
        # Get the validated data
        validated_data = serializer.validated_data
        
        # If userlevel is being changed to Admin, Legal Unit, or Division Chief,
        # ensure section is set to None
        userlevel = validated_data.get('userlevel')
        if userlevel in ["Admin", "Legal Unit", "Division Chief"]:
            validated_data['section'] = None
        
        serializer.save()


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"detail": "Refresh token required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            token = RefreshToken(refresh_token)
            token.blacklist()  # ⛔ blacklist refresh token
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def toggle_user_active(request, pk):
    try:
        user = User.objects.get(pk=pk)
        user.is_active = not user.is_active
        user.save()
        return Response({'is_active': user.is_active}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    new_password = request.data.get('new_password')

    if not new_password:
        return Response({'detail': 'New password required.'}, status=400)

    default_password = getattr(settings, "DEFAULT_USER_PASSWORD", "Temp1234")

    if new_password == default_password:
        return Response({'detail': 'Cannot use the default password again.'}, status=400)
    user.set_password(new_password)
    user.must_change_password = False
    user.is_first_login = False
    user.save()

    return Response({'detail': 'Password changed successfully.'})