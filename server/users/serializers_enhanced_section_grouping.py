from rest_framework import serializers
from .models_enhanced_section_grouping import (
    User, UserLevel, Section, SectionGroup, District, UserProfile, 
    UserAssignmentHistory, UserPermission
)
from notifications.models import Notification
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from system_config.models import SystemConfiguration
from .signals import user_created_with_password


class SectionGroupSerializer(serializers.ModelSerializer):
    """Serializer for SectionGroup model"""
    total_users = serializers.SerializerMethodField()
    section_chiefs_count = serializers.SerializerMethodField()
    unit_heads_count = serializers.SerializerMethodField()
    monitoring_personnel_count = serializers.SerializerMethodField()
    sections = serializers.SerializerMethodField()
    
    class Meta:
        model = SectionGroup
        fields = [
            'id', 'code', 'name', 'description', 'is_active', 'created_at', 'updated_at',
            'total_users', 'section_chiefs_count', 'unit_heads_count', 'monitoring_personnel_count', 'sections'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_total_users(self, obj):
        """Get total number of users in this section group"""
        return obj.get_all_users().count()
    
    def get_section_chiefs_count(self, obj):
        """Get number of section chiefs in this group"""
        return obj.get_all_users().filter(userlevel__code='Section Chief').count()
    
    def get_unit_heads_count(self, obj):
        """Get number of unit heads in this group"""
        return obj.get_all_users().filter(userlevel__code='Unit Head').count()
    
    def get_monitoring_personnel_count(self, obj):
        """Get number of monitoring personnel in this group"""
        return obj.get_all_users().filter(userlevel__code='Monitoring Personnel').count()
    
    def get_sections(self, obj):
        """Get sections in this group"""
        sections = obj.get_all_sections()
        return SectionSerializer(sections, many=True).data


class SectionSerializer(serializers.ModelSerializer):
    """Enhanced serializer for Section model with grouping support"""
    section_group_name = serializers.CharField(source='section_group.name', read_only=True)
    parent_section_name = serializers.CharField(source='parent_section.name', read_only=True)
    subsections = serializers.SerializerMethodField()
    combined_sections_names = serializers.SerializerMethodField()
    total_users = serializers.SerializerMethodField()
    section_chiefs_count = serializers.SerializerMethodField()
    unit_heads_count = serializers.SerializerMethodField()
    monitoring_personnel_count = serializers.SerializerMethodField()
    hierarchy_path = serializers.SerializerMethodField()
    
    class Meta:
        model = Section
        fields = [
            'id', 'code', 'name', 'description', 'section_group', 'section_group_name',
            'is_combined', 'combined_sections', 'combined_sections_names',
            'parent_section', 'parent_section_name', 'subsections',
            'is_active', 'created_at', 'updated_at',
            'total_users', 'section_chiefs_count', 'unit_heads_count', 'monitoring_personnel_count',
            'hierarchy_path'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_subsections(self, obj):
        """Get subsections"""
        subsections = obj.subsections.filter(is_active=True)
        return SectionSerializer(subsections, many=True).data
    
    def get_combined_sections_names(self, obj):
        """Get names of combined sections"""
        if obj.is_combined:
            return [section.name for section in obj.combined_sections.all()]
        return []
    
    def get_total_users(self, obj):
        """Get total number of users in this section"""
        return obj.users.filter(is_active=True).count()
    
    def get_section_chiefs_count(self, obj):
        """Get number of section chiefs in this section"""
        return obj.users.filter(is_active=True, userlevel__code='Section Chief').count()
    
    def get_unit_heads_count(self, obj):
        """Get number of unit heads in this section"""
        return obj.users.filter(is_active=True, userlevel__code='Unit Head').count()
    
    def get_monitoring_personnel_count(self, obj):
        """Get number of monitoring personnel in this section"""
        return obj.users.filter(is_active=True, userlevel__code='Monitoring Personnel').count()
    
    def get_hierarchy_path(self, obj):
        """Get the full hierarchy path for this section"""
        hierarchy = obj.get_section_hierarchy()
        return [{'id': section.id, 'code': section.code, 'name': section.name} for section in hierarchy]


class UserLevelSerializer(serializers.ModelSerializer):
    """Serializer for UserLevel model"""
    
    class Meta:
        model = UserLevel
        fields = [
            'id', 'code', 'name', 'description', 'requires_section', 'requires_district',
            'max_active_users', 'max_active_per_section', 'max_active_per_district',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DistrictSerializer(serializers.ModelSerializer):
    """Serializer for District model"""
    
    class Meta:
        model = District
        fields = [
            'id', 'code', 'name', 'province', 'description', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'phone_number', 'address', 'emergency_contact', 'emergency_phone',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserPermissionSerializer(serializers.ModelSerializer):
    """Serializer for UserPermission model"""
    granted_by_name = serializers.CharField(source='granted_by.email', read_only=True)
    is_active = serializers.SerializerMethodField()
    
    class Meta:
        model = UserPermission
        fields = [
            'id', 'permission_code', 'permission_name', 'description', 'is_granted',
            'granted_by', 'granted_by_name', 'granted_at', 'expires_at', 'is_active'
        ]
        read_only_fields = ['id', 'granted_at']
    
    def get_is_active(self, obj):
        """Check if permission is currently active"""
        return obj.is_active()


class UserAssignmentHistorySerializer(serializers.ModelSerializer):
    """Serializer for UserAssignmentHistory model"""
    old_userlevel_name = serializers.CharField(source='old_userlevel.name', read_only=True)
    new_userlevel_name = serializers.CharField(source='new_userlevel.name', read_only=True)
    old_section_name = serializers.CharField(source='old_section.name', read_only=True)
    new_section_name = serializers.CharField(source='new_section.name', read_only=True)
    old_district_name = serializers.CharField(source='old_district.name', read_only=True)
    new_district_name = serializers.CharField(source='new_district.name', read_only=True)
    changed_by_name = serializers.CharField(source='changed_by.email', read_only=True)
    
    class Meta:
        model = UserAssignmentHistory
        fields = [
            'id', 'old_userlevel', 'old_userlevel_name', 'new_userlevel', 'new_userlevel_name',
            'old_section', 'old_section_name', 'new_section', 'new_section_name',
            'old_district', 'old_district_name', 'new_district', 'new_district_name',
            'changed_by', 'changed_by_name', 'reason', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class UserSerializer(serializers.ModelSerializer):
    """Enhanced serializer for User model with section grouping support"""
    # Related object names for display
    userlevel_name = serializers.CharField(source='userlevel.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    section_group_name = serializers.CharField(source='section.section_group.name', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    
    # Related objects
    userlevel_details = UserLevelSerializer(source='userlevel', read_only=True)
    section_details = SectionSerializer(source='section', read_only=True)
    district_details = DistrictSerializer(source='district', read_only=True)
    profile = UserProfileSerializer(read_only=True)
    permissions = UserPermissionSerializer(many=True, read_only=True)
    assignment_history = UserAssignmentHistorySerializer(many=True, read_only=True)
    
    # Computed fields
    full_name = serializers.SerializerMethodField()
    can_manage_users = serializers.SerializerMethodField()
    can_assign_districts = serializers.SerializerMethodField()
    available_sections = serializers.SerializerMethodField()
    available_districts = serializers.SerializerMethodField()
    section_group_users = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'middle_name', 'last_name', 'full_name',
            'userlevel', 'userlevel_name', 'userlevel_details', 
            'section', 'section_name', 'section_group_name', 'section_details',
            'district', 'district_name', 'district_details',
            'is_staff', 'is_active', 'date_joined', 'updated_at', 'is_first_login',
            'must_change_password', 'profile', 'permissions', 'assignment_history',
            'can_manage_users', 'can_assign_districts', 'available_sections', 'available_districts',
            'section_group_users'
        ]
        read_only_fields = [
            'id', 'date_joined', 'updated_at', 'is_first_login', 'must_change_password',
            'profile', 'permissions', 'assignment_history', 'can_manage_users',
            'can_assign_districts', 'available_sections', 'available_districts', 'section_group_users'
        ]
    
    def get_full_name(self, obj):
        """Get user's full name"""
        return obj.get_full_name()
    
    def get_can_manage_users(self, obj):
        """Check if user can manage other users"""
        return obj.can_manage_users()
    
    def get_can_assign_districts(self, obj):
        """Check if user can assign districts"""
        return obj.can_assign_districts()
    
    def get_available_sections(self, obj):
        """Get sections available for this user level"""
        sections = obj.get_available_sections()
        return SectionSerializer(sections, many=True).data
    
    def get_available_districts(self, obj):
        """Get districts available for this user level"""
        districts = obj.get_available_districts()
        return DistrictSerializer(districts, many=True).data
    
    def get_section_group_users(self, obj):
        """Get users in the same section group"""
        users = obj.get_section_group_users()
        return UserListSerializer(users, many=True).data


class UserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for user lists with section grouping"""
    userlevel_name = serializers.CharField(source='userlevel.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    section_group_name = serializers.CharField(source='section.section_group.name', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'middle_name', 'last_name', 'full_name',
            'userlevel', 'userlevel_name', 'section', 'section_name', 'section_group_name',
            'district', 'district_name', 'is_active', 'date_joined', 'updated_at'
        ]
        read_only_fields = ['id', 'date_joined', 'updated_at']
    
    def get_full_name(self, obj):
        """Get user's full name"""
        return obj.get_full_name()


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration with enhanced section grouping"""
    userlevel_name = serializers.CharField(source='userlevel.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    section_group_name = serializers.CharField(source='section.section_group.name', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'middle_name', 'last_name',
            'userlevel', 'userlevel_name', 'section', 'section_name', 'section_group_name',
            'district', 'district_name', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']
    
    def validate(self, data):
        """Validate registration data"""
        userlevel = data.get('userlevel')
        section = data.get('section')
        district = data.get('district')
        
        if userlevel:
            # Check if section is required
            if userlevel.requires_section and not section:
                raise serializers.ValidationError({
                    'section': f'Section is required for {userlevel.code} users'
                })
            
            # Check if district is required
            if userlevel.requires_district and not district:
                raise serializers.ValidationError({
                    'district': f'District is required for {userlevel.code} users'
                })
            
            # Validate user level constraints
            self.validate_user_level_constraints(userlevel, section, district)
        
        return data
    
    def validate_user_level_constraints(self, userlevel, section, district):
        """Validate user level constraints based on business rules"""
        # Check maximum active users for this level
        if userlevel.max_active_users is not None:
            active_count = User.objects.filter(
                userlevel=userlevel,
                is_active=True
            ).count()
            
            if active_count >= userlevel.max_active_users:
                raise serializers.ValidationError({
                    'userlevel': f'Maximum {userlevel.max_active_users} active {userlevel.code} users allowed'
                })
        
        # Check maximum active users per section
        if section and userlevel.max_active_per_section is not None:
            active_count = User.objects.filter(
                userlevel=userlevel,
                section=section,
                is_active=True
            ).count()
            
            if active_count >= userlevel.max_active_per_section:
                raise serializers.ValidationError({
                    'section': f'Maximum {userlevel.max_active_per_section} active {userlevel.code} users allowed per section'
                })
        
        # Check maximum active users per district
        if district and userlevel.max_active_per_district is not None:
            active_count = User.objects.filter(
                userlevel=userlevel,
                district=district,
                is_active=True
            ).count()
            
            if active_count >= userlevel.max_active_per_district:
                raise serializers.ValidationError({
                    'district': f'Maximum {userlevel.max_active_per_district} active {userlevel.code} users allowed per district'
                })
    
    def create(self, validated_data):
        """Create a new user with auto-generated password"""
        # Generate password
        generated_password = SystemConfiguration.generate_default_password()
        
        # Create user
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


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating users with enhanced section grouping"""
    userlevel_name = serializers.CharField(source='userlevel.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    section_group_name = serializers.CharField(source='section.section_group.name', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'middle_name', 'last_name',
            'userlevel', 'userlevel_name', 'section', 'section_name', 'section_group_name',
            'district', 'district_name', 'is_active', 'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']
    
    def validate(self, data):
        """Validate update data"""
        userlevel = data.get('userlevel')
        section = data.get('section')
        district = data.get('district')
        
        if userlevel:
            # Check if section is required
            if userlevel.requires_section and not section:
                raise serializers.ValidationError({
                    'section': f'Section is required for {userlevel.code} users'
                })
            
            # Check if district is required
            if userlevel.requires_district and not district:
                raise serializers.ValidationError({
                    'district': f'District is required for {userlevel.code} users'
                })
            
            # Validate user level constraints for updates (excluding current user)
            self.validate_user_level_constraints_for_update(userlevel, section, district)
        
        return data
    
    def validate_user_level_constraints_for_update(self, userlevel, section, district):
        """Validate user level constraints for updates, excluding current user"""
        current_user = self.instance
        
        # Check maximum active users for this level (excluding current user)
        if userlevel.max_active_users is not None:
            active_count = User.objects.filter(
                userlevel=userlevel,
                is_active=True
            ).exclude(id=current_user.id).count()
            
            if active_count >= userlevel.max_active_users:
                raise serializers.ValidationError({
                    'userlevel': f'Maximum {userlevel.max_active_users} active {userlevel.code} users allowed'
                })
        
        # Check maximum active users per section (excluding current user)
        if section and userlevel.max_active_per_section is not None:
            active_count = User.objects.filter(
                userlevel=userlevel,
                section=section,
                is_active=True
            ).exclude(id=current_user.id).count()
            
            if active_count >= userlevel.max_active_per_section:
                raise serializers.ValidationError({
                    'section': f'Maximum {userlevel.max_active_per_section} active {userlevel.code} users allowed per section'
                })
        
        # Check maximum active users per district (excluding current user)
        if district and userlevel.max_active_per_district is not None:
            active_count = User.objects.filter(
                userlevel=userlevel,
                district=district,
                is_active=True
            ).exclude(id=current_user.id).count()
            
            if active_count >= userlevel.max_active_per_district:
                raise serializers.ValidationError({
                    'district': f'Maximum {userlevel.max_active_per_district} active {userlevel.code} users allowed per district'
                })


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer with enhanced section grouping data"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['must_change_password'] = user.must_change_password
        token['userlevel'] = user.userlevel.code if user.userlevel else None
        token['section'] = user.section.code if user.section else None
        token['section_group'] = user.section.section_group.code if user.section and user.section.section_group else None
        token['district'] = user.district.code if user.district else None
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Check if user is using the default password (auto-generated)
        if self.user.is_first_login:
            self.user.must_change_password = True
            self.user.save()
        
        data['must_change_password'] = self.user.must_change_password
        data['userlevel'] = self.user.userlevel.code if self.user.userlevel else None
        data['section'] = self.user.section.code if self.user.section else None
        data['section_group'] = self.user.section.section_group.code if self.user.section and self.user.section.section_group else None
        data['district'] = self.user.district.code if self.user.district else None
        
        return data


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications"""
    
    class Meta:
        model = Notification
        fields = '__all__'
