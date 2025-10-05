#!/usr/bin/env python3
"""
Test script to verify API endpoints are working
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8001/api"

def test_inspections_endpoint():
    """Test the inspections endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/inspections/")
        print(f"GET /inspections/ - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

def test_assign_to_me_endpoint():
    """Test the assign_to_me endpoint"""
    try:
        # First get an inspection ID
        response = requests.get(f"{BASE_URL}/inspections/")
        if response.status_code == 200:
            data = response.json()
            if data.get('results') and len(data['results']) > 0:
                inspection_id = data['results'][0]['id']
                print(f"Testing assign_to_me with inspection ID: {inspection_id}")
                
                # Test assign_to_me
                response = requests.post(f"{BASE_URL}/inspections/{inspection_id}/assign_to_me/")
                print(f"POST /inspections/{inspection_id}/assign_to_me/ - Status: {response.status_code}")
                if response.status_code == 200:
                    data = response.json()
                    print(f"Response: {json.dumps(data, indent=2)}")
                else:
                    print(f"Error: {response.text}")
            else:
                print("No inspections found to test with")
        else:
            print(f"Error getting inspections: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    print("Testing API endpoints...")
    test_inspections_endpoint()
    print("\n" + "="*50 + "\n")
    test_assign_to_me_endpoint()
