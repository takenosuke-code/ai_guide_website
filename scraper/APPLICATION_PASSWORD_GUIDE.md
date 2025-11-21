# Application Password Setup Guide

## Important: HTTPS Required

**Application Passwords require HTTPS (SSL)**. According to WordPress documentation:
- Application Passwords are only available on sites served over SSL/HTTPS
- If your site uses `http://`, authentication will fail
- WordPress.com sites should always use `https://`

## Current Issue

Your `.env` file likely has:
```env
WP_URL=http://aitoolsite1020-vqchs.wordpress.com
```

This should be:
```env
WP_URL=https://aitoolsite1020-vqchs.wordpress.com
```

## How Application Passwords Work

### Format
- **24 characters long** (e.g., `abcd EFGH 1234 ijkl MNOP 6789`)
- Can be used **with or without spaces** (spaces are automatically stripped)
- Consists of: uppercase, lowercase, and numeric characters only

### Authentication Method
- Uses **Basic Authentication (RFC 7617)**
- Format: `username:application_password`
- The scraper automatically handles this

## Creating an Application Password

### Method 1: WordPress.com Dashboard
1. Go to **WordPress.com** → **Users** → **Your Profile**
2. Scroll to **Application Passwords** section
3. Enter name: `AI Tool Scraper`
4. Click **"Add New Application Password"**
5. **Copy the password immediately** (shown only once)
   - Format: `xxxx xxxx xxxx xxxx xxxx xxxx` (with spaces)
   - Or: `xxxxxxxxxxxxxxxxxxxxxxxx` (without spaces)

### Method 2: Via REST API (Programmatic)
If you have existing authentication, you can create one via:
```bash
POST /wp/v2/users/me/application-passwords
```

## Updating Your .env File

```env
# IMPORTANT: Use https:// not http://
WP_URL=https://aitoolsite1020-vqchs.wordpress.com
WP_USERNAME=ai.tool.site1020@gmail.com
WP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

**Note:** The password can have spaces - the scraper will strip them automatically.

## Testing Authentication

After updating your `.env` file:

```bash
python scraper/test_builtin_acf.py
```

You should see:
```
✅ Authenticated as: [Your Name]
```

## Troubleshooting

### "Authentication failed: 401"
1. **Check URL uses HTTPS**: `https://` not `http://`
2. **Verify Application Password**: Must be 24 characters
3. **Check username**: Use your email address
4. **Verify password**: No extra characters/newlines

### "Application Passwords not available"
- Your site must be served over HTTPS
- For WordPress.com, this should always be the case
- If using self-hosted WordPress, ensure SSL certificate is valid

### "Permission denied: 403"
- Your user needs `edit_posts` capability
- Administrator role recommended for testing

## Security Notes

1. **Never commit Application Passwords to Git**
   - Keep them in `.env` file (already in `.gitignore`)
   
2. **Application Passwords are for programmatic access only**
   - Cannot be used for interactive login (`wp-login.php`)
   - Designed for API access only

3. **Track usage**
   - WordPress tracks when/where Application Passwords are used
   - Check "Last Used" column in WordPress dashboard
   - Revoke unused passwords regularly

4. **HTTPS is required for security**
   - Without HTTPS, passwords can be intercepted
   - WordPress.com always uses HTTPS

## Code Implementation

The scraper uses Basic Auth automatically:
```python
session.auth = (username, password)  # Basic Auth (RFC 7617)
```

This is handled by the `requests` library automatically - no manual encoding needed.

