// ============================================================================
// FILE: app/collection/[slug]/page.tsx
// PURPOSE: Collection page showing all tools with a specific tag
// ============================================================================

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
import { getSiteBranding, getMegaphoneIcon } from "@/lib/branding";

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
  const [toolsData, allTagRes, navMenuRes, branding, tagsWithCountRes, allReviewsData, megaphoneIcon] = await Promise.all([
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
    ).catch(() => ({ reviews: { nodes: [] } })),
    getMegaphoneIcon()
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
        tools={tools.map((t) => ({ title: t.title, slug: t.slug }))}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <Container>
          <div className="flex items-center gap-2 text-sm text-gray-600 py-3">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1 flex-shrink-0">
              <Home className="w-4 h-4 text-blue-600" />
            </Link>
            <span className="flex-shrink-0">/</span>
            <span className="text-blue-600 flex-shrink-0">{tag.name}</span>
            {tools.length > 0 && (
              <>
                <span className="flex-shrink-0">/</span>
                <span className="text-gray-900 truncate">{tools[0].title}</span>
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
          <section className="py-8">
            <Container>
              <div className="grid grid-cols-5 gap-y-4 justify-items-center">
                {tagsWithCount.slice(0, 10).map((t) => (
                  <Link
                    key={t.slug}
                    href={`/collection/${t.slug}`}
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
                      <h3 className="text-white text-base font-bold mb-0.5 truncate" title={t.name}>{t.name}</h3>
                      <p className="text-gray-400 text-[10px] tracking-wide">{t.count} LISTING</p>
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

