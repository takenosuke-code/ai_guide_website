#!/usr/bin/env python3
"""
Test p:first-of-type selector specifically
"""
import requests
import sys
from bs4 import BeautifulSoup

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

url = "https://gemini.google/release-notes/"
print(f"Testing p:first-of-type selector on: {url}")
print("=" * 60)

try:
    response = requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }, timeout=10)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Test p:first-of-type
    print("\n1. Testing: p:first-of-type")
    element = soup.select_one("p:first-of-type")
    if element:
        print(f"   ✅ Found element")
        print(f"   Text: {element.get_text(strip=True)[:200]}")
    else:
        print(f"   ❌ Not found")
    
    # Test first p element directly
    print("\n2. Testing: soup.find('p')")
    element = soup.find('p')
    if element:
        print(f"   ✅ Found element")
        print(f"   Text: {element.get_text(strip=True)[:200]}")
    else:
        print(f"   ❌ Not found")
    
    # Test all p elements
    print("\n3. Testing: All p elements (first 3)")
    p_elements = soup.find_all('p', limit=3)
    print(f"   Found {len(p_elements)} p elements")
    for i, elem in enumerate(p_elements, 1):
        text = elem.get_text(strip=True)
        print(f"   {i}. Length: {len(text)} chars")
        print(f"      Text: {text[:150]}")
        print()
    
    # Test with extractor function
    print("\n4. Testing with extractor logic:")
    def get_text(selector):
        if not selector or not selector.strip():
            return None
        try:
            element = soup.select_one(selector)
            if element:
                text = element.get_text(separator=" ", strip=True)
                return text if text else None
            return None
        except Exception as e:
            print(f"   Error: {e}")
            return None
    
    result = get_text("p:first-of-type")
    print(f"   Result: {result[:200] if result else 'None'}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

