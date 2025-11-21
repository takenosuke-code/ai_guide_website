#!/usr/bin/env python3
"""
Test scraper immediately by clearing cache and forcing a scrape
"""
import sys
import os
from dotenv import load_dotenv

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

load_dotenv()

# Clear cache for Gemini (ID 15) to force immediate scrape
cache_dir = os.path.join(os.path.dirname(__file__), "cache")
cache_file = os.path.join(cache_dir, "15.json")

if os.path.exists(cache_file):
    os.remove(cache_file)
    print("✅ Cleared cache for Gemini (ID: 15)")
    print("   This will force an immediate scrape")
else:
    print("ℹ️  No cache found for Gemini (ID: 15)")
    print("   Will scrape on next run")

print()
print("="*70)
print("Running Scraper Now")
print("="*70)
print()

# Import and run scraper
import scraper
scraper.main()

