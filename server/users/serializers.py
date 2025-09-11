from rest_framework import serializers
from .models import User
from django.conf import settings

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
            data["section"] = None

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
        )
