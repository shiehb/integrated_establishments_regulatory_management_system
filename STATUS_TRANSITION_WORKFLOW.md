# 🔄 Inspection Status Transition Workflow

## 📋 Complete Status Transition Process

Based on the `valid_transitions` model in `server/inspections/models.py`, here's the complete workflow showing all possible status transitions and the roles authorized to perform them.

---

## 🎯 **Status Transition Matrix**

### **1. INITIAL CREATION**
```
CREATED
    ↓ (Division Chief)
SECTION_ASSIGNED
```

### **2. SECTION CHIEF WORKFLOW**
```
SECTION_ASSIGNED
    ├── SECTION_IN_PROGRESS (Section Chief)
    ├── UNIT_ASSIGNED (Section Chief) - Forward directly
    └── MONITORING_ASSIGNED (Section Chief) - If no unit head

SECTION_IN_PROGRESS
    ├── SECTION_COMPLETED_COMPLIANT (Section Chief)
    ├── SECTION_COMPLETED_NON_COMPLIANT (Section Chief)
    └── DIVISION_REVIEWED (Section Chief) - Direct submission

SECTION_COMPLETED_COMPLIANT
    ├── UNIT_ASSIGNED (Section Chief)
    ├── MONITORING_ASSIGNED (Section Chief) - If no unit head
    └── DIVISION_REVIEWED (Division Chief) - Auto-assign

SECTION_COMPLETED_NON_COMPLIANT
    ├── UNIT_ASSIGNED (Section Chief)
    ├── MONITORING_ASSIGNED (Section Chief) - If no unit head
    └── DIVISION_REVIEWED (Division Chief) - Auto-assign
```

### **3. UNIT HEAD WORKFLOW**
```
UNIT_ASSIGNED
    ├── UNIT_IN_PROGRESS (Unit Head)
    └── MONITORING_ASSIGNED (Unit Head) - Forward directly

UNIT_IN_PROGRESS
    ├── UNIT_COMPLETED_COMPLIANT (Unit Head)
    ├── UNIT_COMPLETED_NON_COMPLIANT (Unit Head)
    └── SECTION_REVIEWED (Unit Head) - Direct submission

UNIT_COMPLETED_COMPLIANT
    ├── MONITORING_ASSIGNED (Unit Head)
    └── SECTION_REVIEWED (Section Chief) - Can send to Section

UNIT_COMPLETED_NON_COMPLIANT
    ├── MONITORING_ASSIGNED (Unit Head)
    └── SECTION_REVIEWED (Section Chief) - Can send to Section
```

### **4. MONITORING PERSONNEL WORKFLOW**
```
MONITORING_ASSIGNED
    ↓ (Monitoring Personnel)
MONITORING_IN_PROGRESS

MONITORING_IN_PROGRESS
    ├── MONITORING_COMPLETED_COMPLIANT (Monitoring Personnel)
    └── MONITORING_COMPLETED_NON_COMPLIANT (Monitoring Personnel)

MONITORING_COMPLETED_COMPLIANT
    ↓ (Unit Head) - Auto-assign
UNIT_REVIEWED

MONITORING_COMPLETED_NON_COMPLIANT
    ↓ (Unit Head) - Auto-assign
UNIT_REVIEWED
```

### **5. REVIEW WORKFLOW**
```
UNIT_REVIEWED
    ↓ (Section Chief)
SECTION_REVIEWED

SECTION_REVIEWED
    ↓ (Division Chief)
DIVISION_REVIEWED
```

### **6. FINAL DECISION WORKFLOW**
```
DIVISION_REVIEWED
    ├── CLOSED_COMPLIANT (Division Chief) - If compliant
    └── LEGAL_REVIEW (Division Chief) - If non-compliant
```

### **7. LEGAL UNIT WORKFLOW**
```
LEGAL_REVIEW
    ├── NOV_SENT (Legal Unit)
    ├── NOO_SENT (Legal Unit)
    └── CLOSED_NON_COMPLIANT (Legal Unit)

NOV_SENT
    ├── NOO_SENT (Legal Unit)
    └── CLOSED_NON_COMPLIANT (Legal Unit)

NOO_SENT
    ↓ (Legal Unit)
CLOSED_NON_COMPLIANT
```

