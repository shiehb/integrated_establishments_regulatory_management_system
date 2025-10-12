# Final Inspection Workflow Implementation Plan

## Executive Summary

### Button Strategy: 5 Core Buttons
1. **Inspect** (Green) - Start new inspection
2. **Continue** (Sky Blue) - Resume editing
3. **Review** (Sky Blue) - View completed work
4. **Forward** (Sky Blue) - Delegate/send up
5. **Send to Legal / Close** (Orange/Green/Red) - Final actions

### Status Count: Keep 22 statuses (NOT removing UNIT_COMPLETED_*)
- Remove only: FINALIZED, generic CLOSED (2 statuses)
- Keep: UNIT_COMPLETED_COMPLIANT, UNIT_COMPLETED_NON_COMPLIANT

---

## PART 1: Complete Button Definitions

### 1. "Inspect" Button
- **Icon:** Play
- **Color:** Green
- **Label:** "Inspect"
- **When:** SECTION_ASSIGNED, UNIT_ASSIGNED, MONITORING_ASSIGNED
- **Action:** Changes status to IN_PROGRESS, opens form
- **Behavior:**
  - SECTION_ASSIGNED → SECTION_IN_PROGRESS (opens form)
  - UNIT_ASSIGNED → UNIT_IN_PROGRESS (opens form)
  - MONITORING_ASSIGNED → MONITORING_IN_PROGRESS (opens form)

### 2. "Continue" Button
- **Icon:** Edit
- **Color:** Sky Blue
- **Label:** "Continue"
- **When:** SECTION_IN_PROGRESS, UNIT_IN_PROGRESS, MONITORING_IN_PROGRESS
- **Action:** Opens form to continue editing (no status change)

### 3. "Review" Button ⭐ UPDATED
- **Icon:** Eye
- **Color:** Sky Blue
- **Label:** "Review"
- **When:** ALL COMPLETED and REVIEWED statuses (NO Forward button on COMPLETED)
  - SECTION_COMPLETED_COMPLIANT (auto-assigns to Division Chief)
  - SECTION_COMPLETED_NON_COMPLIANT (auto-assigns to Division Chief)
  - **UNIT_COMPLETED_COMPLIANT** (auto-assigns to Section Chief) ✅
  - **UNIT_COMPLETED_NON_COMPLIANT** (auto-assigns to Section Chief) ✅
  - MONITORING_COMPLETED_COMPLIANT (auto-assigns to Unit Head)
  - MONITORING_COMPLETED_NON_COMPLIANT (auto-assigns to Unit Head)
  - UNIT_REVIEWED (has Forward button)
  - SECTION_REVIEWED (has Forward button)
  - DIVISION_REVIEWED (has Forward button)
- **Action:** Opens form in review/view mode (no status change)
- **Note:** COMPLETED statuses only have Review button, REVIEWED statuses have Review + Forward

### 4. "Forward" Button
- **Icon:** ArrowRight
- **Color:** Sky Blue
- **Label:** "Forward"
- **When:** ASSIGNED, IN_PROGRESS, and REVIEWED statuses (NOT COMPLETED)
  - SECTION_ASSIGNED, UNIT_ASSIGNED (delegate to lower level)
  - SECTION_IN_PROGRESS, UNIT_IN_PROGRESS (delegate mid-work)
  - UNIT_REVIEWED, SECTION_REVIEWED (send up hierarchy)
- **Excluded:** All *_COMPLETED_* statuses (they auto-assign instead)
- **Action:** Shows modal or auto-forwards based on context

### 5. "Send to Legal / Close" Buttons
- **Icon:** Scale / Lock
- **Color:** Orange / Green / Red
- **Label:** Context-dependent
- **When:** DIVISION_REVIEWED, LEGAL_REVIEW, NOV_SENT, NOO_SENT
- **Action:** Final routing or closure

---

## PART 2: Complete Status List (22 Statuses)

### Keep All These Statuses:

