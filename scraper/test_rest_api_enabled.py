#!/usr/bin/env python3
"""
Test if REST API is enabled for ACF fields by checking the schema
"""
import requests
import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_rest_api_enabled():
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    if not wp_url or not wp_username or not wp_password:
        print("❌ Missing .env configuration")
        return
    
    session = requests.Session()
    session.auth = (wp_username, wp_password)
    session.headers.update({'User-Agent': 'REST-API-Test/1.0'})
    
    print("=" * 60)
    print("Testing if REST API is enabled for ACF fields")
    print("=" * 60)
    print()
    
    # Test 1: Check if ACF fields appear in standard posts endpoint
    print("Test 1: Checking if ACF fields appear in /wp/v2/posts endpoint...")
    try:
        response = session.get(f"{wp_url}/wp-json/wp/v2/posts?per_page=1", timeout=10)
        if response.status_code == 200:
            posts = response.json()
            if posts and len(posts) > 0:
                post = posts[0]
                if 'acf' in post:
                    print("✅ ACF fields found in standard posts endpoint!")
                    acf_fields = list(post['acf'].keys())[:5]
                    print(f"   Found fields: {', '.join(acf_fields)}...")
                    print("   → REST API is ENABLED for this field group")
                else:
                    print("⚠️  No 'acf' key in post response")
                    print("   → REST API might not be enabled, or fields are empty")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    
    # Test 2: Check OPTIONS request for schema
    print("Test 2: Checking REST API schema (OPTIONS request)...")
    try:
        response = session.options(f"{wp_url}/wp-json/wp/v2/posts/15", timeout=10)
        if response.status_code == 200:
            schema = response.json()
            if 'schema' in schema and 'properties' in schema['schema']:
                properties = schema['schema']['properties']
                if 'acf' in properties:
                    print("✅ 'acf' found in REST API schema!")
                    print("   → REST API is ENABLED")
                else:
                    print("⚠️  'acf' not found in schema")
                    print("   → REST API might not be enabled")
        else:
            print(f"⚠️  OPTIONS returned: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    print("=" * 60)
    print("Summary:")
    print("=" * 60)
    print("If ACF fields appear in the posts endpoint, REST API is enabled.")
    print("The 'Show in REST API' setting might be:")
    print("  1. Enabled by default in ACF 6.6.2")
    print("  2. Hidden on WordPress.com")
    print("  3. In a different location in the settings")
    print()
    print("Since our earlier tests showed write access works, REST API is")
    print("likely already enabled, even if you can't see the setting.")

if __name__ == "__main__":
    test_rest_api_enabled()

