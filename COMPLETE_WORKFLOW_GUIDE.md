# 🔄 Complete Inspection Workflow Guide

## 📋 Overview

This comprehensive guide maps every status transition to:
- Which tab(s) the inspection appears in for each role
- What actions are available in the inspection list
- What form/page mode is used (create, edit, preview, review)
- What happens after each action (next status, next tab, next assignee)
- All possible workflow paths

---

## 🎯 Section 1: Role-by-Role Workflow Matrix

### **Division Chief**

#### **Available Tabs:**
- `all_inspections` - All Inspections
- `review` - Review

#### **Tab Details:**

**All Inspections Tab:**
- **Statuses Shown:** All statuses (CREATED, SECTION_ASSIGNED, SECTION_IN_PROGRESS, SECTION_COMPLETED_COMPLIANT, SECTION_COMPLETED_NON_COMPLIANT, UNIT_ASSIGNED, UNIT_IN_PROGRESS, UNIT_COMPLETED_COMPLIANT, UNIT_COMPLETED_NON_COMPLIANT, MONITORING_ASSIGNED, MONITORING_IN_PROGRESS, MONITORING_COMPLETED_COMPLIANT, MONITORING_COMPLETED_NON_COMPLIANT, UNIT_REVIEWED, SECTION_REVIEWED, DIVISION_REVIEWED, LEGAL_REVIEW, NOV_SENT, NOO_SENT, CLOSED_COMPLIANT, CLOSED_NON_COMPLIANT)
- **Actions Available:**
  - `CREATED` → ['assign_to_me', 'forward']
  - `SECTION_COMPLETED_COMPLIANT` → ['review']
  - `SECTION_COMPLETED_NON_COMPLIANT` → ['review']
  - `SECTION_REVIEWED` → ['review']
  - `DIVISION_REVIEWED` → ['review', 'send_to_legal', 'close']
- **Form Modes:**
  - `assign_to_me` → Create Mode (Inspection Wizard)
  - `forward` → Forward Modal
  - `review` → Review Mode (InspectionReviewPage)
  - `send_to_legal` → Review Mode (InspectionReviewPage)
  - `close` → Review Mode (InspectionReviewPage)

**Review Tab:**
- **Statuses Shown:** SECTION_COMPLETED_COMPLIANT, SECTION_COMPLETED_NON_COMPLIANT, SECTION_REVIEWED, DIVISION_REVIEWED
- **Actions Available:**
  - `SECTION_COMPLETED_COMPLIANT` → ['review']
  - `SECTION_COMPLETED_NON_COMPLIANT` → ['review']
  - `SECTION_REVIEWED` → ['review']
  - `DIVISION_REVIEWED` → ['review', 'send_to_legal', 'close']
- **Form Modes:** All actions open Review Mode (InspectionReviewPage)

---

### **Section Chief**

#### **Available Tabs:**
- `received` - Received
- `my_inspections` - My Inspections
- `forwarded` - Forwarded
- `review` - Review
- `compliance` - Compliance

#### **Tab Details:**

**Received Tab:**
- **Statuses Shown:** SECTION_ASSIGNED
- **Actions Available:**
  - `SECTION_ASSIGNED` → ['inspect', 'forward']
- **Form Modes:**
  - `inspect` → Edit Mode (InspectionForm)
  - `forward` → Forward Modal

**My Inspections Tab:**
- **Statuses Shown:** SECTION_IN_PROGRESS, SECTION_COMPLETED_COMPLIANT, SECTION_COMPLETED_NON_COMPLIANT
- **Actions Available:**
  - `SECTION_IN_PROGRESS` → ['continue']
- **Form Modes:**
  - `continue` → Edit Mode (InspectionForm)

**Forwarded Tab:**
- **Statuses Shown:** UNIT_ASSIGNED, UNIT_IN_PROGRESS, MONITORING_ASSIGNED, MONITORING_IN_PROGRESS
- **Actions Available:** None (view only)

**Review Tab:**
- **Statuses Shown:** UNIT_COMPLETED_COMPLIANT, UNIT_COMPLETED_NON_COMPLIANT, MONITORING_COMPLETED_COMPLIANT, MONITORING_COMPLETED_NON_COMPLIANT, UNIT_REVIEWED
- **Actions Available:**
  - `UNIT_COMPLETED_COMPLIANT` → ['review']
  - `UNIT_COMPLETED_NON_COMPLIANT` → ['review']
  - `MONITORING_COMPLETED_COMPLIANT` → ['review'] (when no Unit Head)
  - `MONITORING_COMPLETED_NON_COMPLIANT` → ['review'] (when no Unit Head)
  - `UNIT_REVIEWED` → ['review']
- **Form Modes:** All actions open Review Mode (InspectionReviewPage)

**Compliance Tab:**
- **Statuses Shown:** SECTION_COMPLETED_COMPLIANT, SECTION_COMPLETED_NON_COMPLIANT, SECTION_REVIEWED, DIVISION_REVIEWED, LEGAL_REVIEW, NOV_SENT, NOO_SENT, CLOSED_COMPLIANT, CLOSED_NON_COMPLIANT
- **Actions Available:** None (view only)

---

### **Unit Head**

#### **Available Tabs:**
- `received` - Received
- `my_inspections` - My Inspections
- `forwarded` - Forwarded
- `review` - Review
- `compliance` - Compliance

#### **Tab Details:**

**Received Tab:**
- **Statuses Shown:** UNIT_ASSIGNED
- **Actions Available:**
  - `UNIT_ASSIGNED` → ['inspect', 'forward']
- **Form Modes:**
  - `inspect` → Edit Mode (InspectionForm)
  - `forward` → Forward Modal

