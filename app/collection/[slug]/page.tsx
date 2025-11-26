// ============================================================================
// FILE: app/collection/[slug]/page.tsx
// PURPOSE: Collection page showing all tools with a specific tag
// ============================================================================

import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import {
  ALL_TAG_SLUGS,
  TAGS_QUERY,
  TAG_BY_SLUG_QUERY,
  TOOLS_BY_TAG_QUERY,
  NAV_MENU_POSTS_QUERY,
  REVIEWS_BY_POST_ID_QUERY,
} from "../../../lib/queries";
import { wpFetch } from "../../../lib/wpclient";
import Container from "../../(components)/Container";
import CollectionPageContentWithSearch from "./CollectionPageContentWithSearch";
import CollectionSearchBarWrapper from "./CollectionSearchBarWrapper";
import { FilteredToolsProvider } from "./FilteredToolsContext";
import { notFound } from "next/navigation";
import PrimaryHeader from "@/components/site-header/PrimaryHeader";
import { buildNavGroups, NavMenuPostNode } from "@/lib/nav-groups";
import { getSiteBranding } from "@/lib/branding";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CollectionPageProps {
  params: {
    slug: string;
  };
}

interface TagData {
  tag: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    count: number;
  };
}

interface ToolsData {
  posts: {
    nodes: Array<{
      id: string;
      databaseId: number;
      title: string;
      slug: string;
      excerpt: string;
      featuredImage?: {
        node: {
          sourceUrl: string;
        };
      };
      aiToolMeta?: {
        logo?: {
          node: {
            sourceUrl: string;
            altText?: string;
          };
        };
        keyFindingsRaw?: string;
      };
      tags?: {
        nodes: Array<{
          name: string;
          slug: string;
        }>;
      };
    }>;
  };
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = params;

  // Fetch current tag data
  let tagData: TagData;
  try {
    console.log('🔎 Fetching tag with slug:', slug);
    tagData = await wpFetch<TagData>(
      TAG_BY_SLUG_QUERY,
      { slug },
      { revalidate: 3600 }
    );
    console.log('📦 Tag data received:', tagData);
    if (!tagData?.tag) {
      console.log('❌ No tag found');
      notFound();
    }
    console.log('✅ Tag found:', tagData.tag.name);
  } catch (error) {
    console.error('❌ Error fetching tag:', error);
    notFound();
  }

  const { tag } = tagData;

  // Fetch all data in parallel for faster loading
  const [toolsData, allTagRes, navMenuRes, branding, tagsWithCountRes, allReviewsData] = await Promise.all([
    wpFetch<ToolsData>(
      TOOLS_BY_TAG_QUERY,
      { tag: [slug] },
      { revalidate: 3600 }
    ).catch(() => ({ posts: { nodes: [] } })),
    wpFetch<{ tags: { nodes: { name: string; slug: string }[] } }>(
      ALL_TAG_SLUGS,
      {},
      { revalidate: 3600 }
    ),
    wpFetch<{ posts: { nodes: NavMenuPostNode[] } }>(
      NAV_MENU_POSTS_QUERY,
      { first: 200 },
      { revalidate: 3600 }
    ),
    getSiteBranding(),
    wpFetch<{ tags: { nodes: { id: string; name: string; slug: string; count: number }[] } }>(
      TAGS_QUERY,
      { first: 50 },
      { revalidate: 3600 }
    ),
    wpFetch<{ reviews: { nodes: Array<{
      reviewerMeta: {
        starRating: number;
        relatedTool?: {
          nodes: Array<{ databaseId: number }>;
        };
      };
    }> } }>(
      REVIEWS_BY_POST_ID_QUERY,
      {},
      { revalidate: 3600 }
    ).catch(() => ({ reviews: { nodes: [] } }))
  ]);

