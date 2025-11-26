'use client';

import Link from 'next/link';
import CollectionToolCard from './CollectionToolCard';
import { normalizeKeyFindings } from '../../../lib/normalizers';

interface Tool {
  id: string;
  databaseId?: number;
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
}

interface Tag {
  name: string;
  slug: string;
}

interface CollectionPageContentProps {
  tools: Tool[];
  filteredTools: Tool[];
  toolRatings: Record<number, number>;
}

export default function CollectionPageContent({
  tools,
  filteredTools,
  toolRatings,
}: CollectionPageContentProps) {
  return (
    <>
      {/* Tools List */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {filteredTools.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">
                No tools found matching your search criteria.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTools.map((tool) => {
                const logoUrl =
                  tool?.aiToolMeta?.logo?.node?.sourceUrl ??
                  tool?.featuredImage?.node?.sourceUrl ??
                  null;
                const keyFindings = normalizeKeyFindings(tool);
                const toolRating = tool.databaseId ? toolRatings[tool.databaseId] : undefined;
                return (
                  <CollectionToolCard
                    key={tool.id}
                    id={tool.id}
                    title={tool.title}
                    slug={tool.slug}
                    logoUrl={logoUrl}
                    rating={toolRating}
                    description={tool.excerpt}
                    keyFindings={keyFindings}
                    tags={tool.tags?.nodes || []}
                    toolHref={`/tool/${tool.slug}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