```python
STATUS_CHOICES = [
    # Initial (1)
    ('CREATED', 'Created'),
    
    # Section Chief workflow (4)
    ('SECTION_ASSIGNED', 'Section Assigned'),
    ('SECTION_IN_PROGRESS', 'Section In Progress'),
    ('SECTION_COMPLETED_COMPLIANT', 'Section Completed - Compliant'),
    ('SECTION_COMPLETED_NON_COMPLIANT', 'Section Completed - Non-Compliant'),
    
    # Unit Head workflow (4) ✅ KEEP THESE
    ('UNIT_ASSIGNED', 'Unit Assigned'),
    ('UNIT_IN_PROGRESS', 'Unit In Progress'),
    ('UNIT_COMPLETED_COMPLIANT', 'Unit Completed - Compliant'),
    ('UNIT_COMPLETED_NON_COMPLIANT', 'Unit Completed - Non-Compliant'),
    
    # Monitoring workflow (4)
    ('MONITORING_ASSIGNED', 'Monitoring Assigned'),
    ('MONITORING_IN_PROGRESS', 'Monitoring In Progress'),
    ('MONITORING_COMPLETED_COMPLIANT', 'Monitoring Completed - Compliant'),
    ('MONITORING_COMPLETED_NON_COMPLIANT', 'Monitoring Completed - Non-Compliant'),
    
    # Review workflow (3)
    ('UNIT_REVIEWED', 'Unit Reviewed'),
    ('SECTION_REVIEWED', 'Section Reviewed'),
    ('DIVISION_REVIEWED', 'Division Reviewed'),
    
    # Legal workflow (3)
    ('LEGAL_REVIEW', 'Legal Review'),
    ('NOV_SENT', 'NOV Sent'),
    ('NOO_SENT', 'NOO Sent'),
    
    # Final states (2)
    ('CLOSED_COMPLIANT', 'Closed - Compliant'),
    ('CLOSED_NON_COMPLIANT', 'Closed - Non-Compliant'),
]
```

### Remove Only These (2):
```python
# REMOVE
('FINALIZED', 'Finalized'),
('CLOSED', 'Closed'),
```

---

## PART 3: Complete Button Mapping Table

| Status | Assigned To | Buttons | What Happens |
|--------|-------------|---------|--------------|
| **SECTION_ASSIGNED** | Section Chief | Inspect, Forward | Start work OR delegate |
| **SECTION_IN_PROGRESS** | Section Chief | Continue | Resume editing |
| **SECTION_COMPLETED_COMPLIANT** | Division Chief | **Review** | View results (auto-assigned) |
| **SECTION_COMPLETED_NON_COMPLIANT** | Division Chief | **Review** | View results (auto-assigned) |
| **UNIT_ASSIGNED** | Unit Head | Inspect, Forward | Start work OR delegate |
| **UNIT_IN_PROGRESS** | Unit Head | Continue, Forward | Resume OR delegate |
| **UNIT_COMPLETED_COMPLIANT** | Section Chief | **Review** | View results (auto-assigned) |
| **UNIT_COMPLETED_NON_COMPLIANT** | Section Chief | **Review** | View results (auto-assigned) |
| **MONITORING_ASSIGNED** | Monitoring | Inspect | Start inspection |
| **MONITORING_IN_PROGRESS** | Monitoring | Continue | Resume inspection |
| **MONITORING_COMPLETED_COMPLIANT** | Unit Head | **Review** | View results (auto-assigned) |
| **MONITORING_COMPLETED_NON_COMPLIANT** | Unit Head | **Review** | View results (auto-assigned) |
| **UNIT_REVIEWED** | Section Chief | **Review**, Forward | View results, forward to Division |
| **SECTION_REVIEWED** | Division Chief | **Review**, Forward | View results, forward to finalize |
| **DIVISION_REVIEWED** | Division Chief | **Review**, Send to Legal, Close | Final decision |
| **LEGAL_REVIEW** | Legal Unit | **Review**, Close | Legal actions |
| **NOV_SENT** | Legal Unit | **Review**, Close | Continue legal |
| **NOO_SENT** | Legal Unit | **Review**, Close | Final close |

---

## PART 4: Backend Implementation

### 4.1 Update Workflow Transitions
**File:** `server/inspections/models.py`

