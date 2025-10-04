# User Model Normalization Guide

## Overview

This document outlines the database normalization improvements made to the user account models in the Integrated Establishments Regulatory Management System. The normalization addresses several denormalization issues in the original user model and provides a more maintainable, scalable database structure.

## Problems with Original User Model

### 1. Hardcoded Choices
- **Issue**: UserLevel, Section, and District choices were hardcoded as tuples in the model
- **Problems**: 
  - Difficult to add new choices without code changes
  - No centralized management of choices
  - Inconsistent data entry
  - No metadata about choices (descriptions, constraints, etc.)

### 2. Business Rules in Serializers
- **Issue**: User level constraints and validation logic were embedded in serializers
- **Problems**:
  - Business rules scattered across code
  - Difficult to maintain and update
  - No database-level enforcement
  - Complex validation logic in application layer

### 3. Limited Extensibility
- **Issue**: No way to add new user levels, sections, or districts without code changes
- **Problems**:
  - Requires code deployment for new choices
  - No dynamic configuration
  - Limited flexibility for business changes

### 4. No Audit Trail
- **Issue**: No tracking of user assignment changes
- **Problems**:
  - No history of role changes
  - Difficult to track user movements
  - No accountability for changes

## Normalized Model Structure

### 1. UserLevel Model
```python
class UserLevel(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    requires_section = models.BooleanField(default=False)
    requires_district = models.BooleanField(default=False)
    max_active_users = models.PositiveIntegerField(null=True, blank=True)
    max_active_per_section = models.PositiveIntegerField(null=True, blank=True)
    max_active_per_district = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
```

**Benefits**:
- Centralized user level management
- Configurable constraints (max users, requirements)
- Easy to add new user levels
- Database-enforced business rules

### 2. Section Model
```python
class Section(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    is_combined = models.BooleanField(default=False)
    combined_sections = models.ManyToManyField('self', blank=True)
    is_active = models.BooleanField(default=True)
```

**Benefits**:
- Centralized section/law management
- Support for combined sections
- Easy to add new sections
- Consistent section information

### 3. District Model
```python
class District(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
```

**Benefits**:
- Centralized district management
- Province grouping
- Easy to add new districts
- Consistent district information

### 4. UserProfile Model
```python
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=255, blank=True, null=True)
    emergency_phone = models.CharField(max_length=20, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
```

**Benefits**:
- Separates profile information from authentication
- Extensible for additional user information
- Clean separation of concerns

### 5. UserAssignmentHistory Model
```python
class UserAssignmentHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    old_userlevel = models.ForeignKey(UserLevel, null=True, blank=True)
    new_userlevel = models.ForeignKey(UserLevel, null=True, blank=True)
    old_section = models.ForeignKey(Section, null=True, blank=True)
    new_section = models.ForeignKey(Section, null=True, blank=True)
    old_district = models.ForeignKey(District, null=True, blank=True)
    new_district = models.ForeignKey(District, null=True, blank=True)
    changed_by = models.ForeignKey(User, null=True, blank=True)
    reason = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
```

**Benefits**:
- Complete audit trail of user changes
- Accountability for changes
- Historical tracking
- Compliance and reporting

### 6. UserPermission Model
```python
class UserPermission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    permission_code = models.CharField(max_length=100)
    permission_name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    is_granted = models.BooleanField(default=True)
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL)
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
```

**Benefits**:
- Granular permission management
- Time-based permissions
- Permission delegation
- Fine-grained access control

### 7. Refactored User Model
```python
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, max_length=255)
    first_name = models.CharField(max_length=150, blank=True)
    middle_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    
    # Normalized relationships
    userlevel = models.ForeignKey(UserLevel, on_delete=models.PROTECT)
    section = models.ForeignKey(Section, on_delete=models.PROTECT, null=True, blank=True)
    district = models.ForeignKey(District, on_delete=models.PROTECT, null=True, blank=True)
    
    # Django auth fields
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Password management
    is_first_login = models.BooleanField(default=True)
    must_change_password = models.BooleanField(default=False)
```

**Benefits**:
- Cleaner model structure
- Better referential integrity
- Database-enforced constraints
- More maintainable code

## Key Features of Normalized Models

### 1. Database-Enforced Constraints
- User level requirements (section, district)
- Maximum user limits per level/section/district
- Referential integrity
- Data validation at database level

### 2. Configurable Business Rules
- Dynamic user level constraints
- Flexible permission system
- Time-based permissions
- Audit trail for all changes

### 3. Extensibility
- Easy to add new user levels
- Easy to add new sections/districts
- Extensible permission system
- Additional profile fields

