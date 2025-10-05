# Inspection Form Normalization Guide

This guide explains the normalized inspection form system that provides a flexible, database-driven approach to managing inspection forms.

## Overview

The normalized form system consists of:

1. **JSON Configuration**: Defines form structure, fields, and validation rules
2. **Database Models**: Normalized tables for templates, sections, fields, and responses
3. **API Endpoints**: RESTful endpoints for form management
4. **Frontend Utilities**: Helper functions for form configuration and validation

## Architecture

### Database Models

#### Core Models
- `InspectionFormTemplate`: Form templates with versioning
- `FormSection`: Sections within a form template
- `FormField`: Individual fields within sections
- `InspectionFormInstance`: Actual form instances for inspections
- `FormFieldResponse`: Individual field responses
- `FormSubmission`: Form submission tracking
- `FormAuditLog`: Audit trail for all form changes
- `FormValidationRule`: Validation rules for fields

#### Relationships
```
InspectionFormTemplate (1) -> (N) FormSection
FormSection (1) -> (N) FormField
FormField (1) -> (N) FormValidationRule

Inspection (1) -> (1) InspectionFormInstance
InspectionFormInstance (1) -> (N) FormFieldResponse
InspectionFormInstance (1) -> (1) FormSubmission
InspectionFormInstance (1) -> (N) FormAuditLog
```

### JSON Configuration

The form structure is defined in `src/constants/inspectionform/formConfig.json`:

```json
{
  "formSections": [
    {
      "id": "general_information",
      "title": "General Information",
      "fields": [
        {
          "id": "establishment_name",
          "label": "Establishment Name",
          "type": "text",
          "required": true,
          "validation": {
            "pattern": "^.+$",
            "message": "Establishment name is required"
          }
        }
      ]
    }
  ]
}
```

## Setup Instructions

### 1. Run Migrations

```bash
python manage.py makemigrations inspections
python manage.py migrate
```

### 2. Populate Form Template

```bash
python manage.py populate_form_template
```

This command will:
- Read the JSON configuration
- Create form template in database
- Create sections and fields
- Set up validation rules

### 3. Configure URLs

Add to your `urls.py`:

```python
from inspections.views_normalized import (
    InspectionFormTemplateViewSet,
    InspectionFormInstanceViewSet,
    FormFieldResponseViewSet,
    FormSubmissionViewSet
)

router.register(r'form-templates', InspectionFormTemplateViewSet)
router.register(r'form-instances', InspectionFormInstanceViewSet)
router.register(r'field-responses', FormFieldResponseViewSet)
router.register(r'form-submissions', FormSubmissionViewSet)
```

## Usage Examples

### Creating a Form Instance

```python
from inspections.models_normalized import FormManager

# Create form instance for an inspection
form_instance = FormManager.create_form_instance(inspection, template)
```

### Saving Field Data

```python
# Save individual field response
response = FormManager.save_field_response(
    form_instance, 
    'establishment_name', 
    'ABC Company',
    user
)
```

### Validating Form

```python
# Validate entire form
errors = FormManager.validate_form(form_instance)
if not errors:
    print("Form is valid!")
else:
    print(f"Validation errors: {errors}")
```

### Frontend Usage

```javascript
import { formConfigLoader } from '../utils/formConfigLoader';

// Get form sections
const sections = formConfigLoader.getSections();

// Validate field
const validation = formConfigLoader.validateField('establishment_name', 'ABC Company');

// Validate entire form
const formValidation = formConfigLoader.validateForm(formData);
```

## API Endpoints

### Form Templates
- `GET /api/form-templates/` - List all templates
- `GET /api/form-templates/{id}/` - Get template details
- `POST /api/form-templates/{id}/create_form_instance/` - Create form instance

### Form Instances
- `GET /api/form-instances/` - List form instances
- `GET /api/form-instances/{id}/` - Get form instance
- `POST /api/form-instances/{id}/save_field_data/` - Save field data
- `POST /api/form-instances/{id}/validate_form/` - Validate form
- `POST /api/form-instances/{id}/submit_form/` - Submit form
- `POST /api/form-instances/{id}/approve_form/` - Approve form
- `POST /api/form-instances/{id}/reject_form/` - Reject form
- `GET /api/form-instances/{id}/audit_log/` - Get audit log

### Field Responses
- `GET /api/field-responses/` - List field responses
- `GET /api/field-responses/{id}/` - Get field response
- `POST /api/field-responses/` - Create field response
- `PUT /api/field-responses/{id}/` - Update field response

### Form Submissions
- `GET /api/form-submissions/` - List submissions
- `GET /api/form-submissions/{id}/` - Get submission details

## Field Types

### Basic Types
- `text`: Single line text input
- `textarea`: Multi-line text input
- `number`: Numeric input
- `email`: Email input with validation
- `tel`: Phone number input
- `date`: Date picker
- `datetime-local`: Date and time picker

### Selection Types
- `select`: Dropdown selection
- `checkbox`: Single checkbox
- `checkbox_group`: Multiple checkboxes
- `radio`: Radio button group

### Specialized Types
- `permit_checklist`: Environmental permits checklist
- `compliance_checklist`: Compliance items checklist
- `system_checklist`: Environmental systems checklist

## Validation

### Built-in Validation
- Required field validation
- Pattern matching (regex)
- Min/max values for numbers
- Email format validation
- Date format validation

### Custom Validation
Add custom validation rules in the JSON configuration:

```json
{
  "validation": {
    "pattern": "^[A-Z]{2,3}-\\d{4}-\\d{4}$",
    "message": "Code must be in format XX-YYYY-NNNN"
  }
}
```

## Conditional Logic

Fields can be shown/hidden based on other field values:

```json
{
  "conditional": {
    "field": "compliance_decision",
    "value": "NON_COMPLIANT"
  }
}
```

## Audit Trail

All form changes are automatically logged:
- Field value changes
- Form submissions
- Approvals/rejections
- User actions with timestamps

## Benefits

### Flexibility
- Easy to modify form structure via JSON
- No code changes needed for form updates
- Version control for form templates

### Scalability
- Normalized database structure
- Efficient queries and indexing
- Support for large forms

### Maintainability
- Clear separation of concerns
- Comprehensive audit trail
- Validation rules in configuration

### User Experience
- Real-time validation
- Conditional field display
- Draft saving and auto-recovery

## Migration from Current System

To migrate from the current form system:

1. **Backup existing data**
2. **Run migrations** to create new tables
3. **Populate templates** from JSON configuration
4. **Migrate existing form data** (if needed)
5. **Update frontend** to use new API endpoints
6. **Test thoroughly** before going live

## Troubleshooting

### Common Issues

1. **Template not found**: Ensure template is created and active
2. **Field validation errors**: Check JSON configuration syntax
3. **Permission errors**: Verify user has access to inspection
4. **Migration errors**: Check database constraints and foreign keys

### Debug Mode

Enable debug logging in Django settings:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'inspections.models_normalized': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## Future Enhancements

- **Form Builder UI**: Visual form designer
- **Advanced Validation**: Cross-field validation rules
- **Form Analytics**: Usage statistics and insights
- **Multi-language Support**: Internationalization
- **Form Templates Library**: Pre-built templates
- **Integration APIs**: Connect with external systems
