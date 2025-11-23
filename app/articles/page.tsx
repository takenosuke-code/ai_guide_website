// ============================================================================
// FILE: app/articles/page.tsx
// PURPOSE: Articles collection page matching Figma design
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { wpFetch } from '../../lib/wpclient';
import { ALL_BLOG_ARTICLES_QUERY, RANDOM_BLOG_POSTS_QUERY, LATEST_TOP_PICKS_QUERY } from '../../lib/queries';
import Container from '../(components)/Container';
import FallbackImg from '../components/FallbackImg';
import TopPicksCarousel from '../components/TopPicksCarousel';

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

  // Get categories from articles (for category sections)
  // Filter by WordPress categories - you can assign articles to categories in WordPress
  // Default category slugs - customize these to match your WordPress category slugs
  const category1Slug = 'how-to'; // Change this to your first category slug in WordPress
  const category2Slug = 'guides'; // Change this to your second category slug in WordPress

  const category1Articles = allArticles.filter((article) => {
    return article.categories?.nodes?.some((cat) => cat.slug === category1Slug) ?? false;
  }).slice(0, 6);

  const category2Articles = allArticles.filter((article) => {
    return article.categories?.nodes?.some((cat) => cat.slug === category2Slug) ?? false;
  }).slice(0, 6);

  // If no category-specific articles, use all articles as fallback
  const displayCategory1 = category1Articles.length > 0 ? category1Articles : allArticles.slice(0, 6);
  const displayCategory2 = category2Articles.length > 0 ? category2Articles : allArticles.slice(6, 12);

  // "All articles" section - show first 6, rest will be shown via "Read More"
  const showAll = searchParams?.showAll === 'true';
  const allArticlesDisplay = showAll ? allArticles : allArticles.slice(0, 6);
  const hasMoreArticles = !showAll && allArticles.length > 6;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-cyan-400 sticky top-0 z-50">
        <Container className="py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-white font-semibold text-lg hover:opacity-90">
              ← Back to Home
            </Link>
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
                  null;

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
          {displayCategory1.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
                Title goes here, like 'How To'
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayCategory1.map((article) => {
                  const heroImage =
                    article.blog?.topPickImage?.node?.sourceUrl ??
                    article.featuredImage?.node?.sourceUrl ??
                    null;

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
          {displayCategory2.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
                Title goes here, like 'How To'
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayCategory2.map((article) => {
                  const heroImage =
                    article.blog?.topPickImage?.node?.sourceUrl ??
                    article.featuredImage?.node?.sourceUrl ??
                    null;

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
              All articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allArticlesDisplay.map((article) => {
                const heroImage =
                  article.blog?.topPickImage?.node?.sourceUrl ??
                  article.featuredImage?.node?.sourceUrl ??
                  null;

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
