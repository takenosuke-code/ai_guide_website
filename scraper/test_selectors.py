#!/usr/bin/env python3
"""
Test selectors on the Gemini release notes page
"""
import requests
import sys
from bs4 import BeautifulSoup

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

url = "https://gemini.google/release-notes/"
print(f"Testing selectors on: {url}")
print("=" * 60)

try:
    response = requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }, timeout=10)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    print(f"✅ Page loaded (status: {response.status_code})")
    print(f"Page length: {len(response.text)} characters")
    print()
    
    # Test version selector
    print("Testing version selector: h2.latest-version")
    version_elements = soup.select("h2.latest-version")
    print(f"Found {len(version_elements)} elements")
    for i, elem in enumerate(version_elements[:3], 1):
        print(f"  {i}. {elem.get_text(strip=True)[:100]}")
    print()
    
    # Test owner selector
    print("Testing owner selector: .company-name")
    owner_elements = soup.select(".company-name")
    print(f"Found {len(owner_elements)} elements")
    for i, elem in enumerate(owner_elements[:3], 1):
        print(f"  {i}. {elem.get_text(strip=True)[:100]}")
    print()
    
    # Test description selector
    print("Testing description selector: .content p")
    desc_elements = soup.select(".content p")
    print(f"Found {len(desc_elements)} elements")
    for i, elem in enumerate(desc_elements[:3], 1):
        print(f"  {i}. {elem.get_text(strip=True)[:100]}")
    print()
    
    # Look for any h2 elements
    print("All h2 elements on page:")
    h2_elements = soup.find_all("h2")
    print(f"Found {len(h2_elements)} h2 elements")
    for i, elem in enumerate(h2_elements[:5], 1):
        print(f"  {i}. {elem.get_text(strip=True)[:100]}")
        print(f"     Classes: {elem.get('class', [])}")
    print()
    
    # Look for version-related text
    print("Searching for version-related text:")
    all_text = soup.get_text().lower()
    if 'version' in all_text or 'v ' in all_text:
        print("  ✅ Found 'version' or 'v ' in page text")
        # Find the context
        version_elements = soup.find_all(string=lambda text: text and ('version' in text.lower() or 'v ' in text.lower()))
        print(f"  Found {len(version_elements)} version mentions")
        for i, elem in enumerate(version_elements[:5], 1):
            parent = elem.parent
            if parent:
                print(f"  {i}. {parent.get_text(strip=True)[:150]}")
                print(f"     Tag: {parent.name}, Classes: {parent.get('class', [])}")
    else:
        print("  ❌ No 'version' text found")
    
    print()
    print("=" * 60)
    print("SUGGESTED SELECTORS:")
    print("=" * 60)
    print("For latest version/release date:")
    print("  h2:first-of-type  (gets first release date)")
    print("  OR")
    print("  h2._releaseNoteCardTitle_lm7ws_104:first-of-type")
    print()
    print("For company name (Google):")
    print("  This page doesn't have a company name selector")
    print("  You could hardcode 'Google' or use: title (contains 'Google')")
    print()
    print("For description:")
    print("  p:first-of-type  (first paragraph)")
    print("  OR")
    print("  Look for specific content structure")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

