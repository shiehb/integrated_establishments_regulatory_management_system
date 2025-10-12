# Complete Inspection Workflow Plan - Summary

## 5 Core Buttons

| Button | Icon | Color | When to Show | Action |
|--------|------|-------|--------------|--------|
| **Inspect** | Play | Green | ASSIGNED statuses | Changes to IN_PROGRESS, opens form |
| **Continue** | Edit | Sky Blue | IN_PROGRESS statuses | Opens form to resume (no status change) |
| **Review** | Eye | Sky Blue | COMPLETED & REVIEWED statuses | Opens form to view (no status change) |
| **Forward** | Arrow Right | Sky Blue | ASSIGNED, IN_PROGRESS, REVIEWED | Delegate or send up hierarchy |
| **Send to Legal / Close** | Scale / Lock | Orange/Green/Red | DIVISION_REVIEWED, LEGAL statuses | Final actions |

---

## Complete Status Flow (22 Statuses Total)

### Flow 1: Section Chief Does Inspection Themselves

```
┌─────────────────────────────────────────────────────────────┐
│ CREATED (Division Chief creates)                            │
└─────────────────────────────────────────────────────────────┘
                          ↓ Auto-assign
┌─────────────────────────────────────────────────────────────┐
│ SECTION_ASSIGNED (Section Chief)                            │
│ Buttons: [Inspect] [Forward]                                │
└─────────────────────────────────────────────────────────────┘
                          ↓ Click "Inspect"
┌─────────────────────────────────────────────────────────────┐
│ SECTION_IN_PROGRESS (Section Chief)                         │
│ Buttons: [Continue]                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓ Complete form (mark compliant/non-compliant)
┌─────────────────────────────────────────────────────────────┐
│ SECTION_COMPLETED_COMPLIANT or NON_COMPLIANT                │
│ → AUTO-ASSIGNS to Division Chief (NO Forward button)        │
│ Buttons: [Review] ONLY                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓ Division Chief reviews
┌─────────────────────────────────────────────────────────────┐
│ DIVISION_REVIEWED (Division Chief)                          │
│ Buttons: [Review] [Send to Legal] [Close]                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
┌──────────────────┐              ┌──────────────────┐
│ CLOSED_COMPLIANT │              │  LEGAL_REVIEW    │
└──────────────────┘              └──────────────────┘
                                           ↓
                                  ┌──────────────────┐
                                  │    NOV_SENT      │
                                  └──────────────────┘
                                           ↓
                                  ┌──────────────────┐
                                  │    NOO_SENT      │
                                  └──────────────────┘
                                           ↓
                                  ┌──────────────────┐
                                  │ CLOSED_NON_      │
                                  │ COMPLIANT        │
                                  └──────────────────┘
```

### Flow 2: Full Delegation (Section → Unit → Monitoring)

```
┌─────────────────────────────────────────────────────────────┐
│ SECTION_ASSIGNED (Section Chief)                            │
│ Buttons: [Inspect] [Forward]                                │
└─────────────────────────────────────────────────────────────┘
                          ↓ Click "Forward"
┌─────────────────────────────────────────────────────────────┐
│ UNIT_ASSIGNED (Unit Head)                                   │
│ Buttons: [Inspect] [Forward]                                │
└─────────────────────────────────────────────────────────────┘
                          ↓ Click "Inspect"
┌─────────────────────────────────────────────────────────────┐
│ UNIT_IN_PROGRESS (Unit Head)                                │
│ Buttons: [Continue] [Forward]                               │
└─────────────────────────────────────────────────────────────┘
                          ↓ Complete form
┌─────────────────────────────────────────────────────────────┐
│ UNIT_COMPLETED_COMPLIANT or NON_COMPLIANT                   │
│ → AUTO-ASSIGNS to Section Chief (NO Forward button)         │
│ Buttons: [Review] ONLY                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓ Section Chief can forward to Monitoring
┌─────────────────────────────────────────────────────────────┐
│ MONITORING_ASSIGNED (Monitoring Personnel)                  │
│ Buttons: [Inspect]                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓ Click "Inspect"
┌─────────────────────────────────────────────────────────────┐
│ MONITORING_IN_PROGRESS (Monitoring Personnel)               │
│ Buttons: [Continue]                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓ Complete form
┌─────────────────────────────────────────────────────────────┐
│ MONITORING_COMPLETED_COMPLIANT or NON_COMPLIANT             │
│ → AUTO-ASSIGNS to Unit Head (NO Forward button)             │
│ Buttons: [Review] ONLY                                      │
└─────────────────────────────────────────────────────────────┘
                          ↓ Unit Head clicks "Forward"
┌─────────────────────────────────────────────────────────────┐
│ UNIT_REVIEWED (Section Chief)                               │
│ Buttons: [Review] [Forward]                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓ Section Chief clicks "Forward"
┌─────────────────────────────────────────────────────────────┐
│ SECTION_REVIEWED (Division Chief)                           │
│ Buttons: [Review] [Forward]                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓ Division Chief clicks "Forward"
┌─────────────────────────────────────────────────────────────┐
│ DIVISION_REVIEWED (Division Chief)                          │
│ Buttons: [Review] [Send to Legal] [Close]                   │
└─────────────────────────────────────────────────────────────┘
                          ↓ (Same as Flow 1)
              CLOSED_COMPLIANT or LEGAL_REVIEW
```

