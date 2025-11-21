# Fix: Scraper Fields Not Found

## Problem
The scraper fields (`scrape_enabled`, `scrape_url`, etc.) are not appearing in the WordPress API response.

## Solution

### Step 1: Verify Fields Exist in WordPress
1. Go to **WordPress.com** → Edit **Gemini** post
2. Scroll to **"AI Tool Meta"** section
3. Make sure you see these fields:
   - **Scrape URL**
   - **Version Selector**
   - **Owner Selector**
   - **Description Selector**
   - **Enable Scraping** (checkbox)
   - **Scrape Frequency Hours**

### Step 2: Save the Post
**IMPORTANT**: After enabling scraping and filling in the fields:
1. Click **"Update"** or **"Save"** button
2. Wait for the save to complete
3. The fields must be saved before they appear in the API

### Step 3: Verify Field Names Match
The field names in WordPress must match exactly:
- `scrape_url` (not `scrapeUrl` or `scrape-url`)
- `scrape_enabled` (not `scrapeEnabled`)
- `version_selector` (not `versionSelector`)
- `description_selector` (not `descriptionSelector`)
- `scrape_frequency_hours` (not `scrapeFrequencyHours`)

### Step 4: Check "Show in REST API"
1. Go to **Custom Fields** → **Field Groups** → **"AI Tool Meta"**
2. Make sure **"Show in REST API"** is checked
3. Save the field group

### Step 5: Test Again
After saving, run:
```bash
python scraper/debug_acf_response.py
```

You should see the scraper fields in the output.

