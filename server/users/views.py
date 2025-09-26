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
from .utils.email_utils import send_user_welcome_email
from .utils.otp_utils import generate_otp, verify_otp, send_otp_email
from django.core.cache import cache
from django.utils import timezone
from django.db.models import Q

# Notifications
from notifications.models import Notification

# Audit logging
from audit.utils import log_activity

User = get_user_model()


# ---------------------------
# Registration
# ---------------------------
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.copy()
        if "password" in data:
            data.pop("password")  # prevent frontend from setting password

        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()

            default_password = getattr(settings, "DEFAULT_USER_PASSWORD", "Temp1234")
            send_user_welcome_email(user, default_password)

            # 📌 Log user creation
            log_activity(
                request.user if request.user.is_authenticated else None,
                "create",
                f"New user registered: {user.email}",
                request=request
            )

            self.create_new_user_notifications(user)

            refresh = RefreshToken.for_user(user)
            data = {
                "user": UserSerializer(user).data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def create_new_user_notifications(self, new_user):
        division_chiefs = User.objects.filter(userlevel="Division Chief", is_active=True)

        if new_user.userlevel == "Division Chief":
            for recipient in division_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Division Chief Created',
                    message=f'A new Division Chief ({new_user.email}) has been created.'
                )

        elif new_user.userlevel == "Section Chief":
            for recipient in division_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Section Chief Created',
                    message=f'A new Section Chief ({new_user.email}) created for section: {new_user.section}.'
                )

        elif new_user.userlevel == "Unit Head":
            for recipient in division_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Unit Head Created',
                    message=f'A new Unit Head ({new_user.email}) created for section: {new_user.section}.'
                )
            section_chiefs = User.objects.filter(userlevel="Section Chief", section=new_user.section, is_active=True)
            for recipient in section_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Unit Head Created',
                    message=f'Unit Head ({new_user.email}) created in your section: {new_user.section}.'
                )

        elif new_user.userlevel == "Monitoring Personnel":
            for recipient in division_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Monitoring Personnel Created',
                    message=f'New Monitoring Personnel ({new_user.email}) created for section: {new_user.section}.'
                )
            section_chiefs = User.objects.filter(userlevel="Section Chief", section=new_user.section, is_active=True)
            for recipient in section_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Monitoring Personnel Created',
                    message=f'New Monitoring Personnel ({new_user.email}) created in your section: {new_user.section}.'
                )
            unit_heads = User.objects.filter(userlevel="Unit Head", section=new_user.section, is_active=True)
            for recipient in unit_heads:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Monitoring Personnel Created',
                    message=f'New Monitoring Personnel ({new_user.email}) created in your section: {new_user.section}.'
                )

        elif new_user.userlevel in ["Admin", "Legal Unit"]:
            for recipient in division_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title=f'New {new_user.userlevel} Created',
                    message=f'A new {new_user.userlevel} ({new_user.email}) has been created.'
                )


# ---------------------------
# Profile
# ---------------------------
class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# ---------------------------
# List Users
# ---------------------------
class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.exclude(userlevel="Admin").order_by('-updated_at')


# ---------------------------
# Update User
# ---------------------------
class UserUpdateView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def perform_update(self, serializer):
        user = serializer.save()

        log_activity(
            self.request.user,
            "update",
            f"Updated user: {user.email}",
            request=self.request
        )


