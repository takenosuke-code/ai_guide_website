// lib/queries.ts

// タグ（最大6件）
export const TAGS_QUERY = `
  query GetTags($first: Int = 6) {
    tags(first: $first, where: { orderby: NAME, order: ASC }) {
      nodes { id name slug count }
    }
  }
`;

// 指定タグの投稿一覧（カード用）
// aiToolMeta.logo は node 直下を取得
export const TOOLS_BY_TAG_QUERY = `
  query GetToolsByTag($tag: [String]) {
    posts(where: { tagSlugIn: $tag }, first: 30) {
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
        }
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
      title
      content
      excerpt
      date
      featuredImage { node { sourceUrl altText } }
      uri
      tags { nodes { name slug } }
      categories { nodes { name slug } }
    }
  }
`;

// クエリ for 関連投稿
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
        aiToolMeta {
          logo {
            node { sourceUrl altText }
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
