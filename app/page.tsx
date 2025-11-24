// ============================================================================
// FILE: app/page.tsx
// PURPOSE: Homepage for AI Tools Directory (SSG with ISR)
// MATCHES: Reference design with blue gradient hero and card layouts
// ============================================================================

import React from "react";
import Link from "next/link";
import Image from "next/image";

// 既存の import 群の下に追加
import { wpFetch } from "../lib/wpclient";
import FaqSection from "./faq_component/faqSection";
import {
  TAGS_QUERY,
  TOOLS_BY_TAG_QUERY,
  TOOLS_BY_MODIFIED_QUERY,
  LATEST_TOP_PICKS_QUERY,
  ALL_TAG_SLUGS,
  NAV_MENU_POSTS_QUERY,
  CATEGORIES_QUERY,
} from "../lib/queries";
import { normalizeKeyFindings } from "../lib/normalizers";
import { HERO_BG_PATH } from "../lib/heroBg";
import AIToolCard from "../components/AIToolCard";
import TopPicksCarousel from "./components/TopPicksCarousel";
import Container from "./(components)/Container";
import HeroSearchBar from "@/components/HeroSearchBar";
import ScrollableTagPills from "./components/ScrollableTagPills";
import PrimaryHeader from "@/components/site-header/PrimaryHeader";
import { buildNavGroups, NavMenuPostNode } from "@/lib/nav-groups";
import SiteTestimonialsSection from "@/components/SiteTestimonialsSection";
import AIToolCarousel from "./components/AIToolCarousel";




// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Category {
  id: string;
  name: string;
  count: number;
}

interface ToolCard {
  id: string;
  name: string;
  category: string;
  description: string;
  version: string;
  releaseTime: string;
  keyFindings: string[];
  whoIsItFor: string[];
  pricing: string;
  logo: string;
  screenshot: string;
}

interface TopPick {
  id: string;
  title: string;
  description: string;
  author: string;
  location: string;
  image: string;
}

// ============================================================================
// DATA FETCHING - This runs at build time and revalidates based on ISR settings
// ============================================================================

