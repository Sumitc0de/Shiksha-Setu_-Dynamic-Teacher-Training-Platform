"""Test cluster creation to debug issues"""
import requests
import json

url = "http://127.0.0.1:8000/api/clusters/"

# Test data
test_cluster = {
    "name": "Test Cluster",
    "region_type": "Urban",
    "language": "Hindi"
}

print("Testing cluster creation...")
print(f"URL: {url}")
print(f"Data: {json.dumps(test_cluster, indent=2)}")

try:
    response = requests.post(url, json=test_cluster)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"\nError: {e}")
    if hasattr(e, 'response'):
        print(f"Response Text: {e.response.text}")
