#!/usr/bin/env python3
"""
Test updating a single ACF field to see what format WordPress expects
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

def test_update():
    config = load_config()
    wp_config = config.get("wordpress", {})
    
    url = wp_config.get("url", "").rstrip('/')
    username = wp_config.get("username", "")
    password = wp_config.get("password", "")
    
    session = requests.Session()
    session.auth = (username, password)
    session.headers.update({'User-Agent': 'Test-Update/1.0'})
    
    post_id = 15  # Gemini
    
    print("Testing ACF field update formats...")
    print("=" * 60)
    
    # Test 1: Try camelCase (latestVersion)
    print("\nTest 1: Updating with camelCase (latestVersion)")
    data1 = {"fields": {"latestVersion": "v 2.5 Flash TEST"}}
    try:
        response = session.post(
            f"{url}/wp-json/acf/v3/posts/{post_id}",
            json=data1,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}")
        if response.status_code == 200:
            print("✅ Update successful!")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Try snake_case (latest_version)
    print("\nTest 2: Updating with snake_case (latest_version)")
    data2 = {"fields": {"latest_version": "v 2.5 Flash TEST2"}}
    try:
        response = session.post(
            f"{url}/wp-json/acf/v3/posts/{post_id}",
            json=data2,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}")
        if response.status_code == 200:
            print("✅ Update successful!")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Verify what's actually in WordPress now
    print("\n" + "=" * 60)
    print("Verifying current value in WordPress:")
    try:
        acf_response = session.get(f"{url}/wp-json/acf/v3/posts/{post_id}", timeout=10)
        if acf_response.status_code == 200:
            acf_data = acf_response.json()
            if 'acf' in acf_data:
                fields = acf_data['acf']
                print(f"latestVersion: {fields.get('latestVersion', 'NOT FOUND')}")
                print(f"latest_version: {fields.get('latest_version', 'NOT FOUND')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_update()

