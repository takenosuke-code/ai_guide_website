#!/usr/bin/env python3
"""
Test WordPress.com specific authentication requirements
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

print("="*70)
print("WordPress.com Specific Authentication Test")
print("="*70)
print()

# Test 1: Check REST API root
print("1. Checking REST API Availability")
print("-"*70)
try:
    response = requests.get(f"{wp_url}/wp-json/", timeout=10)
    if response.status_code == 200:
        data = response.json()
        print("REST API is available")
        if 'authentication' in data:
            auth = data['authentication']
            if 'application-passwords' in auth:
                print("Application Passwords are enabled")
            else:
                print("WARNING: Application Passwords not found in API response")
except Exception as e:
    print(f"Error: {e}")

print()

# Test 2: Try different authentication methods
print("2. Testing Different Authentication Methods")
print("-"*70)

# Method 1: Username with Application Password
print("Method 1: Username + Application Password")
session1 = requests.Session()
session1.auth = (wp_username, clean_password)
session1.headers.update({'User-Agent': 'WP-Com-Test/1.0'})

try:
    response = session1.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
    if response.status_code == 200:
        print("SUCCESS!")
        user = response.json()
        print(f"  User: {user.get('name')}")
    else:
        print(f"FAILED: {response.status_code}")
except Exception as e:
    print(f"ERROR: {e}")

print()

# Method 2: Email with Application Password
print("Method 2: Email + Application Password")
email = "ai.tool.site1020@gmail.com"
session2 = requests.Session()
session2.auth = (email, clean_password)
session2.headers.update({'User-Agent': 'WP-Com-Test/1.0'})

try:
    response = session2.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
    if response.status_code == 200:
        print("SUCCESS!")
        user = response.json()
        print(f"  User: {user.get('name')}")
    else:
        print(f"FAILED: {response.status_code}")
except Exception as e:
    print(f"ERROR: {e}")

print()

# Method 3: Check if we can access posts (public)
print("3. Testing Public API Access")
print("-"*70)
try:
    response = requests.get(f"{wp_url}/wp-json/wp/v2/posts?per_page=1", timeout=10)
    if response.status_code == 200:
        print("SUCCESS: Can access public API")
        posts = response.json()
        if posts:
            print(f"  Found {len(posts)} post(s)")
    else:
        print(f"FAILED: {response.status_code}")
except Exception as e:
    print(f"ERROR: {e}")

print()
print("="*70)
print("TROUBLESHOOTING")
print("="*70)
print()
print("If authentication is still failing, try:")
print()
print("1. Verify Application Password was created:")
print("   - WordPress.com → Users → Your Profile")
print("   - Scroll to 'Application Passwords' section")
print("   - Make sure you see a password listed")
print("   - If not, create a new one")
print()
print("2. Check Application Password format:")
print("   - Should be exactly 24 characters")
print("   - Alphanumeric only (A-Z, a-z, 0-9)")
print("   - No special characters")
print()
print("3. Try creating a NEW Application Password:")
print("   - Delete the old one if it exists")
print("   - Create a fresh one")
print("   - Copy it immediately")
print("   - Update .env file")
print()
print("4. Verify user permissions:")
print("   - User must be Administrator or have edit_posts capability")
print("   - Check user role in WordPress.com")
print()
print("5. WordPress.com plan restrictions:")
print("   - Some free plans may restrict REST API write access")
print("   - Check your plan's API permissions")

