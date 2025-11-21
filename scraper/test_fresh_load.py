#!/usr/bin/env python3
"""
Test with fresh .env reload
"""
import os
import sys
from dotenv import load_dotenv

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Force reload .env
load_dotenv(override=True)

print("="*60)
print("Fresh .env Load Test")
print("="*60)
print()

wp_url = os.getenv("WP_URL", "")
wp_username = os.getenv("WP_USERNAME", "")
wp_password = os.getenv("WP_PASSWORD", "")

print(f"WP_URL: {wp_url}")
print(f"WP_USERNAME: {wp_username}")
print(f"WP_PASSWORD length: {len(wp_password) if wp_password else 0} chars")
print()

if wp_password:
    clean = wp_password.replace(' ', '').strip()
    print(f"Password (cleaned): {len(clean)} chars")
    
    # Show first 2 and last 2 chars for verification
    if len(clean) >= 4:
        preview = clean[:2] + "*" * (len(clean) - 4) + clean[-2:]
        print(f"Password preview: {preview}")
        print()
        
        if len(clean) == 24:
            print("Password length is correct (24 chars)")
        else:
            print(f"WARNING: Password should be 24 chars, got {len(clean)}")
    else:
        print("Password too short to preview")
else:
    print("ERROR: WP_PASSWORD is not set!")

print()
print("="*60)
print("Testing Authentication...")
print("="*60)

import requests

if wp_url and wp_username and wp_password:
    if wp_url.startswith('http://'):
        wp_url = wp_url.replace('http://', 'https://')
    
    clean_password = wp_password.replace(' ', '').strip()
    
    session = requests.Session()
    session.auth = (wp_username, clean_password)
    session.headers.update({'User-Agent': 'Fresh-Load-Test/1.0'})
    
    try:
        response = session.get(f"{wp_url}/wp-json/wp/v2/users/me", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            user_data = response.json()
            print("SUCCESS!")
            print(f"  User: {user_data.get('name')}")
            print(f"  ID: {user_data.get('id')}")
        else:
            print("FAILED")
            try:
                error = response.json()
                print(f"  Error: {error.get('message')}")
            except:
                print(f"  Response: {response.text[:200]}")
    except Exception as e:
        print(f"ERROR: {e}")

