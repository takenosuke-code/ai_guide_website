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
  // Add dummy testimonials for demonstration if none exist or only one exists
  const dummyTestimonials: Testimonial[] = [
    {
      id: 'dummy-1',
      title: 'G2 Review',
      testimonialMeta: {
        reviewText: 'G2 has been a great place for me to both find and review software...it\'s actually been fun to see my reviews go up, get marked helpful...',
        profileIcon: null,
      },
    },
    {
      id: 'dummy-2',
      title: 'User Review',
      testimonialMeta: {
        reviewText: 'This platform makes it so easy to discover new AI tools and share my experiences. I love how I can find exactly what I need and review tools that have helped me.',
        profileIcon: null,
      },
    },
    {
      id: 'dummy-3',
      title: 'Another Review',
      testimonialMeta: {
        reviewText: 'As a developer, I constantly need to find and review new tools. This site has become my go-to resource for discovering the best AI solutions.',
        profileIcon: null,
      },
    },
  ];

  // Use dummy testimonials if no testimonials or only one testimonial exists
  const displayTestimonials = testimonials?.length > 1 ? testimonials : dummyTestimonials;

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
              {displayTestimonials.map((testimonial, index) => {
                const reviewText = testimonial.testimonialMeta?.reviewText ?? '';
                const profileIcon = testimonial.testimonialMeta?.profileIcon?.node?.sourceUrl ?? null;

                // Bold words "find" and "review" in the text (matching the image exactly)
                const highlightedText = reviewText
                  .replace(/\bfind\b/gi, '<strong>$&</strong>')
                  .replace(/\breview\b/gi, '<strong>$&</strong>');

                return (
                  <div
                    key={testimonial.id ?? index}
                    className="flex-none flex justify-center w-full"
                  >
                    <div className="w-full max-w-5xl">
                      <div className="bg-blue-900 rounded-2xl p-10 md:p-14 relative overflow-hidden min-h-[280px] flex items-center">
                        {/* Large Pink Circle Avatar - Right side (matching image) */}
                        <div className="absolute right-6 md:right-10 top-1/2 -translate-y-1/2">
                          {profileIcon ? (
                            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden bg-pink-200">
                              <Image
                                src={profileIcon}
                                alt={testimonial.title || 'Reviewer'}
                                fill
                                sizes="160px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-pink-200" />
                          )}
                        </div>

                        {/* Review Text - Left side with padding for avatar */}
                        <div className="pr-40 md:pr-52 max-w-3xl">
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

        {/* Navigation Controls - Centered at bottom, same size as blog carousel */}
        {displayTestimonials.length > 1 && (
          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={scrollPrev}
              className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>

            <div className="flex gap-2 items-center">
              {displayTestimonials.map((_, index: number) => (
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
        )}
      </Container>
    </section>
  );
}