  const tools = toolsData?.posts?.nodes ?? [];
  const allTags = allTagRes?.tags?.nodes ?? [];
  const navGroups = buildNavGroups(navMenuRes?.posts?.nodes ?? []);
  const tagsWithCount = tagsWithCountRes?.tags?.nodes ?? [];
  const allReviews = allReviewsData?.reviews?.nodes ?? [];

  // Calculate average rating for each tool
  const toolRatings: Record<number, number> = {};
  tools.forEach((tool: any) => {
    const toolReviews = allReviews.filter(review => {
      const relatedToolId = review.reviewerMeta?.relatedTool?.nodes?.[0]?.databaseId;
      return relatedToolId === tool.databaseId;
    });
    
    if (toolReviews.length > 0) {
      const avgRating = toolReviews.reduce((sum, r) => sum + r.reviewerMeta.starRating, 0) / toolReviews.length;
      toolRatings[tool.databaseId] = avgRating;
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <PrimaryHeader 
        tags={allTags} 
        navGroups={navGroups}
        siteName={branding.siteName}
        siteLogo={branding.siteLogo}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <Container>
          <div className="flex items-center gap-2 text-sm text-gray-600 py-3">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
              <Home className="w-4 h-4 text-blue-600" />
            </Link>
            <span>/</span>
            <span className="text-blue-600">{tag.name}</span>
            {tools.length > 0 && (
              <>
                <span>/</span>
                <span className="text-gray-900">{tools[0].title}</span>
              </>
            )}
          </div>
        </Container>
      </div>

      {/* Search and Tools List - Client Component */}
      {tools.length === 0 ? (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">
                No tools found for "{tag.name}"
              </p>
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <FilteredToolsProvider initialTools={tools}>
          {/* Blue category cards (match homepage) */}
          <section className="py-6 md:py-8">
            <Container>
              <div className="flex flex-wrap gap-3 md:gap-4 justify-start">
                {tagsWithCount.slice(0, 10).map((t) => (
                  <Link
                    key={t.slug}
                    href={`/collection/${t.slug}`}
                    className="bg-blue-600 hover:bg-blue-700 rounded-2xl p-3.5 text-left transition-colors shadow-md flex flex-col justify-between"
                    style={{ width: '180px', height: '110px' }}
                  >
                    <div className="flex items-start justify-start mb-auto">
                      <svg 
                        className="w-8 h-8 text-blue-300/60" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white text-lg font-bold mb-0.5 line-clamp-2 break-words leading-tight">{t.name}</h3>
                      <p className="text-blue-200 text-xs tracking-wide">{t.count} LISTING</p>
                    </div>
                  </Link>
                ))}
              </div>
            </Container>
          </section>

          {/* Search Bar - below blue boxes for filtering */}
          <section className="py-8 bg-white">
            <Container>
              <div className="max-w-3xl mx-auto">
                <CollectionSearchBarWrapper
                  tags={allTags}
                  tools={tools}
                />
              </div>
            </Container>
          </section>

          <CollectionPageContentWithSearch tools={tools} toolRatings={toolRatings} />
        </FilteredToolsProvider>
      )}
    </div>
  );
}

// ============================================================================
// ISR CONFIGURATION
// ============================================================================

export const revalidate = 3600;
export const dynamicParams = true; // Allow dynamic params beyond static generation

// ============================================================================
// GENERATE STATIC PARAMS (Optional - for static generation of known collections)
// ============================================================================

export async function generateStaticParams() {
  // Pre-generate the most common collection pages at build time for instant loading
  try {
    const tagsData = await wpFetch<{ tags: { nodes: Array<{ slug: string }> } }>(
      TAGS_QUERY,
      { first: 50 },
      { revalidate: 3600 }
    );
    
    const tags = tagsData?.tags?.nodes ?? [];
    
    // Generate static pages for all tags
    return tags.map((tag) => ({
      slug: tag.slug,
    }));
  } catch (error) {
    console.error('Error in generateStaticParams:', error);
    return [];
  }
}

