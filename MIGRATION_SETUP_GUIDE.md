# Migration Setup Guide

## Quick Setup Steps

### 1. Apply Database Migration

Navigate to the server directory and run the migration:

```bash
# Navigate to server directory
cd server

# Activate virtual environment (if needed)
# Windows:
..\venv\Scripts\activate
# Linux/Mac:
source ../venv/bin/activate

# Apply the migration
python manage.py migrate inspections

# Check migration status
python manage.py showmigrations inspections
```

### 2. Verify Migration Success

Check that the new fields are added to the database:

```bash
# Check the migration was applied
python manage.py showmigrations inspections

# You should see:
# [X] 0010_add_compliance_tracking
```

### 3. Test the Migration

Create a test inspection to verify the new fields work:

```python
# In Django shell
python manage.py shell

# Test the new fields
from inspections.models import Inspection
from establishments.models import Establishment

# Create a test inspection
establishment = Establishment.objects.first()
inspection = Inspection.objects.create(
    establishment=establishment,
    section='PD-1586',
    compliance_status='PENDING'
)

# Verify new fields exist
print(inspection.compliance_status)
print(inspection.violations_found)
print(inspection.legal_unit_comments)
```

## Migration Details

### New Fields Added

#### Compliance Tracking
- `compliance_status`: Overall compliance status (PENDING, COMPLIANT, NON_COMPLIANT, PARTIALLY_COMPLIANT)
- `compliance_notes`: Detailed compliance assessment
- `violations_found`: List of violations found during inspection
- `compliance_plan`: Establishment's compliance plan
- `compliance_deadline`: Deadline for compliance

#### Legal Unit Tracking
- `notice_of_violation_sent`: Boolean flag for NOV sent
- `notice_of_order_sent`: Boolean flag for NOO sent
- `penalties_imposed`: Text field for penalties and fines
- `legal_unit_comments`: Legal unit assessment and recommendations

#### Updated Choices
- **Status Choices**: Added `MONITORING_ASSIGN` status
- **Action Choices**: Added `FORWARD_TO_UNIT`, `COMPLETE_COMPLIANT`, `COMPLETE_NON_COMPLIANT`
- **Default Status**: Changed from `PENDING` to `DIVISION_CREATED`

## Rollback Instructions (if needed)

If you need to rollback the migration:

```bash
# Rollback to previous migration
python manage.py migrate inspections 0009

# Or rollback all inspections migrations
python manage.py migrate inspections zero
```

## Troubleshooting

### Common Issues

1. **Migration Conflicts**:
   ```bash
   # Reset migrations (CAUTION: This will lose data)
   python manage.py migrate inspections zero
   python manage.py makemigrations inspections
   python manage.py migrate inspections
   ```

2. **Field Already Exists**:
   - Check if the field was manually added
   - Remove duplicate field definitions
   - Re-run migration

3. **Permission Errors**:
   ```bash
   # Ensure proper permissions
   chmod +x manage.py
   ```

4. **Database Locked**:
   - Close any database connections
   - Restart Django development server
   - Try migration again

### Verification Commands

```bash
# Check Django can import the models
python manage.py shell -c "from inspections.models import Inspection; print('Models imported successfully')"

# Check database schema
python manage.py dbshell
.schema inspections_inspection

# Check migration history
python manage.py showmigrations inspections
```

## Post-Migration Testing

After successful migration, test the following:

1. **Model Creation**: Create an inspection with new fields
2. **API Endpoints**: Test the new workflow decision API
3. **Frontend Integration**: Verify frontend components work with new fields
4. **Tab Functionality**: Test the new tab structure for different user levels

## Support

If you encounter issues:

1. Check Django logs for detailed error messages
2. Verify database permissions and connections
3. Ensure all dependencies are properly installed
4. Check that the virtual environment is activated
5. Verify Python path and Django installation
