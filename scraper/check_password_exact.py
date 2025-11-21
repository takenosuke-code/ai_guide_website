#!/usr/bin/env python3
"""
Check password for hidden characters or encoding issues
"""
import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

wp_password = os.getenv("WP_PASSWORD", "")

print("="*70)
print("Password Analysis")
print("="*70)
print()

if not wp_password:
    print("ERROR: WP_PASSWORD is not set!")
    exit(1)

print(f"Raw password length: {len(wp_password)} chars")
print(f"Raw password repr: {repr(wp_password)}")
print()

# Check for spaces
spaces = wp_password.count(' ')
print(f"Number of spaces: {spaces}")

# Check for newlines
newlines = wp_password.count('\n') + wp_password.count('\r')
print(f"Number of newlines: {newlines}")

# Check for tabs
tabs = wp_password.count('\t')
print(f"Number of tabs: {tabs}")

# Clean password
clean = wp_password.replace(' ', '').replace('\n', '').replace('\r', '').replace('\t', '').strip()
print(f"Cleaned password length: {len(clean)} chars")
print()

# Show character breakdown
print("Character breakdown:")
for i, char in enumerate(clean):
    if char.isalnum():
        print(f"  [{i+1}] {char} (alphanumeric)")
    else:
        print(f"  [{i+1}] {char} (UNEXPECTED: {ord(char)})")

print()

# Check format
import re
if re.match(r'^[A-Za-z0-9]{24}$', clean):
    print("Format: CORRECT (24 alphanumeric characters)")
else:
    print("Format: INCORRECT")
    print("  Should be: 24 alphanumeric characters (A-Z, a-z, 0-9)")
    invalid_chars = [c for c in clean if not c.isalnum()]
    if invalid_chars:
        print(f"  Invalid characters found: {invalid_chars}")

print()
print("="*70)
print("IMPORTANT: Post by Email vs Application Passwords")
print("="*70)
print()
print("'Post by Email' is NOT what we need!")
print()
print("Post by Email:")
print("  - Used for: Publishing blog posts via email")
print("  - Email address: mimo517lonu@post.wordpress.com")
print("  - NOT for REST API authentication")
print()
print("Application Passwords:")
print("  - Used for: REST API authentication (what we need)")
print("  - Location: WordPress.com → Users → Your Profile → Application Passwords")
print("  - Format: 24-character password")
print("  - This is what the scraper uses")
print()
print("Make sure you're using Application Passwords, not Post by Email!")

