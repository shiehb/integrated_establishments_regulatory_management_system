# Inspection Form Review Workflow Implementation

## 🎯 **Implemented Review Process**

### **Complete Workflow Integration**

The inspection form now includes a comprehensive review workflow with the following features:

### **1. Review Tab Integration**
- **Review Tab**: Users can click the "Review" button in the review tab to open the inspection form
- **Form Access**: Review button opens the inspection form with appropriate review controls
- **Status-Based Access**: Different user levels see different review options based on inspection status

### **2. Review Workflow Buttons**

#### **Close Form Button**
- **Always Visible**: Available in all statuses
- **Function**: Closes the form and returns to inspections list
- **Color**: Gray background

#### **Review & Send to * Button**
- **Visibility**: 
  - Unit Head in `UNIT_REVIEWED` status
  - Section Chief in `SECTION_REVIEWED` status  
  - Division Chief in `DIVISION_REVIEWED` status
- **Function**: Reviews inspection and forwards to next level
- **Color**: Blue background
- **Workflow**: 
  - Unit Head → Section Chief
  - Section Chief → Division Chief
  - Division Chief → Final decision

#### **Send to Legal Button**
- **Visibility**: Division Chief in `DIVISION_REVIEWED` status
- **Function**: Forwards non-compliant cases to Legal Unit
- **Color**: Orange background
- **Condition**: Only for non-compliant inspections

#### **Close Form Button (Finalize)**
- **Visibility**: Division Chief in `DIVISION_REVIEWED` status
- **Function**: Closes compliant cases without legal action
- **Color**: Dark gray background
- **Condition**: Only for compliant inspections

---

## 🔄 **Complete Review Workflow**

### **Phase 1: Monitoring Completion**
```
MONITORING_IN_PROGRESS → MONITORING_COMPLETED_COMPLIANT/NON_COMPLIANT
```
- **Action**: "Submit for Review" button
- **Result**: Inspection moves to `UNIT_REVIEWED` status

### **Phase 2: Unit Head Review**
```
MONITORING_COMPLETED → UNIT_REVIEWED
```
- **Review Tab**: Unit Head clicks "Review" button
- **Form Access**: Opens inspection form with review controls
- **Action**: "Review & Send to *" button
- **Result**: Moves to `SECTION_REVIEWED` status

### **Phase 3: Section Chief Review**
```
UNIT_REVIEWED → SECTION_REVIEWED
```
- **Review Tab**: Section Chief clicks "Review" button
- **Form Access**: Opens inspection form with review controls
- **Action**: "Review & Send to *" button
- **Result**: Moves to `DIVISION_REVIEWED` status

### **Phase 4: Division Chief Review**
```
SECTION_REVIEWED → DIVISION_REVIEWED
```
- **Review Tab**: Division Chief clicks "Review" button
- **Form Access**: Opens inspection form with review controls
- **Actions Available**:
  - **"Review & Send to *"**: For general review completion
  - **"Send to Legal"**: For non-compliant cases → `LEGAL_REVIEW`
  - **"Close Form"**: For compliant cases → `CLOSED_COMPLIANT`

---

## ⚖️ **Legal Unit Workflow**

### **Legal Unit Actions (from Legal Unit tabs)**
- **Legal Review Tab**: Cases in `LEGAL_REVIEW` status
- **NOV Sent Tab**: Cases in `NOV_SENT` status
- **NOO Sent Tab**: Cases in `NOO_SENT` status

### **Legal Unit Actions**:
1. **Send NOV**: Notice of Violation
2. **Send NOO**: Notice of Order
3. **Close**: Close non-compliant case

---

## 🎯 **Button Logic Implementation**

### **Button Visibility Rules**:

```javascript
// Review Button - Shows for review workflow
showReviewButton: (userLevel === 'Unit Head' && status === 'UNIT_REVIEWED') ||
                 (userLevel === 'Section Chief' && status === 'SECTION_REVIEWED') ||
                 (userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED'),

// Forward to Legal Button - Only for Division Chief
showForwardToLegalButton: userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED',

// Finalize Button - Only for Division Chief
showFinalizeButton: userLevel === 'Division Chief' && status === 'DIVISION_REVIEWED',
```

### **Handler Functions**:

#### **handleReview()**
- Determines appropriate review action based on user level
- Calls `reviewInspection()` API with appropriate remarks
- Shows success notification and navigates back

#### **handleForwardToLegal()**
- Calls `forwardToLegal()` API
- Forwards non-compliant cases to Legal Unit
- Shows success notification and navigates back

#### **handleFinalize()**
- Saves recommendation and calls `reviewInspection()`
- Closes compliant cases
- Shows success notification and navigates back

---

## 📋 **Review Process Summary**

### **Complete Workflow**:
1. **Monitoring Personnel**: Completes inspection → `MONITORING_COMPLETED`
2. **Unit Head**: Reviews in form → "Review & Send to *" → `SECTION_REVIEWED`
3. **Section Chief**: Reviews in form → "Review & Send to *" → `DIVISION_REVIEWED`
4. **Division Chief**: Reviews in form → Decision:
   - **Compliant**: "Close Form" → `CLOSED_COMPLIANT`
   - **Non-Compliant**: "Send to Legal" → `LEGAL_REVIEW`
5. **Legal Unit**: Handles non-compliant cases → `NOV_SENT` → `NOO_SENT` → `CLOSED_NON_COMPLIANT`

### **Key Features**:
- ✅ **Review Tab Integration**: Review button opens form with appropriate controls
- ✅ **Status-Based Buttons**: Different buttons for different review stages
- ✅ **Complete Workflow**: From monitoring completion to legal closure
- ✅ **User-Level Permissions**: Appropriate actions for each user level
- ✅ **Legal Unit Integration**: Full legal workflow for non-compliant cases
- ✅ **Form Access**: Review tab provides direct access to inspection form
- ✅ **Close Form**: Available in all statuses for form navigation

---

## 🔧 **Technical Implementation**

### **Components Updated**:
1. **InternalHeader.jsx**: Added review buttons and handlers
2. **InspectionForm.jsx**: Added review workflow logic and button visibility
3. **API Integration**: Added `forwardToLegal` import and usage

### **New Props Added**:
- `onReview`: Handler for review actions
- `onForwardToLegal`: Handler for legal forwarding
- `showReviewButton`: Visibility control for review button
- `showForwardToLegalButton`: Visibility control for legal button

### **API Calls**:
- `reviewInspection()`: For review workflow progression
- `forwardToLegal()`: For forwarding to legal unit
- `updateInspection()`: For saving recommendations

---

## 🎯 **User Experience**

### **Review Tab Workflow**:
1. User sees inspection in review tab
2. Clicks "Review" button
3. Opens inspection form with review controls
4. Reviews inspection data
5. Clicks appropriate action button:
   - "Review & Send to *" (for progression)
   - "Send to Legal" (for non-compliant)
   - "Close Form" (for compliant)
6. Form closes and returns to inspections list

### **Button Labels**:
- **"Review & Send to *"**: Indicates review and forwarding to next level
- **"Send to Legal"**: Clear indication of legal forwarding
- **"Close Form"**: Simple form closure
- **"Close Form"**: Available in all statuses for navigation

This implementation provides a complete, intuitive review workflow that integrates seamlessly with the existing inspection form and legal unit processes.
