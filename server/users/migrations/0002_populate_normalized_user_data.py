# Data migration to populate normalized user tables
from django.db import migrations


def populate_normalized_user_data(apps, schema_editor):
    """Populate the normalized user tables with initial data"""
    UserLevel = apps.get_model('users', 'UserLevel')
    Section = apps.get_model('users', 'Section')
    District = apps.get_model('users', 'District')
    
    # Create UserLevel records
    user_levels_data = [
        {
            'code': 'Admin',
            'name': 'Administrator',
            'description': 'System administrator with full access',
            'requires_section': False,
            'requires_district': False,
            'max_active_users': None,
            'max_active_per_section': None,
            'max_active_per_district': None
        },
        {
            'code': 'Legal Unit',
            'name': 'Legal Unit',
            'description': 'Legal unit personnel responsible for legal reviews',
            'requires_section': False,
            'requires_district': False,
            'max_active_users': None,
            'max_active_per_section': None,
            'max_active_per_district': None
        },
        {
            'code': 'Division Chief',
            'name': 'Division Chief',
            'description': 'Division chief with oversight responsibilities',
            'requires_section': False,
            'requires_district': False,
            'max_active_users': 1,
            'max_active_per_section': None,
            'max_active_per_district': None
        },
        {
            'code': 'Section Chief',
            'name': 'Section Chief',
            'description': 'Section chief responsible for specific laws/sections',
            'requires_section': True,
            'requires_district': False,
            'max_active_users': None,
            'max_active_per_section': 1,
            'max_active_per_district': None
        },
        {
            'code': 'Unit Head',
            'name': 'Unit Head',
            'description': 'Unit head responsible for specific laws/sections',
            'requires_section': True,
            'requires_district': False,
            'max_active_users': None,
            'max_active_per_section': 1,
            'max_active_per_district': None
        },
        {
            'code': 'Monitoring Personnel',
            'name': 'Monitoring Personnel',
            'description': 'Monitoring personnel responsible for field inspections',
            'requires_section': True,
            'requires_district': False,
            'max_active_users': None,
            'max_active_per_section': None,
            'max_active_per_district': 1
        }
    ]
    
    for level_data in user_levels_data:
        UserLevel.objects.get_or_create(
            code=level_data['code'],
            defaults=level_data
        )
    
    # Create Section records
    sections_data = [
        {
            'code': 'RA-6969',
            'name': 'Toxic Substances and Hazardous and Nuclear Wastes Control Act',
            'description': 'Republic Act 6969 - Toxic Substances and Hazardous and Nuclear Wastes Control Act',
            'is_combined': False
        },
        {
            'code': 'RA-8749',
            'name': 'Philippine Clean Air Act',
            'description': 'Republic Act 8749 - Philippine Clean Air Act',
            'is_combined': False
        },
        {
            'code': 'RA-9275',
            'name': 'Philippine Clean Water Act',
            'description': 'Republic Act 9275 - Philippine Clean Water Act',
            'is_combined': False
        },
        {
            'code': 'RA-9003',
            'name': 'Ecological Solid Waste Management Act',
            'description': 'Republic Act 9003 - Ecological Solid Waste Management Act',
            'is_combined': False
        },
        {
            'code': 'PD-1586',
            'name': 'Philippine Environmental Impact Statement System',
            'description': 'Presidential Decree 1586 - Environmental Impact Statement System',
            'is_combined': False
        },
        {
            'code': 'PD-1586,RA-8749,RA-9275',
            'name': 'EIA, Air & Water (Combined)',
            'description': 'Combined section for EIA, Air, and Water laws',
            'is_combined': True
        }
    ]
    
    for section_data in sections_data:
        Section.objects.get_or_create(
            code=section_data['code'],
            defaults=section_data
        )
    
    # Set up combined sections relationships
    try:
        combined_section = Section.objects.get(code='PD-1586,RA-8749,RA-9275')
        eia_section = Section.objects.get(code='PD-1586')
        air_section = Section.objects.get(code='RA-8749')
        water_section = Section.objects.get(code='RA-9275')
        
        combined_section.combined_sections.add(eia_section, air_section, water_section)
    except Section.DoesNotExist:
        pass  # Skip if sections don't exist
    
    # Create District records
    districts_data = [
        # La Union Districts
        {
            'code': 'LU-1',
            'name': 'La Union - 1st District',
            'province': 'La Union',
            'description': 'First district of La Union province'
        },
        {
            'code': 'LU-2',
            'name': 'La Union - 2nd District',
            'province': 'La Union',
            'description': 'Second district of La Union province'
        },
        {
            'code': 'LU-3',
            'name': 'La Union - 3rd District',
            'province': 'La Union',
            'description': 'Third district of La Union province'
        },
        # Ilocos Norte Districts
        {
            'code': 'IN-1',
            'name': 'Ilocos Norte - 1st District',
            'province': 'Ilocos Norte',
            'description': 'First district of Ilocos Norte province'
        },
        {
            'code': 'IN-2',
            'name': 'Ilocos Norte - 2nd District',
            'province': 'Ilocos Norte',
            'description': 'Second district of Ilocos Norte province'
        },
        # Ilocos Sur Districts
        {
            'code': 'IS-1',
            'name': 'Ilocos Sur - 1st District',
            'province': 'Ilocos Sur',
            'description': 'First district of Ilocos Sur province'
        },
        {
            'code': 'IS-2',
            'name': 'Ilocos Sur - 2nd District',
            'province': 'Ilocos Sur',
            'description': 'Second district of Ilocos Sur province'
        },
        # Pangasinan Districts
        {
            'code': 'PG-1',
            'name': 'Pangasinan - 1st District',
            'province': 'Pangasinan',
            'description': 'First district of Pangasinan province'
        },
        {
            'code': 'PG-2',
            'name': 'Pangasinan - 2nd District',
            'province': 'Pangasinan',
            'description': 'Second district of Pangasinan province'
        },
        {
            'code': 'PG-3',
            'name': 'Pangasinan - 3rd District',
            'province': 'Pangasinan',
            'description': 'Third district of Pangasinan province'
        },
        {
            'code': 'PG-4',
            'name': 'Pangasinan - 4th District',
            'province': 'Pangasinan',
            'description': 'Fourth district of Pangasinan province'
        },
        {
            'code': 'PG-5',
            'name': 'Pangasinan - 5th District',
            'province': 'Pangasinan',
            'description': 'Fifth district of Pangasinan province'
        },
        {
            'code': 'PG-6',
            'name': 'Pangasinan - 6th District',
            'province': 'Pangasinan',
            'description': 'Sixth district of Pangasinan province'
        }
    ]
    
    for district_data in districts_data:
        District.objects.get_or_create(
            code=district_data['code'],
            defaults=district_data
        )


def reverse_populate_normalized_user_data(apps, schema_editor):
    """Reverse the data population"""
    UserLevel = apps.get_model('users', 'UserLevel')
    Section = apps.get_model('users', 'Section')
    District = apps.get_model('users', 'District')
    
    # Delete all records
    UserLevel.objects.all().delete()
    Section.objects.all().delete()
    District.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_normalize_user_models'),
    ]

    operations = [
        migrations.RunPython(
            populate_normalized_user_data,
            reverse_populate_normalized_user_data
        ),
    ]
