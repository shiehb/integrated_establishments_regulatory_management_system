# establishments/serializers.py
from rest_framework import serializers
from .models import Establishment
from django.core.exceptions import ValidationError

class EstablishmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Establishment
        fields = '__all__'
    
    def validate(self, data):
        # Check for case-insensitive duplicates
        name = data.get('name')
        if name:
            # For updates, exclude current instance
            instance = self.instance
            queryset = Establishment.objects.filter(name__iexact=name)
            if instance:
                queryset = queryset.exclude(pk=instance.pk)
            
            if queryset.exists():
                raise serializers.ValidationError({
                    'name': ['An establishment with this name already exists.']
                })
        return data