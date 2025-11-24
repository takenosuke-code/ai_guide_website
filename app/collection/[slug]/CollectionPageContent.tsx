'use client';

import Link from 'next/link';
import CollectionToolCard from './CollectionToolCard';
import { normalizeKeyFindings } from '../../../lib/normalizers';

interface Tool {
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
}

interface Tag {
  name: string;
  slug: string;
}

interface CollectionPageContentProps {
  tools: Tool[];
  filteredTools: Tool[];
}

export default function CollectionPageContent({
  tools,
  filteredTools,
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
    </>
  );
}