---

## 🚀 **Complete Workflow Paths**

### **Path 1: Full Hierarchy (With Unit Head)**
```
CREATED → SECTION_ASSIGNED → SECTION_IN_PROGRESS → SECTION_COMPLETED_COMPLIANT
    ↓
UNIT_ASSIGNED → UNIT_IN_PROGRESS → UNIT_COMPLETED_COMPLIANT
    ↓
MONITORING_ASSIGNED → MONITORING_IN_PROGRESS → MONITORING_COMPLETED_COMPLIANT
    ↓
UNIT_REVIEWED → SECTION_REVIEWED → DIVISION_REVIEWED → CLOSED_COMPLIANT
```

### **Path 2: Section Chief Direct to Monitoring (No Unit Head)**
```
CREATED → SECTION_ASSIGNED → MONITORING_ASSIGNED → MONITORING_IN_PROGRESS
    ↓
MONITORING_COMPLETED_COMPLIANT → SECTION_REVIEWED → DIVISION_REVIEWED → CLOSED_COMPLIANT
```

### **Path 3: Section Chief Direct Submission**
```
CREATED → SECTION_ASSIGNED → SECTION_IN_PROGRESS → DIVISION_REVIEWED → CLOSED_COMPLIANT
```

### **Path 4: Unit Head Direct Submission**
```
CREATED → SECTION_ASSIGNED → UNIT_ASSIGNED → UNIT_IN_PROGRESS → SECTION_REVIEWED
    ↓
DIVISION_REVIEWED → CLOSED_COMPLIANT
```

### **Path 5: Non-Compliant with Legal Action**
```
CREATED → SECTION_ASSIGNED → SECTION_IN_PROGRESS → SECTION_COMPLETED_NON_COMPLIANT
    ↓
DIVISION_REVIEWED → LEGAL_REVIEW → NOV_SENT → NOO_SENT → CLOSED_NON_COMPLIANT
```

---

## 🔧 **Key Transition Rules**

### **Auto-Assignment Rules:**
1. **SECTION_COMPLETED_*** → Auto-assign to Division Chief
2. **MONITORING_COMPLETED_*** → Auto-assign to Unit Head (or Section Chief if no Unit Head)

### **Direct Submission Options:**
1. **Section Chief** can submit directly to Division Chief from `SECTION_IN_PROGRESS`
2. **Unit Head** can submit directly to Section Chief from `UNIT_IN_PROGRESS`

### **Forwarding Options:**
1. **Section Chief** can forward directly to Unit Head or Monitoring Personnel
2. **Unit Head** can forward directly to Monitoring Personnel

### **Review Chain:**
1. **Unit Head** reviews Monitoring completed work
2. **Section Chief** reviews Unit completed work
3. **Division Chief** reviews Section completed work

---

## 📊 **Status Categories**

### **🟢 Active Work Statuses:**
- `SECTION_IN_PROGRESS`
- `UNIT_IN_PROGRESS`
- `MONITORING_IN_PROGRESS`

### **🟡 Completed Statuses:**
- `SECTION_COMPLETED_COMPLIANT`
- `SECTION_COMPLETED_NON_COMPLIANT`
- `UNIT_COMPLETED_COMPLIANT`
- `UNIT_COMPLETED_NON_COMPLIANT`
- `MONITORING_COMPLETED_COMPLIANT`
- `MONITORING_COMPLETED_NON_COMPLIANT`

### **🔵 Review Statuses:**
- `UNIT_REVIEWED`
- `SECTION_REVIEWED`
- `DIVISION_REVIEWED`

### **🔴 Legal Statuses:**
- `LEGAL_REVIEW`
- `NOV_SENT`
- `NOO_SENT`

### **✅ Final Statuses:**
- `CLOSED_COMPLIANT`
- `CLOSED_NON_COMPLIANT`

---

## 🎯 **Role-Based Actions**

