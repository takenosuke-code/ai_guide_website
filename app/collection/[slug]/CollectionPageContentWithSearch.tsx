'use client';

import CollectionPageContent from './CollectionPageContent';
import { useFilteredTools } from './FilteredToolsContext';

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

interface CollectionPageContentWithSearchProps {
  tools: Tool[];
  toolRatings: Record<number, number>;
}

export default function CollectionPageContentWithSearch({
  tools,
  toolRatings,
}: CollectionPageContentWithSearchProps) {
  const { filteredTools } = useFilteredTools();

  return (
    <>
      {/* Tools List with filtering */}
      <CollectionPageContent tools={tools} filteredTools={filteredTools} toolRatings={toolRatings} />
    </>
  );
}

