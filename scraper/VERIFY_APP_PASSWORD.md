# How to Verify Application Password Was Created

## Step-by-Step Verification

### 1. Go to Application Passwords Section
- WordPress.com → **Users** → **Your Profile** (or click your profile picture)
- Scroll down to **"Application Passwords"** section
- **NOT** in "Users" → "All Users" → Edit someone else

### 2. Check if Password Exists
You should see a table with:
- **Name** (e.g., "AI Tool Scraper")
- **Created** (date)
- **Last Used** (date or "Never")
- **Revoke** button

### 3. If Password Doesn't Exist
1. Click **"Add New Application Password"**
2. Enter name: `AI Tool Scraper`
3. Click **"Create Application Password"**
4. **Copy the password immediately** (shown only once!)
5. Update your `.env` file with the password

### 4. If Password Exists But Not Working
1. **Revoke** the old password
2. Create a **new** one
3. Copy it immediately
4. Update `.env` file

## Common Issues

### Issue: "I can't find Application Passwords section"
- Make sure you're on **Your Profile** page, not editing another user
- Look for "Application Passwords" section (may be collapsed)
- If still not visible, your WordPress.com plan might not support it

### Issue: "Password was shown but I didn't copy it"
- You need to create a new one (old one can't be viewed again)
- Revoke the old one and create fresh

### Issue: "Password is 24 chars but still not working"
- Make sure you copied it correctly (no extra spaces/newlines)
- Try creating a new one
- Verify you're using the Application Password, not your regular password

## Quick Test
After updating `.env`, run:
```bash
python scraper/diagnose_auth.py
```

If it still fails, the Application Password might not have been created/saved properly in WordPress.com.