**My Inspections Tab:**
- **Statuses Shown:** UNIT_IN_PROGRESS, UNIT_COMPLETED_COMPLIANT, UNIT_COMPLETED_NON_COMPLIANT
- **Actions Available:**
  - `UNIT_IN_PROGRESS` → ['continue', 'forward']
- **Form Modes:**
  - `continue` → Edit Mode (InspectionForm)
  - `forward` → Forward Modal

**Forwarded Tab:**
- **Statuses Shown:** MONITORING_ASSIGNED, MONITORING_IN_PROGRESS
- **Actions Available:** None (view only)

**Review Tab:**
- **Statuses Shown:** MONITORING_COMPLETED_COMPLIANT, MONITORING_COMPLETED_NON_COMPLIANT, UNIT_REVIEWED
- **Actions Available:**
  - `MONITORING_COMPLETED_COMPLIANT` → ['review']
  - `MONITORING_COMPLETED_NON_COMPLIANT` → ['review']
  - `UNIT_REVIEWED` → ['review']
- **Form Modes:** All actions open Review Mode (InspectionReviewPage)

**Compliance Tab:**
- **Statuses Shown:** UNIT_COMPLETED_COMPLIANT, UNIT_COMPLETED_NON_COMPLIANT, UNIT_REVIEWED, SECTION_REVIEWED, DIVISION_REVIEWED, CLOSED_COMPLIANT, CLOSED_NON_COMPLIANT
- **Actions Available:** None (view only)

---

### **Monitoring Personnel**

#### **Available Tabs:**
- `assigned` - Assigned
- `in_progress` - In Progress
- `completed` - Completed & Reviewed

#### **Tab Details:**

**Assigned Tab:**
- **Statuses Shown:** MONITORING_ASSIGNED
- **Actions Available:**
  - `MONITORING_ASSIGNED` → ['inspect']
- **Form Modes:**
  - `inspect` → Edit Mode (InspectionForm)

**In Progress Tab:**
- **Statuses Shown:** MONITORING_IN_PROGRESS
- **Actions Available:**
  - `MONITORING_IN_PROGRESS` → ['continue']
- **Form Modes:**
  - `continue` → Edit Mode (InspectionForm)

**Completed Tab:**
- **Statuses Shown:** MONITORING_COMPLETED_COMPLIANT, MONITORING_COMPLETED_NON_COMPLIANT, UNIT_REVIEWED, SECTION_REVIEWED, DIVISION_REVIEWED, CLOSED_COMPLIANT, CLOSED_NON_COMPLIANT
- **Actions Available:** None (view only)

---

### **Legal Unit**

#### **Available Tabs:**
- `legal_review` - Legal Review
- `nov_sent` - NOV Sent
- `noo_sent` - NOO Sent

#### **Tab Details:**

**Legal Review Tab:**
- **Statuses Shown:** LEGAL_REVIEW
- **Actions Available:**
  - `LEGAL_REVIEW` → ['review', 'close']
- **Form Modes:**
  - `review` → Review Mode (InspectionReviewPage)
  - `close` → Review Mode (InspectionReviewPage)

**NOV Sent Tab:**
- **Statuses Shown:** NOV_SENT
- **Actions Available:**
  - `NOV_SENT` → ['review', 'close']
- **Form Modes:**
  - `review` → Review Mode (InspectionReviewPage)
  - `close` → Review Mode (InspectionReviewPage)

**NOO Sent Tab:**
- **Statuses Shown:** NOO_SENT, CLOSED_NON_COMPLIANT
- **Actions Available:**
  - `NOO_SENT` → ['review', 'close']
- **Form Modes:**
  - `review` → Review Mode (InspectionReviewPage)
  - `close` → Review Mode (InspectionReviewPage)

---

## 🎯 Section 2: Action-to-Outcome Matrix

### **Action Button Details:**

#### **assign_to_me**
- **Label:** Assign to Me
- **Icon:** User
- **Color:** Sky
- **Form Mode:** None (API call only)
- **Backend Endpoint:** `POST /inspections/{id}/assign_to_me/`
- **Status Transition:** No status change, only assignment change
- **Next Assignee:** Current user

#### **inspect**
- **Label:** Inspect
- **Icon:** Play
- **Color:** Green
- **Form Mode:** Edit Mode (InspectionForm)
- **Backend Endpoint:** `POST /inspections/{id}/inspect/`
- **Status Transition:** 
  - `SECTION_ASSIGNED` → `SECTION_IN_PROGRESS`
  - `UNIT_ASSIGNED` → `UNIT_IN_PROGRESS`
  - `MONITORING_ASSIGNED` → `MONITORING_IN_PROGRESS`
- **Next Assignee:** Current user

#### **continue**
- **Label:** Continue
- **Icon:** FileText
- **Color:** Sky
- **Form Mode:** Edit Mode (InspectionForm)
- **Backend Endpoint:** `POST /inspections/{id}/complete/`
- **Status Transition:**
  - `SECTION_IN_PROGRESS` → `SECTION_COMPLETED_COMPLIANT` or `SECTION_COMPLETED_NON_COMPLIANT`
  - `UNIT_IN_PROGRESS` → `UNIT_COMPLETED_COMPLIANT` or `UNIT_COMPLETED_NON_COMPLIANT`
  - `MONITORING_IN_PROGRESS` → `MONITORING_COMPLETED_COMPLIANT` or `MONITORING_COMPLETED_NON_COMPLIANT`
- **Next Assignee:** Auto-assigned based on completion status

#### **review**
- **Label:** Review
- **Icon:** Eye
- **Color:** Sky
- **Form Mode:** Review Mode (InspectionReviewPage)
- **Backend Endpoint:** `POST /inspections/{id}/review/`
- **Status Transition:** No status change (review only)
- **Next Assignee:** No change

