# Inspection Review Process & Legal Unit Workflow

## 🔄 **Complete Workflow Overview**

### **Phase 1: Initial Creation & Assignment**
```
📋 CREATED → 🏢 SECTION_ASSIGNED
```
- **Trigger**: Division Chief creates new inspection
- **Assignee**: Section Chief (auto-assigned based on law and district)

### **Phase 2: Section Chief Workflow**
```
🏢 SECTION_ASSIGNED → ⚙️ SECTION_IN_PROGRESS → ✅❌ SECTION_COMPLETED_COMPLIANT/NON_COMPLIANT
```
- **Actions Available**:
  - `assign_to_me` - Assign inspection to themselves
  - `inspect` - Start working on inspection (if assigned)
  - `forward` - Forward to Unit Head or Monitoring Personnel
  - `continue` - Continue working on inspection
  - `complete` - Complete inspection with compliant/non-compliant status

### **Phase 3: Unit Head Workflow**
```
👥 UNIT_ASSIGNED → 🔧 UNIT_IN_PROGRESS → ✅❌ UNIT_COMPLETED_COMPLIANT/NON_COMPLIANT
```
- **Actions Available**:
  - `assign_to_me` - Assign inspection to themselves
  - `inspect` - Start working on inspection (if assigned)
  - `forward` - Forward directly to Monitoring Personnel
  - `continue` - Continue working on inspection
  - `complete` - Complete inspection with compliant/non-compliant status

### **Phase 4: Monitoring Personnel Workflow**
```
👨‍💼 MONITORING_ASSIGNED → 🔍 MONITORING_IN_PROGRESS → ✅❌ MONITORING_COMPLETED_COMPLIANT/NON_COMPLIANT
```
- **Actions Available**:
  - `start` - Start field inspection
  - `continue` - Continue field inspection
  - `complete` - Complete field inspection with compliant/non-compliant status
  - `review` - Review completed inspection (if assigned)

---

## 📋 **REVIEW PROCESS WORKFLOW**

### **Phase 5: Review Chain (Both Compliant & Non-Compliant Paths)**
```
MONITORING_COMPLETED → 📝 UNIT_REVIEWED → 📋 SECTION_REVIEWED → 🏛️ DIVISION_REVIEWED
```

#### **Step 1: Unit Review**
- **Status**: `MONITORING_COMPLETED_COMPLIANT/NON_COMPLIANT` → `UNIT_REVIEWED`
- **Actor**: Unit Head
- **Actions**: `review`
- **Responsibilities**:
  - Review monitoring personnel findings
  - Verify compliance assessment
  - Forward to Section Chief

#### **Step 2: Section Review**
- **Status**: `UNIT_REVIEWED` → `SECTION_REVIEWED`
- **Actor**: Section Chief
- **Actions**: `review`
- **Responsibilities**:
  - Review unit findings
  - Validate compliance decision
  - Forward to Division Chief

#### **Step 3: Division Review**
- **Status**: `SECTION_REVIEWED` → `DIVISION_REVIEWED`
- **Actor**: Division Chief
- **Actions**: `review`, `forward_to_legal`, `close`
- **Responsibilities**:
  - Final review of all findings
  - Decision point: Compliant or Non-Compliant
  - **If Compliant**: Close inspection (`CLOSED_COMPLIANT`)
  - **If Non-Compliant**: Forward to Legal Unit (`LEGAL_REVIEW`)

---

## ⚖️ **LEGAL UNIT WORKFLOW & MONITORING**

### **Phase 6: Legal Unit Actions (Non-Compliant Cases Only)**

#### **Legal Unit Tabs Available**:
- `legal_review` - Cases pending legal review
- `nov_sent` - Cases with Notice of Violation sent
- `noo_sent` - Cases with Notice of Order sent

#### **Legal Unit Actions & Workflow**:

