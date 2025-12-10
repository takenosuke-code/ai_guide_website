// ============================================================================
// FILE: app/articles/page.tsx
// PURPOSE: Articles collection page matching Figma design
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { wpFetch } from '../../lib/wpclient';
import { ALL_BLOG_ARTICLES_QUERY, RANDOM_BLOG_POSTS_QUERY, LATEST_TOP_PICKS_QUERY, CATEGORIES_QUERY, ALL_TAG_SLUGS, NAV_MENU_POSTS_QUERY, ALL_TOOLS_QUERY, TAGS_QUERY } from '../../lib/queries';
import Container from '../(components)/Container';
import FallbackImg from '../components/FallbackImg';
import ArticlesBlogScrollSection from '../components/ArticlesBlogScrollSection';
import PrimaryHeader from '@/components/site-header/PrimaryHeader';
import { buildNavGroups, NavMenuPostNode } from '@/lib/nav-groups';
import { getSiteBranding } from '@/lib/branding';
import AllArticlesSection from './AllArticlesSection';
import SiteFooter from '@/components/SiteFooter';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText?: string;
    };
  } | null;
  author: {
    node: {
      name: string;
      avatar: {
        url: string;
      } | null;
    };
  };
  blog: {
    topPickImage: {
      node: {
        sourceUrl: string;
        altText?: string;
      };
    } | null;
    authorIcon: {
      node: {
        sourceUrl: string;
        altText?: string;
      };
    } | null;
    authorBio: string | null;
  } | null;
  categories?: {
    nodes: Array<{
      name: string;
      slug: string;
    }>;
  };
  tags: {
    nodes: Array<{
      name: string;
      slug: string;
    }>;
  };
}

