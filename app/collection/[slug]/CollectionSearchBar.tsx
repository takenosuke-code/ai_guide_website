'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

type Suggestion =
  | { kind: 'tag'; slug: string; name: string }
  | { kind: 'tool'; slug: string; title: string };

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
  const router = useRouter();

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

  // Get suggestions for autocomplete (tags + tools)
  const suggestions: Suggestion[] = useMemo(() => {
    const s = inputValue.trim().toLowerCase();
    if (!s) return [];
    
    // Filter out already selected tags
    const selectedSlugs = selectedTags.map(t => t.slug);
    
    const tagSuggestions: Suggestion[] = tags
      .filter(
        (t) =>
          !selectedSlugs.includes(t.slug) &&
          (t.name.toLowerCase().includes(s) || t.slug.toLowerCase().includes(s))
      )
      .slice(0, 8)
      .map((t) => ({
        kind: 'tag' as const,
        slug: t.slug,
        name: t.name,
      }));

    const toolSuggestions: Suggestion[] = tools
      .filter(
        (tool) =>
          tool.title.toLowerCase().includes(s) ||
          tool.slug.toLowerCase().includes(s)
      )
      .slice(0, 8)
      .map((tool) => ({
        kind: 'tool' as const,
        slug: tool.slug,
        title: tool.title,
      }));

    return [...tagSuggestions, ...toolSuggestions].slice(0, 12);
  }, [inputValue, tags, tools, selectedTags]);

  const handleSuggestionClick = (s: Suggestion) => {
    if (s.kind === 'tool') {
      // For tools, navigate directly to the tool detail page
      router.push(`/tool/${s.slug}`);
      return;
    }

    const tag = tags.find((t) => t.slug === s.slug);
    if (!tag) return;

    // Add tag to selected tags (existing behavior)
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
    
    // Try to match input to a tag or tool
    if (inputValue.trim()) {
      const normalized = normalizeAlias(inputValue.trim());
      const slugified = toSlug(normalized);
      
      // 1) Try tag match (existing behavior)
      const matchedTag = tags.find(
        (t) =>
          t.slug.toLowerCase() === slugified ||
          toSlug(t.name) === slugified ||
          t.name.toLowerCase() === inputValue.trim().toLowerCase()
      );
      
      if (matchedTag && !selectedTags.find(t => t.slug === matchedTag.slug)) {
        setSelectedTags([...selectedTags, matchedTag]);
        setInputValue('');
        return;
      }

      // 2) If no tag matched, try tool match and navigate
      const matchedTool = tools.find(
        (tool) =>
          tool.slug.toLowerCase() === slugified ||
          toSlug(tool.title) === slugified ||
          tool.title.toLowerCase() === inputValue.trim().toLowerCase()
      );

      if (matchedTool) {
        router.push(`/tool/${matchedTool.slug}`);
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
          {suggestions.map((s) => (
            <li key={`${s.kind}-${s.slug}`}>
              <button
                type="button"
                onClick={() => handleSuggestionClick(s)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                {s.kind === 'tag' ? (
                  <>
                    <span className="font-medium text-gray-900">
                      {s.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      /{s.slug}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-gray-900">
                      {s.title}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      AI tool
                    </span>
                  </>
                )}
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

