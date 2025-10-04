# Section Grouping Examples

## Overview

This document provides examples of how to use the enhanced user model with section grouping functionality. The system now supports grouping users by sections, where some sections can have multiple subsections.

## Key Features

### 1. Section Groups
- **SectionGroup**: Groups related sections together
- **Section**: Individual sections that can belong to a group
- **Hierarchy**: Sections can have parent-child relationships
- **Combined Sections**: Support for legacy combined sections

### 2. User Grouping
- Users can be grouped by their section's group
- Users can be grouped by their section's hierarchy
- Support for multiple subsections within a group

## Example Data Structure

### Section Groups
```python
# Environmental Laws Group
environmental_group = SectionGroup.objects.create(
    code='ENV',
    name='Environmental Laws',
    description='All environmental protection laws'
)

# Industrial Laws Group
industrial_group = SectionGroup.objects.create(
    code='IND',
    name='Industrial Laws',
    description='All industrial regulation laws'
)
```

### Sections with Grouping
```python
# Environmental Laws
eia_section = Section.objects.create(
    code='PD-1586',
    name='Philippine Environmental Impact Statement System',
    section_group=environmental_group,
    description='EIA requirements and procedures'
)

air_section = Section.objects.create(
    code='RA-8749',
    name='Philippine Clean Air Act',
    section_group=environmental_group,
    description='Air quality regulations'
)

water_section = Section.objects.create(
    code='RA-9275',
    name='Philippine Clean Water Act',
    section_group=environmental_group,
    description='Water quality regulations'
)

# Industrial Laws
toxic_section = Section.objects.create(
    code='RA-6969',
    name='Toxic Substances and Hazardous and Nuclear Wastes Control Act',
    section_group=industrial_group,
    description='Toxic substances management'
)

waste_section = Section.objects.create(
    code='RA-9003',
    name='Ecological Solid Waste Management Act',
    section_group=industrial_group,
    description='Solid waste management'
)
```

### Sections with Hierarchy
```python
# Main EIA Section
eia_main = Section.objects.create(
    code='EIA-MAIN',
    name='EIA Main Section',
    section_group=environmental_group,
    description='Main EIA section'
)

# EIA Subsections
eia_planning = Section.objects.create(
    code='EIA-PLAN',
    name='EIA Planning',
    section_group=environmental_group,
    parent_section=eia_main,
    description='EIA planning and assessment'
)

eia_monitoring = Section.objects.create(
    code='EIA-MON',
    name='EIA Monitoring',
    section_group=environmental_group,
    parent_section=eia_main,
    description='EIA monitoring and compliance'
)

eia_enforcement = Section.objects.create(
    code='EIA-ENF',
    name='EIA Enforcement',
    section_group=environmental_group,
    parent_section=eia_main,
    description='EIA enforcement and penalties'
)
```

## User Assignment Examples

### Users in Environmental Group
```python
# Section Chief for Environmental Group
env_section_chief = User.objects.create(
    email='env.chief@example.com',
    first_name='John',
    last_name='Doe',
    userlevel=UserLevel.objects.get(code='Section Chief'),
    section=eia_section,  # Assigned to EIA section
    district=District.objects.get(code='LU-1')
)

# Unit Head for EIA Planning
eia_planning_head = User.objects.create(
    email='eia.planning@example.com',
    first_name='Jane',
    last_name='Smith',
    userlevel=UserLevel.objects.get(code='Unit Head'),
    section=eia_planning,  # Assigned to EIA Planning subsection
    district=District.objects.get(code='LU-1')
)

# Monitoring Personnel for Air Quality
air_monitor = User.objects.create(
    email='air.monitor@example.com',
    first_name='Bob',
    last_name='Johnson',
    userlevel=UserLevel.objects.get(code='Monitoring Personnel'),
    section=air_section,  # Assigned to Air section
    district=District.objects.get(code='LU-2')
)
```

## Querying Examples

### 1. Get All Users in a Section Group
```python
# Get all users in Environmental group
env_users = User.objects.filter(
    section__section_group__code='ENV',
    is_active=True
)

# Using the model method
env_group = SectionGroup.objects.get(code='ENV')
env_users = env_group.get_all_users()
```

### 2. Get Users by Section Group and User Level
```python
# Get all Section Chiefs in Environmental group
env_section_chiefs = User.objects.filter(
    section__section_group__code='ENV',
    userlevel__code='Section Chief',
    is_active=True
)

# Using the model method
env_group = SectionGroup.objects.get(code='ENV')
env_section_chiefs = env_group.get_all_users().filter(userlevel__code='Section Chief')
```

### 3. Get Users in Section Hierarchy
```python
# Get all users in EIA hierarchy (main + subsections)
eia_main = Section.objects.get(code='EIA-MAIN')
eia_users = eia_main.get_all_users_in_group()

# This includes users from:
# - EIA-MAIN
# - EIA-PLAN
# - EIA-MON
# - EIA-ENF
```

