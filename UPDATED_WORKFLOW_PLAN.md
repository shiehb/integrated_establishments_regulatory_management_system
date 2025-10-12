# Updated Inspection Workflow Implementation Plan

## Button Strategy (5 Core Buttons)

### 1. **"Inspect"** - Start NEW inspection
- **When:** SECTION_ASSIGNED, UNIT_ASSIGNED, MONITORING_ASSIGNED
- **Icon:** Play
- **Color:** Green
- **Action:** Changes status to IN_PROGRESS, opens form
- **Behavior:**
  - SECTION_ASSIGNED → SECTION_IN_PROGRESS
  - UNIT_ASSIGNED → UNIT_IN_PROGRESS  
  - MONITORING_ASSIGNED → MONITORING_IN_PROGRESS

### 2. **"Continue"** - Resume editing
- **When:** SECTION_IN_PROGRESS, UNIT_IN_PROGRESS, MONITORING_IN_PROGRESS
- **Icon:** Edit
- **Color:** Sky blue
- **Action:** Opens form to continue editing (no status change)

### 3. **"Review"** - View completed inspection
- **When:** SECTION_COMPLETED_*, MONITORING_COMPLETED_*, UNIT_REVIEWED, SECTION_REVIEWED, DIVISION_REVIEWED
- **Icon:** Eye
- **Color:** Sky blue
- **Action:** Opens form in review/view mode (no status change)

### 4. **"Forward"** - Delegate or send up hierarchy
- **When:** Most statuses where delegation is needed
- **Icon:** ArrowRight
- **Color:** Sky blue
- **Action:** Shows modal or auto-forwards based on context

### 5. **"Send to Legal"** / **"Close"** - Final actions
- **When:** DIVISION_REVIEWED, LEGAL_REVIEW, NOV_SENT, NOO_SENT
- **Icon:** Scale / Lock
- **Color:** Orange / Green / Red
- **Action:** Final routing or closure

## Complete Button Mapping

| Status | Assigned To | Buttons | What Happens |
|--------|-------------|---------|--------------|
| SECTION_ASSIGNED | Section Chief | **Inspect**, **Forward** | Start work OR delegate |
| SECTION_IN_PROGRESS | Section Chief | **Continue** | Resume editing form |
| SECTION_COMPLETED_* | Division Chief | **Review**, **Forward** | View results OR re-delegate |
| UNIT_ASSIGNED | Unit Head | **Inspect**, **Forward** | Start work OR delegate |
| UNIT_IN_PROGRESS | Unit Head | **Continue**, **Forward** | Resume OR delegate |
| MONITORING_ASSIGNED | Monitoring | **Inspect** | Start inspection |
| MONITORING_IN_PROGRESS | Monitoring | **Continue** | Resume inspection |
| MONITORING_COMPLETED_* | Unit Head | **Review**, **Forward** | View results, Forward to Section |
| UNIT_REVIEWED | Section Chief | **Review**, **Forward** | View results, Forward to Division |
| SECTION_REVIEWED | Division Chief | **Review**, **Forward** | View results, Forward to finalize |
| DIVISION_REVIEWED | Division Chief | **Review**, **Send to Legal**, **Close** | Final decision |
| LEGAL_REVIEW | Legal Unit | **Review**, **Close** (NOV/NOO options) | Legal actions |

## Backend Implementation

### File: `server/inspections/serializers.py`

```python
actions_map = {
    # Section Chief
    ('SECTION_ASSIGNED', 'Section Chief'): ['inspect', 'forward'],
    ('SECTION_IN_PROGRESS', 'Section Chief'): ['continue'],
    ('SECTION_COMPLETED_COMPLIANT', 'Section Chief'): ['review', 'forward'],
    ('SECTION_COMPLETED_NON_COMPLIANT', 'Section Chief'): ['review', 'forward'],
    
    # Unit Head
    ('UNIT_ASSIGNED', 'Unit Head'): ['inspect', 'forward'],
    ('UNIT_IN_PROGRESS', 'Unit Head'): ['continue', 'forward'],
    
    # Monitoring Personnel
    ('MONITORING_ASSIGNED', 'Monitoring Personnel'): ['inspect'],
    ('MONITORING_IN_PROGRESS', 'Monitoring Personnel'): ['continue'],
    ('MONITORING_COMPLETED_COMPLIANT', 'Unit Head'): ['review', 'forward'],
    ('MONITORING_COMPLETED_NON_COMPLIANT', 'Unit Head'): ['review', 'forward'],
    
    # Review statuses
    ('UNIT_REVIEWED', 'Section Chief'): ['review', 'forward'],
    ('SECTION_REVIEWED', 'Division Chief'): ['review', 'forward'],
    ('DIVISION_REVIEWED', 'Division Chief'): ['review', 'send_to_legal', 'close'],
    
    # Legal Unit
    ('LEGAL_REVIEW', 'Legal Unit'): ['review', 'close'],
    ('NOV_SENT', 'Legal Unit'): ['review', 'close'],
    ('NOO_SENT', 'Legal Unit'): ['review', 'close'],
}
```

