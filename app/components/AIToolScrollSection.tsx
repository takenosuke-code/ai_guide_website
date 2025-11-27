'use client';

import React, { useRef } from 'react';
import AIToolCard from '@/components/AIToolCard';
import { AIToolCarouselCard } from './AIToolCarousel';

interface AIToolScrollSectionProps {
  cards: AIToolCarouselCard[];
  cardVariant?: "default" | "compact";
}

export default function AIToolScrollSection({ cards, cardVariant = "compact" }: AIToolScrollSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragDistance = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scrollContainerRef.current) {
      isDragging.current = true;
      dragDistance.current = 0;
      startX.current = e.pageX - scrollContainerRef.current.offsetLeft;
      scrollLeft.current = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseLeave = () => {
    if (scrollContainerRef.current) {
      isDragging.current = false;
      scrollContainerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    if (scrollContainerRef.current) {
      isDragging.current = false;
      scrollContainerRef.current.style.cursor = 'grab';
      setTimeout(() => {
        dragDistance.current = 0;
      }, 100);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    dragDistance.current += Math.abs(walk);
    scrollContainerRef.current.scrollLeft = scrollLeft.current - walk;
  };

  if (!cards?.length) return null;

  return (
    <div
      ref={scrollContainerRef}
      className="overflow-x-auto cursor-grab no-scrollbar"
      style={{
        WebkitOverflowScrolling: 'touch'
      }}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <div className="flex gap-6 pb-4 px-4 md:px-0" style={{ width: 'max-content' }}>
        {cards.map((card) => (
          <div
            key={card.id}
            className="flex-none w-[90vw] max-w-[320px] md:w-[320px]"
            onClick={(e) => {
              if (dragDistance.current > 5) {
                e.preventDefault();
              }
            }}
          >
            <AIToolCard variant={cardVariant} {...card} />
          </div>
        ))}
      </div>
    </div>
  );
}

