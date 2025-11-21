#!/usr/bin/env python3
"""
Comprehensive authentication diagnosis
"""
import requests
import sys
import os
import re
from dotenv import load_dotenv

load_dotenv()

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def check_password_format(password):
    """Check if password looks like an Application Password"""
    if not password:
        return False, "Password is empty"
    
    clean = password.replace(' ', '').strip()
    
    # Check length
    if len(clean) != 24:
        return False, f"Password is {len(clean)} chars (should be 24)"
    
    # Check format (should be alphanumeric only)
    if not re.match(r'^[A-Za-z0-9]{24}$', clean):
        return False, f"Password contains invalid characters (should be A-Z, a-z, 0-9 only)"
    
    # Check for hidden characters
    if password != clean:
        return True, f"Password has spaces (will be stripped) - {len(clean)} chars"
    
    return True, "Password format looks correct"

def diagnose():
    """Run comprehensive diagnosis"""
    wp_url = os.getenv("WP_URL", "")
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    print("="*70)
    print("COMPREHENSIVE AUTHENTICATION DIAGNOSIS")
    print("="*70)
    print()
    
    # Check URL
    print("1. URL Configuration")
    print("-"*70)
    if not wp_url:
        print("   ERROR: WP_URL is not set")
        return
    else:
        print(f"   URL: {wp_url}")
        if wp_url.startswith('http://'):
            print("   WARNING: Using http:// - Application Passwords require https://")
            wp_url = wp_url.replace('http://', 'https://')
            print(f"   Converted to: {wp_url}")
        elif wp_url.startswith('https://'):
            print("   OK: Using https://")
        else:
            print("   ERROR: URL doesn't start with http:// or https://")
            return
    
    print()
    
    # Check username
    print("2. Username Configuration")
    print("-"*70)
    if not wp_username:
        print("   ERROR: WP_USERNAME is not set")
        return
    else:
        print(f"   Username: {wp_username}")
        is_email = '@' in wp_username
        print(f"   Type: {'Email' if is_email else 'Username'}")
        if is_email:
            print("   OK: Email format looks correct")
        else:
            print("   INFO: Using username (email also works)")
    
    print()
    
    # Check password
    print("3. Password Configuration")
    print("-"*70)
    if not wp_password:
        print("   ERROR: WP_PASSWORD is not set")
        return
    
    clean_password = wp_password.replace(' ', '').strip()
    is_valid, message = check_password_format(wp_password)
    
    print(f"   Password length: {len(wp_password)} chars (raw)")
    print(f"   Password length: {len(clean_password)} chars (cleaned)")
    print(f"   Status: {message}")
    
    if not is_valid:
        print()
        print("   ACTION REQUIRED:")
        print("   - Application Passwords must be exactly 24 characters")
        print("   - Format: xxxx xxxx xxxx xxxx xxxx xxxx (with or without spaces)")
        print("   - Characters: A-Z, a-z, 0-9 only")
        print()
        print("   Create one at: WordPress.com → Users → Application Passwords")
        return
    
    # Check for hidden characters
    if '\n' in wp_password or '\r' in wp_password:
        print("   WARNING: Password contains newline characters!")
        print("   Remove any line breaks from the password")
    
    print()
    
    # Test authentication
    print("4. Authentication Test")
    print("-"*70)
    
    # Try with current username
    session = requests.Session()
    session.auth = (wp_username, clean_password)
    session.headers.update({'User-Agent': 'Diagnosis/1.0'})
    
    try:
        response = session.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
        if response.status_code == 200:
            user_data = response.json()
            print("   SUCCESS! Authentication works!")
            print(f"   User: {user_data.get('name')}")
            print(f"   ID: {user_data.get('id')}")
            print()
            print("="*70)
            print("RESULT: Authentication is working correctly!")
            print("="*70)
            return True
        else:
            print(f"   FAILED: Status {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('message')}")
            except:
                pass
    except Exception as e:
        print(f"   ERROR: {e}")
    
    print()
    
    # If failed, try with email
    if '@' not in wp_username:
        print("5. Testing with Email")
        print("-"*70)
        email = "ai.tool.site1020@gmail.com"
        print(f"   Trying email: {email}")
        
        session2 = requests.Session()
        session2.auth = (email, clean_password)
        session2.headers.update({'User-Agent': 'Diagnosis/1.0'})
        
        try:
            response = session2.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
            if response.status_code == 200:
                user_data = response.json()
                print("   SUCCESS with email!")
                print(f"   User: {user_data.get('name')}")
                print()
                print("="*70)
                print("RECOMMENDATION: Use email in WP_USERNAME")
                print("="*70)
                return True
            else:
                print(f"   FAILED: Status {response.status_code}")
        except Exception as e:
            print(f"   ERROR: {e}")
    
    print()
    print("="*70)
    print("DIAGNOSIS COMPLETE")
    print("="*70)
    print()
    print("Authentication is still failing. Please verify:")
    print()
    print("1. Application Password was created:")
    print("   - WordPress.com → Users → Application Passwords")
    print("   - Click 'Add New Application Password'")
    print("   - Name it: 'AI Tool Scraper'")
    print("   - Copy the 24-character password immediately")
    print()
    print("2. Password was copied correctly:")
    print("   - Should be exactly 24 characters")
    print("   - No extra spaces or newlines")
    print("   - Format: xxxx xxxx xxxx xxxx xxxx xxxx")
    print()
    print("3. Password is in .env file:")
    print("   - WP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx")
    print("   - Or: WP_PASSWORD=xxxxxxxxxxxxxxxxxxxxxxxx")
    print()
    print("4. User has correct permissions:")
    print("   - User must be able to edit posts")
    print("   - Administrator role recommended")
    print()
    print("5. WordPress.com plan allows REST API:")
    print("   - Some plans may restrict API access")
    print("   - Check your WordPress.com plan features")

if __name__ == "__main__":
    diagnose()

