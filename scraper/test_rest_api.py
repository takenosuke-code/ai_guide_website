#!/usr/bin/env python3
"""
Test script to verify WordPress REST API access
Run this to check if your WordPress URL works with the scraper
"""
import yaml
import requests
import sys
import os
from dotenv import load_dotenv

# Load .env file if it exists
load_dotenv()

# Fix Windows console encoding for emoji
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

def load_config():
    """Load configuration from .env file or config.yaml"""
    # Try loading from .env file first
    wp_url = os.getenv("WP_URL")
    wp_username = os.getenv("WP_USERNAME")
    wp_password = os.getenv("WP_PASSWORD")
    wp_category = os.getenv("WP_CATEGORY_SLUG", "ai-review")
    
    if wp_url and wp_username and wp_password:
        return {
            "wordpress": {
                "url": wp_url,
                "username": wp_username,
                "password": wp_password,
                "category_slug": wp_category
            }
        }
    
    # Fallback to config.yaml
    try:
        with open("config.yaml", "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"❌ Error loading config: {e}")
        sys.exit(1)

def test_rest_api():
    """Test WordPress REST API endpoints"""
    config = load_config()
    wp_config = config.get("wordpress", {})
    
    url = wp_config.get("url", "").rstrip('/')
    username = wp_config.get("username", "")
    password = wp_config.get("password", "")
    category_slug = wp_config.get("category_slug", "ai-review")
    
    if not url or url == "https://YOUR-WEBSITE.com":
        print("❌ Please set your WordPress URL in config.yaml")
        return False
    
    print("=" * 60)
    print("🧪 Testing WordPress REST API")
    print("=" * 60)
    print(f"WordPress URL: {url}")
    print(f"Username: {username}")
    print()
    
    # Create session with auth
    session = requests.Session()
    session.auth = (username, password)
    session.headers.update({'User-Agent': 'AI-Tool-Scraper-Test/1.0'})
    
    # Test 1: Check if REST API is accessible
    print("Test 1: Checking REST API accessibility...")
    try:
        response = session.get(f"{url}/wp-json/", timeout=10)
        if response.status_code == 200:
            print("✅ REST API is accessible")
            api_data = response.json()
            if 'namespaces' in api_data:
                print(f"   Available namespaces: {', '.join(api_data['namespaces'][:5])}")
        else:
            print(f"⚠️ REST API returned status {response.status_code}")
    except Exception as e:
        print(f"❌ Cannot access REST API: {e}")
        return False
    
    print()
    
    # Test 2: Check if ACF REST API plugin is installed
    print("Test 2: Checking ACF REST API support...")
    try:
        # Try to get a test post first
        posts_response = session.get(f"{url}/wp-json/wp/v2/posts?per_page=1", timeout=10)
        if posts_response.status_code == 200:
            posts = posts_response.json()
            if posts and len(posts) > 0:
                test_post_id = posts[0]['id']
                print(f"   Found test post ID: {test_post_id}")
                
                # Try ACF endpoint
                acf_response = session.get(f"{url}/wp-json/acf/v3/posts/{test_post_id}", timeout=10)
                if acf_response.status_code == 200:
                    print("✅ ACF REST API is working!")
                    acf_data = acf_response.json()
                    if 'acf' in acf_data:
                        fields = list(acf_data['acf'].keys())[:5]
                        print(f"   Found ACF fields: {', '.join(fields)}...")
                    else:
                        print("   ACF endpoint works but no 'acf' key found")
                elif acf_response.status_code == 404:
                    print("⚠️ ACF REST API endpoint not found (404)")
                    print("   You may need to install 'ACF to REST API' plugin")
                else:
                    print(f"⚠️ ACF REST API returned status {acf_response.status_code}")
            else:
                print("⚠️ No posts found to test ACF")
        else:
            print(f"⚠️ Cannot fetch posts: {posts_response.status_code}")
    except Exception as e:
        print(f"❌ Error testing ACF: {e}")
    
    print()
    
    # Test 3: Check category
    print(f"Test 3: Checking category '{category_slug}'...")
    try:
        cat_response = session.get(
            f"{url}/wp-json/wp/v2/categories",
            params={"slug": category_slug, "per_page": 1},
            timeout=10
        )
        if cat_response.status_code == 200:
            categories = cat_response.json()
            if categories and len(categories) > 0:
                cat = categories[0]
                print(f"✅ Category found: {cat['name']} (ID: {cat['id']})")
            else:
                print(f"⚠️ Category '{category_slug}' not found")
        else:
            print(f"⚠️ Cannot fetch categories: {cat_response.status_code}")
    except Exception as e:
        print(f"❌ Error checking category: {e}")
    
    print()
    
    # Test 4: Check authentication
    print("Test 4: Testing authentication...")
    try:
        # Try to access a protected endpoint
        me_response = session.get(f"{url}/wp-json/wp/v2/users/me", timeout=10)
        if me_response.status_code == 200:
            user_data = me_response.json()
            print(f"✅ Authentication successful!")
            print(f"   Logged in as: {user_data.get('name', 'Unknown')}")
        elif me_response.status_code == 401:
            print("❌ Authentication failed - check username and application password")
            print(f"   Response: {me_response.text[:200]}")
            print()
            print("   Troubleshooting:")
            print("   1. Make sure you're using an Application Password (not your regular password)")
            print("   2. Application Password should be 24 characters with spaces")
            print("   3. Try removing spaces from the password in config.yaml")
            print("   4. For WordPress.com, you might need to use your email instead of username")
            return False
        else:
            print(f"⚠️ Unexpected status: {me_response.status_code}")
            print(f"   Response: {me_response.text[:200]}")
    except Exception as e:
        print(f"❌ Error testing authentication: {e}")
    
    print()
    print("=" * 60)
    print("✅ Testing complete!")
    print("=" * 60)
    print()
    print("If all tests passed, your WordPress URL is correct for the scraper.")
    print("The scraper uses REST API, not the public frontend.")
    
    return True

if __name__ == "__main__":
    test_rest_api()

