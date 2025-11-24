// ============================================================================
// FILE: app/articles/page.tsx
// PURPOSE: Articles collection page matching Figma design
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { wpFetch } from '../../lib/wpclient';
import { ALL_BLOG_ARTICLES_QUERY, RANDOM_BLOG_POSTS_QUERY, LATEST_TOP_PICKS_QUERY, CATEGORIES_QUERY, ALL_TAG_SLUGS, NAVIGATION_TAGS_QUERY } from '../../lib/queries';
import Container from '../(components)/Container';
import FallbackImg from '../components/FallbackImg';
import TopPicksCarousel from '../components/TopPicksCarousel';
import HeroSearchBar from '@/components/HeroSearchBar';
import { ChevronDown } from 'lucide-react';

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

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams?: { showAll?: string };
}) {
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

  // Fetch top tags for navigation
  const navTagsRes = await wpFetch<{ tags: { nodes: Array<{ id: string; name: string; slug: string; count: number }> } }>(
    NAVIGATION_TAGS_QUERY,
    { first: 3 },
    { revalidate: 3600 }
  );
  const navTags = navTagsRes?.tags?.nodes ?? [];

  // "All articles" section - show first 6, rest will be shown via "Read More"
  const showAll = searchParams?.showAll === 'true';
  const allArticlesDisplay = showAll ? allArticles : allArticles.slice(0, 6);
  const hasMoreArticles = !showAll && allArticles.length > 6;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with full menubar */}
      <header
        className="sticky top-0 z-50 w-full shadow-md"
        style={{ position: 'sticky', top: 0, background: 'linear-gradient(to right, #60a5fa, #67e8f9)' }}
      >
        <Container className="py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6 w-full max-w-xl">
              <Link href="/" className="text-white font-semibold hidden md:inline-flex items-center gap-2">
                <span className="text-lg">←</span>
                <span>Back to Home</span>
              </Link>
              <div className="flex-1">
                <HeroSearchBar tags={allTags} />
              </div>
            </div>
            <nav className="flex items-center gap-8">
              {navTags.length > 0 ? (
                navTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/collection/${tag.slug}`}
                    className="flex items-center gap-1 text-white font-medium hover:opacity-90"
                  >
                    {tag.name} <ChevronDown className="w-4 h-4" />
                  </Link>
                ))
              ) : (
                // Fallback if no tags available
                <>
                  <button className="flex items-center gap-1 text-white font-medium hover:opacity-90">
                    Marketing <ChevronDown className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-1 text-white font-medium hover:opacity-90">
                    Business <ChevronDown className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-1 text-white font-medium hover:opacity-90">
                    Learner / Student <ChevronDown className="w-4 h-4" />
                  </button>
                </>
              )}
            </nav>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <section className="py-12 md:py-16">
        <Container>
          {/* Top Row - Random Articles (3 cards) */}
          {randomArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {randomArticles.map((article) => {
                const heroImage =
                  article.blog?.topPickImage?.node?.sourceUrl ??
                  article.featuredImage?.node?.sourceUrl ??
                  undefined;

                return (
                  <Link key={article.id} href={`/blog/${article.slug}`}>
                    <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                      <div className="relative w-full h-48">
                        <FallbackImg
                          src={heroImage}
                          fallback="https://via.placeholder.com/400x200?text=No+Image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                          {article.title}
                        </h3>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Second Row - Scrollable Carousel */}
          {carouselArticles.length > 0 && (
            <div className="mb-12">
              <TopPicksCarousel posts={carouselArticles} showAllButton={false} />
            </div>
          )}

          {/* Category Section 1 */}
          {category1 && category1Articles.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
                {category1.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category1Articles.map((article) => {
                  const heroImage =
                    article.blog?.topPickImage?.node?.sourceUrl ??
                    article.featuredImage?.node?.sourceUrl ??
                    undefined;

                  return (
                    <Link key={article.id} href={`/blog/${article.slug}`}>
                      <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="relative w-full h-48">
                          <FallbackImg
                            src={heroImage}
                            fallback="https://via.placeholder.com/400x200?text=No+Image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
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
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
                {category2.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category2Articles.map((article) => {
                  const heroImage =
                    article.blog?.topPickImage?.node?.sourceUrl ??
                    article.featuredImage?.node?.sourceUrl ??
                    undefined;

                  return (
                    <Link key={article.id} href={`/blog/${article.slug}`}>
                      <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                        <div className="relative w-full h-48">
                          <FallbackImg
                            src={heroImage}
                            fallback="https://via.placeholder.com/400x200?text=No+Image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
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

          {/* All Articles Section */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
              {allArticlesTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allArticlesDisplay.map((article) => {
                const heroImage =
                  article.blog?.topPickImage?.node?.sourceUrl ??
                  article.featuredImage?.node?.sourceUrl ??
                  undefined;

                return (
                  <Link key={article.id} href={`/blog/${article.slug}`}>
                    <article className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                      <div className="relative w-full h-48">
                        <FallbackImg
                          src={heroImage}
                          fallback="https://via.placeholder.com/400x200?text=No+Image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                          {article.title}
                        </h3>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
            {hasMoreArticles && (
              <div className="text-center mt-8">
                <Link
                  href="/articles?showAll=true"
                  className="inline-block text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Read More →
                </Link>
              </div>
            )}
          </div>
        </Container>
      </section>
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
