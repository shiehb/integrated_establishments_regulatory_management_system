# Remove old NOV/NOO fields from InspectionForm after data migration

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('inspections', '0007_migrate_nov_noo_data'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='inspectionform',
            name='nov_sent_date',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='nov_compliance_date',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='nov_violations',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='nov_compliance_instructions',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='nov_remarks',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='noo_sent_date',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='noo_violation_breakdown',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='noo_penalty_fees',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='noo_payment_deadline',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='noo_payment_instructions',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='noo_remarks',
        ),
    ]