#### **forward**
- **Label:** Forward
- **Icon:** ArrowRight
- **Color:** Sky
- **Form Mode:** Forward Modal
- **Backend Endpoint:** `POST /inspections/{id}/forward/`
- **Status Transition:**
  - `SECTION_ASSIGNED` → `UNIT_ASSIGNED` or `MONITORING_ASSIGNED`
  - `UNIT_ASSIGNED` → `MONITORING_ASSIGNED`
- **Next Assignee:** Selected user from modal

#### **send_to_legal**
- **Label:** Send to Legal
- **Icon:** Scale
- **Color:** Orange
- **Form Mode:** Review Mode (InspectionReviewPage)
- **Backend Endpoint:** `POST /inspections/{id}/forward_to_legal/`
- **Status Transition:** `DIVISION_REVIEWED` → `LEGAL_REVIEW`
- **Next Assignee:** Legal Unit user

#### **close**
- **Label:** Close (or "Mark as Compliant" for Legal Unit/Division Chief)
- **Icon:** Lock
- **Color:** Green
- **Form Mode:** Review Mode (InspectionReviewPage)
- **Backend Endpoint:** `POST /inspections/{id}/close/`
- **Status Transition:**
  - `DIVISION_REVIEWED` → `CLOSED_COMPLIANT`
  - `LEGAL_REVIEW` → `CLOSED_NON_COMPLIANT`
  - `NOV_SENT` → `CLOSED_NON_COMPLIANT`
  - `NOO_SENT` → `CLOSED_NON_COMPLIANT`
- **Next Assignee:** No change (final status)

---

## 🎯 Section 3: Form Mode Matrix

### **Form Modes and Usage:**

#### **Create Mode**
- **When Used:** Division Chief creates new inspection
- **Component:** SimpleInspectionWizard
- **Purpose:** Initial inspection creation with establishment and law selection
- **Status:** Creates inspection in `CREATED` status

#### **Edit Mode (Inspect)**
- **When Used:** Personnel starts new inspection from ASSIGNED status
- **Component:** InspectionForm
- **Purpose:** Begin inspection work from assigned status
- **Status Transition:** ASSIGNED → IN_PROGRESS

#### **Edit Mode (Continue)**
- **When Used:** Personnel continues in-progress inspection
- **Component:** InspectionForm
- **Purpose:** Continue working on inspection and complete it
- **Status Transition:** IN_PROGRESS → COMPLETED_COMPLIANT or COMPLETED_NON_COMPLIANT

#### **Preview Mode**
- **When Used:** Personnel reviews their work before submitting
- **Component:** InspectionReviewPage (mode='preview')
- **Purpose:** Review completed work before final submission
- **Status Transition:** Triggers completion and status change

#### **Review Mode**
- **When Used:** Supervisors review subordinate completed work
- **Component:** InspectionReviewPage (mode='review')
- **Purpose:** Review and approve/forward completed inspections
- **Status Transition:** Various based on review action

---

## 🎯 Section 4: Complete Workflow Paths

### **Path 1: Full Hierarchy (With Unit Head)**

```
1. CREATED
   ↓ Division Chief All Inspections Tab
   ↓ [Forward Action → Forward Modal]
   
2. SECTION_ASSIGNED
   ↓ Section Chief Received Tab
   ↓ [Inspect Action → Edit Mode (InspectionForm)]
   
3. SECTION_IN_PROGRESS
   ↓ Section Chief My Inspections Tab
   ↓ [Continue Action → Edit Mode → Preview → Complete]
   
4. SECTION_COMPLETED_COMPLIANT
   ↓ Division Chief Review Tab (auto-assigned)
   ↓ [Review Action → Review Mode (InspectionReviewPage)]
   
5. UNIT_ASSIGNED
   ↓ Unit Head Received Tab (auto-assigned)
   ↓ [Inspect Action → Edit Mode (InspectionForm)]
   
6. UNIT_IN_PROGRESS
   ↓ Unit Head My Inspections Tab
   ↓ [Continue Action → Edit Mode → Preview → Complete]
   
7. UNIT_COMPLETED_COMPLIANT
   ↓ Section Chief Review Tab (auto-assigned)
   ↓ [Review Action → Review Mode (InspectionReviewPage)]
   
8. MONITORING_ASSIGNED
   ↓ Monitoring Personnel Assigned Tab (auto-assigned)
   ↓ [Inspect Action → Edit Mode (InspectionForm)]
   
9. MONITORING_IN_PROGRESS
   ↓ Monitoring Personnel In Progress Tab
   ↓ [Continue Action → Edit Mode → Preview → Complete]
   
10. MONITORING_COMPLETED_COMPLIANT
    ↓ Unit Head Review Tab (auto-assigned)
    ↓ [Review Action → Review Mode (InspectionReviewPage)]
    
11. UNIT_REVIEWED
    ↓ Section Chief Review Tab (auto-assigned)
    ↓ [Review Action → Review Mode (InspectionReviewPage)]
    
12. SECTION_REVIEWED
    ↓ Division Chief Review Tab (auto-assigned)
    ↓ [Review Action → Review Mode (InspectionReviewPage)]
    
13. DIVISION_REVIEWED
    ↓ Division Chief Review Tab
    ↓ [Close Action → Review Mode (InspectionReviewPage)]
    
14. CLOSED_COMPLIANT
    ↓ Final Status (appears in Compliance tabs)
```

### **Path 2: No Unit Head Path**

