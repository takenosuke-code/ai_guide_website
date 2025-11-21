// ============================================================================
// FILE: app/articles/page.tsx
// PURPOSE: Articles collection page showing all blog posts from WordPress
// ============================================================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { wpFetch } from '../../lib/wpclient';
import { ALL_BLOG_ARTICLES_QUERY } from '../../lib/queries';
import Container from '../(components)/Container';
import FallbackImg from '../components/FallbackImg';

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
// MAIN PAGE COMPONENT
// ============================================================================

export default async function ArticlesPage() {
  // Fetch all blog articles
  const data = await wpFetch<ArticlesData>(
    ALL_BLOG_ARTICLES_QUERY,
    { first: 100 },
    { revalidate: 3600 }
  );

  const articles = data?.posts?.nodes ?? [];

  // Helper function to strip HTML from excerpt
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12">
            Explore Our Blogs
          </h1>

          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No articles available at this time.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:gap-10">
              {articles.map((article) => {
                const heroImage =
                  article.blog?.topPickImage?.node?.sourceUrl ??
                  article.featuredImage?.node?.sourceUrl ??
                  null;

                const authorIcon =
                  article.blog?.authorIcon?.node?.sourceUrl ??
                  article.author?.node?.avatar?.url ??
                  null;

                const authorName = article.author?.node?.name ?? 'Author';
                const authorBio = article.blog?.authorBio ?? null;
                const authorInitials = authorName
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join('');

                const plainExcerpt = article.excerpt
                  ? stripHtml(article.excerpt)
                  : '';

                return (
                  <article
                    key={article.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                  >
                    <Link href={`/blog/${article.slug}`}>
                      <div className="flex flex-col md:flex-row">
                        {/* Image Section */}
                        <div className="relative w-full md:w-[40%] h-64 md:h-auto min-h-[300px]">
                          <FallbackImg
                            src={heroImage}
                            fallback="https://via.placeholder.com/800x450?text=No+Image"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col">
                          <div className="text-sm text-blue-600 mb-2 font-medium">
                            Explore Our Top 10 Picks
                          </div>
                          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                            {article.title}
                          </h2>
                          {plainExcerpt && (
                            <p className="text-gray-600 text-base leading-relaxed mb-6 flex-1 line-clamp-3">
                              {plainExcerpt}
                            </p>
                          )}

                          {/* Author Section */}
                          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-rose-100 bg-rose-50 flex items-center justify-center text-sm font-semibold text-rose-500 flex-shrink-0">
                                {authorIcon ? (
                                  <Image
                                    src={authorIcon}
                                    alt={authorName}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <span>{authorInitials || '?'}</span>
                                )}
                              </div>
                              <div className="flex flex-col leading-tight min-w-0">
                                <span className="text-sm font-semibold text-gray-900 truncate">
                                  {authorName}
                                </span>
                                {authorBio ? (
                                  <span className="text-xs text-gray-500 truncate">
                                    {authorBio}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-500">
                                    {formatDate(article.date)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors flex-shrink-0">
                              Read Article
                              <span aria-hidden="true">→</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
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

