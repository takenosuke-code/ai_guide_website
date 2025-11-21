# Generic Scraper Setup Guide - Adapted for Your WordPress

## ✅ What's Already Working

- ✅ WordPress with ACF installed
- ✅ WPGraphQL for Next.js (reading data)
- ✅ ACF field group "AI Tool Meta" with fields like `latestVersion`, `seller`, `publishedDate`
- ✅ Posts in "ai-review" category

## 🎯 What We're Adding

1. **New ACF fields** for scraping configuration
2. **Python scraper** that reads config from WordPress and updates fields
3. **Automated updates** without touching code

---

## STEP 1: Add New ACF Fields for Scraping

Go to **Custom Fields → AI Tool Meta** (or create a new field group)

### Add a New Tab: "Scraper Settings"

**Field Type:** Tab
- **Field Label:** Scraper Settings
- Click **Add Field**

### Add These Fields:

**Field 1: Scrape URL**
- **Field Label:** Scrape URL
- **Field Name:** `scrape_url`
- **Field Type:** URL
- **Placeholder:** https://openai.com/release-notes
- **Instructions:** The URL to scrape for version/update information

**Field 2: Version Selector**
- **Field Label:** Version Selector (CSS)
- **Field Name:** `version_selector`
- **Field Type:** Text
- **Placeholder:** h2.latest-version
- **Instructions:** CSS selector to find version text (e.g., "h2.latest-version" or ".version-text")

**Field 3: Owner/Seller Selector**
- **Field Label:** Owner Selector (CSS)
- **Field Name:** `owner_selector`
- **Field Type:** Text
- **Placeholder:** .company-name
- **Instructions:** CSS selector to find owner/company name

**Field 4: Description Selector**
- **Field Label:** Description Selector (CSS)
- **Field Name:** `description_selector`
- **Field Type:** Text
- **Placeholder:** .content p
- **Instructions:** CSS selector to find description text

**Field 5: Image Selector (Optional)**
- **Field Label:** Image Selector (CSS)
- **Field Name:** `image_selector`
- **Field Type:** Text
- **Placeholder:** .logo img
- **Instructions:** CSS selector to find logo/image URL

**Field 6: Scrape Enabled**
- **Field Label:** Enable Scraping
- **Field Name:** `scrape_enabled`
- **Field Type:** True/False
- **Default Value:** False
- **Instructions:** Check this to enable automatic scraping for this tool

**Field 7: Scrape Frequency (Hours)**
- **Field Label:** Scrape Frequency (Hours)
- **Field Name:** `scrape_frequency_hours`
- **Field Type:** Number
- **Default Value:** 24
- **Instructions:** How often to scrape (in hours). Default: 24 (daily)

**Field 8: Last Scraped (Auto)**
- **Field Label:** Last Scraped
- **Field Name:** `last_scraped`
- **Field Type:** Date Time Picker
- **Read Only:** Yes (will be auto-updated by scraper)
- **Instructions:** Automatically updated by the scraper

**Field 9: Scrape Error Log**
- **Field Label:** Scrape Error Log
- **Field Name:** `scrape_error_log`
- **Field Type:** Textarea
- **Read Only:** Yes (will be auto-updated by scraper)
- **Instructions:** Shows any errors from scraping

### ⚠️ IMPORTANT: GraphQL Settings

**For the Python scraper:** The GraphQL type name doesn't matter! The scraper uses REST API which returns ALL ACF fields regardless of field group.

**However, if you want to query these fields in Next.js via GraphQL:**
1. Scroll to **Settings** section → **GraphQL** tab
2. Make sure **"Show in GraphQL"** is checked
3. **GraphQL Type Name:** Can be anything (e.g., `scraper`, `scraperSettings`, etc.)
   - If you use `scraper`, you'd query it as `post.scraper { scrapeUrl }` in GraphQL
   - If you use `aiToolMeta`, you'd query it as `post.aiToolMeta { scrapeUrl }` in GraphQL
4. Make sure **"Post (Post Type)"** is checked in "GraphQL Types to Show the Field Group On"

**Note:** Since these are just configuration fields (not displayed on the website), you can leave GraphQL disabled if you want. The Python scraper will still work via REST API.

### Click "Update" to save

---

## STEP 2: Enable ACF REST API

The Python scraper needs to read/write ACF fields via REST API.

### Option A: Install ACF to REST API Plugin (Recommended)

1. Go to **Plugins → Add New**
2. Search for: **"ACF to REST API"**
3. Install and activate

OR manually install:
- Download: https://github.com/airesvsg/acf-to-rest-api
- Upload via **Plugins → Add New → Upload Plugin**

