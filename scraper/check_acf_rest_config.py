#!/usr/bin/env python3
"""
Check if ACF fields are properly configured for REST API write access
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

def check_acf_rest_config():
    config = load_config()
    wp_config = config.get("wordpress", {})
    
    url = wp_config.get("url", "").rstrip('/')
    username = wp_config.get("username", "")
    password = wp_config.get("password", "")
    
    print("=" * 60)
    print("Checking ACF REST API Configuration")
    print("=" * 60)
    print(f"URL: {url}")
    print()
    
    session = requests.Session()
    session.auth = (username, password)
    session.headers.update({'User-Agent': 'ACF-Checker/1.0'})
    
    # Get a test post
    try:
        posts_response = session.get(f"{url}/wp-json/wp/v2/posts?per_page=1", timeout=10)
        if posts_response.status_code != 200:
            print(f"❌ Cannot fetch posts: {posts_response.status_code}")
            return
        
        posts = posts_response.json()
        if not posts or len(posts) == 0:
            print("❌ No posts found")
            return
        
        post_id = posts[0]['id']
        print(f"✅ Found test post ID: {post_id}")
        print()
        
        # Check ACF read access
        print("Test 1: Checking ACF read access...")
        acf_response = session.get(f"{url}/wp-json/acf/v3/posts/{post_id}", timeout=10)
        if acf_response.status_code == 200:
            acf_data = acf_response.json()
            print("✅ ACF read access works")
            if 'acf' in acf_data:
                fields = list(acf_data['acf'].keys())
                print(f"   Found {len(fields)} ACF fields: {', '.join(fields[:5])}...")
            print()
        else:
            print(f"❌ ACF read failed: {acf_response.status_code}")
            print()
        
        # Test ACF write access with a test field
        print("Test 2: Testing ACF write access...")
        test_data = {
            "fields": {
                "test_write_field": "test_value_12345"
            }
        }
        
        write_response = session.post(
            f"{url}/wp-json/acf/v3/posts/{post_id}",
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if write_response.status_code == 200:
            print("✅ ACF write access works!")
            print("   ACF fields are properly configured for REST API writes")
        elif write_response.status_code == 401:
            print("❌ Authentication failed (401)")
            print("   This is a WordPress.com authentication issue")
            print("   Response:", write_response.text[:200])
        elif write_response.status_code == 403:
            print("⚠️  Forbidden (403)")
            print("   ACF fields may not be configured for REST API writes")
            print("   Check ACF field group settings: 'Show in REST API' should be enabled")
            print("   Response:", write_response.text[:200])
        else:
            print(f"⚠️  Unexpected status: {write_response.status_code}")
            print("   Response:", write_response.text[:200])
        
        print()
        
        # Check if ACF to REST API plugin is active
        print("Test 3: Checking for ACF to REST API plugin...")
        plugins_response = session.get(f"{url}/wp-json/wp/v2/plugins", timeout=10)
        if plugins_response.status_code == 200:
            plugins = plugins_response.json()
            acf_rest_plugin = any('acf' in p.get('plugin', '').lower() and 'rest' in p.get('plugin', '').lower() 
                                 for p in plugins if isinstance(p, dict))
            if acf_rest_plugin:
                print("✅ ACF to REST API plugin appears to be active")
            else:
                print("⚠️  ACF to REST API plugin may not be active")
                print("   Install: Plugins → Add New → Search 'ACF to REST API'")
        else:
            print("⚠️  Cannot check plugins (may require different permissions)")
        
        print()
        print("=" * 60)
        print("Summary:")
        print("=" * 60)
        print("If write access failed with 401: WordPress.com authentication issue")
        print("If write access failed with 403: ACF fields not configured for REST API")
        print("If write access worked: Everything is configured correctly!")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_acf_rest_config()

