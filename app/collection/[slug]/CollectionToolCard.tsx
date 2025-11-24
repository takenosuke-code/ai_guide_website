// ============================================================================
// FILE: app/collection/[slug]/CollectionToolCard.tsx
// PURPOSE: Collection page specific tool card component matching image design exactly
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface Tag {
  name: string;
  slug: string;
}

interface CollectionToolCardProps {
  id: string;
  title: string;
  slug: string;
  logoUrl?: string | null;
  rating?: number;
  description?: string;
  keyFindings?: string[];
  tags?: Tag[];
  toolHref: string;
}

const CollectionToolCard: React.FC<CollectionToolCardProps> = ({
  id,
  title,
  logoUrl,
  rating = 4.5,
  description,
  keyFindings = [],
  tags = [],
  toolHref,
}) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          if (star <= fullStars) {
            return (
              <Star 
                key={star} 
                className="w-4 h-4 fill-blue-500 text-blue-500" 
              />
            );
          } else if (star === fullStars + 1 && hasHalfStar) {
            return (
              <div key={star} className="relative w-4 h-4">
                <Star className="w-4 h-4 fill-gray-200 text-gray-200 absolute" />
                <div className="overflow-hidden w-1/2 h-full">
                  <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
                </div>
              </div>
            );
          } else {
            return (
              <Star 
                key={star} 
                className="w-4 h-4 fill-gray-200 text-gray-200" 
              />
            );
          }
        })}
        <span className="ml-1 text-sm text-gray-700">{rating}</span>
      </div>
    );
  };

  // Strip HTML from description for display
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  };

  const cleanDescription = description ? stripHtml(description) : '';

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 relative">
      {/* Tags at the top */}
      {tags && tags.length > 0 && (
        <div className="px-6 pt-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/collection/${tag.slug}`}
                className="inline-flex items-center px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-medium transition-colors border border-orange-200"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* View Profile Button - Top Right Corner */}
      <div className="absolute top-6 right-6 z-10">
        <Link
          href={toolHref}
          className="px-4 py-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors text-sm"
        >
          View Profile
        </Link>
      </div>

      <div className="p-6 pr-32">
        <div className="flex gap-6">
          {/* Left Sidebar - Logo, Title, Rating, Navigation Tabs */}
          <div className="w-48 flex-shrink-0">
            {/* Logo */}
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center mb-4">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            
            {/* Rating */}
            {renderStars(rating)}
            
            {/* Navigation Tabs - Vertical on left sidebar */}
            <div className="flex flex-col gap-2 mt-6">
              <Link 
                href={`${toolHref}#overview`} 
                className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Overview
              </Link>
              <Link 
                href={`${toolHref}#who-is-it-for`} 
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Who is it for
              </Link>
              <Link 
                href={`${toolHref}#pricing`} 
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Right Content - Description and Key Findings */}
          <div className="flex-1">
            {/* Description Section */}
            {cleanDescription && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {cleanDescription}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Share this:</span>
                  <Link 
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(toolHref)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    X
                  </Link>
                  <Link 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(toolHref)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    Facebook
                  </Link>
                </div>
              </div>
            )}

            {/* Key Findings Section */}
            {keyFindings && keyFindings.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Finding</h4>
                <div className="flex flex-wrap gap-3">
                  {keyFindings.slice(0, 10).map((finding, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      {finding}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default CollectionToolCard;
