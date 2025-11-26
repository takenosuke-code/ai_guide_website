"use client";

import { useEffect, useMemo, useState } from "react";
import AIToolCard from "@/components/AIToolCard";

export interface AIToolCarouselCard {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  featuredImageUrl: string | null;
  excerpt?: string;
  tags?: { name: string; slug: string }[];
  keyFindings?: string[] | null;
  fallbackBadge?: { name: string; slug: string };
  ctaHref: string;
  sortDate?: string | null;
  latestVersion?: string | null;
  latestUpdate?: string | null;
  pricing?: string | null;
  whoIsItFor?: string | null;
}

interface AIToolCarouselProps {
  cards: AIToolCarouselCard[];
  itemsPerSlide?: number;
  cardVariant?: "default" | "compact";
}

export default function AIToolCarousel({
  cards,
  itemsPerSlide = 3,
  cardVariant = "default",
}: AIToolCarouselProps) {
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => {
      const dateA = a.sortDate ? new Date(a.sortDate).getTime() : 0;
      const dateB = b.sortDate ? new Date(b.sortDate).getTime() : 0;
      return dateB - dateA;
    });
  }, [cards]);
  const slideCount = useMemo(
    () => Math.max(1, Math.ceil(sortedCards.length / itemsPerSlide)),
    [sortedCards.length, itemsPerSlide]
  );
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (slideIndex >= slideCount) {
      setSlideIndex(0);
    }
  }, [slideCount, slideIndex]);

  if (!sortedCards.length) {
    return null;
  }

  const getVisibleCards = () => {
    const start = slideIndex * itemsPerSlide;
    return sortedCards.slice(start, start + itemsPerSlide);
  };

  const handlePrev = () => {
    setSlideIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  const handleNext = () => {
    setSlideIndex((prev) => (prev + 1) % slideCount);
  };

  const visibleCards = getVisibleCards();

  return (
    <div className="space-y-6">
      <div className="grid gap-5 grid-cols-3">
        {visibleCards.map((card) => (
          <AIToolCard key={card.id} variant={cardVariant} {...card} />
        ))}
      </div>

      {slideCount > 1 && (
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handlePrev}
            className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Previous tools"
          >
            <span className="sr-only">Previous</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-4 h-4 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="flex gap-2 items-center">
            {Array.from({ length: slideCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => setSlideIndex(index)}
                className={`transition-all duration-300 ${
                  index === slideIndex
                    ? "w-8 h-1.5 bg-blue-500 rounded-full"
                    : "w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Next tools"
          >
            <span className="sr-only">Next</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-4 h-4 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

