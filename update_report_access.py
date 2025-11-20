"""
Direct script to update ReportAccess table
Run this from the project root: python update_report_access.py
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'regulatory_system.settings')
django.setup()

from reports.models import ReportAccess

print("=" * 60)
print("UPDATING REPORT ACCESS PERMISSIONS")
print("=" * 60)

# Clear all existing entries
old_count = ReportAccess.objects.count()
print(f"\n🗑️  Deleting {old_count} existing entries...")
ReportAccess.objects.all().delete()
print("✅ Old entries deleted!")

# Define new access mappings (matches seed_report_access.sql)
ACCESS_DATA = [
    # Monitoring Personnel (2 reports)
    ('Monitoring Personnel', 'inspection', 'Inspection Report'),
    ('Monitoring Personnel', 'monitoring_accomplishment', 'Monitoring Accomplishment Report'),
    
    # Unit Head (5 reports) - Only see data under their unit
    ('Unit Head', 'inspection', 'Inspection Report'),
    ('Unit Head', 'compliance', 'Compliance Report'),
    ('Unit Head', 'non_compliant', 'Non-Compliant Report'),
    ('Unit Head', 'unit_accomplishment', 'Unit Accomplishment Report'),
    ('Unit Head', 'quota', 'Quota Report'),
    
    # Section Chief (5 reports) - Only see data under their section
    ('Section Chief', 'inspection', 'Inspection Report'),
    ('Section Chief', 'compliance', 'Compliance Report'),
    ('Section Chief', 'non_compliant', 'Non-Compliant Report'),
    ('Section Chief', 'section_accomplishment', 'Section Accomplishment Report'),
    ('Section Chief', 'quota', 'Quota Report'),
    
    # Division Chief (5 reports) - See all data across all sections/units
    ('Division Chief', 'establishment', 'Establishment Report'),
    ('Division Chief', 'quota', 'Quota Report'),
    ('Division Chief', 'compliance', 'Compliance Report'),
    ('Division Chief', 'non_compliant', 'Non-Compliant Report'),
    ('Division Chief', 'inspection', 'Inspection Report'),
    
    # Legal Unit (5 reports)
    ('Legal Unit', 'billing', 'Billing Report'),
    ('Legal Unit', 'non_compliant', 'Non-Compliant Report'),
    ('Legal Unit', 'compliance', 'Compliance Report'),
    ('Legal Unit', 'nov', 'Notice of Violation Report'),
    ('Legal Unit', 'noo', 'Notice of Order Report'),
    
    # Admin (10 reports) - Full system access
    ('Admin', 'user', 'User Report'),
    ('Admin', 'establishment', 'Establishment Report'),
    ('Admin', 'law', 'Law Report'),
    ('Admin', 'quota', 'Quota Report'),
    ('Admin', 'billing', 'Billing Report'),
    ('Admin', 'compliance', 'Compliance Report'),
    ('Admin', 'non_compliant', 'Non-Compliant Report'),
    ('Admin', 'inspection', 'Inspection Report'),
    ('Admin', 'nov', 'Notice of Violation Report'),
    ('Admin', 'noo', 'Notice of Order Report'),
]

print(f"\n📝 Creating {len(ACCESS_DATA)} new entries...")
created_count = 0

for role, report_type, display_name in ACCESS_DATA:
    ReportAccess.objects.create(
        role=role,
        report_type=report_type,
        display_name=display_name
    )
    created_count += 1
    print(f"  ✓ {role} -> {display_name}")

print("\n" + "=" * 60)
print(f"✅ SUCCESS! Created {created_count} entries")
print("=" * 60)

# Show summary
print("\n📊 Summary by Role:")
print("-" * 60)
from collections import defaultdict
by_role = defaultdict(list)

for access in ReportAccess.objects.all():
    by_role[access.role].append(access.display_name)

for role in sorted(by_role.keys()):
    reports = by_role[role]
    print(f"\n{role} ({len(reports)} reports):")
    for report in sorted(reports):
        print(f"  • {report}")

print("\n" + "=" * 60)
print("✅ Database updated! Refresh your browser to see the changes.")
print("=" * 60)