async function getCategories(): Promise<Category[]> {
  // Fetch real tags from WordPress
  try {
    const tagData = await wpFetch<{ tags: { nodes: Array<{ id: string; name: string; slug: string; count: number }> } }>(
      TAGS_QUERY,
      { first: 10 },
      { revalidate: 3600 }
    );
    // Map WordPress tags to category format, using slug as id
    return tagData?.tags?.nodes.map(tag => ({
      id: tag.slug,  // Use slug as id for URL
      name: tag.name,
      count: tag.count || 0
    })) ?? [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback to mock data if WordPress fails
    return [
      { id: 'marketing', name: 'Marketing', count: 0 },
      { id: 'business', name: 'Business', count: 0 },
      { id: 'productivity', name: 'Productivity', count: 0 }
    ];
  }
}

async function getTrendingTools(): Promise<any[]> {
  // Trending = posts that have the WP tag 'trending'
  try {
    const data = await wpFetch<{ posts: { nodes: any[] } }>(
      TOOLS_BY_TAG_QUERY,
      { tag: ["trending"] },
      { revalidate: 3600 }
    );
    return data?.posts?.nodes ?? [];
  } catch (error) {
    return [];
  }
}

async function getNewTools(): Promise<any[]> {
  // New = latest modified
  try {
    const data = await wpFetch<{ posts: { nodes: any[] } }>(
      TOOLS_BY_MODIFIED_QUERY,
      {},
      { revalidate: 3600 }
    );
    return data?.posts?.nodes ?? [];
  } catch (error) {
    return [];
  }
}


// Get fallback badge helper
function getFallbackBadge(section: 'reviews'|'trending'|'new', contextTag?: {slug: string, name: string}): {slug: string, name: string} {
  if (section === 'reviews') {
    if (contextTag) return {slug: contextTag.slug, name: contextTag.name};
    return {slug: 'tag', name: 'Tag'};
  }
  if (section === 'trending') return {slug: 'trending', name: 'Trending'};
  return {slug: 'updated', name: 'Updated'};
}

// ============================================================================
// MAIN PAGE COMPONENT - This is a Server Component (SSG by default in Next.js)
// ============================================================================

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { tag?: string };
}) {

  
  // These all run at build time and cache the results
  const categories = await getCategories();
  const trendingPosts = await getTrendingTools();
  const newPosts = await getNewTools();
  // === TOP PICKS (straight fetch; no fallbacks) ===
  const tpRes = await wpFetch<{ posts: { nodes: any[] } }>(
    LATEST_TOP_PICKS_QUERY,
    { first: 10 }
  );
  const topPicks = tpRes?.posts?.nodes ?? [];
  console.warn("[TopPicks] final length:", topPicks?.length, topPicks?.[0]?.title);

  // Temporary logging: POSTS data
  console.log("POSTS (Trending):", trendingPosts.map((n: any) => ({
    title: n.title,
    kfRaw: n.aiToolMeta?.keyFindingsRaw?.slice(0, 80) ?? null
  })));
  console.log("POSTS (New):", newPosts.map((n: any) => ({
    title: n.title,
    kfRaw: n.aiToolMeta?.keyFindingsRaw?.slice(0, 80) ?? null
  })));

  const active = searchParams?.tag; // /?tag=marketing など
  // Fetch all tags for the scrollable pills (get more tags for horizontal scrolling)
  const tagData = await wpFetch<{ tags: { nodes: Array<{ id: string; name: string; slug: string; count: number }> } }>(
    TAGS_QUERY,
    { first: 50 }
  );
  const tags = tagData?.tags?.nodes ?? [];
  const current = active || (tags[0]?.slug as string | undefined);

  const allTagRes = await wpFetch<{ tags: { nodes: { name: string; slug: string }[] } }>(
    ALL_TAG_SLUGS,
    {},
    { revalidate: 3600 }
  );
  const allTags = allTagRes?.tags?.nodes ?? [];

  // Fetch top tags for navigation (most used tags)
  const navMenuRes = await wpFetch<{ posts: { nodes: NavMenuPostNode[] } }>(
    NAV_MENU_POSTS_QUERY,
    { first: 200 },
    { revalidate: 3600 }
  );
  const navGroups = buildNavGroups(navMenuRes?.posts?.nodes ?? []);

  const toolsData = current
    ? await wpFetch<{ posts: { nodes: any[] } }>(TOOLS_BY_TAG_QUERY, { tag: [current] })
    : { posts: { nodes: [] } };
  const tools = toolsData?.posts?.nodes ?? [];

  // Fetch tag names for section titles
  const trendingTagRes = await wpFetch<{ tags: { nodes: Array<{ name: string; slug: string }> } }>(
    TAGS_QUERY,
    { first: 50 },
    { revalidate: 3600 }
  );
  const allTagsForTitles = trendingTagRes?.tags?.nodes ?? [];
  const trendingTag = allTagsForTitles.find(t => t.slug === 'trending');
  const trendingTitle = trendingTag?.name || 'Trending';

  // Fetch categories for section titles
  const categoriesRes = await wpFetch<{ categories: { nodes: Array<{ name: string; slug: string }> } }>(
    CATEGORIES_QUERY,
    { first: 50 },
    { revalidate: 3600 }
  );
  const allCategories = categoriesRes?.categories?.nodes ?? [];
  const aiReviewCategory = allCategories.find(c => c.slug === 'ai-review');
  const blogCategory = allCategories.find(c => c.slug === 'blog');
  const newToolsTitle = "New AI Tools with Reviews & Details";
  const reviewsTitle = "All AI Tools & Reviews";
  const topPicksTitle = blogCategory?.name ? `Explore Our Top ${blogCategory.name}` : 'Explore Our Top 10 Picks';

  // Temporary logging: POSTS data (Reviews)
  console.log("POSTS (Reviews):", tools.map((n: any) => ({
    title: n.title,
    kfRaw: n.aiToolMeta?.keyFindingsRaw?.slice(0, 80) ?? null
  })));

  // Temporary logging: CARDS data
  const trendingCards = trendingPosts.map((n: any) => ({
    title: n.title,
    kf: normalizeKeyFindings(n)
  }));
  const newToolCarouselCards = newPosts.map((p: any) => {
    const logoUrl =
      p?.aiToolMeta?.logo?.node?.sourceUrl ??
      p?.featuredImage?.node?.sourceUrl ??
      null;
    return {
      id: p.id,
      name: p.title,
      slug: p.slug,
      logoUrl,
      featuredImageUrl: p.featuredImage?.node?.sourceUrl || null,
      excerpt: p.excerpt,
      tags: p.tags?.nodes,
      keyFindings: normalizeKeyFindings(p),
      fallbackBadge: getFallbackBadge("new"),
      ctaHref: `/tool/${p.slug}`,
      sortDate: p?.aiToolMeta?.dateOfAiTool ?? p?.date ?? null,
    };
  });
  const reviewCarouselCards = tools.map((p: any) => {
    const logoUrl =
      p?.aiToolMeta?.logo?.node?.sourceUrl ??
      p?.featuredImage?.node?.sourceUrl ??
      null;
    const contextTag = tags.find((t) => t.slug === current);
    return {
      id: p.id,
      name: p.title,
      slug: p.slug,
      logoUrl,
      featuredImageUrl: p.featuredImage?.node?.sourceUrl || null,
      excerpt: p.excerpt,
      tags: p.tags?.nodes,
      keyFindings: normalizeKeyFindings(p),
      fallbackBadge: getFallbackBadge("reviews", contextTag),
      ctaHref: `/tool/${p.slug}`,
      sortDate: p?.aiToolMeta?.dateOfAiTool ?? p?.date ?? null,
    };
  });
  console.log("CARDS (Trending):", trendingCards);
  console.log("CARDS (New Tools):", newToolCarouselCards);
  console.log("CARDS (Reviews):", reviewCarouselCards);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PrimaryHeader tags={allTags} navGroups={navGroups} />

      {/* Hero Section */}
      <section className="py-12 bg-gray-50">
        <Container>
          <div className="w-full max-w-none">
            <div className="relative rounded-3xl overflow-hidden shadow-lg h-[520px] md:h-[620px]">
              {/* Background: Image or default gradient */}
              {HERO_BG_PATH ? (
                <Image
                  src={HERO_BG_PATH}
                  alt=""
                  fill
                  priority
                  className="object-cover object-center z-0"
                  sizes="100vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 z-0" />
              )}
              {/* Semi-transparent blue gradient overlay for readability */}
              <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-600/60 via-blue-500/50 to-cyan-400/40" />
              {/* Hero content */}
              <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6 py-8 md:py-12">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                  Every AI, Clearly Explained
                </h1>
                <p className="text-xl text-white mb-2 font-medium max-w-[60ch] mx-auto">
                  No more guessing.
                </p>
                <p className="text-lg text-white/90 mb-8 max-w-[70ch] mx-auto">
                  Every AI tool explained with insights, pricing, reviews, and clear guides.
                </p>
                {/* Main Search */}
                <div className="max-w-3xl mx-auto w-full">
                  <HeroSearchBar tags={allTags} showButton />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-10">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/collection/${category.id}`}
                className="bg-blue-600 hover:bg-blue-700 rounded-2xl p-6 text-center transition-colors shadow-md"
              >
                <h3 className="text-white text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-blue-100 text-sm">{category.count} LISTING</p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Trending Section */}
      <section className="py-12">
        <Container>
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">{trendingTitle}</h2>
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {trendingPosts.map((p: any) => {
              const logoUrl =
                p?.aiToolMeta?.logo?.node?.sourceUrl ??
                p?.featuredImage?.node?.sourceUrl ??
                null;
              return (
                <AIToolCard
                  key={p.id}
                  id={p.id}
                  name={p.title}
                  slug={p.slug}
                  logoUrl={logoUrl}
                  featuredImageUrl={p.featuredImage?.node?.sourceUrl || null}
                  excerpt={p.excerpt}
                  tags={p.tags?.nodes}
                  keyFindings={normalizeKeyFindings(p)}
                  fallbackBadge={getFallbackBadge('trending')}
                  ctaHref={`/tool/${p.slug}`}
                />
              );
            })}
          </div>
        </Container>
      </section>

      {/* Top 10 Picks Section */}
      {topPicks?.length ? (
        <TopPicksCarousel posts={topPicks.slice(0, 10)} />
      ) : (
        <section className="py-12">
          <Container>
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
              {topPicksTitle}
            </h2>
            <p className="text-gray-500 text-center">
              No blog posts available at this time.
            </p>
          </Container>
        </section>
      )}

      {/* Site Testimonials Section */}
      <SiteTestimonialsSection 
        maxTestimonials={10}
        title=""
        autoRotate={false}
        intervalMs={6000}
      />

      <div className="space-y-12">
        {/* New AI Tools Section */}
        <section className="py-12 bg-white">
          <Container>
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
              {newToolsTitle}
            </h2>
            {newToolCarouselCards.length === 0 ? (
              <p className="text-center text-gray-500">No AI tools available right now.</p>
            ) : (
              <AIToolCarousel cards={newToolCarouselCards} cardVariant="compact" />
            )}
          </Container>
        </section>

        
        {/* All Reviews Section (WP連動版) */}
        <section id="reviews" className="py-12 scroll-mt-24">
          <Container>
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
              {reviewsTitle}
            </h2>

            {/* Horizontal Scrollable Tag Pills */}
            <ScrollableTagPills tags={tags} currentTag={current || ''} />

            {/* 選択タグに紐づく投稿カード - Carousel */}
            {tools.length === 0 ? (
              <p className="text-gray-500 text-sm">
                該当するカードがありません。
              </p>
            ) : (
              <AIToolCarousel cards={reviewCarouselCards} cardVariant="compact" />
            )}

            {/* Show More Button - Redirects to collection page for selected tag */}
            {tools.length > 0 && current && (
              <div className="mt-8 text-center">
                <Link
                  href={`/collection/${current}`}
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
                >
                  All {tags.find((t) => t.slug === current)?.name || 'AI Tools'} AI
                </Link>
              </div>
            )}
          </Container>
        </section>
      </div>
      <FaqSection />

    </div>
  );
}

// ============================================================================
// ISR CONFIGURATION
// Export revalidate to enable Incremental Static Regeneration
// ============================================================================

// Revalidate this page every hour (3600 seconds)
export const revalidate = 3600;

// ============================================================================
// METADATA FOR SEO
// ============================================================================

export const metadata = {
  title: 'AI Tools Directory - Every AI, Clearly Explained',
  description: 'Discover and compare the best AI tools. Every AI tool explained with insights, pricing, reviews, and clear guides.',
  keywords: 'AI tools, artificial intelligence, ChatGPT, Claude, Gemini, AI directory, AI comparison',
};
// deploy trigger 10/22/2025 07:20:10
// deploy trigger 10/22/2025 07:45:37