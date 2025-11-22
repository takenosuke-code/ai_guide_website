// ============================================================================
// FILE: app/collection/[slug]/CollectionToolCard.tsx
// PURPOSE: Collection page specific tool card component matching image design
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface CollectionToolCardProps {
  id: string;
  title: string;
  slug: string;
  logoUrl?: string | null;
  rating?: number;
  description?: string;
  keyFindings?: string[];
  toolHref: string;
}

const CollectionToolCard: React.FC<CollectionToolCardProps> = ({
  id,
  title,
  logoUrl,
  rating = 4.5,
  description,
  keyFindings = [],
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
                className="w-5 h-5 fill-yellow-400 text-yellow-400" 
              />
            );
          } else if (star === fullStars + 1 && hasHalfStar) {
            return (
              <div key={star} className="relative w-5 h-5">
                <Star className="w-5 h-5 fill-gray-200 text-gray-200 absolute" />
                <div className="overflow-hidden w-1/2 h-full">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            );
          } else {
            return (
              <Star 
                key={star} 
                className="w-5 h-5 fill-gray-200 text-gray-200" 
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
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
      <div className="p-6">
        {/* Header: Icon, Name, Rating, Navigation */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo/Icon */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
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

          {/* Title, Rating, and Navigation */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            {renderStars(rating)}
            
            {/* Navigation Links */}
            <div className="flex gap-4 mt-3 text-sm text-gray-600">
              <Link 
                href={`${toolHref}#overview`} 
                className="hover:text-blue-600 transition-colors"
              >
                Overview
              </Link>
              <Link 
                href={`${toolHref}#who-is-it-for`} 
                className="hover:text-blue-600 transition-colors"
              >
                Who is it for
              </Link>
              <Link 
                href={`${toolHref}#pricing`} 
                className="hover:text-blue-600 transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {cleanDescription && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">
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
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Finding</h4>
            <div className="grid grid-cols-2 gap-2">
              {keyFindings.slice(0, 10).map((finding, idx) => (
                <div key={idx} className="text-sm text-gray-700">
                  {finding}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Profile Button */}
        <div className="flex justify-end mt-4">
          <Link
            href={toolHref}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            View Profile
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CollectionToolCard;
