# Generated migration for model normalization
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('establishments', '0001_initial'),
        ('users', '0001_initial'),
        ('inspections', '0001_initial'),
    ]

    operations = [
        # Create Law model
        migrations.CreateModel(
            name='Law',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(help_text='Law code (e.g., PD-1586, RA-8749)', max_length=20, unique=True)),
                ('name', models.CharField(help_text='Full name of the law', max_length=200)),
                ('description', models.TextField(blank=True, help_text='Description of the law', null=True)),
                ('has_unit_head', models.BooleanField(default=False, help_text='Whether this law requires unit head review')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Law',
                'verbose_name_plural': 'Laws',
                'ordering': ['code'],
            },
        ),
        
        # Create InspectionStatus model
        migrations.CreateModel(
            name='InspectionStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=30, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, null=True)),
                ('is_final', models.BooleanField(default=False, help_text='Whether this is a final status')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Inspection Status',
                'verbose_name_plural': 'Inspection Statuses',
                'ordering': ['code'],
            },
        ),
        
        # Create WorkflowAction model
        migrations.CreateModel(
            name='WorkflowAction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=35, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Workflow Action',
                'verbose_name_plural': 'Workflow Actions',
                'ordering': ['code'],
            },
        ),
        
        # Create ComplianceStatus model
        migrations.CreateModel(
            name='ComplianceStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=30, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name': 'Compliance Status',
                'verbose_name_plural': 'Compliance Statuses',
                'ordering': ['code'],
            },
        ),
        
        # Create WorkflowRule model
        migrations.CreateModel(
            name='WorkflowRule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_level', models.CharField(max_length=50)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('action', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workflow_rules', to='inspections.workflowaction')),
                ('next_status', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='workflow_rules_from', to='inspections.inspectionstatus')),
                ('status', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='workflow_rules', to='inspections.inspectionstatus')),
            ],
            options={
                'verbose_name': 'Workflow Rule',
                'verbose_name_plural': 'Workflow Rules',
                'unique_together': {('status', 'user_level', 'action')},
            },
        ),
        
        # Create InspectionDecision model
        migrations.CreateModel(
            name='InspectionDecision',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comments', models.TextField(blank=True, null=True)),
                ('violations_found', models.TextField(blank=True, null=True)),
                ('compliance_notes', models.TextField(blank=True, null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('action', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='decisions', to='inspections.workflowaction')),
                ('compliance_status', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='decisions', to='inspections.compliancestatus')),
                ('inspection', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='decisions', to='inspections.inspection')),
                ('performed_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inspection_decisions', to='users.user')),
            ],
            options={
                'verbose_name': 'Inspection Decision',
                'verbose_name_plural': 'Inspection Decisions',
                'ordering': ['-timestamp'],
            },
        ),
        
        # Add indexes to InspectionDecision
        migrations.AddIndex(
            model_name='inspectiondecision',
            index=models.Index(fields=['inspection', 'timestamp'], name='inspections_inspection_timestamp_idx'),
        ),
        migrations.AddIndex(
            model_name='inspectiondecision',
            index=models.Index(fields=['performed_by', 'timestamp'], name='inspections_performed_by_timestamp_idx'),
        ),
        
        # Add indexes to WorkflowRule
        migrations.AddIndex(
            model_name='workflowrule',
            index=models.Index(fields=['status', 'user_level'], name='inspections_status_user_level_idx'),
        ),
    ]
