#!/usr/bin/env python3
"""
Test the extractor directly with Gemini selectors
"""
import sys
from extractor import extract_fields

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

url = "https://gemini.google/release-notes/"
selectors = {
    "version_selector": "p:first-of-type",
    "owner_selector": ".company-name",
    "description_selector": "p:first-of-type",
    "image_selector": None
}

print("Testing extractor with Gemini selectors:")
print(f"URL: {url}")
print(f"Selectors: {selectors}")
print("=" * 60)

result = extract_fields(url, selectors)

print("\nResult:")
print(f"Keys: {list(result.keys())}")
for key, value in result.items():
    if value:
        print(f"  {key}: {value[:150]}...")
    else:
        print(f"  {key}: None")

