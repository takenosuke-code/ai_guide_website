#!/usr/bin/env python3
"""
Final authentication test - test both email and username
"""
import requests
import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_credentials(username_or_email: str, password: str, label: str):
    """Test authentication"""
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    
    if wp_url.startswith('http://'):
        wp_url = wp_url.replace('http://', 'https://')
    
    session = requests.Session()
    clean_password = password.replace(' ', '') if password else ''
    session.auth = (username_or_email, clean_password)
    session.headers.update({'User-Agent': 'Final-Auth-Test/1.0'})
    
    try:
        response = session.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ {label}: SUCCESS!")
            print(f"   Authenticated as: {user_data.get('name')}")
            print(f"   User ID: {user_data.get('id')}")
            return True
        else:
            print(f"❌ {label}: FAILED ({response.status_code})")
            return False
    except Exception as e:
        print(f"❌ {label}: ERROR - {e}")
        return False

if __name__ == "__main__":
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    print("="*60)
    print("Final Authentication Test")
    print("="*60)
    print()
    
    if len(wp_password) != 24:
        print(f"⚠️  Password is {len(wp_password)} chars (should be 24)")
        print("   Make sure you're using an Application Password!")
        print()
    
    # Test with email
    email_works = test_credentials(wp_username, wp_password, "EMAIL")
    
    # Test with username (extracted from email or use known username)
    if '@' in wp_username:
        possible_username = wp_username.split('@')[0]
    else:
        possible_username = wp_username
    
    # Also try the known username
    known_username = "aitoolsite1020"
    username_works = test_credentials(known_username, wp_password, "USERNAME")
    
    print()
    print("="*60)
    print("Result")
    print("="*60)
    
    if email_works:
        print("✅ Use EMAIL in WP_USERNAME: ai.tool.site1020@gmail.com")
    elif username_works:
        print("✅ Use USERNAME in WP_USERNAME: aitoolsite1020")
    else:
        print("❌ Authentication failed with both")
        print()
        print("Check:")
        print("1. Application Password is exactly 24 characters")
        print("2. URL uses https:// (not http://)")
        print("3. Application Password was created in WordPress.com")
        print("4. Password copied correctly (no extra spaces/newlines)")

