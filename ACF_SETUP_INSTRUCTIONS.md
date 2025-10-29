# ACF Setup Instructions - Complete Guide

## Step 1: Install WordPress Plugins

### A) Install WPGraphQL for ACF

1. Go to WordPress Admin: https://aitoolsite1020-vqchs.wpcomstaging.com/wp-admin
2. **Plugins → Add New**
3. Search for: **"WPGraphQL for Advanced Custom Fields"**
4. Click **Install Now** → **Activate**

OR download from: https://github.com/wp-graphql/wpgraphql-acf/releases
- Download the .zip file
- Go to **Plugins → Add New → Upload Plugin**
- Upload and activate

### B) Install Advanced Custom Fields (ACF)

1. **Plugins → Add New**
2. Search for: **"Advanced Custom Fields"**
3. Click **Install Now** → **Activate**

## Step 2: Create the Field Group

1. Go to **Custom Fields → Add New**

2. **Field Group Name:** `AI Tool Meta`

3. **Location Rules:**
   - Show this field group if: **Post Type** is equal to **Post**

## Step 3: Add All Fields

Click **+ Add Field** for each of these:

---

### TAB 1: Basic Info

**Field Type:** Tab
- **Field Label:** Basic Info
- Click **Add Field**

---

**Field 1: Logo**
- **Field Label:** Logo
- **Field Name:** `logo`
- **Field Type:** Image
- **Return Format:** Image Array
- **Preview Size:** Medium

---

**Field 2: Product Website**
- **Field Label:** Product Website  
- **Field Name:** `product_website`
- **Field Type:** URL
- **Placeholder:** https://example.com

---

**Field 3: Published Date**
- **Field Label:** Published Date
- **Field Name:** `published_date`
- **Field Type:** Text
- **Placeholder:** 2021, Aug, 17

---

**Field 4: Latest Update**
- **Field Label:** Latest Update
- **Field Name:** `latest_update`
- **Field Type:** Text
- **Placeholder:** 2025, Sep, 28

---

**Field 5: Latest Version**
- **Field Label:** Latest Version
- **Field Name:** `latest_version`
- **Field Type:** Text
- **Placeholder:** v 112.5

---

**Field 6: Seller**
- **Field Label:** Seller
- **Field Name:** `seller`
- **Field Type:** Text
- **Placeholder:** OpenAI

---

**Field 7: Discussion URL**
- **Field Label:** Discussion URL
- **Field Name:** `discussion_url`
- **Field Type:** URL
- **Placeholder:** https://community.example.com

---

### TAB 2: Statistics

**Field Type:** Tab
- **Field Label:** Statistics
- Click **Add Field**

---

**Field 8: Boosted Productivity**
- **Field Label:** Boosted Productivity
- **Field Name:** `boosted_productivity`
- **Field Type:** Text
- **Placeholder:** +60%

---

**Field 9: Less Manual Work**
- **Field Label:** Less Manual Work
- **Field Name:** `less_manual_work`
- **Field Type:** Text
- **Placeholder:** 6 hours / week

---

### TAB 3: Features

**Field Type:** Tab
- **Field Label:** Features
- Click **Add Field**

---

**Field 10: Key Findings**
- **Field Label:** Key Findings
- **Field Name:** `key_findings`
- **Field Type:** Repeater
- **Button Label:** Add Finding
- **Sub Fields:**
  - **Field Label:** Finding
  - **Field Name:** `finding`
  - **Field Type:** Text

---

**Field 11: Target Audience**
- **Field Label:** Target Audience
- **Field Name:** `target_audience`
- **Field Type:** Repeater
- **Button Label:** Add Audience
- **Sub Fields:**
  - **Field Label:** Audience Type
  - **Field Name:** `audience_type`
  - **Field Type:** Text

---

### TAB 4: Pricing & Content

**Field Type:** Tab
- **Field Label:** Pricing & Content
- Click **Add Field**

---

**Field 12: Pricing Model**
- **Field Label:** Pricing Model
- **Field Name:** `pricing_model`
- **Field Type:** Text
- **Placeholder:** Free / Paid $20+

---

**Field 13: Use Cases**
- **Field Label:** Use Cases
- **Field Name:** `use_cases`
- **Field Type:** WYSIWYG Editor
- **Enable:** Visual & Text tabs

---

## Step 4: Configure GraphQL Settings

**CRITICAL STEP:**

1. Scroll down to **Settings** section in the field group
2. Find **GraphQL Settings** or **Show in GraphQL**
3. **Check the box** for "Show in GraphQL"
4. **GraphQL Field Name:** `aiToolMeta` (exactly this!)

## Step 5: Click "Publish"

Save your field group!

## Step 6: Test in WordPress

1. Go to **Posts → All Posts**
2. Edit "ChatGPT Review"
3. Scroll down - you should see all your new fields!

## Step 7: Fill in Sample Data

Here's example data for ChatGPT:

### Basic Info Tab:
```
Logo: [Upload ChatGPT logo]
Product Website: https://chat.openai.com
Published Date: 2021, Aug, 17
Latest Update: 2025, Sep, 28
Latest Version: v 4.0
Seller: OpenAI
Discussion URL: https://community.openai.com
```

### Statistics Tab:
```
Boosted Productivity: +60%
Less Manual Work: 6 hours / week
```

### Features Tab:
```
Key Findings (click "Add Finding" for each):
1. Copy writing
2. Code generation
3. Math solving
4. General conversation
5. Research assistance
6. Language translation

Target Audience (click "Add Audience" for each):
1. Students
2. Developers
3. Content Creators
```

### Pricing & Content Tab:
```
Pricing Model: Free / Paid $20+

Use Cases: [Use the WYSIWYG editor]
<h3>1. Content Creation</h3>
<p>Generate blog posts, articles, social media content, and marketing copy in seconds.</p>

<h3>2. Code Development</h3>
<p>Write, debug, and explain code across multiple programming languages.</p>

<h3>3. Learning & Education</h3>
<p>Get explanations, summaries, and help with homework and research.</p>
```

## Step 8: Update Your Post

Click **Update** in WordPress.

---

## Troubleshooting

**Fields not showing in GraphQL?**
- Make sure "Show in GraphQL" is checked
- GraphQL Field Name MUST be exactly: `aiToolMeta`
- Go to **GraphQL → Settings → Clear Schema Cache**

**Can't see fields on post edit screen?**
- Check Location Rules are set to "Post Type = Post"
- Make sure ACF is activated

**Still getting errors?**
- The field names must match exactly (underscores, not hyphens)
- Use the exact names from this guide

---

Once you complete this setup, I'll update the GraphQL query in Next.js to fetch all these fields!

