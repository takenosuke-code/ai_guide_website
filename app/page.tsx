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
import { TAGS_QUERY, TOOLS_BY_TAG_QUERY } from "../lib/queries";
import { normalizeKeyFindings } from "../lib/normalizers";
import { HERO_BG_PATH } from "../lib/heroBg";
import AIToolCard from "../components/AIToolCard";




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
  // In production, fetch from your API/CMS
  // Example with ISR: fetch with { next: { revalidate: 3600 } }
  
  // Mock data for now
  return [
    { id: 'marketing', name: 'Marketing', count: 89 },
    { id: 'business', name: 'Business', count: 67 },
    { id: 'development', name: 'Development', count: 54 },
    { id: 'design', name: 'Design', count: 43 },
    { id: 'productivity', name: 'Productivity', count: 76 }
  ];
}

// Add a new query for posts by modified date desc (latest)
const TOOLS_BY_MODIFIED_QUERY = `
  query ToolsByModified {
    posts(first: 9, where: { orderby: { field: MODIFIED, order: DESC } }) {
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

async function getTopPicks(): Promise<TopPick> {
  return {
    id: 'top-10-ai-platforms',
    title: 'Top 10 AI Platforms Making Work Smarter in 2025',
    description: 'From ChatGPT to Runway, we\'ve analyzed this year\'s leading AI solutions. Get a quick overview of what each tool does best — features, pricing, and who it\'s for — all in one clear comparison.',
    author: 'Alex Mcdonald',
    location: 'Tokyo',
    image: '/images/top-picks.jpg'
  };
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
  const topPick = await getTopPicks();

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
  const tagData = await wpFetch<{ tags: { nodes: Array<{ id: string; name: string; slug: string; count: number }> } }>(
    TAGS_QUERY,
    { first: 6 }
  );
  const tags = tagData?.tags?.nodes ?? [];
  const current = active || (tags[0]?.slug as string | undefined);

  const toolsData = current
    ? await wpFetch<{ posts: { nodes: any[] } }>(TOOLS_BY_TAG_QUERY, { tag: [current] })
    : { posts: { nodes: [] } };
  const tools = toolsData?.posts?.nodes ?? [];

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

      {/* Hero Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="relative max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-lg h-[600px] md:h-[700px]">
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
            <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6 py-10 md:py-16">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                Every AI, Clearly Explained
              </h1>
              <p className="text-xl text-white mb-2 font-medium">No more guessing.</p>
              <p className="text-lg text-white/90 mb-12">
                Every AI tool explained with insights, pricing, reviews, and clear guides.
              </p>
              {/* Main Search */}
              <div className="max-w-3xl mx-auto w-full">
                <div className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-lg">
                  <input
                    type="text"
                    placeholder="What AI tool do you need? ( write about 5 words)"
                    className="flex-1 px-4 py-3 border-none outline-none text-gray-700"
                  />
                  <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition-colors">
                    <Search className="w-5 h-5" />
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/category/${category.id}`}
                className="bg-blue-600 hover:bg-blue-700 rounded-2xl p-8 text-center transition-colors shadow-md"
              >
                <h3 className="text-white text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-blue-100 text-sm">{category.count} LISTING</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Top 10 Picks Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Explore Our Top 10 Picks
          </h2>

          <div className="flex gap-8 items-center bg-gray-50 rounded-3xl p-8">
            {/* Image */}
            <div className="flex-1 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl h-64"></div>

            {/* Content */}
            <div className="flex-1">
              <p className="text-blue-600 font-semibold text-sm mb-2">Explore Our Top 10 Picks</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{topPick.title}</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{topPick.description}</p>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-pink-200"></div>
                <div>
                  <p className="font-semibold text-gray-900">{topPick.author}</p>
                  <p className="text-sm text-gray-500">{topPick.location}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors">
              All best 10 articles
            </button>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Trending</h2>
          <div className="grid md:grid-cols-3 gap-6">
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
        </div>
      </section>
      {/* New AI Tools Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            New AI Tools with Reviews & Details
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
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
        </div>
      </section>

      
      {/* All Reviews Section (WP連動版) */}
      <section id="reviews" className="py-16 px-6 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">
            All AI Tool Reviews &amp; Guides
          </h2>

          {/* Compact Tag Pills */}
          <div className="mb-8 -mx-6">
            <div className="flex gap-2 overflow-x-auto px-6 py-1 no-scrollbar md:flex-wrap md:justify-center">
              {tags.slice(0, 12).map((t) => {
                const isActive = current === t.slug;
                return (
                  <Link
                    key={t.id}
                    href={{ pathname: "/", query: { tag: t.slug }, hash: "reviews" }}
                    scroll={false}
                    className={[
                      // fixed-size rectangular pill
                      "inline-flex items-center justify-center flex-none",
                      "h-9 w-28 sm:w-32 rounded-lg",            // ← fixed height/width + light corner
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
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