### File: `server/inspections/views.py`

**Add/Update these action methods:**

```python
@action(detail=True, methods=['post'])
def inspect(self, request, pk=None):
    """Start inspection - changes ASSIGNED → IN_PROGRESS"""
    inspection = self.get_object()
    user = request.user
    
    status_map = {
        'SECTION_ASSIGNED': 'SECTION_IN_PROGRESS',
        'UNIT_ASSIGNED': 'UNIT_IN_PROGRESS',
        'MONITORING_ASSIGNED': 'MONITORING_IN_PROGRESS',
    }
    
    next_status = status_map.get(inspection.current_status)
    if not next_status:
        return Response({'error': 'Cannot inspect from this status'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Change status
    prev_status = inspection.current_status
    inspection.current_status = next_status
    inspection.assigned_to = user  # Assign to self
    inspection.save()
    
    # Log history
    InspectionHistory.objects.create(
        inspection=inspection,
        previous_status=prev_status,
        new_status=next_status,
        changed_by=user,
        remarks=f'Started inspection'
    )
    
    return Response(self.get_serializer(inspection).data)

# Continue and Review actions just return inspection data
# Frontend handles opening form
```

## Frontend Implementation

### File: `src/constants/inspectionConstants.js`

```javascript
export const actionButtonConfig = {
  inspect: {
    label: 'Inspect',
    color: 'green',
    icon: Play
  },
  continue: {
    label: 'Continue',
    color: 'sky',
    icon: Edit
  },
  review: {
    label: 'Review',
    color: 'sky',
    icon: Eye
  },
  forward: {
    label: 'Forward',
    color: 'sky',
    icon: ArrowRight
  },
  send_to_legal: {
    label: 'Send to Legal',
    color: 'orange',
    icon: Scale
  },
  close: {
    label: 'Close',
    color: 'green',
    icon: Lock
  }
};
```

### File: `src/components/inspections/InspectionsList.jsx`

```javascript
const handleActionClick = async (action, inspectionId) => {
  const inspection = inspections.find(i => i.id === inspectionId);
  
  switch(action) {
    case 'inspect':
      // Call backend to change status, then open form
      await handleAction('inspect', inspectionId);
      window.location.href = `/inspections/${inspectionId}/form`;
      break;
      
    case 'continue':
      // Just open form, no status change
      window.location.href = `/inspections/${inspectionId}/form`;
      break;
      
    case 'review':
      // Open form in review mode, no status change
      window.location.href = `/inspections/${inspectionId}/form?mode=review`;
      break;
      
    case 'forward':
      // Show forward modal
      setActionConfirmation({ open: true, inspection, action: 'forward' });
      break;
      
    case 'send_to_legal':
      await handleSendToLegal(inspection);
      break;
      
    case 'close':
      setActionConfirmation({ open: true, inspection, action: 'close' });
      break;
  }
};
```

## Status Labels (Simplified)

```javascript
export const statusDisplayMap = {
  CREATED: { label: 'Created', color: 'gray' },
  
  SECTION_ASSIGNED: { label: 'New Assignment', color: 'blue' },
  SECTION_IN_PROGRESS: { label: 'In Progress', color: 'yellow' },
  SECTION_COMPLETED_COMPLIANT: { label: 'Completed ✓', color: 'green' },
  SECTION_COMPLETED_NON_COMPLIANT: { label: 'Completed ✗', color: 'red' },
  
  UNIT_ASSIGNED: { label: 'New Assignment', color: 'blue' },
  UNIT_IN_PROGRESS: { label: 'In Progress', color: 'yellow' },
  
  MONITORING_ASSIGNED: { label: 'New Assignment', color: 'indigo' },
  MONITORING_IN_PROGRESS: { label: 'In Progress', color: 'amber' },
  MONITORING_COMPLETED_COMPLIANT: { label: 'Completed ✓', color: 'green' },
  MONITORING_COMPLETED_NON_COMPLIANT: { label: 'Completed ✗', color: 'red' },
  
  UNIT_REVIEWED: { label: 'Pending Section Review', color: 'purple' },
  SECTION_REVIEWED: { label: 'Pending Division Review', color: 'purple' },
  DIVISION_REVIEWED: { label: 'Under Final Review', color: 'purple' },
  
  LEGAL_REVIEW: { label: 'Legal Review', color: 'orange' },
  NOV_SENT: { label: 'NOV Sent', color: 'pink' },
  NOO_SENT: { label: 'NOO Sent', color: 'pink' },
  
  CLOSED_COMPLIANT: { label: 'Closed ✅', color: 'green' },
  CLOSED_NON_COMPLIANT: { label: 'Closed ❌', color: 'rose' }
};
```

