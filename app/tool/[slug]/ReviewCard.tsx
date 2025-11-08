// app/tool/[slug]/ReviewCard.tsx
'use client'; // This is now a Client Component

import { useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';

// Define the 'review' prop type based on what page.tsx passes
interface UserReview {
  id: string;
  title: string;
  content: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText?: string;
    };
  };
  reviewerMeta: {
    reviewerName: string;
    reviewerCountry: string;
    starRating: number;
    reviewDate: string;
  };
}

interface ReviewCardProps {
  review: UserReview;
}

// A rough estimate: 9 lines is about 450 characters
const TRUNCATE_LENGTH = 450; 

export default function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if the review is long enough to be truncated
  // We strip HTML tags from content for a more accurate length check
  const plainContent = review.content.replace(/<[^>]*>?/gm, '');
  const isLongReview = plainContent.length > TRUNCATE_LENGTH;

  return (
    <div
      key={review.id}
      className="border border-gray-200 rounded-lg p-5 bg-white"
    >
      <div className="flex items-center gap-3 mb-3">
        {review.featuredImage?.node?.sourceUrl ? (
          <Image
            src={review.featuredImage.node.sourceUrl}
            alt={review.featuredImage.node.altText || review.reviewerMeta.reviewerName}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-medium">
            {review.reviewerMeta.reviewerName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm text-gray-900">{review.reviewerMeta.reviewerName}</p>
          <p className="text-xs text-gray-500">{review.reviewerMeta.reviewerCountry}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < review.reviewerMeta.starRating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill={i < review.reviewerMeta.starRating ? 'currentColor' : 'none'}
          />
        ))}
        <span className="text-xs font-medium text-gray-700 ml-1">
          {review.reviewerMeta.starRating.toFixed(1)} / 5.0
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-3">
        Reviewed on {new Date(review.reviewerMeta.reviewDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      <h3 className="font-semibold text-gray-900 mb-2">{review.title}</h3>

      {/* --- THIS IS THE UPDATED TRUNCATION LOGIC --- */}
      <div
        style={{
          display: '-webkit-box',
          WebkitLineClamp: isExpanded ? 'unset' : 9,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
        className="text-sm text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: review.content }}
      />

      {/* Show "Read More" / "Show Less" button only if the review is long */}
      {isLongReview && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:underline text-sm font-medium mt-3"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </button>
      )}
    </div>
  );
}
