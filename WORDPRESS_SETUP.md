# WordPress Setup Guide for AI Tools Directory

This guide will help you configure WordPress as a headless CMS for the AI Tools Directory.

## Required Plugins

1. **WPGraphQL** (Required)
   - Install from: https://wordpress.org/plugins/wp-graphql/
   - Adds GraphQL API to WordPress

2. **WPGraphQL for Advanced Custom Fields** (Recommended)
   - Install from: https://github.com/wp-graphql/wp-graphql-acf
   - Exposes ACF fields to GraphQL

3. **Advanced Custom Fields (ACF) Pro** (Recommended)
   - Install from: https://www.advancedcustomfields.com/
   - For creating custom fields easily

## Step 1: Install Plugins

```bash
# Via WordPress Admin
Dashboard → Plugins → Add New → Search for "WPGraphQL"
```

Or use WP-CLI:
```bash
wp plugin install wp-graphql --activate
wp plugin install wp-graphql-acf --activate
```

## Step 2: Create Custom Post Type (Optional)

If you want a dedicated "AI Tools" post type instead of using regular posts:

```php
// Add to your theme's functions.php
function create_ai_tools_post_type() {
    register_post_type('ai_tool',
        array(
            'labels' => array(
                'name' => __('AI Tools'),
                'singular_name' => __('AI Tool')
            ),
            'public' => true,
            'has_archive' => true,
            'show_in_graphql' => true,
            'graphql_single_name' => 'aiTool',
            'graphql_plural_name' => 'aiTools',
            'supports' => array('title', 'editor', 'excerpt', 'thumbnail', 'custom-fields')
        )
    );
}
add_action('init', 'create_ai_tools_post_type');
```

## Step 3: Create Custom Fields with ACF

### Field Group: AI Tool Meta

**Location Rules:** Post Type is equal to Post (or AI Tool)

#### Fields Configuration

```
Field Group: AI Tool Meta
├── Tab: Basic Info
│   ├── Logo (Image)
│   │   - Field Name: logo
│   │   - Return Format: Image Object
│   │
│   ├── Product Website (URL)
│   │   - Field Name: product_website
│   │
│   ├── Published Date (Text)
│   │   - Field Name: published_date
│   │   - Placeholder: "2021, Aug, 17"
│   │
│   ├── Latest Update (Text)
│   │   - Field Name: latest_update
│   │   - Placeholder: "2025, Sep, 28"
│   │
│   ├── Latest Version (Text)
│   │   - Field Name: latest_version
│   │   - Placeholder: "v 112.5"
│   │
│   ├── Seller (Text)
│   │   - Field Name: seller
│   │   - Placeholder: "Google"
│   │
│   └── Discussion URL (URL)
│       - Field Name: discussion_url
│
├── Tab: Statistics
│   ├── Boosted Productivity (Text)
│   │   - Field Name: boosted_productivity
│   │   - Placeholder: "+60%"
│   │
│   └── Less Manual Work (Text)
│       - Field Name: less_manual_work
│       - Placeholder: "6 hours / week"
│
├── Tab: Features & Audience
│   ├── Key Findings (Repeater)
│   │   - Field Name: key_findings
│   │   - Sub Fields:
│   │       └── Finding (Text)
│   │           - Field Name: finding
│   │
│   └── Target Audience (Repeater)
│       - Field Name: target_audience
│       - Sub Fields:
│           └── Audience Type (Text)
│               - Field Name: audience_type
│
├── Tab: Pricing
│   └── Pricing Model (Text)
│       - Field Name: pricing_model
│       - Placeholder: "Free / Paid $25+"
│
└── Tab: Extended Content
    └── Use Cases (WYSIWYG Editor)
        - Field Name: use_cases
```

## Step 4: Configure WPGraphQL

1. Go to **GraphQL → Settings**
2. Enable "Public Introspection" (for development)
3. Set GraphQL Endpoint: `/graphql` (default)

### Enable ACF in GraphQL

1. Edit your Field Group in ACF
2. Under "Settings" → "Show in GraphQL"
3. Check the box
4. Set GraphQL Field Name: `aiToolMeta`

## Step 5: Create Categories and Tags

### Categories
```
- Marketing
- Business  
- Development
- Design
- Productivity
```

