#!/usr/bin/env python3
"""
Test built-in ACF REST API authentication and endpoints
"""
import requests
import sys
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_authentication():
    """Test authentication with WordPress"""
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    print("=" * 60)
    print("Testing WordPress Authentication")
    print("=" * 60)
    print(f"URL: {wp_url}")
    print(f"Username: {wp_username}")
    print(f"Password: {'*' * len(wp_password) if wp_password else 'NOT SET'}")
    print()
    
    session = requests.Session()
    session.auth = (wp_username, wp_password)
    session.headers.update({'User-Agent': 'ACF-Test/1.0'})
    
    # Test 1: Check if we can authenticate
    print("Test 1: Authentication Check")
    print("-" * 60)
    try:
        response = session.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ Authenticated as: {user_data.get('name', 'Unknown')}")
            print(f"   User ID: {user_data.get('id')}")
            print(f"   Capabilities: {list(user_data.get('capabilities', {}).keys())[:5]}")
            return True
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_read_acf():
    """Test reading ACF fields via built-in REST API"""
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    session = requests.Session()
    session.auth = (wp_username, wp_password)
    session.headers.update({'User-Agent': 'ACF-Test/1.0'})
    
    post_id = 15  # Gemini
    
    print()
    print("Test 2: Reading ACF Fields (Built-in REST API)")
    print("-" * 60)
    try:
        # Built-in ACF REST API endpoint
        endpoint = f"{wp_url}/wp-json/wp/v2/posts/{post_id}"
        response = session.get(endpoint, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'acf' in data:
                acf = data['acf']
                print(f"✅ ACF fields found: {len(acf)} fields")
                print()
                print("Key fields:")
                for key in ['latest_version', 'latest_update', 'seller', 'overview', 'scrape_url', 'scrape_enabled']:
                    value = acf.get(key, 'NOT FOUND')
                    if value:
                        display = str(value)[:50] + "..." if len(str(value)) > 50 else str(value)
                        print(f"   {key}: {display}")
                    else:
                        print(f"   {key}: (empty)")
                return True
            else:
                print("❌ No 'acf' key in response")
                print(f"   Response keys: {list(data.keys())[:10]}")
                return False
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_write_acf():
    """Test writing ACF fields via built-in REST API"""
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    session = requests.Session()
    session.auth = (wp_username, wp_password)
    session.headers.update({'User-Agent': 'ACF-Test/1.0'})
    
    post_id = 15  # Gemini
    
    print()
    print("Test 3: Writing ACF Fields (Built-in REST API)")
    print("-" * 60)
    
    # Test data
    test_fields = {
        "latest_version": "v 2.5 Flash TEST",
        "latest_update": "2025, Nov, 17"
    }
    
    test_data = {"acf": test_fields}
    
    print(f"Endpoint: {wp_url}/wp-json/wp/v2/posts/{post_id}")
    print(f"Method: POST (as per ACF documentation)")
    print(f"Data: {json.dumps(test_data, indent=2)}")
    print()
    
    try:
        # Use POST method (as specified in ACF documentation)
        response = session.post(
            f"{wp_url}/wp-json/wp/v2/posts/{post_id}",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            print("✅ Request accepted")
            
            # Check if values were saved
            if 'acf' in response_data:
                saved_acf = response_data['acf']
                print()
                print("Values in response:")
                for key, expected_value in test_fields.items():
                    saved_value = saved_acf.get(key, 'NOT FOUND')
                    print(f"   {key}:")
                    print(f"      Expected: {expected_value}")
                    print(f"      Saved:    {saved_value}")
                    if saved_value == expected_value:
                        print(f"      ✅ MATCH!")
                    elif saved_value:
                        print(f"      ⚠️  Different value")
                    else:
                        print(f"      ❌ NOT SAVED (empty)")
                
                # Verify by reading back
                print()
                print("Verification: Reading back from WordPress...")
                get_response = session.get(f"{wp_url}/wp-json/wp/v2/posts/{post_id}", timeout=10)
                if get_response.status_code == 200:
                    read_data = get_response.json()
                    if 'acf' in read_data:
                        read_acf = read_data['acf']
                        print("Values actually stored in WordPress:")
                        for key, expected_value in test_fields.items():
                            stored_value = read_acf.get(key, 'NOT FOUND')
                            print(f"   {key}: {stored_value}")
                            if stored_value == expected_value:
                                print(f"      ✅ SAVED CORRECTLY!")
                            else:
                                print(f"      ❌ NOT SAVED")
            else:
                print("⚠️  No 'acf' in response")
                print(f"   Response keys: {list(response_data.keys())[:10]}")
            
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"   Response: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print()
    auth_ok = test_authentication()
    if auth_ok:
        read_ok = test_read_acf()
        if read_ok:
            test_write_acf()
    else:
        print()
        print("❌ Authentication failed - cannot proceed with tests")
        print()
        print("Troubleshooting:")
        print("1. Check WP_URL in .env file")
        print("2. Check WP_USERNAME in .env file")
        print("3. Check WP_PASSWORD in .env file (should be application password)")
        print("4. Verify 'Show in REST API' is enabled for ACF field group")

