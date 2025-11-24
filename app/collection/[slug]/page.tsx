// ============================================================================
// FILE: app/collection/[slug]/page.tsx
// PURPOSE: Collection page showing all tools with a specific tag
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Home, ChevronDown } from 'lucide-react';
import { ALL_TAG_SLUGS, TAGS_QUERY, NAVIGATION_TAGS_QUERY } from '../../../lib/queries';
import { wpFetch } from '../../../lib/wpclient';
import { TAG_BY_SLUG_QUERY, TOOLS_BY_TAG_QUERY } from '../../../lib/queries';
import CollectionToolCard from './CollectionToolCard';
import Container from '../../(components)/Container';
import CollectionPageContentWithSearch from './CollectionPageContentWithSearch';
import CollectionSearchBarWrapper from './CollectionSearchBarWrapper';
import { FilteredToolsProvider } from './FilteredToolsContext';
import { notFound } from 'next/navigation';

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

  // Fetch tools with this tag (ai-review category only)
  let toolsData: ToolsData;
  try {
    toolsData = await wpFetch<ToolsData>(
      TOOLS_BY_TAG_QUERY,
      { tag: [slug] },
      { revalidate: 3600 }
    );
  } catch (error) {
    console.error('❌ Error fetching tools:', error);
    toolsData = { posts: { nodes: [] } };
  }

  const tools = toolsData?.posts?.nodes ?? [];

  // Fetch all tags for the search suggestions and counts for the cards
  const allTagRes = await wpFetch<{ tags: { nodes: { name: string; slug: string }[] } }>(
    ALL_TAG_SLUGS,
    {},
    { revalidate: 3600 }
  );
  const allTags = allTagRes?.tags?.nodes ?? [];

  // Also fetch tags with counts to render the blue cards (matches homepage)
  const tagsWithCountRes = await wpFetch<{ tags: { nodes: { id: string; name: string; slug: string; count: number }[] } }>(
    TAGS_QUERY,
    { first: 50 },
    { revalidate: 3600 }
  );
  const tagsWithCount = tagsWithCountRes?.tags?.nodes ?? [];

  // Fetch top tags for navigation
  const navTagsRes = await wpFetch<{ tags: { nodes: Array<{ id: string; name: string; slug: string; count: number }> } }>(
    NAVIGATION_TAGS_QUERY,
    { first: 3 },
    { revalidate: 3600 }
  );
  const navTags = navTagsRes?.tags?.nodes ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* Full header copied from home: search + nav */}
      <header
        className="sticky top-0 z-50 w-full shadow-md"
        style={{ position: 'sticky', top: 0, background: 'linear-gradient(to right, #60a5fa, #67e8f9)' }}
      >
        <Container className="py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-white font-semibold inline-flex items-center gap-2">
                <span className="text-lg">←</span>
                <span>Back to Home</span>
              </Link>
            </div>
            <nav className="flex items-center gap-8">
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
        </Container>
      </header>

      {/* Breadcrumb - moved below header */}
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
          {/* Search Bar - above blue boxes for filtering */}
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

      {/* Blue category cards (match homepage) */}
      <section className="py-8">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 justify-center">
            {tagsWithCount.slice(0, 10).map((t) => (
              <Link
                key={t.slug}
                href={`/collection/${t.slug}`}
                className="bg-blue-600 hover:bg-blue-700 rounded-2xl p-6 text-center transition-colors shadow-md flex flex-col items-start gap-3"
              >
                <div className="w-10 h-10 rounded-md bg-blue-500/30 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-megaphone"><path d="M3 11v6a2 2 0 0 0 2 2h1"/><path d="M5 11V6a2 2 0 0 1 2-2h9l4 4v3"/><path d="M17 10v7a2 2 0 0 1-2 2h-1"/></svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-lg font-semibold">{t.name}</h3>
                  <p className="text-blue-100 text-xs mt-1">{t.count} LISTING</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

          <CollectionPageContentWithSearch tools={tools} />
        </FilteredToolsProvider>
      )}
    </div>
  );
}

// ============================================================================
// ISR CONFIGURATION
// ============================================================================

export const revalidate = 3600;

// ============================================================================
// GENERATE STATIC PARAMS (Optional - for static generation of known collections)
// ============================================================================

export async function generateStaticParams() {
  // You can optionally pre-generate paths for known collections
  // This will be called at build time
  return [];
}

