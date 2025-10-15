from rest_framework import serializers
from .models import User 
from notifications.models import Notification
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from system_config.models import SystemConfiguration  # Import from system_config
from .signals import user_created_with_password

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
            'district',
        )

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
        
        # District is now completely optional - no validation required

        return data

    def validate_user_level_constraints(self, userlevel, section):
        """Validate user level constraints based on business rules"""
        from .models import User
        
        # Division Chief: Only one active
        if userlevel == "Division Chief":
            existing_active = User.objects.filter(userlevel="Division Chief", is_active=True).first()
            if existing_active:
                raise serializers.ValidationError({
                    "userlevel": f"Only one active Division Chief is allowed. Currently active: {existing_active.email}"
                })
        
        # Section Chief: Only one active per law (section)
        elif userlevel == "Section Chief":
            if section:
                existing_active = User.objects.filter(
                    userlevel="Section Chief", 
                    section=section, 
                    is_active=True
                ).first()
                if existing_active:
                    raise serializers.ValidationError({
                        "userlevel": f"Only one active Section Chief is allowed per law. Currently active for {section}: {existing_active.email}"
                    })
        
        # Unit Head: Only one active per law (section)
        elif userlevel == "Unit Head":
            if section:
                existing_active = User.objects.filter(
                    userlevel="Unit Head", 
                    section=section, 
                    is_active=True
                ).first()
                if existing_active:
                    raise serializers.ValidationError({
                        "userlevel": f"Only one active Unit Head is allowed per law. Currently active for {section}: {existing_active.email}"
                    })
        
        # Monitoring Personnel: Only one active per law per district
        elif userlevel == "Monitoring Personnel":
            if section:
                # Get district from the request data if available
                district = self.initial_data.get("district")
                if district:
                    existing_active = User.objects.filter(
                        userlevel="Monitoring Personnel", 
                        section=section, 
                        district=district,
                        is_active=True
                    ).first()
                    if existing_active:
                        raise serializers.ValidationError({
                            "userlevel": f"Only one active Monitoring Personnel is allowed per law per district. Currently active for {section} in {district}: {existing_active.email}"
                        })
        
        # Legal Unit: Multiple allowed (no validation needed)

    def create(self, validated_data):
        # Generate password once and pass it to create_user
        generated_password = SystemConfiguration.generate_default_password()
        # Pass password_provided as a separate parameter to avoid model field conflict
        user = User.objects.create_user(
            password=generated_password, 
            password_provided=True,
            **validated_data
        )
        
        # Send the custom signal with the generated password
        user_created_with_password.send(
            sender=self.__class__,
            user=user,
            password=generated_password
        )
        
        return user


class UserSerializer(serializers.ModelSerializer):
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
            'district',
            'date_joined',
            'updated_at',  # NEW: Include updated_at field
            'is_active',
            'must_change_password',  # Required for forced password change on first login
            'is_first_login',  # Track if user has logged in before
        )

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
        
        # District is now completely optional - no validation required

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
        
        # Monitoring Personnel: Only one active per law per district (excluding current user)
        elif userlevel == "Monitoring Personnel":
            if section:
                # Get district from the request data if available
                district = self.initial_data.get("district")
                if district:
                    existing_active = User.objects.filter(
                        userlevel="Monitoring Personnel", 
                        section=section, 
                        district=district,
                        is_active=True
                    ).exclude(id=current_user.id).first()
                    if existing_active:
                        raise serializers.ValidationError({
                            "userlevel": f"Only one active Monitoring Personnel is allowed per law per district. Currently active for {section} in {district}: {existing_active.email}"
                        })
        
        # Legal Unit: Multiple allowed (no validation needed)


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