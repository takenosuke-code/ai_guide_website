#!/usr/bin/env python3
"""
Test scraper with immediate scrape (bypasses frequency check)
"""
import sys
import os
from dotenv import load_dotenv

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

load_dotenv()

# Clear cache for Gemini
cache_dir = os.path.join(os.path.dirname(__file__), "cache")
cache_file = os.path.join(cache_dir, "15.json")
if os.path.exists(cache_file):
    os.remove(cache_file)
    print("✅ Cleared cache for Gemini")

# Also clear last_scraped timestamp by updating WordPress
from wordpress import WordPressClient
wp_url = os.getenv("WP_URL", "")
wp_username = os.getenv("WP_USERNAME", "")
wp_password = os.getenv("WP_PASSWORD", "")

print("Clearing last_scraped timestamp in WordPress...")
client = WordPressClient(wp_url, wp_username, wp_password)
client.update_tool_acf(15, {"last_scraped": ""})  # Clear timestamp

print()
print("="*70)
print("Now run the scraper:")
print("  python scraper/scraper.py")
print("="*70)
print()
print("Make sure scraping is ENABLED in WordPress for Gemini!")

