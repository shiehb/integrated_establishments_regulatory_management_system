# COMPLETE DETAILED INSPECTION WORKFLOW

## Legend:
- **[Button]** = User action/button click
- **→ ASSIGN:** = System auto-assigns (no status change)
- **→ STATUS:** = Status changes
- **Assigned to:** = Who can see and act on this inspection
- **Available Actions:** = Buttons visible to assigned user

---

## SCENARIO 1: Section Chief Does Inspection Themselves (No Forwarding)

### Step 1: Division Chief Creates Inspection
```
STATUS: CREATED
Assigned to: Division Chief
Available Actions: None (just created)

[Division Chief clicks "Create Inspection" in wizard]
    ↓ AUTO-TRANSITION
    
STATUS: SECTION_ASSIGNED
→ ASSIGN: Section Chief (auto-assigned based on law)
Assigned to: Section Chief
Available Actions: ["Inspect", "Forward"]
```

### Step 2: Section Chief Starts Inspection
```
[Section Chief clicks "Inspect" button]
    ↓ STATUS CHANGE
    
STATUS: SECTION_IN_PROGRESS
Assigned to: Section Chief (unchanged)
Available Actions: ["Continue" (opens form)]
```

### Step 3: Section Chief Completes Inspection
```
[Section Chief fills form, clicks "Mark Compliant" or "Mark Non-Compliant"]
    ↓ STATUS CHANGE
    
STATUS: SECTION_COMPLETED_COMPLIANT or SECTION_COMPLETED_NON_COMPLIANT
→ ASSIGN: Division Chief (auto-assigned for review)
Assigned to: Division Chief
Available Actions: ["Send to Division", "Forward" (if wants Unit/Monitoring to check)]
```

### Step 4: Division Chief Reviews
```
[Division Chief clicks "Send to Division" button]
    ↓ STATUS CHANGE
    
STATUS: DIVISION_REVIEWED
Assigned to: Division Chief (unchanged)
Available Actions: ["Review" (opens form to see results)]
```

### Step 5A: Division Chief Closes (If Compliant)
```
[Division Chief reviews form, clicks "Close as Compliant"]
    ↓ STATUS CHANGE
    
STATUS: CLOSED_COMPLIANT
Assigned to: Division Chief
Available Actions: None (final state)
```

### Step 5B: Division Chief Sends to Legal (If Non-Compliant)
```
[Division Chief reviews form, clicks "Send to Legal"]
    ↓ STATUS CHANGE
    
STATUS: LEGAL_REVIEW
→ ASSIGN: Legal Unit
Assigned to: Legal Unit
Available Actions: ["Review", "Send NOV", "Send NOO", "Close"]

[Legal Unit clicks "Send NOV"]
    ↓ STATUS CHANGE
    
STATUS: NOV_SENT
Assigned to: Legal Unit
Available Actions: ["Send NOO", "Close"]

[Legal Unit clicks "Send NOO"]
    ↓ STATUS CHANGE
    
STATUS: NOO_SENT
Assigned to: Legal Unit
Available Actions: ["Close"]

[Legal Unit clicks "Close"]
    ↓ STATUS CHANGE
    
STATUS: CLOSED_NON_COMPLIANT
Assigned to: Legal Unit
Available Actions: None (final state)
```

---

## SCENARIO 2: Full Delegation Flow (Section → Unit → Monitoring)

### Step 1-2: Same as Scenario 1
```
CREATED → SECTION_ASSIGNED → Section Chief assigned
```

### Step 3: Section Chief Forwards to Unit Head
```
STATUS: SECTION_ASSIGNED
Assigned to: Section Chief
Available Actions: ["Inspect", "Forward"]

[Section Chief clicks "Forward" button]
[System checks: Is there a Unit Head for this law?]
[If YES → Forward to Unit]
    ↓ STATUS CHANGE
    
STATUS: UNIT_ASSIGNED
→ ASSIGN: Unit Head (based on law)
Assigned to: Unit Head
Available Actions: ["Assign to Me", "Forward"]
```

### Step 4: Unit Head Starts Work
```
[Unit Head clicks "Assign to Me" or "Inspect"]
    ↓ STATUS CHANGE
    
STATUS: UNIT_IN_PROGRESS
Assigned to: Unit Head (unchanged)
Available Actions: ["Continue", "Forward"]
```

### Step 5: Unit Head Forwards to Monitoring
```
[Unit Head clicks "Forward" button]
    ↓ STATUS CHANGE
    
STATUS: MONITORING_ASSIGNED
→ ASSIGN: Monitoring Personnel (based on law + district)
Assigned to: Monitoring Personnel
Available Actions: ["Start"]
```

