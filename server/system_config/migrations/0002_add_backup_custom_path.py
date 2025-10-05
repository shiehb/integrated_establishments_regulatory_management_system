# Generated manually for adding backup_custom_path field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system_config', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemconfiguration',
            name='backup_custom_path',
            field=models.CharField(blank=True, help_text='Custom directory path for database backups', max_length=500, null=True),
        ),
    ]
