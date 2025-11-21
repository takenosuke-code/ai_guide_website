#!/usr/bin/env python3
"""
Debug script to see what ACF fields are actually in WordPress
"""
import yaml
import requests
import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def load_config():
    wp_url = os.getenv("WP_URL")
    wp_username = os.getenv("WP_USERNAME")
    wp_password = os.getenv("WP_PASSWORD")
    
    if wp_url and wp_username and wp_password:
        return {
            "wordpress": {
                "url": wp_url,
                "username": wp_username,
                "password": wp_password
            }
        }
    
    with open("config.yaml", "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def debug_acf_fields():
    config = load_config()
    wp_config = config.get("wordpress", {})
    
    url = wp_config.get("url", "").rstrip('/')
    username = wp_config.get("username", "")
    password = wp_config.get("password", "")
    
    session = requests.Session()
    session.auth = (username, password)
    session.headers.update({'User-Agent': 'ACF-Debugger/1.0'})
    
    # Get Gemini post (ID: 15)
    print("=" * 60)
    print("Debugging ACF Fields for Gemini (Post ID: 15)")
    print("=" * 60)
    print()
    
    try:
        acf_response = session.get(f"{url}/wp-json/acf/v3/posts/15", timeout=10)
        if acf_response.status_code == 200:
            acf_data = acf_response.json()
            if 'acf' in acf_data:
                fields = acf_data['acf']
                print("All ACF fields for Gemini:")
                print("-" * 60)
                for key, value in sorted(fields.items()):
                    # Show first 100 chars of value
                    value_str = str(value)
                    if len(value_str) > 100:
                        value_str = value_str[:100] + "..."
                    print(f"  {key}: {value_str}")
                print()
                print("-" * 60)
                print()
                
                # Check for scrape-related fields
                scrape_fields = {k: v for k, v in fields.items() if 'scrape' in k.lower()}
                if scrape_fields:
                    print("Scrape-related fields found:")
                    for key, value in scrape_fields.items():
                        print(f"  ✅ {key}: {value}")
                else:
                    print("⚠️  No fields with 'scrape' in the name found")
                    print("   Looking for fields like: scrape_enabled, scrape_url, etc.")
                    print()
                    print("   Common field name variations:")
                    print("   - scrape_enabled")
                    print("   - scrapeEnabled")
                    print("   - scrape_url")
                    print("   - scrapeUrl")
                    print("   - version_selector")
                    print("   - versionSelector")
            else:
                print("❌ No 'acf' key in response")
                print("Response:", acf_data)
        else:
            print(f"❌ Failed to fetch ACF: {acf_response.status_code}")
            print(acf_response.text)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_acf_fields()

