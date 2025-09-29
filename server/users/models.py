# users/models.py (updated)
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        if not password:
            from django.conf import settings
            password = settings.DEFAULT_USER_PASSWORD  # use .env default
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    USERLEVEL_CHOICES = [
        ("Admin", "Admin"),
        ("Legal Unit", "Legal Unit"),
        ("Division Chief", "Division Chief"),
        ("Section Chief", "Section Chief"),
        ("Unit Head", "Unit Head"),
        ("Monitoring Personnel", "Monitoring Personnel"),
    ]

    SECTION_CHOICES = [
        ("PD-1586", "PD-1586"),
        ("RA-6969", "RA-6969"),
        ("RA-8749", "RA-8749"),
        ("RA-9275", "RA-9275"),
        ("RA-9003", "RA-9003"),
    ]

    DISTRICT_CHOICES = [
        ("1st District", "1st District"),
        ("2nd District", "2nd District"),
        ("3rd District", "3rd District"),
    ]
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=150, blank=True)
    middle_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    userlevel = models.CharField(max_length=50, choices=USERLEVEL_CHOICES, blank=True)
    section = models.CharField(max_length=50, choices=SECTION_CHOICES, null=True, blank=True)
    district = models.CharField(max_length=100, choices=DISTRICT_CHOICES, null=True, blank=True)  # Make it optional


    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)  # NEW: Auto-update timestamp
    is_first_login = models.BooleanField(default=True)
    must_change_password = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return f"{self.email} ({self.userlevel})"

    def save(self, *args, **kwargs):
        # Update the updated_at field on every save
        if self.pk:  # Only update if the object already exists
            self.updated_at = timezone.now()
        super().save(*args, **kwargs)