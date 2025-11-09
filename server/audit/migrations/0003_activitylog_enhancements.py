from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("audit", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="activitylog",
            name="description",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="activitylog",
            name="metadata",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="activitylog",
            name="module",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="activitylog",
            name="role",
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]

