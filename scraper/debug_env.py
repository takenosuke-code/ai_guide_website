#!/usr/bin/env python3
"""
Debug .env file configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

print("="*60)
print(".env File Configuration")
print("="*60)
print()

wp_url = os.getenv("WP_URL", "")
wp_username = os.getenv("WP_USERNAME", "")
wp_password = os.getenv("WP_PASSWORD", "")

print(f"WP_URL: {wp_url}")
print(f"  Length: {len(wp_url)} chars")
print(f"  Starts with https: {wp_url.startswith('https://')}")
print(f"  Starts with http: {wp_url.startswith('http://')}")
print()

print(f"WP_USERNAME: {wp_username}")
print(f"  Length: {len(wp_username)} chars")
print(f"  Is email: {'@' in wp_username}")
print()

print(f"WP_PASSWORD: {'*' * len(wp_password) if wp_password else 'NOT SET'}")
print(f"  Length: {len(wp_password)} chars")
print(f"  Has spaces: {'Yes' if ' ' in wp_password else 'No'}")
print(f"  Spaces count: {wp_password.count(' ') if wp_password else 0}")
print()

# Show password without spaces
if wp_password:
    clean_password = wp_password.replace(' ', '')
    print(f"Password without spaces: {len(clean_password)} chars")
    print(f"  Should be 24 chars: {'YES' if len(clean_password) == 24 else 'NO'}")
    print()
    
    # Show first and last few chars (masked)
    if len(clean_password) >= 4:
        masked = clean_password[:2] + '*' * (len(clean_password) - 4) + clean_password[-2:]
        print(f"  Format preview: {masked}")
        print(f"  (First 2 and last 2 chars shown)")

print()
print("="*60)
print("Recommendations")
print("="*60)

if not wp_url:
    print("❌ WP_URL is not set")
elif not wp_url.startswith('https://'):
    print("⚠️  WP_URL should use https://")
    
if not wp_username:
    print("❌ WP_USERNAME is not set")
    
if not wp_password:
    print("❌ WP_PASSWORD is not set")
elif len(wp_password.replace(' ', '')) != 24:
    print(f"⚠️  WP_PASSWORD should be 24 characters (currently {len(wp_password.replace(' ', ''))})")
    print("   Make sure you're using an Application Password, not your regular password")
    print("   Create one at: WordPress.com → Users → Application Passwords")

