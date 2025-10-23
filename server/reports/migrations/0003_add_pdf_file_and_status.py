# Generated manually for adding pdf_file and status fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='accomplishmentreport',
            name='pdf_file',
            field=models.FileField(blank=True, help_text='Generated PDF file', null=True, upload_to='reports/'),
        ),
        migrations.AddField(
            model_name='accomplishmentreport',
            name='status',
            field=models.CharField(choices=[('DRAFT', 'Draft'), ('COMPLETED', 'Completed'), ('ARCHIVED', 'Archived')], default='DRAFT', max_length=20),
        ),
    ]
