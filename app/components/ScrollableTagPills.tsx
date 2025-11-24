'use client';

import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

interface Tag {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

interface ScrollableTagPillsProps {
  tags: Tag[];
  currentTag: string;
}

export default function ScrollableTagPills({ tags, currentTag }: ScrollableTagPillsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      // Scroll by approximately one tag width (120px + gap)
      scrollContainerRef.current.scrollBy({ left: 128, behavior: 'smooth' });
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      // Scroll back by approximately one tag width (120px + gap)
      scrollContainerRef.current.scrollBy({ left: -128, behavior: 'smooth' });
    }
  };

  // Calculate approximate width to show 5 tags
  // Each tag is approximately 120px wide + 8px gap = 128px per tag
  // 5 tags = 640px
  const containerWidth = tags.length > 5 ? '640px' : '100%';

  return (
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
              <Link
                key={tag.id}
                href={{ pathname: "/", query: { tag: tag.slug }, hash: "reviews" }}
                scroll={false}
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
              </Link>
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
  );
}

