'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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

  if (!posts?.length) return null;

  return (
    <section className="py-8 md:py-12">
      <Container>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Explore Our Blogs</h2>
        </div>

        <div className="relative" style={{ minHeight: '500px', paddingTop: '70px', paddingBottom: '40px' }}>
          {/* White background box - fixed background element */}
          <div className="absolute bg-white rounded-xl w-[50%] max-w-[550px] md:w-[550px] h-[73%] md:h-[410px] left-[35%] md:left-[300px] top-0 z-0" style={{
            pointerEvents: 'none' // Allow clicks to pass through
          }}></div>
          
          {/* Scroll container - positioned on top */}
          <div 
            ref={scrollContainerRef}
            className="relative overflow-x-auto cursor-grab no-scrollbar z-10" 
            style={{ 
              WebkitOverflowScrolling: 'touch'
            }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <div className="flex gap-6 pb-4 px-4 md:px-0" style={{ width: 'max-content' }}>
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
              const authorTagline = p.blog?.authorTagline ?? p.blog?.authorBio ?? null;

              return (
                <div key={p.id} className="flex-none relative">
                  <Link
                    href={`/blog/${p.slug}`}
                    className="relative z-10 block"
                    onClick={(e) => {
                      if (dragDistance.current > 5) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <article className="bg-transparent border-0 shadow-none flex flex-row overflow-visible w-[90vw] max-w-[846px] md:w-[846px] flex-shrink-0">
                    {/* Left side - Image (423x261) */}
                    <div className="w-[50%] md:w-[423px] aspect-[423/261] bg-blue-100 flex-shrink-0">
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

                    {/* Right side - Content (423x261) */}
                    <div className="w-[50%] md:w-[423px] md:h-[261px] aspect-[423/261] md:aspect-auto p-4 md:p-6 flex flex-col justify-between flex-shrink-0 box-border">
                      <div className="flex-1 flex flex-col">
                        {/* Category/Tag */}
                        <p className="text-blue-600 text-sm font-medium mb-3">
                          {p.tags?.nodes?.[0]?.name || 'Explore Our Top 10 Picks'}
                        </p>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2" style={{ opacity: 1 }}>
                          {p.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-1" style={{ opacity: 1 }}>
                          {plainExcerpt}
                        </p>
                      </div>

                      {/* Author Info */}
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
                  </article>
                </Link>
                </div>
              );
            })}
            </div>
          </div>
          
          {/* Button - centered on the page */}
          <div className="flex justify-center z-10 mt-16" style={{ marginTop: 'calc(4rem + 15px)' }}>
            <Link
              href="/articles"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
            >
              All best 10 articles
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
