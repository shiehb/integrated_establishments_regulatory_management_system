import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'regulatory_system.settings')
django.setup()

from reports.models import ReportAccess
from collections import defaultdict

print("=" * 60)
print("REPORT ACCESS DATABASE STATUS")
print("=" * 60)

total = ReportAccess.objects.count()
print(f"\nTotal entries: {total}")

if total == 0:
    print("\n❌ ReportAccess table is EMPTY!")
    print("   Run: python manage.py seed_report_access")
    print("   OR execute: server/seed_report_access.sql")
else:
    print("\n📊 Reports by Role:")
    print("-" * 60)
    
    # Group by role
    by_role = defaultdict(list)
    for access in ReportAccess.objects.select_related().order_by('role', 'report_type'):
        by_role[access.role].append({
            'report_type': access.report_type,
            'display_name': access.display_name
        })
    
    for role in sorted(by_role.keys()):
        reports = by_role[role]
        print(f"\n{role} ({len(reports)} reports):")
        for r in reports:
            print(f"  • {r['display_name']} ({r['report_type']})")

print("\n" + "=" * 60)
