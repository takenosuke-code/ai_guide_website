#!/usr/bin/env python3
"""
Force immediate scrape by clearing cache
"""
import os
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Clear cache for Gemini (ID 15)
cache_dir = os.path.join(os.path.dirname(__file__), "cache")
cache_file = os.path.join(cache_dir, "15.json")

if os.path.exists(cache_file):
    os.remove(cache_file)
    print("✅ Cleared cache for Gemini (ID: 15)")
else:
    print("ℹ️  No cache found - will scrape fresh")

print()
print("Now run: python scraper/scraper.py")

