# Generated manually for InspectionLawAssignment model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('inspections', '0005_alter_inspection_section_chief_decision_and_more'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='InspectionLawAssignment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('law_code', models.CharField(help_text='Law code (e.g., PD-1586, RA-8749)', max_length=20)),
                ('law_name', models.CharField(help_text='Full name of the law', max_length=200)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('assigned_to_section_chief', models.ForeignKey(blank=True, help_text='Section Chief responsible for this law', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_laws', to='users.user')),
                ('inspection', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='law_assignments', to='inspections.inspection')),
            ],
            options={
                'unique_together': {('inspection', 'law_code')},
            },
        ),
    ]