### Tags
Create tags for filtering (these will appear on homepage):
```
- Writing
- Data Analytics
- Research
- Basic Tasks
- Image Generation
- Code Assistant
```

## Step 6: Create Sample Post

1. Go to **Posts → Add New**
2. Title: "ChatGPT"
3. Content: Full description of the tool
4. Excerpt: Short summary
5. Featured Image: Tool screenshot
6. Categories: Select "Productivity"
7. Tags: Select "Writing", "Basic Tasks"

### Fill Custom Fields:

```
Basic Info:
- Logo: Upload ChatGPT logo
- Product Website: https://chat.openai.com
- Published Date: 2021, Aug, 17
- Latest Update: 2025, Sep, 28
- Latest Version: v 112.5
- Seller: OpenAI
- Discussion URL: https://community.openai.com

Statistics:
- Boosted Productivity: +60%
- Less Manual Work: 6 hours / week

Key Findings (add multiple):
1. copy writing
2. math solving
3. general conversation
4. finding restaurants
5. code generation
6. language translation

Target Audience (add multiple):
1. Students
2. Professionals  
3. Entrepreneurs
4. Developers
5. Writers

Pricing:
- Pricing Model: Free / Paid $20+

Use Cases:
[Add rich content here about how to use the tool]
```

## Step 7: Test GraphQL Query

Go to **GraphQL → GraphiQL IDE** and test:

```graphql
query TestQuery {
  posts(first: 1) {
    nodes {
      id
      title
      slug
      content
      excerpt
      featuredImage {
        node {
          sourceUrl
        }
      }
      aiToolMeta {
        logo {
          node {
            sourceUrl
          }
        }
        productWebsite
        publishedDate
        latestUpdate
        latestVersion
        seller
        discussionUrl
        boostedProductivity
        lessManualWork
        keyFindings {
          finding
        }
        targetAudience {
          audienceType
        }
        pricingModel
        useCases
      }
      tags {
        nodes {
          name
          slug
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
    }
  }
}
```

## Step 8: Connect to Next.js

Add to your `.env.local` file:

```bash
WP_GRAPHQL_ENDPOINT=https://your-wordpress-site.com/graphql
```

## Security Considerations

### Production Setup

1. **Disable Public Introspection**
   ```
   GraphQL → Settings → Uncheck "Public Introspection"
   ```

2. **Restrict GraphQL Access** (Optional)
   - Install "WPGraphQL JWT Authentication"
   - Configure authentication if needed

3. **CORS Configuration**
   Add to `wp-config.php`:
   ```php
   header("Access-Control-Allow-Origin: https://your-nextjs-site.com");
   ```

4. **Enable HTTPS**
   - Install SSL certificate
   - Force HTTPS in WordPress settings

## Troubleshooting

### Fields not showing in GraphQL

1. Check ACF Field Group has "Show in GraphQL" enabled
2. Verify GraphQL Field Name is set
3. Clear GraphQL schema cache: **GraphQL → Settings → Delete Schema**

### Images not loading

1. Check image URLs are absolute (not relative)
2. Verify CORS headers allow external access
3. Check WordPress media settings for image sizes

### Queries returning null

1. Verify field names match exactly (case-sensitive)
2. Check if field has data in WordPress admin
3. Test query in GraphiQL IDE first

## Bulk Import Tools

You can use WordPress Importer or WP-CLI to bulk import tools:

```bash
wp post create \
  --post_type=post \
  --post_title="Claude" \
  --post_content="Description here" \
  --post_status=publish
```

Then use ACF CLI or REST API to add custom fields programmatically.

## Maintenance

### Regular Tasks

- Update WPGraphQL plugin monthly
- Monitor GraphQL query performance
- Optimize images before upload
- Clean up unused tags/categories
- Backup database regularly

### Performance

- Use caching plugin (WP Rocket, W3 Total Cache)
- Enable object caching (Redis/Memcached)
- Optimize database with WP-Optimize
- Use CDN for media files

## Additional Resources

- [WPGraphQL Documentation](https://www.wpgraphql.com/docs/introduction)
- [ACF Documentation](https://www.advancedcustomfields.com/resources/)
- [Next.js ISR Guide](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)

