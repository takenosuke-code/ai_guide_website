'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import WhoIsItForLogo from './WhoIsItForLogo';

interface BulletPoint {
  title: string;
  description?: string;
}

interface AudienceCardProps {
  title: string;
  bulletPoints?: BulletPoint[];
  logo?: {
    sourceUrl: string;
    altText?: string;
  };
  whoisitforlogo?: Array<{
    node?: {
      sourceUrl: string;
      altText?: string;
    };
    sourceUrl?: string;
    altText?: string;
  }>;
  logoIndex?: number;
}

export default function AudienceCard({ title, bulletPoints = [], logo, whoisitforlogo, logoIndex = 0 }: AudienceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_VISIBLE = 5; // Show first 5 bullet points initially
  const visibleBullets = isExpanded ? bulletPoints : bulletPoints.slice(0, MAX_VISIBLE);
  const hasMore = bulletPoints.length > MAX_VISIBLE;
  const hasAnyDescriptions = bulletPoints.some(bullet => bullet.description);

  return (
    <div className="bg-white rounded-xl overflow-visible shadow-sm border border-gray-200 relative">
      <div className="bg-blue-600 h-[89px] relative flex items-end justify-center pb-0 z-10 rounded-t-xl">
        <WhoIsItForLogo whoisitforlogo={whoisitforlogo} index={logoIndex} />
      </div>
      <div className="pt-[63px] p-5 relative z-0">
        <h3 className="text-base font-bold text-center mb-4" style={{ color: '#1466F6' }}>{title}</h3>
        {bulletPoints.length > 0 ? (
          <>
            <ul className="space-y-3 text-xs text-gray-700">
              {visibleBullets.map((bullet, idx) => (
                <li key={idx} className="flex flex-col">
                  <div className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-gray-700 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span className="font-semibold text-gray-900 break-words min-w-0 flex-1">{bullet.title}</span>
                  </div>
                  {isExpanded && bullet.description && (
                    <p className="ml-3 text-gray-600 mt-1 break-words overflow-wrap-anywhere min-w-0">{bullet.description}</p>
                  )}
                </li>
              ))}
            </ul>
            {(hasMore || hasAnyDescriptions) && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-4 text-blue-600 font-semibold text-sm flex items-center gap-1 w-full justify-center hover:underline"
              >
                {isExpanded ? 'Show Less' : 'Show More'}
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500 text-xs text-center">No details available.</p>
        )}
      </div>
    </div>
  );
}