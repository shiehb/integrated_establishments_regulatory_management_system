# 📊 Status Transitions by Role - Updated Workflow

## 🔄 Complete Status Flow Diagram

```
CREATED → SECTION_ASSIGNED → SECTION_IN_PROGRESS → SECTION_COMPLETED
    ↓              ↓                ↓                    ↓
    |              |                |                    ↓
    |              |                |              DIVISION_REVIEWED
    |              |                |                    ↓
    |              |                |              CLOSED_COMPLIANT
    |              ↓                |                    ↓
    |         UNIT_ASSIGNED → UNIT_IN_PROGRESS → UNIT_COMPLETED
    |              ↓                ↓                    ↓
    |              |                |              SECTION_REVIEWED
    |              |                |                    ↓
    |              ↓                |              DIVISION_REVIEWED
    |         MONITORING_ASSIGNED → MONITORING_IN_PROGRESS
    |              ↓                        ↓
    |              |                        ↓
    |              |              MONITORING_COMPLETED_COMPLIANT
    |              |                        ↓
    |              |                  UNIT_REVIEWED
    |              |                        ↓
    |              |                  SECTION_REVIEWED
    |              |                        ↓
    |              |                  DIVISION_REVIEWED
    |              |                        ↓
    |              |                  CLOSED_COMPLIANT
    |              |
    |              ↓
    |         MONITORING_COMPLETED_NON_COMPLIANT
    |              ↓
    |         LEGAL_REVIEW
    |              ↓
    |         NOV_SENT → NOO_SENT → CLOSED_NON_COMPLIANT
```

## 📋 Detailed Status Transitions by Role

### 🏢 Division Chief

#### Tabs:
- **All Inspections**: Shows all inspections created by Division Chief + reviews assigned to them
- **Review**: Shows inspections requiring Division Chief review

#### Status Transitions:
| From Status | To Status | Trigger | Action | Tab | Result |
|-------------|-----------|---------|--------|-----|--------|
| `CREATED` | `SECTION_ASSIGNED` | Create Inspection | **Create** | All Inspections | Auto-assigns to Section Chief |
| `SECTION_COMPLETED` | `DIVISION_REVIEWED` | Auto-forward | **Auto** | All Inspections | Section Chief completes → Auto-forwards |
| `DIVISION_REVIEWED` | `CLOSED_COMPLIANT` | Review | **Review** | Review | Approves compliant inspection |
| `DIVISION_REVIEWED` | `LEGAL_REVIEW` | Review | **Review** | Review | Forwards non-compliant to Legal |

#### Tab Filtering:
- **All Inspections**: `created_by=user OR current_status='DIVISION_REVIEWED'` (No actions)
- **Review**: `current_status='DIVISION_REVIEWED' AND assigned_to=user` (Review action)

---

### 👨‍💼 Section Chief

#### Tabs:
- **Received**: Newly assigned inspections from Division Chief
- **My Inspections**: Inspections that Section Chief has started or claimed
- **Forwarded**: Inspections already forwarded to Unit Head or Monitoring
- **Review**: Inspections returning for review after monitoring
- **Compliance**: Fully completed or legally closed inspections

#### Status Transitions:
| From Status | To Status | Trigger | Action | Tab | Result |
|-------------|-----------|---------|--------|-----|--------|
| `SECTION_ASSIGNED` | `SECTION_IN_PROGRESS` | Assign to Me | **Assign to Me** | Received | Claims ownership |
| `SECTION_ASSIGNED` | `SECTION_IN_PROGRESS` | Start | **Start** | My Inspections | Opens inspection form |
| `SECTION_ASSIGNED` | `UNIT_ASSIGNED` | Forward | **Forward** | Received | Forwards to Unit Head (if exists) |
| `SECTION_ASSIGNED` | `MONITORING_ASSIGNED` | Forward | **Forward** | Received | Forwards to Monitoring (no Unit Head) |
| `SECTION_IN_PROGRESS` | `SECTION_COMPLETED` | Complete | **Complete** | My Inspections | Fills form → Auto-forwards to Division |
| `SECTION_COMPLETED` | `DIVISION_REVIEWED` | Auto-forward | **Auto** | - | Auto-forwards to Division Chief |
| `UNIT_COMPLETED` | `SECTION_REVIEWED` | Auto-forward | **Auto** | - | Unit completes → Auto-forwards to Section |
| `SECTION_REVIEWED` | `DIVISION_REVIEWED` | Review | **Review** | Review | Approves unit work → Auto-forwards to Division |

