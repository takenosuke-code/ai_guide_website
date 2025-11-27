'use client';

import Image from 'next/image';

interface WhoIsItForLogoProps {
  whoisitforlogo?: Array<{
    node?: {
      sourceUrl: string;
      altText?: string;
    };
    sourceUrl?: string;
    altText?: string;
  }> | {
    node?: {
      sourceUrl: string;
      altText?: string;
    };
    sourceUrl?: string;
    altText?: string;
  };
  index: number;
}

export default function WhoIsItForLogo({ whoisitforlogo, index }: WhoIsItForLogoProps) {
  if (!whoisitforlogo) {
    return null;
  }

  // Handle both array and single image field - use the same logo for all cards
  let logoData: any = null;
  
  if (Array.isArray(whoisitforlogo)) {
    // If it's an array, use the first logo for all cards
    logoData = whoisitforlogo[0] || whoisitforlogo[index];
  } else if (typeof whoisitforlogo === 'object') {
    // If it's a single object, use it for all cards
    logoData = whoisitforlogo;
  }
  
  if (!logoData) {
    return null;
  }

  const sourceUrl = logoData.node?.sourceUrl || logoData.sourceUrl;
  const altText = logoData.node?.altText || logoData.altText;

  if (!sourceUrl) {
    return null;
  }
  
  return (
    <div className="w-[105px] h-[105px] bg-white rounded-full flex items-center justify-center absolute -bottom-[50px] left-1/2 transform -translate-x-1/2 border-4 border-white shadow-lg overflow-hidden z-20">
      <div className="w-[95px] h-[95px] flex items-center justify-center overflow-hidden rounded-full relative">
        <Image
          src={sourceUrl}
          alt={altText || 'Logo'}
          width={334}
          height={112}
          className="h-full w-auto object-contain"
          style={{ objectPosition: 'center top', maxWidth: '334px', maxHeight: '112px' }}
          priority
        />
      </div>
    </div>
  );
}

