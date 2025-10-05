# 🔄 Complete Inspection Workflow System

## 📊 Workflow Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           INSPECTION WORKFLOW SYSTEM                            │
└─────────────────────────────────────────────────────────────────────────────────┘

DIVISION CHIEF CREATES INSPECTION
           ↓
    ┌─────────────┐
    │   CREATED   │
    └─────────────┘
           ↓
    ┌─────────────────┐
    │ SECTION_ASSIGNED│ ← Auto-assigned to Section Chief
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │SECTION_IN_PROGRESS│ ← Section Chief clicks "Inspect" then "Start"
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │SECTION_COMPLETED│ ← Section Chief clicks "Complete"
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │  UNIT_ASSIGNED  │ ← Auto-forwards to Unit Head (if exists)
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │ UNIT_IN_PROGRESS│ ← Unit Head clicks "Inspect" then "Start"
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │ UNIT_COMPLETED  │ ← Unit Head clicks "Complete"
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │SECTION_REVIEWED │ ← Auto-forwards to Section Chief for review
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │DIVISION_REVIEWED│ ← Section Chief clicks "Review"
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │CLOSED_COMPLIANT │ ← Division Chief clicks "Review" (Compliant)
    └─────────────────┘

ALTERNATIVE PATH (No Unit Head):
    ┌─────────────────┐
    │SECTION_COMPLETED│
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │DIVISION_REVIEWED│ ← Direct auto-forward to Division Chief
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │CLOSED_COMPLIANT │
    └─────────────────┘

MONITORING PATH:
    ┌─────────────────┐
    │SECTION_COMPLETED│
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │MONITORING_ASSIGNED│ ← Section Chief forwards to Monitoring
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │MONITORING_IN_PROGRESS│ ← Monitoring Personnel clicks "Start"
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │MONITORING_COMPLETED_COMPLIANT│ ← Monitoring clicks "Complete"
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │  UNIT_REVIEWED  │ ← Auto-forwards to Unit Head
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │SECTION_REVIEWED │ ← Unit Head clicks "Review"
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │DIVISION_REVIEWED│ ← Section Chief clicks "Review"
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │CLOSED_COMPLIANT │ ← Division Chief clicks "Review"
    └─────────────────┘

NON-COMPLIANT PATH:
    ┌─────────────────┐
    │MONITORING_COMPLETED_NON_COMPLIANT│
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │DIVISION_REVIEWED│ ← Auto-forwards to Division Chief
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │  LEGAL_REVIEW   │ ← Division Chief clicks "Forward to Legal"
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │    NOV_SENT     │ ← Legal Unit clicks "Send NOV"
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │    NOO_SENT     │ ← Legal Unit clicks "Send NOO"
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │CLOSED_NON_COMPLIANT│ ← Legal Unit clicks "Close Case"
    └─────────────────┘
