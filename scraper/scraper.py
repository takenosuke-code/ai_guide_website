#!/usr/bin/env python3
"""
Generic AI Tool Scraper
Reads scraping configuration from WordPress ACF fields and updates tool data
"""
import yaml
import sys
import os
from datetime import datetime
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from wordpress import WordPressClient
from scraper_engine import scrape_tool, should_scrape

# Fix Windows console encoding for emoji
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Load .env file if it exists
load_dotenv()


def load_config() -> Dict[str, Any]:
    """Load configuration from .env file or config.yaml"""
    config = {}
    
    # Try loading from .env file first
    wp_url = os.getenv("WP_URL")
    wp_username = os.getenv("WP_USERNAME")
    wp_password = os.getenv("WP_PASSWORD")
    wp_category = os.getenv("WP_CATEGORY_SLUG", "ai-review")
    wp_plugin_endpoint = os.getenv("WP_PLUGIN_ENDPOINT")
    
    if wp_url and wp_username and wp_password:
        # Use .env file
        config = {
            "wordpress": {
                "url": wp_url,
                "username": wp_username,
                "password": wp_password,
                "category_slug": wp_category,
                "plugin_endpoint": wp_plugin_endpoint
            },
            "scraper": {
                "user_agent": os.getenv("SCRAPER_USER_AGENT", "Mozilla/5.0 (compatible; AI-Scraper/1.0)"),
                "timeout": int(os.getenv("SCRAPER_TIMEOUT", "10")),
                "min_hours_between_scrapes": int(os.getenv("SCRAPER_MIN_HOURS", "1"))
            }
        }
        print("✅ Loaded configuration from .env file")
        return config
    
    # Fallback to config.yaml
    config_path = "config.yaml"
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            config = yaml.safe_load(f)
            print("✅ Loaded configuration from config.yaml")
            return config
    except FileNotFoundError:
        print(f"❌ Config file not found: {config_path}")
        print("   Please create .env file or config.yaml")
        print("   See .env.example for .env format")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error loading config: {e}")
        sys.exit(1)


def map_extracted_to_acf(extracted: Dict[str, Any]) -> Dict[str, Any]:
    """
    Map extracted fields to ACF field names
    
    Args:
        extracted: Dictionary from extractor (version, owner, description, image_url)
        
    Returns:
        Dictionary with ACF field names (latestVersion, seller, etc.)
    """
    import re
    
    mapping = {
        "version": "latest_version",      # WordPress uses snake_case
        "owner": "seller",                # Your existing ACF field
        "description": "overview",        # Overview field
        "image_url": "logo",              # Logo URL
        "published_date": "published_date",  # Published date field
        "product_website": "product_website"  # Product website URL
    }
    
    acf_fields = {}
    
    for extracted_key, acf_key in mapping.items():
        if extracted_key in extracted and extracted[extracted_key]:
            value = extracted[extracted_key]
            
            # Post-process version field to extract just the version number
            if extracted_key == "version" and value:
                # Try to extract version number from text like "Gemini 2.5 Flash" or "version 2.5"
                version_patterns = [
                    r'Gemini\s+([\d.]+(?:\s+[A-Za-z]+)?)',  # "Gemini 2.5 Flash" -> "2.5 Flash"
                    r'version\s+([\d.]+(?:\s+[A-Za-z]+)?)',  # "version 2.5 Flash" -> "2.5 Flash"
                    r'v\s*([\d.]+(?:\s+[A-Za-z]+)?)',  # "v 2.5 Flash" -> "2.5 Flash"
                    r'([\d]+\.[\d]+(?:\s+[A-Za-z]+)?)',  # "2.5 Flash" -> "2.5 Flash"
                ]
                
                for pattern in version_patterns:
                    match = re.search(pattern, value, re.IGNORECASE)
                    if match:
                        # Get the captured group or the full match
                        extracted_version = match.group(1) if match.lastindex else match.group(0)
                        # Prepend "v " if it doesn't start with a letter
                        if not extracted_version[0].isalpha():
                            extracted_version = f"v {extracted_version}"
                        value = extracted_version.strip()
                        break
            
            acf_fields[acf_key] = value
    
    return acf_fields