```
1. CREATED
   ↓ Division Chief All Inspections Tab
   ↓ [Forward Action → Forward Modal]
   
2. SECTION_ASSIGNED
   ↓ Section Chief Received Tab
   ↓ [Inspect Action → Edit Mode (InspectionForm)]
   
3. SECTION_IN_PROGRESS
   ↓ Section Chief My Inspections Tab
   ↓ [Continue Action → Edit Mode → Preview → Complete]
   
4. SECTION_COMPLETED_COMPLIANT
   ↓ Division Chief Review Tab (auto-assigned)
   ↓ [Review Action → Review Mode (InspectionReviewPage)]
   
5. MONITORING_ASSIGNED
   ↓ Monitoring Personnel Assigned Tab (auto-assigned)
   ↓ [Inspect Action → Edit Mode (InspectionForm)]
   
6. MONITORING_IN_PROGRESS
   ↓ Monitoring Personnel In Progress Tab
   ↓ [Continue Action → Edit Mode → Preview → Complete]
   
7. MONITORING_COMPLETED_COMPLIANT
   ↓ Section Chief Review Tab (auto-assigned - no Unit Head exists)
   ↓ [Review Action → Review Mode (InspectionReviewPage)]
   
8. SECTION_REVIEWED
   ↓ Division Chief Review Tab (auto-assigned)
   ↓ [Review Action → Review Mode (InspectionReviewPage)]
   
9. DIVISION_REVIEWED
   ↓ Division Chief Review Tab
   ↓ [Close Action → Review Mode (InspectionReviewPage)]
   
10. CLOSED_COMPLIANT
    ↓ Final Status (appears in Compliance tabs)
```

### **Path 3: Section Chief Direct Submission**

```
1. CREATED
   ↓ Division Chief All Inspections Tab
   ↓ [Forward Action → Forward Modal]
   
2. SECTION_ASSIGNED
   ↓ Section Chief Received Tab
   ↓ [Inspect Action → Edit Mode (InspectionForm)]
   
3. SECTION_IN_PROGRESS
   ↓ Section Chief My Inspections Tab
   ↓ [Continue Action → Edit Mode → Preview → Complete (Direct to Division)]
   
4. DIVISION_REVIEWED
   ↓ Division Chief Review Tab (auto-assigned)
   ↓ [Review Action → Review Mode (InspectionReviewPage)]
   
5. CLOSED_COMPLIANT
   ↓ Final Status (appears in Compliance tabs)
```

### **Path 4: Unit Head Direct Submission**

```
1. CREATED
   ↓ Division Chief All Inspections Tab
   ↓ [Forward Action → Forward Modal]
   
2. SECTION_ASSIGNED
   ↓ Section Chief Received Tab
   ↓ [Forward Action → Forward Modal]
   
3. UNIT_ASSIGNED
   ↓ Unit Head Received Tab
   ↓ [Inspect Action → Edit Mode (InspectionForm)]
   
4. UNIT_IN_PROGRESS
   ↓ Unit Head My Inspections Tab
   ↓ [Continue Action → Edit Mode → Preview → Complete (Direct to Section)]
   
5. SECTION_REVIEWED
   ↓ Section Chief Review Tab (auto-assigned)
   ↓ [Review Action → Review Mode (InspectionReviewPage)]
   
6. DIVISION_REVIEWED
   ↓ Division Chief Review Tab (auto-assigned)
   ↓ [Review Action → Review Mode (InspectionReviewPage)]
   
7. CLOSED_COMPLIANT
   ↓ Final Status (appears in Compliance tabs)
```

### **Path 5: Non-Compliant Legal Path**

```
1. CREATED
   ↓ Division Chief All Inspections Tab
   ↓ [Forward Action → Forward Modal]
   
2. SECTION_ASSIGNED
   ↓ Section Chief Received Tab
   ↓ [Inspect Action → Edit Mode (InspectionForm)]
   
3. SECTION_IN_PROGRESS
   ↓ Section Chief My Inspections Tab
   ↓ [Continue Action → Edit Mode → Preview → Complete (NON-COMPLIANT)]
   
4. SECTION_COMPLETED_NON_COMPLIANT
   ↓ Division Chief Review Tab (auto-assigned)
   ↓ [Review Action → Review Mode (InspectionReviewPage)]
   
5. DIVISION_REVIEWED
   ↓ Division Chief Review Tab
   ↓ [Send to Legal Action → Review Mode (InspectionReviewPage)]
   
6. LEGAL_REVIEW
   ↓ Legal Unit Legal Review Tab (auto-assigned)
   ↓ [Review Action → Review Mode (InspectionReviewPage)]
   
7. NOV_SENT
   ↓ Legal Unit NOV Sent Tab
   ↓ [Review Action → Review Mode (InspectionReviewPage)]
   
8. NOO_SENT
   ↓ Legal Unit NOO Sent Tab
   ↓ [Review Action → Review Mode (InspectionReviewPage)]
   
9. CLOSED_NON_COMPLIANT
   ↓ Final Status (appears in Compliance tabs)
```

---

## 🎯 Section 5: Tab Visibility Rules

### **Division Chief Tab Filtering:**
- **All Inspections:** All inspections created by this Division Chief
- **Review:** Inspections in SECTION_COMPLETED_COMPLIANT, SECTION_COMPLETED_NON_COMPLIANT, SECTION_REVIEWED, DIVISION_REVIEWED statuses

### **Section Chief Tab Filtering:**
- **Received:** SECTION_ASSIGNED status for this Section Chief's law
- **My Inspections:** SECTION_IN_PROGRESS, SECTION_COMPLETED_COMPLIANT, SECTION_COMPLETED_NON_COMPLIANT assigned to this Section Chief
- **Forwarded:** UNIT_ASSIGNED, UNIT_IN_PROGRESS, MONITORING_ASSIGNED, MONITORING_IN_PROGRESS for this Section Chief's law
- **Review:** UNIT_COMPLETED_COMPLIANT, UNIT_COMPLETED_NON_COMPLIANT, MONITORING_COMPLETED_COMPLIANT, MONITORING_COMPLETED_NON_COMPLIANT, UNIT_REVIEWED for this Section Chief's law
- **Compliance:** Final status inspections (SECTION_COMPLETED_COMPLIANT, SECTION_COMPLETED_NON_COMPLIANT, SECTION_REVIEWED, DIVISION_REVIEWED, LEGAL_REVIEW, NOV_SENT, NOO_SENT, CLOSED_COMPLIANT, CLOSED_NON_COMPLIANT)

