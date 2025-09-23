from django.contrib import admin
from .models import ActivityLog

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("user", "action", "message", "ip_address", "created_at")
    list_filter = ("action", "created_at")
    search_fields = ("user__username", "message", "ip_address")
