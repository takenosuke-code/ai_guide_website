'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { normalizeAlias, toSlug } from '@/lib/slugify';

type Tag = { name: string; slug: string };

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
  const [inputValue, setInputValue] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  // Filter tools based on selected tags
  const filteredTools = useMemo(() => {
    if (selectedTags.length === 0) {
      return tools;
    }

    const selectedSlugs = selectedTags.map(t => t.slug.toLowerCase());

    // Filter tools that have ALL the selected tags (AND logic)
    return tools.filter((tool) => {
      const toolTagSlugs = tool.tags?.nodes?.map((t) => t.slug.toLowerCase()) ?? [];
      return selectedSlugs.every((slug) => toolTagSlugs.includes(slug));
    });
  }, [selectedTags, tools]);

  // Update parent component when filtered tools change
  useEffect(() => {
    onFilteredToolsChange(filteredTools);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTools]);

  // Get suggestions for autocomplete
  const suggestions = useMemo(() => {
    const s = inputValue.trim().toLowerCase();
    if (!s) return [];
    
    // Filter out already selected tags
    const selectedSlugs = selectedTags.map(t => t.slug);
    
    return tags
      .filter(
        (t) =>
          !selectedSlugs.includes(t.slug) &&
          (t.name.toLowerCase().includes(s) || t.slug.toLowerCase().includes(s))
      )
      .slice(0, 8);
  }, [inputValue, tags, selectedTags]);

  const handleSuggestionClick = (tag: Tag) => {
    // Add tag to selected tags
    if (!selectedTags.find(t => t.slug === tag.slug)) {
      setSelectedTags([...selectedTags, tag]);
    }
    // Clear input
    setInputValue('');
  };

  const removeTag = (tagToRemove: Tag) => {
    setSelectedTags(selectedTags.filter(t => t.slug !== tagToRemove.slug));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Try to match input to a tag
    if (inputValue.trim()) {
      const normalized = normalizeAlias(inputValue.trim());
      const slugified = toSlug(normalized);
      
      const matchedTag = tags.find(
        (t) =>
          t.slug.toLowerCase() === slugified ||
          toSlug(t.name) === slugified ||
          t.name.toLowerCase() === inputValue.trim().toLowerCase()
      );
      
      if (matchedTag && !selectedTags.find(t => t.slug === matchedTag.slug)) {
        setSelectedTags([...selectedTags, matchedTag]);
        setInputValue('');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="flex min-h-[3rem] w-full items-center gap-2 rounded-full bg-white px-4 py-2 pr-32 shadow ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-blue-500">
          {/* Selected tags as chips */}
          {selectedTags.map((tag) => (
            <span
              key={tag.slug}
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="inline-flex items-center justify-center hover:bg-blue-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          
          {/* Input */}
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={selectedTags.length === 0 ? "Search by tag (e.g. marketing, coder)" : "Add another tag..."}
            className="flex-1 border-none bg-transparent text-gray-900 outline-none placeholder:text-gray-400"
            aria-label="Search tags"
          />
        </div>
        
        <button
          type="submit"
          className="absolute top-1/2 right-2 -translate-y-1/2 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Search className="h-4 w-4" strokeWidth={2.5} />
          <span>Search</span>
        </button>
      </div>

      {suggestions.length > 0 && inputValue.trim() && (
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

      {selectedTags.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          Showing {filteredTools.length} of {tools.length} tools
          <span className="ml-2">
            (matching: {selectedTags.map(t => t.name).join(', ')})
          </span>
        </div>
      )}
    </form>
  );
}