### **Unit Head Tab Filtering:**
- **Received:** UNIT_ASSIGNED status for this Unit Head's law
- **My Inspections:** UNIT_IN_PROGRESS, UNIT_COMPLETED_COMPLIANT, UNIT_COMPLETED_NON_COMPLIANT assigned to this Unit Head
- **Forwarded:** MONITORING_ASSIGNED, MONITORING_IN_PROGRESS for this Unit Head's law
- **Review:** MONITORING_COMPLETED_COMPLIANT, MONITORING_COMPLETED_NON_COMPLIANT, UNIT_REVIEWED for this Unit Head's law
- **Compliance:** Final status inspections (UNIT_COMPLETED_COMPLIANT, UNIT_COMPLETED_NON_COMPLIANT, UNIT_REVIEWED, SECTION_REVIEWED, DIVISION_REVIEWED, CLOSED_COMPLIANT, CLOSED_NON_COMPLIANT)

### **Monitoring Personnel Tab Filtering:**
- **Assigned:** MONITORING_ASSIGNED status assigned to this Monitoring Personnel
- **In Progress:** MONITORING_IN_PROGRESS status assigned to this Monitoring Personnel
- **Completed:** MONITORING_COMPLETED_COMPLIANT, MONITORING_COMPLETED_NON_COMPLIANT, UNIT_REVIEWED, SECTION_REVIEWED, DIVISION_REVIEWED, CLOSED_COMPLIANT, CLOSED_NON_COMPLIANT assigned to this Monitoring Personnel

### **Legal Unit Tab Filtering:**
- **Legal Review:** LEGAL_REVIEW status
- **NOV Sent:** NOV_SENT status
- **NOO Sent:** NOO_SENT, CLOSED_NON_COMPLIANT statuses

---

## 🎯 Section 6: Review Page Button Matrix

### **Unit Head Review Actions:**
- **Statuses:** MONITORING_COMPLETED_COMPLIANT, MONITORING_COMPLETED_NON_COMPLIANT
- **Buttons:** Close, Approve & Forward
- **Actions:** Close (navigate back), Approve & Forward (approve_unit)

### **Section Chief Review Actions:**
- **Statuses:** UNIT_COMPLETED_COMPLIANT, UNIT_COMPLETED_NON_COMPLIANT, UNIT_REVIEWED, MONITORING_COMPLETED_COMPLIANT, MONITORING_COMPLETED_NON_COMPLIANT
- **Buttons:** Close, Approve & Forward
- **Actions:** Close (navigate back), Approve & Forward (approve_section)

### **Division Chief Review Actions:**
- **Statuses:** SECTION_COMPLETED_COMPLIANT, SECTION_REVIEWED (COMPLIANT)
- **Buttons:** Close, Mark as Compliant
- **Actions:** Close (navigate back), Mark as Compliant (mark_compliant)

- **Statuses:** SECTION_COMPLETED_NON_COMPLIANT (NON-COMPLIANT)
- **Buttons:** Close, Send to Legal
- **Actions:** Close (navigate back), Send to Legal (forward_legal)

### **Legal Unit Review Actions:**
- **Statuses:** LEGAL_REVIEW, NOV_SENT, NOO_SENT
- **Buttons:** Send NOV, Send NOO, Return to Division
- **Actions:** Send NOV (send_nov), Send NOO (send_noo), Return to Division (reject)

---

## 🎯 Section 7: Quick Reference Tables

### **Status → Tabs it Appears In (by Role)**

| Status | Division Chief | Section Chief | Unit Head | Monitoring Personnel | Legal Unit |
|--------|----------------|---------------|-----------|---------------------|------------|
| CREATED | all_inspections | - | - | - | - |
| SECTION_ASSIGNED | all_inspections | received | - | - | - |
| SECTION_IN_PROGRESS | all_inspections | my_inspections | - | - | - |
| SECTION_COMPLETED_COMPLIANT | all_inspections, review | compliance | - | - | - |
| SECTION_COMPLETED_NON_COMPLIANT | all_inspections, review | compliance | - | - | - |
| UNIT_ASSIGNED | all_inspections | forwarded | received | - | - |
| UNIT_IN_PROGRESS | all_inspections | forwarded | my_inspections | - | - |
| UNIT_COMPLETED_COMPLIANT | all_inspections | review | compliance | - | - |
| UNIT_COMPLETED_NON_COMPLIANT | all_inspections | review | compliance | - | - |
| MONITORING_ASSIGNED | all_inspections | forwarded | forwarded | assigned | - |
| MONITORING_IN_PROGRESS | all_inspections | forwarded | forwarded | in_progress | - |
| MONITORING_COMPLETED_COMPLIANT | all_inspections | review | review | completed | - |
| MONITORING_COMPLETED_NON_COMPLIANT | all_inspections | review | review | completed | - |
| UNIT_REVIEWED | all_inspections | review | compliance | completed | - |
| SECTION_REVIEWED | all_inspections, review | compliance | compliance | completed | - |
| DIVISION_REVIEWED | all_inspections, review | compliance | compliance | completed | - |
| LEGAL_REVIEW | all_inspections | compliance | compliance | completed | legal_review |
| NOV_SENT | all_inspections | compliance | compliance | completed | nov_sent |
| NOO_SENT | all_inspections | compliance | compliance | completed | noo_sent |
| CLOSED_COMPLIANT | all_inspections | compliance | compliance | completed | - |
| CLOSED_NON_COMPLIANT | all_inspections | compliance | compliance | completed | noo_sent |

