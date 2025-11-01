import React from 'react';
import Link from 'next/link';
import { Check, User } from 'lucide-react';

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
  keyFindings?: string[] | null;
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
  keyFindings = null,
  ctaHref,
  className = '',
}) => {
  // Filter out any excludeTagSlugs if specified
  let showTags = tags.filter(b => !excludeTagSlugs.includes(b.slug));
  if (showTags.length === 0 && fallbackBadge) showTags = [fallbackBadge];

  const hasKeyFindings = keyFindings && keyFindings.length > 0;
  const hasTags = tags && tags.length > 0;

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

      {/* Key Findings & Who is it for? block */}
      {(hasKeyFindings || hasTags) && (
        <div className="px-6 pt-4 pb-4">
          <div className="space-y-4">
            {/* Key Findings */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Findings</h4>
              {hasKeyFindings ? (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {keyFindings!.map((k, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" aria-hidden="true" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No key findings yet.</p>
              )}
            </div>

            {/* Who is it for? */}
            {hasTags && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Who is it for?</h4>
                <div className="flex flex-wrap gap-2">
                  {tags!.map(t => (
                    <span
                      key={t.slug}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700"
                      title={t.name}
                    >
                      <User className="w-3.5 h-3.5 text-blue-500" aria-hidden="true" />
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