```python
valid_transitions = {
    'CREATED': {
        'SECTION_ASSIGNED': ['Division Chief'],
    },
    'SECTION_ASSIGNED': {
        'SECTION_IN_PROGRESS': ['Section Chief'],
        'UNIT_ASSIGNED': ['Section Chief'],
        'MONITORING_ASSIGNED': ['Section Chief'],
    },
    'SECTION_IN_PROGRESS': {
        'SECTION_COMPLETED_COMPLIANT': ['Section Chief'],
        'SECTION_COMPLETED_NON_COMPLIANT': ['Section Chief'],
    },
    'SECTION_COMPLETED_COMPLIANT': {
        'UNIT_ASSIGNED': ['Section Chief'],
        'MONITORING_ASSIGNED': ['Section Chief'],
        'DIVISION_REVIEWED': ['Section Chief'],
    },
    'SECTION_COMPLETED_NON_COMPLIANT': {
        'UNIT_ASSIGNED': ['Section Chief'],
        'MONITORING_ASSIGNED': ['Section Chief'],
        'DIVISION_REVIEWED': ['Section Chief'],
    },
    'UNIT_ASSIGNED': {
        'UNIT_IN_PROGRESS': ['Unit Head'],
        'MONITORING_ASSIGNED': ['Unit Head'],
    },
    'UNIT_IN_PROGRESS': {
        'UNIT_COMPLETED_COMPLIANT': ['Unit Head'],
        'UNIT_COMPLETED_NON_COMPLIANT': ['Unit Head'],
    },
    'UNIT_COMPLETED_COMPLIANT': {
        'MONITORING_ASSIGNED': ['Unit Head'],
        'SECTION_REVIEWED': ['Unit Head'],  # Can send to Section
    },
    'UNIT_COMPLETED_NON_COMPLIANT': {
        'MONITORING_ASSIGNED': ['Unit Head'],
        'SECTION_REVIEWED': ['Unit Head'],  # Can send to Section
    },
    'MONITORING_ASSIGNED': {
        'MONITORING_IN_PROGRESS': ['Monitoring Personnel'],
    },
    'MONITORING_IN_PROGRESS': {
        'MONITORING_COMPLETED_COMPLIANT': ['Monitoring Personnel'],
        'MONITORING_COMPLETED_NON_COMPLIANT': ['Monitoring Personnel'],
    },
    'MONITORING_COMPLETED_COMPLIANT': {
        'UNIT_REVIEWED': ['Unit Head'],
    },
    'MONITORING_COMPLETED_NON_COMPLIANT': {
        'UNIT_REVIEWED': ['Unit Head'],
    },
    'UNIT_REVIEWED': {
        'SECTION_REVIEWED': ['Section Chief'],
    },
    'SECTION_REVIEWED': {
        'DIVISION_REVIEWED': ['Division Chief'],
    },
    'DIVISION_REVIEWED': {
        'CLOSED_COMPLIANT': ['Division Chief'],
        'LEGAL_REVIEW': ['Division Chief'],
    },
    'LEGAL_REVIEW': {
        'NOV_SENT': ['Legal Unit'],
        'NOO_SENT': ['Legal Unit'],
        'CLOSED_NON_COMPLIANT': ['Legal Unit'],
    },
    'NOV_SENT': {
        'NOO_SENT': ['Legal Unit'],
        'CLOSED_NON_COMPLIANT': ['Legal Unit'],
    },
    'NOO_SENT': {
        'CLOSED_NON_COMPLIANT': ['Legal Unit'],
    },
}
```

### 4.2 Update Serializer Actions
**File:** `server/inspections/serializers.py`

```python
actions_map = {
    # Section Chief
    ('SECTION_ASSIGNED', 'Section Chief'): ['inspect', 'forward'],
    ('SECTION_IN_PROGRESS', 'Section Chief'): ['continue'],
    ('SECTION_COMPLETED_COMPLIANT', 'Division Chief'): ['review'],  # NO forward, auto-assigned
    ('SECTION_COMPLETED_NON_COMPLIANT', 'Division Chief'): ['review'],  # NO forward, auto-assigned
    
    # Unit Head
    ('UNIT_ASSIGNED', 'Unit Head'): ['inspect', 'forward'],
    ('UNIT_IN_PROGRESS', 'Unit Head'): ['continue', 'forward'],
    ('UNIT_COMPLETED_COMPLIANT', 'Section Chief'): ['review'],  # NO forward, auto-assigned ✅
    ('UNIT_COMPLETED_NON_COMPLIANT', 'Section Chief'): ['review'],  # NO forward, auto-assigned ✅
    
    # Monitoring Personnel
    ('MONITORING_ASSIGNED', 'Monitoring Personnel'): ['inspect'],
    ('MONITORING_IN_PROGRESS', 'Monitoring Personnel'): ['continue'],
    ('MONITORING_COMPLETED_COMPLIANT', 'Unit Head'): ['review'],  # NO forward, auto-assigned
    ('MONITORING_COMPLETED_NON_COMPLIANT', 'Unit Head'): ['review'],  # NO forward, auto-assigned
    
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

### 4.3 Auto-Assignment Logic
**File:** `server/inspections/views.py`

```python
# In complete() method
if next_status in ['SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT']:
    self._auto_assign_to_division_chief(inspection, user)
