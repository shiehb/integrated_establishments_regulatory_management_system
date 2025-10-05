# Inspection Workflow Implementation Guide

## Overview
This document provides a comprehensive guide for the refactored inspection management system with a complete workflow state machine, role-based dashboards, and automated assignment logic.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Workflow States](#workflow-states)
5. [Migration Guide](#migration-guide)
6. [Testing Guide](#testing-guide)

---

## Architecture Overview

### Key Features
- **M2M Relationship**: Multiple establishments per inspection
- **Workflow State Machine**: 18 distinct states with validated transitions
- **Auto-Assignment**: Automatic personnel assignment based on law and district
- **Role-Based Dashboards**: Customized views for each user level
- **Complete History Tracking**: All status changes logged with timestamps
- **Document Management**: File uploads with categorization

### Technology Stack
- **Backend**: Django + Django REST Framework
- **Frontend**: React + Tailwind CSS
- **Database**: PostgreSQL (recommended) or SQLite

---

## Backend Implementation

### 1. Models (`server/inspections/models_refactored.py`)

#### Inspection Model
```python
Key Fields:
- code: Unique inspection code (auto-generated)
- establishments: M2M → Establishment
- law: CharField (PD-1586, RA-6969, RA-8749, RA-9275, RA-9003)
- district: CharField (e.g., "La Union - 1st District")
- created_by: FK → User
- assigned_to: FK → User (current assignee)
- current_status: CharField (18 workflow states)

Methods:
- save(): Auto-generates unique inspection code
- get_simplified_status(): Returns user-friendly status labels
- can_transition_to(new_status, user): Validates state transitions
- auto_assign_personnel(): Auto-assigns based on law and district
- get_next_assignee(next_status): Finds appropriate personnel
```

#### InspectionForm Model
```python
Key Fields:
- inspection: OneToOne → Inspection
- scheduled_at: DateTimeField
- inspection_notes: TextField
- checklist: JSONField
- findings_summary: TextField
- compliance_decision: CharField (PENDING, COMPLIANT, NON_COMPLIANT)
- violations_found: TextField
- compliance_plan: TextField
- compliance_deadline: DateField

Validation:
- Non-compliant requires violations_found
```

#### InspectionDocument Model
```python
Key Fields:
- inspection_form: FK → InspectionForm
- file: FileField
- document_type: CharField (REPORT, PHOTO, PERMIT, NOTICE, OTHER)
- uploaded_by: FK → User
- uploaded_at: DateTimeField
```

#### InspectionHistory Model
```python
Key Fields:
- inspection: FK → Inspection
- previous_status: CharField
- new_status: CharField
- changed_by: FK → User
- remarks: TextField
- created_at: DateTimeField
```

### 2. Serializers (`server/inspections/serializers_refactored.py`)

#### InspectionSerializer
- Includes all related data (establishments, form, history)
- Computed fields: simplified_status, can_user_act, available_actions
- Context-aware: Shows actions based on user level and current status

#### InspectionCreateSerializer
- Wizard-style creation
- Validates establishment IDs
- Auto-creates InspectionForm
- Auto-assigns personnel on creation

#### Action Serializers
- InspectionActionSerializer: Generic action with remarks
- NOVSerializer: Notice of Violation details
- NOOSerializer: Notice of Order details

### 3. ViewSet (`server/inspections/views_refactored.py`)

#### Standard CRUD Operations
- `list()`: Role-based filtering with tab support
- `retrieve()`: Full inspection details
- `create()`: Division Chief only, auto-assigns Section Chief

#### Custom Actions

##### Workflow Actions
```python
@action POST /api/inspections/{id}/assign_to_me/
- Section Chief or Unit Head assigns inspection to themselves

@action POST /api/inspections/{id}/start/
- Transitions: SECTION_ASSIGNED → SECTION_IN_PROGRESS
- Transitions: UNIT_ASSIGNED → UNIT_IN_PROGRESS
- Transitions: MONITORING_ASSIGNED → MONITORING_IN_PROGRESS

@action POST /api/inspections/{id}/complete/
- Section/Unit: Marks as completed
- Monitoring: Requires compliance_decision (COMPLIANT/NON_COMPLIANT)
- Validates violations for non-compliant

@action POST /api/inspections/{id}/forward/
- Forwards to next level (Unit Head or Monitoring)
- Auto-assigns next personnel

@action POST /api/inspections/{id}/review/
- Reviews and forwards up the chain
- Unit → Section → Division

@action POST /api/inspections/{id}/forward_to_legal/
- Division Chief forwards non-compliant to Legal Unit

@action POST /api/inspections/{id}/send_nov/
- Legal Unit sends Notice of Violation
- Updates form with violations and deadline

@action POST /api/inspections/{id}/send_noo/
- Legal Unit sends Notice of Order
- Records penalty fees and breakdown

@action POST /api/inspections/{id}/close/
- Division Chief closes compliant cases
- Legal Unit closes non-compliant cases
```

##### Utility Actions
```python
@action GET /api/inspections/{id}/history/
- Returns full inspection history

@action POST /api/inspections/{id}/documents/
- Upload documents to inspection form
```

### 4. Permissions

#### Role-Based Access
- **Division Chief**: Create, review, forward to legal, close compliant
- **Section Chief**: Start, complete, forward
- **Unit Head**: Start, complete, forward
- **Monitoring Personnel**: Start, complete (with compliance decision)
- **Legal Unit**: Send NOV/NOO, close non-compliant

#### Validation Rules
- Can only act if `assigned_to == current_user`
- State transitions validated by `can_transition_to()`
- Non-compliant requires violations
- Auto-assignment based on law + district

---

## Frontend Implementation

### 1. Components

#### InspectionTable (`src/components/inspections/InspectionTable.jsx`)
- Displays inspections in tabular format
- Renders action buttons based on available_actions
- Color-coded status badges
- Click to view details

#### CreateInspectionWizard (`src/components/inspections/CreateInspectionWizard.jsx`)
- 3-step wizard:
  1. Select establishments (M2M)
  2. Select law
  3. Review & confirm with schedule/notes
- Validates all fields
- Creates inspection and form in one API call

#### StatusStepper (`src/components/inspections/StatusStepper.jsx`)
- Visual progress indicator
- Shows compliant or non-compliant path
- Highlights current status
- Checkmarks for completed steps

#### InspectionDetail (`src/components/inspections/InspectionDetail.jsx`)
- Full inspection details
- Status stepper visualization
- Establishments, form data, history
- Action buttons based on user role
- Document management

#### Modal Components
- **CompleteModal**: Complete with compliance decision (Monitoring)
- **ForwardModal**: Forward with remarks
- **NOVModal**: Send Notice of Violation (Legal)
- **NOOModal**: Send Notice of Order (Legal)

### 2. Pages

#### InspectionDashboard (`src/pages/InspectionDashboard.jsx`)
- Role-based tabs:
  - **Division Chief**: Create | Tracking
  - **Section Chief**: Received | My Inspections | Forwarded | Review
  - **Unit Head**: Received | My Inspections | Forwarded | Review
  - **Monitoring**: Assigned Inspections
  - **Legal**: Non-Compliant Cases
- Dynamic tab content
- Integrated action handling
- Modal management

---

## Workflow States

### State Diagram

```
CREATED
  ↓
SECTION_ASSIGNED
  ↓
SECTION_IN_PROGRESS
  ↓
SECTION_COMPLETED
  ↓
UNIT_ASSIGNED (if Unit Head exists)
  ↓
UNIT_IN_PROGRESS
  ↓
UNIT_COMPLETED
  ↓
MONITORING_ASSIGNED
  ↓
MONITORING_IN_PROGRESS
  ↓
┌─────────────────────────────────┐
│  MONITORING_COMPLETED_COMPLIANT │  MONITORING_COMPLETED_NON_COMPLIANT
└─────────────────────────────────┘
  ↓                                   ↓
UNIT_REVIEWED                      UNIT_REVIEWED
  ↓                                   ↓
SECTION_REVIEWED                   SECTION_REVIEWED
  ↓                                   ↓
DIVISION_REVIEWED                  DIVISION_REVIEWED
  ↓                                   ↓
CLOSED_COMPLIANT                   LEGAL_REVIEW
                                      ↓
                                   NOV_SENT
                                      ↓
                                   NOO_SENT
                                      ↓
                                   CLOSED_NON_COMPLIANT
```

### Simplified Status Labels
- **Created**: Inspection just created
- **New – Waiting for Action**: Assigned but not started
- **In Progress**: Active work
- **Completed**: Work finished at current level
- **Completed – Compliant**: Monitoring found compliant
- **Completed – Non-Compliant**: Monitoring found violations
- **Reviewed**: Reviewed by supervisor
- **For Legal Review**: At Division or Legal
- **NOV Sent**: Notice of Violation sent
- **NOO Sent**: Notice of Order sent
- **Closed ✅**: Closed compliant
- **Closed ❌**: Closed non-compliant

---

## Migration Guide

### Step 1: Database Migration

```bash
# Navigate to server directory
cd server

# Create migrations
python manage.py makemigrations inspections

# Review migration file
# Ensure no conflicts with existing Inspection model

# Apply migrations
python manage.py migrate
```

### Step 2: Data Migration (if needed)

If you have existing inspections, create a data migration:

```python
# server/inspections/migrations/XXXX_migrate_existing_inspections.py
from django.db import migrations

def migrate_inspections(apps, schema_editor):
    OldInspection = apps.get_model('inspections', 'Inspection')
    NewInspection = apps.get_model('inspections', 'Inspection')
    InspectionForm = apps.get_model('inspections', 'InspectionForm')
    
    for old in OldInspection.objects.all():
        # Create new inspection
        new = NewInspection.objects.create(
            code=old.code,
            law=old.section,
            district=old.district,
            created_by=old.created_by,
            assigned_to=old.current_assigned_to,
            current_status=old.status,
            created_at=old.created_at,
            updated_at=old.updated_at
        )
        
        # Add establishment (convert FK to M2M)
        new.establishments.add(old.establishment)
        
        # Create form
        InspectionForm.objects.create(
            inspection=new,
            inspection_notes=old.inspection_notes or '',
            compliance_decision=old.compliance_status or 'PENDING',
            violations_found=old.violations_found or ''
        )

class Migration(migrations.Migration):
    dependencies = [
        ('inspections', 'XXXX_previous_migration'),
    ]

    operations = [
        migrations.RunPython(migrate_inspections),
    ]
```

### Step 3: Update URLs

```python
# server/inspections/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_refactored import InspectionViewSet

router = DefaultRouter()
router.register(r'inspections', InspectionViewSet, basename='inspection')

urlpatterns = [
    path('', include(router.urls)),
]
```

### Step 4: Update Frontend Routes

```javascript
// src/main.jsx or App.jsx
import InspectionDashboard from './pages/InspectionDashboard';
import InspectionDetail from './components/inspections/InspectionDetail';

// Add routes
<Route path="/inspections" element={<InspectionDashboard />} />
<Route path="/inspections/:id" element={<InspectionDetail />} />
```

---

## Testing Guide

### Backend Unit Tests

```python
# server/inspections/tests.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from .models_refactored import Inspection, InspectionForm, InspectionHistory
from establishments.models import Establishment

User = get_user_model()

class InspectionWorkflowTestCase(TestCase):
    def setUp(self):
        # Create users
        self.division_chief = User.objects.create_user(
            email='division@test.com',
            userlevel='Division Chief'
        )
        self.section_chief = User.objects.create_user(
            email='section@test.com',
            userlevel='Section Chief',
            section='PD-1586',
            district='La Union - 1st District'
        )
        self.monitoring = User.objects.create_user(
            email='monitor@test.com',
            userlevel='Monitoring Personnel',
            section='PD-1586',
            district='La Union - 1st District'
        )
        
        # Create establishment
        self.establishment = Establishment.objects.create(
            name='Test Company',
            nature_of_business='Manufacturing',
            province='La Union',
            city='San Fernando',
            barangay='Test',
            street_building='Test St',
            postal_code='2500',
            latitude=16.0,
            longitude=120.0
        )
    
    def test_create_inspection(self):
        inspection = Inspection.objects.create(
            law='PD-1586',
            created_by=self.division_chief,
            current_status='CREATED'
        )
        inspection.establishments.add(self.establishment)
        
        self.assertIsNotNone(inspection.code)
        self.assertTrue(inspection.code.startswith('EIA-'))
    
    def test_workflow_transition_valid(self):
        inspection = Inspection.objects.create(
            law='PD-1586',
            created_by=self.division_chief,
            current_status='SECTION_ASSIGNED',
            assigned_to=self.section_chief
        )
        
        # Test valid transition
        self.assertTrue(
            inspection.can_transition_to('SECTION_IN_PROGRESS', self.section_chief)
        )
    
    def test_workflow_transition_invalid(self):
        inspection = Inspection.objects.create(
            law='PD-1586',
            created_by=self.division_chief,
            current_status='CREATED'
        )
        
        # Test invalid transition (skip states)
        self.assertFalse(
            inspection.can_transition_to('MONITORING_ASSIGNED', self.division_chief)
        )
    
    def test_compliant_workflow(self):
        # Create inspection
        inspection = Inspection.objects.create(
            law='PD-1586',
            created_by=self.division_chief,
            current_status='MONITORING_IN_PROGRESS',
            assigned_to=self.monitoring
        )
        inspection.establishments.add(self.establishment)
        
        # Create form with compliant decision
        form = InspectionForm.objects.create(
            inspection=inspection,
            compliance_decision='COMPLIANT',
            findings_summary='All requirements met'
        )
        
        # Transition to completed
        inspection.current_status = 'MONITORING_COMPLETED_COMPLIANT'
        inspection.save()
        
        self.assertEqual(inspection.current_status, 'MONITORING_COMPLETED_COMPLIANT')
    
    def test_non_compliant_requires_violations(self):
        inspection = Inspection.objects.create(
            law='PD-1586',
            created_by=self.division_chief
        )
        
        # Should raise validation error
        with self.assertRaises(ValidationError):
            form = InspectionForm.objects.create(
                inspection=inspection,
                compliance_decision='NON_COMPLIANT',
                violations_found=''  # Empty violations
            )
            form.full_clean()
```

### API Integration Tests

```python
class InspectionAPITestCase(TestCase):
    def test_create_inspection_division_chief(self):
        self.client.force_authenticate(user=self.division_chief)
        
        response = self.client.post('/api/inspections/', {
            'establishments': [self.establishment.id],
            'law': 'PD-1586',
            'scheduled_at': '2025-10-10T10:00:00Z',
            'inspection_notes': 'Initial inspection'
        })
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['law'], 'PD-1586')
    
    def test_start_inspection_section_chief(self):
        inspection = Inspection.objects.create(
            law='PD-1586',
            created_by=self.division_chief,
            current_status='SECTION_ASSIGNED',
            assigned_to=self.section_chief
        )
        
        self.client.force_authenticate(user=self.section_chief)
        response = self.client.post(f'/api/inspections/{inspection.id}/start/', {
            'remarks': 'Starting inspection'
        })
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['current_status'], 'SECTION_IN_PROGRESS')
```

### Frontend Testing

```javascript
// Manual Testing Checklist

// 1. Division Chief Flow
// - Create inspection with multiple establishments
// - Verify auto-assignment to Section Chief
// - Track inspection through workflow
// - Review at division level
// - Forward non-compliant to legal
// - Close compliant inspection

// 2. Section Chief Flow
// - View received inspections
// - Assign to self
// - Start inspection
// - Complete inspection
// - Forward to Unit Head or Monitoring
// - Review returned inspections

// 3. Unit Head Flow
// - View received from section
// - Start and complete
// - Forward to monitoring
// - Review completed inspections

// 4. Monitoring Personnel Flow
// - View assigned inspections
// - Start inspection
// - Complete with compliant decision
// - Complete with non-compliant decision (requires violations)

// 5. Legal Unit Flow
// - View non-compliant cases
// - Send NOV with deadline
// - Send NOO with penalties
// - Close case
```

---

## API Endpoints Summary

### Inspection CRUD
- `GET /api/inspections/` - List with filters (tab, status, assigned_to_me, created_by_me)
- `POST /api/inspections/` - Create (Division Chief only)
- `GET /api/inspections/{id}/` - Retrieve details
- `PUT /api/inspections/{id}/` - Update
- `DELETE /api/inspections/{id}/` - Delete (Admin only)

### Workflow Actions
- `POST /api/inspections/{id}/assign_to_me/` - Assign to current user
- `POST /api/inspections/{id}/start/` - Start inspection
- `POST /api/inspections/{id}/complete/` - Complete inspection
- `POST /api/inspections/{id}/forward/` - Forward to next level
- `POST /api/inspections/{id}/review/` - Review and forward up
- `POST /api/inspections/{id}/forward_to_legal/` - Forward to Legal Unit
- `POST /api/inspections/{id}/send_nov/` - Send Notice of Violation
- `POST /api/inspections/{id}/send_noo/` - Send Notice of Order
- `POST /api/inspections/{id}/close/` - Close inspection

### Utility
- `GET /api/inspections/{id}/history/` - Get workflow history
- `POST /api/inspections/{id}/documents/` - Upload document

---

## Deployment Checklist

- [ ] Run database migrations
- [ ] Create initial users with proper levels and assignments
- [ ] Test each role's workflow
- [ ] Configure file upload storage (MEDIA_ROOT, MEDIA_URL)
- [ ] Set up proper permissions in production
- [ ] Configure email notifications (optional)
- [ ] Set up backup procedures for inspection data
- [ ] Document operational procedures for administrators

---

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments in models, views, and components
3. Check the migration files for data structure
4. Test with the provided test cases

---

**Last Updated**: October 4, 2025
**Version**: 1.0

