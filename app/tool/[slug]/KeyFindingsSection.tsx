'use client';

import { useState } from 'react';
import { ChevronDown, ThumbsUp } from 'lucide-react';

interface KeyFindingsSectionProps {
  keyFindings: string[];
}

export default function KeyFindingsSection({ keyFindings }: KeyFindingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show 10 items initially (2 rows × 5 columns)
  const MAX_VISIBLE = 10;
  const visibleFindings = isExpanded ? keyFindings : keyFindings.slice(0, MAX_VISIBLE);
  const hasMore = keyFindings.length > MAX_VISIBLE;

  if (!keyFindings || keyFindings.length === 0) {
    return (
      <section id="key-findings" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">key findings</h2>
        <p className="text-gray-500 text-sm">No key findings available.</p>
      </section>
    );
  }

  return (
    <section id="key-findings" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">key findings</h2>
      <div className="grid grid-cols-5 gap-3">
        {visibleFindings.map((finding, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow min-h-[100px]">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
              <ThumbsUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-700 text-xs text-center">{finding}</span>
          </div>
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-blue-600 font-semibold text-sm flex items-center gap-1 hover:underline"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}
    </section>
  );
}

