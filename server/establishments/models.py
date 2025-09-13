# establishments/models.py
from django.db import models

class Establishment(models.Model):
    name = models.CharField(max_length=255)
    nature_of_business = models.CharField(max_length=255)
    year_established = models.CharField(max_length=4)
    
    # Address fields
    province = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    barangay = models.CharField(max_length=100)
    street_building = models.CharField(max_length=255)
    postal_code = models.CharField(max_length=4)
    
    # Coordinates
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    # Store polygon as JSON instead of GIS field
    polygon = models.JSONField(blank=True, null=True)
    
    # Status and timestamps
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']

        