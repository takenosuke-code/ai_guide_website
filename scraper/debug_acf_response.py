#!/usr/bin/env python3
"""Debug what ACF fields WordPress actually returns"""
import sys
import os
import json
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

# Get full post data
import requests
session = requests.Session()
from requests.auth import HTTPBasicAuth
clean_password = os.getenv("WP_PASSWORD", "").replace(' ', '').strip()
session.auth = HTTPBasicAuth(os.getenv("WP_USERNAME", ""), clean_password)
session.headers.update({'User-Agent': 'Debug/1.0'})

response = session.get(f"{wp_url}/wp-json/wp/v2/posts/15", timeout=10)
if response.status_code == 200:
    post = response.json()
    print("="*70)
    print("Full Post Response")
    print("="*70)
    print()
    
    if 'acf' in post:
        acf = post['acf']
        print(f"ACF fields found: {len(acf)}")
        print()
        print("All ACF field names:")
        for key in sorted(acf.keys()):
            value = acf[key]
            value_str = str(value)[:50] if value else 'None'
            print(f"  {key}: {value_str}")
        
        print()
        print("Scraper-related fields:")
        for key in ['scrape_enabled', 'scrape_url', 'version_selector', 'description_selector', 'scrape_frequency_hours']:
            if key in acf:
                print(f"  {key}: {repr(acf[key])}")
            else:
                print(f"  {key}: NOT FOUND")
    else:
        print("No 'acf' key in response")
        print("Available keys:", list(post.keys())[:10])
else:
    print(f"Failed: {response.status_code}")

