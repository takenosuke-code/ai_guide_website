# AI Tools Guide - Tool Detail Pages

## Overview

This project uses Next.js 14+ with WordPress as a headless CMS via WPGraphQL to create dynamic tool detail pages.

## Architecture

### Routes Structure

```
/                          # Homepage with trending tools, categories, FAQ
/tool/[slug]              # Dynamic tool detail page
```

### Key Files

- `app/page.tsx` - Homepage with tool listings
- `app/tool/[slug]/page.tsx` - Dynamic tool detail page
- `lib/wpclient.ts` - WordPress GraphQL client
- `lib/queries.ts` - GraphQL queries
- `components/PricingSection.tsx` - Reusable pricing component

## WordPress Custom Fields Setup

To use all features of the tool detail pages, configure the following custom fields in WordPress (using ACF or similar):

### Field Group: `aiToolMeta`

| Field Name | Type | Description |
|------------|------|-------------|
| `logo` | Media | Tool logo image |
| `productWebsite` | URL | Official product website |
| `publishedDate` | Text | Original publish date |
| `latestUpdate` | Text | Latest update date |
| `latestVersion` | Text | Current version number |
| `seller` | Text | Company/seller name |
| `discussionUrl` | URL | Community/discussion link |
| `boostedProductivity` | Text | Productivity boost stat (e.g., "+60%") |
| `lessManualWork` | Text | Time saved stat (e.g., "6 hours/week") |
| `keyFindings` | Repeater/Array | List of key features |
| `targetAudience` | Repeater/Array | List of target user types |
| `pricingModel` | Text | Pricing description |
| `useCases` | WYSIWYG | Extended use case content |

## GraphQL Schema

The queries expect this WordPress schema:

```graphql
type Post {
  id: ID!
  title: String
  content: String
  excerpt: String
  slug: String
  date: String
  featuredImage {
    node {
      sourceUrl: String
      altText: String
    }
  }
  aiToolMeta {
    logo {
      node {
        sourceUrl: String
        altText: String
      }
    }
    productWebsite: String
    publishedDate: String
    latestUpdate: String
    latestVersion: String
    seller: String
    discussionUrl: String
    boostedProductivity: String
    lessManualWork: String
    keyFindings: [String]
    targetAudience: [String]
    pricingModel: String
    useCases: String
  }
  tags {
    nodes {
      name: String
      slug: String
    }
  }
  categories {
    nodes {
      name: String
      slug: String
    }
  }
}
```

## Page Sections

The tool detail page includes these sections:

1. **Header** - Navigation and search
2. **Breadcrumb** - Category navigation
3. **Hero Section** - Logo, title, description, CTA
4. **Overview** - Main content about the tool
5. **Key Findings** - Feature highlights
6. **Who is it for** - Target audience cards
7. **Pricing** - Pricing tiers and plans
8. **Prompts** - Example use cases
9. **Tutorials** - Video/guide placeholders
10. **Use Cases** - Extended content
11. **Review Section** - Rating and reviews
12. **Related Posts** - Similar tools
13. **Alternatives** - Competitor tools
14. **Sidebar** - Product info, stats

## Environment Variables

Add to `.env.local`:

```bash
WP_GRAPHQL_ENDPOINT=https://your-wordpress-site.com/graphql
```

## ISR Configuration

Pages use Incremental Static Regeneration with 1-hour revalidation:

```typescript
export const revalidate = 3600; // Revalidate every hour
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Linking from Homepage

Tools on the homepage link to detail pages using:

```tsx
<Link href={`/tool/${tool.slug}`}>
  {/* Tool card content */}
</Link>
```

## Customization

### Styling

All styling uses Tailwind CSS. Key design features:
- Blue gradient theme (`from-blue-500 to-cyan-400`)
- Card-based layout with rounded corners (`rounded-2xl`)
- Hover effects and transitions
- Responsive grid layouts

### Adding New Sections

1. Create a new component in `components/`
2. Import and add to `app/tool/[slug]/page.tsx`
3. Add necessary GraphQL fields to `lib/queries.ts`

### Dynamic Data

The page automatically adapts based on WordPress data:
- If `keyFindings` is empty, section won't render
- Sidebar cards only show if data exists
- Fallback values for missing data

## Deployment

### Vercel (Recommended)

1. Connect your Git repository
2. Add environment variables
3. Deploy

### On-Demand Revalidation

Use the revalidate API route to trigger updates:

```bash
POST /api/revalidate
{
  "secret": "your-secret-token",
  "path": "/tool/chatgpt"
}
```

## WordPress Plugin Requirements

- WPGraphQL
- WPGraphQL for Advanced Custom Fields (if using ACF)
- Custom post type plugin (optional)

## Notes

- Images from WordPress should be optimized before upload
- Use WebP format for better performance
- Consider CDN for media files
- Tags and categories should be configured in WordPress

