# Generated manually for NOV/NOO normalization

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('inspections', '0005_remove_paymenthistory_billing_record_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='NoticeOfViolation',
            fields=[
                ('inspection_form', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='nov', serialize=False, to='inspections.inspectionform')),
                ('sent_date', models.DateField(blank=True, help_text='Date NOV was sent', null=True)),
                ('compliance_deadline', models.DateTimeField(blank=True, help_text='Deadline for establishment to comply with NOV', null=True)),
                ('violations', models.TextField(blank=True, help_text='Detailed list of violations found')),
                ('compliance_instructions', models.TextField(blank=True, help_text='Required compliance actions for establishment')),
                ('remarks', models.TextField(blank=True, help_text='Additional remarks for NOV')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('sent_by', models.ForeignKey(blank=True, help_text='User who sent this NOV', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='nov_sent', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Notice of Violation',
                'verbose_name_plural': 'Notices of Violation',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='NoticeOfOrder',
            fields=[
                ('inspection_form', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, related_name='noo', serialize=False, to='inspections.inspectionform')),
                ('sent_date', models.DateField(blank=True, help_text='Date NOO was sent', null=True)),
                ('violation_breakdown', models.TextField(blank=True, help_text='Detailed breakdown of violations for NOO')),
                ('penalty_fees', models.DecimalField(blank=True, decimal_places=2, help_text='Total penalty fees assessed', max_digits=10, null=True)),
                ('payment_deadline', models.DateField(blank=True, help_text='Deadline for penalty payment', null=True)),
                ('payment_instructions', models.TextField(blank=True, help_text='Instructions for paying penalties')),
                ('remarks', models.TextField(blank=True, help_text='Additional remarks for NOO')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('sent_by', models.ForeignKey(blank=True, help_text='User who sent this NOO', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='noo_sent', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Notice of Order',
                'verbose_name_plural': 'Notices of Order',
                'ordering': ['-created_at'],
            },
        ),
    ]
