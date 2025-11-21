# AI Tool Scraper

Generic scraper that reads scraping configuration from WordPress ACF fields and automatically updates tool data.

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure

Edit `config.yaml`:

```yaml
wordpress:
  url: "https://your-site.com"
  username: "your-username"
  password: "xxxx xxxx xxxx xxxx xxxx xxxx"  # Application password
  category_slug: "ai-review"
```

### 3. Run

```bash
python scraper.py
```

## How It Works

1. **Reads WordPress posts** in the specified category
2. **Checks ACF fields** for scraping configuration:
   - `scrape_enabled`: Whether to scrape this tool
   - `scrape_url`: URL to scrape
   - `version_selector`: CSS selector for version
   - `owner_selector`: CSS selector for owner/company
   - `description_selector`: CSS selector for description
   - `image_selector`: CSS selector for logo/image
3. **Scrapes the URL** using the selectors
4. **Compares with cache** to detect changes
5. **Updates WordPress** ACF fields if data changed:
   - `latestVersion` ← from version_selector
   - `seller` ← from owner_selector
   - `overview` ← from description_selector (optional)
   - `logo` ← from image_selector (optional)

## File Structure

```
scraper/
├── scraper.py          # Main entry point
├── wordpress.py        # WordPress REST API client
├── extractor.py        # HTML extraction logic
├── scraper_engine.py   # Caching and comparison
├── config.yaml         # Configuration
├── requirements.txt    # Python dependencies
└── cache/              # Cache directory (auto-created)
    └── {post_id}.json  # Cached data per tool
```

## Deployment

### Cron Job (Every 6 hours)

```bash
0 */6 * * * cd /path/to/scraper && python3 scraper.py >> scraper.log 2>&1
```

### GitHub Actions

See `.github/workflows/scraper.yml` in the main project.

## Troubleshooting

**"No tools found"**
- Check category slug matches WordPress
- Verify posts are published
- Check posts have ACF fields

**"Authentication failed"**
- Use Application Password, not regular password
- Verify username is correct

**"ACF fields not updating"**
- Install "ACF to REST API" plugin
- Check field group settings allow REST API