### Step 6: Monitoring Personnel Starts Inspection
```
[Monitoring Personnel clicks "Start" button]
    ↓ STATUS CHANGE
    
STATUS: MONITORING_IN_PROGRESS
Assigned to: Monitoring Personnel (unchanged)
Available Actions: ["Continue" (opens inspection form)]
```

### Step 7: Monitoring Personnel Completes Inspection
```
[Monitoring Personnel fills form, clicks "Mark Compliant" or "Mark Non-Compliant"]
    ↓ STATUS CHANGE
    
STATUS: MONITORING_COMPLETED_COMPLIANT or MONITORING_COMPLETED_NON_COMPLIANT
→ ASSIGN: Unit Head (auto-assigned for review, STATUS STAYS MONITORING_COMPLETED_*)
Assigned to: Unit Head
Available Actions: ["Review" (view form), "Send to Section"]

**IMPORTANT:** Status is still MONITORING_COMPLETED_*, NOT UNIT_REVIEWED yet!
```

### Step 8: Unit Head Reviews and Sends to Section
```
STATUS: MONITORING_COMPLETED_COMPLIANT/NON_COMPLIANT
Assigned to: Unit Head

[Unit Head clicks "Review" to view inspection form]
[Unit Head reviews results, clicks "Send to Section" button]
    ↓ STATUS CHANGE (NOW it changes!)
    
STATUS: UNIT_REVIEWED
→ ASSIGN: Section Chief (auto-assigned)
Assigned to: Section Chief
Available Actions: ["Review" (view form), "Send to Division"]
```

### Step 9: Section Chief Reviews and Sends to Division
```
STATUS: UNIT_REVIEWED
Assigned to: Section Chief

[Section Chief clicks "Review" to view inspection form]
[Section Chief reviews results, clicks "Send to Division" button]
    ↓ STATUS CHANGE
    
STATUS: SECTION_REVIEWED
→ ASSIGN: Division Chief (auto-assigned)
Assigned to: Division Chief
Available Actions: ["Review" (view form), "Send to Division"]
```

### Step 10: Division Chief Final Review
```
STATUS: SECTION_REVIEWED
Assigned to: Division Chief

[Division Chief clicks "Review" to view inspection form]
[Division Chief clicks "Send to Division" button]
    ↓ STATUS CHANGE
    
STATUS: DIVISION_REVIEWED
Assigned to: Division Chief (unchanged)
Available Actions: ["Review" (view form)]
```

### Step 11: Division Chief Final Decision
```
STATUS: DIVISION_REVIEWED
Assigned to: Division Chief

[Division Chief reviews all results in form]

IF COMPLIANT:
    [Clicks "Close as Compliant"]
        ↓ STATUS CHANGE
    STATUS: CLOSED_COMPLIANT
    
IF NON-COMPLIANT:
    [Clicks "Send to Legal"]
        ↓ STATUS CHANGE
    STATUS: LEGAL_REVIEW
    → ASSIGN: Legal Unit
    [Continue to Legal workflow - see Scenario 1, Step 5B]
```

---

## SCENARIO 3: Section Chief Forwards Directly to Monitoring (No Unit Head)

### Steps 1-2: Same as Scenario 2
```
CREATED → SECTION_ASSIGNED → Section Chief assigned
```

### Step 3: Section Chief Forwards (No Unit Head Exists)
```
STATUS: SECTION_ASSIGNED
Assigned to: Section Chief
Available Actions: ["Inspect", "Forward"]

[Section Chief clicks "Forward" button]
[System checks: Is there a Unit Head for this law?]
[If NO → Forward directly to Monitoring]
    ↓ STATUS CHANGE
    
STATUS: MONITORING_ASSIGNED
→ ASSIGN: Monitoring Personnel (based on law + district)
Assigned to: Monitoring Personnel
Available Actions: ["Start"]
```

### Steps 4-6: Monitoring Does Inspection
```
[Same as Scenario 2, Steps 6-7]
MONITORING_ASSIGNED → MONITORING_IN_PROGRESS → MONITORING_COMPLETED_*
→ ASSIGN: Unit Head (even though no Unit Head did work, they review)
```

### Step 7: Unit Head Reviews (Even Though They Didn't Do Inspection)
```
STATUS: MONITORING_COMPLETED_COMPLIANT/NON_COMPLIANT
Assigned to: Unit Head
Available Actions: ["Review", "Send to Section"]

[Unit Head reviews monitoring results, clicks "Send to Section"]
    ↓ STATUS CHANGE
    
STATUS: UNIT_REVIEWED
→ ASSIGN: Section Chief
[Continue same as Scenario 2, Steps 9-11]
```

---

## COMPLETE STATUS FLOW SUMMARY

### All Possible Status Transitions:

