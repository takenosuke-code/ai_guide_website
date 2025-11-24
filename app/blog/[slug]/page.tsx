// ============================================================================
// FILE: app/blog/[slug]/page.tsx
// PURPOSE: Dynamic blog post detail page
// FEATURES: Full blog article with author info, content, tags, and navigation
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { ChevronDown, Clock, Calendar, Home } from 'lucide-react';
import { wpFetch } from '../../../lib/wpclient';
import { BLOG_POST_BY_SLUG_QUERY, RELATED_POSTS_QUERY, ALL_TAG_SLUGS, NAVIGATION_TAGS_QUERY } from '../../../lib/queries';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { SocialIcon } from '../_components/SocialIcon';
import { CopyLink } from '../_components/CopyLink';
import CardLinkOverlay from '../../../components/CardLinkOverlay';
import RelatedArticles from '@/components/RelatedArticles';
import TableOfContents from '@/components/TableOfContents';
import { addAnchorsAndExtractHeadings } from '@/lib/toc';
import HeroSearchBar from '@/components/HeroSearchBar';

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
      node?: {
        name?: string | null;
        avatar?: {
          url?: string | null;
        } | null;
        description?: string | null;
      } | null;
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
        node?: {
          sourceUrl?: string | null;
          altText?: string | null;
          mediaItemUrl?: string | null;
        } | null;
      };
      authorBio?: string | null;
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
  const category = post.categories?.nodes?.[0]?.name ?? post.categories?.nodes?.[0]?.slug ?? '';
  const featuredImageUrl = 
    post.blog?.topPickImage?.node?.sourceUrl ?? 
    post.blog?.topPickImage?.node?.mediaItemUrl ??
    post.featuredImage?.node?.sourceUrl;

  const authorIconUrl =
    post.blog?.authorIcon?.node?.sourceUrl ??
    post.blog?.authorIcon?.node?.mediaItemUrl ??
    post.author?.node?.avatar?.url ??
    null;
  const authorName = post.author?.node?.name ?? '';
  const authorInitials = authorName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const authorBioRaw =
    post.blog?.authorBio ??
    post.author?.node?.description ??
    null;
  const authorBio = authorBioRaw ? authorBioRaw.trim() : null;
  const rawHtml = post?.content ?? "";
  const { html: contentHtml, headings, tree } = addAnchorsAndExtractHeadings(rawHtml);
  
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

  let recommendedArticles = relatedPosts
    .map((relatedPost: any) => {
      const relatedTagSlugs =
        relatedPost?.tags?.nodes?.map((t: any) => t.slug) ?? [];
      const overlap = relatedTagSlugs.filter((slug: string) =>
        tagSlugs.includes(slug)
      );

      return {
        ...relatedPost,
        _similarity: overlap.length,
      };
    })
    .filter((post: any) => post._similarity > 0)
    .sort((a: any, b: any) => {
      if (b._similarity !== a._similarity) {
        return b._similarity - a._similarity;
      }
      return new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime();
    })
    .slice(0, 3);

  if (recommendedArticles.length === 0 && relatedPosts.length > 0) {
    recommendedArticles = relatedPosts.slice(0, 3);
  }

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

  const facebookGlyph = (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.407.593 24 1.325 24h11.497v-9.294H9.847v-3.622h2.975V8.413c0-2.95 1.8-4.557 4.43-4.557 1.26 0 2.342.093 2.657.135v3.08h-1.823c-1.428 0-1.705.68-1.705 1.674v2.194h3.41l-.444 3.622h-2.966V24h5.813C23.407 24 24 23.407 24 22.674V1.326C24 .593 23.407 0 22.675 0z" />
    </svg>
  );

  const linkedinGlyph = (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M20.452 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.135 1.445-2.135 2.939v5.667H9.351V9h3.414v1.561h.047c.476-.9 1.636-1.85 3.369-1.85 3.602 0 4.27 2.37 4.27 5.455v6.286zM5.337 7.433c-1.144 0-2.066-.926-2.066-2.065 0-1.138.922-2.063 2.066-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.924 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
    </svg>
  );

  const shareGlyph = (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7 0-.24-.04-.47-.09-.7l7.02-4.11a3.004 3.004 0 0 0 2.07.81c1.66 0 3-1.34 3-3S18.66 2 17 2s-3 1.34-3 3c0 .24.04.47.09.7l-7.02 4.11c-.54-.5-1.25-.81-2.05-.81-1.66 0-3 1.34-3 3s1.34 3 3 3c.8 0 1.51-.31 2.05-.81l7.11 4.16c-.05.21-.08.43-.08.66 0 1.62 1.31 2.94 2.94 2.94A2.96 2.96 0 0 0 21 18a2.96 2.96 0 0 0-3-2z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-cyan-400 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <HeroSearchBar
                tags={allTags}
                placeholder="What AI tool do you need? ( write about 5 words)"
              />
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-8 ml-12">
              <Link href="/" className="text-white font-medium hover:opacity-90 flex items-center gap-1">
                <span>←</span>
                <span>Back to Home</span>
              </Link>
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
      <section className="mx-auto max-w-[1120px] px-4 md:px-6 lg:px-8 py-10 md:py-14">
        <article className="max-w-[736px]">
          {post.categories?.nodes && post.categories.nodes.length > 0 && (
            <span className="inline-block text-blue-600 text-sm font-medium mb-4">
              {post.categories.nodes[0].name}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.15]">
            {post.title}
          </h1>

          <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
            {authorIconUrl && (
              <span className="relative h-9 w-9 overflow-hidden rounded-full ring-1 ring-black/10 bg-gray-100">
                <Image
                  src={authorIconUrl}
                  alt={authorName}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </span>
            )}
            <div className="flex flex-col">
              <span className="font-medium text-blue-600">{authorName}</span>
              <span className="text-black/60">{formatDate(post.date)}</span>
            </div>
          </div>
        </article>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 lg:gap-12 lg:justify-between">
          <aside className="order-last lg:order-first lg:sticky lg:top-24 self-start mx-auto lg:mx-0">
            <div>
              <div className="text-xs font-semibold tracking-wide text-black/60 uppercase">Share</div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#E9F2FF] px-4 py-3 shadow-[0_8px_24px_rgba(10,122,255,0.12)]">
                <SocialIcon
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.uri)}`}
                  label="Share on Facebook"
                  icon={facebookGlyph}
                />
                <SocialIcon
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(post.uri)}`}
                  label="Share on LinkedIn"
                  icon={linkedinGlyph}
                />
                <SocialIcon
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(post.uri)}`}
                  label="Share on X"
                  icon={shareGlyph}
                />
                <CopyLink url={post.uri} />
              </div>
            </div>

            <div className="mt-8">
              <TableOfContents headings={headings} tree={tree} />
            </div>
          </aside>

          <article className="lg:max-w-[736px] leading-7 text-[15.5px] mx-auto lg:mx-0">
            {featuredImageUrl && (
              <figure className="relative mt-2 overflow-hidden rounded-2xl ring-1 ring-black/10">
                <Image
                  src={featuredImageUrl}
                  alt={post.title}
                  width={1280}
                  height={720}
                  className="w-full h-auto object-cover"
                  priority
                />
              </figure>
            )}

            <div
              className="prose prose-slate max-w-none mt-8 prose-h2:scroll-mt-24 prose-h3:scroll-mt-24 prose-img:rounded-xl prose-img:ring-1 prose-img:ring-black/10"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />

            {(authorBio || authorIconUrl) && (
              <section className="not-prose border-t border-gray-200 mt-16 pt-12">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                  <div
                    className="author-avatar flex-none rounded-full overflow-hidden bg-rose-100 ring-4 ring-white shadow-md"
                    style={{ width: 80, height: 80, minWidth: 80, minHeight: 80 }}
                  >
                    {authorIconUrl ? (
                      <Image
                        src={authorIconUrl}
                        alt={authorName}
                        width={80}
                        height={80}
                        className="block w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-rose-500">
                        {authorInitials || 'A'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                      {authorName}
                    </h3>
                    {authorBio ? (
                      <p className="mt-3 text-sm leading-6 text-gray-600 max-w-[70ch]">
                        {authorBio}
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>
            )}

            <RelatedArticles
              currentId={post.id}
              tagSlugs={post.tags?.nodes?.map((t) => t.slug).filter(Boolean) ?? []}
            />

            {recommendedArticles.length > 0 && (
              <div className="mt-16 border-t border-slate-200 pt-12">
                <h2 className="text-xl font-semibold text-center text-gray-900">
                  Recommended Articles
                </h2>
                <div className="mt-10 grid gap-8 md:grid-cols-3">
                  {recommendedArticles.map((relatedPost: any) => {
                    const relatedFeaturedImage =
                      relatedPost.blog?.topPickImage?.node?.sourceUrl ??
                      relatedPost.featuredImage?.node?.sourceUrl ??
                      null;
                    const relatedCategory =
                      relatedPost.categories?.nodes?.[0]?.name ?? 'Featured';
                    const relatedExcerpt = relatedPost.excerpt
                      ? relatedPost.excerpt.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
                      : null;

                    return (
                      <article
                        key={relatedPost.id}
                        className="relative isolate flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                      >
                        <CardLinkOverlay
                          href={`/blog/${relatedPost.slug}`}
                          ariaLabel={relatedPost.title}
                          className="rounded-2xl"
                        />
                        {relatedFeaturedImage && (
                          <div className="relative aspect-[4/3] w-full">
                            <Image
                              src={relatedFeaturedImage}
                              alt={relatedPost.title}
                              fill
                              sizes="(min-width: 768px) 22vw, 90vw"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-6">
                          <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            {relatedCategory}
                          </span>
                          <h3 className="mt-2 text-lg font-semibold text-gray-900 line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          {relatedExcerpt && (
                            <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                              {relatedExcerpt}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </article>
        </div>
      </section>
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

