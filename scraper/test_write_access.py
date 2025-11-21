#!/usr/bin/env python3
"""Test write access to ACF fields"""
import sys
import os
from dotenv import load_dotenv

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

load_dotenv()
from wordpress import WordPressClient

wp_url = os.getenv("WP_URL", "")
wp_username = os.getenv("WP_USERNAME", "")
wp_password = os.getenv("WP_PASSWORD", "")

print("="*70)
print("Testing Write Access to ACF Fields")
print("="*70)
print()

client = WordPressClient(wp_url, wp_username, wp_password)

# Get a post to test with
tools = client.get_tools("ai-review", per_page=1)
if not tools:
    print("❌ No posts found")
    exit(1)

post_id = tools[0]['id']
post_title = tools[0]['title']['rendered']

print(f"Testing with post: {post_title} (ID: {post_id})")
print()

# Test update
test_fields = {
    "latest_version": "v TEST 1.0",
    "latest_update": "2025, Nov, 18"
}

print("Attempting to update ACF fields...")
print(f"  Fields: {test_fields}")
print()

success = client.update_tool_acf(post_id, test_fields)

print()
if success:
    print("="*70)
    print("✅ WRITE ACCESS WORKS - Authentication is fully functional!")
    print("="*70)
else:
    print("="*70)
    print("❌ Write access failed")
    print("="*70)