### **Status → Available Actions (by Role)**

| Status | Division Chief | Section Chief | Unit Head | Monitoring Personnel | Legal Unit |
|--------|----------------|---------------|-----------|---------------------|------------|
| CREATED | assign_to_me, forward | - | - | - | - |
| SECTION_ASSIGNED | - | inspect, forward | - | - | - |
| SECTION_IN_PROGRESS | - | continue | - | - | - |
| SECTION_COMPLETED_COMPLIANT | review | - | - | - | - |
| SECTION_COMPLETED_NON_COMPLIANT | review | - | - | - | - |
| UNIT_ASSIGNED | - | - | inspect, forward | - | - |
| UNIT_IN_PROGRESS | - | - | continue, forward | - | - |
| UNIT_COMPLETED_COMPLIANT | - | review | - | - | - |
| UNIT_COMPLETED_NON_COMPLIANT | - | review | - | - | - |
| MONITORING_ASSIGNED | - | - | - | inspect | - |
| MONITORING_IN_PROGRESS | - | - | - | continue | - |
| MONITORING_COMPLETED_COMPLIANT | - | review | review | - | - |
| MONITORING_COMPLETED_NON_COMPLIANT | - | review | review | - | - |
| UNIT_REVIEWED | - | review | - | - | - |
| SECTION_REVIEWED | review | - | - | - | - |
| DIVISION_REVIEWED | review, send_to_legal, close | - | - | - | - |
| LEGAL_REVIEW | - | - | - | - | review, close |
| NOV_SENT | - | - | - | - | review, close |
| NOO_SENT | - | - | - | - | review, close |

### **Action → Form Mode Opened**

| Action | Form Mode | Component |
|--------|-----------|-----------|
| assign_to_me | None (API only) | - |
| inspect | Edit Mode | InspectionForm |
| continue | Edit Mode | InspectionForm |
| review | Review Mode | InspectionReviewPage |
| forward | Forward Modal | MonitoringPersonnelModal |
| send_to_legal | Review Mode | InspectionReviewPage |
| close | Review Mode | InspectionReviewPage |

### **Action → Next Status**

| Action | From Status | To Status |
|--------|-------------|-----------|
| inspect | SECTION_ASSIGNED | SECTION_IN_PROGRESS |
| inspect | UNIT_ASSIGNED | UNIT_IN_PROGRESS |
| inspect | MONITORING_ASSIGNED | MONITORING_IN_PROGRESS |
| continue | SECTION_IN_PROGRESS | SECTION_COMPLETED_COMPLIANT/NON_COMPLIANT |
| continue | UNIT_IN_PROGRESS | UNIT_COMPLETED_COMPLIANT/NON_COMPLIANT |
| continue | MONITORING_IN_PROGRESS | MONITORING_COMPLETED_COMPLIANT/NON_COMPLIANT |
| forward | SECTION_ASSIGNED | UNIT_ASSIGNED or MONITORING_ASSIGNED |
| forward | UNIT_ASSIGNED | MONITORING_ASSIGNED |
| send_to_legal | DIVISION_REVIEWED | LEGAL_REVIEW |
| close | DIVISION_REVIEWED | CLOSED_COMPLIANT |
| close | LEGAL_REVIEW | CLOSED_NON_COMPLIANT |
| close | NOV_SENT | CLOSED_NON_COMPLIANT |
| close | NOO_SENT | CLOSED_NON_COMPLIANT |

### **Status → Who Reviews Next**

| Status | Next Reviewer | Auto-Assignment |
|--------|---------------|-----------------|
| SECTION_COMPLETED_COMPLIANT | Division Chief | Yes |
| SECTION_COMPLETED_NON_COMPLIANT | Division Chief | Yes |
| UNIT_COMPLETED_COMPLIANT | Section Chief | Yes |
| UNIT_COMPLETED_NON_COMPLIANT | Section Chief | Yes |
| MONITORING_COMPLETED_COMPLIANT | Unit Head (or Section Chief if no Unit Head) | Yes |
| MONITORING_COMPLETED_NON_COMPLIANT | Unit Head (or Section Chief if no Unit Head) | Yes |
| UNIT_REVIEWED | Section Chief | Yes |
| SECTION_REVIEWED | Division Chief | Yes |
| DIVISION_REVIEWED | Division Chief (final decision) | No |
| LEGAL_REVIEW | Legal Unit | Yes |

---

## 🎯 Section 8: Visual Flowcharts

### **User Journey Flow**

```
Login → Role Detection → Tab Selection → Inspection List → Action Click → Form/Review → Status Change → Next Tab

┌─────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  Login  │───▶│ Role Detection│───▶│ Tab Selection│───▶│ Inspection List│
└─────────┘    └──────────────┘    └─────────────┘    └──────┬───────┘
                                                              │
                                                              ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│ Status Change│◀───│ Form/Review  │◀───│ Action Click│◀───│ Inspection  │
└──────┬──────┘    └──────────────┘    └─────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐
│  Next Tab   │
└─────────────┘
```

### **Decision Tree for Forwarding**

```
Section Chief Forward Decision
├── Unit Head Exists?
│   ├── Yes → Forward to Unit Head (UNIT_ASSIGNED)
│   └── No → Forward to Monitoring Personnel (MONITORING_ASSIGNED)
│
Unit Head Forward Decision
└── Always → Forward to Monitoring Personnel (MONITORING_ASSIGNED)
```

### **Review Chain Visualization**

```
Monitoring Personnel
        ↓ (completes)
MONITORING_COMPLETED_*
        ↓ (auto-assigned)
Unit Head (if exists) OR Section Chief (if no Unit Head)
        ↓ (reviews)
UNIT_REVIEWED (if Unit Head) OR SECTION_REVIEWED (if Section Chief)
        ↓ (auto-assigned)
Section Chief (if from Unit Head)
        ↓ (reviews)
SECTION_REVIEWED
        ↓ (auto-assigned)
Division Chief
        ↓ (reviews)
DIVISION_REVIEWED
        ↓ (final decision)
CLOSED_COMPLIANT OR LEGAL_REVIEW
```

