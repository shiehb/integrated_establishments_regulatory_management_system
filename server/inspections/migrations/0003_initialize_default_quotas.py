# Generated manually for auto-initializing default quotas

from django.db import migrations
from datetime import datetime


def initialize_default_quotas(apps, schema_editor):
    """
    Initialize default quotas for all 5 environmental laws for the current quarter.
    Only runs if no quotas exist in the database.
    """
    ComplianceQuota = apps.get_model('inspections', 'ComplianceQuota')
    
    # Check if any quotas already exist
    if ComplianceQuota.objects.exists():
        return
    
    # Get current year and quarter
    now = datetime.now()
    current_year = now.year
    current_quarter = ((now.month - 1) // 3) + 1
    
    # Define the 5 environmental laws
    laws = ['PD-1586', 'RA-6969', 'RA-8749', 'RA-9275', 'RA-9003']
    default_target = 25
    
    # Create quotas for each law
    quotas_to_create = []
    for law in laws:
        quotas_to_create.append(
            ComplianceQuota(
                law=law,
                year=current_year,
                quarter=current_quarter,
                target=default_target,
                auto_adjusted=False,
                created_by=None  # System-generated
            )
        )
    
    # Bulk create all quotas
    ComplianceQuota.objects.bulk_create(quotas_to_create)


def reverse_initialize_quotas(apps, schema_editor):
    """
    Remove auto-created quotas if migration is rolled back.
    Only removes quotas with created_by=None for the current quarter.
    """
    ComplianceQuota = apps.get_model('inspections', 'ComplianceQuota')
    
    # Get current year and quarter
    now = datetime.now()
    current_year = now.year
    current_quarter = ((now.month - 1) // 3) + 1
    
    # Remove quotas that were auto-created (created_by=None)
    ComplianceQuota.objects.filter(
        year=current_year,
        quarter=current_quarter,
        created_by__isnull=True,
        auto_adjusted=False
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('inspections', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(
            initialize_default_quotas,
            reverse_initialize_quotas,
        ),
    ]
