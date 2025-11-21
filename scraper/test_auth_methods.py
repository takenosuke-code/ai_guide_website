#!/usr/bin/env python3
"""
Test different authentication methods for WordPress.com
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

def test_basic_auth():
    """Test Basic Auth with username:password"""
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    print("=" * 60)
    print("Test 1: Basic Auth (username:password)")
    print("=" * 60)
    
    session = requests.Session()
    session.auth = (wp_username, wp_password)
    session.headers.update({'User-Agent': 'ACF-Test/1.0'})
    
    try:
        response = session.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ SUCCESS")
            return True
        else:
            print(f"❌ Failed: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_application_password():
    """Test with Application Password format"""
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    print()
    print("=" * 60)
    print("Test 2: Application Password (username app_password)")
    print("=" * 60)
    
    # Try with username and app password (24 chars, no spaces)
    # Format: username:app_password
    session = requests.Session()
    session.auth = (wp_username, wp_password.replace(' ', ''))
    session.headers.update({'User-Agent': 'ACF-Test/1.0'})
    
    try:
        response = session.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ SUCCESS")
            return True
        else:
            print(f"❌ Failed: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_manual_header():
    """Test with manual Authorization header"""
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    print()
    print("=" * 60)
    print("Test 3: Manual Authorization Header")
    print("=" * 60)
    
    credentials = f"{wp_username}:{wp_password}"
    encoded = base64.b64encode(credentials.encode()).decode()
    
    session = requests.Session()
    session.headers.update({
        'Authorization': f'Basic {encoded}',
        'User-Agent': 'ACF-Test/1.0'
    })
    
    try:
        response = session.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ SUCCESS")
            return True
        else:
            print(f"❌ Failed: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_direct_post_access():
    """Test if we can access posts without auth (public)"""
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    
    print()
    print("=" * 60)
    print("Test 4: Public Access (no auth)")
    print("=" * 60)
    
    try:
        response = requests.get(f"{wp_url}/wp-json/wp/v2/posts/15", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Can read post (public)")
            if 'acf' in data:
                print(f"   ACF fields available: {len(data['acf'])} fields")
            else:
                print("   ⚠️  No ACF in public response")
            return True
        else:
            print(f"❌ Failed: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print()
    print("Testing WordPress.com Authentication Methods")
    print()
    
    # Show what we're using
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    print(f"Username: {wp_username}")
    print(f"Password length: {len(wp_password)} chars")
    print(f"Password has spaces: {'Yes' if ' ' in wp_password else 'No'}")
    print()
    
    # Run tests
    test_basic_auth()
    test_application_password()
    test_manual_header()
    test_direct_post_access()
    
    print()
    print("=" * 60)
    print("Recommendations:")
    print("=" * 60)
    print("1. For WordPress.com, you need an Application Password")
    print("2. Go to: WordPress.com → Users → Application Passwords")
    print("3. Create a new application password (24 characters)")
    print("4. Use format: username:app_password (no spaces)")
    print("5. Make sure 'Show in REST API' is enabled for ACF field group")

