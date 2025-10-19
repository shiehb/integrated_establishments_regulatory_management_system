# Inspection Hierarchy & Role Workflow
## Division Chief → Section Chief → Unit Head → Monitoring Personnel

---

## 🏢 **Organizational Hierarchy**

```
                    DIVISION CHIEF
                         │
                         │ Creates & Manages
                         │ All Inspections
                         │
                    ┌────┴────┐
                    │         │
              SECTION CHIEF   SECTION CHIEF   SECTION CHIEF
              (PD-1586)      (RA-8749)      (RA-9275)
                    │         │         │
                    │         │         │
                    │    ┌────┴────┐   │
                    │    │         │   │
                    │ UNIT HEAD  UNIT HEAD │
                    │ (PD-1586)  (RA-8749) │
                    │    │         │   │
                    │    │         │   │
                    └────┼─────────┼───┘
                         │         │
                    ┌────┴─────────┴────┐
                    │                   │
              MONITORING PERSONNEL  MONITORING PERSONNEL
              (PD-1586)            (RA-8749)
                    │                   │
                    │                   │
              MONITORING PERSONNEL  MONITORING PERSONNEL
              (RA-9275)            (Combined)
```

---

## 📋 **Role Responsibilities & Permissions**

### **1. DIVISION CHIEF** 🏛️
**Level**: Top Management  
**Primary Role**: Strategic oversight and final decision making

#### **Responsibilities:**
- ✅ **Create new inspections** for establishments
- ✅ **Assign inspections** to appropriate Section Chiefs
- ✅ **Review completed inspections** from Section Chiefs
- ✅ **Make final compliance decisions** (Compliant/Non-Compliant)
- ✅ **Forward non-compliant cases** to Legal Unit
- ✅ **Close compliant cases** as CLOSED_COMPLIANT

#### **Available Actions:**
- `assign_to_me` - Assign inspection to self
- `forward` - Forward to Section Chief
- `review` - Review completed inspections
- `send_to_legal` - Forward to Legal Unit
- `close` - Close inspection

#### **Tabs:**
- **All Inspections** - View all inspections created by them
- **Review** - Inspections pending their review

---

### **2. SECTION CHIEF** 👨‍💼
**Level**: Middle Management  
**Primary Role**: Section-level coordination and review

#### **Responsibilities:**
- ✅ **Receive assigned inspections** from Division Chief
- ✅ **Conduct inspections** or delegate to Unit Head/Monitoring
- ✅ **Review Unit Head work** and forward to Division Chief
- ✅ **Manage section workflow** and personnel assignments
- ✅ **Ensure compliance** with environmental laws

#### **Available Actions:**
- `inspect` - Start inspection process
- `continue` - Resume incomplete inspection
- `forward` - Delegate to Unit Head or Monitoring Personnel
- `review` - Review completed work from subordinates

#### **Tabs:**
- **Received** - New assignments from Division Chief
- **My Inspections** - Inspections currently assigned to them
- **Forwarded** - Inspections delegated to subordinates
- **Review** - Inspections pending their review
- **Compliance** - Completed inspections for compliance tracking

---

### **3. UNIT HEAD** 👨‍🔬
**Level**: Technical Supervision  
**Primary Role**: Technical oversight and field coordination

#### **Responsibilities:**
- ✅ **Receive assigned inspections** from Section Chief
- ✅ **Conduct technical inspections** or delegate to Monitoring Personnel
- ✅ **Review Monitoring Personnel work** and forward to Section Chief
- ✅ **Provide technical expertise** and guidance
- ✅ **Ensure quality** of inspection work

#### **Available Actions:**
- `inspect` - Start inspection process
- `continue` - Resume incomplete inspection
- `forward` - Delegate to Monitoring Personnel
- `review` - Review completed work from Monitoring Personnel

#### **Tabs:**
- **Received** - New assignments from Section Chief
- **My Inspections** - Inspections currently assigned to them
- **Forwarded** - Inspections delegated to Monitoring Personnel
- **Review** - Inspections pending their review
- **Compliance** - Completed inspections for compliance tracking

---

