// lib/queries.ts

// タグ（最大6件）
export const TAGS_QUERY = `
  query GetTags($first: Int = 6) {
    tags(first: $first, where: { orderby: NAME, order: ASC }) {
      nodes { id name slug count }
    }
  }
`;

// すべてのタグ（サジェスト用）
export const ALL_TAG_SLUGS = /* GraphQL */ `
  query ALL_TAG_SLUGS($first: Int = 500) {
    tags(first: $first) {
      nodes {
        name
        slug
      }
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
        productWebsite
        publishedDate
        latestUpdate
        latestVersion
        seller
        discussionUrl
        keyFindingsRaw
        youtubeLink
        overview
        whoIsItFor
        pricing
        tutorialvid
        tutorialvid1
        tutorialvid2
        relatedpost1 {
          node { sourceUrl altText }
        }
        relatedpost2 {
          node { sourceUrl altText }
        }
        relatedpost3 {
          node { sourceUrl altText }
        }
        relatedpost4 {
          node { sourceUrl altText }
        }
        relatedpost5 {
          node { sourceUrl altText }
        }
        relatedpost6 {
          node { sourceUrl altText }
        }
        boostedProductivity
        lessManualWork
        overviewimage {
          node { sourceUrl altText }
        }
      }
      author {
        node {
          name
          description
          avatar { url }
        }
      }
      blog {
        authorBio
        authorIcon {
          node {
            sourceUrl
          }
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
  query RelatedPosts($tags: [String], $excludeId: ID!, $first: Int = 10) {
    posts(
      where: { tagSlugIn: $tags, notIn: [$excludeId], categoryName: "ai-review" }
      first: $first
    ) {
      nodes {
        id
        databaseId
        uri
        title
        slug
        excerpt
        featuredImage { node { sourceUrl altText } }
        categories { nodes { name slug } }
        aiToolMeta {
          logo {
            node { sourceUrl altText }
          }
          keyFindingsRaw
          whoIsItFor
          pricing
          latestVersion
          publishedDate
          latestUpdate
        }
        blog {
          topPickImage {
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

// Blogカテゴリ＋タグ一致（最大3件）
export const RELATED_BLOG_POSTS_BY_TAGS = /* GraphQL */ `
  query RELATED_BLOG_POSTS_BY_TAGS($tagSlugs: [String], $excludeId: ID!, $first: Int = 3) {
    posts(
      where: {
        categoryName: "blog"
        tagSlugIn: $tagSlugs
        notIn: [$excludeId]
        status: PUBLISH
      }
      first: $first
    ) {
      nodes {
        id
        title
        slug
        excerpt
        featuredImage { node { sourceUrl } }
        tags { nodes { name slug } }
        author {
          node {
            name
          }
        }
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
      }
    }
  }
`;

// Blogの最近記事で補完
export const RECENT_BLOG_POSTS = /* GraphQL */ `
  query RECENT_BLOG_POSTS($excludeId: ID!, $first: Int = 3) {
    posts(
      where: {
        categoryName: "blog"
        notIn: [$excludeId]
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
      }
      first: $first
    ) {
      nodes {
        id
        title
        slug
        excerpt
        featuredImage { node { sourceUrl } }
        tags { nodes { name slug } }
        author {
          node {
            name
          }
        }
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
        author {
          node {
            name
            avatar { url }
          }
        }
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
          authorBio
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
        author {
          node {
            name
            avatar { url }
          }
        }
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
          authorBio
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
        author {
          node {
            name
            avatar { url }
          }
        }
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
          authorBio
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
          }
        }
        authorIcon {
          node {
            sourceUrl
            altText
          }
        }
        authorBio
      }
    }
  }
`;