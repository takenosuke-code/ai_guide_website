# How to Find Application Passwords (NOT Post by Email)

## ⚠️ IMPORTANT: Two Different Features

### ❌ Post by Email (NOT what we need)
- **Location**: Jetpack → Settings → Writing → Post by Email
- **Purpose**: Publish blog posts via email
- **Format**: Email address like `mimo517lonu@post.wordpress.com`
- **NOT for REST API authentication**

### ✅ Application Passwords (What we need)
- **Location**: WordPress.com → Users → Your Profile → Application Passwords
- **Purpose**: REST API authentication
- **Format**: 24-character password like `Qqex DjXk WAPA 3Itj kujk V8BV`
- **This is what the scraper uses**

## Step-by-Step: Find Application Passwords

### Step 1: Go to Your Profile
1. Log into **WordPress.com**
2. Click your **profile picture/avatar** (top right)
3. Click **"Profile"** or **"Account Settings"**
   - OR go to: **Users** → **Your Profile**

### Step 2: Find Application Passwords Section
1. Scroll down on your profile page
2. Look for **"Application Passwords"** section
3. It should show a table with:
   - **Name** (e.g., "AI Tool Scraper")
   - **Created** (date)
   - **Last Used** (date or "Never")
   - **Revoke** button

### Step 3: If Section Doesn't Exist
If you don't see "Application Passwords" section:
- Your WordPress.com plan might not support it
- Or it might be in a different location
- Try: **Settings** → **Security** → **Application Passwords**

### Step 4: Create Application Password
1. Click **"Add New Application Password"**
2. Enter name: `AI Tool Scraper`
3. Click **"Create Application Password"**
4. **Copy the 24-character password immediately**
   - Format: `xxxx xxxx xxxx xxxx xxxx xxxx`
   - Or: `xxxxxxxxxxxxxxxxxxxxxxxx`
5. **Update your `.env` file** with this password

## Verification Checklist

- [ ] I can see "Application Passwords" section in my profile
- [ ] I see "AI Tool Scraper" listed in the table
- [ ] The password in `.env` is exactly 24 characters (after removing spaces)
- [ ] The password contains only A-Z, a-z, 0-9 (no special characters)
- [ ] I'm using the Application Password, NOT my regular WordPress password
- [ ] I'm using the Application Password, NOT the Post by Email address

## Test After Setup

Run:
```bash
python scraper/test_exact_password.py
```

If it still fails, the Application Password might not be created correctly in WordPress.com.

