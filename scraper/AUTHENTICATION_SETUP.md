# WordPress Authentication Setup

## Current Issue
The scraper is failing authentication because it needs a **WordPress Application Password** (24 characters).

## What Changed
✅ **Rebuilt `wordpress.py`** to support two update paths:
- **Custom plugin endpoint** (recommended): `/wp-json/ai-tools/v1/update/{id}`
- **Built-in REST API fallback**: `/wp-json/wp/v2/posts/{id}`
- Both use the same JSON format: `{"acf": {"field_name": "value"}}`

## How to Fix Authentication

### Step 1: Create Application Password
1. Go to **WordPress.com** → **Users** → **Application Passwords**
2. Click **"Add New Application Password"**
3. Name it: `AI Tool Scraper`
4. Click **"Create Application Password"**
5. **Copy the password immediately** (24 characters, shown only once)
   - Format: `xxxx xxxx xxxx xxxx xxxx xxxx` (with spaces)
   - Or: `xxxxxxxxxxxxxxxxxxxxxxxx` (without spaces - both work)

### Step 2: Update .env File
Edit `scraper/.env`:
```env
WP_URL=https://aitoolsite1020-vqchs.wordpress.com
WP_USERNAME=ai.tool.site1020@gmail.com
WP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
WP_PLUGIN_ENDPOINT=https://aitoolsite1020-vqchs.wordpress.com/wp-json/ai-tools/v1/update
```

**CRITICAL:**
- **Use `https://` NOT `http://`** - Application Passwords require HTTPS!
- Use your **email** as username (not WordPress username)
- Use the **Application Password** (24 characters)
- Spaces in password are OK - the scraper will remove them automatically

### Step 3: Verify Authentication
Run:
```bash
python scraper/test_builtin_acf.py
```

You should see:
```
✅ Authenticated as: [Your Name]
```

## Built-in ACF REST API Details

### Endpoints Used
- **Read ACF**: `GET /wp-json/wp/v2/posts/{id}`
  - Returns: `{"acf": {"field_name": "value", ...}}`
  
- **Update ACF (preferred)**: `POST /wp-json/ai-tools/v1/update/{id}`  
  - Provided by the custom `AI Tool Auto Updater` plugin  
  - Body: `{"acf": {"field_name": "value", ...}}`
  - Persists meta fields reliably on WordPress.com

- **Update ACF (fallback)**: `POST /wp-json/wp/v2/posts/{id}`
  - Used automatically if the plugin endpoint fails or is not configured

### Requirements
1. ✅ **"Show in REST API"** must be enabled for your ACF field group
   - Go to: Custom Fields → Field Groups → "AI Tool Meta" → Edit
   - Check: "Show in REST API"
   - Save

2. ✅ **Application Password** required for write operations
   - Regular password won't work for REST API writes on WordPress.com

3. ✅ **User permissions**
   - Your user must have `edit_posts` capability
   - Administrator role recommended

## Testing
After setting up authentication, test the full flow:
```bash
python scraper/scraper.py
```

The scraper will:
1. Authenticate with WordPress
2. Fetch posts from category
3. Read ACF fields (scrape configuration)
4. Scrape external websites
5. Update ACF fields via built-in REST API

## Troubleshooting

### "Authentication failed: 401"
- Check that you're using an Application Password (24 chars)
- Verify username is your email address
- Make sure password has no extra spaces/newlines

### "Permission denied: 403"
- Your user needs `edit_posts` capability
- Check user role in WordPress.com

### "No ACF fields found"
- Verify "Show in REST API" is enabled for field group
- Check that field group is assigned to the post type

### "Update accepted but no fields saved"
- This is a WordPress.com limitation
- The API accepts the request but doesn't persist changes
- Consider using self-hosted WordPress for full control

