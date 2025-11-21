#!/usr/bin/env python3
"""
Check WordPress user information to determine correct username format
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

def check_public_user_info():
    """Try to get user info from public endpoints"""
    wp_url = os.getenv("WP_URL", "").rstrip('/')
    
    # Ensure HTTPS
    if wp_url.startswith('http://'):
        wp_url = wp_url.replace('http://', 'https://')
    
    print("="*60)
    print("Checking WordPress User Information")
    print("="*60)
    print(f"URL: {wp_url}")
    print()
    
    # Try to get posts to see author info
    try:
        response = requests.get(f"{wp_url}/wp-json/wp/v2/posts?per_page=1", timeout=10)
        if response.status_code == 200:
            posts = response.json()
            if posts:
                author_id = posts[0].get('author')
                print(f"✅ Found post by author ID: {author_id}")
                
                # Try to get author info
                author_response = requests.get(f"{wp_url}/wp-json/wp/v2/users/{author_id}", timeout=10)
                if author_response.status_code == 200:
                    author = author_response.json()
                    print()
                    print("Author Information:")
                    print(f"   ID: {author.get('id')}")
                    print(f"   Name: {author.get('name')}")
                    print(f"   Username (slug): {author.get('slug')}")
                    print(f"   Email: {author.get('email', 'N/A (requires auth)')}")
                    print()
                    print("="*60)
                    print("RECOMMENDATION")
                    print("="*60)
                    print(f"Try using USERNAME: {author.get('slug')}")
                    print(f"Or EMAIL: {os.getenv('WP_USERNAME', 'your-email@example.com')}")
                    print()
                    print("For Application Passwords:")
                    print("1. Both username and email should work")
                    print("2. Application Password must be exactly 24 characters")
                    print("3. Create it at: WordPress.com → Users → Application Passwords")
                    return author.get('slug')
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return None

if __name__ == "__main__":
    wp_username = os.getenv("WP_USERNAME", "")
    wp_password = os.getenv("WP_PASSWORD", "")
    
    print(f"Current .env settings:")
    print(f"  WP_USERNAME: {wp_username}")
    print(f"  WP_PASSWORD length: {len(wp_password)} chars")
    print()
    
    if len(wp_password) != 24:
        print("⚠️  WARNING: Application Password should be 24 characters!")
        print(f"   Your password is {len(wp_password)} characters")
        print()
        print("Application Passwords:")
        print("- Are exactly 24 characters long")
        print("- Format: xxxx xxxx xxxx xxxx xxxx xxxx (with spaces)")
        print("- Or: xxxxxxxxxxxxxxxxxxxxxxxx (without spaces)")
        print()
        print("If you're using your regular WordPress password, you need to:")
        print("1. Go to WordPress.com → Users → Application Passwords")
        print("2. Create a new Application Password")
        print("3. Copy the 24-character password")
        print("4. Update WP_PASSWORD in .env file")
        print()
    
    username = check_public_user_info()
    
    print()
    print("="*60)
    print("NEXT STEPS")
    print("="*60)
    print("1. Create Application Password (24 chars) in WordPress.com")
    print("2. Update WP_PASSWORD in .env with the Application Password")
    print(f"3. Try WP_USERNAME as: {wp_username} (email)")
    if username:
        print(f"   Or try: {username} (username)")
    print("4. Both should work - Application Passwords accept either")

