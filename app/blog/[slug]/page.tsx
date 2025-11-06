// ============================================================================
// FILE: app/blog/[slug]/page.tsx
// PURPOSE: Dynamic blog post detail page
// FEATURES: Full blog article with author info, content, tags, and navigation
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { ChevronDown, Search, Clock, Calendar, User, Home } from 'lucide-react';
import { wpFetch } from '../../../lib/wpclient';
import { BLOG_POST_BY_SLUG_QUERY, RELATED_POSTS_QUERY } from '../../../lib/queries';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ShareButtons from './ShareButtons';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface BlogPageProps {
  params: {
    slug: string;
  };
}

interface BlogData {
  post: {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    date: string;
    modified: string;
    featuredImage?: {
      node: {
        sourceUrl: string;
        altText?: string;
      };
    };
    uri: string;
    tags?: {
      nodes: Array<{
        name: string;
        slug: string;
      }>;
    };
    categories?: {
      nodes: Array<{
        name: string;
        slug: string;
      }>;
    };
    author?: {
      node: {
        name: string;
        description?: string;
        avatar?: {
          url: string;
        };
      };
    };
    blog?: {
      topPickImage?: {
        node: {
          sourceUrl: string;
          altText?: string;
          mediaItemUrl?: string;
        };
      };
      authorIcon?: {
        node: {
          sourceUrl: string;
          altText?: string;
          mediaItemUrl?: string;
        };
      };
    };
  };
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = params;

  // Fetch blog post data from WordPress
  let data: BlogData;
  try {
    console.log('🔎 Fetching blog post with slug:', slug);
    data = await wpFetch<BlogData>(BLOG_POST_BY_SLUG_QUERY, { slug }, { revalidate: 3600 });
    console.log('📦 Data received:', data);
    if (!data?.post) {
      console.log('❌ No post found in data');
      notFound();
    }
    console.log('✅ Post found:', data.post.title);
  } catch (error) {
    console.error('❌ Error fetching post:', error);
    notFound();
  }

  const { post } = data;
  const category = post.categories?.nodes?.[0]?.name ?? 'Blog';
  const featuredImageUrl = 
    post.blog?.topPickImage?.node?.sourceUrl ?? 
    post.blog?.topPickImage?.node?.mediaItemUrl ??
    post.featuredImage?.node?.sourceUrl;
  
