'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface RelatedPostImageProps {
  src: string;
  alt: string;
  postNumber: number;
}

export default function RelatedPostImage({ src, alt, postNumber }: RelatedPostImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get container dimensions (what the code allocates)
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      console.log(`Related Post ${postNumber} - CONTAINER (Code Allocates):`);
      console.log(`  Width: ${Math.round(rect.width)}px`);
      console.log(`  Height: ${Math.round(rect.height)}px`);
      console.log(`  Aspect Ratio: ${(rect.width / rect.height).toFixed(2)}`);
    }

    // Get image dimensions (what you uploaded)
    const img = new window.Image();
    img.onload = () => {
      console.log(`Related Post ${postNumber} - IMAGE (Your Upload):`);
      console.log(`  Width: ${img.naturalWidth}px`);
      console.log(`  Height: ${img.naturalHeight}px`);
      console.log(`  Aspect Ratio: ${(img.naturalWidth / img.naturalHeight).toFixed(2)}`);
      console.log(`  URL: ${src}`);
      
      // Calculate if image will be cropped
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const containerRatio = rect.width / rect.height;
        const imageRatio = img.naturalWidth / img.naturalHeight;
        
        if (Math.abs(containerRatio - imageRatio) > 0.1) {
          console.log(`  ⚠️ WARNING: Image aspect ratio doesn't match container!`);
          console.log(`     Container: ${containerRatio.toFixed(2)}, Image: ${imageRatio.toFixed(2)}`);
          console.log(`     Image will be cropped with object-cover`);
        } else {
          console.log(`  ✓ Aspect ratios match - image will fit perfectly`);
        }
      }
      console.log('---');
    };
    img.src = src;
  }, [src, postNumber]);

  return (
    <div ref={containerRef} className="border border-gray-200 rounded overflow-hidden shadow-sm h-full w-full">
      <div className="w-full h-full relative">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-contain"
          sizes="50vw"
        />
      </div>
    </div>
  );
}

