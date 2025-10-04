# Inspection Workflow Testing Guide

## Overview
This guide provides comprehensive testing scenarios for the refactored inspection workflow system. The system now implements structured workflows with proper auto-assignment, compliance tracking, and legal unit integration.

## Prerequisites

### 1. Apply Database Migration
Before testing, apply the database migration:
```bash
cd server
python manage.py migrate inspections
```

### 2. Create Test Users
Ensure you have test users for each role:
- **Division Chief**: Creates inspections
- **Section Chief**: Has 3 tabs (Created Inspections, My Inspections, Forwarded List)
- **Unit Head**: Has 3 tabs (Received from Section, My Inspections, Forwarded List)
- **Monitoring Personnel**: Single list with compliance decisions
- **Legal Unit**: Reviews non-compliant cases

### 3. Set Up Test Data
- Create establishments in different districts
- Ensure users are assigned to appropriate districts and sections
- Set up monitoring personnel with district + law matching

## Testing Scenarios

### Scenario 1: Complete Compliant Workflow

#### Step 1: Division Chief Creates Inspection
1. **Login as Division Chief**
2. **Navigate to Inspections**
3. **Create New Inspection**:
   - Select establishment in a specific district
   - Choose law/section (e.g., PD-1586 for EIA)
   - Fill inspection details
4. **Verify**: Status should be `DIVISION_CREATED`
5. **Forward to Section Chief**:
   - Use "Forward" action
   - Status should change to `SECTION_REVIEW`

#### Step 2: Section Chief Review
1. **Login as Section Chief**
2. **Check Tab 1: Created Inspections**
   - Should see the inspection from Division Chief
   - Verify it's assigned to the correct Section Chief
3. **Make Decision**:
   - **Option A**: Click "Inspect" → Status becomes `SECTION_INSPECTING`
   - **Option B**: Click "Forward to Unit Head" (if Unit Head exists) → Status becomes `UNIT_REVIEW`
   - **Option C**: Click "Forward to Monitoring" (if no Unit Head) → Status becomes `MONITORING_ASSIGN`

#### Step 3: Unit Head Review (if applicable)
1. **Login as Unit Head**
2. **Check Tab 1: Received from Section**
   - Should see inspection forwarded from Section Chief
3. **Make Decision**:
   - Click "Inspect" → Status becomes `UNIT_INSPECTING`
   - Click "Forward to Monitoring" → Status becomes `MONITORING_ASSIGN`

#### Step 4: Monitoring Personnel Inspection
1. **Login as Monitoring Personnel**
2. **Check Assigned Inspections**
   - Should see inspection assigned based on district + law matching
3. **Start Inspection**:
   - Click "Inspect" to begin
4. **Complete Inspection**:
   - Click "Complete Inspection"
   - **Mark as Compliant**:
     - Select "Compliant" status
     - Add compliance notes
     - Submit
5. **Verify**: Status should become `COMPLETED` with `compliance_status = 'COMPLIANT'`

#### Step 5: Return Path (Compliant)
1. **Check Section Chief Tab 3: Forwarded List**
   - Should see inspection returned
2. **Check Unit Head Tab 3: Forwarded List** (if applicable)
   - Should see inspection returned
3. **Final Status**: Inspection should be `COMPLETED` and closed

### Scenario 2: Non-Compliant Workflow with Legal Review

#### Steps 1-3: Same as Scenario 1 (Division Chief → Section Chief → Unit Head)

#### Step 4: Monitoring Personnel Inspection (Non-Compliant)
1. **Login as Monitoring Personnel**
2. **Complete Inspection**:
   - Click "Complete Inspection"
   - **Mark as Non-Compliant**:
     - Select "Non-Compliant" status
     - **Required**: Describe violations found
     - Add compliance notes
     - Submit
3. **Verify**: Status should become `COMPLETED` with `compliance_status = 'NON_COMPLIANT'`

#### Step 5: Legal Unit Review
1. **Login as Legal Unit**
2. **Check Legal Review List**
   - Should see non-compliant inspection
3. **Review Case**:
   - Review violations and compliance notes
   - Create Notice of Violation (NOV)
   - Set compliance deadline
   - Add legal unit comments
4. **Take Action**:
   - If establishment complies → Close case
   - If not → Send Notice of Order (NOO) with penalties

### Scenario 3: Auto-Assignment Testing

#### Test District + Law Matching
1. **Create Multiple Monitoring Personnel**:
   - Person A: District "La Union - 1st District", Law "PD-1586"
   - Person B: District "La Union - 2nd District", Law "PD-1586"
   - Person C: District "La Union - 1st District", Law "RA-8749"

2. **Create Inspection**:
   - Establishment in "La Union - 1st District"
   - Law "PD-1586"

3. **Verify Auto-Assignment**:
   - Should be assigned to Person A (matches both district and law)
   - Should NOT be assigned to Person B (different district)
   - Should NOT be assigned to Person C (different law)

### Scenario 4: Tab Structure Testing

#### Section Chief Tabs
1. **Tab 1: Created Inspections**
   - Should show inspections from Division Chief
   - Status: `SECTION_REVIEW`, `section_chief_decision = null`

