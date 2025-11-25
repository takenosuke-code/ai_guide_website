'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface ContentSectionProps {
  id: string;
  title: string;
  content: string | null;
}

export default function ContentSection({ id, title, content }: ContentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Remove unwanted "Share this" blocks that may be appended by WordPress content
  const cleanedContent = (() => {
    // Handle null or empty content
    if (!content) return '';
    
    // Only remove the specific "Share this" paragraph immediately followed by a list
    // This is narrow and won't affect normal post content
    return content.replace(
      /<p[^>]*>\s*Share this:\s*<\/p>\s*<ul[\s\S]*?<\/ul>\s*/i,
      ''
    );
  })();

  // Strip HTML tags to check content length for truncation
  const plainContent = cleanedContent.replace(/<[^>]*>?/gm, '').trim();
  // Approximate threshold: ~4 lines at ~50 chars per line = 200 chars
  const hasLongContent = plainContent.length > 150;

  // If no content, show a message
  if (!cleanedContent || plainContent.length === 0) {
    return (
      <section id={id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-500 text-sm italic">No content available yet.</p>
      </section>
    );
  }

  return (
    <section id={id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <div
        className={`text-gray-600 text-sm leading-relaxed break-words ${
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
            : {
                // Ensure long unbroken strings (like long URLs) wrap and do not overflow horizontally
                overflowX: 'hidden',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                whiteSpace: 'normal',
              }
        }
        dangerouslySetInnerHTML={{ __html: cleanedContent }}
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