// lib/queries.ts

// タグ（最大6件）
export const TAGS_QUERY = `
  query GetTags($first: Int = 6) {
    tags(first: $first, where: { orderby: NAME, order: ASC }) {
      nodes { id name slug count }
    }
  }
`;

// Single tag by slug (for collection/category pages)
export const TAG_BY_SLUG_QUERY = `
  query TagBySlug($slug: ID!) {
    tag(id: $slug, idType: SLUG) {
      id
      name
      slug
      description
      count
    }
  }
`;

// 指定タグの投稿一覧（カード用）
// aiToolMeta.logo は node 直下を取得
// Only show posts from category "ai-review"
export const TOOLS_BY_TAG_QUERY = `
  query GetToolsByTag($tag: [String]) {
    posts(where: { tagSlugIn: $tag, categoryName: "ai-review" }, first: 30) {
      nodes {
        id
        title
        slug
        excerpt
        featuredImage { node { sourceUrl } }
        aiToolMeta {
          logo {
            node { sourceUrl altText }
          }
          keyFindingsRaw
        }
        tags { nodes { name slug } }
      }
    }
  }
`;

// 詳細ページ用（/tool/[slug]）
// Simplified query - only basic WordPress fields (no ACF needed)
export const POST_BY_SLUG_QUERY = `
  query PostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      content
      excerpt
      date
      featuredImage { node { sourceUrl altText } }
      uri
      tags { nodes { name slug } }
      categories { nodes { name slug } }
      aiToolMeta {
        logo {
          node { sourceUrl altText }
        }
        overview
        productWebsite
        youtubeLink
        publishedDate
        latestUpdate
        latestVersion
        seller
        discussionUrl
        keyFindingsRaw
        boostedProductivity
        lessManualWork
        overviewimage {
          node { sourceUrl altText }
        }
      }
    }
  }
`;

// Reviews query - fetches ALL reviews
// Post Object fields in ACF are exposed as connections with nodes
export const REVIEWS_BY_POST_ID_QUERY = `
  query ReviewsByPostId {
    reviews(first: 100) {
      nodes {
        id
        databaseId
        title
        content
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        reviewerMeta {
          reviewerName
          reviewerCountry
          starRating
          reviewDate
          relatedTool {
            nodes {
              databaseId
            }
          }
        }
      }
    }
  }
`;

// クエリ for 関連投稿
// Can be used for both ai-review and blog categories
export const RELATED_POSTS_QUERY = `
  query RelatedPosts($tags: [String], $excludeId: ID!, $first: Int = 3) {
    posts(
      where: { tagSlugIn: $tags, notIn: [$excludeId] }
      first: $first
    ) {
      nodes {
        id
        title
        slug
        excerpt
        featuredImage { node { sourceUrl } }
        author {
          node {
            name
            avatar { url }
          }
        }
        categories { nodes { name slug } }
        aiToolMeta {
          logo {
            node { sourceUrl altText }
          }
          keyFindingsRaw
        }
        blog {
          topPickImage {
            node {
              sourceUrl
              altText
            }
          }
          authorIcon {
            node {
              sourceUrl
              altText
            }
          }
        }
        tags { nodes { name slug } }
      }
    }
  }
`;

// lib/queries.ts
export const FAQS_QUERY = /* GraphQL */ `
  query FAQs($first: Int = 50) {
    faqs(
      first: $first
      where: { orderby: [{ field: MENU_ORDER, order: ASC }, { field: DATE, order: DESC }] }
    ) {
      nodes {
        id
        title
        content
      }
    }
  }
`;

// Tools by modified date (for use in page.tsx)
// Only show posts from category "ai-review"
export const TOOLS_BY_MODIFIED_QUERY = `
  query ToolsByModified {
    posts(first: 9, where: { categoryName: "ai-review", orderby: { field: MODIFIED, order: DESC } }) {
      nodes {
        id
        title
        slug
        excerpt
        featuredImage { node { sourceUrl } }
        aiToolMeta {
          logo { node { sourceUrl } }
          keyFindingsRaw
        }
        tags { nodes { name slug } }
      }
    }
  }
`;

// Latest blog posts for Top 10 Picks carousel
export const LATEST_TOP_PICKS_QUERY = `
  query LatestTopPicks($first: Int = 10) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        categoryName: "blog"
        orderby: [{ field: DATE, order: DESC }]
      }
    ) {
      nodes {
        id
        slug
        title
        excerpt
        featuredImage { node { sourceUrl } }
        author { node { name avatar { url } } }
        blog {
          topPickImage {
            node {
              sourceUrl
              mediaItemUrl
            }
          }
          authorIcon {
            node {
              sourceUrl
              mediaItemUrl
            }
          }
        }
      }
    }
  }
`;

// Get category ID by slug (for reliable category filtering)
export const CATEGORY_ID_BY_SLUG_QUERY = `
  query CategoryIdBySlug($slug: [String]) {
    categories(where: { slug: $slug }) {
      nodes { databaseId slug name }
    }
  }
`;

// Latest blog posts filtered by category ID (more reliable)
export const LATEST_TOP_PICKS_BY_CATID_QUERY = `
  query LatestTopPicksByCatId($first: Int = 10, $catId: [ID]) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        categoryIn: $catId
        orderby: [{ field: DATE, order: DESC }]
      }
    ) {
      nodes {
        id
        slug
        title
        excerpt
        featuredImage { node { sourceUrl } }
        blog {
          topPickImage {
            node {
              sourceUrl
            }
          }
          authorIcon {
            node {
              sourceUrl
            }
          }
        }
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
      }
    }
  }
`;

// Latest blog posts filtered by category name (fallback for older WPGraphQL)
export const LATEST_TOP_PICKS_BY_NAME_QUERY = `
  query LatestTopPicksByName($first: Int = 10) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        categoryName: "blog"
        orderby: [{ field: DATE, order: DESC }]
      }
    ) {
      nodes {
        id
        slug
        title
        excerpt
        featuredImage { node { sourceUrl } }
        blog {
          topPickImage {
            node {
              sourceUrl
            }
          }
          authorIcon {
            node {
              sourceUrl
            }
          }
        }
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
      }
    }
  }
`;

// Single blog post by slug (for blog detail pages)
export const BLOG_POST_BY_SLUG_QUERY = `
  query BlogPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      content
      excerpt
      date
      modified
      featuredImage { 
        node { 
          sourceUrl 
          altText 
        } 
      }
      uri
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
      author {
        node {
          name
          description
          avatar {
            url
          }
        }
      }
      blog {
        topPickImage {
          node {
            sourceUrl
            altText
            mediaItemUrl
          }
        }
        authorIcon {
          node {
            sourceUrl
            altText
            mediaItemUrl
          }
        }
      }
    }
  }
`;