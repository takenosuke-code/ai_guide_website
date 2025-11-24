// ============================================================================
// FILE: app/collection/[slug]/page.tsx
// PURPOSE: Collection page showing all tools with a specific tag
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import Image from 'next/image';
import { HERO_BG_PATH } from '../../../lib/heroBg';
import { ALL_TAG_SLUGS, TAGS_QUERY, TAG_BY_SLUG_QUERY, TOOLS_BY_TAG_QUERY, NAV_MENU_POSTS_QUERY } from '../../../lib/queries';
import { wpFetch } from '../../../lib/wpclient';
import { normalizeKeyFindings } from '../../../lib/normalizers';
import CollectionToolCard from './CollectionToolCard';
import Container from '../../(components)/Container';
import HeroSearchBar from '@/components/HeroSearchBar';
import { notFound } from 'next/navigation';
import PrimaryHeader from '@/components/site-header/PrimaryHeader';
import { buildNavGroups, NavMenuPostNode } from '@/lib/nav-groups';

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

  // Fetch all tags for header + search suggestions
  const allTagRes = await wpFetch<{ tags: { nodes: { name: string; slug: string }[] } }>(
    ALL_TAG_SLUGS,
    {},
    { revalidate: 3600 }
  );
  const allTags = allTagRes?.tags?.nodes ?? [];
  const navMenuRes = await wpFetch<{ posts: { nodes: NavMenuPostNode[] } }>(
    NAV_MENU_POSTS_QUERY,
    { first: 200 },
    { revalidate: 3600 }
  );
  const navGroups = buildNavGroups(navMenuRes?.posts?.nodes ?? []);

  // Fetch tags with counts for grid cards
  const tagsWithCountRes = await wpFetch<{ tags: { nodes: { id: string; name: string; slug: string; count: number }[] } }>(
    TAGS_QUERY,
    { first: 50 },
    { revalidate: 3600 }
  );
  const tagsWithCount = tagsWithCountRes?.tags?.nodes ?? [];

  return (
    <div className="min-h-screen bg-white">
      <PrimaryHeader tags={allTags} navGroups={navGroups} />

      <div className="h-6 md:h-8" aria-hidden="true" />

      {/* Hero / Banner */}
      <section className="py-8">
        <Container>
          <div className="relative rounded-3xl overflow-hidden shadow-lg h-[420px] md:h-[520px]">
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
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-600/60 via-blue-500/50 to-cyan-400/40" />
            <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6 py-8 md:py-12">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                {tag.name}
              </h1>
              <p className="text-base md:text-lg text-white/90 mb-2 max-w-[70ch] mx-auto">
                {tag.description || `Explore tools, reviews, and guides for ${tag.name}.`}
              </p>
            </div>
          </div>

          {/* Main search under hero */}
          <div className="mt-8">
            <HeroSearchBar tags={allTags} showButton />
          </div>
        </Container>
      </section>

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

      {/* Tools List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
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
            <div className="space-y-6">
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

