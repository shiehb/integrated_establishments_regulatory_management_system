from rest_framework import serializers
from .models import User 
from notifications.models import Notification
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from system_config.models import SystemConfiguration  # Import from system_config
from .signals import user_created_with_password
from .utils.image_utils import optimize_avatar
import logging

logger = logging.getLogger(__name__)

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'middle_name',
            'last_name',
            'userlevel',
            'section',
            'avatar',
        )

    def validate_avatar(self, value):
        """Validate avatar file size before processing"""
        if value:
            # Check file size (max 5MB - will be optimized after upload)
            max_size = 5 * 1024 * 1024  # 5MB
            if value.size > max_size:
                raise serializers.ValidationError(
                    f"Avatar file size must be less than 5MB. Current size: {value.size / 1024 / 1024:.2f}MB. The image will be automatically optimized after upload."
                )
        return value

    def validate(self, data):
        userlevel = data.get("userlevel")
        section = data.get("section")

        # For Admin, Legal Unit, and Division Chief - section must be null/empty
        if userlevel in ["Admin", "Legal Unit", "Division Chief"]:
            if section:
                raise serializers.ValidationError({
                    "section": "Section must be empty for Admin, Legal Unit, and Division Chief users."
                })
            data["section"] = None
        
        # For Section Chief, Unit Head, and Monitoring Personnel - section is required
        elif userlevel in ["Section Chief", "Unit Head", "Monitoring Personnel"]:
            if not section:
                raise serializers.ValidationError({
                    "section": "This field is required for Section Chief, Unit Head, and Monitoring Personnel users."
                })
        
        # Validate user level constraints
        self.validate_user_level_constraints(userlevel, section)

        return data

    def validate_user_level_constraints(self, userlevel, section):
        """Validate user level constraints based on business rules"""
        from .models import User
        
        # Division Chief, Section Chief, and Unit Head: Auto-deactivate existing users in create()
        # No validation errors - they will be auto-deactivated when new user is created
        
        # Monitoring Personnel: Only one active per law
        if userlevel == "Monitoring Personnel":
            if section:
                existing_active = User.objects.filter(
                    userlevel="Monitoring Personnel", 
                    section=section, 
                    is_active=True
                ).first()
                if existing_active:
                    raise serializers.ValidationError({
                        "userlevel": f"Only one active Monitoring Personnel is allowed per law. Currently active for {section}: {existing_active.email}"
                    })
        
        # Legal Unit: Multiple allowed (no validation needed)

    def create(self, validated_data):
        # Extract avatar if present
        avatar = validated_data.pop('avatar', None)
        
        # Get userlevel and section for auto-deactivation logic
        userlevel = validated_data.get('userlevel')
        section = validated_data.get('section')
        
        # Auto-deactivate existing active users with matching userlevel and section
        # This applies to Division Chief, Section Chief, and Unit Head
        deactivated_users = []
        if userlevel in ["Division Chief", "Section Chief", "Unit Head"]:
            from django.utils import timezone
            from audit.utils import log_activity
            from .utils.email_utils import send_account_deactivated_email
            
            # Build query based on userlevel
            query = User.objects.filter(
                userlevel=userlevel,
                is_active=True
            )
            
            # For Section Chief and Unit Head, also filter by section
            if userlevel in ["Section Chief", "Unit Head"]:
                if section:
                    query = query.filter(section=section)
            # For Division Chief, no section filter needed
            
            # Find and deactivate existing active users
            existing_users = query.all()
            for old_user in existing_users:
                old_user.is_active = False
                old_user.updated_at = timezone.now()
                old_user.save(update_fields=['is_active', 'updated_at'])
                
                # Log the deactivation
                try:
                    # Try to get request from context if available
                    request = self.context.get('request')
                    log_activity(
                        request.user if request and hasattr(request, 'user') and request.user.is_authenticated else None,
                        "update",
                        f"Auto-deactivated user {old_user.email} ({old_user.userlevel}) due to new user creation",
                        request=request if request else None
                    )
                except Exception as e:
                    logger.error(f"Failed to log deactivation activity: {str(e)}")
                
                # Send deactivation email
                try:
                    request = self.context.get('request')
                    ip_address = None
                    user_agent = ''
                    
                    if request:
                        ip_address = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', 'Unknown'))
                        if ',' in ip_address:
                            ip_address = ip_address.split(',')[0].strip()
                        user_agent = request.META.get('HTTP_USER_AGENT', '')
                    
                    # Get the user who created the new account (if authenticated)
                    deactivated_by = None
                    if request and hasattr(request, 'user') and request.user.is_authenticated:
                        deactivated_by = request.user
                    
                    send_account_deactivated_email(
                        user=old_user,
                        deactivated_by=deactivated_by,
                        ip_address=ip_address,
                        user_agent=user_agent
                    )
                except Exception as e:
                    logger.error(f"Failed to send deactivation email to {old_user.email}: {str(e)}")
                
                deactivated_users.append(old_user)
        
        # Generate password once and pass it to create_user
        generated_password = SystemConfiguration.generate_default_password()
        
        # Create user first to get user ID
        user = User.objects.create_user(
            password=generated_password, 
            password_provided=True,
            **validated_data
        )
        
        # Optimize and save avatar if provided
        if avatar:
            try:
                optimized_avatar = optimize_avatar(avatar, user.id)
                user.avatar = optimized_avatar
                user.save(update_fields=['avatar'])
            except Exception as e:
                logger.error(f"Failed to optimize avatar for user {user.id}: {str(e)}")
                # Save original if optimization fails (fallback)
                user.avatar = avatar
                user.save(update_fields=['avatar'])
        
        # Send the custom signal with the generated password
        user_created_with_password.send(
            sender=self.__class__,
            user=user,
            password=generated_password
        )
        
        return user


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = (
            'id',
            'email',
            'first_name',
            'middle_name',
            'last_name',
            'userlevel',
            'section',
            'avatar',
            'avatar_url',  # Full URL for avatar
            'date_joined',
            'last_login',
            'updated_at',  # NEW: Include updated_at field
            'is_active',
            'must_change_password',  # Required for forced password change on first login
            'is_first_login',  # Track if user has logged in before
        )
    
    def get_avatar_url(self, obj):
        """Return full URL for avatar if available"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            # Fallback if no request context
            from django.conf import settings
            base_url = getattr(settings, 'BASE_URL', 'http://127.0.0.1:8000')
            if obj.avatar.url.startswith('/'):
                return f"{base_url}{obj.avatar.url}"
            return f"{base_url}/{obj.avatar.url}"
        return None

    def validate_avatar(self, value):
        """Validate avatar file size before processing"""
        if value:
            # Check file size (max 5MB - will be optimized after upload)
            max_size = 5 * 1024 * 1024  # 5MB
            if value.size > max_size:
                raise serializers.ValidationError(
                    f"Avatar file size must be less than 5MB. Current size: {value.size / 1024 / 1024:.2f}MB. The image will be automatically optimized after upload."
                )
        return value

    def validate(self, data):
        userlevel = data.get("userlevel")
        section = data.get("section")

        # If userlevel is being updated, check the section requirements
        if userlevel:
            # For Admin, Legal Unit, and Division Chief - section must be null/empty
            if userlevel in ["Admin", "Legal Unit", "Division Chief"]:
                if section:
                    raise serializers.ValidationError({
                        "section": "Section must be empty for Admin, Legal Unit, and Division Chief users."
                    })
                data["section"] = None
            
            # For Section Chief, Unit Head, and Monitoring Personnel - section is required
            elif userlevel in ["Section Chief", "Unit Head", "Monitoring Personnel"]:
                if not section:
                    raise serializers.ValidationError({
                        "section": "This field is required for Section Chief, Unit Head, and Monitoring Personnel users."
                    })
        
        # Validate user level constraints for updates
        self.validate_user_level_constraints_for_update(userlevel, section)

        return data

    def validate_user_level_constraints_for_update(self, userlevel, section):
        """Validate user level constraints for updates, excluding current user"""
        from .models import User
        
        # Get the current user being updated
        current_user = self.instance
        
        # Division Chief: Only one active (excluding current user)
        if userlevel == "Division Chief":
            existing_active = User.objects.filter(
                userlevel="Division Chief", 
                is_active=True
            ).exclude(id=current_user.id).first()
            if existing_active:
                raise serializers.ValidationError({
                    "userlevel": f"Only one active Division Chief is allowed. Currently active: {existing_active.email}"
                })
        
        # Section Chief: Only one active per law (section) (excluding current user)
        elif userlevel == "Section Chief":
            if section:
                existing_active = User.objects.filter(
                    userlevel="Section Chief", 
                    section=section, 
                    is_active=True
                ).exclude(id=current_user.id).first()
                if existing_active:
                    raise serializers.ValidationError({
                        "userlevel": f"Only one active Section Chief is allowed per law. Currently active for {section}: {existing_active.email}"
                    })
        
        # Unit Head: Only one active per law (section) (excluding current user)
        elif userlevel == "Unit Head":
            if section:
                existing_active = User.objects.filter(
                    userlevel="Unit Head", 
                    section=section, 
                    is_active=True
                ).exclude(id=current_user.id).first()
                if existing_active:
                    raise serializers.ValidationError({
                        "userlevel": f"Only one active Unit Head is allowed per law. Currently active for {section}: {existing_active.email}"
                    })
        
        # Monitoring Personnel: Only one active per law (excluding current user)
        elif userlevel == "Monitoring Personnel":
            if section:
                existing_active = User.objects.filter(
                    userlevel="Monitoring Personnel", 
                    section=section, 
                    is_active=True
                ).exclude(id=current_user.id).first()
                if existing_active:
                    raise serializers.ValidationError({
                        "userlevel": f"Only one active Monitoring Personnel is allowed per law. Currently active for {section}: {existing_active.email}"
                    })
        
        # Legal Unit: Multiple allowed (no validation needed)

    def update(self, instance, validated_data):
        """Update user with avatar optimization"""
        # Extract avatar if present
        avatar = validated_data.pop('avatar', None)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Optimize and save avatar if provided
        if avatar:
            try:
                optimized_avatar = optimize_avatar(avatar, instance.id)
                instance.avatar = optimized_avatar
            except Exception as e:
                logger.error(f"Failed to optimize avatar for user {instance.id}: {str(e)}")
                # Save original if optimization fails (fallback)
                instance.avatar = avatar
        
        instance.save()
        return instance


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['must_change_password'] = user.must_change_password
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Check if user is using the default password (auto-generated)
        # We'll check if it's their first login instead of checking against a specific password
        if self.user.is_first_login:
            self.user.must_change_password = True
            self.user.save()  # This will update updated_at

        data['must_change_password'] = self.user.must_change_password
        return data


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'