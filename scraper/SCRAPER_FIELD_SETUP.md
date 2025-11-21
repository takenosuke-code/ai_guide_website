# Scraper Field Setup Guide

## Field Names in WordPress Scraper Field Group

When creating fields in your **"Scraper"** field group in WordPress, use these **exact field names**:

### Required Fields (Already Created)
- ✅ `scrapeUrl` (URL field) - The page to scrape
- ✅ `scrapeEnabled` (True/False) - Enable/disable scraping
- ✅ `scrapeFrequencyHours` (Number) - How often to scrape (hours)
- ✅ `versionSelector` (Text) - CSS selector for version
- ✅ `descriptionSelector` (Text) - CSS selector for description
- ✅ `ownerSelector` (Text) - CSS selector for owner/seller (optional - auto-detected if empty)

### New Fields to Create

#### 1. Published Date Field
**Field Name:** `publishedSelector` (Text field)
- **Purpose:** CSS selector to extract published date from the page
- **Example:** `time`, `[datetime]`, `.date`, `.published`
- **Note:** If left empty, the scraper won't update published_date (keeps existing value)

#### 2. Product Website Selector (Optional)
**Field Name:** `productWebsiteSelector` (Text field)
- **Purpose:** CSS selector to extract product website URL
- **Example:** `a.product-link`, `a[href*="product"]`
- **Note:** If left empty, scraper automatically uses the base URL (e.g., `https://gemini.google`)

## How It Works

### Owner/Seller (Automatic Detection)
The scraper **automatically detects** the owner/seller from the URL if the selector doesn't work:

- `gemini.google.com` → **Google**
- `openai.com` → **OpenAI**
- `anthropic.com` → **Anthropic**
- `cursor.sh` or `cursor.com` → **Cursor**

**So you can leave `ownerSelector` empty** for Gemini - it will automatically set seller to "Google".

### Product Website (Automatic Fallback)
If `productWebsiteSelector` is empty or doesn't find anything, the scraper automatically uses the base URL:
- Scraping `https://gemini.google/release-notes/` → Sets `product_website` to `https://gemini.google`

### Published Date
- If `publishedSelector` finds a date, it updates `published_date` in WordPress
- If `publishedSelector` is empty or finds nothing, `published_date` is **not updated** (keeps existing value)

## Field Mapping (Scraper → WordPress ACF)

The scraper maps extracted fields to your **"AI Tool Meta"** field group:

| Scraper Field | WordPress ACF Field | Notes |
|--------------|---------------------|-------|
| `version` | `latest_version` | Extracted from page |
| `owner` | `seller` | Auto-detected from URL if selector fails |
| `description` | `overview` | Extracted from page |
| `product_website` | `product_website` | Auto-set to base URL if selector fails |
| `published_date` | `published_date` | Only updated if selector finds a date |

## Example WordPress Scraper Settings for Gemini

```
Scrape URL: https://gemini.google/release-notes/
Version Selector: p:first-of-type
Owner Selector: (leave empty - auto-detects "Google")
Description Selector: p:first-of-type
Published Selector: (leave empty or add selector if date exists on page)
Product Website Selector: (leave empty - auto-uses https://gemini.google)
Enable Scraping: ✅ Checked
Scrape Frequency Hours: 1
```

## Testing

After setting up the fields, run:
```bash
python scraper/test_immediate_scrape.py
python scraper/scraper.py
```

You should see:
- ✅ `seller: Google` (auto-detected)
- ✅ `product_website: https://gemini.google` (auto-set)
- ✅ `published_date: [date]` (if selector found it)