### **Division Chief:**
- Create inspections (`CREATED` → `SECTION_ASSIGNED`)
- Review section completed work (`SECTION_COMPLETED_*` → `DIVISION_REVIEWED`)
- Finalize compliant cases (`DIVISION_REVIEWED` → `CLOSED_COMPLIANT`)
- Forward non-compliant cases (`DIVISION_REVIEWED` → `LEGAL_REVIEW`)

### **Section Chief:**
- Start inspections (`SECTION_ASSIGNED` → `SECTION_IN_PROGRESS`)
- Complete inspections (`SECTION_IN_PROGRESS` → `SECTION_COMPLETED_*`)
- Forward to Unit Head or Monitoring (`SECTION_ASSIGNED` → `UNIT_ASSIGNED`/`MONITORING_ASSIGNED`)
- Review unit completed work (`UNIT_COMPLETED_*` → `SECTION_REVIEWED`)
- Review monitoring completed work (when no Unit Head)
- Forward to Division Chief (`SECTION_REVIEWED` → `DIVISION_REVIEWED`)

### **Unit Head:**
- Start unit work (`UNIT_ASSIGNED` → `UNIT_IN_PROGRESS`)
- Complete unit work (`UNIT_IN_PROGRESS` → `UNIT_COMPLETED_*`)
- Forward to Monitoring (`UNIT_ASSIGNED` → `MONITORING_ASSIGNED`)
- Review monitoring completed work (`MONITORING_COMPLETED_*` → `UNIT_REVIEWED`)
- Forward to Section Chief (`UNIT_REVIEWED` → `SECTION_REVIEWED`)

### **Monitoring Personnel:**
- Start monitoring work (`MONITORING_ASSIGNED` → `MONITORING_IN_PROGRESS`)
- Complete monitoring work (`MONITORING_IN_PROGRESS` → `MONITORING_COMPLETED_*`)

### **Legal Unit:**
- Review legal cases (`LEGAL_REVIEW`)
- Send NOV (`LEGAL_REVIEW` → `NOV_SENT`)
- Send NOO (`NOV_SENT` → `NOO_SENT`)
- Close non-compliant cases (`NOO_SENT` → `CLOSED_NON_COMPLIANT`)

---

## 🔄 **Workflow Flexibility**

The status transition model provides multiple paths for different organizational structures:

1. **Full Hierarchy**: Division → Section → Unit → Monitoring
2. **No Unit Head**: Division → Section → Monitoring
3. **Direct Submission**: Skip intermediate levels when appropriate
4. **Legal Enforcement**: Handle non-compliant cases through legal process

This flexible design accommodates different organizational setups while maintaining proper oversight and quality control at each level.

---

## 🎨 **Visual Status Transition Diagram**