elif next_status in ['UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT']:
    self._auto_assign_to_section_chief(inspection, user)  # ✅ NEW
elif next_status in ['MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT']:
    self._auto_assign_to_unit_head(inspection, user)
```

**Add new method:**
```python
def _auto_assign_to_section_chief(self, inspection, user):
    """Auto-assign to Section Chief for review (status unchanged)"""
    from users.models import User
    
    # Find Section Chief based on law
    target_section = inspection.law
    if inspection.law in ['PD-1586', 'RA-8749', 'RA-9275']:
        target_section = 'PD-1586,RA-8749,RA-9275'
    
    section_chief = User.objects.filter(
        userlevel='Section Chief',
        section=target_section,
        is_active=True
    ).first()
    
    if section_chief:
        inspection.assigned_to = section_chief
        inspection.save()
        
        InspectionHistory.objects.create(
            inspection=inspection,
            previous_status=inspection.current_status,
            new_status=inspection.current_status,
            changed_by=user,
            remarks=f'Assigned to Section Chief for review'
        )
```

---

## PART 5: Frontend Implementation

### 5.1 Button Constants
**File:** `src/constants/inspectionConstants.js`

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

### 5.2 Status Labels
**File:** `src/constants/inspectionConstants.js`

```javascript
export const statusDisplayMap = {
  CREATED: { label: 'Created', color: 'gray' },
  
  SECTION_ASSIGNED: { label: 'New Assignment', color: 'blue' },
  SECTION_IN_PROGRESS: { label: 'In Progress', color: 'yellow' },
  SECTION_COMPLETED_COMPLIANT: { label: 'Completed ✓', color: 'green' },
  SECTION_COMPLETED_NON_COMPLIANT: { label: 'Completed ✗', color: 'red' },
  
  UNIT_ASSIGNED: { label: 'New Assignment', color: 'blue' },
  UNIT_IN_PROGRESS: { label: 'In Progress', color: 'yellow' },
  UNIT_COMPLETED_COMPLIANT: { label: 'Completed ✓', color: 'green' },
  UNIT_COMPLETED_NON_COMPLIANT: { label: 'Completed ✗', color: 'red' },
  
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

---

## PART 6: Complete Workflow Flows

### Flow 1: Section Chief Does Inspection
```
SECTION_ASSIGNED
  ↓ [Inspect]
SECTION_IN_PROGRESS
  ↓ [Continue, complete form]
SECTION_COMPLETED_* → Auto-assign Division Chief
  ↓ [Division Chief: Forward]
DIVISION_REVIEWED
  ↓ [Close or Send to Legal]
CLOSED_* or LEGAL_REVIEW
```

### Flow 2: Full Delegation (Section → Unit → Monitoring)
```
SECTION_ASSIGNED
  ↓ [Forward]
UNIT_ASSIGNED
  ↓ [Inspect]
UNIT_IN_PROGRESS
  ↓ [Continue, complete form]
UNIT_COMPLETED_* → Auto-assign Section Chief
  ↓ [Section Chief: Forward]
MONITORING_ASSIGNED
  ↓ [Inspect]
MONITORING_IN_PROGRESS
  ↓ [Continue, complete form]
MONITORING_COMPLETED_* → Auto-assign Unit Head
  ↓ [Unit Head: Review, Forward]
UNIT_REVIEWED → Auto-assign Section Chief
  ↓ [Section Chief: Review, Forward]
SECTION_REVIEWED → Auto-assign Division Chief
  ↓ [Division Chief: Review, Forward]
DIVISION_REVIEWED
  ↓ [Close or Send to Legal]
CLOSED_* or LEGAL_REVIEW
```

---

## Summary

### Status Count: 22 (Keep UNIT_COMPLETED_*)
- ✅ Keep all workflow statuses including UNIT_COMPLETED_COMPLIANT/NON_COMPLIANT
- ❌ Remove only FINALIZED and generic CLOSED

### Button Count: 5
- Inspect (start new)
- Continue (resume)
- Review (view completed) ⭐ Works with ALL COMPLETED statuses
- Forward (delegate/send up)
- Send to Legal / Close (final actions)

### Key Features:
✅ UNIT_COMPLETED_* statuses included
✅ Review button works on all COMPLETED and REVIEWED statuses
✅ Clear separation: Inspect vs Continue vs Review
✅ Complete workflow coverage
✅ Auto-assignment after completion
✅ Correct review flow: Unit → Section → Division

