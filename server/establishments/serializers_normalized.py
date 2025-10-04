from rest_framework import serializers
from .models_normalized import (
    Establishment, BusinessType, Province, City, Barangay,
    EstablishmentStatus, EstablishmentType, EstablishmentHistory, EstablishmentDocument
)
from django.core.exceptions import ValidationError


class BusinessTypeSerializer(serializers.ModelSerializer):
    """Serializer for BusinessType model"""
    establishments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BusinessType
        fields = [
            'id', 'code', 'name', 'description', 'category', 'is_active',
            'created_at', 'updated_at', 'establishments_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'establishments_count']
    
    def get_establishments_count(self, obj):
        """Get number of establishments with this business type"""
        return obj.establishments.filter(is_active=True).count()


class ProvinceSerializer(serializers.ModelSerializer):
    """Serializer for Province model"""
    cities_count = serializers.SerializerMethodField()
    establishments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Province
        fields = [
            'id', 'code', 'name', 'region', 'description', 'is_active',
            'created_at', 'updated_at', 'cities_count', 'establishments_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'cities_count', 'establishments_count']
    
    def get_cities_count(self, obj):
        """Get number of cities in this province"""
        return obj.cities.filter(is_active=True).count()
    
    def get_establishments_count(self, obj):
        """Get number of establishments in this province"""
        return obj.establishments.filter(is_active=True).count()


class CitySerializer(serializers.ModelSerializer):
    """Serializer for City model"""
    province_name = serializers.CharField(source='province.name', read_only=True)
    province_code = serializers.CharField(source='province.code', read_only=True)
    region = serializers.CharField(source='province.region', read_only=True)
    barangays_count = serializers.SerializerMethodField()
    establishments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = City
        fields = [
            'id', 'code', 'name', 'province', 'province_name', 'province_code', 'region',
            'city_type', 'is_active', 'created_at', 'updated_at',
            'barangays_count', 'establishments_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'province_name', 'province_code', 'region', 'barangays_count', 'establishments_count']
    
    def get_barangays_count(self, obj):
        """Get number of barangays in this city"""
        return obj.barangays.filter(is_active=True).count()
    
    def get_establishments_count(self, obj):
        """Get number of establishments in this city"""
        return obj.establishments.filter(is_active=True).count()


class BarangaySerializer(serializers.ModelSerializer):
    """Serializer for Barangay model"""
    city_name = serializers.CharField(source='city.name', read_only=True)
    city_code = serializers.CharField(source='city.code', read_only=True)
    province_name = serializers.CharField(source='city.province.name', read_only=True)
    province_code = serializers.CharField(source='city.province.code', read_only=True)
    region = serializers.CharField(source='city.province.region', read_only=True)
    establishments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Barangay
        fields = [
            'id', 'code', 'name', 'city', 'city_name', 'city_code',
            'province_name', 'province_code', 'region', 'barangay_type',
            'is_active', 'created_at', 'updated_at', 'establishments_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'city_name', 'city_code', 'province_name', 'province_code', 'region', 'establishments_count']
    
    def get_establishments_count(self, obj):
        """Get number of establishments in this barangay"""
        return obj.establishments.filter(is_active=True).count()


class EstablishmentStatusSerializer(serializers.ModelSerializer):
    """Serializer for EstablishmentStatus model"""
    establishments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = EstablishmentStatus
        fields = [
            'id', 'code', 'name', 'description', 'is_active',
            'created_at', 'updated_at', 'establishments_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'establishments_count']
    
    def get_establishments_count(self, obj):
        """Get number of establishments with this status"""
        return obj.establishments.filter(is_active=True).count()


class EstablishmentTypeSerializer(serializers.ModelSerializer):
    """Serializer for EstablishmentType model"""
    establishments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = EstablishmentType
        fields = [
            'id', 'code', 'name', 'description', 'requires_license', 'is_active',
            'created_at', 'updated_at', 'establishments_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'establishments_count']
    
    def get_establishments_count(self, obj):
        """Get number of establishments of this type"""
        return obj.establishments.filter(is_active=True).count()


class EstablishmentDocumentSerializer(serializers.ModelSerializer):
    """Serializer for EstablishmentDocument model"""
    uploaded_by_name = serializers.CharField(source='uploaded_by.email', read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = EstablishmentDocument
        fields = [
            'id', 'document_type', 'title', 'description', 'file_path',
            'file_size', 'file_size_mb', 'uploaded_by', 'uploaded_by_name',
            'uploaded_at', 'is_active'
        ]
        read_only_fields = ['id', 'uploaded_at', 'uploaded_by_name', 'file_size_mb']
    
    def get_file_size_mb(self, obj):
        """Get file size in MB"""
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return None


class EstablishmentHistorySerializer(serializers.ModelSerializer):
    """Serializer for EstablishmentHistory model"""
    changed_by_name = serializers.CharField(source='changed_by.email', read_only=True)
    establishment_name = serializers.CharField(source='establishment.name', read_only=True)
    
    class Meta:
        model = EstablishmentHistory
        fields = [
            'id', 'establishment', 'establishment_name', 'changed_by', 'changed_by_name',
            'change_type', 'old_values', 'new_values', 'reason', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp', 'establishment_name', 'changed_by_name']


class EstablishmentSerializer(serializers.ModelSerializer):
    """Enhanced serializer for Establishment model with normalized relationships"""
    # Related object names for display
    business_type_name = serializers.CharField(source='business_type.name', read_only=True)
    business_type_code = serializers.CharField(source='business_type.code', read_only=True)
    establishment_type_name = serializers.CharField(source='establishment_type.name', read_only=True)
    establishment_type_code = serializers.CharField(source='establishment_type.code', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    status_code = serializers.CharField(source='status.code', read_only=True)
    province_name = serializers.CharField(source='province.name', read_only=True)
    province_code = serializers.CharField(source='province.code', read_only=True)
    city_name = serializers.CharField(source='city.name', read_only=True)
    city_code = serializers.CharField(source='city.code', read_only=True)
    barangay_name = serializers.CharField(source='barangay.name', read_only=True)
    barangay_code = serializers.CharField(source='barangay.code', read_only=True)
    created_by_name = serializers.CharField(source='created_by.email', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.email', read_only=True)
    
    # Related objects
    business_type_details = BusinessTypeSerializer(source='business_type', read_only=True)
    establishment_type_details = EstablishmentTypeSerializer(source='establishment_type', read_only=True)
    status_details = EstablishmentStatusSerializer(source='status', read_only=True)
    province_details = ProvinceSerializer(source='province', read_only=True)
    city_details = CitySerializer(source='city', read_only=True)
    barangay_details = BarangaySerializer(source='barangay', read_only=True)
    
    # Computed fields
    full_address = serializers.SerializerMethodField()
    location_hierarchy = serializers.SerializerMethodField()
    compliance_status = serializers.SerializerMethodField()
    is_license_expired = serializers.SerializerMethodField()
    is_permit_expired = serializers.SerializerMethodField()
    
    # Related data
    documents = EstablishmentDocumentSerializer(many=True, read_only=True)
    history = EstablishmentHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Establishment
        fields = [
            'id', 'name', 'registration_number', 'tin_number',
            'business_type', 'business_type_name', 'business_type_code', 'business_type_details',
            'establishment_type', 'establishment_type_name', 'establishment_type_code', 'establishment_type_details',
            'status', 'status_name', 'status_code', 'status_details',
            'province', 'province_name', 'province_code', 'province_details',
            'city', 'city_name', 'city_code', 'city_details',
            'barangay', 'barangay_name', 'barangay_code', 'barangay_details',
            'street_building', 'postal_code', 'full_address', 'location_hierarchy',
            'latitude', 'longitude', 'polygon',
            'year_established', 'employee_count', 'capital_investment',
            'contact_person', 'contact_phone', 'contact_email', 'website',
            'license_number', 'license_expiry', 'permit_number', 'permit_expiry',
            'compliance_status', 'is_license_expired', 'is_permit_expired',
            'is_active', 'created_by', 'created_by_name', 'updated_by', 'updated_by_name',
            'created_at', 'updated_at', 'documents', 'history'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'created_by_name', 'updated_by_name',
            'full_address', 'location_hierarchy', 'compliance_status',
            'is_license_expired', 'is_permit_expired', 'documents', 'history'
        ]
    
    def get_full_address(self, obj):
        """Get the complete address as a string"""
        return obj.get_full_address()
    
    def get_location_hierarchy(self, obj):
        """Get the complete location hierarchy"""
        return obj.get_location_hierarchy()
    
    def get_compliance_status(self, obj):
        """Get the overall compliance status"""
        return obj.get_compliance_status()
    
    def get_is_license_expired(self, obj):
        """Check if the establishment's license is expired"""
        return obj.is_license_expired()
    
    def get_is_permit_expired(self, obj):
        """Check if the establishment's permit is expired"""
        return obj.is_permit_expired()
    
    def validate(self, data):
        """Validate establishment data"""
        # Check for case-insensitive name duplicates
        name = data.get('name')
        if name:
            instance = self.instance
            queryset = Establishment.objects.filter(name__iexact=name)
            if instance:
                queryset = queryset.exclude(pk=instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError({
                    'name': ['An establishment with this name already exists.']
                })
        
        # Validate year_established
        year_established = data.get('year_established')
        if year_established:
            from django.utils import timezone
            current_year = timezone.now().year
            if year_established < 1800 or year_established > current_year:
                raise serializers.ValidationError({
                    'year_established': f'Year established must be between 1800 and {current_year}'
                })
        
        # Validate coordinates
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if latitude is not None and (latitude < -90 or latitude > 90):
            raise serializers.ValidationError({
                'latitude': 'Latitude must be between -90 and 90'
            })
        
        if longitude is not None and (longitude < -180 or longitude > 180):
            raise serializers.ValidationError({
                'longitude': 'Longitude must be between -180 and 180'
            })
        
        # Validate location hierarchy
        barangay = data.get('barangay')
        city = data.get('city')
        province = data.get('province')
        
        if barangay and city and barangay.city != city:
            raise serializers.ValidationError({
                'barangay': 'Barangay must belong to the selected city'
            })
        
        if city and province and city.province != province:
            raise serializers.ValidationError({
                'city': 'City must belong to the selected province'
            })
        
        return data


class EstablishmentListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for establishment lists"""
    business_type_name = serializers.CharField(source='business_type.name', read_only=True)
    establishment_type_name = serializers.CharField(source='establishment_type.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    province_name = serializers.CharField(source='province.name', read_only=True)
    city_name = serializers.CharField(source='city.name', read_only=True)
    barangay_name = serializers.CharField(source='barangay.name', read_only=True)
    full_address = serializers.SerializerMethodField()
    compliance_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Establishment
        fields = [
            'id', 'name', 'registration_number', 'tin_number',
            'business_type_name', 'establishment_type_name', 'status_name',
            'province_name', 'city_name', 'barangay_name', 'full_address',
            'year_established', 'employee_count', 'contact_person', 'contact_phone',
            'license_number', 'license_expiry', 'permit_number', 'permit_expiry',
            'compliance_status', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'full_address', 'compliance_status']
    
    def get_full_address(self, obj):
        """Get the complete address as a string"""
        return obj.get_full_address()
    
    def get_compliance_status(self, obj):
        """Get the overall compliance status"""
        return obj.get_compliance_status()


class EstablishmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating establishments"""
    
    class Meta:
        model = Establishment
        fields = [
            'name', 'registration_number', 'tin_number',
            'business_type', 'establishment_type', 'status',
            'province', 'city', 'barangay', 'street_building', 'postal_code',
            'latitude', 'longitude', 'polygon',
            'year_established', 'employee_count', 'capital_investment',
            'contact_person', 'contact_phone', 'contact_email', 'website',
            'license_number', 'license_expiry', 'permit_number', 'permit_expiry',
            'is_active'
        ]
    
    def validate(self, data):
        """Validate establishment creation data"""
        # Check for case-insensitive name duplicates
        name = data.get('name')
        if name:
            if Establishment.objects.filter(name__iexact=name).exists():
                raise serializers.ValidationError({
                    'name': ['An establishment with this name already exists.']
                })
        
        # Validate year_established
        year_established = data.get('year_established')
        if year_established:
            from django.utils import timezone
            current_year = timezone.now().year
            if year_established < 1800 or year_established > current_year:
                raise serializers.ValidationError({
                    'year_established': f'Year established must be between 1800 and {current_year}'
                })
        
        # Validate coordinates
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if latitude is not None and (latitude < -90 or latitude > 90):
            raise serializers.ValidationError({
                'latitude': 'Latitude must be between -90 and 90'
            })
        
        if longitude is not None and (longitude < -180 or longitude > 180):
            raise serializers.ValidationError({
                'longitude': 'Longitude must be between -180 and 180'
            })
        
        # Validate location hierarchy
        barangay = data.get('barangay')
        city = data.get('city')
        province = data.get('province')
        
        if barangay and city and barangay.city != city:
            raise serializers.ValidationError({
                'barangay': 'Barangay must belong to the selected city'
            })
        
        if city and province and city.province != province:
            raise serializers.ValidationError({
                'city': 'City must belong to the selected province'
            })
        
        return data


class EstablishmentUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating establishments"""
    
    class Meta:
        model = Establishment
        fields = [
            'name', 'registration_number', 'tin_number',
            'business_type', 'establishment_type', 'status',
            'province', 'city', 'barangay', 'street_building', 'postal_code',
            'latitude', 'longitude', 'polygon',
            'year_established', 'employee_count', 'capital_investment',
            'contact_person', 'contact_phone', 'contact_email', 'website',
            'license_number', 'license_expiry', 'permit_number', 'permit_expiry',
            'is_active'
        ]
    
    def validate(self, data):
        """Validate establishment update data"""
        # Check for case-insensitive name duplicates (excluding current instance)
        name = data.get('name')
        if name:
            instance = self.instance
            queryset = Establishment.objects.filter(name__iexact=name)
            if instance:
                queryset = queryset.exclude(pk=instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError({
                    'name': ['An establishment with this name already exists.']
                })
        
        # Validate year_established
        year_established = data.get('year_established')
        if year_established:
            from django.utils import timezone
            current_year = timezone.now().year
            if year_established < 1800 or year_established > current_year:
                raise serializers.ValidationError({
                    'year_established': f'Year established must be between 1800 and {current_year}'
                })
        
        # Validate coordinates
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        
        if latitude is not None and (latitude < -90 or latitude > 90):
            raise serializers.ValidationError({
                'latitude': 'Latitude must be between -90 and 90'
            })
        
        if longitude is not None and (longitude < -180 or longitude > 180):
            raise serializers.ValidationError({
                'longitude': 'Longitude must be between -180 and 180'
            })
        
        # Validate location hierarchy
        barangay = data.get('barangay')
        city = data.get('city')
        province = data.get('province')
        
        if barangay and city and barangay.city != city:
            raise serializers.ValidationError({
                'barangay': 'Barangay must belong to the selected city'
            })
        
        if city and province and city.province != province:
            raise serializers.ValidationError({
                'city': 'City must belong to the selected province'
            })
        
        return data
