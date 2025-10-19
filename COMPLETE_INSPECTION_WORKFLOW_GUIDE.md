# Complete Inspection Workflow Guide
## Integrated Establishment Regulatory Management System (IERMS)

---

## 📋 **Table of Contents**
1. [Overview](#overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Complete Workflow from Division Chief Creation](#complete-workflow-from-division-chief-creation)
4. [Status Transitions & State Machine](#status-transitions--state-machine)
5. [Role-Based Tabs & Actions](#role-based-tabs--actions)
6. [Action Buttons & Their Functions](#action-buttons--their-functions)
7. [Inspection Form Components](#inspection-form-components)
8. [Review Process & Compliance Decisions](#review-process--compliance-decisions)
9. [Legal Workflow](#legal-workflow)
10. [API Endpoints & Backend Logic](#api-endpoints--backend-logic)

---

## 🎯 **Overview**

The IERMS inspection workflow is a comprehensive state machine that manages environmental compliance inspections from creation to closure. The system supports multiple user roles with specific permissions and workflows.

### **Key Features:**
- **Role-based access control** with specific tabs and actions
- **State machine workflow** with valid transitions
- **Auto-assignment** based on environmental laws and user roles
- **Compliance tracking** with detailed findings and recommendations
- **Legal enforcement** workflow for non-compliant cases
- **Real-time notifications** and status updates

---

## 👥 **User Roles & Permissions**

### **1. Division Chief**
- **Primary Role**: Creates inspections and makes final compliance decisions
- **Permissions**: Create, assign, review, close, forward to legal
- **Tabs**: All Inspections, Review

### **2. Section Chief**
- **Primary Role**: Manages section-level inspections and reviews unit work
- **Permissions**: Inspect, forward, review, approve
- **Tabs**: Received, My Inspections, Forwarded, Review, Compliance

### **3. Unit Head**
- **Primary Role**: Manages unit-level inspections and reviews monitoring work
- **Permissions**: Inspect, forward, review, approve
- **Tabs**: Received, My Inspections, Forwarded, Review, Compliance

### **4. Monitoring Personnel**
- **Primary Role**: Conducts field inspections and data collection
- **Permissions**: Inspect, continue, complete
- **Tabs**: Assigned, In Progress, Completed & Reviewed

### **5. Legal Unit**
- **Primary Role**: Handles enforcement actions for non-compliant cases
- **Permissions**: Review, send NOV/NOO, close
- **Tabs**: Legal Review, NOV Sent, NOO Sent

### **6. Admin**
- **Primary Role**: System administration and oversight
- **Permissions**: View all (read-only)
- **Tabs**: All Inspections

---

## 🚀 **Complete Workflow from Division Chief Creation**

### **Step 1: Division Chief Creates Inspection**

#### **1.1 Initial Creation Process**
```javascript
// Frontend: Division Chief clicks "Add Inspection" button
// Location: src/components/inspections/InspectionsList.jsx (line 1264-1271)

{userLevel === 'Division Chief' && (
  <button onClick={onAdd} className="flex items-center px-3 py-1 text-sm text-white rounded bg-sky-600 hover:bg-sky-700">
    <Plus size={16} /> Add Inspection
  </button>
)}
```

#### **1.2 Backend Processing**
```python
# Backend: server/inspections/serializers.py (lines 340-352)
# When Division Chief creates inspection:

if user and user.userlevel == 'Division Chief':
    inspection.current_status = 'SECTION_ASSIGNED'
    inspection.auto_assign_personnel()  # Auto-assigns to appropriate Section Chief
    inspection.save()
    
    # Log history
    InspectionHistory.objects.create(
        inspection=inspection,
        previous_status='CREATED',
        new_status='SECTION_ASSIGNED',
        changed_by=user,
        remarks='Inspection created and assigned to Section Chief'
    )
```

#### **1.3 Auto-Assignment Logic**
```python
# Backend: server/inspections/models.py
def auto_assign_personnel(self):
    """Auto-assign inspection to appropriate personnel based on law"""
    if self.law == 'PD-1586':
        # Assign to PD-1586 Section Chief
        section_chief = User.objects.filter(
            userlevel='Section Chief',
            section='PD-1586',
            is_active=True
        ).first()
    elif self.law == 'RA-8749':
        # Assign to RA-8749 Section Chief
        section_chief = User.objects.filter(
            userlevel='Section Chief',
            section='RA-8749',
            is_active=True
        ).first()
    elif self.law == 'RA-9275':
        # Assign to RA-9275 Section Chief
        section_chief = User.objects.filter(
            userlevel='Section Chief',
            section='RA-9275',
            is_active=True
        ).first()
    
    if section_chief:
        self.assigned_to = section_chief
        self.save()
```

### **Step 2: Section Chief Receives Assignment**

#### **2.1 Section Chief Tabs & Actions**
```javascript
// Frontend: src/constants/inspectionConstants.js (lines 51-55)
'Section Chief': ['received', 'my_inspections', 'forwarded', 'review', 'compliance']

// Available actions for Section Chief:
// - 'received' tab: ['inspect', 'forward'] for SECTION_ASSIGNED
// - 'my_inspections' tab: ['continue'] for SECTION_IN_PROGRESS
```

#### **2.2 Section Chief Actions**
```python
# Backend: server/inspections/serializers.py (lines 222-225)
('SECTION_ASSIGNED', 'Section Chief'): ['inspect', 'forward'],
('SECTION_IN_PROGRESS', 'Section Chief'): ['continue'],
```

**Section Chief can:**
1. **Inspect** → Starts inspection form, status becomes `SECTION_IN_PROGRESS`
2. **Forward** → Delegates to Unit Head or Monitoring Personnel
3. **Continue** → Resumes incomplete inspection

### **Step 3: Section Chief Conducts Inspection**

#### **3.1 Inspection Form Components**
```javascript
// Frontend: src/components/inspection-form/
// Main components:
- InspectionForm.jsx (79KB, 2189 lines) - Main form container
- GeneralInformation.jsx (36KB, 866 lines) - Basic establishment info
- PurposeOfInspection.jsx (14KB, 326 lines) - Inspection objectives
- SummaryOfCompliance.jsx (23KB, 515 lines) - Compliance findings
- SummaryOfFindingsAndObservations.jsx (15KB, 371 lines) - Detailed findings
- Recommendations.jsx (4.1KB, 116 lines) - Action recommendations
```

#### **3.2 Form Sections**
1. **General Information**
   - Establishment details
   - Contact information
   - Operating schedule
   - Environmental laws applicable

2. **Purpose of Inspection**
   - Verify accuracy of data
   - Determine compliance
   - Investigate complaints
   - Check commitment status

3. **DENR Permits & Licenses**
   - Permit numbers and dates
   - Expiry tracking
   - Compliance verification

4. **Summary of Compliance**
   - Law-by-law compliance items
   - Yes/No/N/A responses
   - Detailed remarks for non-compliance

5. **Findings & Observations**
   - System-by-system analysis
   - Compliance status per system
   - Detailed findings and observations

6. **Recommendations**
   - Action items for non-compliance
   - Priority levels
   - Implementation timelines

### **Step 4: Section Chief Completes Inspection**

#### **4.1 Completion Process**
```python
# Backend: server/inspections/views.py (lines 1005-1018)
if inspection.current_status == 'SECTION_IN_PROGRESS':
    # Section Chief completes inspection
    next_status = 'SECTION_COMPLETED_COMPLIANT' if compliance_decision == 'COMPLIANT' else 'SECTION_COMPLETED_NON_COMPLIANT'
```

#### **4.2 Auto-Assignment to Division Chief**
```python
# Backend: server/inspections/views.py (lines 1044+)
# After completion, auto-assign to Division Chief for review
if next_status in ['SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT']:
    inspection.assigned_to = inspection.created_by  # Division Chief
    inspection.save()
```

### **Step 5: Division Chief Review Process**

#### **5.1 Division Chief Review Tabs**
```javascript
// Frontend: src/constants/inspectionConstants.js (lines 50, 346-349)
'Division Chief': ['all_inspections', 'review']

review: [
  'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
  'SECTION_REVIEWED', 'DIVISION_REVIEWED'
]
```

#### **5.2 Division Chief Review Actions**
```javascript
// Frontend: src/pages/InspectionReviewPage.jsx (lines 348-396)
// For COMPLIANT inspections:
{(inspectionData?.current_status === 'SECTION_COMPLETED_COMPLIANT' || 
  inspectionData?.current_status === 'SECTION_REVIEWED') && 
  complianceStatus === 'COMPLIANT' && (
  <>
    <button onClick={() => navigate('/inspections')}>Close</button>
    <button onClick={() => handleActionClick('mark_compliant')}>Mark as Compliant</button>
  </>
)}

// For NON-COMPLIANT inspections:
{(inspectionData?.current_status === 'SECTION_COMPLETED_NON_COMPLIANT' || 
  complianceStatus === 'NON-COMPLIANT') && (
  <>
    <button onClick={() => navigate('/inspections')}>Close</button>
    <button onClick={() => handleActionClick('forward_legal')}>Send to Legal</button>
  </>
)}
```

#### **5.3 Division Chief Decision Points**
1. **Compliant Cases**: Mark as Compliant → `CLOSED_COMPLIANT`
2. **Non-Compliant Cases**: Send to Legal → `LEGAL_REVIEW`

---

## 🔄 **Status Transitions & State Machine**

### **Complete Status Flow**
```
CREATED
  ↓ (Division Chief creates)
SECTION_ASSIGNED
  ↓ (Section Chief inspects)
SECTION_IN_PROGRESS
  ↓ (Section Chief completes)
SECTION_COMPLETED_COMPLIANT / SECTION_COMPLETED_NON_COMPLIANT
  ↓ (Auto-assigned to Division Chief)
DIVISION_REVIEWED
  ↓ (Division Chief decision)
CLOSED_COMPLIANT / LEGAL_REVIEW
  ↓ (Legal Unit actions)
NOV_SENT / NOO_SENT / CLOSED_NON_COMPLIANT
```

### **Alternative Workflows**

#### **Section Chief → Unit Head → Monitoring**
```
SECTION_ASSIGNED
  ↓ (Section Chief forwards)
UNIT_ASSIGNED
  ↓ (Unit Head inspects)
UNIT_IN_PROGRESS
  ↓ (Unit Head completes)
UNIT_COMPLETED_COMPLIANT / UNIT_COMPLETED_NON_COMPLIANT
  ↓ (Unit Head forwards)
MONITORING_ASSIGNED
  ↓ (Monitoring Personnel inspects)
MONITORING_IN_PROGRESS
  ↓ (Monitoring Personnel completes)
MONITORING_COMPLETED_COMPLIANT / MONITORING_COMPLETED_NON_COMPLIANT
  ↓ (Auto-assigned to Unit Head)
UNIT_REVIEWED
  ↓ (Unit Head forwards to Section Chief)
SECTION_REVIEWED
  ↓ (Section Chief forwards to Division Chief)
DIVISION_REVIEWED
  ↓ (Division Chief decision)
CLOSED_COMPLIANT / LEGAL_REVIEW
```

#### **Direct Section Chief → Monitoring**
```
SECTION_ASSIGNED
  ↓ (Section Chief forwards directly)
MONITORING_ASSIGNED
  ↓ (Monitoring Personnel inspects)
MONITORING_IN_PROGRESS
  ↓ (Monitoring Personnel completes)
MONITORING_COMPLETED_COMPLIANT / MONITORING_COMPLETED_NON_COMPLIANT
  ↓ (Auto-assigned to Unit Head)
UNIT_REVIEWED
  ↓ (Unit Head forwards to Section Chief)
SECTION_REVIEWED
  ↓ (Section Chief forwards to Division Chief)
DIVISION_REVIEWED
  ↓ (Division Chief decision)
CLOSED_COMPLIANT / LEGAL_REVIEW
```

---

## 📊 **Role-Based Tabs & Actions**

### **Division Chief Tabs**
```javascript
// src/constants/inspectionConstants.js (line 50)
'Division Chief': ['all_inspections', 'review']

// Tab filtering logic in backend:
// server/inspections/views.py
def _filter_division_chief(self, queryset, user, tab):
    if tab == 'all_inspections':
        queryset = queryset.filter(created_by=user)
    elif tab == 'review':
        queryset = queryset.filter(
            current_status__in=[
                'SECTION_COMPLETED_COMPLIANT',
                'SECTION_COMPLETED_NON_COMPLIANT',
                'SECTION_REVIEWED',
                'DIVISION_REVIEWED'
            ]
        )
```

### **Section Chief Tabs**
```javascript
// src/constants/inspectionConstants.js (line 51)
'Section Chief': ['received', 'my_inspections', 'forwarded', 'review', 'compliance']

// Backend filtering:
def _filter_section_chief(self, queryset, user, tab):
    law_filter = Q(law=user.section)
    
    if tab == 'received':
        return queryset.filter(law_filter, current_status='SECTION_ASSIGNED')
    elif tab == 'my_inspections':
        return queryset.filter(
            law_filter,
            assigned_to=user,
            current_status__in=[
                'SECTION_IN_PROGRESS',
                'SECTION_COMPLETED_COMPLIANT',
                'SECTION_COMPLETED_NON_COMPLIANT'
            ]
        )
    elif tab == 'forwarded':
        return queryset.filter(
            law_filter,
            current_status__in=[
                'UNIT_ASSIGNED', 'UNIT_IN_PROGRESS',
                'MONITORING_ASSIGNED', 'MONITORING_IN_PROGRESS'
            ]
        )
    elif tab == 'review':
        return queryset.filter(
            law_filter,
            current_status__in=[
                'UNIT_COMPLETED_COMPLIANT', 'UNIT_COMPLETED_NON_COMPLIANT',
                'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
                'UNIT_REVIEWED'
            ]
        )
    elif tab == 'compliance':
        return queryset.filter(
            law_filter,
            current_status__in=[
                'SECTION_COMPLETED_COMPLIANT', 'SECTION_COMPLETED_NON_COMPLIANT',
                'SECTION_REVIEWED', 'DIVISION_REVIEWED', 'LEGAL_REVIEW',
                'NOV_SENT', 'NOO_SENT', 'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
            ]
        )
```

### **Unit Head Tabs**
```javascript
// src/constants/inspectionConstants.js (line 52)
'Unit Head': ['received', 'my_inspections', 'forwarded', 'review', 'compliance']

// Similar filtering logic with UNIT_* statuses
```

### **Monitoring Personnel Tabs**
```javascript
// src/constants/inspectionConstants.js (line 53)
'Monitoring Personnel': ['assigned', 'in_progress', 'completed']

// Backend filtering:
def _filter_monitoring_personnel(self, queryset, user, tab):
    if tab == 'assigned':
        return queryset.filter(
            assigned_monitoring=user,
            current_status='MONITORING_ASSIGNED'
        )
    elif tab == 'in_progress':
        return queryset.filter(
            assigned_monitoring=user,
            current_status='MONITORING_IN_PROGRESS'
        )
    elif tab == 'completed':
        return queryset.filter(
            assigned_monitoring=user,
            current_status__in=[
                'MONITORING_COMPLETED_COMPLIANT', 'MONITORING_COMPLETED_NON_COMPLIANT',
                'UNIT_REVIEWED', 'SECTION_REVIEWED', 'DIVISION_REVIEWED',
                'CLOSED_COMPLIANT', 'CLOSED_NON_COMPLIANT'
            ]
        )
```

### **Legal Unit Tabs**
```javascript
// src/constants/inspectionConstants.js (line 54)
'Legal Unit': ['legal_review', 'nov_sent', 'noo_sent']

// Backend filtering:
def _filter_legal_unit(self, queryset, user, tab):
    if tab == 'legal_review':
        return queryset.filter(current_status='LEGAL_REVIEW')
    elif tab == 'nov_sent':
        return queryset.filter(current_status='NOV_SENT')
    elif tab == 'noo_sent':
        return queryset.filter(
            current_status__in=['NOO_SENT', 'CLOSED_NON_COMPLIANT']
        )
```

---

## 🔘 **Action Buttons & Their Functions**

### **5-Button Strategy**
The system uses a simplified 5-button strategy for actions:

```javascript
// src/constants/inspectionConstants.js (lines 74-110)
export const actionButtonConfig = {
  assign_to_me: {
    label: 'Assign to Me',
    color: 'sky',
    icon: User
  },
  inspect: {
    label: 'Inspect',
    color: 'green',
    icon: Play
  },
  continue: {
    label: 'Continue',
    color: 'sky',
    icon: FileText
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

### **Action Mapping by Status & Role**
```python
# Backend: server/inspections/serializers.py (lines 217-248)
actions_map = {
    # Initial creation - Division Chief can assign to sections
    ('CREATED', 'Division Chief'): ['assign_to_me', 'forward'],
    
    # Section Chief workflow
    ('SECTION_ASSIGNED', 'Section Chief'): ['inspect', 'forward'],
    ('SECTION_IN_PROGRESS', 'Section Chief'): ['continue'],
    ('SECTION_COMPLETED_COMPLIANT', 'Division Chief'): ['review'],
    ('SECTION_COMPLETED_NON_COMPLIANT', 'Division Chief'): ['review'],
    
    # Unit Head workflow
    ('UNIT_ASSIGNED', 'Unit Head'): ['inspect', 'forward'],
    ('UNIT_IN_PROGRESS', 'Unit Head'): ['continue', 'forward'],
    ('UNIT_COMPLETED_COMPLIANT', 'Section Chief'): ['review'],
    ('UNIT_COMPLETED_NON_COMPLIANT', 'Section Chief'): ['review'],
    
    # Monitoring Personnel workflow
    ('MONITORING_ASSIGNED', 'Monitoring Personnel'): ['inspect'],
    ('MONITORING_IN_PROGRESS', 'Monitoring Personnel'): ['continue'],
    ('MONITORING_COMPLETED_COMPLIANT', 'Unit Head'): ['review'],
    ('MONITORING_COMPLETED_NON_COMPLIANT', 'Unit Head'): ['review'],
    
    # Review statuses
    ('UNIT_REVIEWED', 'Section Chief'): ['review'],
    ('SECTION_REVIEWED', 'Division Chief'): ['review'],
    ('DIVISION_REVIEWED', 'Division Chief'): ['review', 'send_to_legal', 'close'],
    
    # Legal Unit actions
    ('LEGAL_REVIEW', 'Legal Unit'): ['review', 'close'],
    ('NOV_SENT', 'Legal Unit'): ['review', 'close'],
    ('NOO_SENT', 'Legal Unit'): ['review', 'close'],
}
```

### **Action Handler Logic**
```javascript
// Frontend: src/components/inspections/InspectionsList.jsx (lines 596-634)
const handleActionClick = async (action, inspectionId, forwardData = null) => {
  // 1. "Assign to Me" button - Assign inspection to current user
  if (action === 'assign_to_me') {
    await handleAction('assign_to_me', inspectionId);
    notifications.success(`Inspection ${inspection.code} assigned to you`);
    return;
  }
  
  // 2. "Inspect" button - Start/continue inspection (navigate to form)
  if (action === 'inspect') {
    window.location.href = `/inspections/${inspectionId}/form`;
    return;
  }
  
  // 3. "Review" button - View completed work (navigate to review page)
  if (action === 'review') {
    window.location.href = `/inspections/${inspectionId}/review`;
    return;
  }
  
  // 4. "Forward" button - Delegate/send up (show monitoring modal or confirmation dialog)
  if (action === 'forward') {
    // Check if this requires monitoring personnel selection
    const isCombinedSection = currentUser?.section === 'PD-1586,RA-8749,RA-9275';
    
    if (userLevel === 'Section Chief' && isCombinedSection) {
      // Combined section forwards to Unit - show confirmation directly
      setActionConfirmation({ open: true, inspection, action });
    } else if (userLevel === 'Section Chief' || userLevel === 'Unit Head') {
      // Individual sections and Unit Head - show monitoring modal first
      setPendingForwardAction({ inspection, action, forwardData: { target: 'monitoring' } });
      setShowMonitoringModal(true);
    }
    return;
  }
  
  // 5. "Send to Legal" / "Close" buttons - Final actions (show confirmation dialog)
  if (action === 'send_to_legal' || action === 'close') {
    setActionConfirmation({ open: true, inspection, action });
    return;
  }
};
```

---

## 📝 **Inspection Form Components**

### **Main Form Structure**
```javascript
// src/components/inspection-form/InspectionForm.jsx (79KB, 2189 lines)
// Main form container with tabbed interface

const InspectionForm = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    general: {},
    purpose: {},
    permits: [],
    complianceItems: [],
    systems: [],
    recommendationState: {}
  });

  const tabs = [
    { id: 'general', label: 'General Information', component: GeneralInformation },
    { id: 'purpose', label: 'Purpose of Inspection', component: PurposeOfInspection },
    { id: 'permits', label: 'Permits & Licenses', component: PermitsSection },
    { id: 'compliance', label: 'Compliance Summary', component: SummaryOfCompliance },
    { id: 'findings', label: 'Findings & Observations', component: SummaryOfFindingsAndObservations },
    { id: 'recommendations', label: 'Recommendations', component: Recommendations }
  ];

  return (
    <div className="inspection-form">
      <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="form-content">
        {tabs.map(tab => (
          tab.id === activeTab && (
            <tab.component 
              key={tab.id}
              formData={formData}
              setFormData={setFormData}
              onNext={() => handleNextTab()}
              onPrevious={() => handlePreviousTab()}
            />
          )
        ))}
      </div>
    </div>
  );
};
```

### **Form Sections Detail**

#### **1. General Information**
```javascript
// src/components/inspection-form/GeneralInformation.jsx (36KB, 866 lines)
// Fields:
- Establishment name
- Address and coordinates
- Contact information
- Operating schedule
- Environmental laws applicable
- Year established
- Nature of business
- Inspection date & time
```

#### **2. Purpose of Inspection**
```javascript
// src/components/inspection-form/PurposeOfInspection.jsx (14KB, 326 lines)
// Options:
- Verify accuracy of data submitted
- Determine compliance with environmental laws
- Investigate complaints
- Check status of commitments from previous technical conference
- Other purpose (specify)
```

#### **3. Summary of Compliance**
```javascript
// src/components/inspection-form/SummaryOfCompliance.jsx (23KB, 515 lines)
// Dynamic compliance items based on selected environmental laws
// Each item has:
- Compliance requirement
- Yes/No/N/A response
- Detailed remarks for non-compliance
- Supporting documentation
```

#### **4. Findings & Observations**
```javascript
// src/components/inspection-form/SummaryOfFindingsAndObservations.jsx (15KB, 371 lines)
// System-by-system analysis:
- Air quality management system
- Water quality management system
- Waste management system
- Environmental monitoring system
- Each system has compliance status and detailed findings
```

#### **5. Recommendations**
```javascript
// src/components/inspection-form/Recommendations.jsx (4.1KB, 116 lines)
// Action items for non-compliance:
- Corrective action plans
- Implementation timelines
- Priority levels
- Additional recommendations
```

---

## 🔍 **Review Process & Compliance Decisions**

### **Review Page Structure**
```javascript
// src/pages/InspectionReviewPage.jsx (974 lines)
// Two modes:
// 1. Preview mode - Before submission
// 2. Review mode - After submission for review

const InspectionReviewPage = () => {
  const mode = urlParams.get('mode') || 'review';
  
  // Review mode shows role-specific action buttons
  if (mode === 'review') {
    // Show action buttons based on user role and inspection status
    return (
      <div>
        {/* Inspection report content */}
        {/* Role-specific action buttons */}
      </div>
    );
  }
  
  // Preview mode shows save & review button
  return (
    <div>
      {/* Inspection report content */}
      <button onClick={() => setShowConfirm(true)}>
        Save & Review
      </button>
    </div>
  );
};
```

### **Compliance Decision Logic**
```javascript
// Frontend: src/pages/InspectionReviewPage.jsx (lines 135-140)
const getComplianceStatus = () => {
  if (mode === 'preview' && location.state?.compliance) {
    return location.state.compliance;
  }
  return formData?.compliance_status || 'PENDING';
};

// Backend: server/inspections/views.py (lines 1003-1018)
compliance_decision = data.get('compliance_decision', 'COMPLIANT')

if inspection.current_status == 'SECTION_IN_PROGRESS':
    # Section Chief completes inspection
    next_status = 'SECTION_COMPLETED_COMPLIANT' if compliance_decision == 'COMPLIANT' else 'SECTION_COMPLETED_NON_COMPLIANT'
elif inspection.current_status == 'UNIT_IN_PROGRESS':
    # Unit Head completes inspection
    next_status = 'UNIT_COMPLETED_COMPLIANT' if compliance_decision == 'COMPLIANT' else 'UNIT_COMPLETED_NON_COMPLIANT'
elif inspection.current_status == 'MONITORING_IN_PROGRESS':
    # Monitoring Personnel completes inspection
    next_status = 'MONITORING_COMPLETED_COMPLIANT' if compliance_decision == 'COMPLIANT' else 'MONITORING_COMPLETED_NON_COMPLIANT'
```

### **Division Chief Review Actions**
```javascript
// Frontend: src/pages/InspectionReviewPage.jsx (lines 348-396)
// For COMPLIANT inspections:
{(inspectionData?.current_status === 'SECTION_COMPLETED_COMPLIANT' || 
  inspectionData?.current_status === 'SECTION_REVIEWED') && 
  complianceStatus === 'COMPLIANT' && (
  <>
    <button onClick={() => navigate('/inspections')}>Close</button>
    <button onClick={() => handleActionClick('mark_compliant')}>Mark as Compliant</button>
  </>
)}

// For NON-COMPLIANT inspections:
{(inspectionData?.current_status === 'SECTION_COMPLETED_NON_COMPLIANT' || 
  complianceStatus === 'NON-COMPLIANT') && (
  <>
    <button onClick={() => navigate('/inspections')}>Close</button>
    <button onClick={() => handleActionClick('forward_legal')}>Send to Legal</button>
  </>
)}
```

---

## ⚖️ **Legal Workflow**

### **Legal Unit Actions**
```python
# Backend: server/inspections/views.py (lines 1746-1789)
@action(detail=True, methods=['post'])
def forward_to_legal(self, request, pk=None):
    """Forward case to Legal Unit (Division Chief only)"""
    inspection = self.get_object()
    user = request.user
    
    # Check if Division Chief
    if user.userlevel != 'Division Chief':
        return Response(
            {'error': 'Only Division Chiefs can forward to Legal Unit'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Find Legal Unit user
    legal_user = User.objects.filter(userlevel='Legal Unit', is_active=True).first()
    if not legal_user:
        return Response(
            {'error': 'No Legal Unit personnel found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Transition
    prev_status = inspection.current_status
    inspection.current_status = 'LEGAL_REVIEW'
    inspection.assigned_to = legal_user
    inspection.save()
    
    # Log history
    InspectionHistory.objects.create(
        inspection=inspection,
        previous_status=prev_status,
        new_status='LEGAL_REVIEW',
        changed_by=user,
        remarks=request.data.get('remarks', 'Forwarded case to Legal Unit')
    )
```

### **Legal Unit Workflow**
```python
# Backend: server/inspections/views.py
# Legal Unit can perform:
# 1. Send NOV (Notice of Violation)
# 2. Send NOO (Notice of Order)
# 3. Close case as non-compliant

@action(detail=True, methods=['post'])
def send_nov(self, request, pk=None):
    """Send Notice of Violation"""
    inspection = self.get_object()
    user = request.user
    
    if user.userlevel != 'Legal Unit':
        return Response({'error': 'Only Legal Unit can send NOV'}, status=403)
    
    # Transition to NOV_SENT
    prev_status = inspection.current_status
    inspection.current_status = 'NOV_SENT'
    inspection.save()
    
    # Log history
    InspectionHistory.objects.create(
        inspection=inspection,
        previous_status=prev_status,
        new_status='NOV_SENT',
        changed_by=user,
        remarks=request.data.get('remarks', 'NOV sent to establishment')
    )

@action(detail=True, methods=['post'])
def send_noo(self, request, pk=None):
    """Send Notice of Order"""
    inspection = self.get_object()
    user = request.user
    
    if user.userlevel != 'Legal Unit':
        return Response({'error': 'Only Legal Unit can send NOO'}, status=403)
    
    # Transition to NOO_SENT
    prev_status = inspection.current_status
    inspection.current_status = 'NOO_SENT'
    inspection.save()
    
    # Log history
    InspectionHistory.objects.create(
        inspection=inspection,
        previous_status=prev_status,
        new_status='NOO_SENT',
        changed_by=user,
        remarks=request.data.get('remarks', 'NOO sent to establishment')
    )
```

---

## 🔌 **API Endpoints & Backend Logic**

### **Main ViewSet**
```python
# Backend: server/inspections/views.py
class InspectionViewSet(viewsets.ModelViewSet):
    """
    Complete Inspection ViewSet with workflow state machine
    """
    queryset = Inspection.objects.all()
    serializer_class = InspectionSerializer
    permission_classes = [IsAuthenticated]
    
    # Custom actions:
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Complete inspection and transition to next status"""
    
    @action(detail=True, methods=['post'])
    def forward_to_legal(self, request, pk=None):
        """Forward case to Legal Unit"""
    
    @action(detail=True, methods=['post'])
    def send_nov(self, request, pk=None):
        """Send Notice of Violation"""
    
    @action(detail=True, methods=['post'])
    def send_noo(self, request, pk=None):
        """Send Notice of Order"""
    
    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close inspection"""
    
    @action(detail=True, methods=['post'])
    def auto_save(self, request, pk=None):
        """Auto-save inspection form"""
```

### **URL Configuration**
```python
# Backend: server/inspections/urls.py
router = DefaultRouter()
router.register(r'inspections', InspectionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    # Additional endpoints:
    path('api/inspections/<int:pk>/complete/', InspectionViewSet.as_view({'post': 'complete'})),
    path('api/inspections/<int:pk>/forward_to_legal/', InspectionViewSet.as_view({'post': 'forward_to_legal'})),
    path('api/inspections/<int:pk>/send_nov/', InspectionViewSet.as_view({'post': 'send_nov'})),
    path('api/inspections/<int:pk>/send_noo/', InspectionViewSet.as_view({'post': 'send_noo'})),
    path('api/inspections/<int:pk>/close/', InspectionViewSet.as_view({'post': 'close'})),
    path('api/inspections/<int:pk>/auto_save/', InspectionViewSet.as_view({'post': 'auto_save'})),
]
```

### **Frontend API Service**
```javascript
// Frontend: src/services/api.js
export const getInspections = async (params = {}) => {
  // Disable caching for inspections to ensure fresh data
  const res = await api.get("inspections/", { params });
  return res.data;
};

export const getInspection = async (id) => {
  const res = await api.get(`inspections/${id}/`);
  return res.data;
};

export const createInspection = async (data) => {
  const res = await api.post("inspections/", data);
  return res.data;
};

export const updateInspection = async (id, data) => {
  const res = await api.patch(`inspections/${id}/`, data);
  return res.data;
};

export const completeInspection = async (id, data) => {
  const res = await api.post(`inspections/${id}/complete/`, data);
  return res.data;
};

export const forwardToLegal = async (id, data) => {
  const res = await api.post(`inspections/${id}/forward_to_legal/`, data);
  return res.data;
};

export const sendNOV = async (id, data) => {
  const res = await api.post(`inspections/${id}/send_nov/`, data);
  return res.data;
};

export const sendNOO = async (id, data) => {
  const res = await api.post(`inspections/${id}/send_noo/`, data);
  return res.data;
};

export const closeInspection = async (id, data) => {
  const res = await api.post(`inspections/${id}/close/`, data);
  return res.data;
};
```

---

## 📊 **Data Models**

### **Inspection Model**
```python
# Backend: server/inspections/models.py
class Inspection(models.Model):
    # Core fields
    code = models.CharField(max_length=20, unique=True)
    law = models.CharField(max_length=50)  # PD-1586, RA-8749, RA-9275
    current_status = models.CharField(max_length=40, choices=STATUS_CHOICES)
    
    # Relationships
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_inspections')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_inspections')
    assigned_monitoring = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='monitoring_inspections')
    establishments = models.ManyToManyField(Establishment, related_name='inspections')
    
    # Form data
    form = models.OneToOneField(InspectionForm, on_delete=models.CASCADE, related_name='inspection')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Methods
    def auto_assign_personnel(self):
        """Auto-assign inspection to appropriate personnel based on law"""
    
    def can_transition_to(self, new_status, user):
        """Check if transition to new_status is valid"""
    
    def get_next_assignee(self, target_status):
        """Get next assignee for target status"""
```

### **InspectionForm Model**
```python
class InspectionForm(models.Model):
    inspection = models.OneToOneField(Inspection, on_delete=models.CASCADE, related_name='form')
    checklist = models.JSONField(default=dict)  # Form data
    compliance_status = models.CharField(max_length=20, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### **InspectionHistory Model**
```python
class InspectionHistory(models.Model):
    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, related_name='history')
    previous_status = models.CharField(max_length=40, null=True, blank=True)
    new_status = models.CharField(max_length=40)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    law = models.CharField(max_length=50, null=True, blank=True)
    section = models.CharField(max_length=50, null=True, blank=True)
    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 🔔 **Notifications & Real-time Updates**

### **Notification System**
```python
# Backend: server/notifications/models.py
class Notification(models.Model):
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    notification_type = models.CharField(max_length=50)  # new_inspection, status_change, etc.
    title = models.CharField(max_length=200)
    message = models.TextField()
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    related_object_type = models.CharField(max_length=50, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
```

### **Auto-Notifications**
```python
# Backend: server/inspections/serializers.py (lines 354-376)
# When Division Chief creates inspection:
if inspection.assigned_to:
    # Create system notification
    Notification.objects.create(
        recipient=inspection.assigned_to,
        sender=user,
        notification_type='new_inspection',
        title='New Inspection Assignment',
        message=f'You have been assigned inspection {inspection.code} for {establishment_list} under {inspection.law}. Please review and take action.'
    )
    
    # Send email notification
    try:
        send_inspection_assignment_notification(
            inspection.assigned_to.email,
            inspection.code,
            establishment_list,
            inspection.law
        )
    except Exception as e:
        logger.error(f'Failed to send email notification: {e}')
```

---

## 🎯 **Key Workflow Summary**

### **Complete Flow from Division Chief Creation:**

1. **Division Chief** creates inspection → `CREATED`
2. **Auto-assignment** to appropriate Section Chief → `SECTION_ASSIGNED`
3. **Section Chief** receives notification and can:
   - **Inspect** → `SECTION_IN_PROGRESS`
   - **Forward** to Unit Head → `UNIT_ASSIGNED`
   - **Forward** to Monitoring → `MONITORING_ASSIGNED`
4. **Section Chief** completes inspection → `SECTION_COMPLETED_COMPLIANT/NON_COMPLIANT`
5. **Auto-assignment** to Division Chief for review
6. **Division Chief** reviews and decides:
   - **Compliant** → `CLOSED_COMPLIANT`
   - **Non-Compliant** → `LEGAL_REVIEW`
7. **Legal Unit** handles enforcement:
   - **Send NOV** → `NOV_SENT`
   - **Send NOO** → `NOO_SENT`
   - **Close** → `CLOSED_NON_COMPLIANT`

### **Alternative Workflows:**
- **Section Chief → Unit Head → Monitoring** (3-level hierarchy)
- **Section Chief → Monitoring** (2-level hierarchy)
- **Direct Division Chief review** (1-level hierarchy)

### **Key Features:**
- **Role-based access control** with specific tabs and actions
- **Auto-assignment** based on environmental laws
- **State machine** with valid transitions
- **Real-time notifications** and status updates
- **Comprehensive form** with compliance tracking
- **Legal enforcement** workflow for non-compliance
- **Audit trail** with complete history tracking

---

This comprehensive workflow guide covers the complete inspection process from Division Chief creation to final closure, including all user roles, status transitions, action buttons, form components, and backend logic. The system is designed to be flexible, auditable, and user-friendly while maintaining strict compliance with environmental regulations.