### Option B: Use ACF REST API (Built-in)

If you have ACF Pro, REST API is built-in. Just make sure:
- ACF version 5.11+ is installed
- REST API is enabled in WordPress (it is by default)

---

## STEP 3: Create WordPress Application Password

The Python scraper needs to authenticate.

1. Go to **Users → Your Profile** (or the user you want to use)
2. Scroll to **Application Passwords** section
3. **Application Name:** `AI Tool Scraper`
4. Click **Add New Application Password**
5. **Copy the password** (you'll only see it once!)
   - Format: `xxxx xxxx xxxx xxxx xxxx xxxx` (24 characters with spaces)

**Save these credentials:**
- Username: Your WordPress username
- Password: The application password (24 characters)

---

## STEP 4: Test REST API Access

Test that you can access ACF fields via REST API:

### Test URL (replace with your site):
```
https://YOUR-SITE.com/wp-json/wp/v2/posts?categories=CATEGORY_ID&per_page=1
```

### Test ACF Fields:
```
https://YOUR-SITE.com/wp-json/acf/v3/posts/POST_ID
```

Replace:
- `YOUR-SITE.com` with your WordPress URL
- `CATEGORY_ID` with the ID of "ai-review" category
- `POST_ID` with an actual post ID

You should see JSON with your ACF fields.

---

## STEP 5: Install Python Scraper

See `scraper/` folder for the Python code.

### Install Dependencies:
```bash
cd scraper
pip install requests beautifulsoup4 pyyaml
```

### Configure:
Edit `scraper/config.yaml`:
```yaml
wordpress:
  url: "https://YOUR-WEBSITE.com"
  username: "YOUR-USERNAME"
  password: "xxxx xxxx xxxx xxxx xxxx xxxx"  # Application password

scraper:
  user_agent: "Mozilla/5.0 (compatible; AI-Scraper/1.0)"
  timeout: 10
  category_slug: "ai-review"  # Your category slug
```

### Run:
```bash
python scraper.py
```

---

## STEP 6: How Your Client Uses It

### To Add a New Tool:

1. **Create/Edit Post** in WordPress
2. **Category:** Select "ai-review"
3. **Fill in Scraper Settings:**
   - Scrape URL: `https://openai.com/release-notes`
   - Version Selector: `h2.latest-version`
   - Owner Selector: `.company-name`
   - Description Selector: `.content p`
   - Enable Scraping: ✅ Checked
4. **Click Update**

**That's it!** The scraper will automatically:
- Detect the new tool
- Scrape the URL
- Extract data using selectors
- Update `latestVersion`, `seller`, `publishedDate` fields
- Your Next.js site displays the updated data

---

## STEP 7: Deployment Options

### Option 1: Cron Job (VPS/Server)
```bash
# Run every 6 hours
0 */6 * * * cd /path/to/scraper && python3 scraper.py >> scraper.log 2>&1
```

### Option 2: Cloud Services
- **Railway:** Add cron job in `railway.json`
- **Render:** Use Cron Jobs
- **AWS Lambda:** Use EventBridge
- **DigitalOcean:** App Platform with cron

### Option 3: GitHub Actions (Free)
Create `.github/workflows/scraper.yml`:
```yaml
name: Scrape AI Tools
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - run: pip install -r scraper/requirements.txt
      - run: python scraper/scraper.py
        env:
          WP_URL: ${{ secrets.WP_URL }}
          WP_USER: ${{ secrets.WP_USER }}
          WP_PASS: ${{ secrets.WP_PASS }}
```

---

## 🔧 Troubleshooting

**"ACF fields not showing in REST API"**
- Install "ACF to REST API" plugin
- Check field group settings: "Show in REST API" should be enabled

**"Authentication failed"**
- Make sure you're using Application Password, not regular password
- Check username is correct

**"No posts found"**
- Check category slug matches "ai-review"
- Verify posts have `scrape_enabled` = true

**"Selector not working"**
- Test selectors in browser DevTools first
- Use browser's "Copy selector" feature
- Check if site uses JavaScript (may need Playwright instead)

---

## 📊 What Gets Updated

The scraper will update these existing ACF fields:
- `latestVersion` → from version_selector
- `seller` → from owner_selector  
- `publishedDate` / `latestUpdate` → can be set from description or timestamp
- `logo` → from image_selector (if configured)

All fields are already displayed in your Next.js site, so updates appear automatically!

---

## 🎉 Result

✅ Client adds tools without coding
✅ Scraper runs automatically
✅ WordPress fields update
✅ Next.js displays live data
✅ No code changes needed for new tools