---

## 🎯 Section 9: Inspection Form Actions Workflow

### **Form Header Actions (UnifiedInspectionHeader.jsx)**

The inspection form header contains various action buttons that change based on the user's role, inspection status, and form state:

#### **Back Button**
- **When Shown:** When `showBackButton` is true (typically in edit mode from review)
- **Action:** `onBack` - Navigate back to review page
- **Icon:** ArrowLeft
- **Color:** Gray (secondary action)

#### **Close Form Button**
- **When Shown:** When `showCloseButton` is true
- **Action:** `onClose` - Close the form and return to inspection list
- **Icon:** X
- **Color:** Gray (secondary action)

#### **Draft Button**
- **When Shown:** When `showDraftButton` is true
- **Action:** `onDraft` - Save form as draft without validation
- **Icon:** Save
- **Color:** Sky (primary action)
- **Backend:** `POST /inspections/{id}/auto_save/`

#### **Submit Button**
- **When Shown:** When `showSubmitButton` is true
- **Action:** `onSave` - Save form with validation and update status
- **Icon:** Send
- **Color:** Green (primary action)
- **Backend:** `POST /inspections/{id}/auto_save/` + `PUT /inspections/{id}/`

#### **Submit for Review Button**
- **When Shown:** When `showSubmitForReviewButton` is true
- **Action:** `onComplete` - Complete inspection and submit for review
- **Icon:** FileCheck
- **Color:** Green (primary action)
- **Backend:** `POST /inspections/{id}/complete/`

#### **Complete Button**
- **When Shown:** When `showCompleteButton` is true
- **Action:** `onComplete` - Complete inspection
- **Icon:** FileCheck
- **Color:** Green (primary action)
- **Backend:** `POST /inspections/{id}/complete/`

#### **Send to Section Button**
- **When Shown:** When `showSendToSectionButton` is true
- **Action:** `onSendToSection` - Send inspection to Section Chief
- **Icon:** UserCheck
- **Color:** Sky (primary action)
- **Backend:** `POST /inspections/{id}/send_to_section/`

#### **Send to Division Button**
- **When Shown:** When `showSendToDivisionButton` is true
- **Action:** `onSendToDivision` - Send inspection to Division Chief
- **Icon:** Users
- **Color:** Sky (primary action)
- **Backend:** `POST /inspections/{id}/send_to_division/`

#### **Review Form Button**
- **When Shown:** When `showReviewButton` is true
- **Action:** `onReview` - Navigate to review/preview page
- **Icon:** FileCheck
- **Color:** Sky (primary action)

### **Form Completion Workflow (InspectionForm.jsx)**

#### **handleSave() - Save with Validation**
1. **Validation Check:** Validates all form fields
2. **Compliance Determination:** Determines COMPLIANT/NON-COMPLIANT status
3. **Status Update:** Updates inspection status based on current status and compliance
4. **Backend Save:** Saves form data and status to backend
5. **Local Storage:** Clears local draft storage
6. **Success Notification:** Shows save confirmation

#### **handleComplete() - Complete Inspection**
1. **Compliance Confirmation:** Shows compliance decision dialog
2. **Auto-Generation:** Generates violations and findings summaries
3. **Role-Based Submission:** Determines submission path based on user role:
   - **Monitoring Personnel:** Submits to Unit Head
   - **Section Chief:** Submits to Division Chief
   - **Unit Head:** Submits to Section Chief
4. **Backend Complete:** Calls `completeInspection` API
5. **Status Transition:** Triggers status change and auto-assignment
6. **Navigation:** Returns to inspection list

#### **handleDraft() - Save as Draft**
1. **No Validation:** Saves without validation checks
2. **Local Storage:** Saves to localStorage for recovery
3. **Backend Draft:** Saves draft to backend
4. **No Status Change:** Maintains current status

---

## 🎯 Section 10: Review/Preview Page Actions Workflow

### **Review Page Header Actions (InspectionReviewPage.jsx)**

The review page header contains role-specific action buttons that change based on user role, inspection status, and compliance status:

#### **Unit Head Review Actions**
- **Statuses:** MONITORING_COMPLETED_COMPLIANT, MONITORING_COMPLETED_NON_COMPLIANT
- **Buttons:**
  - **Close:** Navigate back to inspection list
  - **Approve & Forward:** Approve and forward to Section Chief
- **Backend:** `POST /inspections/{id}/review_and_forward_unit/`

#### **Section Chief Review Actions**
- **Statuses:** UNIT_COMPLETED_COMPLIANT, UNIT_COMPLETED_NON_COMPLIANT, UNIT_REVIEWED, MONITORING_COMPLETED_COMPLIANT, MONITORING_COMPLETED_NON_COMPLIANT
- **Buttons:**
  - **Close:** Navigate back to inspection list
  - **Approve & Forward:** Approve and forward to Division Chief
- **Backend:** `POST /inspections/{id}/review_and_forward_section/`

#### **Division Chief Review Actions**
- **For COMPLIANT Inspections:**
  - **Statuses:** SECTION_COMPLETED_COMPLIANT, SECTION_REVIEWED (when compliance status is COMPLIANT)
  - **Buttons:**
    - **Close:** Navigate back to inspection list
    - **Mark as Compliant:** Close inspection as compliant
  - **Backend:** `POST /inspections/{id}/close/` with `final_status: 'CLOSED_COMPLIANT'`

