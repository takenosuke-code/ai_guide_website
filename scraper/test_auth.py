#!/usr/bin/env python3
"""
Test different authentication methods for WordPress.com
"""
import yaml
import requests
import sys
import os
import base64
from dotenv import load_dotenv

# Load .env file if it exists
load_dotenv()

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def load_config():
    # Try loading from .env file first
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
    
    # Fallback to config.yaml
    with open("config.yaml", "r", encoding="utf-8") as f:
        return yaml.safe_load(f)

def test_auth_methods():
    config = load_config()
    wp_config = config.get("wordpress", {})
    
    url = wp_config.get("url", "").rstrip('/')
    username = wp_config.get("username", "")
    password = wp_config.get("password", "")
    
    print("=" * 60)
    print("Testing Authentication Methods")
    print("=" * 60)
    print(f"URL: {url}")
    print(f"Username: {username}")
    print(f"Password: {password[:10]}...")
    print()
    
    # Test 1: Basic Auth with spaces in password (original format)
    print("Test 1: Basic Auth with password WITH spaces...")
    password_with_spaces = "a6Zc YEQH H9G5 u2Yo EATP 17bC"
    session1 = requests.Session()
    session1.auth = (username, password_with_spaces)
    try:
        response = session1.get(f"{url}/wp-json/wp/v2/users/me", timeout=10)
        if response.status_code == 200:
            print("✅ SUCCESS with spaces!")
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    
    # Test 2: Basic Auth without spaces (current config)
    print("Test 2: Basic Auth with password WITHOUT spaces...")
    session2 = requests.Session()
    session2.auth = (username, password)
    try:
        response = session2.get(f"{url}/wp-json/wp/v2/users/me", timeout=10)
        if response.status_code == 200:
            print("✅ SUCCESS without spaces!")
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    
    # Test 3: Manual Authorization header
    print("Test 3: Manual Authorization header...")
    credentials = f"{username}:{password}"
    encoded = base64.b64encode(credentials.encode()).decode()
    headers = {'Authorization': f'Basic {encoded}'}
    try:
        response = requests.get(f"{url}/wp-json/wp/v2/users/me", headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ SUCCESS with manual header!")
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()
    print("=" * 60)
    print("All authentication methods failed.")
    print()
    print("WordPress.com may have restrictions on REST API write access.")
    print("Possible solutions:")
    print("1. Verify Application Password is correct in WordPress.com dashboard")
    print("2. Check if your WordPress.com plan supports REST API write access")
    print("3. Consider using WordPress.com API or OAuth instead")
    print("4. The scraper can still READ configuration, but cannot UPDATE fields")
    print("=" * 60)
    
    return False

if __name__ == "__main__":
    test_auth_methods()

