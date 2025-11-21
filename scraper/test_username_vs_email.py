#!/usr/bin/env python3
"""
Test whether username or email works for Application Password authentication
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

def test_auth(username_or_email: str, password: str, label: str):
    """Test authentication with given credentials"""
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    
    # Ensure HTTPS
    if wp_url.startswith('http://'):
        wp_url = wp_url.replace('http://', 'https://')
    
    print(f"\n{'='*60}")
    print(f"Testing: {label}")
    print(f"{'='*60}")
    print(f"URL: {wp_url}")
    print(f"Username/Email: {username_or_email}")
    print(f"Password length: {len(password)} chars")
    print()
    
    session = requests.Session()
    # Remove spaces from password
    clean_password = password.replace(' ', '') if password else ''
    session.auth = (username_or_email, clean_password)
    session.headers.update({'User-Agent': 'Auth-Test/1.0'})
    
    try:
        # Test authentication
        response = session.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            user_data = response.json()
            print(f"✅ SUCCESS!")
            print(f"   Authenticated as: {user_data.get('name', 'Unknown')}")
            print(f"   User ID: {user_data.get('id')}")
            print(f"   Email: {user_data.get('email', 'N/A')}")
            print(f"   Username: {user_data.get('slug', 'N/A')}")
            return True
        else:
            print(f"❌ FAILED: {response.status_code}")
            try:
                error_data = response.json()
                if 'message' in error_data:
                    print(f"   Message: {error_data['message']}")
                if 'code' in error_data:
                    print(f"   Code: {error_data['code']}")
            except:
                print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    if not wp_username or not wp_password:
        print("❌ WP_USERNAME or WP_PASSWORD not set in .env file")
        exit(1)
    
    print("="*60)
    print("Testing Username vs Email for Application Password Auth")
    print("="*60)
    
    # Check if WP_USERNAME looks like email or username
    is_email = '@' in wp_username
    
    if is_email:
        print(f"\nYour WP_USERNAME appears to be an EMAIL: {wp_username}")
        print("\nTesting with EMAIL...")
        email_works = test_auth(wp_username, wp_password, "EMAIL")
        
        # Try to extract username from email (before @)
        possible_username = wp_username.split('@')[0]
        print(f"\nAlso testing with possible USERNAME (from email): {possible_username}")
        username_works = test_auth(possible_username, wp_password, "USERNAME (extracted)")
    else:
        print(f"\nYour WP_USERNAME appears to be a USERNAME: {wp_username}")
        print("\nTesting with USERNAME...")
        username_works = test_auth(wp_username, wp_password, "USERNAME")
        
        # If we have email in env, try that too
        wp_email = os.getenv("WP_EMAIL", "")
        if wp_email:
            print(f"\nAlso testing with EMAIL from WP_EMAIL: {wp_email}")
            email_works = test_auth(wp_email, wp_password, "EMAIL")
        else:
            email_works = False
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    if is_email:
        if email_works:
            print("✅ Use EMAIL in WP_USERNAME (current setting works!)")
        elif username_works:
            print("✅ Use USERNAME in WP_USERNAME (extracted from email)")
        else:
            print("❌ Neither email nor username worked")
            print("   Check:")
            print("   1. Application Password is correct (24 characters)")
            print("   2. URL uses https://")
            print("   3. Application Password was created in WordPress.com")
    else:
        if username_works:
            print("✅ Use USERNAME in WP_USERNAME (current setting works!)")
        elif email_works:
            print("✅ Use EMAIL in WP_USERNAME (email works better)")
        else:
            print("❌ Neither username nor email worked")
            print("   Check:")
            print("   1. Application Password is correct (24 characters)")
            print("   2. URL uses https://")
            print("   3. Application Password was created in WordPress.com")

