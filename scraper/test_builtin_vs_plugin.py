#!/usr/bin/env python3
"""
Test both plugin endpoint and built-in ACF REST API endpoint
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

def test_both_methods():
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    session = requests.Session()
    session.auth = (wp_username, wp_password)
    session.headers.update({'User-Agent': 'Endpoint-Test/1.0'})
    
    post_id = 15  # Gemini
    
    print("=" * 60)
    print("Testing Plugin vs Built-in ACF REST API")
    print("=" * 60)
    print()
    
    # Test 1: Plugin endpoint (current method)
    print("Test 1: Plugin endpoint (/wp-json/acf/v3/posts/{id})")
    print("-" * 60)
    try:
        response = session.post(
            f"{wp_url}/wp-json/acf/v3/posts/{post_id}",
            json={"fields": {"latest_version": "v 2.5 Flash TEST PLUGIN"}},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if 'acf' in data and 'latest_version' in data['acf']:
                value = data['acf']['latest_version']
                print(f"✅ Plugin endpoint works")
                print(f"   Response value: {value[:50]}...")
                if value == "v 2.5 Flash TEST PLUGIN":
                    print("   ✅ Value was saved!")
                else:
                    print(f"   ⚠️  Value NOT saved (got: {value})")
            else:
                print("   ⚠️  Response doesn't contain expected structure")
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"   {response.text[:200]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    
    # Test 2: Built-in endpoint (standard WordPress)
    print("Test 2: Built-in endpoint (/wp-json/wp/v2/posts/{id})")
    print("-" * 60)
    try:
        response = session.post(
            f"{wp_url}/wp-json/wp/v2/posts/{post_id}",
            json={"acf": {"latest_version": "v 2.5 Flash TEST BUILTIN"}},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if 'acf' in data and 'latest_version' in data['acf']:
                value = data['acf']['latest_version']
                print(f"✅ Built-in endpoint works")
                print(f"   Response value: {value[:50]}...")
                if value == "v 2.5 Flash TEST BUILTIN":
                    print("   ✅ Value was saved!")
                else:
                    print(f"   ⚠️  Value NOT saved (got: {value})")
            else:
                print("   ⚠️  Response doesn't contain expected structure")
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"   {response.text[:200]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    print("=" * 60)
    print("Recommendation:")
    print("=" * 60)
    print("Keep the plugin if it's working. The issue is WordPress.com")
    print("not saving updates, which won't be fixed by switching methods.")
    print()
    print("However, if built-in method shows 'Value was saved!', you could")
    print("switch to that method instead.")

if __name__ == "__main__":
    test_both_methods()

