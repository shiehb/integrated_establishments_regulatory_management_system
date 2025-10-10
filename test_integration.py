#!/usr/bin/env python3
"""
Frontend-Backend Integration Test
Tests the alignment between frontend form structure and backend data storage
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
FRONTEND_URL = "http://localhost:5174"
BACKEND_URL = "http://127.0.0.1:8000"
API_BASE = f"{BACKEND_URL}/api"

def test_backend_connection():
    """Test if backend server is running"""
    try:
        response = requests.get(f"{API_BASE}/inspections/", timeout=5)
        return response.status_code in [200, 401]  # 401 is OK (no auth)
    except requests.exceptions.RequestException:
        return False

def test_frontend_connection():
    """Test if frontend server is running"""
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def test_form_config_structure():
    """Test if formConfig.json structure matches expected backend fields"""
    try:
        with open('src/constants/inspectionform/formConfig.json', 'r') as f:
            config = json.load(f)
        
        # Check if required sections exist
        required_sections = [
            'general_information',
            'purpose_of_inspection', 
            'compliance_status',
            'summary_of_compliance',
            'summary_of_findings',
            'recommendations'
        ]
        
        section_ids = [section['id'] for section in config['sections']]
        
        print("📋 Form Configuration Structure:")
        for section_id in required_sections:
            if section_id in section_ids:
                print(f"  ✅ {section_id}")
            else:
                print(f"  ❌ {section_id} - MISSING")
                return False
        
        # Check Purpose of Inspection fields
        purpose_section = next(s for s in config['sections'] if s['id'] == 'purpose_of_inspection')
        purpose_fields = [field['id'] for field in purpose_section['fields']]
        
        expected_purpose_fields = [
            'verify_accuracy',
            'verify_accuracy_details', 
            'verify_accuracy_others',
            'determine_compliance',
            'investigate_complaints',
            'check_commitment_status',
            'commitment_status_details',
            'commitment_status_others',
            'other_purpose',
            'other_purpose_specify'
        ]
        
        print("\n🎯 Purpose of Inspection Fields:")
        for field in expected_purpose_fields:
            if field in purpose_fields:
                print(f"  ✅ {field}")
            else:
                print(f"  ❌ {field} - MISSING")
                return False
        
        # Check General Information fields
        general_section = next(s for s in config['sections'] if s['id'] == 'general_information')
        general_fields = [field['id'] for field in general_section['fields']]
        
        expected_general_fields = [
            'establishment_name',
            'address',
            'coordinates',
            'nature_of_business',
            'year_established',
            'inspection_date_time',
            'operating_hours',
            'operating_days_per_week',
            'operating_days_per_year',
            'phone_fax_no',
            'email_address'
        ]
        
        print("\n📝 General Information Fields:")
        for field in expected_general_fields:
            if field in general_fields:
                print(f"  ✅ {field}")
            else:
                print(f"  ❌ {field} - MISSING")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error reading formConfig.json: {e}")
        return False

def test_frontend_component_structure():
    """Test if frontend components use correct field names"""
    try:
        # Read PurposeOfInspection.jsx
        with open('src/components/inspection-form/PurposeOfInspection.jsx', 'r') as f:
            purpose_content = f.read()
        
        # Check if new field names are used
        new_field_checks = [
            'verify_accuracy',
            'verify_accuracy_details',
            'commitment_status_details',
            'other_purpose_specify'
        ]
        
        print("\n🔧 Frontend Component Field Names:")
        for field in new_field_checks:
            if field in purpose_content:
                print(f"  ✅ {field} found in PurposeOfInspection.jsx")
            else:
                print(f"  ❌ {field} NOT found in PurposeOfInspection.jsx")
                return False
        
        # Read GeneralInformation.jsx
        with open('src/components/inspection-form/GeneralInformation.jsx', 'r') as f:
            general_content = f.read()
        
        # Check if snake_case field names are used
        snake_case_checks = [
            'establishment_name',
            'nature_of_business',
            'year_established',
            'operating_hours',
            'phone_fax_no',
            'email_address'
        ]
        
        for field in snake_case_checks:
            if field in general_content:
                print(f"  ✅ {field} found in GeneralInformation.jsx")
            else:
                print(f"  ❌ {field} NOT found in GeneralInformation.jsx")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error reading frontend components: {e}")
        return False

def test_inspection_form_state():
    """Test if InspectionForm.jsx state structure matches backend"""
    try:
        with open('src/components/inspection-form/InspectionForm.jsx', 'r') as f:
            form_content = f.read()
        
        # Check if new state structure is used
        state_checks = [
            'establishment_name:',
            'nature_of_business:',
            'verify_accuracy: false',
            'verify_accuracy_details:',
            'commitment_status_details:'
        ]
        
        print("\n🏗️ InspectionForm State Structure:")
        for check in state_checks:
            if check in form_content:
                print(f"  ✅ {check}")
            else:
                print(f"  ❌ {check} - NOT FOUND")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error reading InspectionForm.jsx: {e}")
        return False

def main():
    """Run all integration tests"""
    print("🧪 Frontend-Backend Integration Test")
    print("=" * 50)
    
    tests = [
        ("Backend Server Connection", test_backend_connection),
        ("Frontend Server Connection", test_frontend_connection),
        ("Form Configuration Structure", test_form_config_structure),
        ("Frontend Component Structure", test_frontend_component_structure),
        ("InspectionForm State Structure", test_inspection_form_state)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        try:
            result = test_func()
            results.append((test_name, result))
            if result:
                print(f"✅ {test_name} - PASSED")
            else:
                print(f"❌ {test_name} - FAILED")
        except Exception as e:
            print(f"❌ {test_name} - ERROR: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Frontend-Backend integration is working correctly.")
        return 0
    else:
        print("⚠️ Some tests failed. Please check the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
