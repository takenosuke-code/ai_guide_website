#!/usr/bin/env python3
"""
Test authentication with exact password from .env
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

wp_url = os.getenv("WP_URL", "").rstrip('/')
wp_username = os.getenv("WP_USERNAME", "")
wp_password = os.getenv("WP_PASSWORD", "")

if wp_url.startswith('http://'):
    wp_url = wp_url.replace('http://', 'https://')

# Clean password exactly as wordpress.py does
clean_password = wp_password.replace(' ', '') if wp_password else ''

print("="*70)
print("Exact Authentication Test")
print("="*70)
print(f"URL: {wp_url}")
print(f"Username: {wp_username}")
print(f"Password (cleaned): {len(clean_password)} chars")
print(f"Password preview: {clean_password[:2]}...{clean_password[-2:]}")
print()

# Test with username
print("Testing with USERNAME...")
session1 = requests.Session()
session1.auth = (wp_username, clean_password)
session1.headers.update({'User-Agent': 'Exact-Test/1.0'})

try:
    response = session1.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        user = response.json()
        print("SUCCESS!")
        print(f"  User: {user.get('name')}")
        print(f"  ID: {user.get('id')}")
        print()
        print("="*70)
        print("AUTHENTICATION WORKS!")
        print("="*70)
    else:
        print("FAILED")
        try:
            error = response.json()
            print(f"  Code: {error.get('code')}")
            print(f"  Message: {error.get('message')}")
        except:
            print(f"  Response: {response.text[:300]}")
        
        # Try with email
        print()
        print("Testing with EMAIL...")
        email = "ai.tool.site1020@gmail.com"
        session2 = requests.Session()
        session2.auth = (email, clean_password)
        session2.headers.update({'User-Agent': 'Exact-Test/1.0'})
        
        response2 = session2.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
        print(f"Status: {response2.status_code}")
        
        if response2.status_code == 200:
            user = response2.json()
            print("SUCCESS with email!")
            print(f"  User: {user.get('name')}")
            print()
            print("="*70)
            print("RECOMMENDATION: Use email in WP_USERNAME")
            print("="*70)
        else:
            print("FAILED with email too")
            print()
            print("="*70)
            print("TROUBLESHOOTING")
            print("="*70)
            print()
            print("Authentication is still failing. Possible causes:")
            print()
            print("1. Application Password not actually created in WordPress.com")
            print("   - Go to: WordPress.com → Users → Your Profile")
            print("   - Scroll to 'Application Passwords' section")
            print("   - Verify you see 'AI Tool Scraper' listed")
            print("   - If not, create it again")
            print()
            print("2. Wrong password in .env file")
            print("   - The password in .env might not match the Application Password")
            print("   - Create a fresh Application Password")
            print("   - Copy it immediately")
            print("   - Update .env file")
            print()
            print("3. WordPress.com account/plan restrictions")
            print("   - Some plans may restrict REST API write access")
            print("   - Check your WordPress.com plan features")
            print()
            print("4. User permissions")
            print("   - User must be Administrator or have edit_posts capability")
            print("   - Check user role in WordPress.com")
            
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