### **4. MONITORING PERSONNEL** 🔍
**Level**: Field Operations  
**Primary Role**: Field inspection and data collection

#### **Responsibilities:**
- ✅ **Receive assigned inspections** from Unit Head or Section Chief
- ✅ **Conduct field inspections** and collect data
- ✅ **Complete inspection forms** with findings
- ✅ **Submit completed work** for review
- ✅ **Provide detailed findings** and observations

#### **Available Actions:**
- `inspect` - Start field inspection
- `continue` - Resume incomplete inspection

#### **Tabs:**
- **Assigned** - New assignments to conduct
- **In Progress** - Inspections currently being conducted
- **Completed & Reviewed** - Completed inspections and their review status

---

## 🔄 **Complete Workflow Process**

### **Workflow Path 1: Full Hierarchy (Recommended)**
```
DIVISION CHIEF
     │ Creates Inspection
     ▼
SECTION CHIEF (Auto-assigned)
     │ Receives & Reviews
     ▼
UNIT HEAD (Forwarded)
     │ Technical Review
     ▼
MONITORING PERSONNEL (Assigned)
     │ Field Inspection
     ▼
UNIT HEAD (Review)
     │ Approve & Forward
     ▼
SECTION CHIEF (Review)
     │ Approve & Forward
     ▼
DIVISION CHIEF (Final Review)
     │ Decision: Compliant/Non-Compliant
     ▼
LEGAL UNIT (if Non-Compliant) OR CLOSED (if Compliant)
```

### **Workflow Path 2: Section Chief → Monitoring (Direct)**
```
DIVISION CHIEF
     │ Creates Inspection
     ▼
SECTION CHIEF (Auto-assigned)
     │ Receives & Reviews
     ▼
MONITORING PERSONNEL (Direct Assignment)
     │ Field Inspection
     ▼
UNIT HEAD (Auto-assigned for Review)
     │ Approve & Forward
     ▼
SECTION CHIEF (Review)
     │ Approve & Forward
     ▼
DIVISION CHIEF (Final Review)
     │ Decision: Compliant/Non-Compliant
     ▼
LEGAL UNIT (if Non-Compliant) OR CLOSED (if Compliant)
```

### **Workflow Path 3: Section Chief Direct Completion**
```
DIVISION CHIEF
     │ Creates Inspection
     ▼
SECTION CHIEF (Auto-assigned)
     │ Conducts Inspection Directly
     ▼
DIVISION CHIEF (Auto-assigned for Review)
     │ Decision: Compliant/Non-Compliant
     ▼
LEGAL UNIT (if Non-Compliant) OR CLOSED (if Compliant)
```

---

## 📊 **Status Transitions & State Machine**

### **Status Flow Diagram:**
```
CREATED
  │ (Division Chief creates)
  ▼
SECTION_ASSIGNED
  │ (Auto-assigned to Section Chief)
  ▼
SECTION_IN_PROGRESS
  │ (Section Chief starts inspection)
  ▼
SECTION_COMPLETED_COMPLIANT/NON_COMPLIANT
  │ (Section Chief completes)
  ▼
DIVISION_REVIEWED
  │ (Auto-assigned to Division Chief)
  ▼
CLOSED_COMPLIANT OR LEGAL_REVIEW
```

### **Alternative Paths:**

#### **Path A: Section → Unit → Monitoring**
```
SECTION_ASSIGNED → SECTION_IN_PROGRESS → UNIT_ASSIGNED → UNIT_IN_PROGRESS → 
MONITORING_ASSIGNED → MONITORING_IN_PROGRESS → MONITORING_COMPLETED_* → 
UNIT_REVIEWED → SECTION_REVIEWED → DIVISION_REVIEWED → CLOSED_*
```

#### **Path B: Section → Monitoring (Direct)**
```
SECTION_ASSIGNED → SECTION_IN_PROGRESS → MONITORING_ASSIGNED → 
MONITORING_IN_PROGRESS → MONITORING_COMPLETED_* → UNIT_REVIEWED → 
SECTION_REVIEWED → DIVISION_REVIEWED → CLOSED_*
```