## Backend Workflow Fixes

### 1. Add Monitoring Completion Transitions
**File:** `server/inspections/models.py`

```python
'MONITORING_IN_PROGRESS': {
    'MONITORING_COMPLETED_COMPLIANT': ['Monitoring Personnel'],
    'MONITORING_COMPLETED_NON_COMPLIANT': ['Monitoring Personnel'],
},
'MONITORING_COMPLETED_COMPLIANT': {
    'UNIT_REVIEWED': ['Unit Head'],  # Unit Head sends to Section
},
'MONITORING_COMPLETED_NON_COMPLIANT': {
    'UNIT_REVIEWED': ['Unit Head'],  # Unit Head sends to Section
},
```

### 2. Auto-Assignment Logic
**File:** `server/inspections/views.py`

```python
# Auto-assign completed inspections to reviewers (status unchanged)
if next_status in ['SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT']:
    self._auto_assign_to_division_chief(inspection, user)
elif next_status in ['MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT']:
    self._auto_assign_to_unit_head(inspection, user)
```

### 3. Add Auto-Assignment Methods

```python
def _auto_assign_to_division_chief(self, inspection, user):
    """Auto-assign to Division Chief for review (status unchanged)"""
    from users.models import User
    
    division_chief = User.objects.filter(userlevel='Division Chief', is_active=True).first()
    
    if division_chief:
        inspection.assigned_to = division_chief
        inspection.save()
        
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=inspection.current_status,
            new_status=inspection.current_status,
            changed_by=user,
            remarks=f'Assigned to Division Chief for review'
        )

def _auto_assign_to_unit_head(self, inspection, user):
    """Auto-assign to Unit Head for review (status unchanged)"""
    
    next_assignee = inspection.get_next_assignee('UNIT_REVIEWED')
    
    if next_assignee:
        inspection.assigned_to = next_assignee
        inspection.save()
        
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=inspection.current_status,
            new_status=inspection.current_status,
            changed_by=user,
            remarks=f'Assigned to Unit Head for review'
        )
```

## Cleanup Recommendations

### Remove Unused Statuses
```python
# REMOVE these from STATUS_CHOICES
('UNIT_COMPLETED_COMPLIANT', 'Unit Completed - Compliant'),
('UNIT_COMPLETED_NON_COMPLIANT', 'Unit Completed - Non-Compliant'),
('FINALIZED', 'Finalized'),
('CLOSED', 'Closed'),
```

### Remove Unused Actions
```python
# Remove these action methods from views.py
- assign_to_me
- start  
- send_to_section
- send_to_division
- send_nov
- send_noo
```

## Summary

### Button Reduction: 11 → 5
- **Removed:** `assign_to_me`, `start` (merged into `inspect`)
- **Kept:** `inspect` (start new), `continue` (resume), `review` (view), `forward`, `send_to_legal`, `close`

### Clear Separation:
- **Inspect** = Start something new (green, action-oriented)
- **Continue** = Resume what you started (blue, editing)
- **Review** = Look at completed work (blue, viewing)
- **Forward** = Send to someone else (blue, delegation)
- **Send to Legal / Close** = Final actions (orange/green/red)

### Implementation Steps:
1. Update backend transitions and actions
2. Add auto-assignment methods
3. Update frontend button constants
4. Update action handlers
5. Remove unused statuses and actions
6. Test complete workflow

### Key Features:
✅ Clear button names that match user intent
✅ Different colors for different action types
✅ Consistent behavior across all roles
✅ Easy to understand what each button does
✅ Correct review flow: Unit → Section → Division
