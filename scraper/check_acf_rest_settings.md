# WordPress Settings to Check for REST API Write Access

## Critical Settings to Verify:

### 1. ACF Field Group REST API Settings

**This is the most important setting!**

1. Go to **WordPress Admin → Custom Fields → Field Groups**
2. Click on your **"AI Tool Meta"** field group to edit it
3. Scroll down to the **Settings** section
4. Look for **"REST API"** or **"Show in REST API"** setting
5. **Make sure it's ENABLED/CHECKED**

If you don't see this option:
- You may need to install "ACF to REST API" plugin
- Or if using ACF Pro, make sure REST API is enabled in ACF settings

### 2. Individual Field REST API Settings

For each field (latest_version, latest_update, seller, overview):
1. Edit the field in the field group
2. Check if there's a "Show in REST API" option
3. Make sure it's enabled

### 3. ACF to REST API Plugin Settings

1. Go to **Plugins → Installed Plugins**
2. Find **"ACF to REST API"**
3. Make sure it's **Activated**
4. Check plugin settings (if available) for any restrictions

### 4. WordPress REST API Permissions

1. Go to **Settings → Permalink** (or any settings page)
2. WordPress REST API should be enabled by default
3. Test by visiting: `https://your-site.com/wp-json/`
4. Should show JSON with available endpoints

### 5. User Permissions

1. Go to **Users → Your Profile**
2. Make sure your user has **Editor** or **Administrator** role
3. Application Password should have write permissions

### 6. WordPress.com Specific Settings

Since you're on WordPress.com:
- Check if your plan allows REST API writes
- Some free/hosted plans restrict write access
- Business/Pro plans typically allow full REST API access

