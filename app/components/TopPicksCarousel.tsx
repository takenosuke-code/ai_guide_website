'use client';

import React, { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import FallbackImg from './FallbackImg';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TopPicksCarouselProps {
  posts: any[];
}

export default function TopPicksCarousel({ posts }: TopPicksCarouselProps) {
  const centerIndex = 0; // 最新記事は配列の最初
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      slidesToScroll: 1,
      skipSnaps: false,
      startIndex: centerIndex,
      duration: 20, // より滑らかなスクロール速度（短めに）
      dragFree: false, // スナップを有効にする
      watchDrag: true, // ドラッグ中も更新を監視
    }
  );

  const [selectedIndex, setSelectedIndex] = React.useState(centerIndex);
  const [isReady, setIsReady] = React.useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setIsReady(true);
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!posts?.length) return null;

  return (
    <div className="relative w-full py-8">
      <div className="overflow-hidden" ref={emblaRef} style={{ touchAction: 'pan-y pinch-zoom' }}>
        <div className="flex gap-6" style={{ willChange: 'transform' }}>
          {posts.map((p: any, index: number) => {
            const hero =
              p.blog?.topPickImage?.node?.sourceUrl ??
              p.blog?.topPickImage?.node?.mediaItemUrl ??
              p.featuredImage?.node?.sourceUrl ??
              "";

            const authorIcon =
              p.blog?.authorIcon?.node?.sourceUrl ??
              p.blog?.authorIcon?.node?.mediaItemUrl ??
              p.author?.node?.avatar?.url ??
              "";

            const isCenter = isReady && index === selectedIndex;
            const offset = isReady ? index - selectedIndex : index - centerIndex;
            // 奥行きを削除: スケールと透明度のみで滑らかに
            const absOffset = Math.abs(offset);
            const scale = Math.max(0.8, 1 - absOffset * 0.12); // より滑らかなスケール変化
            const opacity = Math.max(0.5, 1 - absOffset * 0.25); // より滑らかな透明度変化
            const zIndex = isCenter ? 20 : Math.max(1, 15 - absOffset * 2);
            // X軸の位置調整のみ（奥行きなし）
            const translateX = offset * 40;

            return (
              <div
                key={p.id}
                className="flex-none"
                style={{
                  width: isCenter ? 'min(90%, 700px)' : 'min(65%, 550px)',
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition: isReady ? 'transform 1.5s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 1.5s cubic-bezier(0.25, 0.1, 0.25, 1), width 1.5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none', // より滑らかで長めのトランジション
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transformOrigin: 'center center',
                  contain: 'layout style paint',
                }}
              >
                <div className="rounded-2xl border bg-white shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Left: Image (topPickImage) */}
                    <div className="relative w-full md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-blue-100 to-cyan-100 flex-shrink-0">
                      <FallbackImg
                        src={hero}
                        fallback="https://via.placeholder.com/800x450?text=No+Image"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 p-6 flex flex-col">
                      {/* Category link */}
                      <div className="text-sm text-blue-600 mb-2">
                        Explore Our Top 10 Picks
                      </div>

                      {/* Title */}
                      <Link href={`/blog/${p.slug}`}>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                          {p.title}
                        </h3>
                      </Link>

                      {/* Excerpt */}
                      {p.excerpt && (
                        <div
                          className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 flex-1"
                          dangerouslySetInnerHTML={{ __html: p.excerpt }}
                        />
                      )}

                      {/* Author section - アイコンを大きく */}
                      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-2 ring-blue-100">
                          <FallbackImg
                            src={authorIcon}
                            fallback="https://via.placeholder.com/96?text=Icon"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-base">
                            {p?.author?.node?.name ?? "Author"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 下部ナビゲーションコントロール */}
      <div className="flex items-center justify-center gap-4 mt-8">
        {/* 左のナビゲーションボタン */}
        <button
          onClick={scrollPrev}
          className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        {/* ページネーションインジケーター */}
        <div className="flex gap-2 items-center">
          {posts.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => {
                if (emblaApi) {
                  emblaApi.scrollTo(index, false);
                }
              }}
              className={`transition-all duration-300 ${
                index === selectedIndex
                  ? 'w-8 h-1.5 bg-blue-500 rounded-full'
                  : 'w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* 右のナビゲーションボタン */}
        <button
          onClick={scrollNext}
          className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
    </div>
  );
}

