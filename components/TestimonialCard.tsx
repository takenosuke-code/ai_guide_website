import React from 'react';
import Image from 'next/image';

interface TestimonialCardProps {
  reviewerName: string;
  reviewText: string;
  profileImage?: string | null;
  highlightWords?: string[]; // Optional array of words to highlight
}

export default function TestimonialCard({
  reviewerName,
  reviewText,
  profileImage,
  highlightWords = [],
}: TestimonialCardProps) {
  // Function to highlight specific words in the text
  const renderHighlightedText = (text: string) => {
    if (highlightWords.length === 0) {
      return text;
    }

    // Create a regex pattern for all highlight words
    const pattern = new RegExp(`\\b(${highlightWords.join('|')})\\b`, 'gi');
    const parts = text.split(pattern);

    return parts.map((part, index) => {
      const shouldHighlight = highlightWords.some(
        word => word.toLowerCase() === part.toLowerCase()
      );
      
      if (shouldHighlight) {
        return (
          <span key={index} className="text-[#60a5fa] font-semibold">
            {part}
          </span>
        );
      }
      
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#2563eb] p-8 md:p-12 shadow-2xl">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Quote text */}
        <div className="flex-1 text-center md:text-left">
          <blockquote className="text-xl md:text-3xl font-semibold leading-relaxed text-white">
            "{renderHighlightedText(reviewText)}"
          </blockquote>
        </div>

        {/* Profile picture */}
        {profileImage && (
          <div className="flex-shrink-0">
            <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
              <Image
                src={profileImage}
                alt={`${reviewerName} profile picture`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Reviewer name - optional, can be displayed below */}
      {reviewerName && (
        <div className="mt-6 text-right text-white/80 text-sm font-medium">
          — {reviewerName}
        </div>
      )}
    </div>
  );
}

