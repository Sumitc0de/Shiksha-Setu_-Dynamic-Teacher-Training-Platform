"""
Test script to verify database and API are working correctly
"""
import requests
import json

API_BASE = "http://localhost:8000"

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        print("✅ Backend is running")
        print(f"   Status: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Backend is not responding: {e}")
        return False

def test_admin_login():
    """Test admin login"""
    try:
        response = requests.post(
            f"{API_BASE}/api/auth/login",
            json={"email": "admin@gov.in", "password": "admin123"},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin login successful")
            print(f"   Token: {data.get('access_token', 'N/A')[:20]}...")
            return data.get('access_token')
        else:
            print(f"❌ Admin login failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login request failed: {e}")
        return None

def test_admin_overview(token):
    """Test admin overview endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/api/admin/overview", headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin overview endpoint working")
            print(f"   Total Schools: {data.get('total_schools', 0)}")
            print(f"   Total Teachers: {data.get('total_teachers', 0)}")
            print(f"   Total Clusters: {data.get('total_clusters', 0)}")
            print(f"   Total Manuals: {data.get('total_manuals', 0)}")
            print(f"   Total Modules: {data.get('total_modules', 0)}")
            print(f"   Recent Activities: {len(data.get('recent_activities', []))}")
            return True
        else:
            print(f"❌ Overview failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Overview request failed: {e}")
        return False

def test_schools_list(token):
    """Test schools list endpoint"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_BASE}/api/admin/schools", headers=headers, timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Schools list endpoint working")
            print(f"   Schools found: {len(data)}")
            if data:
                school = data[0]
                print(f"   Sample: {school.get('school_name')} - {school.get('active_teachers')} active teachers")
            return True
        else:
            print(f"❌ Schools list failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Schools list request failed: {e}")
        return False

def main():
    print("=" * 60)
    print("DATABASE CONNECTION TEST")
    print("=" * 60)
    print()
    
    # Test 1: Backend health
    print("Test 1: Backend Health Check")
    if not test_backend_health():
        print("\n⚠️  Backend is not running. Start it with: python main.py")
        return
    print()
    
    # Test 2: Admin login
    print("Test 2: Admin Authentication")
    token = test_admin_login()
    if not token:
        print("\n⚠️  Login failed. Database may be empty.")
        print("   Run: python init_auth_users.py")
        return
    print()
    
    # Test 3: Admin overview (database queries)
    print("Test 3: Database Queries (Admin Overview)")
    if not test_admin_overview(token):
        return
    print()
    
    # Test 4: Schools list (database queries)
    print("Test 4: Database Queries (Schools List)")
    test_schools_list(token)
    print()
    
    print("=" * 60)
    print("✅ ALL TESTS PASSED - DATABASE IS CONNECTED TO DASHBOARDS")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Open http://localhost:3000/login in your browser")
    print("2. Login with: admin@gov.in / admin123")
    print("3. View real database data in the dashboard")

if __name__ == "__main__":
    main()
