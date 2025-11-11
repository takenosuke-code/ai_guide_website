'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ContentSectionProps {
  id: string;
  title: string;
  content: string;
}

export default function ContentSection({ id, title, content }: ContentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Strip HTML tags to check content length for truncation
  const plainContent = content.replace(/<[^>]*>?/gm, '').trim();
  // Approximate threshold: ~4 lines at ~50 chars per line = 200 chars
  const hasLongContent = plainContent.length > 150;

  return (
    <section id={id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <div
        className={`text-gray-600 text-sm leading-relaxed ${
          isExpanded || !hasLongContent ? 'prose prose-sm max-w-none' : ''
        }`}
        style={
          !isExpanded && hasLongContent
            ? {
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.5rem',
                maxHeight: '6rem', // Approximately 4 lines at 1.5rem line height
              }
            : {}
        }
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {hasLongContent && (
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

