#!/usr/bin/env python3
"""Find scraper-related fields in ACF response"""
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
    print("Searching for Scraper Fields")
    print("="*70)
    print()
    
    # Search for fields containing these keywords
    keywords = ['scrape', 'selector', 'version', 'description', 'owner', 'frequency', 'enable']
    
    print("Fields matching scraper keywords:")
    found_any = False
    for key in sorted(acf.keys()):
        key_lower = key.lower()
        if any(kw in key_lower for kw in keywords):
            value = acf[key]
            value_str = str(value)[:60] if value else 'None'
            print(f"  ✅ {key}: {value_str}")
            found_any = True
    
    if not found_any:
        print("  ❌ No scraper-related fields found")
        print()
        print("All field names:")
        for key in sorted(acf.keys()):
            print(f"    - {key}")
    
    print()
    print("="*70)
    print("Next Steps")
    print("="*70)
    print("1. Make sure 'Show in REST API' is checked for the scraper field group")
    print("2. Save the field group after enabling REST API")
    print("3. Make sure the field group is assigned to the post type")
    print("4. Save the Gemini post after filling in scraper fields")
    print("5. Wait a few seconds and test again")
else:
    print("Failed to fetch ACF fields")