interface ArticlesData {
  posts: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    nodes: BlogArticle[];
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function ArticlesPage() {
  // Fetch all blog articles
  const allArticlesData = await wpFetch<ArticlesData>(
    ALL_BLOG_ARTICLES_QUERY,
    { first: 100 },
    { revalidate: 3600 }
  );

  const allArticles = allArticlesData?.posts?.nodes ?? [];

  // Fetch random articles for top row
  const randomData = await wpFetch<ArticlesData>(
    RANDOM_BLOG_POSTS_QUERY,
    { first: 20 },
    { revalidate: 3600 }
  );
  const randomArticles = shuffleArray(randomData?.posts?.nodes ?? []).slice(0, 3);

  // Fetch articles for carousel (second row)
  const carouselData = await wpFetch<ArticlesData>(
    LATEST_TOP_PICKS_QUERY,
    { first: 10 },
    { revalidate: 3600 }
  );
  const carouselArticles = carouselData?.posts?.nodes ?? [];

  // Extract unique categories from blog articles
  // This ensures we only show categories that actually have blog posts
  const categoryMap = new Map<string, { name: string; slug: string; count: number }>();
  
  allArticles.forEach((article) => {
    article.categories?.nodes?.forEach((cat) => {
      // Skip the main "blog" category and "uncategorized"
      if (cat.slug !== 'blog' && cat.slug !== 'uncategorized') {
        const existing = categoryMap.get(cat.slug);
        if (existing) {
          existing.count += 1;
        } else {
          categoryMap.set(cat.slug, {
            name: cat.name,
            slug: cat.slug,
            count: 1,
          });
        }
      }
    });
  });

  // Get the first 2 categories that have posts, sorted by count (most posts first)
  const blogCategories = Array.from(categoryMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 2);

  // Get articles for each category
  const category1 = blogCategories[0];
  const category2 = blogCategories[1];

  const category1Articles = category1
    ? allArticles.filter((article) => {
        return article.categories?.nodes?.some((cat) => cat.slug === category1.slug) ?? false;
      }).slice(0, 6)
    : [];

  const category2Articles = category2
    ? allArticles.filter((article) => {
        return article.categories?.nodes?.some((cat) => cat.slug === category2.slug) ?? false;
      }).slice(0, 6)
    : [];

  // Build tag-based sections so editors can group articles by any tag label (even long phrases)
  const tagMap = new Map<string, { name: string; slug: string; count: number }>();
  allArticles.forEach((article) => {
    article.tags?.nodes?.forEach((tag) => {
      const existing = tagMap.get(tag.slug);
      if (existing) {
        existing.count += 1;
      } else {
        tagMap.set(tag.slug, {
          name: tag.name,
          slug: tag.slug,
          count: 1,
        });
      }
    });
  });

  // Pick the top 3 tags so this section stays tidy; editors just need to tag articles accordingly
  const tagSections = Array.from(tagMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((tag) => ({
      tag,
      articles: allArticles
        .filter((article) => article.tags?.nodes?.some((t) => t.slug === tag.slug))
        .slice(0, 6),
    }))
    .filter((section) => section.articles.length > 0);

  // Fetch blog category name for "All articles" section title
  const categoriesRes = await wpFetch<{ categories: { nodes: Array<{ name: string; slug: string }> } }>(
    CATEGORIES_QUERY,
    { first: 50 },
    { revalidate: 3600 }
  );
  const allCategories = categoriesRes?.categories?.nodes ?? [];
  const blogCategory = allCategories.find(c => c.slug === 'blog');
  const allArticlesTitle = blogCategory?.name ? `All ${blogCategory.name}` : 'All articles';

  // Fetch all tags for search
  const allTagRes = await wpFetch<{ tags: { nodes: { name: string; slug: string }[] } }>(
    ALL_TAG_SLUGS,
    {},
    { revalidate: 3600 }
  );
  const allTags = allTagRes?.tags?.nodes ?? [];

  // Fetch nav groups for global header
  const navMenuRes = await wpFetch<{ posts: { nodes: NavMenuPostNode[] } }>(
    NAV_MENU_POSTS_QUERY,
    { first: 200 },
    { revalidate: 3600 }
  );
  const navGroups = buildNavGroups(navMenuRes?.posts?.nodes ?? []);

  // Fetch site branding
  const branding = await getSiteBranding();

  // Fetch data for footer sections
  const allToolsData = await wpFetch<{ posts: { nodes: any[] } }>(
    ALL_TOOLS_QUERY, 
    { first: 200 },
    { revalidate: 3600 }
  );
  const allTools = allToolsData?.posts?.nodes ?? [];

  const tagsRes = await wpFetch<{ tags: { nodes: Array<{ name: string; slug: string }> } }>(
    TAGS_QUERY,
    { first: 50 },
    { revalidate: 3600 }
  );
  const allTagsForFooter = tagsRes?.tags?.nodes ?? [];

  // Build footer sections
  const collectionLinks = navGroups
    .flatMap((group) => group.tags || [])
    .slice(0, 8)
    .map((tag) => ({
      label: tag.label,
      href: `/collection/${tag.slug}`,
    }));

  const categoryLinks = allCategories
    .filter((cat) => cat.slug !== "uncategorized" && cat.slug !== "blog")
    .slice(0, 8)
    .map((cat) => ({
      label: cat.name,
      href: `/collection/${cat.slug}`,
    }));

  const blogTagLinks = allTagsForFooter.slice(0, 8).map((tag) => ({
    label: tag.name,
    href: `/articles?tag=${tag.slug}`,
  }));

  const blogLinks = carouselArticles.slice(0, 13).map((post) => ({
    label: post.title,
    href: `/blog/${post.slug}`,
  }));

  const footerSections = [
    {
      title: "Collections",
      items:
        collectionLinks.length > 0
          ? collectionLinks
          : [
              { label: "All AI Tools", href: "/#reviews" },
              { label: "Trending", href: "/#reviews" },
              { label: "New Releases", href: "/#reviews" },
            ],
    },
    {
      title: "Top Categories",
      items:
        categoryLinks.length > 0
          ? categoryLinks
          : [
              { label: "Marketing", href: "/collection/marketing" },
              { label: "Productivity", href: "/collection/productivity" },
            ],
    },
    {
      title: "Blog Highlights",
      items: blogLinks.length > 0 ? blogLinks : [{ label: "All Articles", href: "/articles" }],
    },
    {
      title: "Topics",
      items:
        blogTagLinks.length > 0
          ? blogTagLinks
          : [
              { label: "Guides", href: "/articles" },
              { label: "Case Studies", href: "/articles" },
            ],
    },
  ];

  // All articles will be passed to client component

  return (
    <div className="min-h-screen bg-gray-50">
      <PrimaryHeader 
        tags={allTags} 
        navGroups={navGroups}
        siteName={branding.siteName}
        siteLogo={branding.siteLogo}
      />

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <div style={{ paddingLeft: '35px', paddingRight: '35px' }}>
          <Container>
          {/* Top Row - Random Articles (3 cards) */}
          {randomArticles.length > 0 && (
            <div className="grid grid-cols-3 gap-6 mb-12 mt-16">
              {randomArticles.map((article) => {
                const heroImage =
                  article.blog?.topPickImage?.node?.sourceUrl ??
                  article.featuredImage?.node?.sourceUrl ??
                  undefined;

                return (
                  <Link key={article.id} href={`/blog/${article.slug}`}>
                    <article 
                      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100 w-full max-w-[325px] mx-auto"
                    >
                      <div className="relative w-full aspect-[325/265]">
                        <FallbackImg
                          src={heroImage}
                          fallback="https://via.placeholder.com/325x265?text=No+Image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center p-4 min-h-[117px] min-w-0">
                        <h3 className="font-bold break-words w-full" style={{ fontSize: '16px', lineHeight: '100%', color: '#4D545D', fontFamily: 'Inter', letterSpacing: '0%' }}>
                          {article.title}
                        </h3>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Second Row - Scrollable Blog Section (all articles) */}
          {allArticles.length > 0 && (
            <ArticlesBlogScrollSection posts={allArticles} />
          )}

          {/* Category Section 1 */}
          {category1 && category1Articles.length > 0 && (
            <div className="mb-12">
              <h2 className="font-bold mb-8 text-center" style={{ fontSize: '28px', lineHeight: '100%', color: '#4D545D', fontFamily: 'Inter' }}>
                {category1.name}
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {category1Articles.map((article) => {
                  const heroImage =
                    article.blog?.topPickImage?.node?.sourceUrl ??
                    article.featuredImage?.node?.sourceUrl ??
                    undefined;

                  return (
                    <Link key={article.id} href={`/blog/${article.slug}`}>
                      <article 
                        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100 w-full max-w-[325px] mx-auto"
                      >
                        <div className="relative w-full aspect-[325/265]">
                          <FallbackImg
                            src={heroImage}
                            fallback="https://via.placeholder.com/325x265?text=No+Image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center p-4 min-h-[117px]">
                          <h3 className="text-base font-bold text-gray-900 line-clamp-3">
                            {article.title}
                          </h3>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Section 2 */}
          {category2 && category2Articles.length > 0 && (
            <div className="mb-12">
              <h2 className="font-bold mb-8 text-center" style={{ fontSize: '28px', lineHeight: '100%', color: '#4D545D', fontFamily: 'Inter' }}>
                {category2.name}
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {category2Articles.map((article) => {
                  const heroImage =
                    article.blog?.topPickImage?.node?.sourceUrl ??
                    article.featuredImage?.node?.sourceUrl ??
                    undefined;

                  return (
                    <Link key={article.id} href={`/blog/${article.slug}`}>
                      <article 
                        className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100 w-full max-w-[325px] mx-auto"
                      >
                        <div className="relative w-full aspect-[325/265]">
                          <FallbackImg
                            src={heroImage}
                            fallback="https://via.placeholder.com/325x265?text=No+Image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center p-4 min-h-[117px]">
                          <h3 className="text-base font-bold text-gray-900 line-clamp-3">
                            {article.title}
                          </h3>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tag-based Sections (auto-created from article tags) */}
          {tagSections.length > 0 && (
            <div className="space-y-12 mb-12">
              {tagSections.map(({ tag, articles }) => (
                <div key={tag.slug}>
                  <h2 className="font-bold mb-8 text-center" style={{ fontSize: '28px', lineHeight: '100%', color: '#4D545D', fontFamily: 'Inter' }}>
                    {tag.name}
                  </h2>
                  <div className="grid grid-cols-3 gap-6">
                    {articles.map((article) => {
                      const heroImage =
                        article.blog?.topPickImage?.node?.sourceUrl ??
                        article.featuredImage?.node?.sourceUrl ??
                        undefined;

                      return (
                        <Link key={article.id} href={`/blog/${article.slug}`}>
                          <article 
                            className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                            style={{ width: '325px' }}
                          >
                            <div className="relative" style={{ width: '325px', height: '265px' }}>
                              <FallbackImg
                                src={heroImage}
                                fallback="https://via.placeholder.com/325x265?text=No+Image"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex items-center p-4 min-w-0" style={{ width: '325px', height: '117px' }}>
                              <h3 className="font-bold break-words w-full" style={{ fontSize: '16px', lineHeight: '100%', color: '#4D545D', fontFamily: 'Inter', letterSpacing: '0%' }}>
                                {article.title}
                              </h3>
                            </div>
                          </article>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All Articles Section */}
          <AllArticlesSection allArticles={allArticles} title={allArticlesTitle} />
          </Container>
        </div>
      </section>
      <SiteFooter sections={footerSections} />
    </div>
  );
}

// ============================================================================
// METADATA FOR SEO
// ============================================================================

export const metadata = {
  title: 'All Articles - AI Tools Directory',
  description: 'Explore all our blog articles about AI tools, guides, and insights.',
};

// ============================================================================
// ISR CONFIGURATION
// ============================================================================

export const revalidate = 3600; // Revalidate every hour