def main():
    """Main scraper function"""
    print("=" * 60)
    print("🤖 AI Tool Scraper - Starting")
    print("=" * 60)
    
    # Load config
    config = load_config()
    wp_config = config.get("wordpress", {})
    scraper_config = config.get("scraper", {})
    
    # Validate config
    required = ["url", "username", "password", "category_slug"]
    for key in required:
        if not wp_config.get(key):
            print(f"❌ Missing required config: wordpress.{key}")
            sys.exit(1)
    
    # Initialize WordPress client
    wp = WordPressClient(
        wp_config["url"],
        wp_config["username"],
        wp_config["password"],
        plugin_endpoint=wp_config.get("plugin_endpoint")
    )
    
    # Get all tools
    category_slug = wp_config["category_slug"]
    tools = wp.get_tools(category_slug)
    
    if not tools:
        print("⚠️ No tools found. Make sure:")
        print(f"   1. Category '{category_slug}' exists")
        print(f"   2. Posts are published in that category")
        print(f"   3. Posts have ACF fields configured")
        return
    
    print(f"\n📋 Processing {len(tools)} tools...\n")
    
    # Process each tool
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    for tool in tools:
        tool_id = tool["id"]
        tool_title = tool.get("title", {}).get("rendered", f"Post #{tool_id}")
        
        print(f"\n🔍 Tool: {tool_title} (ID: {tool_id})")
        
        # Get ACF fields
        acf = wp.get_tool_acf(tool_id)
        
        if not acf:
            print(f"  ⚠️ No ACF data found - skipping")
            skipped_count += 1
            continue
        
        # Check if scraping is enabled
        # Field names are camelCase (GraphQL format): scrapeEnabled, scrapeUrl, etc.
        # ACF True/False fields can be returned as boolean, string "1"/"0", or int 1/0
        scrape_enabled_raw = acf.get("scrapeEnabled") or acf.get("scrape_enabled")  # Try both formats
        scrape_enabled = (
            scrape_enabled_raw is True or 
            scrape_enabled_raw == 1 or 
            str(scrape_enabled_raw).lower() in ('1', 'true', 'yes', 'on')
        )
        
        if not scrape_enabled:
            print(f"  ⏭️  Scraping disabled - skipping (value: {scrape_enabled_raw})")
            skipped_count += 1
            continue
        
        # Get scrape URL (camelCase: scrapeUrl)
        scrape_url = acf.get("scrapeUrl") or acf.get("scrape_url")
        if not scrape_url:
            print(f"  ⚠️ No scrape_url configured - skipping")
            skipped_count += 1
            continue
        
        # Check scrape frequency (camelCase: scrapeFrequencyHours)
        frequency_hours = acf.get("scrapeFrequencyHours") or acf.get("scrape_frequency_hours", 24)
        last_scraped = acf.get("last_scraped")  # Keep snake_case for this one
        min_hours = scraper_config.get("min_hours_between_scrapes", 1)
        
        if not should_scrape(last_scraped, frequency_hours, min_hours):
            hours_since = 0
            if last_scraped:
                try:
                    last_time = datetime.fromisoformat(last_scraped.replace('Z', '+00:00'))
                    now = datetime.now(last_time.tzinfo) if last_time.tzinfo else datetime.now()
                    hours_since = (now - last_time).total_seconds() / 3600
                except:
                    pass
            
            print(f"  ⏸️  Too soon to scrape (last: {hours_since:.1f}h ago, frequency: {frequency_hours}h)")
            skipped_count += 1
            continue
        
        # Get selectors (camelCase: versionSelector, descriptionSelector, ownerSelector, etc.)
        selectors = {
            "version_selector": acf.get("versionSelector") or acf.get("version_selector"),
            "owner_selector": acf.get("ownerSelector") or acf.get("owner_selector"),
            "description_selector": acf.get("descriptionSelector") or acf.get("description_selector"),
            "image_selector": acf.get("imageSelector") or acf.get("image_selector"),
            "published_selector": acf.get("publishedSelector") or acf.get("published_selector"),
            "product_website_selector": acf.get("productWebsiteSelector") or acf.get("product_website_selector"),
        }
        
        # Debug: Show what selectors we're using
        print(f"  🔍 Selectors: version={selectors.get('version_selector')}, owner={selectors.get('owner_selector')}, desc={selectors.get('description_selector')}")
        
        # Check if any selectors are configured
        if not any(selectors.values()):
            print(f"  ⚠️ No selectors configured - skipping")
            skipped_count += 1
            continue
        
        # Scrape
        try:
            user_agent = scraper_config.get("user_agent", "Mozilla/5.0")
            timeout = scraper_config.get("timeout", 10)
            
            result = scrape_tool(tool_id, scrape_url, selectors, user_agent, timeout)
            
            if result:
                # Map extracted fields to ACF field names
                acf_updates = map_extracted_to_acf(result)
                
                if acf_updates:
                    # Update last_scraped timestamp
                    acf_updates["last_scraped"] = datetime.now().isoformat()
                    
                    # Update latest_update with current date (format: YYYY, MMM, DD)
                    now = datetime.now()
                    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    acf_updates["latest_update"] = f"{now.year}, {month_names[now.month-1]}, {now.day:02d}"
                    
                    # If published_date was scraped but is empty, don't overwrite existing value
                    if "published_date" in acf_updates and not acf_updates["published_date"]:
                        del acf_updates["published_date"]
                    
                    # Clear error log on success
                    acf_updates["scrape_error_log"] = ""
                    
                    # Show what would be updated
                    print(f"  📝 Would update {len(acf_updates)} fields:")
                    for field, value in acf_updates.items():
                        if field not in ["last_scraped", "scrape_error_log"]:  # Don't show internal fields
                            print(f"     - {field}: {str(value)[:80]}...")
                    
                    # Update WordPress
                    success = wp.update_tool_acf(tool_id, acf_updates)
                    
                    if success:
                        print(f"  ✅ Updated WordPress with {len(acf_updates)} fields")
                        updated_count += 1
                    else:
                        print(f"  ⚠️  Could not update WordPress (authentication may have failed)")
                        print(f"  💡 This is normal for WordPress.com - the scraper can read but not write")
                        print(f"  💡 Scraped data shown above - you can manually update WordPress if needed")
                        error_count += 1
                else:
                    print(f"  ⚠️ No fields to update")
                    skipped_count += 1
            else:
                print(f"  ✓ No changes detected")
                # Still update last_scraped to prevent re-scraping
                # Note: last_scraped might be in a different field group, use snake_case
                wp.update_tool_acf(tool_id, {
                    "last_scraped": datetime.now().isoformat()
                })
                skipped_count += 1
                
        except Exception as e:
            error_msg = f"Error scraping {tool_title}: {str(e)}"
            print(f"  ❌ {error_msg}")
            
            # Log error to WordPress (camelCase: scrapeErrorLog)
            wp.update_tool_acf(tool_id, {
                "scrapeErrorLog": f"{datetime.now().isoformat()}: {error_msg}"
            })
            
            error_count += 1
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Summary")
    print("=" * 60)
    print(f"✅ Updated: {updated_count}")
    print(f"⏭️  Skipped: {skipped_count}")
    print(f"❌ Errors: {error_count}")
    print(f"📋 Total: {len(tools)}")
    print("=" * 60)


if __name__ == "__main__":
    main()


