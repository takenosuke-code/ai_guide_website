#!/usr/bin/env python3
"""
Test rebuilt authentication
"""
import sys
import os
from dotenv import load_dotenv

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

load_dotenv()

from wordpress import WordPressClient

wp_url = os.getenv("WP_URL", "")
wp_username = os.getenv("WP_USERNAME", "")
wp_password = os.getenv("WP_PASSWORD", "")

print("="*70)
print("Testing Rebuilt WordPress Client")
print("="*70)
print()

if not all([wp_url, wp_username, wp_password]):
    print("ERROR: Missing credentials in .env file")
    exit(1)

print(f"URL: {wp_url}")
print(f"Username: {wp_username}")
print(f"Password length: {len(wp_password.replace(' ', ''))} chars")
print()

# Initialize client (will verify auth automatically)
print("Initializing WordPress client...")
print()
client = WordPressClient(wp_url, wp_username, wp_password)

print()
print("="*70)
print("Testing API Calls")
print("="*70)
print()

# Test getting posts
print("1. Testing get_tools()...")
tools = client.get_tools("ai-review", per_page=5)
if tools:
    print(f"   ✅ Successfully fetched {len(tools)} tools")
    if tools:
        print(f"   First tool: {tools[0].get('title', {}).get('rendered', 'N/A')}")
else:
    print("   ❌ Failed to fetch tools")

print()

# Test getting ACF fields
if tools:
    post_id = tools[0]['id']
    print(f"2. Testing get_tool_acf() for post {post_id}...")
    acf = client.get_tool_acf(post_id)
    if acf:
        print(f"   ✅ Successfully fetched ACF fields")
        print(f"   Fields found: {len(acf)}")
        # Show some key fields
        for key in ['latest_version', 'latest_update', 'seller', 'scrape_url']:
            if key in acf:
                value = str(acf[key])[:50] if acf[key] else '(empty)'
                print(f"   {key}: {value}")
    else:
        print("   ❌ Failed to fetch ACF fields")

print()
print("="*70)
if tools and acf:
    print("✅ ALL TESTS PASSED - Authentication is working!")
    print("="*70)
    print()
    print("The scraper is ready to use. Run:")
    print("  python scraper/scraper.py")
else:
    print("❌ SOME TESTS FAILED")
    print("="*70)
    print()
    print("Authentication is still not working.")
    print("Please verify:")
    print("1. Application Password exists in WordPress.com")
    print("2. Password in .env matches the Application Password")
    print("3. User has correct permissions")

