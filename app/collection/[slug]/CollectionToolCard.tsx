// ============================================================================
// FILE: app/collection/[slug]/CollectionToolCard.tsx
// PURPOSE: Collection page specific tool card component
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
  slug,
  logoUrl,
  rating = 4.5,
  description,
  keyFindings = [],
  toolHref,
}) => {
  // Split key findings into 2 columns (5 items each)
  const leftColumn = keyFindings.slice(0, 5);
  const rightColumn = keyFindings.slice(5, 10);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex gap-6">
        {/* Left Panel */}
        <div className="w-64 flex-shrink-0">
          {/* Logo */}
          <div className="mb-4">
            <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-800" />
              )}
            </div>
          </div>

          {/* Tool Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.floor(rating)
                      ? 'fill-blue-500 text-blue-500'
                      : star === Math.ceil(rating) && rating % 1 !== 0
                      ? 'fill-blue-300 text-blue-300'
                      : 'fill-gray-200 text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">{rating}</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <a
              href={`${toolHref}#overview`}
              className="block px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm text-gray-700 transition-colors"
            >
              Overview
            </a>
            <a
              href={`${toolHref}#who-is-it-for`}
              className="block px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm text-gray-700 transition-colors"
            >
              Who is it for
            </a>
            <a
              href={`${toolHref}#pricing`}
              className="block px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm text-gray-700 transition-colors"
            >
              Pricing
            </a>
          </nav>
        </div>

        {/* Right Panel */}
        <div className="flex-1">
          {/* View Profile Button */}
          <div className="flex justify-end mb-4">
            <Link
              href={toolHref}
              className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              View Profile
            </Link>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
            {description ? (
              <div
                className="text-gray-600 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="text-gray-500 text-sm">Text goes here.</p>
            )}
          </div>

          {/* Key Findings */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Finding</h4>
            {keyFindings.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {/* Left Column */}
                <div className="space-y-2">
                  {leftColumn.map((finding, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {finding || 'Text goes here'}
                    </p>
                  ))}
                </div>
                {/* Right Column */}
                <div className="space-y-2">
                  {rightColumn.map((finding, i) => (
                    <p key={i} className="text-sm text-gray-600">
                      {finding || 'Text goes here'}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <p key={i} className="text-sm text-gray-500">Text goes here</p>
                  ))}
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <p key={i} className="text-sm text-gray-500">Text goes here</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionToolCard;