```
CREATED
  ↓ (Division Chief creates)
SECTION_ASSIGNED
  ↓ (Section Chief: "Inspect")
SECTION_IN_PROGRESS
  ↓ (Section Chief: "Mark Compliant/Non-Compliant")
SECTION_COMPLETED_COMPLIANT/NON_COMPLIANT
  ├─→ (Section Chief: "Send to Division") → DIVISION_REVIEWED
  └─→ (Section Chief: "Forward") → UNIT_ASSIGNED or MONITORING_ASSIGNED

UNIT_ASSIGNED
  ↓ (Unit Head: "Assign to Me")
UNIT_IN_PROGRESS
  ↓ (Unit Head: "Forward")
MONITORING_ASSIGNED

MONITORING_ASSIGNED
  ↓ (Monitoring: "Start")
MONITORING_IN_PROGRESS
  ↓ (Monitoring: "Mark Compliant/Non-Compliant")
MONITORING_COMPLETED_COMPLIANT/NON_COMPLIANT
  ↓ (Unit Head: "Send to Section") **STATUS CHANGES HERE**
UNIT_REVIEWED
  ↓ (Section Chief: "Send to Division")
SECTION_REVIEWED
  ↓ (Division Chief: "Send to Division")
DIVISION_REVIEWED
  ├─→ (Division Chief: "Close as Compliant") → CLOSED_COMPLIANT
  └─→ (Division Chief: "Send to Legal") → LEGAL_REVIEW

LEGAL_REVIEW
  ├─→ (Legal: "Send NOV") → NOV_SENT
  ├─→ (Legal: "Send NOO") → NOO_SENT
  └─→ (Legal: "Close") → CLOSED_NON_COMPLIANT

NOV_SENT
  ├─→ (Legal: "Send NOO") → NOO_SENT
  └─→ (Legal: "Close") → CLOSED_NON_COMPLIANT

NOO_SENT
  └─→ (Legal: "Close") → CLOSED_NON_COMPLIANT
```

---

## KEY WORKFLOW RULES

### Auto-Assignment Rules:
1. **CREATED → SECTION_ASSIGNED:** Auto-assign Section Chief based on law
2. **SECTION_COMPLETED_* → (stays same status):** Auto-assign Division Chief
3. **MONITORING_COMPLETED_* → (stays same status):** Auto-assign Unit Head
4. **UNIT_REVIEWED → (stays same status):** Auto-assign Section Chief
5. **SECTION_REVIEWED → (stays same status):** Auto-assign Division Chief
6. **LEGAL_REVIEW → (stays same status):** Auto-assign Legal Unit

### Status Change Rules:
- Status ONLY changes when user clicks action button
- Completion does NOT auto-change status (only assigns to reviewer)
- Reviewer must click "Send to..." to change status

### Button Visibility Rules:
- Buttons only visible to currently assigned user
- Buttons depend on current status + user level
- "Review" button opens inspection form (read-only or edit depending on status)

---

## STATUS-TO-ACTION MAPPING TABLE

| Current Status | Assigned To | Available Buttons | What Happens |
|---|---|---|---|
| CREATED | Division Chief | None | Just created |
| SECTION_ASSIGNED | Section Chief | Inspect, Forward | Start work or delegate |
| SECTION_IN_PROGRESS | Section Chief | Continue | Fill inspection form |
| SECTION_COMPLETED_COMPLIANT | Division Chief | Send to Division, Forward | Review or re-delegate |
| SECTION_COMPLETED_NON_COMPLIANT | Division Chief | Send to Division, Forward | Review or re-delegate |
| UNIT_ASSIGNED | Unit Head | Assign to Me, Forward | Claim or delegate |
| UNIT_IN_PROGRESS | Unit Head | Continue, Forward | Fill form or delegate |
| MONITORING_ASSIGNED | Monitoring Personnel | Start | Begin inspection |
| MONITORING_IN_PROGRESS | Monitoring Personnel | Continue | Fill inspection form |
| MONITORING_COMPLETED_COMPLIANT | Unit Head | Review, Send to Section | View results, send up |
| MONITORING_COMPLETED_NON_COMPLIANT | Unit Head | Review, Send to Section | View results, send up |
| UNIT_REVIEWED | Section Chief | Review, Send to Division | View results, send up |
| SECTION_REVIEWED | Division Chief | Review, Send to Division | View results, finalize |
| DIVISION_REVIEWED | Division Chief | Review | Final review, close or legal |
| LEGAL_REVIEW | Legal Unit | Review, Send NOV, Send NOO, Close | Legal actions |
| NOV_SENT | Legal Unit | Send NOO, Close | Continue legal process |
| NOO_SENT | Legal Unit | Close | Final legal action |
| CLOSED_COMPLIANT | N/A | None | Final state |
| CLOSED_NON_COMPLIANT | N/A | None | Final state |

