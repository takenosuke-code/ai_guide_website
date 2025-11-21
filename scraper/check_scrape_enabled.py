#!/usr/bin/env python3
"""Check scrape_enabled value from WordPress"""
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

client = WordPressClient(wp_url, wp_username, wp_password)

# Get Gemini ACF fields
acf = client.get_tool_acf(15)

if acf:
    print("="*70)
    print("Gemini ACF Fields")
    print("="*70)
    print(f"scrape_enabled: {acf.get('scrape_enabled')}")
    print(f"  Type: {type(acf.get('scrape_enabled'))}")
    print(f"  Repr: {repr(acf.get('scrape_enabled'))}")
    print()
    print(f"scrape_url: {acf.get('scrape_url')}")
    print(f"version_selector: {acf.get('version_selector')}")
    print(f"description_selector: {acf.get('description_selector')}")
    print(f"scrape_frequency_hours: {acf.get('scrape_frequency_hours')}")
    print(f"last_scraped: {acf.get('last_scraped')}")
else:
    print("Failed to fetch ACF fields")