### 4. Get Section Group Statistics
```python
# Get statistics for Environmental group
env_group = SectionGroup.objects.get(code='ENV')
users = env_group.get_all_users()

stats = {
    'total_users': users.count(),
    'section_chiefs': users.filter(userlevel__code='Section Chief').count(),
    'unit_heads': users.filter(userlevel__code='Unit Head').count(),
    'monitoring_personnel': users.filter(userlevel__code='Monitoring Personnel').count(),
    'by_district': {},
    'by_section': {}
}

# Statistics by district
for district in District.objects.all():
    district_users = users.filter(district=district)
    if district_users.exists():
        stats['by_district'][district.code] = district_users.count()

# Statistics by section
for section in env_group.get_all_sections():
    section_users = users.filter(section=section)
    if section_users.exists():
        stats['by_section'][section.code] = section_users.count()
```

## API Usage Examples

### 1. Get Section Groups with User Counts
```http
GET /api/section-groups/
```

Response:
```json
{
  "results": [
    {
      "id": 1,
      "code": "ENV",
      "name": "Environmental Laws",
      "description": "All environmental protection laws",
      "total_users": 15,
      "section_chiefs_count": 2,
      "unit_heads_count": 4,
      "monitoring_personnel_count": 9,
      "sections": [
        {
          "id": 1,
          "code": "PD-1586",
          "name": "Philippine Environmental Impact Statement System"
        },
        {
          "id": 2,
          "code": "RA-8749",
          "name": "Philippine Clean Air Act"
        }
      ]
    }
  ]
}
```

### 2. Get Users in a Section Group
```http
GET /api/section-groups/1/users/
```

Response:
```json
{
  "section_group": {
    "id": 1,
    "code": "ENV",
    "name": "Environmental Laws"
  },
  "users": [
    {
      "id": 1,
      "email": "env.chief@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "userlevel": "Section Chief",
      "section": "PD-1586",
      "section_group": "ENV",
      "district": "La Union - 1st District"
    }
  ],
  "count": 15
}
```

### 3. Get Users by Section Group and User Level
```http
GET /api/section-groups/1/users-by-level/
```

Response:
```json
{
  "section_group": {
    "id": 1,
    "code": "ENV",
    "name": "Environmental Laws"
  },
  "users_by_level": {
    "Section Chief": {
      "user_level": {
        "id": 3,
        "code": "Section Chief",
        "name": "Section Chief"
      },
      "users": [
        {
          "id": 1,
          "email": "env.chief@example.com",
          "first_name": "John",
          "last_name": "Doe"
        }
      ],
      "count": 2
    },
    "Unit Head": {
      "user_level": {
        "id": 4,
        "code": "Unit Head",
        "name": "Unit Head"
      },
      "users": [
        {
          "id": 2,
          "email": "eia.planning@example.com",
          "first_name": "Jane",
          "last_name": "Smith"
        }
      ],
      "count": 4
    }
  }
}
```

### 4. Get Section Group Statistics
```http
GET /api/section-groups/1/statistics/
```

Response:
```json
{
  "section_group": {
    "id": 1,
    "code": "ENV",
    "name": "Environmental Laws"
  },
  "statistics": {
    "total_users": 15,
    "active_users": 14,
    "inactive_users": 1,
    "by_user_level": {
      "Section Chief": {
        "name": "Section Chief",
        "count": 2,
        "users": [...]
      },
      "Unit Head": {
        "name": "Unit Head",
        "count": 4,
        "users": [...]
      },
      "Monitoring Personnel": {
        "name": "Monitoring Personnel",
        "count": 9,
        "users": [...]
      }
    },
    "by_district": {
      "LU-1": {
        "name": "La Union - 1st District",
        "count": 8,
        "users": [...]
      },
      "LU-2": {
        "name": "La Union - 2nd District",
        "count": 7,
        "users": [...]
      }
    },
    "by_section": {
      "PD-1586": {
        "name": "Philippine Environmental Impact Statement System",
        "count": 5,
        "users": [...]
      },
      "RA-8749": {
        "name": "Philippine Clean Air Act",
        "count": 6,
        "users": [...]
      },
      "RA-9275": {
        "name": "Philippine Clean Water Act",
        "count": 4,
        "users": [...]
      }
    }
  }
}
```

### 5. Get Users in Section Hierarchy
```http
GET /api/sections/1/group-users/
```

