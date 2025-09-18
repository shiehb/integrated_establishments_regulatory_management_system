# users/views.py
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

# Import Notification from the new notifications app
from notifications.models import Notification

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
        # Get all Division Chiefs (they always get notified for any new user)
        division_chiefs = User.objects.filter(userlevel="Division Chief", is_active=True)
        
        # Get relevant users based on the new user's level
        if new_user.userlevel == "Division Chief":
            # Notify all Division Chiefs
            for recipient in division_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Division Chief Created',
                    message=f'A new Division Chief ({new_user.email}) has been created in the system.'
                )
        
        elif new_user.userlevel == "Section Chief":
            # Notify all Division Chiefs
            for recipient in division_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Section Chief Created',
                    message=f'A new Section Chief ({new_user.email}) has been created for section: {new_user.section}.'
                )
        
        elif new_user.userlevel == "Unit Head":
            # Notify all Division Chiefs
            for recipient in division_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Unit Head Created',
                    message=f'A new Unit Head ({new_user.email}) has been created for section: {new_user.section}.'
                )
            
            # Also notify Section Chiefs in the same section
            section_chiefs = User.objects.filter(
                userlevel="Section Chief", 
                section=new_user.section, 
                is_active=True
            )
            for recipient in section_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Unit Head Created',
                    message=f'A new Unit Head ({new_user.email}) has been created in your section: {new_user.section}.'
                )
        
        elif new_user.userlevel == "Monitoring Personnel":
            # Notify all Division Chiefs
            for recipient in division_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Monitoring Personnel Created',
                    message=f'New Monitoring Personnel ({new_user.email}) has been created for section: {new_user.section}.'
                )
            
            # Notify Section Chiefs in the same section
            section_chiefs = User.objects.filter(
                userlevel="Section Chief", 
                section=new_user.section, 
                is_active=True
            )
            for recipient in section_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Monitoring Personnel Created',
                    message=f'New Monitoring Personnel ({new_user.email}) has been created in your section: {new_user.section}.'
                )
            
            # Notify Unit Heads in the same section
            unit_heads = User.objects.filter(
                userlevel="Unit Head", 
                section=new_user.section, 
                is_active=True
            )
            for recipient in unit_heads:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title='New Monitoring Personnel Created',
                    message=f'New Monitoring Personnel ({new_user.email}) has been created in your section: {new_user.section}.'
                )
        
        # For Admin and Legal Unit, you might want different notification logic
        elif new_user.userlevel in ["Admin", "Legal Unit"]:
            # Notify all Division Chiefs about Admin/Legal Unit creation
            for recipient in division_chiefs:
                Notification.objects.create(
                    recipient=recipient,
                    sender=new_user,
                    notification_type='new_user',
                    title=f'New {new_user.userlevel} Created',
                    message=f'A new {new_user.userlevel} ({new_user.email}) has been created in the system.'
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
        return User.objects.exclude(userlevel="Admin").order_by('-updated_at')  # NEW: Order by updated_at


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
        
        # This will automatically update the updated_at field due to auto_now=True
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
        user.updated_at = timezone.now()  # NEW: Explicitly update timestamp
        user.save()
        return Response({
            'is_active': user.is_active,
            'updated_at': user.updated_at  # NEW: Return updated timestamp
        }, status=status.HTTP_200_OK)
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
    user.updated_at = timezone.now()  # NEW: Explicitly update timestamp
    user.save()

    return Response({
        'detail': 'Password changed successfully.',
        'updated_at': user.updated_at  # NEW: Return updated timestamp
    })


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
    user.updated_at = timezone.now()  # NEW: Explicitly update timestamp
    user.save()
    
    # Clear OTP from cache after successful reset
    cache.delete(f"otp_{email}")
    
    return Response({
        'detail': 'Password reset successfully.',
        'updated_at': user.updated_at  # NEW: Return updated timestamp
    }, status=status.HTTP_200_OK)