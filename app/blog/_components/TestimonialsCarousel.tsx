'use client';

import React, { useEffect, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Container from '../../(components)/Container';

interface Testimonial {
  id: string;
  title: string;
  testimonialMeta: {
    reviewText: string;
    profileIcon: {
      node: {
        sourceUrl: string;
        altText?: string;
      };
    } | null;
  } | null;
}

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    skipSnaps: false,
    duration: 20,
    dragFree: false,
    watchDrag: true,
  });

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Show placeholder if no testimonials (for testing/development)
  if (!testimonials?.length) {
    return (
      <section className="py-12 md:py-16 bg-gray-50">
        <Container>
          <div className="bg-blue-900 rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="pr-32 md:pr-40">
              <blockquote className="text-white text-lg md:text-xl lg:text-2xl font-medium leading-relaxed">
                "No testimonials available yet. Add testimonials in WordPress to see them here."
              </blockquote>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <Container>
        <div className="relative">
          <div
            className="overflow-hidden"
            ref={emblaRef}
            style={{ touchAction: 'pan-y pinch-zoom' }}
          >
            <div className="flex items-stretch gap-6">
              {testimonials.map((testimonial, index) => {
                const reviewText = testimonial.testimonialMeta?.reviewText ?? '';
                const profileIcon = testimonial.testimonialMeta?.profileIcon?.node?.sourceUrl ?? null;

                // Highlight words "find" and "review" in the text
                const highlightedText = reviewText
                  .replace(/\bfind\b/gi, '<mark class="bg-blue-700 text-white px-1 rounded">$&</mark>')
                  .replace(/\breview\b/gi, '<mark class="bg-blue-700 text-white px-1 rounded">$&</mark>');

                return (
                  <div
                    key={testimonial.id ?? index}
                    className="flex-none flex justify-center w-full sm:w-[90%] lg:w-[85%]"
                  >
                    <div className="w-full max-w-4xl">
                      <div className="bg-blue-900 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                        {/* Profile Icon */}
                        {profileIcon && (
                          <div className="absolute right-8 top-8 md:right-12 md:top-12">
                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-pink-200 ring-4 ring-blue-800">
                              <Image
                                src={profileIcon}
                                alt={testimonial.title || 'Reviewer'}
                                fill
                                sizes="128px"
                                className="object-cover"
                              />
                            </div>
                          </div>
                        )}

                        {/* Review Text */}
                        <div className="pr-32 md:pr-40">
                          <blockquote
                            className="text-white text-lg md:text-xl lg:text-2xl font-medium leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: `"${highlightedText}"` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={scrollPrev}
            className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          <div className="flex gap-2 items-center">
            {testimonials.map((_, index: number) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index, false)}
                className={`transition-all duration-300 ${
                  index === selectedIndex
                    ? 'w-8 h-1.5 bg-blue-500 rounded-full'
                    : 'w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={scrollNext}
            className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </Container>
    </section>
  );
}

