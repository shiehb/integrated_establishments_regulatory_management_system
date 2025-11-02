# Generated migration for adding backup_type and restored_from fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system', '0002_remove_backuprecord_file_name_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='backuprecord',
            name='backup_type',
            field=models.CharField(choices=[('backup', 'Backup'), ('restore', 'Restore')], default='backup', help_text='Type of record: backup or restore', max_length=10),
        ),
        migrations.AddField(
            model_name='backuprecord',
            name='restored_from',
            field=models.ForeignKey(blank=True, help_text='Reference to original backup if this is a restore log entry', null=True, on_delete=models.SET_NULL, related_name='restore_logs', to='system.backuprecord'),
        ),
    ]