---

## Complete Status-Button Mapping

| Status | Assigned To | Buttons | Auto-Assign? |
|--------|-------------|---------|--------------|
| CREATED | Division Chief | None | ✅ Auto-assigns to Section Chief |
| SECTION_ASSIGNED | Section Chief | Inspect, Forward | No |
| SECTION_IN_PROGRESS | Section Chief | Continue | No |
| SECTION_COMPLETED_* | Division Chief | **Review ONLY** | ✅ Auto-assigned |
| UNIT_ASSIGNED | Unit Head | Inspect, Forward | No |
| UNIT_IN_PROGRESS | Unit Head | Continue, Forward | No |
| UNIT_COMPLETED_* | Section Chief | **Review ONLY** | ✅ Auto-assigned |
| MONITORING_ASSIGNED | Monitoring | Inspect | No |
| MONITORING_IN_PROGRESS | Monitoring | Continue | No |
| MONITORING_COMPLETED_* | Unit Head | **Review ONLY** | ✅ Auto-assigned |
| UNIT_REVIEWED | Section Chief | Review, Forward | No |
| SECTION_REVIEWED | Division Chief | Review, Forward | No |
| DIVISION_REVIEWED | Division Chief | Review, Send to Legal, Close | No |
| LEGAL_REVIEW | Legal Unit | Review, Close | No |
| NOV_SENT | Legal Unit | Review, Close | No |
| NOO_SENT | Legal Unit | Review, Close | No |
| CLOSED_COMPLIANT | N/A | None | Final state |
| CLOSED_NON_COMPLIANT | N/A | None | Final state |

---

## Key Rules

### Auto-Assignment Rules (NO Forward Button):
1. **SECTION_COMPLETED_*** → Auto-assigns to Division Chief
2. **UNIT_COMPLETED_*** → Auto-assigns to Section Chief
3. **MONITORING_COMPLETED_*** → Auto-assigns to Unit Head

**Important:** All *_COMPLETED_* statuses have **Review button ONLY** (no Forward button)

### Manual Forward (Has Forward Button):
1. **UNIT_REVIEWED** → Section Chief clicks Forward → SECTION_REVIEWED
2. **SECTION_REVIEWED** → Division Chief clicks Forward → DIVISION_REVIEWED

### Button Behavior:
- **Inspect** = Starts new work (ASSIGNED → IN_PROGRESS)
- **Continue** = Resumes existing work (stays IN_PROGRESS)
- **Review** = Views completed work (read-only, no status change)
- **Forward** = Delegates or sends up (changes status and assignment)

---

## All 22 Statuses (Keeping UNIT_COMPLETED_*)

### Section Chief (4):
1. SECTION_ASSIGNED
2. SECTION_IN_PROGRESS
3. SECTION_COMPLETED_COMPLIANT
4. SECTION_COMPLETED_NON_COMPLIANT

### Unit Head (4): ✅ KEEPING ALL
1. UNIT_ASSIGNED
2. UNIT_IN_PROGRESS
3. UNIT_COMPLETED_COMPLIANT ✅
4. UNIT_COMPLETED_NON_COMPLIANT ✅

### Monitoring (4):
1. MONITORING_ASSIGNED
2. MONITORING_IN_PROGRESS
3. MONITORING_COMPLETED_COMPLIANT
4. MONITORING_COMPLETED_NON_COMPLIANT

### Review (3):
1. UNIT_REVIEWED
2. SECTION_REVIEWED
3. DIVISION_REVIEWED

### Legal (3):
1. LEGAL_REVIEW
2. NOV_SENT
3. NOO_SENT

### Final (2):
1. CLOSED_COMPLIANT
2. CLOSED_NON_COMPLIANT

### Initial (1):
1. CREATED

### Removed (2):
1. ~~FINALIZED~~
2. ~~CLOSED~~ (generic)

**Total: 22 statuses**

---

## Implementation Checklist

### Backend:
- [ ] Add UNIT_COMPLETED_* transitions in models.py
- [ ] Update actions_map in serializers.py (COMPLETED = review only)
- [ ] Add _auto_assign_to_section_chief() method
- [ ] Add _auto_assign_to_division_chief() method
- [ ] Add _auto_assign_to_unit_head() method
- [ ] Update complete() to call auto-assign methods
- [ ] Remove FINALIZED and generic CLOSED from STATUS_CHOICES

### Frontend:
- [ ] Update actionButtonConfig with 5 buttons
- [ ] Update statusDisplayMap with all 22 statuses
- [ ] Update action handlers (inspect, continue, review, forward)
- [ ] Ensure COMPLETED statuses show Review only (no Forward)
- [ ] Ensure REVIEWED statuses show Review + Forward

---

## Summary

✅ **5 Clear Buttons** - Inspect, Continue, Review, Forward, Send to Legal/Close
✅ **22 Statuses** - Including UNIT_COMPLETED_* (not removed)
✅ **Auto-Assignment** - All COMPLETED statuses auto-assign (no Forward button)
✅ **Manual Forward** - All REVIEWED statuses require manual Forward click
✅ **Complete Coverage** - All workflow paths supported
✅ **Clean Separation** - Inspect (start) vs Continue (resume) vs Review (view)