  const authorIconUrl = 
    post.blog?.authorIcon?.node?.sourceUrl ?? 
    post.blog?.authorIcon?.node?.mediaItemUrl ??
    post.author?.node?.avatar?.url;

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Fetch related articles from same category
  const tagSlugs = post.tags?.nodes?.map(t => t.slug) ?? [];
  let relatedPosts: any[] = [];
  try {
    if (tagSlugs.length > 0) {
      const relatedData = await wpFetch<{ posts: { nodes: any[] } }>(
        RELATED_POSTS_QUERY,
        { tags: tagSlugs, excludeId: post.id, first: 3 },
        { revalidate: 3600 }
      );
      relatedPosts = relatedData?.posts?.nodes ?? [];
    }
  } catch (error) {
    console.error('Error fetching related posts:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-cyan-400 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="What AI tool do you need? ( write about 5 words)"
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-white border-none outline-none text-sm"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-8 ml-12">
              <Link href="/" className="text-white font-medium hover:opacity-90">
                Home
              </Link>
              <button className="flex items-center gap-1 text-white font-medium hover:opacity-90">
                Marketing <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 text-white font-medium hover:opacity-90">
                Business <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 text-white font-medium hover:opacity-90">
                Learner / Student <ChevronDown className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
              <Home className="w-4 h-4" />
            </Link>
            <span>/</span>
            <Link href="/" className="hover:text-blue-600 text-blue-600">
              all best 10 articles
            </Link>
            <span>/</span>
            <span className="text-gray-600">{category}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Table of Contents & Share */}
          <aside className="lg:col-span-2">
            <div className="sticky top-24 space-y-8">
              {/* Share Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">SHARE</h3>
                <div className="flex gap-2">
                  <ShareButtons url={post.uri} title={post.title} />
                </div>
              </div>

              {/* Table of Contents */}
              <nav>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Table of Contents</h3>
                <ul className="space-y-2">
                  <li>
                    <a href="#what-is-chatgpt" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                      What is ChatGPT
                    </a>
                  </li>
                  <li>
                    <a href="#key-findings" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                      Key Findings
                    </a>
                  </li>
                  <li>
                    <a href="#who-is-it-for" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                      Who is it for
                    </a>
                  </li>
                  <li>
                    <a href="#prompts" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                      Prompts
                    </a>
                  </li>
                  <li>
                    <a href="#tutorials" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                      Tutorials
                    </a>
                  </li>
                  <li>
                    <a href="#pricing" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#review" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                      Review
                    </a>
                  </li>
                  <li>
                    <a href="#related-posts" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                      Related Posts
                    </a>
                  </li>
                  <li>
                    <a href="#alternatives" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                      Alternatives
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <article className="lg:col-span-10">
            {/* Article Header */}
            <header className="mb-8">
              {/* Category Badge */}
              {post.categories?.nodes && post.categories.nodes.length > 0 && (
                <div className="mb-4">
                  <span className="inline-block text-blue-600 text-sm font-medium">
                    {post.categories.nodes[0].name}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Author & Date */}
              <div className="flex items-center gap-4 mb-6">
                {authorIconUrl && (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={authorIconUrl}
                      alt={post.author?.node?.name ?? 'Author'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-900">
                    by <span className="text-blue-600 font-medium">{post.author?.node?.name ?? 'Author'}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(post.date)}
                  </p>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {featuredImageUrl && (
              <div className="mb-12 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={featuredImageUrl}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Main Content */}
            <div 
              className="prose prose-lg max-w-none mb-12
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg
                prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
                prose-pre:bg-gray-900 prose-pre:text-gray-100
                prose-ul:list-disc prose-ul:pl-6
                prose-ol:list-decimal prose-ol:pl-6
                prose-li:text-gray-700 prose-li:mb-2
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:bg-blue-50 prose-blockquote:py-4"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
        </div>
      </div>

      {/* Recommended Articles */}
      {relatedPosts.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Recommended Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost: any) => {
                const relatedFeaturedImage = 
                  relatedPost.blog?.topPickImage?.node?.sourceUrl ??
                  relatedPost.featuredImage?.node?.sourceUrl;
                const relatedAuthorIcon = 
                  relatedPost.blog?.authorIcon?.node?.sourceUrl ??
                  relatedPost.author?.node?.avatar?.url;
                const relatedCategory = relatedPost.categories?.nodes?.[0]?.name ?? 'Blog';

                return (
                  <Link 
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.slug}`}
                    className="group"
                  >
                    <article className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                      {/* Featured Image */}
                      {relatedFeaturedImage && (
                        <div className="relative h-48 bg-gray-200 overflow-hidden">
                          <img
                            src={relatedFeaturedImage}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="p-6">
                        {/* Category */}
                        <span className="inline-block text-blue-600 text-sm font-medium mb-3">
                          {relatedCategory}
                        </span>
                        
                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {relatedPost.title}
                        </h3>
                        
                        {/* Excerpt */}
                        {relatedPost.excerpt && (
                          <div 
                            className="text-gray-600 text-sm mb-4 line-clamp-3"
                            dangerouslySetInnerHTML={{ __html: relatedPost.excerpt }}
                          />
                        )}
                        
                        {/* Author */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                          {relatedAuthorIcon && (
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              <img
                                src={relatedAuthorIcon}
                                alt={relatedPost.author?.node?.name ?? 'Author'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-900">
                              by <span className="text-blue-600 font-medium">
                                {relatedPost.author?.node?.name ?? 'Author'}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ============================================================================
// ISR CONFIGURATION
// ============================================================================

export const revalidate = 3600;

// ============================================================================
// GENERATE STATIC PARAMS (Optional - for static generation of known blogs)
// ============================================================================

export async function generateStaticParams() {
  // You can optionally pre-generate paths for known blog posts
  // This will be called at build time
  return [];
}

