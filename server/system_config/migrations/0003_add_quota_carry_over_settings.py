# Generated manually for quota carry-over settings

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system_config', '0002_systemconfiguration_backup_retention_days_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='systemconfiguration',
            name='quota_carry_over_policy',
            field=models.CharField(
                choices=[
                    ('independent', 'Independent Quarters'),
                    ('auto', 'Auto Carry Deficit'),
                    ('manual', 'Manual Adjustment'),
                ],
                default='independent',
                help_text='Policy for carrying over deficit to next quarter',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='systemconfiguration',
            name='quota_carry_over_enabled',
            field=models.BooleanField(
                default=False,
                help_text='Enable carry-over of deficit amounts between quarters'
            ),
        ),
    ]

