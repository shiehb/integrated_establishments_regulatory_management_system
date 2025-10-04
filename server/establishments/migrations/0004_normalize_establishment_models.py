# Generated migration for establishment normalization

from django.db import migrations, models
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('establishments', '0003_auto_20250913_1901'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Create BusinessType model
        migrations.CreateModel(
            name='BusinessType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(help_text='Business type code', max_length=50, unique=True)),
                ('name', models.CharField(help_text='Business type name', max_length=255)),
                ('description', models.TextField(blank=True, help_text='Description of the business type', null=True)),
                ('category', models.CharField(blank=True, help_text='Business category (e.g., Manufacturing, Service, Retail)', max_length=100, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Business Type',
                'verbose_name_plural': 'Business Types',
                'ordering': ['category', 'name'],
            },
        ),
        
        # Create Province model
        migrations.CreateModel(
            name='Province',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(help_text='Province code (e.g., LU, IN, IS, PAN)', max_length=10, unique=True)),
                ('name', models.CharField(help_text='Province name', max_length=100)),
                ('region', models.CharField(blank=True, help_text='Region the province belongs to', max_length=100, null=True)),
                ('description', models.TextField(blank=True, help_text='Description of the province', null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Province',
                'verbose_name_plural': 'Provinces',
                'ordering': ['region', 'name'],
            },
        ),
        
        # Create City model
        migrations.CreateModel(
            name='City',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(help_text='City code', max_length=20, unique=True)),
                ('name', models.CharField(help_text='City name', max_length=100)),
                ('city_type', models.CharField(choices=[('CITY', 'City'), ('MUNICIPALITY', 'Municipality'), ('COMPONENT_CITY', 'Component City'), ('HIGHLY_URBANIZED_CITY', 'Highly Urbanized City'), ('INDEPENDENT_COMPONENT_CITY', 'Independent Component City')], default='MUNICIPALITY', help_text='Type of city/municipality', max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('province', models.ForeignKey(help_text='Province the city belongs to', on_delete=django.db.models.deletion.CASCADE, related_name='cities', to='establishments.province')),
            ],
            options={
                'verbose_name': 'City',
                'verbose_name_plural': 'Cities',
                'ordering': ['province', 'name'],
                'unique_together': {('name', 'province')},
            },
        ),
        
        # Create Barangay model
        migrations.CreateModel(
            name='Barangay',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(help_text='Barangay code', max_length=20, unique=True)),
                ('name', models.CharField(help_text='Barangay name', max_length=100)),
                ('barangay_type', models.CharField(choices=[('URBAN', 'Urban'), ('RURAL', 'Rural')], default='URBAN', help_text='Type of barangay', max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('city', models.ForeignKey(help_text='City the barangay belongs to', on_delete=django.db.models.deletion.CASCADE, related_name='barangays', to='establishments.city')),
            ],
            options={
                'verbose_name': 'Barangay',
                'verbose_name_plural': 'Barangays',
                'ordering': ['city', 'name'],
                'unique_together': {('name', 'city')},
            },
        ),
        
        # Create EstablishmentStatus model
        migrations.CreateModel(
            name='EstablishmentStatus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(help_text='Status code', max_length=20, unique=True)),
                ('name', models.CharField(help_text='Status name', max_length=100)),
                ('description', models.TextField(blank=True, help_text='Description of the status', null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Establishment Status',
                'verbose_name_plural': 'Establishment Statuses',
                'ordering': ['name'],
            },
        ),
        
        # Create EstablishmentType model
        migrations.CreateModel(
            name='EstablishmentType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(help_text='Establishment type code', max_length=20, unique=True)),
                ('name', models.CharField(help_text='Establishment type name', max_length=100)),
                ('description', models.TextField(blank=True, help_text='Description of the establishment type', null=True)),
                ('requires_license', models.BooleanField(default=True, help_text='Whether this type requires a license')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Establishment Type',
                'verbose_name_plural': 'Establishment Types',
                'ordering': ['name'],
            },
        ),
        
        # Create new normalized Establishment model
        migrations.CreateModel(
            name='EstablishmentNormalized',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Establishment name', max_length=255)),
                ('registration_number', models.CharField(blank=True, help_text='Business registration number', max_length=50, null=True, unique=True)),
                ('tin_number', models.CharField(blank=True, help_text='Tax Identification Number', max_length=20, null=True)),
                ('street_building', models.CharField(help_text='Street address and building details', max_length=255)),
                ('postal_code', models.CharField(blank=True, help_text='Postal code', max_length=10, null=True)),
                ('latitude', models.DecimalField(decimal_places=6, help_text='Latitude coordinate', max_digits=9)),
                ('longitude', models.DecimalField(decimal_places=6, help_text='Longitude coordinate', max_digits=9)),
                ('polygon', models.JSONField(blank=True, help_text='Establishment boundary polygon as JSON', null=True)),
                ('year_established', models.PositiveIntegerField(help_text='Year the establishment was established')),
                ('employee_count', models.PositiveIntegerField(blank=True, help_text='Number of employees', null=True)),
                ('capital_investment', models.DecimalField(blank=True, decimal_places=2, help_text='Capital investment amount', max_digits=15, null=True)),
                ('contact_person', models.CharField(blank=True, help_text='Primary contact person', max_length=255, null=True)),
                ('contact_phone', models.CharField(blank=True, help_text='Contact phone number', max_length=20, null=True)),
                ('contact_email', models.EmailField(blank=True, help_text='Contact email address', null=True)),
                ('website', models.URLField(blank=True, help_text='Establishment website', null=True)),
                ('license_number', models.CharField(blank=True, help_text='Business license number', max_length=100, null=True)),
                ('license_expiry', models.DateField(blank=True, help_text='License expiry date', null=True)),
                ('permit_number', models.CharField(blank=True, help_text='Environmental permit number', max_length=100, null=True)),
                ('permit_expiry', models.DateField(blank=True, help_text='Environmental permit expiry date', null=True)),
                ('is_active', models.BooleanField(default=True, help_text='Whether the establishment is active')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('barangay', models.ForeignKey(help_text='Barangay', on_delete=django.db.models.deletion.PROTECT, related_name='establishments', to='establishments.barangay')),
                ('business_type', models.ForeignKey(help_text='Type of business', on_delete=django.db.models.deletion.PROTECT, related_name='establishments', to='establishments.businesstype')),
                ('city', models.ForeignKey(help_text='City/Municipality', on_delete=django.db.models.deletion.PROTECT, related_name='establishments', to='establishments.city')),
                ('created_by', models.ForeignKey(blank=True, help_text='User who created this establishment', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_establishments', to=settings.AUTH_USER_MODEL)),
                ('establishment_type', models.ForeignKey(help_text='Type of establishment', on_delete=django.db.models.deletion.PROTECT, related_name='establishments', to='establishments.establishmenttype')),
                ('province', models.ForeignKey(help_text='Province', on_delete=django.db.models.deletion.PROTECT, related_name='establishments', to='establishments.province')),
                ('status', models.ForeignKey(default=1, help_text='Current status', on_delete=django.db.models.deletion.PROTECT, related_name='establishments', to='establishments.establishmentstatus')),
                ('updated_by', models.ForeignKey(blank=True, help_text='User who last updated this establishment', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='updated_establishments', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Establishment',
                'verbose_name_plural': 'Establishments',
                'ordering': ['-created_at'],
            },
        ),
        
        # Create EstablishmentHistory model
        migrations.CreateModel(
            name='EstablishmentHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('change_type', models.CharField(choices=[('CREATE', 'Created'), ('UPDATE', 'Updated'), ('STATUS_CHANGE', 'Status Changed'), ('LOCATION_CHANGE', 'Location Changed'), ('BUSINESS_CHANGE', 'Business Type Changed'), ('CONTACT_CHANGE', 'Contact Information Changed'), ('COMPLIANCE_CHANGE', 'Compliance Information Changed')], max_length=20)),
                ('old_values', models.JSONField(blank=True, help_text='Previous values', null=True)),
                ('new_values', models.JSONField(blank=True, help_text='New values', null=True)),
                ('reason', models.TextField(blank=True, help_text='Reason for the change', null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('changed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('establishment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='history', to='establishments.establishmentnormalized')),
            ],
            options={
                'verbose_name': 'Establishment History',
                'verbose_name_plural': 'Establishment Histories',
                'ordering': ['-timestamp'],
            },
        ),
        
        # Create EstablishmentDocument model
        migrations.CreateModel(
            name='EstablishmentDocument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('document_type', models.CharField(choices=[('LICENSE', 'Business License'), ('PERMIT', 'Environmental Permit'), ('REGISTRATION', 'Business Registration'), ('CERTIFICATE', 'Certificate'), ('OTHER', 'Other')], max_length=50)),
                ('title', models.CharField(help_text='Document title', max_length=255)),
                ('description', models.TextField(blank=True, help_text='Document description', null=True)),
                ('file_path', models.CharField(help_text='Path to the document file', max_length=500)),
                ('file_size', models.PositiveIntegerField(blank=True, help_text='File size in bytes', null=True)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('establishment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documents', to='establishments.establishmentnormalized')),
                ('uploaded_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Establishment Document',
                'verbose_name_plural': 'Establishment Documents',
                'ordering': ['-uploaded_at'],
            },
        ),
        
        # Add indexes for better performance
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_establishment_name ON establishments_establishmentnormalized (name);",
            reverse_sql="DROP INDEX IF EXISTS idx_establishment_name;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_establishment_business_type ON establishments_establishmentnormalized (business_type_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_establishment_business_type;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_establishment_province_city ON establishments_establishmentnormalized (province_id, city_id, barangay_id);",
            reverse_sql="DROP INDEX IF EXISTS idx_establishment_province_city;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_establishment_status_active ON establishments_establishmentnormalized (status_id, is_active);",
            reverse_sql="DROP INDEX IF EXISTS idx_establishment_status_active;"
        ),
    ]