#### Tab Filtering:
- **Received**: `assigned_to__isnull=True AND current_status='SECTION_ASSIGNED'`
- **My Inspections**: `assigned_to=user AND current_status IN ('SECTION_ASSIGNED', 'SECTION_IN_PROGRESS', 'SECTION_COMPLETED')`
- **Forwarded**: `current_status IN ('UNIT_ASSIGNED', 'MONITORING_ASSIGNED', 'SECTION_COMPLETED')`
- **Review**: `assigned_to=user AND current_status='SECTION_REVIEWED'`
- **Compliance**: `current_status IN ('CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT')`

---

### 👷‍♂️ Unit Head

#### Tabs:
- **Received**: Forwarded from Section Chief
- **My Inspections**: Inspections currently in progress
- **Forwarded**: Inspections forwarded to Monitoring
- **Review**: Inspections returning for compliance review
- **Compliance**: All finalized inspections

#### Status Transitions:
| From Status | To Status | Trigger | Action | Tab | Result |
|-------------|-----------|---------|--------|-----|--------|
| `UNIT_ASSIGNED` | `UNIT_IN_PROGRESS` | Assign to Me | **Assign to Me** | Received | Claims ownership |
| `UNIT_ASSIGNED` | `UNIT_IN_PROGRESS` | Start | **Start** | My Inspections | Opens inspection form |
| `UNIT_ASSIGNED` | `MONITORING_ASSIGNED` | Forward | **Forward** | Received | Forwards directly to Monitoring |
| `UNIT_IN_PROGRESS` | `UNIT_COMPLETED` | Complete | **Complete** | My Inspections | Fills form → Auto-forwards to Section |
| `UNIT_COMPLETED` | `SECTION_REVIEWED` | Auto-forward | **Auto** | - | Auto-forwards to Section Chief |
| `SECTION_REVIEWED` | `DIVISION_REVIEWED` | Review | **Review** | Review | Approves section work → Auto-forwards to Division |

#### Tab Filtering:
- **Received**: `assigned_to__isnull=True AND current_status='UNIT_ASSIGNED'`
- **My Inspections**: `assigned_to=user AND current_status IN ('UNIT_ASSIGNED', 'UNIT_IN_PROGRESS', 'UNIT_COMPLETED')`
- **Forwarded**: `current_status IN ('MONITORING_ASSIGNED', 'UNIT_COMPLETED')`
- **Review**: `assigned_to=user AND current_status='UNIT_REVIEWED'`
- **Compliance**: `current_status IN ('CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT')`

---

### 🔍 Monitoring Personnel

#### Tabs:
- **Assigned**: Inspections ready for monitoring
- **In Progress**: Inspections currently being inspected
- **Completed**: Finished inspections (both compliant and non-compliant)

#### Status Transitions:
| From Status | To Status | Trigger | Action | Tab | Result |
|-------------|-----------|---------|--------|-----|--------|
| `MONITORING_ASSIGNED` | `MONITORING_IN_PROGRESS` | Start | **Start** | Assigned | Opens inspection form |
| `MONITORING_IN_PROGRESS` | `MONITORING_COMPLETED_COMPLIANT` | Complete | **Complete** | In Progress | Compliant → Auto-forwards to Unit |
| `MONITORING_IN_PROGRESS` | `MONITORING_COMPLETED_NON_COMPLIANT` | Complete | **Complete** | In Progress | Non-compliant → Auto-forwards to Division |
| `MONITORING_COMPLETED_COMPLIANT` | `UNIT_REVIEWED` | Auto-forward | **Auto** | - | Auto-forwards to Unit Head |
| `MONITORING_COMPLETED_NON_COMPLIANT` | `DIVISION_REVIEWED` | Auto-forward | **Auto** | - | Auto-forwards to Division Chief |

#### Tab Filtering:
- **Assigned**: `current_status='MONITORING_ASSIGNED'`
- **In Progress**: `current_status='MONITORING_IN_PROGRESS'`
- **Completed**: `current_status IN ('MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT')`

---

### ⚖️ Legal Unit

#### Tabs:
- **Legal Review**: Inspections forwarded by Division Chief for legal confirmation
- **NOV Sent**: Inspections with Notice of Violation sent
- **NOO Sent**: Inspections with Notice of Order sent

