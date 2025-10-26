# Generated manually
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('establishments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='establishment',
            name='marker_icon',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
