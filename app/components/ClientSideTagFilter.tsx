'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import AIToolCard from '@/components/AIToolCard';

interface Tag {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

interface Tool {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  aiToolMeta: {
    logo?: {
      node: {
        sourceUrl: string;
      };
    } | null;
    keyFindings?: string | null;
    latestVersion?: string | null;
    latestUpdate?: string | null;
    pricing?: string | null;
    whoIsItFor?: string | null;
  } | null;
  featuredImage?: {
    node: {
      sourceUrl: string;
    };
  } | null;
  tags?: {
    nodes: Array<{
      name: string;
      slug: string;
    }>;
  };
}

interface ClientSideTagFilterProps {
  allTools: Tool[];
  tags: Tag[];
  initialTag?: string;
}

export default function ClientSideTagFilter({ allTools, tags, initialTag = '' }: ClientSideTagFilterProps) {
  const [currentTag, setCurrentTag] = useState(initialTag);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll state
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth, scrollLeft } = scrollContainerRef.current;
        const hasMoreContentRight = scrollLeft + clientWidth < scrollWidth - 10;
        const hasMoreContentLeft = scrollLeft > 10;
        setCanScrollRight(hasMoreContentRight || tags.length > 5);
        setCanScrollLeft(hasMoreContentLeft);
      }
    };

    // Check initially and after layout
    setTimeout(checkScroll, 100);
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [tags]);

  // Scroll functions
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 128, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -128, behavior: 'smooth' });
    }
  };

  // Filter tools based on selected tag
  const filteredTools = useMemo(() => {
    if (!currentTag) {
      return allTools;
    }
    
    return allTools.filter(tool => {
      const toolTags = tool.tags?.nodes || [];
      return toolTags.some(tag => tag.slug === currentTag);
    });
  }, [allTools, currentTag]);

  // Convert tools to carousel card format
  const carouselCards = useMemo(() => {
    return filteredTools.map((p: Tool) => {
      const toolTags = p.tags?.nodes || [];
      // Correct logo URL extraction (same as in page.tsx)
      const logoUrl = 
        p?.aiToolMeta?.logo?.node?.sourceUrl ?? 
        p?.featuredImage?.node?.sourceUrl ?? 
        null;
      const featuredImageUrl = p.featuredImage?.node?.sourceUrl ?? null;
      const keyFindingsRaw = p.aiToolMeta?.keyFindings ?? null;
      let keyFindings: string[] = [];
      
      if (keyFindingsRaw) {
        const parts = keyFindingsRaw.split(/\n\s*\n/).filter(x => x.trim() !== '');
        keyFindings = parts.map(section => {
          const lines = section.split(/\r?\n/).filter(ln => ln.trim() !== '');
          return lines.length > 0 ? lines[0].trim() : '';
        }).filter(x => x !== '');
      }

      return {
        id: p.id,
        slug: p.slug,
        name: p.title,
        logoUrl,
        featuredImageUrl,
        excerpt: p.excerpt ?? '',
        tags: toolTags,
        keyFindings,
        ctaHref: `/tool/${p.slug}`,
        latestVersion: p.aiToolMeta?.latestVersion ?? null,
        latestUpdate: p.aiToolMeta?.latestUpdate ?? null,
        pricing: p.aiToolMeta?.pricing ?? null,
        whoIsItFor: p.aiToolMeta?.whoIsItFor ?? null,
      };
    });
  }, [filteredTools]);

  // Handle tag click
  const handleTagClick = (tagSlug: string) => {
    setCurrentTag(tagSlug);
  };

  // Calculate approximate width to show 5 tags
  const containerWidth = tags.length > 5 ? '640px' : '100%';

  return (
    <>
      {/* Tag pills with scroll arrows */}
      <div className="relative mb-6">
        <div className="flex items-center gap-2 justify-center">
          {tags.length > 5 && canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Scroll left to see previous tags"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>
          )}
          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-2"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              width: containerWidth,
              maxWidth: '100%',
            }}
          >
            {tags.map((tag) => {
              const isActive = currentTag === tag.slug;
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.slug)}
                  className={[
                    "inline-flex items-center justify-center flex-none whitespace-nowrap",
                    "h-9 px-4 rounded-lg min-w-[120px]",
                    "text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  ].join(" ")}
                  aria-current={isActive ? "page" : undefined}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
          {tags.length > 5 && canScrollRight && (
            <button
              onClick={scrollRight}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Scroll right to see more tags"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>

      {/* Filtered tools grid - 3x3 (9 tools) */}
      {carouselCards.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">
          No tools found for this category.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-6">
            {carouselCards.slice(0, 9).map((card) => (
              <AIToolCard key={card.id} variant="compact" {...card} />
            ))}
          </div>
          
          {/* Show More Button - Links to collection page for selected tag */}
          {currentTag && (
            <div className="mt-6 text-center">
              <a
                href={`/collection/${currentTag}`}
                className="inline-flex items-center justify-center text-base font-semibold text-white rounded-lg transition-colors shadow-md hover:opacity-90"
                style={{ 
                  backgroundColor: '#1466F6',
                  width: '183px',
                  height: '48px'
                }}
              >
                All {tags.find((t) => t.slug === currentTag)?.name || 'AI Tools'} AI
              </a>
            </div>
          )}
        </>
      )}
    </>
  );
}

