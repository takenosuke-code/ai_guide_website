'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import FallbackImg from './FallbackImg';

export default function TopPicksCarousel({ posts }) {
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
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  const [selectedIndex, setSelectedIndex] = React.useState(centerIndex);
  const [isReady, setIsReady] = React.useState(false);
  const [dragProgress, setDragProgress] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  
  // ドラッグバー用の参照
  const barRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    // プログレスを更新
    const progress = emblaApi.scrollProgress();
    setDragProgress(progress);
  }, [emblaApi]);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progress = emblaApi.scrollProgress();
    setDragProgress(progress);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setIsReady(true);
    onSelect();
    onScroll();
    emblaApi.on('select', onSelect);
    emblaApi.on('scroll', onScroll);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('scroll', onScroll);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect, onScroll]);

  // requestAnimationFrameでスムーズに更新
  const rafIdRef = useRef<number | null>(null);
  
  const handleBarMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !emblaApi || !barRef.current) return;
    
    // 既存のRAFをキャンセル
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    rafIdRef.current = requestAnimationFrame(() => {
      if (!barRef.current) return;
      const barWidth = barRef.current.offsetWidth;
      const barLeft = barRef.current.getBoundingClientRect().left;
      const mouseX = e.clientX - barLeft;
      const newProgress = Math.max(0, Math.min(1, mouseX / barWidth));
      
      // より滑らかなスクロール位置の更新
      const targetIndex = Math.round(newProgress * (posts.length - 1));
      // scrollToの代わりに、直接スクロール位置を設定
      const scrollSnapList = emblaApi.scrollSnapList();
      const scrollSnapIndex = Math.min(targetIndex, scrollSnapList.length - 1);
      emblaApi.scrollTo(scrollSnapIndex, true); // trueで即座に移動（RAF内なので滑らか）
    });
  }, [emblaApi, posts.length]);

  const handleBarMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    document.removeEventListener('mousemove', handleBarMouseMove);
    document.removeEventListener('mouseup', handleBarMouseUp);
  }, [handleBarMouseMove]);

  const handleBarMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!emblaApi || !barRef.current) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    
    const barWidth = barRef.current.offsetWidth;
    const barLeft = barRef.current.getBoundingClientRect().left;
    const mouseX = e.clientX - barLeft;
    const newProgress = Math.max(0, Math.min(1, mouseX / barWidth));
    
    // クリック位置にスムーズに移動（RAF使用）
    requestAnimationFrame(() => {
      const targetIndex = Math.round(newProgress * (posts.length - 1));
      const scrollSnapList = emblaApi.scrollSnapList();
      const scrollSnapIndex = Math.min(targetIndex, scrollSnapList.length - 1);
      emblaApi.scrollTo(scrollSnapIndex, false); // スムーズに移動
    });
    
    document.addEventListener('mousemove', handleBarMouseMove);
    document.addEventListener('mouseup', handleBarMouseUp);
  }, [emblaApi, posts.length, handleBarMouseMove, handleBarMouseUp]);

  // タッチイベント（モバイル対応）
  const handleBarTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current || !emblaApi || !barRef.current) return;
    e.preventDefault();
    
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    
    rafIdRef.current = requestAnimationFrame(() => {
      if (!barRef.current) return;
      const barWidth = barRef.current.offsetWidth;
      const barLeft = barRef.current.getBoundingClientRect().left;
      const touchX = e.touches[0].clientX - barLeft;
      const newProgress = Math.max(0, Math.min(1, touchX / barWidth));
      
      const targetIndex = Math.round(newProgress * (posts.length - 1));
      const scrollSnapList = emblaApi.scrollSnapList();
      const scrollSnapIndex = Math.min(targetIndex, scrollSnapList.length - 1);
      emblaApi.scrollTo(scrollSnapIndex, true);
    });
  }, [emblaApi, posts.length]);

  const handleBarTouchStart = useCallback((e: React.TouchEvent) => {
    if (!emblaApi || !barRef.current) return;
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    
    requestAnimationFrame(() => {
      if (!barRef.current) return;
      const barWidth = barRef.current.offsetWidth;
      const barLeft = barRef.current.getBoundingClientRect().left;
      const touchX = e.touches[0].clientX - barLeft;
      const newProgress = Math.max(0, Math.min(1, touchX / barWidth));
      
      const targetIndex = Math.round(newProgress * (posts.length - 1));
      const scrollSnapList = emblaApi.scrollSnapList();
      const scrollSnapIndex = Math.min(targetIndex, scrollSnapList.length - 1);
      emblaApi.scrollTo(scrollSnapIndex, false);
    });
  }, [emblaApi, posts.length]);

  const handleBarTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  if (!posts?.length) return null;

  const progressPercent = dragProgress * 100;

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
                  transition: isReady && !isDragging ? 'transform 1.5s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 1.5s cubic-bezier(0.25, 0.1, 0.25, 1), width 1.5s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none', // より滑らかで長めのトランジション（ドラッグ中は無効）
                  willChange: isDragging ? 'transform, opacity' : 'auto',
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
      
      {/* ドラッグ可能なバー */}
      <div className="mt-12 flex flex-col items-center">
        <div className="w-full max-w-md px-4">
          <div
            ref={barRef}
            className="relative h-2 bg-gray-200 rounded-full cursor-grab active:cursor-grabbing select-none touch-none"
            onMouseDown={handleBarMouseDown}
            onTouchStart={handleBarTouchStart}
            onTouchMove={handleBarTouchMove}
            onTouchEnd={handleBarTouchEnd}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            {/* プログレスバー */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${progressPercent}%`,
                transition: isDragging ? 'none' : 'width 0.3s ease-out',
              }}
            />
            
            {/* ドラッグハンドル */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-blue-500 rounded-full shadow-lg transition-all duration-300 ease-out hover:scale-110"
              style={{
                left: `calc(${progressPercent}% - 12px)`,
                transition: isDragging ? 'none' : 'left 0.3s ease-out',
              }}
            />
          </div>
        </div>
        
        {/* スライドインジケーター */}
        <div className="flex gap-2 mt-4">
          {posts.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => {
                if (emblaApi) {
                  emblaApi.scrollTo(index, false);
                }
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === selectedIndex
                  ? 'w-8 bg-blue-500'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

