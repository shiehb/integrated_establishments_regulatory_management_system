# Generated manually

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('inspections', '0005_remove_inspectionform_first_filled_by_district_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='inspectionform',
            old_name='first_filled_by',
            new_name='inspected_by',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='first_filled_at',
        ),
        migrations.RemoveField(
            model_name='inspectionform',
            name='first_filled_by_section',
        ),
    ]