- **For NON-COMPLIANT Inspections:**
  - **Statuses:** SECTION_COMPLETED_NON_COMPLIANT (when compliance status is NON-COMPLIANT)
  - **Buttons:**
    - **Close:** Navigate back to inspection list
    - **Send to Legal:** Forward to Legal Unit for enforcement
  - **Backend:** `POST /inspections/{id}/forward_to_legal/`

#### **Legal Unit Review Actions**
- **Statuses:** LEGAL_REVIEW, NOV_SENT, NOO_SENT
- **Buttons:**
  - **Send NOV:** Send Notice of Violation
  - **Send NOO:** Send Notice of Order
  - **Return to Division:** Return inspection to Division Chief
- **Backend Endpoints:**
  - `POST /inspections/{id}/send_nov/`
  - `POST /inspections/{id}/send_noo/`
  - `POST /inspections/{id}/return_to_division/`

### **Preview Mode Actions**
- **Mode:** `mode='preview'` (from URL parameter)
- **Button:** Save & Review
- **Action:** Save form data and navigate to review
- **Backend:** `POST /inspections/{id}/complete/`

### **Confirmation Dialog Actions**
All review actions show a confirmation dialog with:
- **Action-specific messages** explaining what will happen
- **Confirm button** to proceed with the action
- **Cancel button** to abort the action

---

## 🎯 Section 11: Complete Action-to-Form Flow

### **From Inspection List to Form Actions**

```
Inspection List Action → Form Mode → Available Form Actions → Review Actions

1. [Inspect] → Edit Mode → [Draft, Submit, Complete] → Review Mode
2. [Continue] → Edit Mode → [Draft, Submit, Complete] → Review Mode
3. [Review] → Review Mode → [Role-specific Review Actions]
4. [Forward] → Forward Modal → Status Change → Next Tab
```

### **Form Action Sequences**

#### **Sequence 1: New Inspection (Inspect Action)**
```
1. User clicks [Inspect] in inspection list
2. Opens Edit Mode (InspectionForm)
3. User fills form sections
4. User can click [Draft] to save progress
5. User clicks [Submit] to save with validation
6. User clicks [Complete] to finish inspection
7. Opens Preview Mode (InspectionReviewPage)
8. User clicks [Save & Review] to submit
9. Status changes, inspection moves to next tab
```

#### **Sequence 2: Continue Inspection (Continue Action)**
```
1. User clicks [Continue] in inspection list
2. Opens Edit Mode (InspectionForm) with saved data
3. User continues filling form sections
4. User can click [Draft] to save progress
5. User clicks [Submit] to save with validation
6. User clicks [Complete] to finish inspection
7. Opens Preview Mode (InspectionReviewPage)
8. User clicks [Save & Review] to submit
9. Status changes, inspection moves to next tab
```

#### **Sequence 3: Review Inspection (Review Action)**
```
1. User clicks [Review] in inspection list
2. Opens Review Mode (InspectionReviewPage)
3. User reviews inspection data
4. User clicks role-specific action button:
   - Unit Head: [Approve & Forward]
   - Section Chief: [Approve & Forward]
   - Division Chief: [Mark as Compliant] or [Send to Legal]
   - Legal Unit: [Send NOV], [Send NOO], or [Return to Division]
5. Confirmation dialog appears
6. User confirms action
7. Status changes, inspection moves to next tab
```

### **Form Validation and Error Handling**

#### **Validation Process:**
1. **Field Validation:** Each form section validates required fields
2. **Cross-Section Validation:** Validates relationships between sections
3. **Compliance Validation:** Ensures compliance decision is made
4. **Error Display:** Shows validation errors with specific messages
5. **Scroll to Errors:** Automatically scrolls to first error

#### **Error Recovery:**
1. **Draft Saving:** Users can save drafts even with validation errors
2. **Local Storage:** Form data is saved locally for recovery
3. **Auto-Save:** Form auto-saves periodically
4. **Session Recovery:** Users can recover unsaved work

---

## 🎯 Section 12: Action Button Visibility Matrix

### **Form Header Button Visibility Rules**

| User Role | Inspection Status | Show Draft | Show Submit | Show Complete | Show Review |
|-----------|------------------|------------|-------------|---------------|-------------|
| Section Chief | SECTION_IN_PROGRESS | ✓ | ✓ | ✓ | ✓ |
| Unit Head | UNIT_IN_PROGRESS | ✓ | ✓ | ✓ | ✓ |
| Monitoring Personnel | MONITORING_IN_PROGRESS | ✓ | ✓ | ✓ | ✓ |
| Division Chief | DIVISION_REVIEWED | - | - | - | ✓ |

### **Review Page Button Visibility Rules**

| User Role | Inspection Status | Compliance | Show Close | Show Approve | Show Mark Compliant | Show Send Legal |
|-----------|------------------|------------|------------|--------------|-------------------|-----------------|
| Unit Head | MONITORING_COMPLETED_* | Any | ✓ | ✓ | - | - |
| Section Chief | UNIT_COMPLETED_* | Any | ✓ | ✓ | - | - |
| Section Chief | MONITORING_COMPLETED_* | Any | ✓ | ✓ | - | - |
| Division Chief | SECTION_COMPLETED_COMPLIANT | COMPLIANT | ✓ | - | ✓ | - |
| Division Chief | SECTION_COMPLETED_NON_COMPLIANT | NON-COMPLIANT | ✓ | - | - | ✓ |
| Legal Unit | LEGAL_REVIEW | Any | - | - | - | - |
| Legal Unit | NOV_SENT | Any | - | - | - | - |
| Legal Unit | NOO_SENT | Any | - | - | - | - |

---

This comprehensive workflow guide provides the complete mapping of how inspections flow through the system, what users see in each tab, what actions are available at each stage, and what happens when each action is clicked. It covers all possible paths through the workflow, form modes, review processes, and detailed form and review page actions.
