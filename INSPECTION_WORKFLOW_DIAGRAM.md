# Inspection Workflow Diagram

## Complete Inspection Workflow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           INSPECTION WORKFLOW RULES                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘

1. DIVISION CHIEF
   ├── Creates inspections (status = DIVISION_CREATED)
   └── Forwards to Section Chief (status = SECTION_REVIEW)

2. SECTION CHIEF (3 TABS)
   ├── Tab 1: Created Inspections (from Division Chief)
   ├── Tab 2: My Inspections (after Inspect button)
   │   ├── Can mark Complete OR Forward
   │   └── Forward Rules:
   │       ├── If Unit Head exists → assign status UNIT_REVIEW
   │       └── If no Unit Head → assign status MONITORING_ASSIGN
   └── Tab 3: Forwarded List (inspections forwarded to Unit Head/Monitoring)

3. UNIT HEAD (3 TABS)
   ├── Tab 1: Received from Section
   ├── Tab 2: My Inspections (after Inspect button)
   │   ├── Can mark Complete OR Forward → Monitoring
   │   └── Always forwards to MONITORING_ASSIGN
   └── Tab 3: Forwarded List (inspections forwarded to Monitoring)

4. MONITORING PERSONNEL
   ├── Only has a list of received inspections
   ├── Auto-Assignment Rule:
   │   ├── Match establishment district with monitoring personnel district
   │   └── Match inspection law/section with monitoring personnel assigned law
   ├── Actions: Inspect & Complete
   └── Compliance Decision:
       ├── If Compliant ✅ → Return path: Monitoring → Unit Head → Section Chief → Division Chief (Final Close)
       └── If Non-Compliant ❌ → Return path: Monitoring → Unit Head → Section Chief → Division Chief → Legal Unit

5. LEGAL UNIT
   ├── Reviews non-compliant cases
   ├── Sends Notice of Violation (NOV) → requires compliance plan & date
   ├── If establishment complies → close case (violations recorded)
   └── If not → send Notice of Order (NOO) → penalties, fines, deadlines

## Status Flow Diagram

```
DIVISION_CREATED
    ↓ (Division Chief forwards)
SECTION_REVIEW
    ↓ (Section Chief decision)
    ├── SECTION_INSPECTING (if Inspect)
    │   └── COMPLETED (if Complete)
    ├── UNIT_REVIEW (if Unit Head exists)
    │   └── UNIT_INSPECTING
    │       └── MONITORING_ASSIGN
    │           └── MONITORING_INSPECTION
    └── MONITORING_ASSIGN (if no Unit Head)
        └── MONITORING_INSPECTION

MONITORING_INSPECTION
    ↓ (Monitoring Personnel decision)
    ├── COMPLETED + COMPLIANT (return through chain)
    └── COMPLETED + NON_COMPLIANT (forward to Legal Unit)
        └── LEGAL_REVIEW
            └── COMPLETED (after legal action)
```

## Auto-Assignment Rules

### Section Chief Assignment
- Match section (PD-1586, RA-6969, RA-8749, RA-9275, RA-9003)
- Prioritize same district
- Fallback to any active Section Chief for the section

### Unit Head Assignment
- Only for sections: PD-1586 (EIA), RA-8749 (Air), RA-9275 (Water)
- Match section and district
- Fallback to any active Unit Head for the section

### Monitoring Personnel Assignment
- Match section AND district
- Must have both district and law matching
- No fallback - must find exact match

## Tab Structure by User Level

### Division Chief
- Single list of created inspections

### Section Chief (3 Tabs)
1. **Created Inspections**: Inspections from Division Chief
2. **My Inspections**: Inspections they chose to work on
3. **Forwarded List**: Inspections they forwarded to Unit Head/Monitoring

### Unit Head (3 Tabs)
1. **Received from Section**: Inspections from Section Chief
2. **My Inspections**: Inspections they chose to work on
3. **Forwarded List**: Inspections they forwarded to Monitoring

### Monitoring Personnel
- Single list of assigned inspections

### Legal Unit
- List of non-compliant cases requiring review

## Compliance Return Paths

### Compliant Inspection ✅
```
Monitoring Personnel → Unit Head → Section Chief → Division Chief → FINAL CLOSE
```

### Non-Compliant Inspection ❌
```
Monitoring Personnel → Unit Head → Section Chief → Division Chief → Legal Unit → LEGAL ACTION
```

## Key Features

1. **Auto-Assignment**: Automatic matching based on district + law
2. **Conditional Routing**: Unit Head routing only if Unit Head exists
3. **Compliance Tracking**: Separate paths for compliant vs non-compliant
4. **Tab Organization**: Structured tabs for different user levels
5. **Legal Integration**: Automatic forwarding to Legal Unit for violations
6. **Audit Trail**: Complete workflow history tracking