Response:
```json
{
  "section": {
    "id": 1,
    "code": "EIA-MAIN",
    "name": "EIA Main Section",
    "section_group": "ENV",
    "subsections": [
      {
        "id": 2,
        "code": "EIA-PLAN",
        "name": "EIA Planning"
      },
      {
        "id": 3,
        "code": "EIA-MON",
        "name": "EIA Monitoring"
      }
    ]
  },
  "group_users": [
    {
      "id": 1,
      "email": "env.chief@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "section": "EIA-MAIN"
    },
    {
      "id": 2,
      "email": "eia.planning@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "section": "EIA-PLAN"
    }
  ],
  "count": 8
}
```

### 6. Get All Users Grouped by Section Group
```http
GET /api/users-by-section-group/
```

Response:
```json
{
  "ENV": {
    "section_group": {
      "id": 1,
      "code": "ENV",
      "name": "Environmental Laws"
    },
    "users": [...],
    "count": 15
  },
  "IND": {
    "section_group": {
      "id": 2,
      "code": "IND",
      "name": "Industrial Laws"
    },
    "users": [...],
    "count": 8
  }
}
```

### 7. Get All Users Grouped by Section Group and User Level
```http
GET /api/users-by-section-group-and-level/
```

Response:
```json
{
  "ENV": {
    "section_group": {
      "id": 1,
      "code": "ENV",
      "name": "Environmental Laws"
    },
    "users_by_level": {
      "Section Chief": {
        "user_level": {
          "id": 3,
          "code": "Section Chief",
          "name": "Section Chief"
        },
        "users": [...],
        "count": 2
      },
      "Unit Head": {
        "user_level": {
          "id": 4,
          "code": "Unit Head",
          "name": "Unit Head"
        },
        "users": [...],
        "count": 4
      }
    }
  }
}
```

## Management Commands

### Create Section Groups and Sections
```python
# management/commands/setup_section_groups.py
from django.core.management.base import BaseCommand
from users.models_enhanced_section_grouping import SectionGroup, Section

class Command(BaseCommand):
    help = 'Setup section groups and sections'
    
    def handle(self, *args, **options):
        # Create Environmental Laws Group
        env_group = SectionGroup.objects.create(
            code='ENV',
            name='Environmental Laws',
            description='All environmental protection laws'
        )
        
        # Create sections in Environmental group
        Section.objects.create(
            code='PD-1586',
            name='Philippine Environmental Impact Statement System',
            section_group=env_group,
            description='EIA requirements and procedures'
        )
        
        Section.objects.create(
            code='RA-8749',
            name='Philippine Clean Air Act',
            section_group=env_group,
            description='Air quality regulations'
        )
        
        Section.objects.create(
            code='RA-9275',
            name='Philippine Clean Water Act',
            section_group=env_group,
            description='Water quality regulations'
        )
        
        # Create Industrial Laws Group
        ind_group = SectionGroup.objects.create(
            code='IND',
            name='Industrial Laws',
            description='All industrial regulation laws'
        )
        
        # Create sections in Industrial group
        Section.objects.create(
            code='RA-6969',
            name='Toxic Substances and Hazardous and Nuclear Wastes Control Act',
            section_group=ind_group,
            description='Toxic substances management'
        )
        
        Section.objects.create(
            code='RA-9003',
            name='Ecological Solid Waste Management Act',
            section_group=ind_group,
            description='Solid waste management'
        )
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created section groups and sections!')
        )
```

## Benefits of Section Grouping

### 1. **Organizational Structure**
- Clear grouping of related sections
- Hierarchical organization of subsections
- Easy management of user assignments

### 2. **Reporting and Analytics**
- Group-level statistics and reporting
- User distribution analysis
- Performance metrics by group

### 3. **User Management**
- Bulk operations on group users
- Group-based permissions and access control
- Simplified user assignment workflows

### 4. **Scalability**
- Easy to add new sections to existing groups
- Support for complex organizational structures
- Flexible grouping strategies

### 5. **API Efficiency**
- Single API calls to get group information
- Reduced database queries
- Better performance for group operations

## Migration from Current System

### 1. **Create Section Groups**
```python
# Create groups for existing sections
env_group = SectionGroup.objects.create(
    code='ENV',
    name='Environmental Laws'
)

ind_group = SectionGroup.objects.create(
    code='IND',
    name='Industrial Laws'
)
```

### 2. **Update Existing Sections**
```python
# Assign existing sections to groups
Section.objects.filter(code__in=['PD-1586', 'RA-8749', 'RA-9275']).update(
    section_group=env_group
)

Section.objects.filter(code__in=['RA-6969', 'RA-9003']).update(
    section_group=ind_group
)
```

### 3. **Update User Queries**
```python
# Old way
users = User.objects.filter(section__code__in=['PD-1586', 'RA-8749', 'RA-9275'])

# New way
users = User.objects.filter(section__section_group__code='ENV')
```

This section grouping system provides a flexible and scalable way to organize users by sections, supporting both simple groupings and complex hierarchical structures.
