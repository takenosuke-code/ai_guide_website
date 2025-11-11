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
  variant?: 'compact' | 'default';
}

// A rough estimate: 9 lines is about 450 characters
const TRUNCATE_LENGTH = 450; 

export default function ReviewCard({ review, variant = 'default' }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if the review is long enough to be truncated
  // We strip HTML tags from content for a more accurate length check
  const plainContent = (review.content || '').replace(/<[^>]*>?/gm, '');
  const isLongReview = plainContent.length > TRUNCATE_LENGTH;

  // Compact variant styles (for Review section)
  if (variant === 'compact') {
    return (
      <div
        key={review.id}
        className="border border-gray-200 rounded-lg p-2 bg-white w-full"
      >
        <div className="flex items-center gap-1.5 mb-1">
          {review.featuredImage?.node?.sourceUrl ? (
            <Image
              src={review.featuredImage.node.sourceUrl}
              alt={review.featuredImage.node.altText || review.reviewerMeta.reviewerName}
              width={20}
              height={20}
              className="rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-medium text-[9px]">
              {review.reviewerMeta.reviewerName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-[10px] text-gray-900 leading-tight">{review.reviewerMeta.reviewerName}</p>
            <p className="text-[8px] text-gray-500 leading-tight">{review.reviewerMeta.reviewerCountry}</p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 mb-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-2 h-2 ${i < review.reviewerMeta.starRating ? 'text-yellow-400' : 'text-gray-300'}`}
              fill={i < review.reviewerMeta.starRating ? 'currentColor' : 'none'}
            />
          ))}
          <span className="text-[8px] font-medium text-gray-700 ml-0.5">
            {review.reviewerMeta.starRating.toFixed(1)} / 5.0
          </span>
        </div>

        <p className="text-[8px] text-gray-500 mb-1 leading-tight">
          Reviewed on {new Date(review.reviewerMeta.reviewDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <h3 className="font-semibold text-[10px] text-gray-900 mb-0.5 leading-tight">{review.title}</h3>

        <div
          style={{
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 'unset' : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.3',
          }}
          className="text-[9px] text-gray-700"
          dangerouslySetInnerHTML={{ __html: review.content || 'No review content available.' }}
        />

        {isLongReview && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:underline text-[8px] font-medium mt-0.5"
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </button>
        )}
      </div>
    );
  }

  // Default variant styles (for User Reviews carousel)
  return (
    <div
      key={review.id}
      className="border border-gray-200 rounded-lg p-3 bg-white w-full"
    >
      <div className="flex items-center gap-2 mb-1.5">
        {review.featuredImage?.node?.sourceUrl ? (
          <Image
            src={review.featuredImage.node.sourceUrl}
            alt={review.featuredImage.node.altText || review.reviewerMeta.reviewerName}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-medium text-[10px]">
            {review.reviewerMeta.reviewerName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-[11px] text-gray-900">{review.reviewerMeta.reviewerName}</p>
          <p className="text-[9px] text-gray-500">{review.reviewerMeta.reviewerCountry}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-2.5 h-2.5 ${i < review.reviewerMeta.starRating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill={i < review.reviewerMeta.starRating ? 'currentColor' : 'none'}
          />
        ))}
        <span className="text-[9px] font-medium text-gray-700 ml-1">
          {review.reviewerMeta.starRating.toFixed(1)} / 5.0
        </span>
      </div>

      <p className="text-[9px] text-gray-500 mb-1.5">
        Reviewed on {new Date(review.reviewerMeta.reviewDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      <h3 className="font-semibold text-[11px] text-gray-900 mb-1">{review.title}</h3>

      <div
        style={{
          display: '-webkit-box',
          WebkitLineClamp: isExpanded ? 'unset' : 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
        className="text-[10px] text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: review.content || 'No review content available.' }}
      />

      {isLongReview && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:underline text-[10px] font-medium mt-1.5"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </button>
      )}
    </div>
  );
}