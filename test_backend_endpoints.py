#!/usr/bin/env python3
"""
Backend API Endpoints Test Script
Run this to test if all workflow action endpoints are working
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"
USERNAME = "admin"  # Change this to your test user
PASSWORD = "admin"  # Change this to your test password

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.user_info = None
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def authenticate(self):
        """Test authentication"""
        self.log("Testing authentication...")
        self.log(f"Using credentials: {USERNAME} / {'*' * len(PASSWORD)}")
        try:
            # Get token
            auth_response = self.session.post(f"{BASE_URL}/auth/token/", {
                "email": USERNAME,
                "password": PASSWORD
            })
            
            self.log(f"Auth response status: {auth_response.status_code}")
            
            if auth_response.status_code == 200:
                token_data = auth_response.json()
                self.access_token = token_data.get("access")
                self.session.headers.update({
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json"
                })
                self.log("✅ Authentication successful", "SUCCESS")
                
                # Get user profile
                profile_response = self.session.get(f"{BASE_URL}/auth/me/")
                self.log(f"Profile response status: {profile_response.status_code}")
                
                if profile_response.status_code == 200:
                    self.user_info = profile_response.json()
                    self.log(f"✅ User profile: {self.user_info.get('first_name')} {self.user_info.get('last_name')} ({self.user_info.get('userlevel')})", "SUCCESS")
                    return True
                else:
                    self.log(f"❌ Failed to get user profile: {profile_response.status_code}", "ERROR")
                    self.log(f"Profile response: {profile_response.text}", "ERROR")
                    return False
            else:
                self.log(f"❌ Authentication failed: {auth_response.status_code}", "ERROR")
                self.log(f"Response: {auth_response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Authentication error: {str(e)}", "ERROR")
            return False
    
    def get_inspections(self):
        """Test getting inspections"""
        self.log("Testing get inspections...")
        try:
            response = self.session.get(f"{BASE_URL}/inspections/")
            if response.status_code == 200:
                data = response.json()
                inspections = data.get("results", data)
                self.log(f"✅ Found {len(inspections)} inspections", "SUCCESS")
                return inspections
            else:
                self.log(f"❌ Failed to get inspections: {response.status_code}", "ERROR")
                return []
        except Exception as e:
            self.log(f"❌ Error getting inspections: {str(e)}", "ERROR")
            return []
    
    def get_available_actions(self, inspection_id):
        """Test getting available actions for an inspection"""
        self.log(f"Testing available actions for inspection {inspection_id}...")
        try:
            response = self.session.get(f"{BASE_URL}/inspections/{inspection_id}/available_actions/")
            if response.status_code == 200:
                actions = response.json()
                self.log(f"✅ Available actions: {actions}", "SUCCESS")
                return actions
            else:
                self.log(f"❌ Failed to get available actions: {response.status_code}", "ERROR")
                return []
        except Exception as e:
            self.log(f"❌ Error getting available actions: {str(e)}", "ERROR")
            return []
    
    def test_workflow_action(self, inspection_id, action, test_data=None):
        """Test a workflow action"""
        self.log(f"Testing action '{action}' on inspection {inspection_id}...")
        try:
            if test_data is None:
                test_data = self.get_test_data_for_action(action)
                
            response = self.session.post(
                f"{BASE_URL}/inspections/{inspection_id}/{action}/",
                json=test_data
            )
            
            if response.status_code == 200:
                result = response.json()
                self.log(f"✅ Action '{action}' successful", "SUCCESS")
                self.log(f"Response: {json.dumps(result, indent=2)}", "INFO")
                return True
            else:
                self.log(f"❌ Action '{action}' failed: {response.status_code}", "ERROR")
                try:
                    error_data = response.json()
                    self.log(f"Error details: {json.dumps(error_data, indent=2)}", "ERROR")
                except:
                    self.log(f"Error response: {response.text}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"❌ Error testing action '{action}': {str(e)}", "ERROR")
            return False
    
    def get_test_data_for_action(self, action):
        """Get test data for different actions"""
        base_date = datetime.now()
        
        test_data = {
            'assign_to_me': {},
            'start': {},
            'complete': {
                'remarks': 'Test completion via backend test',
                'compliance_decision': 'COMPLIANT'
            },
            'forward': {
                'target': 'monitoring',
                'remarks': 'Test forward via backend test'
            },
            'review': {
                'remarks': 'Test review via backend test'
            },
            'forward_to_legal': {
                'remarks': 'Test forward to legal via backend test'
            },
            'send_nov': {
                'violations': 'Test violations found',
                'compliance_instructions': 'Please address the violations',
                'compliance_deadline': (base_date + timedelta(days=30)).strftime('%Y-%m-%d'),
                'remarks': 'Test NOV sent via backend test'
            },
            'send_noo': {
                'penalty_fees': 'Test penalty fees',
                'violation_breakdown': 'Test violation breakdown',
                'payment_deadline': (base_date + timedelta(days=15)).strftime('%Y-%m-%d'),
                'remarks': 'Test NOO sent via backend test'
            },
            'close': {
                'remarks': 'Test close via backend test'
            }
        }
        
        return test_data.get(action, {})
    
    def run_comprehensive_test(self):
        """Run comprehensive backend tests"""
        self.log("🚀 Starting comprehensive backend tests...")
        
        # Test 1: Authentication
        if not self.authenticate():
            self.log("❌ Cannot proceed without authentication", "ERROR")
            return False
        
        # Test 2: Get inspections
        inspections = self.get_inspections()
        if not inspections:
            self.log("⚠️ No inspections found. Create some inspections first.", "WARNING")
            return True
        
        # Test 3: Test available actions for first inspection
        first_inspection = inspections[0]
        available_actions = self.get_available_actions(first_inspection['id'])
        
        if not available_actions:
            self.log("⚠️ No available actions found for the inspection", "WARNING")
            return True
        
        # Test 4: Test each available action
        self.log(f"Testing {len(available_actions)} available actions...")
        success_count = 0
        
        for action in available_actions:
            if self.test_workflow_action(first_inspection['id'], action):
                success_count += 1
        
        self.log(f"✅ Backend tests completed: {success_count}/{len(available_actions)} actions successful", "SUCCESS")
        return success_count == len(available_actions)

def main():
    print("🔧 Backend API Endpoints Test")
    print("=" * 50)
    
    tester = BackendTester()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--help":
            print("Usage: python test_backend_endpoints.py [--help]")
            print("Make sure to update USERNAME and PASSWORD in the script")
            return
        elif sys.argv[1] == "--auth-only":
            tester.authenticate()
            return
    
    success = tester.run_comprehensive_test()
    
    if success:
        print("\n✅ All backend tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Some backend tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
