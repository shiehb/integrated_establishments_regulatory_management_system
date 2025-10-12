# Generated manually

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('inspections', '0006_rename_first_filled_by_to_inspected_by'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='inspectionform',
            name='inspection_notes',
        ),
    ]
