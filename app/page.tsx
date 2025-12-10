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
  ALL_TOOLS_QUERY,
} from "../lib/queries";
import { normalizeKeyFindings } from "../lib/normalizers";
import { HERO_BG_PATH } from "../lib/heroBg";
import AIToolCard from "../components/AIToolCard";
import TopPicksCarousel from "./components/TopPicksCarousel";
import BlogScrollSection from "./components/BlogScrollSection";
import Container from "./(components)/Container";
import HeroSearchBar from "@/components/HeroSearchBar";
import HeroSearchBarLarge from "@/components/HeroSearchBarLarge";
import ScrollableTagPills from "./components/ScrollableTagPills";
import PrimaryHeader from "@/components/site-header/PrimaryHeader";
import { buildNavGroups, NavMenuPostNode } from "@/lib/nav-groups";
import SiteTestimonialsSection from "@/components/SiteTestimonialsSection";
import AIToolCarousel from "./components/AIToolCarousel";
import AIToolScrollSection from "./components/AIToolScrollSection";
import ClientSideTagFilter from "./components/ClientSideTagFilter";
import SiteFooter from "@/components/SiteFooter";
import CategoryList from "@/components/CategoryList";
import { getSiteBranding, getMegaphoneIcon } from "@/lib/branding";




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

  // Fetch site branding
  const branding = await getSiteBranding();
  
  // Fetch megaphone icon for blue cards
  const megaphoneIcon = await getMegaphoneIcon();

  // Fetch ALL tools for client-side filtering (much faster tag switching)
  const allToolsData = await wpFetch<{ posts: { nodes: any[] } }>(
    ALL_TOOLS_QUERY, 
    { first: 200 },
    { revalidate: 3600 }
  );
  const allTools = allToolsData?.posts?.nodes ?? [];
  const searchTools =
    allTools?.map((t: any) => ({
      title: t.title as string,
      slug: t.slug as string,
    })) ?? [];

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
  console.log("POSTS (Reviews):", allTools.map((n: any) => ({
    title: n.title,
    kfRaw: n.aiToolMeta?.keyFindingsRaw?.slice(0, 80) ?? null
  })));

  // Temporary logging: CARDS data
  const trendingCards = trendingPosts.map((n: any) => ({
    title: n.title,
    kf: normalizeKeyFindings(n)
  }));
  
  const trendingCarouselCards = trendingPosts.map((p: any) => {
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
      fallbackBadge: getFallbackBadge('trending'),
      ctaHref: `/tool/${p.slug}`,
      sortDate: p?.aiToolMeta?.dateOfAiTool ?? p?.date ?? null,
      latestVersion: p?.aiToolMeta?.latestVersion,
      latestUpdate: p?.aiToolMeta?.latestUpdate,
      pricing: p?.aiToolMeta?.pricing,
      whoIsItFor: p?.aiToolMeta?.whoIsItFor,
    };
  });
  
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
      latestVersion: p?.aiToolMeta?.latestVersion,
      latestUpdate: p?.aiToolMeta?.latestUpdate,
      pricing: p?.aiToolMeta?.pricing,
      whoIsItFor: p?.aiToolMeta?.whoIsItFor,
    };
  });
  console.log("CARDS (Trending):", trendingCards);
  console.log("CARDS (New Tools):", newToolCarouselCards);
  console.log("CARDS (All Tools for filtering):", allTools.length);

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

  const blogTagLinks = allTags.slice(0, 8).map((tag) => ({
    label: tag.name,
    href: `/articles?tag=${tag.slug}`,
  }));

  const blogLinks = topPicks.slice(0, 13).map((post) => ({
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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PrimaryHeader 
        tags={allTags} 
        navGroups={navGroups}
        siteName={branding.siteName}
        siteLogo={branding.siteLogo}
        tools={searchTools}
      />

      {/* Hero Section */}
      <section className="py-10 bg-gray-50">
        <Container>
          <div className="w-full max-w-none space-y-6">
            {/* Hero Box */}
            <div className="relative rounded-3xl overflow-hidden shadow-lg h-[440px]">
              {/* Background: Image or gradient */}
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
                <div className="absolute inset-0 bg-gradient-to-r from-[#6EA6FF] via-[#7EC7FF] to-[#8CEBFF] z-0" />
              )}
              {/* Hero content */}
              <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 py-8">
                <h1 className="text-5xl font-bold text-white mb-3">
                  Cut Costs, Boost Efficiency By AI
                </h1>
                <p className="text-base text-white/95 max-w-[65ch] mx-auto">
                  Simplify daily operations and cut fixed expenses using AI-driven tools explained with insights, pricing, reviews, and clear guides.
                </p>
              </div>
            </div>
            
            {/* Search Bar - Outside and below hero box */}
            <div className="max-w-3xl mx-auto w-full">
              <HeroSearchBarLarge tags={allTags} tools={searchTools} showButton />
            </div>
          </div>
        </Container>
      </section>

      {/* Categories Section */}
      <section className="py-8">
        <Container>
          <div className="grid grid-cols-5 gap-y-4 justify-items-center">
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                href={`/collection/${category.id}`}
                className="bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md relative overflow-hidden"
                style={{ width: '175px', height: '115px' }}
              >
                {/* Icon in top-left */}
                <div className="absolute top-3 left-4">
                  {megaphoneIcon ? (
                    <Image
                      src={megaphoneIcon.sourceUrl}
                      alt={megaphoneIcon.altText || "Category icon"}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <svg 
                      className="w-10 h-10 text-blue-300/60" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4.5 10.5L18.5 5.5v13L4.5 13.5v-3z"
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M4.5 10.5c-1 0-1.5.5-1.5 1.5s.5 1.5 1.5 1.5"
                      />
                      <circle cx="2.5" cy="12" r="1.5" fill="currentColor" />
                    </svg>
                  )}
                </div>
                {/* Left-aligned text */}
                <div className="absolute left-4 top-14 right-3 flex flex-col">
                  <h3 className="text-white text-base font-bold mb-0.5 truncate" title={category.name}>{category.name}</h3>
                  <p className="text-gray-400 text-[10px] tracking-wide">{category.count} LISTING</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Trending Section */}
      <section className="py-6">
        <Container>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4 flex items-center justify-center gap-2">
            Trending
            <svg 
              className="w-5 h-5 text-red-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </h2>
          {trendingCarouselCards.length === 0 ? (
            <p className="text-center text-gray-500">No trending tools available right now.</p>
          ) : (
            <AIToolScrollSection cards={trendingCarouselCards} cardVariant="compact" />
          )}
        </Container>
      </section>

      {/* Top 10 Picks Section */}
      {topPicks?.length ? (
        <BlogScrollSection posts={topPicks.slice(0, 10)} />
      ) : (
        <section className="py-10">
          <Container>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
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

      <div className="space-y-10">
        {/* New AI Tools Section */}
        <section className="py-10 bg-white">
          <Container>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
              {newToolsTitle}
            </h2>
            {newToolCarouselCards.length === 0 ? (
              <p className="text-center text-gray-500">No AI tools available right now.</p>
            ) : (
              <>
                <AIToolScrollSection cards={newToolCarouselCards} cardVariant="compact" />
                <div className="flex justify-center mt-6">
                  <Link
                    href="/collection/new"
                    className="inline-flex items-center justify-center text-white rounded-lg transition-colors shadow-md hover:shadow-lg hover:opacity-90 w-full max-w-[183px] h-12 mx-auto"
                    style={{ 
                      backgroundColor: '#1466F6'
                    }}
                  >
                    <span className="text-base font-semibold text-center px-4">
                      All New AI
                    </span>
                  </Link>
                </div>
              </>
            )}
          </Container>
        </section>

        
        {/* All Reviews Section (WP連動版) */}
        <section id="reviews" className="py-10 scroll-mt-24">
          <Container>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
              {reviewsTitle}
            </h2>

            {/* Client-Side Tag Filter - No lag, instant switching! */}
            <ClientSideTagFilter 
              allTools={allTools} 
              tags={tags} 
              initialTag={current || ''}
            />
          </Container>
        </section>
      </div>
      <FaqSection />

      {/* Category List Section */}
      {navGroups.length > 0 && <CategoryList navGroups={navGroups} />}

      <SiteFooter sections={footerSections} />

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