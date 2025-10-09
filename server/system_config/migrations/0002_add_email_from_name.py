# Generated manually for adding email_from_name field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system_config', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemconfiguration',
            name='email_from_name',
            field=models.CharField(blank=True, help_text="Display name for email sender (e.g., 'Your Company Name')", max_length=255, null=True),
        ),
    ]