```
                    ┌─────────────────┐
                    │    CREATED      │
                    │  (Division Chief)│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ SECTION_ASSIGNED│
                    │  (Section Chief)│
                    └─────────┬───────┘
                              │
                    ┌─────────┴───────┐
                    │                 │
                    ▼                 ▼
        ┌─────────────────┐  ┌─────────────────┐
        │SECTION_IN_PROGRESS│  │  UNIT_ASSIGNED  │
        │  (Section Chief) │  │  (Section Chief)│
        └─────────┬───────┘  └─────────┬───────┘
                  │                    │
        ┌─────────┴───────┐            │
        │                 │            ▼
        ▼                 ▼  ┌─────────────────┐
┌─────────────────┐ ┌─────────────────┐ │ UNIT_IN_PROGRESS │
│SECTION_COMPLETED│ │DIVISION_REVIEWED│ │   (Unit Head)    │
│   COMPLIANT     │ │ (Section Chief) │ └─────────┬───────┘
│ (Section Chief) │ └─────────────────┘           │
└─────────┬───────┘                              │
          │                                      ▼
          │                            ┌─────────────────┐
          │                            │UNIT_COMPLETED_* │
          │                            │   (Unit Head)   │
          │                            └─────────┬───────┘
          │                                      │
          │                                      ▼
          │                            ┌─────────────────┐
          │                            │MONITORING_ASSIGNED│
          │                            │  (Unit Head)    │
          │                            └─────────┬───────┘
          │                                      │
          │                                      ▼
          │                            ┌─────────────────┐
          │                            │MONITORING_IN_   │
          │                            │   PROGRESS      │
          │                            │(Monitoring Pers.)│
          │                            └─────────┬───────┘
          │                                      │
          │                                      ▼
          │                            ┌─────────────────┐
          │                            │MONITORING_      │
          │                            │COMPLETED_*      │
          │                            │(Monitoring Pers.)│
          │                            └─────────┬───────┘
          │                                      │
          │                                      ▼
          │                            ┌─────────────────┐
          │                            │  UNIT_REVIEWED  │
          │                            │   (Unit Head)   │
          │                            └─────────┬───────┘
          │                                      │
          │                                      ▼
          │                            ┌─────────────────┐
          │                            │ SECTION_REVIEWED│
          │                            │ (Section Chief) │
          │                            └─────────┬───────┘
          │                                      │
          │                                      ▼
          │                            ┌─────────────────┐
          │                            │DIVISION_REVIEWED│
          │                            │ (Division Chief)│
          │                            └─────────┬───────┘
          │                                      │
          │                    ┌─────────────────┴───────┐
          │                    │                         │
          │                    ▼                         ▼
          │          ┌─────────────────┐      ┌─────────────────┐
          │          │CLOSED_COMPLIANT │      │  LEGAL_REVIEW   │
          │          │(Division Chief) │      │ (Division Chief)│
          │          └─────────────────┘      └─────────┬───────┘
          │                                            │
          │                                            ▼
          │                                  ┌─────────────────┐
          │                                  │    NOV_SENT     │
          │                                  │   (Legal Unit)  │
          │                                  └─────────┬───────┘
          │                                            │
          │                                            ▼
          │                                  ┌─────────────────┐
          │                                  │    NOO_SENT     │
          │                                  │   (Legal Unit)  │
          │                                  └─────────┬───────┘
          │                                            │
          │                                            ▼
          │                                  ┌─────────────────┐
          │                                  │CLOSED_NON_      │
          │                                  │  COMPLIANT      │
          │                                  │  (Legal Unit)   │
          │                                  └─────────────────┘
          │
          ▼
┌─────────────────┐
│DIVISION_REVIEWED│
│ (Division Chief)│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│CLOSED_COMPLIANT │
│(Division Chief) │
└─────────────────┘
```

## 🔄 **Alternative Paths (No Unit Head)**

```
                    ┌─────────────────┐
                    │    CREATED      │
                    │  (Division Chief)│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ SECTION_ASSIGNED│
                    │  (Section Chief)│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │MONITORING_ASSIGNED│
                    │  (Section Chief)│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │MONITORING_IN_   │
                    │   PROGRESS      │
                    │(Monitoring Pers.)│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │MONITORING_      │
                    │COMPLETED_*      │
                    │(Monitoring Pers.)│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ SECTION_REVIEWED│
                    │ (Section Chief) │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │DIVISION_REVIEWED│
                    │ (Division Chief)│
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │CLOSED_COMPLIANT │
                    │(Division Chief) │
                    └─────────────────┘
```

## 🎯 **Key Decision Points**

### **1. Section Chief Decision Points:**
- **Forward to Unit Head** vs **Forward to Monitoring** (based on Unit Head availability)
- **Complete Section Work** vs **Direct Submit to Division** (based on complexity)

### **2. Unit Head Decision Points:**
- **Complete Unit Work** vs **Direct Submit to Section** (based on findings)
- **Forward to Monitoring** (standard process)

### **3. Division Chief Decision Points:**
- **Close as Compliant** vs **Send to Legal** (based on final assessment)

### **4. Legal Unit Decision Points:**
- **Send NOV** → **Send NOO** → **Close Non-Compliant** (enforcement process)

This comprehensive status transition model ensures proper workflow management while providing flexibility for different organizational structures and inspection scenarios.
