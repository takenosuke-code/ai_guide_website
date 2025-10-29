# WordPress Post Setup Guide - AI Tools Detail Page

## What You Need to Know

The detail page at `/tool/[slug]` is a **pure template** that pulls ALL content from WordPress. Nothing is hardcoded anymore.

## How It Works

1. **Homepage** "All AI Tool Reviews & Guides" section shows your WordPress posts
2. **Click "Full Review"** → Goes to `/tool/your-post-slug`
3. **Detail page** fetches that post from WordPress and displays it

## Required WordPress Setup

### Basic Post Fields (REQUIRED - These make the page work)

| Field | Where to Set | Example | Shows On Page |
|-------|-------------|---------|---------------|
| **Title** | Post title field | "ChatGPT" | Page title, breadcrumb, sections |
| **Slug** | Permalink (URL) | `chatgpt` | **CRITICAL**: URL is `/tool/chatgpt` |
| **Content** | Post editor | Full description with formatting | "What is ChatGPT" section |
| **Excerpt** | Excerpt field | Short summary | Overview box |
| **Featured Image** | Featured Image | Screenshot | Hero image on right |
| **Category** | Categories | "Productivity" | Breadcrumb navigation |
| **Tags** | Tags | "Writing", "AI" | For filtering (homepage) |

### Optional Custom Fields (Make page rich with data)

These are **optional** - the page works without them, but they make it better:

#### Product Info (Shows in right sidebar)

| ACF Field Name | Type | Example | 
|----------------|------|---------|
| `logo` | Image | ChatGPT logo |
| `productWebsite` | URL | https://chat.openai.com |
| `publishedDate` | Text | "2021, Aug, 17" |
| `latestUpdate` | Text | "2025, Sep, 28" |
| `latestVersion` | Text | "v 4.0" |
| `seller` | Text | "OpenAI" |
| `discussionUrl` | URL | Community link |

#### Statistics (Shows in sidebar cards)

| ACF Field Name | Type | Example |
|----------------|------|---------|
| `boostedProductivity` | Text | "+60%" |
| `lessManualWork` | Text | "6 hours / week" |

#### Features (Shows in main content)

| ACF Field Name | Type | Example |
|----------------|------|---------|
| `keyFindings` | Repeater | ["Copy writing", "Code generation", "Math solving"] |
| `targetAudience` | Repeater | ["Students", "Developers", "Writers"] |

#### Extra Content

| ACF Field Name | Type | Example |
|----------------|------|---------|
| `useCases` | WYSIWYG | Rich HTML content with images, lists, formatting |
| `pricingModel` | Text | "Free / Paid $20+" |

## Step-by-Step: Create Your First Tool Page

### 1. Create a Post in WordPress

```
Title: ChatGPT
Slug: chatgpt (edit the permalink)
Category: Productivity
Tags: Writing, AI Assistant, Basic Tasks
```

### 2. Add Content

**Content Editor:**
```
ChatGPT is an AI language model developed by OpenAI...

[Add full description with formatting, images, headings, etc.]
```

**Excerpt:**
```
AI assistant that helps with writing, coding, and problem-solving across various domains.
```

### 3. Set Featured Image

Upload a screenshot of ChatGPT interface

### 4. (Optional) Add Custom Fields

If you have ACF installed:
```
Logo: [Upload ChatGPT logo]
Product Website: https://chat.openai.com
Published Date: 2021, Aug, 17
Seller: OpenAI
Boosted Productivity: +60%
Key Findings:
  - Copy writing
  - Code generation  
  - Brainstorming
  - Data analysis
Target Audience:
  - Students
  - Developers
  - Content Creators
```

### 5. Publish

Click **Publish** and you're done!

## Testing Your Page

1. **Go to homepage**: You should see your post in "All AI Tool Reviews & Guides"
2. **Click "Full Review"**: Goes to `/tool/chatgpt`
3. **Page loads**: Shows your WordPress content

## What Shows Where on the Detail Page

```
┌─────────────────────────────────────────────┐
│ Header (always shows)                       │
├─────────────────────────────────────────────┤
│ Breadcrumb: Category / Title               │
├─────────────────────────────────────────────┤
│ Hero Section:                               │
│  ┌─────────┐  Title (from post title)      │
│  │  Logo   │  Excerpt (from excerpt)       │
│  │ (ACF)   │  [Visit Website] (ACF)        │
│  └─────────┘                                │
│                                              │
│  Overview (from content/excerpt)            │
├─────────────────────────────────────────────┤
│ Main Content                   │ Sidebar    │
│ ────────────────              │ ─────────  │
│ What is [Title]                │ Product    │
│   (from post content)          │ Info       │
│                                │ (ACF)      │
│ Key Findings                   │            │
│   (from keyFindings ACF)       │ Stats      │
│   [Only shows if ACF has data] │ (ACF)      │
│                                │            │
│ Who is it for                  │            │
│   (from targetAudience ACF)    │            │
│                                │            │
│ Pricing                        │            │
│   (from pricingModel ACF)      │            │
│                                │            │
│ Use Cases                      │            │
│   (from useCases ACF)          │            │
│   [Only shows if ACF has data] │            │
│                                │            │
│ Reviews (placeholder)          │            │
└────────────────────────────────┴────────────┘
```

## Important Notes

✅ **What IS dynamic (from WordPress):**
- ALL text content
- ALL images
- Logo, featured image
- Product info
- Statistics
- Key findings
- Target audience
- Use cases
- Everything!

❌ **What is NOT hardcoded:**
- Nothing! It's all from WordPress now.

## Minimum to Avoid 404

Just need these 3 things:
1. ✅ Post title: "ChatGPT"
2. ✅ Post slug: "chatgpt"  
3. ✅ Status: Published

That's it! Page will load (even without custom fields).

## Troubleshooting

**404 Error?**
- Check the slug matches the URL
- Make sure post is Published (not Draft)
- Verify WP_GRAPHQL_ENDPOINT in .env is correct

**Sections not showing?**
- Sections only show if ACF fields have data
- Example: "Key Findings" won't show if `keyFindings` ACF is empty
- This is intentional - clean pages without empty sections

**Images not loading?**
- Upload directly to WordPress media library
- Don't use external URLs (they might be blocked by CORS)
- Featured image is required for hero section

## Next Steps

1. Create 3-5 sample posts in WordPress
2. Test the detail pages
3. Add ACF fields gradually (start with basic, add advanced later)
4. Customize the template styling if needed (edit `page.tsx`)

