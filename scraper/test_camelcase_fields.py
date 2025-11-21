#!/usr/bin/env python3
"""Test if camelCase fields are accessible"""
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
acf = client.get_tool_acf(15)

if acf:
    print("="*70)
    print("Testing camelCase Field Names")
    print("="*70)
    print()
    
    # Test camelCase fields
    fields_to_check = {
        "scrapeEnabled": "scrapeEnabled",
        "scrapeUrl": "scrapeUrl", 
        "versionSelector": "versionSelector",
        "descriptionSelector": "descriptionSelector",
        "ownerSelector": "ownerSelector",
        "scrapeFrequencyHours": "scrapeFrequencyHours",
        "scrapeErrorLog": "scrapeErrorLog"
    }
    
    found_count = 0
    for display_name, field_name in fields_to_check.items():
        value = acf.get(field_name)
        if value is not None:
            print(f"✅ {display_name}: {value}")
            found_count += 1
        else:
            print(f"❌ {display_name}: NOT FOUND")
    
    print()
    print("="*70)
    if found_count > 0:
        print(f"✅ Found {found_count} scraper fields!")
        print("The scraper should work now.")
    else:
        print("❌ No scraper fields found")
        print()
        print("Make sure:")
        print("1. 'Show in REST API' is checked for the Scraper field group")
        print("2. The field group is saved after enabling REST API")
        print("3. The field group is assigned to the post type")
        print("4. The Gemini post is saved with scraper fields filled in")
else:
    print("Failed to fetch ACF fields")