2. **Tab 2: My Inspections**
   - Should show inspections where Section Chief clicked "Inspect"
   - Status: `SECTION_INSPECTING` or `COMPLETED`
   - `section_chief_decision = 'INSPECT'`

3. **Tab 3: Forwarded List**
   - Should show inspections forwarded to Unit Head/Monitoring
   - `section_chief_decision = 'FORWARD_TO_UNIT'` or `'FORWARD_TO_MONITORING'`

#### Unit Head Tabs
1. **Tab 1: Received from Section**
   - Should show inspections from Section Chief
   - Status: `UNIT_REVIEW`, `unit_head_decision = null`

2. **Tab 2: My Inspections**
   - Should show inspections where Unit Head clicked "Inspect"
   - Status: `UNIT_INSPECTING` or `COMPLETED`
   - `unit_head_decision = 'INSPECT'`

3. **Tab 3: Forwarded List**
   - Should show inspections forwarded to Monitoring
   - `unit_head_decision = 'FORWARD_TO_MONITORING'`

### Scenario 5: Forward Rules Testing

#### Test Unit Head Existence Logic
1. **Create Section Chief for Law "PD-1586"**
2. **Create Inspection with Law "PD-1586"**
3. **Test Case A: Unit Head Exists**
   - Create Unit Head for "PD-1586"
   - Section Chief should see "Forward to Unit Head" option
   - Forward should set status to `UNIT_REVIEW`

4. **Test Case B: No Unit Head**
   - Delete Unit Head for "PD-1586"
   - Section Chief should see "Forward to Monitoring" option
   - Forward should set status to `MONITORING_ASSIGN`

### Scenario 6: API Endpoint Testing

#### Test New API Endpoints
1. **Tab Counts API**:
   ```bash
   GET /api/inspections/tab_counts/
   ```
   - Should return tab counts for current user

2. **Workflow Decision API**:
   ```bash
   POST /api/inspections/{id}/make_decision/
   {
     "action": "INSPECT",
     "comments": "Starting inspection"
   }
   ```

3. **Tab-Based Filtering**:
   ```bash
   GET /api/inspections/?tab=created_inspections
   GET /api/inspections/?tab=my_inspections
   GET /api/inspections/?tab=forwarded_list
   ```

## Expected Behaviors

### Auto-Assignment Rules
- **Section Chief**: Assigned based on section, prioritized by district
- **Unit Head**: Only for EIA, Air, Water sections (PD-1586, RA-8749, RA-9275)
- **Monitoring Personnel**: Must match both district AND law/section

### Forward Rules
- **If Unit Head exists**: Section Chief → Unit Head (UNIT_REVIEW)
- **If no Unit Head**: Section Chief → Monitoring Personnel (MONITORING_ASSIGN)
- **Unit Head**: Always forwards to Monitoring Personnel

### Compliance Return Paths
- **Compliant**: Monitoring → Unit Head → Section Chief → Division Chief (Final Close)
- **Non-Compliant**: Monitoring → Unit Head → Section Chief → Division Chief → Legal Unit

### Status Flow
```
DIVISION_CREATED → SECTION_REVIEW → SECTION_INSPECTING
                                    ↓
UNIT_REVIEW → UNIT_INSPECTING → MONITORING_ASSIGN → MONITORING_INSPECTION
                                    ↓
COMPLETED (Compliant) → Final Close
COMPLETED (Non-Compliant) → LEGAL_REVIEW → COMPLETED
```

## Troubleshooting

### Common Issues
1. **Migration Errors**: Ensure all dependencies are met before applying migration
2. **Auto-Assignment Failures**: Check user district and section assignments
3. **Tab Count Issues**: Verify API endpoint permissions and user authentication
4. **Workflow Decision Errors**: Check action choices and user permissions

### Debug Steps
1. Check Django logs for errors
2. Verify database schema matches model definitions
3. Test API endpoints individually
4. Check user permissions and assignments
5. Verify frontend component integration

## Success Criteria

### Functional Requirements
- ✅ All user levels can access appropriate tabs
- ✅ Auto-assignment works based on district + law matching
- ✅ Forward rules work correctly (Unit Head existence check)
- ✅ Compliance tracking captures violations and notes
- ✅ Legal Unit receives non-compliant cases
- ✅ Return paths work for both compliant and non-compliant cases

### Performance Requirements
- ✅ API responses are under 2 seconds
- ✅ Tab switching is smooth and responsive
- ✅ Auto-assignment completes within 1 second
- ✅ Database queries are optimized

### User Experience Requirements
- ✅ Clear tab organization and descriptions
- ✅ Intuitive workflow actions
- ✅ Proper error handling and user feedback
- ✅ Responsive design for different screen sizes

## Next Steps After Testing

1. **Fix Any Issues**: Address any bugs or problems found during testing
2. **Performance Optimization**: Optimize slow queries or API calls
3. **User Training**: Provide training on new workflow and tab structure
4. **Documentation**: Update user manuals and system documentation
5. **Production Deployment**: Deploy to production environment
6. **Monitoring**: Set up monitoring for workflow performance and errors
