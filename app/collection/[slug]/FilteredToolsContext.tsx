'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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

interface FilteredToolsContextType {
  filteredTools: Tool[];
  setFilteredTools: (tools: Tool[]) => void;
}

const FilteredToolsContext = createContext<FilteredToolsContextType | undefined>(undefined);

export function FilteredToolsProvider({ children, initialTools }: { children: ReactNode; initialTools: Tool[] }) {
  const [filteredTools, setFilteredTools] = useState<Tool[]>(initialTools);

  return (
    <FilteredToolsContext.Provider value={{ filteredTools, setFilteredTools }}>
      {children}
    </FilteredToolsContext.Provider>
  );
}

export function useFilteredTools() {
  const context = useContext(FilteredToolsContext);
  if (context === undefined) {
    throw new Error('useFilteredTools must be used within a FilteredToolsProvider');
  }
  return context;
}

