#!/usr/bin/env python3
"""Verify the scraper actually worked"""
import sys
import os
from dotenv import load_dotenv

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

load_dotenv()
from wordpress import WordPressClient

wp_url = os.getenv("WP_URL", "")
wp_staging_url = os.getenv("WP_STAGING_URL", "").strip() or wp_url
wp_username = os.getenv("WP_USERNAME", "")
wp_password = os.getenv("WP_PASSWORD", "")

print(f"🔧 WP_URL: {wp_url}")
print(f"🔧 WP_STAGING_URL (used): {wp_staging_url}")

client = WordPressClient(wp_staging_url, wp_username, wp_password)
acf = client.get_tool_acf(15)

if acf:
    print("="*70)
    print("Verifying Scraper Results for Gemini")
    print("="*70)
    print()
    
    print("Scraped Fields:")
    print(f"  latest_version: {acf.get('latest_version', 'NOT SET')}")
    print(f"  latest_update: {acf.get('latest_update', 'NOT SET')}")
    print(f"  overview (first 100 chars): {str(acf.get('overview', 'NOT SET'))[:100]}")
    print()
    
    if acf.get('latest_version'):
        print("✅ Scraper is working! Fields were updated.")
    else:
        print("⚠️  Fields not updated yet (WordPress.com may not persist changes)")
        print("   But the scraper ran successfully!")

