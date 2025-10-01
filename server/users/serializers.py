from rest_framework import serializers
from .models import User 
from notifications.models import Notification
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from system_config.models import SystemConfiguration  # Import from system_config

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
        
        # District is now completely optional - no validation required

        return data

    def create(self, validated_data):
        # Use auto-generated password from system_config
        generated_password = SystemConfiguration.generate_default_password()
        user = User.objects.create_user(password=generated_password, **validated_data)
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
        
        # District is now completely optional - no validation required

        return data


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