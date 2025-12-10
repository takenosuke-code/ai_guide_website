'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FallbackImg from './FallbackImg';
import Container from '../(components)/Container';

interface BlogScrollSectionProps {
  posts: any[];
}

export default function BlogScrollSection({ posts }: BlogScrollSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const dragDistance = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);

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
      // Reset drag distance after a short delay to allow onClick to check it
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

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const slides = container.querySelectorAll<HTMLDivElement>('.blog-slide');
    const target = slides[index];
    if (!target) return;
    container.scrollTo({
      left: target.offsetLeft,
      behavior: 'smooth',
    });
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      const next = prev === 0 ? posts.length - 1 : prev - 1;
      scrollToIndex(next);
      return next;
    });
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const next = prev === posts.length - 1 ? 0 : prev + 1;
      scrollToIndex(next);
      return next;
    });
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    scrollToIndex(index);
  };

  if (!posts?.length) return null;

  return (
    <section className="py-8 md:py-12">
      <Container>
        <div className="mb-6 md:mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Explore Our Blogs</h2>
        </div>

        <div
          className="relative"
          style={{ minHeight: '500px', paddingTop: '20px', paddingBottom: '40px' }}
        >
          {/* Scroll container */}
          <div
            ref={scrollContainerRef}
            className="relative overflow-x-auto cursor-grab no-scrollbar z-10"
            style={{
              WebkitOverflowScrolling: 'touch',
              pointerEvents: 'auto',
            }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div className="flex gap-6 px-4 md:px-0" style={{ width: 'max-content' }}>
              {posts.map((p: any) => {
                const heroImage =
                  p.blog?.topPickImage?.node?.sourceUrl ??
                  p.featuredImage?.node?.sourceUrl ??
                  null;

                const plainExcerpt = p.excerpt
                  ? p.excerpt.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
                  : '';

                const authorIcon =
                  p.blog?.authorIcon?.node?.sourceUrl ??
                  p.author?.node?.avatar?.url ??
                  null;

                const authorName = p.author?.node?.name ?? '';

                return (
                  <div key={p.id} className="blog-slide flex-none relative">
                    <Link
                      href={`/blog/${p.slug}`}
                      className="relative block"
                      onClick={(e) => {
                        // If user was dragging, don't treat as a click
                        if (dragDistance.current > 5) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <article
                        className="bg-transparent border-0 shadow-none relative w-[90vw] max-w-[979px] md:w-[979px] flex-shrink-0 origin-top-left scale-[0.6] md:scale-100"
                        style={{ height: '464px' }}
                      >
                        {/* Right side - White container */}
                        <div
                          className="absolute w-[641px] h-[396px] bg-white rounded-xl shadow-sm z-0 flex items-start"
                          style={{ left: '280px', top: '0px' }}
                        >
                          <div
                            className="w-[423px] h-[261px] p-6 flex flex-col justify-between"
                            style={{ marginTop: '68px', marginLeft: '143px' }}
                          >
                            <div className="flex-1 flex flex-col">
                              <p className="text-blue-600 text-sm font-medium mb-3">
                                {p.tags?.nodes?.[0]?.name || 'Explore Our Top 10 Picks'}
                              </p>

                              <h3
                                className="text-xl font-bold text-gray-900 mb-3 line-clamp-2"
                                style={{ opacity: 1 }}
                              >
                                {p.title}
                              </h3>

                              <p
                                className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-1"
                                style={{ opacity: 1 }}
                              >
                                {plainExcerpt}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 mt-auto">
                              <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden ring-1 ring-rose-100 bg-rose-50 flex items-center justify-center flex-shrink-0">
                                {authorIcon ? (
                                  <Image
                                    src={authorIcon}
                                    alt={authorName}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="text-rose-500 text-[10px] md:text-xs font-semibold">
                                    {authorName
                                      .split(/\s+/)
                                      .filter(Boolean)
                                      .slice(0, 2)
                                      .map((part: string) => part[0]?.toUpperCase())
                                      .join('') || '?'}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs md:text-sm font-semibold text-gray-900">
                                  {authorName}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Left side - Image */}
                        <div
                          className="absolute left-0 w-[423px] h-[261px] bg-blue-100 flex-shrink-0 rounded-xl overflow-hidden z-20"
                          style={{ top: '68px' }}
                        >
                          {heroImage ? (
                            <FallbackImg
                              src={heroImage}
                              fallback="https://via.placeholder.com/423x261?text=No+Image"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-300 text-sm">No Image</span>
                            </div>
                          )}
                        </div>
                      </article>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrow controls row */}
          <div className="mt-2 flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                aria-label="Previous blog"
                onClick={goToPrevious}
                className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <ChevronLeft className="w-4 h-4 text-gray-700" />
              </button>

              <div className="flex items-center gap-3">
                {posts.slice(0, 5).map((_, index) => {
                  const isActive =
                    posts.length <= 5
                      ? index === currentIndex
                      : index === Math.min(currentIndex, 4);

                  return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToIndex(index)}
                    className={`transition-all duration-300 ${
                      isActive
                        ? 'w-8 h-1.5 bg-blue-500 rounded-full'
                        : 'w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400'
                    }`}
                    aria-label={`Go to blog ${index + 1}`}
                  />
                  );
                })}
              </div>

              <button
                type="button"
                aria-label="Next blog"
                onClick={goToNext}
                className="bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            {/* Blue CTA button under arrows */}
            <Link
              href="/articles"
              className="mt-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
            >
              All best 10 articles
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}


