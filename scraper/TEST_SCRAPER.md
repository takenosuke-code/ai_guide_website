# How to Test the Scraper

## Step 1: Enable Scraping in WordPress

1. Go to **WordPress.com** → Edit the **Gemini** post
2. Scroll to **"AI Tool Meta"** section
3. Find **"Enable scraping"** checkbox
4. **Check the box** to enable scraping
5. **Save** the post

## Step 2: Test Immediately (Bypass 1-Hour Wait)

### Option A: Clear Cache (Recommended)
```bash
# Delete cache file for Gemini (ID: 15)
del scraper\cache\15.json

# Then run scraper
python scraper/scraper.py
```

### Option B: Use Force Scrape Script
```bash
python scraper/force_scrape.py
python scraper/scraper.py
```

### Option C: Temporarily Change Frequency
Edit the **"Scrape frequency hours"** field in WordPress:
- Change from `1` to `0` (temporarily)
- Run scraper
- Change back to `1` after testing

## Step 3: Verify Updates

After running the scraper, check:

1. **In WordPress**: Edit the Gemini post and check:
   - `latest_version` field
   - `latest_update` field
   - `overview` field

2. **In Scraper Output**: Look for:
   - `✅ Updated X ACF field(s) for post 15`
   - `📝 version: 'old' → 'new'`

## Troubleshooting

### "Scraping disabled - skipping"
- Enable scraping in WordPress (see Step 1)

### "Too soon to scrape"
- Clear cache: `del scraper\cache\15.json`
- Or change frequency to 0 hours temporarily

### "Update accepted but fields not saved"
- This is a WordPress.com limitation
- The scraper is working, but WordPress.com may not persist changes
- Try checking WordPress directly after a few minutes

## Quick Test Command

```bash
# Clear cache and run
del scraper\cache\15.json && python scraper/scraper.py
```

## Automate with GitHub Actions

1. Secrets needed (Settings → Secrets → Actions):
   - `WP_URL`
   - `WP_USERNAME`
   - `WP_PASSWORD`
   - `WP_PLUGIN_ENDPOINT`
2. Workflow file: `.github/workflows/scrape.yml`
   - Runs every 6 hours (cron) or manually via “Run workflow”
   - Installs dependencies and runs `python scraper/scraper.py`
3. To change frequency, edit the `cron` string in the workflow.

