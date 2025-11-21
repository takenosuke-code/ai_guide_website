#!/usr/bin/env python3
"""Test selectors on Gemini release notes page"""
import requests
from bs4 import BeautifulSoup
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

url = "https://gemini.google/release-notes/"
headers = {"User-Agent": "Mozilla/5.0"}

response = requests.get(url, headers=headers, timeout=10)
soup = BeautifulSoup(response.text, "html.parser")

print("="*70)
print("Testing Selectors on Gemini Release Notes")
print("="*70)
print()

# Test owner/seller selectors
print("Testing Owner/Seller Selectors:")
test_selectors = [
    ".company-name",
    "a[href*='google.com']",
    "header a",
    "nav a",
    "[data-company]",
    "footer a",
    "a[href*='about']",
]

for selector in test_selectors:
    element = soup.select_one(selector)
    if element:
        text = element.get_text(strip=True)
        href = element.get('href', '')
        print(f"  ✅ {selector}: '{text[:50]}' (href: {href[:50]})")
    else:
        print(f"  ❌ {selector}: Not found")

print()

# Look for any links that might contain company info
print("Looking for company/owner references:")
links = soup.select("a[href]")[:20]
for link in links:
    text = link.get_text(strip=True)
    href = link.get('href', '')
    if 'google' in text.lower() or 'google' in href.lower():
        print(f"  Found: '{text}' -> {href}")

print()

# Check for published date
print("Looking for date information:")
date_selectors = [
    "time",
    "[datetime]",
    ".date",
    ".published",
    "article time",
    "header time",
]

for selector in date_selectors:
    elements = soup.select(selector)
    if elements:
        for elem in elements[:3]:
            text = elem.get_text(strip=True)
            datetime_attr = elem.get('datetime', '')
            print(f"  ✅ {selector}: '{text}' (datetime: {datetime_attr})")

print()

# Check for product website link
print("Looking for product website links:")
product_links = soup.select("a[href*='gemini']")[:5]
for link in product_links:
    text = link.get_text(strip=True)
    href = link.get('href', '')
    print(f"  Found: '{text}' -> {href}")


