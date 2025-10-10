#!/usr/bin/env python3
import requests
import json

print("🔧 Simple Backend Test")
print("=" * 30)

# Test basic connectivity
try:
    response = requests.get("http://127.0.0.1:8000/api/")
    print(f"✅ API endpoint accessible: {response.status_code}")
except Exception as e:
    print(f"❌ API endpoint not accessible: {e}")
    exit(1)

# Test authentication
try:
    auth_response = requests.post("http://127.0.0.1:8000/api/auth/token/", {
        "email": "admin",
        "password": "admin"
    })
    print(f"Auth response: {auth_response.status_code}")
    
    if auth_response.status_code == 200:
        token_data = auth_response.json()
        access_token = token_data.get("access")
        print(f"✅ Authentication successful")
        
        # Test getting inspections
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        inspections_response = requests.get("http://127.0.0.1:8000/api/inspections/", headers=headers)
        print(f"Inspections response: {inspections_response.status_code}")
        
        if inspections_response.status_code == 200:
            data = inspections_response.json()
            inspections = data.get("results", data)
            print(f"✅ Found {len(inspections)} inspections")
            
            if inspections:
                first_inspection = inspections[0]
                print(f"First inspection: {first_inspection.get('code')} - {first_inspection.get('current_status')}")
                
                # Test available actions
                actions_response = requests.get(f"http://127.0.0.1:8000/api/inspections/{first_inspection['id']}/available_actions/", headers=headers)
                print(f"Available actions response: {actions_response.status_code}")
                
                if actions_response.status_code == 200:
                    actions = actions_response.json()
                    print(f"✅ Available actions: {actions}")
                else:
                    print(f"❌ Failed to get available actions: {actions_response.text}")
            else:
                print("⚠️ No inspections found")
        else:
            print(f"❌ Failed to get inspections: {inspections_response.text}")
    else:
        print(f"❌ Authentication failed: {auth_response.text}")
        
except Exception as e:
    print(f"❌ Error: {e}")

print("\n✅ Test completed!")
