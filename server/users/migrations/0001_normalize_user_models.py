# Generated migration for user model normalization
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        # Create UserLevel model
        migrations.CreateModel(
            name='UserLevel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(help_text="User level code (e.g., 'Admin', 'Section Chief')", max_length=50, unique=True)),
                ('name', models.CharField(help_text='Display name for the user level', max_length=100)),
                ('description', models.TextField(blank=True, help_text='Description of the user level', null=True)),
                ('requires_section', models.BooleanField(default=False, help_text='Whether this user level requires a section assignment')),
                ('requires_district', models.BooleanField(default=False, help_text='Whether this user level requires a district assignment')),
                ('max_active_users', models.PositiveIntegerField(blank=True, help_text='Maximum number of active users for this level (null = unlimited)', null=True)),
                ('max_active_per_section', models.PositiveIntegerField(blank=True, help_text='Maximum active users per section (null = unlimited)', null=True)),
                ('max_active_per_district', models.PositiveIntegerField(blank=True, help_text='Maximum active users per district (null = unlimited)', null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'User Level',
                'verbose_name_plural': 'User Levels',
                'ordering': ['code'],
            },
        ),
        
        # Create Section model
        migrations.CreateModel(
            name='Section',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(help_text="Section code (e.g., 'PD-1586', 'RA-8749')", max_length=50, unique=True)),
                ('name', models.CharField(help_text='Full name of the section/law', max_length=200)),
                ('description', models.TextField(blank=True, help_text='Description of the section/law', null=True)),
                ('is_combined', models.BooleanField(default=False, help_text='Whether this is a combined section')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Section',
                'verbose_name_plural': 'Sections',
                'ordering': ['code'],
            },
        ),
        
        # Create District model
        migrations.CreateModel(
            name='District',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(help_text='District code', max_length=50, unique=True)),
                ('name', models.CharField(help_text='Full name of the district', max_length=100)),
                ('province', models.CharField(help_text='Province the district belongs to', max_length=100)),
                ('description', models.TextField(blank=True, help_text='Description of the district', null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'District',
                'verbose_name_plural': 'Districts',
                'ordering': ['province', 'name'],
            },
        ),
        
        # Create UserProfile model
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone_number', models.CharField(blank=True, max_length=20, null=True)),
                ('address', models.TextField(blank=True, null=True)),
                ('emergency_contact', models.CharField(blank=True, max_length=255, null=True)),
                ('emergency_phone', models.CharField(blank=True, max_length=20, null=True)),
                ('notes', models.TextField(blank=True, help_text='Additional notes about the user', null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to='users.user')),
            ],
            options={
                'verbose_name': 'User Profile',
                'verbose_name_plural': 'User Profiles',
            },
        ),
        
        # Create UserAssignmentHistory model
        migrations.CreateModel(
            name='UserAssignmentHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reason', models.TextField(blank=True, help_text='Reason for the assignment change', null=True)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('changed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assignment_changes', to='users.user')),
                ('new_district', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='new_assignments', to='users.district')),
                ('new_section', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='new_assignments', to='users.section')),
                ('new_userlevel', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='new_assignments', to='users.userlevel')),
                ('old_district', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='old_assignments', to='users.district')),
                ('old_section', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='old_assignments', to='users.section')),
                ('old_userlevel', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='old_assignments', to='users.userlevel')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignment_history', to='users.user')),
            ],
            options={
                'verbose_name': 'User Assignment History',
                'verbose_name_plural': 'User Assignment Histories',
                'ordering': ['-timestamp'],
            },
        ),
        
        # Create UserPermission model
        migrations.CreateModel(
            name='UserPermission',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission_code', models.CharField(help_text='Permission code', max_length=100)),
                ('permission_name', models.CharField(help_text='Human-readable permission name', max_length=200)),
                ('description', models.TextField(blank=True, help_text='Description of the permission', null=True)),
                ('is_granted', models.BooleanField(default=True, help_text='Whether the permission is granted or denied')),
                ('granted_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField(blank=True, help_text='When the permission expires (null = never)', null=True)),
                ('granted_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='granted_permissions', to='users.user')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='permissions', to='users.user')),
            ],
            options={
                'verbose_name': 'User Permission',
                'verbose_name_plural': 'User Permissions',
                'ordering': ['permission_code'],
                'unique_together': {('user', 'permission_code')},
            },
        ),
        
        # Add combined_sections field to Section
        migrations.AddField(
            model_name='section',
            name='combined_sections',
            field=models.ManyToManyField(blank=True, help_text='Sections that are combined in this section', related_name='_section_combined_sections_+', to='users.section'),
        ),
        
        # Add indexes to User model
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['userlevel'], name='users_user_userlevel_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['section'], name='users_user_section_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['district'], name='users_user_district_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['is_active'], name='users_user_is_active_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['userlevel', 'section', 'district'], name='users_user_level_section_district_idx'),
        ),
    ]
