# Generated migration for removing restored_at field

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0003_add_backup_type_and_restored_from'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='backuprecord',
            name='restored_at',
        ),
    ]

