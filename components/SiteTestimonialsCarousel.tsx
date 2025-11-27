'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TestimonialCard from './TestimonialCard';

interface Testimonial {
  id: string;
  title: string;
  siteReview?: {
    reviewtext?: string;
    profileimg?: {
      node?: {
        sourceUrl?: string;
        altText?: string;
      };
    };
  } | null;
}

interface SiteTestimonialsCarouselProps {
  testimonials: Testimonial[];
  autoRotate?: boolean;
  intervalMs?: number;
}

export default function SiteTestimonialsCarousel({
  testimonials,
  autoRotate = false,
  intervalMs = 5000,
}: SiteTestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoRotate || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [autoRotate, intervalMs, testimonials.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];
  const reviewText = currentTestimonial.siteReview?.reviewtext || '';
  const profileImage = currentTestimonial.siteReview?.profileimg?.node?.sourceUrl;

  return (
    <div className="relative">
      <TestimonialCard
        reviewerName=""
        reviewText={reviewText}
        profileImage={profileImage}
        highlightWords={[]}
      />

      {testimonials.length > 1 && (
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={goToPrevious}
            className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          <div className="flex gap-2 items-center">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 h-1.5 bg-blue-500 rounded-full'
                    : 'w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
}

