'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { normalizeAlias, toSlug } from '@/lib/slugify';

type Tag = { name: string; slug: string };

interface Tool {
  id: string;
  title: string;
  slug: string;
  tags?: {
    nodes: Array<{
      name: string;
      slug: string;
    }>;
  };
}

interface CollectionSearchBarProps {
  tags: Tag[];
  tools: Tool[];
  onFilteredToolsChange: (filteredTools: Tool[]) => void;
}

export default function CollectionSearchBar({
  tags,
  tools,
  onFilteredToolsChange,
}: CollectionSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Parse search query to extract tag slugs
  const parseTags = (query: string): string[] => {
    if (!query.trim()) return [];
    
    // Split by | or comma
    const parts = query.split(/[|,]/).map(part => part.trim()).filter(Boolean);
    
    return parts.map(part => {
      const normalized = normalizeAlias(part);
      const slugified = toSlug(normalized);
      
      // Try to find matching tag
      const hit = tags.find(
        (t) =>
          t.slug.toLowerCase() === slugified ||
          toSlug(t.name) === slugified ||
          t.name.toLowerCase() === part.toLowerCase()
      );
      
      return hit ? hit.slug : slugified;
    });
  };

  // Filter tools based on search query
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) {
      return tools;
    }

    const searchTagSlugs = parseTags(searchQuery);
    if (searchTagSlugs.length === 0) {
      return tools;
    }

    // Filter tools that have ALL the specified tags (AND logic)
    return tools.filter((tool) => {
      const toolTagSlugs = tool.tags?.nodes?.map((t) => t.slug.toLowerCase()) ?? [];
      return searchTagSlugs.every((searchSlug) =>
        toolTagSlugs.includes(searchSlug.toLowerCase())
      );
    });
  }, [searchQuery, tools, tags]);

  // Update parent component when filtered tools change
  useEffect(() => {
    onFilteredToolsChange(filteredTools);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTools]);

  // Get suggestions for autocomplete
  const suggestions = useMemo(() => {
    const s = searchQuery.trim().toLowerCase();
    if (!s) return [];
    
    // Check if query contains | or comma (multi-tag search)
    const hasSeparator = /[|,]/.test(searchQuery);
    
    if (hasSeparator) {
      // For multi-tag, show suggestions for the last part
      const parts = searchQuery.split(/[|,]/);
      const lastPart = parts[parts.length - 1].trim().toLowerCase();
      if (!lastPart) return [];
      
      return tags
        .filter(
          (t) =>
            t.name.toLowerCase().includes(lastPart) ||
            t.slug.toLowerCase().includes(lastPart)
        )
        .slice(0, 8);
    }
    
    return tags
      .filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.slug.toLowerCase().includes(s)
      )
      .slice(0, 8);
  }, [searchQuery, tags]);

  const handleSuggestionClick = (tag: Tag) => {
    const currentQuery = searchQuery.trim();
    if (currentQuery && !/[|,]/.test(currentQuery)) {
      // If no separator, add one
      setSearchQuery(`${currentQuery} | ${tag.name}`);
    } else {
      // Replace last part or append
      const parts = currentQuery.split(/[|,]/);
      parts[parts.length - 1] = tag.name;
      setSearchQuery(parts.join(' | '));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Filtering happens automatically via useMemo
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto">
      <div className="relative">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by tag (e.g. marketing | consultant | coder)"
          className="w-full rounded-full bg-white px-6 py-3 pr-32 shadow ring-1 ring-gray-200 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search tags"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-2 -translate-y-1/2 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Search className="h-4 w-4" strokeWidth={2.5} />
          <span>Search</span>
        </button>
      </div>

      {suggestions.length > 0 && searchQuery.trim() && (
        <ul className="absolute z-20 mt-2 w-full max-w-3xl rounded-xl bg-white shadow-lg ring-1 ring-gray-200 divide-y max-h-64 overflow-y-auto">
          {suggestions.map((t) => (
            <li key={t.slug}>
              <button
                type="button"
                onClick={() => handleSuggestionClick(t)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{t.name}</span>
                <span className="ml-2 text-xs text-gray-500">/{t.slug}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {searchQuery.trim() && (
        <div className="mt-2 text-sm text-gray-600">
          Showing {filteredTools.length} of {tools.length} tools
          {parseTags(searchQuery).length > 0 && (
            <span className="ml-2">
              (matching: {parseTags(searchQuery).join(', ')})
            </span>
          )}
        </div>
      )}
    </form>
  );
}

