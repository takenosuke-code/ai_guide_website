'use client';

import React, { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import Image from 'next/image';
import FallbackImg from './FallbackImg';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CardLinkOverlay from '../../components/CardLinkOverlay';
import Container from '../(components)/Container';

interface TopPicksCarouselProps {
  posts: any[];
  showAllButton?: boolean;
}

export default function TopPicksCarousel({ posts, showAllButton = true }: TopPicksCarouselProps) {
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

  if (!posts?.length) return null;

  return (
    <section className="py-8 md:py-12 lg:py-16">
      <Container>
        {/* Top picks heading removed per request */}

        <div className="relative">
          <div
            className="overflow-hidden"
            ref={emblaRef}
            style={{ touchAction: 'pan-y pinch-zoom' }}
          >
            <div className="flex items-stretch gap-3 md:gap-4 px-4 sm:px-8">
              {posts.map((p: any, index: number) => {
                const hero =
                  p.blog?.topPickImage?.node?.sourceUrl ??
                  p.blog?.topPickImage?.node?.mediaItemUrl ??
                  p.featuredImage?.node?.sourceUrl ??
                  '';

                const plainExcerpt = p.excerpt
                  ? p.excerpt.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
                  : undefined;

                const authorIcon =
                  p.blog?.authorIcon?.node?.sourceUrl ??
                  p.blog?.authorIcon?.node?.mediaItemUrl ??
                  p.author?.node?.avatar?.url ??
                  null;
                const authorName = p.author?.node?.name ?? '';
                const authorTagline = p.blog?.authorTagline ?? null;
                const authorInitials = authorName
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part: string) => part[0]?.toUpperCase())
                  .join('');

                return (
                  <div
                    key={p.id ?? index}
                    className="flex-none flex justify-center"
                  >
                    <article 
                      className="relative isolate overflow-hidden rounded-2xl border bg-white shadow-lg transition-shadow hover:shadow-xl focus-within:shadow-xl w-full max-w-[423px] h-auto"
                    >
                      <CardLinkOverlay href={`/blog/${p.slug}`} ariaLabel={p.title} />
                      <div className="flex flex-col h-full pointer-events-none">
                        <div className="relative w-full h-[140px]">
                          <FallbackImg
                            src={hero}
                            fallback="https://via.placeholder.com/800x450?text=No+Image"
                            className="w-full h-full rounded-t-2xl object-cover"
                          />
                        </div>
                        <div className="flex-1 p-3 flex flex-col">
                          <Link href={`/blog/${p.slug}`}>
                            <h3 className="pointer-events-auto relative z-[70] text-base font-bold text-gray-900 mb-1.5 hover:text-blue-600 transition-colors line-clamp-2">
                              {p.title}
                            </h3>
                          </Link>
                          {plainExcerpt && (
                            <p className="text-gray-600 text-xs leading-snug mb-2 flex-1 line-clamp-2 break-words [overflow-wrap:anywhere]">
                              {plainExcerpt}
                            </p>
                          )}
                          <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between gap-2 pointer-events-auto">
                            <div className="flex items-center gap-2">
                              <div className="relative h-6 w-6 rounded-full overflow-hidden ring-1 ring-rose-100 bg-rose-50 flex items-center justify-center text-[10px] font-semibold text-rose-500 flex-shrink-0">
                                {authorIcon ? (
                                  <Image
                                    src={authorIcon}
                                    alt={authorName}
                                    fill
                                    sizes="24px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <span>{authorInitials || '?'}</span>
                                )}
                              </div>
                              <div className="flex flex-col leading-tight min-w-0">
                                <span className="text-xs font-semibold text-gray-900 truncate">
                                  {authorName}
                                </span>
                              </div>
                            </div>
                            <Link
                              href={`/blog/${p.slug}`}
                              className="inline-flex items-center gap-1 text-blue-600 font-semibold text-xs hover:text-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
                            >
                              Read Article
                              <span aria-hidden="true">→</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-gray-50 via-gray-50/80 to-transparent z-10" />
        </div>

        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={scrollPrev}
            className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>

          <div className="flex gap-2 items-center">
            {posts.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index, false)}
                className={`transition-all duration-300 ${
                  index === selectedIndex
                    ? 'w-8 h-1.5 bg-blue-500 rounded-full'
                    : 'w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={scrollNext}
            className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {showAllButton && (
          <div className="flex justify-center mt-8">
            <Link
              href="/articles"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
            >
              All Articles
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}

