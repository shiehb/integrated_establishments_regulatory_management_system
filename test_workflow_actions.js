// Test script for workflow actions
// Run this in browser console or as a separate test file

const API_BASE = 'http://127.0.0.1:8000/api/';

// Test authentication first
async function testAuth() {
  try {
    const response = await fetch(`${API_BASE}auth/me/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ Authentication successful:', user);
      return user;
    } else {
      console.error('❌ Authentication failed:', response.status);
      return null;
    }
  } catch (error) {
    console.error('❌ Auth error:', error);
    return null;
  }
}

// Test getting inspections
async function testGetInspections() {
  try {
    const response = await fetch(`${API_BASE}inspections/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Get inspections successful:', data);
      return data.results || data;
    } else {
      console.error('❌ Get inspections failed:', response.status);
      return [];
    }
  } catch (error) {
    console.error('❌ Get inspections error:', error);
    return [];
  }
}

// Test getting available actions for an inspection
async function testGetAvailableActions(inspectionId) {
  try {
    const response = await fetch(`${API_BASE}inspections/${inspectionId}/available_actions/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Get available actions for inspection ${inspectionId}:`, data);
      return data;
    } else {
      console.error(`❌ Get available actions failed for inspection ${inspectionId}:`, response.status);
      return [];
    }
  } catch (error) {
    console.error(`❌ Get available actions error for inspection ${inspectionId}:`, error);
    return [];
  }
}

// Test workflow actions
async function testWorkflowAction(inspectionId, action, data = {}) {
  try {
    const response = await fetch(`${API_BASE}inspections/${inspectionId}/${action}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ ${action} action successful for inspection ${inspectionId}:`, result);
      return result;
    } else {
      const errorData = await response.json();
      console.error(`❌ ${action} action failed for inspection ${inspectionId}:`, response.status, errorData);
      return null;
    }
  } catch (error) {
    console.error(`❌ ${action} action error for inspection ${inspectionId}:`, error);
    return null;
  }
}

// Comprehensive test function
async function runWorkflowTests() {
  console.log('🚀 Starting Workflow Action Tests...');
  
  // Test 1: Authentication
  console.log('\n📋 Test 1: Authentication');
  const user = await testAuth();
  if (!user) {
    console.error('❌ Cannot proceed without authentication');
    return;
  }
  
  // Test 2: Get inspections
  console.log('\n📋 Test 2: Get Inspections');
  const inspections = await testGetInspections();
  if (inspections.length === 0) {
    console.log('⚠️ No inspections found. Create some inspections first.');
    return;
  }
  
  // Test 3: Get available actions for first inspection
  console.log('\n📋 Test 3: Get Available Actions');
  const firstInspection = inspections[0];
  const availableActions = await testGetAvailableActions(firstInspection.id);
  
  // Test 4: Test each available action
  console.log('\n📋 Test 4: Test Available Actions');
  for (const action of availableActions) {
    console.log(`\n🔧 Testing action: ${action}`);
    
    // Test data based on action type
    let testData = {};
    switch (action) {
      case 'complete':
        testData = {
          remarks: 'Test completion',
          compliance_decision: 'COMPLIANT'
        };
        break;
      case 'forward':
        testData = {
          target: 'monitoring',
          remarks: 'Test forward'
        };
        break;
      case 'review':
        testData = {
          remarks: 'Test review'
        };
        break;
      case 'send_nov':
        testData = {
          violations: 'Test violations',
          compliance_instructions: 'Test instructions',
          compliance_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          remarks: 'Test NOV'
        };
        break;
      case 'send_noo':
        testData = {
          penalty_fees: 'Test penalty',
          violation_breakdown: 'Test breakdown',
          payment_deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          remarks: 'Test NOO'
        };
        break;
      case 'close':
        testData = {
          remarks: 'Test close'
        };
        break;
    }
    
    await testWorkflowAction(firstInspection.id, action, testData);
    
    // Wait a bit between actions
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ Workflow tests completed!');
}

// Export functions for manual testing
window.testWorkflow = {
  testAuth,
  testGetInspections,
  testGetAvailableActions,
  testWorkflowAction,
  runWorkflowTests
};

console.log('🔧 Workflow test functions loaded. Run testWorkflow.runWorkflowTests() to start testing.');
