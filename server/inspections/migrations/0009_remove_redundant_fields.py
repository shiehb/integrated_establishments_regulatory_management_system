# Remove redundant fields from InspectionForm after NOV/NOO normalization

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('inspections', '0008_remove_old_nov_noo_fields'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='inspectionform',
            name='findings_summary',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='compliance_plan',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='compliance_deadline',
        ),
    ]
