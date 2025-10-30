import React from 'react';
import Link from 'next/link';

interface Badge {
  name: string;
  slug: string;
}

interface AIToolCardProps {
  id: string;
  slug?: string;
  name?: string;
  title?: string;
  logoUrl?: string | null;
  featuredImageUrl?: string | null;
  excerpt?: string;
  tags?: { name: string; slug: string }[];
  fallbackBadge?: Badge;
  excludeTagSlugs?: string[];
  ctaHref: string;
  className?: string;
}

const BASIC_TASKS_BADGE_CLASS = 'bg-orange-100 text-orange-700 border border-orange-200 rounded-md inline-flex items-center justify-center h-6 px-2.5 text-xs font-semibold leading-none';

const AIToolCard: React.FC<AIToolCardProps> = ({
  id,
  slug,
  name,
  title,
  logoUrl,
  featuredImageUrl,
  excerpt,
  tags = [],
  fallbackBadge,
  excludeTagSlugs = [],
  ctaHref,
  className = '',
}) => {
  // Filter out any excludeTagSlugs if specified
  let showTags = tags.filter(b => !excludeTagSlugs.includes(b.slug));
  if (showTags.length === 0 && fallbackBadge) showTags = [fallbackBadge];

  return (
    <article
      key={id}
      className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden ${className}`}
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-900" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {title || name}
            </h3>

            <div className="flex flex-wrap gap-1.5 mt-1 min-h-[1.5rem]">
              {showTags.map((badge) => (
                <span key={badge.slug} className={BASIC_TASKS_BADGE_CLASS}>
                  {badge.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Excerpt (HTML-safe) before image, under title+badges */}
        {excerpt && (
          <div
            className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-2"
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        )}
      </div>
      {/* Thumbnail image */}
      <div className="px-6 py-4">
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl h-32 flex items-center justify-center overflow-hidden">
          {featuredImageUrl ? (
            <img
              src={featuredImageUrl}
              alt="featured"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-24 h-16 bg-blue-400 rounded shadow-lg" />
          )}
        </div>
      </div>
      {/* CTA */}
      <div className="px-6 pb-6">
        <Link href={ctaHref} className="text-sm font-medium underline underline-offset-4">
          Full Review
        </Link>
      </div>
    </article>
  );
};

export default AIToolCard;
