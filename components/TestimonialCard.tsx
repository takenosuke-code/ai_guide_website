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
    <div className="relative overflow-hidden rounded-3xl bg-[#14285A] shadow-2xl mx-auto w-full max-w-[1070px] min-h-[300px] md:min-h-[409px]">
      <div className="flex flex-col md:flex-row items-center gap-8 h-full px-6 md:px-12 lg:px-16 py-8 md:py-12">
        {/* Quote text */}
        <div className="flex-1 text-center md:text-left">
          <blockquote className="text-xl md:text-3xl font-semibold leading-relaxed text-white">
            "{renderHighlightedText(reviewText)}"
          </blockquote>
        </div>

        {/* Profile picture */}
        {profileImage && (
          <div className="flex-shrink-0">
            <div className="relative rounded-full overflow-hidden border-4 border-white/20 shadow-xl w-[150px] h-[150px] md:w-[213px] md:h-[213px]">
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
        <div className="absolute bottom-8 right-12 text-right text-white/80 text-sm font-medium">
          — {reviewerName}
        </div>
      )}
    </div>
  );
}