```

## 👥 Role-Based Workflow

### 🏢 Division Chief

#### **Tabs:**
- **All Inspections**: Shows all inspections created by Division Chief + reviews assigned to them
- **Review**: Shows inspections requiring Division Chief review

#### **Actions:**
| Tab | Action | Result |
|-----|--------|--------|
| All Inspections | **Create** | Creates new inspection → Auto-assigns to Section Chief |
| Review | **Review** | Approves (Compliant) or Forwards to Legal (Non-Compliant) |

#### **Status Transitions:**
```
CREATED → SECTION_ASSIGNED (Auto-assign)
DIVISION_REVIEWED → CLOSED_COMPLIANT (Review - Compliant)
DIVISION_REVIEWED → LEGAL_REVIEW (Review - Non-Compliant)
```

---

### 👨‍💼 Section Chief

#### **Tabs:**
- **Received**: Newly assigned inspections from Division Chief
- **My Inspections**: Inspections that Section Chief has started or claimed
- **Forwarded**: Inspections already forwarded to Unit Head or Monitoring
- **Review**: Inspections returning for review after monitoring
- **Compliance**: Fully completed or legally closed inspections

#### **Actions:**
| Tab | Status | Actions Available | Result |
|-----|--------|------------------|--------|
| **Received** | `SECTION_ASSIGNED` | `['inspect', 'forward']` | Inspect → My Inspections, Forward → Unit/Monitoring |
| **My Inspections** | `SECTION_IN_PROGRESS` | `['start', 'complete']` | Start → Form Page, Complete → Auto-forward |
| **My Inspections** | `SECTION_COMPLETED` | `[]` | Auto-forwards to Division Chief |
| **Review** | `SECTION_REVIEWED` | `['review']` | Review → Auto-forward to Division Chief |
| **Compliance** | `CLOSED_*` | `[]` | Read-only |

#### **Status Transitions:**
```
SECTION_ASSIGNED → SECTION_IN_PROGRESS (Inspect)
SECTION_IN_PROGRESS → SECTION_COMPLETED (Complete)
SECTION_COMPLETED → DIVISION_REVIEWED (Auto-forward)
SECTION_REVIEWED → DIVISION_REVIEWED (Review)
```

---

### 👷‍♂️ Unit Head

#### **Tabs:**
- **Received**: Forwarded from Section Chief
- **My Inspections**: Inspections currently in progress
- **Forwarded**: Inspections forwarded to Monitoring
- **Review**: Inspections returning for compliance review
- **Compliance**: All finalized inspections

#### **Actions:**
| Tab | Status | Actions Available | Result |
|-----|--------|------------------|--------|
| **Received** | `UNIT_ASSIGNED` | `['inspect', 'forward']` | Inspect → My Inspections, Forward → Monitoring |
| **My Inspections** | `UNIT_IN_PROGRESS` | `['start', 'complete']` | Start → Form Page, Complete → Auto-forward |
| **My Inspections** | `UNIT_COMPLETED` | `[]` | Auto-forwards to Section Chief |
| **Review** | `UNIT_REVIEWED` | `['review']` | Review → Auto-forward to Section Chief |
| **Compliance** | `CLOSED_*` | `[]` | Read-only |

#### **Status Transitions:**
```
UNIT_ASSIGNED → UNIT_IN_PROGRESS (Inspect)
UNIT_IN_PROGRESS → UNIT_COMPLETED (Complete)
UNIT_COMPLETED → SECTION_REVIEWED (Auto-forward)
UNIT_REVIEWED → SECTION_REVIEWED (Review)
```

---

### 🔍 Monitoring Personnel

#### **Tabs:**
- **Assigned**: Inspections ready for monitoring
- **In Progress**: Inspections currently being inspected
- **Completed**: Finished inspections (both compliant and non-compliant)

#### **Actions:**
| Tab | Status | Actions Available | Result |
|-----|--------|------------------|--------|
| **Assigned** | `MONITORING_ASSIGNED` | `['start']` | Start → Form Page |
| **In Progress** | `MONITORING_IN_PROGRESS` | `['complete']` | Complete → Auto-forward |
| **Completed** | `MONITORING_COMPLETED_*` | `[]` | Auto-forwards based on compliance |

#### **Status Transitions:**
```
MONITORING_ASSIGNED → MONITORING_IN_PROGRESS (Start)
MONITORING_IN_PROGRESS → MONITORING_COMPLETED_COMPLIANT (Complete - Compliant)
MONITORING_IN_PROGRESS → MONITORING_COMPLETED_NON_COMPLIANT (Complete - Non-Compliant)
MONITORING_COMPLETED_COMPLIANT → UNIT_REVIEWED (Auto-forward)
MONITORING_COMPLETED_NON_COMPLIANT → DIVISION_REVIEWED (Auto-forward)
```

---

### ⚖️ Legal Unit

#### **Tabs:**
- **Legal Review**: Inspections forwarded by Division Chief for legal confirmation
- **NOV Sent**: Inspections with Notice of Violation sent
- **NOO Sent**: Inspections with Notice of Order sent

#### **Actions:**
| Tab | Status | Actions Available | Result |
|-----|--------|------------------|--------|
| **Legal Review** | `LEGAL_REVIEW` | `['send_nov', 'send_noo', 'close']` | Send NOV/NOO or Close Case |
| **NOV Sent** | `NOV_SENT` | `['send_noo', 'close']` | Escalate to NOO or Close |
| **NOO Sent** | `NOO_SENT` | `['close']` | Final closure |

#### **Status Transitions:**
```
LEGAL_REVIEW → NOV_SENT (Send NOV)
LEGAL_REVIEW → NOO_SENT (Send NOO)
LEGAL_REVIEW → CLOSED_NON_COMPLIANT (Close Case)
NOV_SENT → NOO_SENT (Send NOO)
NOV_SENT → CLOSED_NON_COMPLIANT (Close Case)
NOO_SENT → CLOSED_NON_COMPLIANT (Close Case)
```

## 🔄 Auto-Forwarding Logic

### **1. Section Chief Complete → Division Chief Review**
```
SECTION_COMPLETED → DIVISION_REVIEWED (assigned to Division Chief)
```

### **2. Unit Head Complete → Section Chief Review → Division Chief Review**
```
UNIT_COMPLETED → SECTION_REVIEWED (assigned to Section Chief)
SECTION_REVIEWED → DIVISION_REVIEWED (assigned to Division Chief)
```

### **3. Monitoring Complete (Compliant) → Unit Head Review → Section Chief Review → Division Chief Review**
```
MONITORING_COMPLETED_COMPLIANT → UNIT_REVIEWED (assigned to Unit Head)
UNIT_REVIEWED → SECTION_REVIEWED (assigned to Section Chief)
SECTION_REVIEWED → DIVISION_REVIEWED (assigned to Division Chief)
```

### **4. Monitoring Complete (Non-Compliant) → Division Chief Review → Legal Review**
```
MONITORING_COMPLETED_NON_COMPLIANT → DIVISION_REVIEWED (assigned to Division Chief)
DIVISION_REVIEWED → LEGAL_REVIEW (assigned to Legal Unit)
```

## 🎯 Key Workflow Rules

### **Action Behaviors:**
1. **"Inspect" Action**: Moves inspection to "My Inspections" tab (changes status to IN_PROGRESS)
2. **"Start" Action**: Opens inspection form page (`/inspections/:id/form`)
3. **"Complete" Action**: Opens completion modal and auto-forwards based on role
4. **"Review" Action**: Approves work and auto-forwards to next level
5. **"Forward" Action**: Shows ForwardModal with role-based options

### **Tab Count Indicators:**
- Real-time count badges on each tab
- Only shows when count > 0
- Color-coded based on active/inactive state

### **Role-Based Access:**
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

## 🚀 Workflow Benefits

1. **Clear Separation**: "Inspect" (claim) vs "Start" (work) vs "Complete" (finish)
2. **Auto-Forwarding**: Automatic status transitions between roles
3. **Role-Based Access**: Each role sees only relevant inspections
4. **Tab Counts**: Real-time count indicators for each tab
5. **Flexible Routing**: Supports different organizational structures
6. **Audit Trail**: Complete history of all status changes
7. **Compliance Tracking**: Separate paths for compliant vs non-compliant cases

This comprehensive workflow system ensures smooth progression from inspection creation to final closure! 🎉