---

## 🎯 **Action Button Matrix**

| User Role | Status | Available Actions | Button Labels |
|-----------|--------|-------------------|---------------|
| **Division Chief** | CREATED | assign_to_me, forward | "Assign to Me", "Forward" |
| **Division Chief** | SECTION_COMPLETED_* | review | "Review" |
| **Division Chief** | DIVISION_REVIEWED | review, send_to_legal, close | "Review", "Send to Legal", "Close" |
| **Section Chief** | SECTION_ASSIGNED | inspect, forward | "Inspect", "Forward" |
| **Section Chief** | SECTION_IN_PROGRESS | continue | "Continue" |
| **Section Chief** | UNIT_COMPLETED_* | review | "Review" |
| **Section Chief** | UNIT_REVIEWED | review | "Review" |
| **Unit Head** | UNIT_ASSIGNED | inspect, forward | "Inspect", "Forward" |
| **Unit Head** | UNIT_IN_PROGRESS | continue, forward | "Continue", "Forward" |
| **Unit Head** | MONITORING_COMPLETED_* | review | "Review" |
| **Monitoring Personnel** | MONITORING_ASSIGNED | inspect | "Inspect" |
| **Monitoring Personnel** | MONITORING_IN_PROGRESS | continue | "Continue" |

---

## 🔐 **Permission Matrix**

| Action | Division Chief | Section Chief | Unit Head | Monitoring Personnel |
|--------|----------------|---------------|-----------|---------------------|
| **Create Inspection** | ✅ | ❌ | ❌ | ❌ |
| **Assign to Me** | ✅ | ✅ | ✅ | ❌ |
| **Inspect** | ❌ | ✅ | ✅ | ✅ |
| **Continue** | ❌ | ✅ | ✅ | ✅ |
| **Forward** | ✅ | ✅ | ✅ | ❌ |
| **Review** | ✅ | ✅ | ✅ | ❌ |
| **Send to Legal** | ✅ | ❌ | ❌ | ❌ |
| **Close** | ✅ | ❌ | ❌ | ❌ |

---

## 📱 **Tab Configuration by Role**

### **Division Chief Tabs:**
```javascript
'Division Chief': ['all_inspections', 'review']
```
- **All Inspections**: All inspections created by Division Chief
- **Review**: Inspections pending Division Chief review

### **Section Chief Tabs:**
```javascript
'Section Chief': ['received', 'my_inspections', 'forwarded', 'review', 'compliance']
```
- **Received**: New assignments from Division Chief
- **My Inspections**: Inspections assigned to Section Chief
- **Forwarded**: Inspections delegated to Unit Head/Monitoring
- **Review**: Inspections pending Section Chief review
- **Compliance**: Completed inspections for tracking

### **Unit Head Tabs:**
```javascript
'Unit Head': ['received', 'my_inspections', 'forwarded', 'review', 'compliance']
```
- **Received**: New assignments from Section Chief
- **My Inspections**: Inspections assigned to Unit Head
- **Forwarded**: Inspections delegated to Monitoring Personnel
- **Review**: Inspections pending Unit Head review
- **Compliance**: Completed inspections for tracking

### **Monitoring Personnel Tabs:**
```javascript
'Monitoring Personnel': ['assigned', 'in_progress', 'completed']
```
- **Assigned**: New assignments to conduct
- **In Progress**: Inspections currently being conducted
- **Completed & Reviewed**: Completed inspections and review status

---

## 🚀 **Workflow Examples**

### **Example 1: Standard Inspection Flow**
1. **Division Chief** creates inspection for "ABC Manufacturing"
2. **System** auto-assigns to Section Chief (PD-1586)
3. **Section Chief** receives notification, reviews, and forwards to Unit Head
4. **Unit Head** receives assignment, conducts technical review, forwards to Monitoring Personnel
5. **Monitoring Personnel** conducts field inspection, completes form
6. **System** auto-assigns back to Unit Head for review
7. **Unit Head** reviews, approves, and forwards to Section Chief
8. **Section Chief** reviews, approves, and forwards to Division Chief
9. **Division Chief** makes final decision: Compliant → CLOSED_COMPLIANT

