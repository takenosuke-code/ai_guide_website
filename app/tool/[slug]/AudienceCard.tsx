'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AudienceCardProps {
  title: string;
  bulletPoints?: string[];
}

export default function AudienceCard({ title, bulletPoints = [] }: AudienceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_VISIBLE = 5; // Show first 5 bullet points initially
  const visibleBullets = isExpanded ? bulletPoints : bulletPoints.slice(0, MAX_VISIBLE);
  const hasMore = bulletPoints.length > MAX_VISIBLE;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <div className="bg-blue-600 h-32 relative flex items-center justify-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
          <span className="text-4xl">👨‍💼</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 text-center mb-4">{title}</h3>
        {bulletPoints.length > 0 ? (
          <>
            <ul className="space-y-2 text-xs text-gray-700">
              {visibleBullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-700 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            {hasMore && (
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

