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
from .utils.otp_utils import generate_otp, verify_otp, send_otp_email
from django.core.cache import cache
from django.utils import timezone
from django.db.models import Q

# Import from system_config for password generation
# from system_config.models import SystemConfiguration  # No longer needed in views

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

            # 📌 Log user creation
            log_activity(
                request.user if request.user.is_authenticated else None,
                "create",
                f"New user registered: {user.email} with auto-generated password",
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
    
    def list(self, request, *args, **kwargs):
        # Get pagination parameters
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        
        # Get filtered queryset
        queryset = self.get_queryset()
        
        # Apply search filter if provided
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(section__icontains=search)
            )
        
        # Apply role filter if provided
        role = request.query_params.get('role')
        if role:
            queryset = queryset.filter(userlevel=role)
        
        # Apply status filter if provided
        status = request.query_params.get('status')
        if status:
            if status == 'active':
                queryset = queryset.filter(is_active=True)
            elif status == 'inactive':
                queryset = queryset.filter(is_active=False)
        
        # Calculate pagination
        total_count = queryset.count()
        start_index = (page - 1) * page_size
        end_index = start_index + page_size
        
        # Apply pagination
        users = queryset[start_index:end_index]
        
        # Serialize data
        serializer = self.get_serializer(users, many=True)
        
        # Return paginated response
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size,
            'results': serializer.data
        })


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
        new_active_status = not user.is_active
        
        # Validate user level constraints when activating
        if new_active_status:
            validation_error = validate_user_level_constraints_for_activation(user)
            if validation_error:
                return Response({'detail': validation_error}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_active = new_active_status
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

def validate_user_level_constraints_for_activation(user):
    """Validate user level constraints when activating a user"""
    from django.db.models import Q
    
    # Division Chief: Only one active
    if user.userlevel == "Division Chief":
        existing_active = User.objects.filter(
            userlevel="Division Chief", 
            is_active=True
        ).exclude(id=user.id).first()
        if existing_active:
            return f"Only one active Division Chief is allowed. Currently active: {existing_active.email}"
    
    # Section Chief: Only one active per law (section)
    elif user.userlevel == "Section Chief":
        if user.section:
            existing_active = User.objects.filter(
                userlevel="Section Chief", 
                section=user.section, 
                is_active=True
            ).exclude(id=user.id).first()
            if existing_active:
                return f"Only one active Section Chief is allowed per law. Currently active for {user.section}: {existing_active.email}"
    
    # Unit Head: Only one active per law (section)
    elif user.userlevel == "Unit Head":
        if user.section:
            existing_active = User.objects.filter(
                userlevel="Unit Head", 
                section=user.section, 
                is_active=True
            ).exclude(id=user.id).first()
            if existing_active:
                return f"Only one active Unit Head is allowed per law. Currently active for {user.section}: {existing_active.email}"
    
    # Legal Unit and Monitoring Personnel: Multiple allowed (no validation needed)
    
    return None  # No validation error


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

    # Don't allow reusing the same password
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


# ---------------------------
# District User Management
# ---------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def district_users_list(request):
    """Get users filtered by role and district for district management"""
    # Get filter parameters
    userlevel = request.query_params.get('userlevel')
    district = request.query_params.get('district')
    section = request.query_params.get('section')
    
    # Filter only Section Chief, Unit Head, and Monitoring Personnel
    queryset = User.objects.filter(
        userlevel__in=["Section Chief", "Unit Head", "Monitoring Personnel"]
    ).order_by('district', 'section', 'userlevel', 'last_name')
    
    # Apply filters if provided
    if userlevel:
        queryset = queryset.filter(userlevel=userlevel)
    if district:
        queryset = queryset.filter(district=district)
    if section:
        queryset = queryset.filter(section=section)
    
    serializer = UserSerializer(queryset, many=True)
    return Response({
        'results': serializer.data,
        'count': queryset.count()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_district(request, pk):
    """Assign or update district for a user (Admin, Section Chief, or Unit Head only)"""
    # Check if user is Admin, Section Chief, or Unit Head
    if request.user.userlevel not in ["Admin", "Section Chief", "Unit Head"]:
        return Response({
            'detail': 'Only Admin, Section Chief, or Unit Head can assign districts.'
        }, status=status.HTTP_403_FORBIDDEN)
    try:
        user = User.objects.get(pk=pk)
        district = request.data.get('district')
        
        # Validate user type
        if user.userlevel not in ["Section Chief", "Unit Head", "Monitoring Personnel"]:
            return Response({
                'detail': 'Only Section Chief, Unit Head, and Monitoring Personnel can be assigned to districts.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate district
        valid_districts = [choice[0] for choice in User.DISTRICT_CHOICES]
        if district and district not in valid_districts:
            return Response({
                'detail': f'Invalid district. Must be one of: {", ".join(valid_districts)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for existing active user with same role, section, and district
        if district and user.is_active:
            existing = User.objects.filter(
                userlevel=user.userlevel,
                section=user.section,
                district=district,
                is_active=True
            ).exclude(id=user.id).first()
            
            if existing:
                return Response({
                    'detail': f'An active {user.userlevel} for {user.section} in {district} already exists: {existing.email}'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update district
        user.district = district
        user.updated_at = timezone.now()
        user.save()
        
        log_activity(
            request.user,
            "update",
            f"Assigned district {district} to {user.email}",
            request=request
        )
        
        return Response({
            'message': 'District assigned successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)