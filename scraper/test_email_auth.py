#!/usr/bin/env python3
"""
Test authentication with email instead of username
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

clean_password = wp_password.replace(' ', '').strip() if wp_password else ''

print("="*60)
print("Testing Authentication with Email")
print("="*60)
print()

# Try with email
email = "ai.tool.site1020@gmail.com"

print(f"Test 1: Using EMAIL: {email}")
print("-"*60)

session = requests.Session()
session.auth = (email, clean_password)
session.headers.update({'User-Agent': 'Email-Auth-Test/1.0'})

try:
    response = session.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        user_data = response.json()
        print("SUCCESS!")
        print(f"  User: {user_data.get('name')}")
        print(f"  ID: {user_data.get('id')}")
        print(f"  Email: {user_data.get('email')}")
        print()
        print("="*60)
        print("RECOMMENDATION")
        print("="*60)
        print(f"Use EMAIL in WP_USERNAME: {email}")
    else:
        print("FAILED")
        try:
            error_data = response.json()
            print(f"  Error: {error_data.get('message')}")
        except:
            print(f"  Response: {response.text[:200]}")
        
        print()
        print("="*60)
        print("Troubleshooting")
        print("="*60)
        print("Authentication is still failing. Possible issues:")
        print()
        print("1. Application Password not created correctly")
        print("   - Go to WordPress.com → Users → Application Passwords")
        print("   - Make sure you created a NEW Application Password")
        print("   - Copy it exactly (24 characters)")
        print()
        print("2. Password has hidden characters")
        print("   - Check for newlines or extra spaces")
        print("   - Try copying password again")
        print()
        print("3. Wrong user account")
        print("   - Make sure Application Password was created for the correct user")
        print("   - The user must have permission to edit posts")
        print()
        print("4. WordPress.com restrictions")
        print("   - Some WordPress.com plans may have REST API restrictions")
        print("   - Check your plan's API access permissions")
        
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

