# Generated manually for compliance tracking fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inspections', '0009_alter_inspection_section_chief_decision_and_more'),
    ]

    operations = [
        # Update status choices
        migrations.AlterField(
            model_name='inspection',
            name='status',
            field=models.CharField(
                choices=[
                    ('DIVISION_CREATED', 'Division Created'),
                    ('SECTION_REVIEW', 'Section Review'),
                    ('SECTION_INSPECTING', 'Section Inspecting'),
                    ('UNIT_REVIEW', 'Unit Review'),
                    ('UNIT_INSPECTING', 'Unit Inspecting'),
                    ('MONITORING_ASSIGN', 'Monitoring Assignment'),
                    ('MONITORING_INSPECTION', 'Monitoring Inspection'),
                    ('COMPLETED', 'Completed'),
                    ('LEGAL_REVIEW', 'Legal Review'),
                    ('REJECTED', 'Rejected'),
                ],
                default='DIVISION_CREATED',
                max_length=30
            ),
        ),
        
        # Add compliance tracking fields
        migrations.AddField(
            model_name='inspection',
            name='compliance_status',
            field=models.CharField(
                choices=[
                    ('PENDING', 'Pending Inspection'),
                    ('COMPLIANT', 'Compliant'),
                    ('NON_COMPLIANT', 'Non-Compliant'),
                    ('PARTIALLY_COMPLIANT', 'Partially Compliant'),
                ],
                default='PENDING',
                help_text='Overall compliance status',
                max_length=30
            ),
        ),
        
        migrations.AddField(
            model_name='inspection',
            name='compliance_notes',
            field=models.TextField(
                blank=True,
                help_text='Detailed compliance assessment',
                null=True
            ),
        ),
        
        migrations.AddField(
            model_name='inspection',
            name='violations_found',
            field=models.TextField(
                blank=True,
                help_text='List of violations found during inspection',
                null=True
            ),
        ),
        
        migrations.AddField(
            model_name='inspection',
            name='compliance_plan',
            field=models.TextField(
                blank=True,
                help_text="Establishment's compliance plan",
                null=True
            ),
        ),
        
        migrations.AddField(
            model_name='inspection',
            name='compliance_deadline',
            field=models.DateField(
                blank=True,
                help_text='Deadline for compliance',
                null=True
            ),
        ),
        
        # Add legal unit tracking fields
        migrations.AddField(
            model_name='inspection',
            name='notice_of_violation_sent',
            field=models.BooleanField(
                default=False,
                help_text='Notice of Violation sent to establishment'
            ),
        ),
        
        migrations.AddField(
            model_name='inspection',
            name='notice_of_order_sent',
            field=models.BooleanField(
                default=False,
                help_text='Notice of Order sent to establishment'
            ),
        ),
        
        migrations.AddField(
            model_name='inspection',
            name='penalties_imposed',
            field=models.TextField(
                blank=True,
                help_text='Penalties and fines imposed',
                null=True
            ),
        ),
        
        migrations.AddField(
            model_name='inspection',
            name='legal_unit_comments',
            field=models.TextField(
                blank=True,
                help_text='Legal unit assessment and recommendations',
                null=True
            ),
        ),
        
        # Update action choices
        migrations.AlterField(
            model_name='inspection',
            name='section_chief_decision',
            field=models.CharField(
                blank=True,
                choices=[
                    ('INSPECT', 'Inspect'),
                    ('FORWARD', 'Forward'),
                    ('FORWARD_TO_UNIT', 'Forward to Unit Head'),
                    ('FORWARD_TO_MONITORING', 'Forward to Monitoring'),
                    ('FORWARD_TO_ANOTHER_SECTION', 'Forward to Another Section'),
                    ('FORWARD_TO_MONITORING_PERSONNEL', 'Forward to Monitoring Personnel'),
                    ('COMPLETE', 'Complete'),
                    ('COMPLETE_COMPLIANT', 'Complete - Compliant'),
                    ('COMPLETE_NON_COMPLIANT', 'Complete - Non-Compliant'),
                    ('REJECT', 'Reject'),
                ],
                help_text="Section Chief's decision",
                max_length=35,
                null=True
            ),
        ),
        
        migrations.AlterField(
            model_name='inspection',
            name='unit_head_decision',
            field=models.CharField(
                blank=True,
                choices=[
                    ('INSPECT', 'Inspect'),
                    ('FORWARD', 'Forward'),
                    ('FORWARD_TO_UNIT', 'Forward to Unit Head'),
                    ('FORWARD_TO_MONITORING', 'Forward to Monitoring'),
                    ('FORWARD_TO_ANOTHER_SECTION', 'Forward to Another Section'),
                    ('FORWARD_TO_MONITORING_PERSONNEL', 'Forward to Monitoring Personnel'),
                    ('COMPLETE', 'Complete'),
                    ('COMPLETE_COMPLIANT', 'Complete - Compliant'),
                    ('COMPLETE_NON_COMPLIANT', 'Complete - Non-Compliant'),
                    ('REJECT', 'Reject'),
                ],
                help_text="Unit Head's decision",
                max_length=35,
                null=True
            ),
        ),
        
        migrations.AlterField(
            model_name='inspectionworkflowhistory',
            name='action',
            field=models.CharField(
                choices=[
                    ('INSPECT', 'Inspect'),
                    ('FORWARD', 'Forward'),
                    ('FORWARD_TO_UNIT', 'Forward to Unit Head'),
                    ('FORWARD_TO_MONITORING', 'Forward to Monitoring'),
                    ('FORWARD_TO_ANOTHER_SECTION', 'Forward to Another Section'),
                    ('FORWARD_TO_MONITORING_PERSONNEL', 'Forward to Monitoring Personnel'),
                    ('COMPLETE', 'Complete'),
                    ('COMPLETE_COMPLIANT', 'Complete - Compliant'),
                    ('COMPLETE_NON_COMPLIANT', 'Complete - Non-Compliant'),
                    ('REJECT', 'Reject'),
                ],
                max_length=35
            ),
        ),
    ]
