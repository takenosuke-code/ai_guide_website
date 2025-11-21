"""
Scraper Engine - Core logic for scraping and caching
"""
import os
import json
from datetime import datetime, timedelta
from typing import Dict, Optional, Any
from extractor import extract_fields


def get_cache_dir() -> str:
    """Get cache directory path"""
    cache_dir = os.path.join(os.path.dirname(__file__), "cache")
    os.makedirs(cache_dir, exist_ok=True)
    return cache_dir


def load_cache(tool_id: int) -> Optional[Dict[str, Any]]:
    """
    Load cached data for a tool
    
    Args:
        tool_id: WordPress post ID
        
    Returns:
        Cached data dictionary or None if not found
    """
    cache_file = os.path.join(get_cache_dir(), f"{tool_id}.json")
    
    if not os.path.exists(cache_file):
        return None
    
    try:
        with open(cache_file, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"  ⚠️ Error loading cache for tool {tool_id}: {e}")
        return None


def save_cache(tool_id: int, data: Dict[str, Any]) -> None:
    """
    Save scraped data to cache
    
    Args:
        tool_id: WordPress post ID
        data: Data to cache
    """
    cache_file = os.path.join(get_cache_dir(), f"{tool_id}.json")
    
    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"  ⚠️ Error saving cache for tool {tool_id}: {e}")


def should_scrape(
    last_scraped: Optional[str],
    frequency_hours: int,
    min_hours: int = 1
) -> bool:
    """
    Check if tool should be scraped based on last scraped time and frequency
    
    Args:
        last_scraped: ISO format timestamp string or None
        frequency_hours: How often to scrape (in hours)
        min_hours: Minimum hours between scrapes (to prevent spam)
        
    Returns:
        True if should scrape, False otherwise
    """
    if not last_scraped:
        return True  # Never scraped, do it now
    
    try:
        last_time = datetime.fromisoformat(last_scraped.replace('Z', '+00:00'))
        now = datetime.now(last_time.tzinfo) if last_time.tzinfo else datetime.now()
        
        hours_since = (now - last_time).total_seconds() / 3600
        
        # Must wait at least min_hours, and at least frequency_hours
        required_hours = max(min_hours, frequency_hours)
        
        return hours_since >= required_hours
    except Exception as e:
        print(f"  ⚠️ Error parsing last_scraped time: {e}")
        return True  # If error, scrape anyway


def scrape_tool(
    tool_id: int,
    url: str,
    selectors: Dict[str, Optional[str]],
    user_agent: str = "Mozilla/5.0",
    timeout: int = 10
) -> Optional[Dict[str, Any]]:
    """
    Scrape a tool and compare with cache
    
    Args:
        tool_id: WordPress post ID
        url: URL to scrape
        selectors: CSS selectors dictionary
        user_agent: User agent for requests
        timeout: Request timeout
        
    Returns:
        Dictionary of changed fields if data changed, None if no change
    """
    from extractor import extract_fields
    
    # Extract current data
    latest = extract_fields(url, selectors, user_agent, timeout)
    
    if not latest:
        return None  # Failed to extract
    
    # Load old cache
    old = load_cache(tool_id)
    
    # Compare (only check fields that were extracted)
    if old:
        # Check if any extracted fields changed
        changed = False
        changes = {}
        
        for key, new_value in latest.items():
            old_value = old.get(key)
            if old_value != new_value:
                changed = True
                changes[key] = new_value
                print(f"    📝 {key}: '{old_value}' → '{new_value}'")
        
        if not changed:
            print(f"  ✓ No changes detected")
            # Still update cache timestamp
            save_cache(tool_id, {**old, **latest, "last_scraped": datetime.now().isoformat()})
            return None
        
        # Save updated cache
        save_cache(tool_id, {**old, **latest, "last_scraped": datetime.now().isoformat()})
        return changes
    else:
        # First time scraping - save cache
        print(f"  📦 First scrape - saving to cache")
        save_cache(tool_id, {**latest, "last_scraped": datetime.now().isoformat()})
        return latest  # Return all fields as "new"


