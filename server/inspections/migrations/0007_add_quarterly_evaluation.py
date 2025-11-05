# Generated manually for quarterly evaluation system

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('inspections', '0006_delete_monthlyquota'),
    ]

    operations = [
        migrations.CreateModel(
            name='QuarterlyEvaluation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('law', models.CharField(help_text='Law code (e.g., PD-1586, RA-6969, RA-8749, RA-9275, RA-9003)', max_length=50)),
                ('year', models.IntegerField(help_text='Year of the quarter')),
                ('quarter', models.IntegerField(choices=[(1, 'Q1'), (2, 'Q2'), (3, 'Q3'), (4, 'Q4')], help_text='Quarter 1-4')),
                ('quarterly_target', models.IntegerField(help_text="Sum of all 3 months' targets")),
                ('quarterly_achieved', models.IntegerField(help_text="Sum of all 3 months' accomplished")),
                ('quarter_status', models.CharField(choices=[('ACHIEVED', 'Achieved'), ('EXCEEDED', 'Exceeded'), ('NOT_ACHIEVED', 'Not Achieved')], help_text='Status of the quarter', max_length=20)),
                ('surplus', models.IntegerField(default=0, help_text='Positive if exceeded target, 0 otherwise')),
                ('deficit', models.IntegerField(default=0, help_text='Positive if not achieved target, 0 otherwise')),
                ('remarks', models.TextField(blank=True, help_text='Admin notes about the quarter evaluation', null=True)),
                ('evaluated_at', models.DateTimeField(auto_now_add=True)),
                ('is_archived', models.BooleanField(default=True, help_text='Auto-archived after evaluation')),
                ('evaluated_by', models.ForeignKey(blank=True, help_text='User who evaluated this quarter', null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-year', '-quarter', 'law'],
            },
        ),
        migrations.AddIndex(
            model_name='quarterlyevaluation',
            index=models.Index(fields=['law', 'year', 'quarter'], name='inspections_law_yea_quarter_idx'),
        ),
        migrations.AddIndex(
            model_name='quarterlyevaluation',
            index=models.Index(fields=['year', 'quarter'], name='inspections_year_quarter_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='quarterlyevaluation',
            unique_together={('law', 'year', 'quarter')},
        ),
    ]

