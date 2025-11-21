"""
Generic HTML Extractor
Extracts data from HTML using CSS selectors
"""
import requests
from bs4 import BeautifulSoup
from typing import Dict, Optional
import time


def extract_fields(
    url: str,
    selectors: Dict[str, Optional[str]],
    user_agent: str = "Mozilla/5.0",
    timeout: int = 10
) -> Dict[str, Optional[str]]:
    """
    Extract fields from a webpage using CSS selectors
    
    Args:
        url: URL to scrape
        selectors: Dictionary mapping field names to CSS selectors
                  Example: {"version": "h2.latest-version", "owner": ".company-name"}
        user_agent: User agent string for requests
        timeout: Request timeout in seconds
        
    Returns:
        Dictionary with extracted values
        Example: {"version": "v2.0", "owner": "OpenAI", "description": "...", "image_url": "..."}
    """
    headers = {
        "User-Agent": user_agent,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate",
        "Connection": "keep-alive",
    }
    
    try:
        print(f"  📥 Fetching: {url}")
        response = requests.get(url, headers=headers, timeout=timeout)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.text, "html.parser")
        
        def get_text(selector: Optional[str]) -> Optional[str]:
            """Extract text from element matching selector"""
            if not selector or not selector.strip():
                return None
            
            try:
                element = soup.select_one(selector)
                if element:
                    # Get text and clean it up
                    text = element.get_text(separator=" ", strip=True)
                    return text if text else None
                return None
            except Exception as e:
                print(f"    ⚠️ Error with selector '{selector}': {e}")
                return None
        
        def get_src(selector: Optional[str]) -> Optional[str]:
            """Extract src/href attribute from element"""
            if not selector or not selector.strip():
                return None
            
            try:
                element = soup.select_one(selector)
                if element:
                    # Try src first (for images)
                    if element.has_attr('src'):
                        src = element['src']
                    # Try href (for links)
                    elif element.has_attr('href'):
                        src = element['href']
                    # Try data-src (lazy loading)
                    elif element.has_attr('data-src'):
                        src = element['data-src']
                    else:
                        return None
                    
                    # Make absolute URL if relative
                    if src.startswith('//'):
                        src = 'https:' + src
                    elif src.startswith('/'):
                        from urllib.parse import urljoin
                        src = urljoin(url, src)
                    
                    return src
                return None
            except Exception as e:
                print(f"    ⚠️ Error with image selector '{selector}': {e}")
                return None
        
        # Extract all fields
        result = {
            "version": get_text(selectors.get("version_selector")),
            "owner": get_text(selectors.get("owner_selector")),
            "description": get_text(selectors.get("description_selector")),
            "image_url": get_src(selectors.get("image_selector")),
            "published_date": get_text(selectors.get("published_selector")),
            "product_website": get_src(selectors.get("product_website_selector"))
        }
        
        # Debug: Check owner value
        owner_selector = selectors.get("owner_selector")
        owner_value = result.get("owner")
        print(f"    🔍 Owner selector: '{owner_selector}' → result: {repr(owner_value)}")
        
        # If owner selector didn't work, try to extract from URL
        if not result.get("owner"):
            from urllib.parse import urlparse
            domain = urlparse(url).netloc
            # Extract company name from domain (e.g., gemini.google.com -> Google)
            if "google.com" in domain:
                result["owner"] = "Google"
                print(f"    🔍 Auto-detected owner from URL: Google")
            elif "openai.com" in domain:
                result["owner"] = "OpenAI"
                print(f"    🔍 Auto-detected owner from URL: OpenAI")
            elif "anthropic.com" in domain:
                result["owner"] = "Anthropic"
                print(f"    🔍 Auto-detected owner from URL: Anthropic")
            elif "cursor.sh" in domain or "cursor.com" in domain:
                result["owner"] = "Cursor"
                print(f"    🔍 Auto-detected owner from URL: Cursor")
            # Add more as needed
        
        # If product_website not found, use base URL
        if not result.get("product_website"):
            from urllib.parse import urlparse, urlunparse
            parsed = urlparse(url)
            # Get base URL (scheme + netloc)
            base_url = urlunparse((parsed.scheme, parsed.netloc, "", "", "", ""))
            result["product_website"] = base_url
        
        # Remove None values for cleaner output (but keep owner and product_website if they were set)
        # Note: owner and product_website are set above if they were None, so they won't be filtered
        result = {k: v for k, v in result.items() if v is not None}
        
        print(f"  ✅ Extracted: {list(result.keys())}")
        return result
        
    except requests.exceptions.RequestException as e:
        print(f"  ❌ Error fetching {url}: {e}")
        return {}
    except Exception as e:
        print(f"  ❌ Error parsing {url}: {e}")
        return {}


