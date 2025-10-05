# 🧪 Workflow Actions Testing Guide

This guide will help you test the frontend to backend integration for all inspection workflow actions.

## 📋 Prerequisites

1. **Backend Server Running**: Django server should be running on `http://127.0.0.1:8000`
2. **Frontend Server Running**: React dev server should be running on `http://localhost:5173` (or your configured port)
3. **Database**: MySQL database should be accessible and migrations applied
4. **Test User**: You should have a test user account with appropriate permissions

## 🚀 Testing Steps

### Step 1: Backend API Testing

First, let's test if the backend endpoints are working:

```bash
# Test backend endpoints
python test_backend_endpoints.py
```

**Expected Output:**
```
[10:30:15] INFO: Testing authentication...
[10:30:15] SUCCESS: ✅ Authentication successful
[10:30:15] SUCCESS: ✅ User profile: John Doe (Section Chief)
[10:30:15] INFO: Testing get inspections...
[10:30:15] SUCCESS: ✅ Found 5 inspections
[10:30:15] INFO: Testing available actions for inspection 1...
[10:30:15] SUCCESS: ✅ Available actions: ['assign_to_me', 'start', 'forward']
```

### Step 2: Frontend Integration Testing

#### Option A: Using the Test HTML Page

1. Open `test_workflow.html` in your browser
2. Click "Test Authentication" to verify login
3. Click "Load Inspections" to fetch inspections
4. Click "Test Actions" on any inspection to see available actions
5. Click individual action buttons to test them

#### Option B: Using Browser Console

1. Open your React app in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Copy and paste the content of `test_workflow_actions.js`
5. Run: `testWorkflow.runWorkflowTests()`

### Step 3: Manual Frontend Testing

1. **Login to your React app**
2. **Navigate to Inspections page**
3. **Test each role's workflow:**

#### 🧑‍💼 Division Chief Testing
- Create a new inspection using the wizard
- Verify it appears in "Created Inspections" tab
- Check "Tracking" tab for progress monitoring

#### 🧑‍🔧 Section Chief Testing
- Go to "Received Inspections" tab
- Test "Assign to Me" button
- Test "Start Inspection" button
- Test "Forward" button (should open ForwardModal)
- Complete an inspection and verify status change

#### 🧑‍🏭 Unit Head Testing
- Check "Received Inspections" for forwarded inspections
- Test "Assign to Me" and "Start Inspection"
- Complete inspections and verify forwarding to monitoring

#### 👷‍♂️ Monitoring Personnel Testing
- Check "Assigned Inspections" tab
- Start inspections and verify status change
- Complete inspections with compliance decisions
- Verify automatic forwarding to review

#### ⚖️ Legal Unit Testing
- Check "Legal Review" tab
- Test "Send NOV" and "Send NOO" actions
- Test "Close Case" action

## 🔍 What to Look For

### ✅ Success Indicators
- **API Calls**: Network tab shows successful POST requests to action endpoints
- **Status Updates**: Inspection status changes after actions
- **UI Feedback**: Loading spinners, success/error notifications
- **Button States**: Buttons show loading state during actions
- **Data Refresh**: Inspection list refreshes after actions

### ❌ Error Indicators
- **Network Errors**: Failed API calls in Network tab
- **Console Errors**: JavaScript errors in browser console
- **Permission Errors**: 403/401 errors from backend
- **Validation Errors**: 400 errors with validation messages
- **UI Issues**: Buttons not responding, no feedback

## 🐛 Common Issues & Solutions

### Issue 1: Authentication Failed
**Symptoms**: 401 Unauthorized errors
**Solution**: 
- Check if access token is valid
- Verify user has proper permissions
- Check if token is expired

### Issue 2: No Available Actions
**Symptoms**: Empty action buttons or "No actions available"
**Solution**:
- Check inspection status
- Verify user role permissions
- Check backend `available_actions` endpoint

### Issue 3: Action Buttons Not Working
**Symptoms**: Buttons don't respond to clicks
**Solution**:
- Check browser console for JavaScript errors
- Verify `useInspectionActions` hook is working
- Check if `handleAction` function is properly connected

### Issue 4: Forward Modal Not Opening
**Symptoms**: Forward button doesn't open modal
**Solution**:
- Check if `ForwardModal` component is imported
- Verify modal state management
- Check if `actionConfirmation` state is set correctly

## 📊 Test Results Checklist

- [ ] Backend authentication working
- [ ] Inspections can be fetched
- [ ] Available actions are returned correctly
- [ ] All workflow actions execute successfully
- [ ] Status updates after actions
- [ ] UI feedback (loading, success, error)
- [ ] ForwardModal opens for forward actions
- [ ] Error handling works properly
- [ ] Data refreshes after actions
- [ ] Role-based permissions working

## 🔧 Debugging Tips

1. **Check Network Tab**: Monitor API calls and responses
2. **Use Browser Console**: Look for JavaScript errors
3. **Check Django Logs**: Look for backend errors
4. **Verify Database**: Check if status changes are persisted
5. **Test with Different Users**: Verify role-based access

## 📝 Test Data

For testing, you can use these sample data:

```javascript
// Test data for complete action
{
  "remarks": "Test completion",
  "compliance_decision": "COMPLIANT"
}

// Test data for forward action
{
  "target": "monitoring",
  "remarks": "Test forward"
}

// Test data for send_nov action
{
  "violations": "Test violations found",
  "compliance_instructions": "Please address violations",
  "compliance_deadline": "2025-02-15",
  "remarks": "Test NOV"
}
```

## 🎯 Expected Workflow Flow

1. **Division Chief** creates inspection → `CREATED` → `SECTION_ASSIGNED`
2. **Section Chief** assigns/forwards → `SECTION_IN_PROGRESS` → `SECTION_COMPLETED`
3. **Unit Head** (if applicable) → `UNIT_ASSIGNED` → `UNIT_IN_PROGRESS` → `UNIT_COMPLETED`
4. **Monitoring Personnel** → `MONITORING_ASSIGNED` → `MONITORING_IN_PROGRESS` → `MONITORING_COMPLETED_*`
5. **Review Chain**: `UNIT_REVIEWED` → `SECTION_REVIEWED` → `DIVISION_REVIEWED`
6. **Legal Unit** (if non-compliant) → `LEGAL_REVIEW` → `NOV_SENT` → `NOO_SENT` → `CLOSED_*`

## 🚨 Emergency Debugging

If nothing works:

1. **Check Server Status**: `curl http://127.0.0.1:8000/api/`
2. **Check Database**: Verify inspections exist in database
3. **Check Permissions**: Verify user has correct role and permissions
4. **Check Logs**: Look at Django server logs for errors
5. **Reset State**: Clear browser cache and localStorage

---

**Happy Testing! 🎉**

If you encounter any issues, check the console logs and network requests for detailed error information.
