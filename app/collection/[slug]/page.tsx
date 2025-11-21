// ============================================================================
// FILE: app/collection/[slug]/page.tsx
// PURPOSE: Collection page showing all tools with a specific tag
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Search, Home } from 'lucide-react';
import { wpFetch } from '../../../lib/wpclient';
import { TAG_BY_SLUG_QUERY, TOOLS_BY_TAG_QUERY } from '../../../lib/queries';
import { normalizeKeyFindings } from '../../../lib/normalizers';
import CollectionToolCard from './CollectionToolCard';
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

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
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
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="bg-white border-b py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder={tag.slug}
                defaultValue={tag.slug}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
              />
            </div>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Tools List */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Centered section title */}
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-center text-gray-800">
              {tag.name}
            </h1>
          </header>

          {tools.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {tools.map((tool) => {
                const logoUrl =
                  tool?.aiToolMeta?.logo?.node?.sourceUrl ??
                  tool?.featuredImage?.node?.sourceUrl ??
                  null;
                const keyFindings = normalizeKeyFindings(tool);
                return (
                  <CollectionToolCard
                    key={tool.id}
                    id={tool.id}
                    title={tool.title}
                    slug={tool.slug}
                    logoUrl={logoUrl}
                    rating={4.5}
                    description={tool.excerpt}
                    keyFindings={keyFindings}
                    toolHref={`/tool/${tool.slug}`}
                  />
                );
              })}
            </div>
          )}
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
// GENERATE STATIC PARAMS (Optional - for static generation of known collections)
// ============================================================================

export async function generateStaticParams() {
  // You can optionally pre-generate paths for known collections
  // This will be called at build time
  return [];
}

