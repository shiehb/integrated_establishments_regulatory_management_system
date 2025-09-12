from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, generics
from .serializers import RegisterSerializer, UserSerializer, NotificationSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, Notification
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.conf import settings
from django.contrib.auth import get_user_model
from .utils.email_utils import send_user_welcome_email
from .utils.otp_utils import generate_otp, verify_otp, send_otp_email
from django.core.cache import cache

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Ensure frontend cannot override the password
        data = request.data.copy()
        if "password" in data:
            data.pop("password")

        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()  # password automatically set from .env
            
            # Send welcome email
            default_password = getattr(settings, "DEFAULT_USER_PASSWORD", "Temp1234")
            send_user_welcome_email(user, default_password)
            
            # Create notifications for relevant users about new registration
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
        # Users who should be notified about new registrations
        notify_userlevels = ["Admin", "Division Chief", "Section Chief", "Unit Head"]
        
        # Get all users with these levels
        users_to_notify = User.objects.filter(userlevel__in=notify_userlevels, is_active=True)
        
        for recipient in users_to_notify:
            Notification.objects.create(
                recipient=recipient,
                sender=new_user,
                notification_type='new_user',
                title='New User Registration',
                message=f'A new user ({new_user.email}) has been registered in the system with userlevel: {new_user.userlevel}.'
            )


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


# OTP Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def send_otp(request):
    email = request.data.get('email')
    
    if not email:
        return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)
    
    # Generate OTP
    otp = generate_otp(email)
    
    # Send OTP email
    if send_otp_email(email, otp):
        return Response({'detail': 'OTP sent to your email.'}, status=status.HTTP_200_OK)
    else:
        return Response({'detail': 'Failed to send OTP email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_otp_view(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    
    if not email or not otp:
        return Response({'detail': 'Email and OTP are required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify OTP
    if verify_otp(email, otp):
        return Response({'detail': 'OTP verified successfully.'}, status=status.HTTP_200_OK)
    else:
        return Response({'detail': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password_with_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    new_password = request.data.get('new_password')
    
    if not email or not otp or not new_password:
        return Response({'detail': 'Email, OTP and new password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify OTP first
    if not verify_otp(email, otp):
        return Response({'detail': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'detail': 'User with this email does not exist.'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if new password is the same as default password
    default_password = getattr(settings, "DEFAULT_USER_PASSWORD", "Temp1234")
    if new_password == default_password:
        return Response({'detail': 'Cannot use the default password.'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Set new password
    user.set_password(new_password)
    user.must_change_password = False
    user.is_first_login = False
    user.save()
    
    # Clear OTP from cache after successful reset
    cache.delete(f"otp_{email}")
    
    return Response({'detail': 'Password reset successfully.'}, status=status.HTTP_200_OK)


# Notification Views
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user).order_by('-created_at')


class MarkNotificationAsReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, recipient=request.user)
            notification.is_read = True
            notification.save()
            return Response({'status': 'marked as read'})
        except Notification.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    try:
        # Mark all unread notifications for the current user as read
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all notifications marked as read'})
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notifications_count(request):
    try:
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'count': count})
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_all_notifications(request):
    try:
        # Delete all notifications for the current user
        Notification.objects.filter(recipient=request.user).delete()
        return Response({'status': 'all notifications deleted'})
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)