# ---------------------------
# Logout
# ---------------------------
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
            token.blacklist()
            # ⚠️ No log_activity here → logout handled by signal
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------
# Toggle Active
# ---------------------------
@api_view(['POST'])
@permission_classes([IsAdminUser])
def toggle_user_active(request, pk):
    try:
        user = User.objects.get(pk=pk)
        user.is_active = not user.is_active
        user.updated_at = timezone.now()
        user.save()

        log_activity(
            request.user,
            "update",
            f"Toggled active status for {user.email} → {user.is_active}",
            request=request
        )

        return Response({
            'is_active': user.is_active,
            'updated_at': user.updated_at
        }, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


# ---------------------------
# Change Password
# ---------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')

    if not old_password or not new_password:
        return Response({'detail': 'Both old and new password are required.'}, status=400)

    if not user.check_password(old_password):
        return Response({'detail': 'Old password is incorrect.'}, status=400)

    default_password = getattr(settings, "DEFAULT_USER_PASSWORD", "Temp1234")
    if new_password == default_password:
        return Response({'detail': 'Cannot use the default password again.'}, status=400)

    if new_password == old_password:
        return Response({'detail': 'New password cannot be the same as old password.'}, status=400)

    user.set_password(new_password)
    user.must_change_password = False
    user.is_first_login = False
    user.updated_at = timezone.now()
    user.save()

    log_activity(user, "update", f"Password changed for {user.email}", request=request)

    return Response({
        'detail': 'Password changed successfully.',
        'updated_at': user.updated_at
    })


# ---------------------------
# First Time Change Password
# ---------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def first_time_change_password(request):
    user = request.user
    new_password = request.data.get('new_password')

    if not new_password:
        return Response({'detail': 'New password is required.'}, status=400)

    default_password = getattr(settings, "DEFAULT_USER_PASSWORD", "Temp1234")
    if new_password == default_password:
        return Response({'detail': 'Cannot use the default password again.'}, status=400)

    user.set_password(new_password)
    user.must_change_password = False
    user.is_first_login = False
    user.updated_at = timezone.now()
    user.save()

    log_activity(user, "update", f"First-time password set for {user.email}", request=request)

    return Response({
        'detail': 'Password changed successfully.',
        'updated_at': user.updated_at
    })


# ---------------------------
# OTP
# ---------------------------
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_otp(request):
    email = request.data.get('email')
    if not email:
        return Response({'detail': 'Email is required.'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'User with this email does not exist.'}, status=404)

    otp = generate_otp(email)
    if send_otp_email(email, otp):
        return Response({'detail': 'OTP sent to your email.'}, status=200)
    return Response({'detail': 'Failed to send OTP email.'}, status=500)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_otp_view(request):
    email = request.data.get('email')
    otp = request.data.get('otp')

    if not email or not otp:
        return Response({'detail': 'Email and OTP are required.'}, status=400)

    if verify_otp(email, otp):
        return Response({'detail': 'OTP verified successfully.'}, status=200)
    return Response({'detail': 'Invalid or expired OTP.'}, status=400)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password_with_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    new_password = request.data.get('new_password')

    if not email or not otp or not new_password:
        return Response({'detail': 'Email, OTP and new password are required.'}, status=400)

    if not verify_otp(email, otp):
        return Response({'detail': 'Invalid or expired OTP.'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'User with this email does not exist.'}, status=404)

    default_password = getattr(settings, "DEFAULT_USER_PASSWORD", "Temp1234")
    if new_password == default_password:
        return Response({'detail': 'Cannot use the default password.'}, status=400)

    user.set_password(new_password)
    user.must_change_password = False
    user.is_first_login = False
    user.updated_at = timezone.now()
    user.save()

    cache.delete(f"otp_{email}")

    log_activity(user, "update", f"Password reset via OTP for {user.email}", request=request)

    return Response({
        'detail': 'Password reset successfully.',
        'updated_at': user.updated_at
    }, status=200)

# Add this to your users views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_search(request):
    query = request.GET.get('q', '').strip()
    
    if not query or len(query) < 2:
        return Response({'results': [], 'count': 0})
    
    users = User.objects.filter(
        Q(first_name__icontains=query) |
        Q(middle_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(email__icontains=query) |
        Q(userlevel__icontains=query)
    ).exclude(userlevel="Admin")
    
    serializer = UserSerializer(users, many=True)
    return Response({
        'results': serializer.data,
        'count': users.count()
    })