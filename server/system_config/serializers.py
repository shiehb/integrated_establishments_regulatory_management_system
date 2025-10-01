from rest_framework import serializers
from .models import SystemConfiguration

class SystemConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfiguration
        fields = [
            'id',
            'email_host',
            'email_port', 
            'email_use_tls',
            'email_host_user',
            'email_host_password',
            'default_from_email',
            'access_token_lifetime_minutes',
            'refresh_token_lifetime_days',
            'rotate_refresh_tokens',
            'blacklist_after_rotation',
            'created_at',
            'updated_at',
            'is_active'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_active']
    
    def validate_email_port(self, value):
        """Validate email port is within valid range"""
        if not (1 <= value <= 65535):
            raise serializers.ValidationError("Email port must be between 1 and 65535")
        return value
    
    def validate_access_token_lifetime_minutes(self, value):
        """Validate access token lifetime is reasonable"""
        if value < 5:
            raise serializers.ValidationError("Access token lifetime must be at least 5 minutes")
        if value > 1440:  # 24 hours
            raise serializers.ValidationError("Access token lifetime cannot exceed 24 hours (1440 minutes)")
        return value
    
    def validate_refresh_token_lifetime_days(self, value):
        """Validate refresh token lifetime is reasonable"""
        if value < 1:
            raise serializers.ValidationError("Refresh token lifetime must be at least 1 day")
        if value > 365:
            raise serializers.ValidationError("Refresh token lifetime cannot exceed 365 days")
        return value

class SystemConfigurationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating configuration with password masking"""
    email_host_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = SystemConfiguration
        fields = [
            'email_host',
            'email_port',
            'email_use_tls', 
            'email_host_user',
            'email_host_password',
            'default_from_email',
            'access_token_lifetime_minutes',
            'refresh_token_lifetime_days',
            'rotate_refresh_tokens',
            'blacklist_after_rotation'
        ]
    
    def validate_email_host_password(self, value):
        """Handle password updates - only update if provided"""
        if value == "":
            # If empty string, don't update the password
            return None
        return value
    
    def update(self, instance, validated_data):
        """Custom update to handle password masking"""
        # If password is None (empty string), don't update it
        if 'email_host_password' in validated_data and validated_data['email_host_password'] is None:
            validated_data.pop('email_host_password')
        
        return super().update(instance, validated_data)