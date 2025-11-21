#!/usr/bin/env python3
"""
Detailed authentication test with full error information
"""
import requests
import sys
import os
import base64
from dotenv import load_dotenv

load_dotenv()

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_auth_detailed():
    """Test authentication with detailed debugging"""
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    if wp_url.startswith('http://'):
        wp_url = wp_url.replace('http://', 'https://')
    
    print("="*60)
    print("Detailed Authentication Test")
    print("="*60)
    print(f"URL: {wp_url}")
    print(f"Username: {wp_username}")
    print(f"Password length: {len(wp_password)} chars")
    print(f"Password has spaces: {'Yes' if ' ' in wp_password else 'No'}")
    print()
    
    # Clean password
    clean_password = wp_password.replace(' ', '') if wp_password else ''
    print(f"Password after cleaning: {len(clean_password)} chars")
    print()
    
    # Test 1: Basic Auth with requests
    print("Test 1: Basic Auth (requests library)")
    print("-"*60)
    session = requests.Session()
    session.auth = (wp_username, clean_password)
    session.headers.update({'User-Agent': 'Auth-Test/1.0'})
    
    try:
        response = session.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            user_data = response.json()
            print("SUCCESS!")
            print(f"  User: {user_data.get('name')}")
            print(f"  ID: {user_data.get('id')}")
            return True
        else:
            print("FAILED")
            try:
                error_data = response.json()
                print(f"  Error code: {error_data.get('code')}")
                print(f"  Error message: {error_data.get('message')}")
                if 'data' in error_data:
                    print(f"  Error data: {error_data.get('data')}")
            except:
                print(f"  Response: {response.text[:300]}")
    except Exception as e:
        print(f"ERROR: {e}")
    
    print()
    
    # Test 2: Manual Basic Auth header
    print("Test 2: Manual Basic Auth Header")
    print("-"*60)
    credentials = f"{wp_username}:{clean_password}"
    encoded = base64.b64encode(credentials.encode()).decode()
    
    headers = {
        'Authorization': f'Basic {encoded}',
        'User-Agent': 'Auth-Test/1.0'
    }
    
    try:
        response = requests.get(f"{wp_url}/wp-json/wp/v2/users/me", headers=headers, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            user_data = response.json()
            print("SUCCESS!")
            print(f"  User: {user_data.get('name')}")
            return True
        else:
            print("FAILED")
            try:
                error_data = response.json()
                print(f"  Error: {error_data.get('message')}")
            except:
                print(f"  Response: {response.text[:200]}")
    except Exception as e:
        print(f"ERROR: {e}")
    
    print()
    
    # Test 3: Check if Application Passwords are available
    print("Test 3: Check Application Password Availability")
    print("-"*60)
    try:
        response = requests.get(f"{wp_url}/wp-json/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if 'authentication' in data:
                auth_info = data['authentication']
                if 'application-passwords' in auth_info:
                    print("Application Passwords are AVAILABLE")
                    print(f"  Endpoint: {auth_info['application-passwords'].get('endpoints', {}).get('authorization', 'N/A')}")
                else:
                    print("Application Passwords are NOT AVAILABLE")
                    print("  This might be why authentication is failing")
                    print("  Check:")
                    print("  1. Site is using HTTPS (required)")
                    print("  2. WordPress version is 5.6+")
                    print("  3. Application Passwords are enabled")
            else:
                print("No authentication info in API response")
        else:
            print(f"Failed to check: {response.status_code}")
    except Exception as e:
        print(f"ERROR: {e}")
    
    print()
    print("="*60)
    print("Troubleshooting")
    print("="*60)
    print("If authentication is still failing:")
    print("1. Verify Application Password was created in WordPress.com")
    print("2. Check password was copied correctly (24 chars, no extra characters)")
    print("3. Try using email instead of username in WP_USERNAME")
    print("4. Verify 'Show in REST API' is enabled for ACF field group")
    print("5. Check if Application Passwords are enabled on your WordPress.com site")

if __name__ == "__main__":
    test_auth_detailed()

