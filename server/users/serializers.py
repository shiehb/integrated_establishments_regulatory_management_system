from rest_framework import serializers
from .models import User
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

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
        )

    def validate(self, data):
        userlevel = data.get("userlevel")
        section = data.get("section")

        if userlevel in ["sectionchief", "unithead", "monitoringpersonnel"]:
            if not section:
                raise serializers.ValidationError({
                    "section": "This field is required for this user level."
                })
        else:
            data["section"] = ""

        return data

    def create(self, validated_data):
        # Always use default password from .env
        default_password = getattr(settings, "DEFAULT_USER_PASSWORD", "Temp1234")
        user = User.objects.create_user(password=default_password, **validated_data)
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
            'date_joined',
            'is_active',  # ✅ Added this field
        )

# serializers.py
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['must_change_password'] = user.must_change_password
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        default_password = getattr(settings, "DEFAULT_USER_PASSWORD", "Temp1234")

        # Force password change if first login or still using default password
        if self.user.is_first_login or self.user.check_password(default_password):
            self.user.must_change_password = True
            self.user.save()

        data['must_change_password'] = self.user.must_change_password
        return data