### **Example 2: Non-Compliant Case**
1. **Division Chief** creates inspection for "XYZ Chemical Plant"
2. **Section Chief** conducts inspection, finds violations
3. **Section Chief** completes as NON_COMPLIANT
4. **System** auto-assigns to Division Chief
5. **Division Chief** reviews findings, forwards to Legal Unit
6. **Legal Unit** sends NOV (Notice of Violation)
7. **Legal Unit** sends NOO (Notice of Order)
8. **Legal Unit** closes as CLOSED_NON_COMPLIANT

### **Example 3: Direct Section Chief Inspection**
1. **Division Chief** creates inspection for "Small Retail Store"
2. **Section Chief** receives assignment
3. **Section Chief** conducts inspection directly (no delegation)
4. **Section Chief** completes as COMPLIANT
5. **System** auto-assigns to Division Chief
6. **Division Chief** reviews and closes as CLOSED_COMPLIANT

---

## 🔧 **Technical Implementation**

### **Auto-Assignment Logic:**
```python
def auto_assign_personnel(self):
    """Auto-assign inspection to appropriate personnel based on law"""
    if self.law == 'PD-1586':
        section_chief = User.objects.filter(
            userlevel='Section Chief',
            section='PD-1586',
            is_active=True
        ).first()
    elif self.law == 'RA-8749':
        section_chief = User.objects.filter(
            userlevel='Section Chief',
            section='RA-8749',
            is_active=True
        ).first()
    elif self.law == 'RA-9275':
        section_chief = User.objects.filter(
            userlevel='Section Chief',
            section='RA-9275',
            is_active=True
        ).first()
    
    if section_chief:
        self.assigned_to = section_chief
        self.current_status = 'SECTION_ASSIGNED'
        self.save()
```

### **Status Transition Validation:**
```python
def can_transition_to(self, new_status, user):
    """Check if transition to new_status is valid for the current state and user"""
    valid_transitions = {
        'SECTION_ASSIGNED': {
            'SECTION_IN_PROGRESS': ['Section Chief'],
            'UNIT_ASSIGNED': ['Section Chief'],
            'MONITORING_ASSIGNED': ['Section Chief'],
        },
        'SECTION_COMPLETED_COMPLIANT': {
            'DIVISION_REVIEWED': ['Division Chief'],
        },
        'MONITORING_COMPLETED_COMPLIANT': {
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
        }
    }
    
    allowed = valid_transitions.get(self.current_status, {})
    return new_status in allowed and user.userlevel in allowed[new_status]
```

---

## 📈 **Key Performance Indicators (KPIs)**

### **Division Chief KPIs:**
- Total inspections created
- Average review time
- Compliance rate (Compliant vs Non-Compliant)
- Legal referrals made

### **Section Chief KPIs:**
- Inspections received and processed
- Delegation efficiency
- Review turnaround time
- Team productivity

### **Unit Head KPIs:**
- Technical review quality
- Monitoring Personnel guidance
- Review completion rate
- Field coordination effectiveness

### **Monitoring Personnel KPIs:**
- Inspections completed
- Field work quality
- Form completion accuracy
- Timeliness of submissions

---

## 🎯 **Best Practices**

### **For Division Chief:**
- Create inspections with clear objectives
- Review completed work promptly
- Make consistent compliance decisions
- Maintain oversight of all cases

### **For Section Chief:**
- Delegate appropriately based on complexity
- Provide clear instructions to subordinates
- Review work thoroughly before forwarding
- Maintain section productivity

### **For Unit Head:**
- Provide technical guidance to Monitoring Personnel
- Ensure quality of field work
- Review findings comprehensively
- Support team development

### **For Monitoring Personnel:**
- Conduct thorough field inspections
- Complete forms accurately and completely
- Submit work on time
- Follow safety protocols

---

This hierarchy and workflow ensures proper oversight, quality control, and efficient processing of environmental compliance inspections from creation to closure. Each role has clear responsibilities and appropriate permissions to maintain the integrity of the inspection process.
