#!/usr/bin/env python3
"""
Find version number in the extracted text
"""
import requests
import sys
import re
from bs4 import BeautifulSoup

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

url = "https://gemini.google/release-notes/"
print(f"Analyzing text to extract version number from: {url}")
print("=" * 60)

try:
    response = requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }, timeout=10)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'html.parser')
    first_p = soup.select_one("p:first-of-type")
    
    if first_p:
        text = first_p.get_text(strip=True)
        print(f"Full text: {text}")
        print()
        print("=" * 60)
        print("Trying to extract version number:")
        print("=" * 60)
        
        # Try different patterns
        patterns = [
            r'Gemini\s+([\d.]+(?:\s+[A-Za-z]+)?)',  # "Gemini 2.5 Flash" or "Gemini 2.5"
            r'version\s+([\d.]+)',  # "version 2.5"
            r'v\s*([\d.]+)',  # "v 2.5" or "v2.5"
            r'([\d]+\.[\d]+(?:\s+[A-Za-z]+)?)',  # "2.5 Flash" or "2.5"
        ]
        
        for i, pattern in enumerate(patterns, 1):
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                version = match.group(1) if match.lastindex else match.group(0)
                print(f"Pattern {i} ({pattern}): ✅ Found '{version}'")
            else:
                print(f"Pattern {i} ({pattern}): ❌ Not found")
        
        print()
        print("=" * 60)
        print("SUGGESTED APPROACH:")
        print("=" * 60)
        print("The best pattern appears to be: Gemini\\s+([\\d.]+(?:\\s+[A-Za-z]+)?)")
        print("This will extract '2.5 Flash' from 'Gemini 2.5 Flash'")
        print()
        print("You could:")
        print("1. Use a more specific selector that targets version text")
        print("2. Post-process the extracted text to extract just the version")
        print("3. Use a regex pattern in the scraper to clean the version field")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

