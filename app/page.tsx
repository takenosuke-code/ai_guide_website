// ============================================================================
// FILE: app/page.tsx
// PURPOSE: Homepage for AI Tools Directory (SSG with ISR)
// MATCHES: Reference design with blue gradient hero and card layouts
// ============================================================================

import React from 'react';
import Link from "next/link";
import { Search, ChevronDown } from 'lucide-react';
import Image from 'next/image';

// 既存の import 群の下に追加
import { wpFetch } from "../lib/wpclient";
import FaqSection from "./faq_component/faqSection";
import { TAGS_QUERY, TOOLS_BY_TAG_QUERY, TOOLS_BY_MODIFIED_QUERY, LATEST_TOP_PICKS_QUERY, ALL_TAG_SLUGS } from "../lib/queries";
import { normalizeKeyFindings } from "../lib/normalizers";
import { HERO_BG_PATH } from "../lib/heroBg";
import AIToolCard from "../components/AIToolCard";
import TopPicksCarousel from "./components/TopPicksCarousel";
import FallbackImg from "./components/FallbackImg";
import Container from "./(components)/Container";
import HeroSearchBar from "@/components/HeroSearchBar";




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
  // === TOP PICKS (with fallback if WP is unavailable) ===
  let topPicks: any[] = [];
  try {
    const tpRes = await wpFetch<{ posts: { nodes: any[] } }>(
      LATEST_TOP_PICKS_QUERY,
      { first: 10 }
    );
    topPicks = tpRes?.posts?.nodes ?? [];
  } catch (e) {
    topPicks = [];
  }
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
  let tags: Array<{ id: string; name: string; slug: string; count: number }> = [];
  try {
    const tagData = await wpFetch<{ tags: { nodes: Array<{ id: string; name: string; slug: string; count: number }> } }>(
      TAGS_QUERY,
      { first: 6 }
    );
    tags = tagData?.tags?.nodes ?? [];
  } catch (e) {
    tags = [];
  }
  const current = active || (tags[0]?.slug as string | undefined);

  let allTags: { name: string; slug: string }[] = [];
  try {
    const allTagRes = await wpFetch<{ tags: { nodes: { name: string; slug: string }[] } }>(
      ALL_TAG_SLUGS,
      {},
      { revalidate: 3600 }
    );
    allTags = allTagRes?.tags?.nodes ?? [];
  } catch (e) {
    allTags = [];
  }

  let tools: any[] = [];
  if (current) {
    try {
      const toolsData = await wpFetch<{ posts: { nodes: any[] } }>(TOOLS_BY_TAG_QUERY, { tag: [current] });
      tools = toolsData?.posts?.nodes ?? [];
    } catch (e) {
      tools = [];
    }
  }

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
  const newCards = newPosts.map((n: any) => ({
    title: n.title,
    kf: normalizeKeyFindings(n)
  }));
  const reviewCards = tools.map((n: any) => ({
    title: n.title,
    kf: normalizeKeyFindings(n)
  }));
  console.log("CARDS (Trending):", trendingCards);
  console.log("CARDS (New):", newCards);
  console.log("CARDS (Reviews):", reviewCards);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-cyan-400 sticky top-0 z-50">
        <Container className="py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full max-w-xl">
              <HeroSearchBar tags={allTags} />
            </div>
            <nav className="flex items-center gap-8">
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
        </Container>
      </header>

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

      {/* Top 10 Picks Section */}
      {topPicks?.length ? (
        <TopPicksCarousel posts={topPicks.slice(0, 10)} />
      ) : (
        <section className="py-12">
          <Container>
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
              Explore Our Top 10 Picks
            </h2>
            <p className="text-gray-500 text-center">
              No blog posts available at this time.
            </p>
          </Container>
        </section>
      )}

      {/* Trending Section */}
      <section className="py-12">
        <Container>
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Trending</h2>
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
      {/* New AI Tools Section */}
      <section className="py-12 bg-white">
        <Container>
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
            New AI Tools with Reviews & Details
          </h2>
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {newPosts.map((p: any) => {
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
                  fallbackBadge={getFallbackBadge('new')}
                  ctaHref={`/tool/${p.slug}`}
                />
              );
            })}
          </div>
        </Container>
      </section>

      
      {/* All Reviews Section (WP連動版) */}
      <section id="reviews" className="py-12 scroll-mt-24">
        <Container>
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
            All AI Tool Reviews &amp; Guides
          </h2>

          {/* Compact Tag Pills */}
          <div className="mb-6">
            <div className="grid grid-cols-[repeat(2,max-content)] md:grid-cols-[repeat(3,max-content)] gap-x-2 gap-y-2 justify-center max-w-xl mx-auto">
              {tags.slice(0, 6).map((t) => {
                const isActive = current === t.slug;
                return (
                  <Link
                    key={t.id}
                    href={{ pathname: "/", query: { tag: t.slug }, hash: "reviews" }}
                    scroll={false}
                    className={[
                      // fixed-size rectangular pill
                      "inline-flex items-center justify-center flex-none",
                      "h-9 px-4 min-w-[6.5rem] rounded-lg",
                      "border text-sm font-medium transition",
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-700 hover:bg-blue-50 border-gray-200"
                    ].join(" ")}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {t.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 選択タグに紐づく投稿カード */}
          <div className="grid gap-5 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.length === 0 && (
              <p className="text-gray-500 text-sm col-span-full">
                該当するカードがありません。
              </p>
            )}

            {tools.map((p) => {
              const logoUrl =
                p?.aiToolMeta?.logo?.node?.sourceUrl ??
                p?.featuredImage?.node?.sourceUrl ??
                null;
              const contextTag = tags.find((t) => t.slug === current);
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
                  fallbackBadge={getFallbackBadge('reviews', contextTag)}
                  ctaHref={`/tool/${p.slug}`}
                />
              );
            })}
          </div>
        </Container>
      </section>
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