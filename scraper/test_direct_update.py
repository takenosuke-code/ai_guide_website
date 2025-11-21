#!/usr/bin/env python3
"""
Test direct update to see exact request/response
"""
import requests
import sys
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def test_direct_update():
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    session = requests.Session()
    session.auth = (wp_username, wp_password)
    session.headers.update({'User-Agent': 'Direct-Update-Test/1.0'})
    
    post_id = 15  # Gemini
    
    print("=" * 60)
    print("Testing Direct Update with Full Debug Info")
    print("=" * 60)
    print()
    
    # Test update
    test_data = {
        "fields": {
            "latest_version": "v 2.5 Flash DIRECT TEST",
            "latest_update": "2025, Nov, 17"
        }
    }
    
    print(f"Request URL: {wp_url}/wp-json/acf/v3/posts/{post_id}")
    print(f"Request Data: {json.dumps(test_data, indent=2)}")
    print()
    
    try:
        response = session.post(
            f"{wp_url}/wp-json/acf/v3/posts/{post_id}",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print()
        print("Response Body:")
        try:
            response_data = response.json()
            print(json.dumps(response_data, indent=2))
            
            # Check if values were saved
            if 'acf' in response_data:
                acf = response_data['acf']
                print()
                print("=" * 60)
                print("ACF Fields in Response:")
                print("=" * 60)
                if 'latest_version' in acf:
                    value = acf['latest_version']
                    print(f"latest_version: '{value}'")
                    if value == "v 2.5 Flash DIRECT TEST":
                        print("✅ VALUE WAS SAVED!")
                    elif value:
                        print(f"⚠️  Different value saved: '{value}'")
                    else:
                        print("❌ Value is empty/None - NOT SAVED")
                else:
                    print("❌ latest_version not in response")
        except:
            print(response.text[:500])
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    print()
    print("=" * 60)
    print("Now checking what's actually in WordPress...")
    print("=" * 60)
    
    # Check what's actually stored
    try:
        get_response = session.get(f"{wp_url}/wp-json/acf/v3/posts/{post_id}", timeout=10)
        if get_response.status_code == 200:
            data = get_response.json()
            if 'acf' in data:
                acf = data['acf']
                print(f"latest_version in WordPress: '{acf.get('latest_version', 'NOT FOUND')}'")
                print(f"latest_update in WordPress: '{acf.get('latest_update', 'NOT FOUND')}'")
    except Exception as e:
        print(f"Error checking: {e}")

if __name__ == "__main__":
    test_direct_update()

