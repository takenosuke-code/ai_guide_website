'use client';

import CollectionSearchBar from './CollectionSearchBar';
import { useFilteredTools } from './FilteredToolsContext';

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

interface CollectionSearchBarWrapperProps {
  tags: Tag[];
  tools: Tool[];
}

export default function CollectionSearchBarWrapper({
  tags,
  tools,
}: CollectionSearchBarWrapperProps) {
  const { setFilteredTools } = useFilteredTools();

  return (
    <CollectionSearchBar
      tags={tags}
      tools={tools}
      onFilteredToolsChange={setFilteredTools}
    />
  );
}

