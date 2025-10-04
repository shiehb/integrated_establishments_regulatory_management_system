# Generated manually for enhanced InspectionLawAssignment model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('inspections', '0006_inspectionlawassignment'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='inspectionlawassignment',
            name='law_status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'Pending Section Chief Review'),
                    ('SECTION_REVIEW', 'Section Chief Reviewing'),
                    ('FORWARDED_TO_UNIT', 'Forwarded to Unit Head'),
                    ('FORWARDED_TO_MONITORING', 'Forwarded to Monitoring Personnel'),
                    ('UNIT_REVIEW', 'Unit Head Reviewing'),
                    ('MONITORING_INSPECTION', 'Monitoring Personnel Inspecting'),
                    ('COMPLETED', 'Completed'),
                ],
                default='PENDING',
                max_length=30
            ),
        ),
        migrations.AddField(
            model_name='inspectionlawassignment',
            name='assigned_to_unit_head',
            field=models.ForeignKey(
                blank=True,
                help_text='Unit Head responsible for this law',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assigned_unit_laws',
                to='users.user'
            ),
        ),
        migrations.AddField(
            model_name='inspectionlawassignment',
            name='assigned_to_monitoring_personnel',
            field=models.ForeignKey(
                blank=True,
                help_text='Monitoring Personnel responsible for this law',
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='assigned_monitoring_laws',
                to='users.user'
            ),
        ),
        migrations.AddField(
            model_name='inspectionlawassignment',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