##### **1. Legal Review Stage**
- **Status**: `LEGAL_REVIEW`
- **Actor**: Legal Unit
- **Available Actions**:
  - `send_nov` - Send Notice of Violation
  - `send_noo` - Send Notice of Order (skip NOV)
  - `close` - Close case without further action
- **Responsibilities**:
  - Review non-compliant findings
  - Determine appropriate legal action
  - Prepare violation documentation

##### **2. Notice of Violation (NOV) Stage**
- **Status**: `NOV_SENT`
- **Actor**: Legal Unit
- **Available Actions**:
  - `send_noo` - Send Notice of Order (escalation)
  - `close` - Close case after NOV
- **Responsibilities**:
  - Monitor establishment response to NOV
  - Track compliance deadlines
  - Decide on escalation to NOO if needed

##### **3. Notice of Order (NOO) Stage**
- **Status**: `NOO_SENT`
- **Actor**: Legal Unit
- **Available Actions**:
  - `close` - Close case after NOO
- **Responsibilities**:
  - Monitor establishment response to NOO
  - Track penalty payments
  - Final case closure

##### **4. Final Closure**
- **Status**: `CLOSED_NON_COMPLIANT`
- **Actor**: Legal Unit
- **Final Actions**: Case closed, no further actions

---

## 🎯 **Key Legal Unit Monitoring Features**

### **Action Button Configuration**:
- `send_nov` - Red with FileText icon (Notice of Violation)
- `send_noo` - Red with FileCheck icon (Notice of Order)
- `close` - Red with Lock icon (Close case)

### **Legal Unit Permissions**:
- **Exclusive Access**: Only Legal Unit can perform legal actions
- **Status Restrictions**: Can only act on `LEGAL_REVIEW`, `NOV_SENT`, `NOO_SENT` statuses
- **Data Requirements**: Must provide violation details, deadlines, penalties

### **Monitoring Capabilities**:
- **Real-time Status Tracking**: Monitor case progress through legal stages
- **Deadline Management**: Track compliance deadlines and payment due dates
- **Document Management**: Handle NOV and NOO documentation
- **Case History**: Complete audit trail of all legal actions

---

## 📊 **Workflow Status Summary**

### **Review Process Statuses**:
- `UNIT_REVIEWED` - Unit Head reviewed monitoring findings
- `SECTION_REVIEWED` - Section Chief reviewed unit findings  
- `DIVISION_REVIEWED` - Division Chief made final review decision

### **Legal Process Statuses**:
- `LEGAL_REVIEW` - Legal Unit reviewing non-compliant case
- `NOV_SENT` - Notice of Violation sent to establishment
- `NOO_SENT` - Notice of Order sent to establishment
- `CLOSED_NON_COMPLIANT` - Case closed after legal action

### **Final Statuses**:
- `CLOSED_COMPLIANT` - Case closed as compliant (no legal action needed)
- `CLOSED_NON_COMPLIANT` - Case closed after legal enforcement

---

## 🔄 **Alternative Workflow Paths**

### **Skip Options Available**:
1. **Section Chief** can skip directly to:
   - `UNIT_ASSIGNED` (skip section work)
   - `MONITORING_ASSIGNED` (skip both section and unit)

2. **Unit Head** can skip directly to:
   - `MONITORING_ASSIGNED` (skip unit work)

3. **Division Chief** can close compliant cases directly from `DIVISION_REVIEWED`

4. **Legal Unit** can skip NOV and go directly to NOO if warranted

---

## 🎯 **Monitoring & Review Best Practices**

### **Review Process**:
- Each level reviews the previous level's work
- Compliance decision is validated at each stage
- Clear audit trail maintained throughout

### **Legal Unit Monitoring**:
- Track all legal actions and deadlines
- Monitor establishment responses
- Maintain complete documentation
- Ensure proper escalation procedures

### **Status Visibility**:
- Real-time status updates
- Clear action buttons for each user level
- Comprehensive history logging
- Automated notifications for status changes