### 4. Audit and Compliance
- Complete change history
- User assignment tracking
- Permission audit trail
- Compliance reporting

## Migration Strategy

### 1. Create Normalized Tables
The first migration creates all the normalized tables with proper relationships and indexes.

### 2. Populate Normalized Data
The second migration populates the normalized tables with initial data from the hardcoded choices.

### 3. Data Migration
A separate data migration script migrates existing user data to use the normalized structure.

### 4. Update Application Code
Views, serializers, and other application code are updated to work with the normalized models.

## Benefits of Normalization

### 1. Maintainability
- Easy to add new choices without code changes
- Centralized management of reference data
- Consistent data across the system
- Database-enforced business rules

### 2. Performance
- Better query performance with proper indexes
- Reduced data duplication
- More efficient joins
- Optimized database queries

### 3. Data Integrity
- Referential integrity constraints
- Consistent data validation
- Better error handling
- Database-level enforcement

### 4. Scalability
- Easy to extend with new features
- Better separation of concerns
- More flexible configuration
- Dynamic business rules

### 5. Auditability
- Complete audit trail of changes
- User assignment history
- Permission tracking
- Compliance reporting

## Usage Examples

### 1. Adding a New User Level
```python
# Instead of hardcoding in the model
UserLevel.objects.create(
    code='Supervisor',
    name='Supervisor',
    description='Supervisory role with limited permissions',
    requires_section=True,
    requires_district=False,
    max_active_users=None,
    max_active_per_section=2,
    max_active_per_district=None
)
```

### 2. Adding a New Section
```python
# Instead of hardcoding in the model
Section.objects.create(
    code='RA-1234',
    name='New Environmental Law',
    description='Description of the new law',
    is_combined=False
)
```

### 3. Adding a New District
```python
# Instead of hardcoding in the model
District.objects.create(
    code='AB-1',
    name='Abra - 1st District',
    province='Abra',
    description='First district of Abra province'
)
```

### 4. Configuring User Level Constraints
```python
# Update existing user level constraints
user_level = UserLevel.objects.get(code='Section Chief')
user_level.max_active_per_section = 2  # Allow 2 per section
user_level.requires_district = True    # Now requires district
user_level.save()
```

### 5. Querying with Normalized Models
```python
# Get all users for a specific user level
users = User.objects.filter(userlevel__code='Section Chief')

# Get all users in a specific section
users = User.objects.filter(section__code='PD-1586')

# Get all users in a specific district
users = User.objects.filter(district__code='LU-1')

# Get users with specific permissions
users = User.objects.filter(permissions__permission_code='manage_inspections')
```

### 6. Assignment History Tracking
```python
# Get assignment history for a user
history = UserAssignmentHistory.objects.filter(user=user)

# Get all changes made by a specific user
changes = UserAssignmentHistory.objects.filter(changed_by=admin_user)

# Get recent assignment changes
recent_changes = UserAssignmentHistory.objects.filter(
    timestamp__gte=timezone.now() - timedelta(days=30)
)
```

## Implementation Steps

1. **Review the normalized models** in `models_normalized.py`
2. **Run the migrations** to create the normalized tables
3. **Populate the normalized data** using the management command
4. **Update the application code** to use the normalized models
5. **Test the functionality** to ensure everything works correctly
6. **Deploy to production** with proper backup and rollback procedures

## Rollback Strategy

If issues arise during the migration:

1. **Stop the application** to prevent data corruption
2. **Restore from backup** if necessary
3. **Revert the migrations** using Django's migration rollback
4. **Restore the original models** if needed
5. **Test the rollback** to ensure the system is working

## API Changes

### New Endpoints
- `/api/user-levels/` - Manage user levels
- `/api/sections/` - Manage sections
- `/api/districts/` - Manage districts
- `/api/users/{id}/assignment-history/` - Get user assignment history
- `/api/users/{id}/permissions/` - Get user permissions
- `/api/users/{id}/toggle-active/` - Toggle user active status
- `/api/users/{id}/assign-district/` - Assign district to user

### Updated Endpoints
- `/api/users/` - Now returns normalized data
- `/api/auth/register/` - Uses normalized models
- `/api/auth/login/` - Returns normalized user data

## Conclusion

The user model normalization provides a more maintainable, scalable, and robust foundation for the user management system. While it requires some initial effort to implement, the long-term benefits in terms of maintainability, performance, data integrity, and auditability make it a worthwhile investment.

The normalized structure allows for:
- Dynamic configuration of user levels and constraints
- Complete audit trail of user changes
- Granular permission management
- Easy extension with new features
- Better data integrity and consistency
- Improved performance and scalability