#### Status Transitions:
| From Status | To Status | Trigger | Action | Tab | Result |
|-------------|-----------|---------|--------|-----|--------|
| `LEGAL_REVIEW` | `NOV_SENT` | Send NOV | **Send NOV** | Legal Review | Sends Notice of Violation |
| `LEGAL_REVIEW` | `NOO_SENT` | Send NOO | **Send NOO** | Legal Review | Sends Notice of Order |
| `LEGAL_REVIEW` | `CLOSED_NON_COMPLIANT` | Close Case | **Close** | Legal Review | Closes case as non-compliant |
| `NOV_SENT` | `NOO_SENT` | Send NOO | **Send NOO** | NOV Sent | Escalates to Notice of Order |
| `NOV_SENT` | `CLOSED_NON_COMPLIANT` | Close Case | **Close** | NOV Sent | Closes if establishment complies |
| `NOO_SENT` | `CLOSED_NON_COMPLIANT` | Close Case | **Close** | NOO Sent | Final closure |

#### Tab Filtering:
- **Legal Review**: `current_status='LEGAL_REVIEW'`
- **NOV Sent**: `current_status='NOV_SENT'`
- **NOO Sent**: `current_status='NOO_SENT'`

## 🔄 Auto-Forwarding Logic

### 1. Section Chief Complete → Division Chief Review
```
SECTION_COMPLETED → DIVISION_REVIEWED (assigned to Division Chief)
```

### 2. Unit Head Complete → Section Chief Review → Division Chief Review
```
UNIT_COMPLETED → SECTION_REVIEWED (assigned to Section Chief)
SECTION_REVIEWED → DIVISION_REVIEWED (assigned to Division Chief)
```

### 3. Monitoring Complete (Compliant) → Unit Head Review → Section Chief Review → Division Chief Review
```
MONITORING_COMPLETED_COMPLIANT → UNIT_REVIEWED (assigned to Unit Head)
UNIT_REVIEWED → SECTION_REVIEWED (assigned to Section Chief)
SECTION_REVIEWED → DIVISION_REVIEWED (assigned to Division Chief)
```

### 4. Monitoring Complete (Non-Compliant) → Division Chief Review → Legal Review
```
MONITORING_COMPLETED_NON_COMPLIANT → DIVISION_REVIEWED (assigned to Division Chief)
DIVISION_REVIEWED → LEGAL_REVIEW (assigned to Legal Unit)
```

## 🎯 Key Workflow Rules

### Action Behaviors:
1. **"Start" Action**: Always opens inspection form page (`/inspections/:id/form`)
2. **"Forward" Action**: Shows ForwardModal with role-based options
3. **"Assign to Me" Action**: Claims ownership and changes status to IN_PROGRESS
4. **"Complete" Action**: Opens completion modal and auto-forwards based on role
5. **"Review" Action**: Approves work and auto-forwards to next level

### Tab Count Indicators:
- Real-time count badges on each tab
- Only shows when count > 0
- Color-coded based on active/inactive state

### Role-Based Access:
- Actions and tabs filtered by user level
- Each role sees only relevant inspections
- Proper permission checks for all actions

## 📊 Status Color Coding

| Status | Color | Description |
|--------|-------|-------------|
| `CREATED` | Gray | Newly created |
| `SECTION_ASSIGNED` | Blue | Waiting for Section Chief |
| `SECTION_IN_PROGRESS` | Yellow | Section Chief working |
| `SECTION_COMPLETED` | Green | Section Chief completed |
| `UNIT_ASSIGNED` | Blue | Waiting for Unit Head |
| `UNIT_IN_PROGRESS` | Yellow | Unit Head working |
| `UNIT_COMPLETED` | Green | Unit Head completed |
| `MONITORING_ASSIGNED` | Indigo | Waiting for Monitoring |
| `MONITORING_IN_PROGRESS` | Amber | Monitoring ongoing |
| `MONITORING_COMPLETED_COMPLIANT` | Green | Compliant ✅ |
| `MONITORING_COMPLETED_NON_COMPLIANT` | Red | Non-Compliant ❌ |
| `UNIT_REVIEWED` | Purple | Unit reviewed |
| `SECTION_REVIEWED` | Purple | Section reviewed |
| `DIVISION_REVIEWED` | Purple | Division reviewed |
| `LEGAL_REVIEW` | Orange | For Legal Review |
| `NOV_SENT` | Purple | Notice of Violation sent |
| `NOO_SENT` | Pink | Notice of Order sent |
| `CLOSED_COMPLIANT` | Green | Closed ✅ |
| `CLOSED_NON_COMPLIANT` | Rose | Closed ❌ |

This comprehensive status transition system ensures smooth workflow progression from inspection creation to final closure! 🎉
