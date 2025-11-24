import React from 'react';
import Link from 'next/link';
import { Check, User } from 'lucide-react';
import CardLinkOverlay from './CardLinkOverlay';

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
  variant?: 'default' | 'compact';
}

const DEFAULT_BADGE_CLASS = 'bg-orange-100 text-orange-700 border border-orange-200';
const TAG_COLOR_CLASSES: Record<string, string> = {
  marketing: 'bg-pink-100 text-pink-700 border border-pink-200',
  coder: 'bg-blue-100 text-blue-700 border border-blue-200',
  student: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  seo: 'bg-purple-100 text-purple-700 border border-purple-200',
  'built-in-ide': 'bg-sky-100 text-sky-700 border border-sky-200',
  automation: 'bg-amber-100 text-amber-700 border border-amber-200',
  consultant: 'bg-rose-100 text-rose-700 border border-rose-200',
  saas: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
};

const getBadgeClass = (slug: string | undefined) => {
  if (!slug) return DEFAULT_BADGE_CLASS;
  const safeSlug = slug.toLowerCase();
  return TAG_COLOR_CLASSES[safeSlug] ?? DEFAULT_BADGE_CLASS;
};

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
  variant = 'default',
}) => {
  // Filter out any excludeTagSlugs if specified
  let showTags = tags.filter(b => !excludeTagSlugs.includes(b.slug));
  if (showTags.length === 0 && fallbackBadge) showTags = [fallbackBadge];

  const hasKeyFindings = keyFindings && keyFindings.length > 0;
  const hasTags = tags && tags.length > 0;
  const paddingClass = variant === 'compact' ? 'p-4' : 'p-6';
  const headingClass = variant === 'compact' ? 'text-lg' : 'text-xl';
  const imageHeightClass = variant === 'compact' ? 'h-36' : 'h-48';
  const keyFindingFont = variant === 'compact' ? 'text-xs' : 'text-sm';
  const iconSizeClass = variant === 'compact' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const userIconClass = variant === 'compact' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const sectionGap = variant === 'compact' ? 'gap-4' : 'gap-6';

  return (
    <article
      key={id}
      className={`relative isolate group rounded-2xl border border-gray-200 bg-white shadow-lg transition-shadow hover:shadow-xl ${className}`}
    >
      <CardLinkOverlay href={ctaHref} ariaLabel={title || name || 'View AI tool'} />

      <div className={`relative z-20 ${paddingClass} border-b border-gray-100 pointer-events-none`}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-900" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`${headingClass} font-bold text-gray-900 mb-1 group-hover:underline underline-offset-4`}>
              {title || name}
            </h3>

            <div className="flex flex-wrap gap-1.5 mt-1 min-h-[1.5rem]">
              {showTags.map((badge) => (
                <span
                  key={badge.slug}
                  className={`${getBadgeClass(badge.slug)} rounded-md inline-flex items-center justify-center h-6 px-2.5 text-xs font-semibold leading-none`}
                >
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
      {/* Screenshot image with 3D effect */}
      <div className={`relative z-20 ${variant === 'compact' ? 'px-4 py-3' : 'px-6 py-4'} pointer-events-none`}>
        <div 
          className={`bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl ${imageHeightClass} flex items-center justify-center overflow-hidden shadow-md`}
          style={{ transform: 'perspective(1000px) rotateX(2deg) rotateY(-2deg)', transformStyle: 'preserve-3d' }}
        >
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

      {/* Key Findings & Who is it for? block - 2 columns */}
      {(hasKeyFindings || hasTags) && (
        <div className={`relative z-20 ${variant === 'compact' ? 'px-4 pt-3 pb-3' : 'px-6 pt-4 pb-4'} pointer-events-none`}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${sectionGap}`}>
            {/* Key Findings */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Findings</h4>
              {hasKeyFindings ? (
                <ul className="space-y-1">
                  {keyFindings!.map((k, i) => (
                    <li key={i} className={`flex items-start gap-2 ${keyFindingFont} text-gray-700`}>
                      <Check className={`${iconSizeClass} mt-0.5 text-green-600 flex-shrink-0`} aria-hidden="true" />
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
                <div className="flex flex-col gap-1.5">
                  {tags!.map(t => (
                    <div
                      key={t.slug}
                      className={`inline-flex items-center gap-1.5 ${keyFindingFont} text-gray-700`}
                      title={t.name}
                    >
                      <User className={`${userIconClass} text-blue-400 flex-shrink-0`} aria-hidden="true" />
                      <span>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer: Full Review Link */}
      <div className={`relative z-20 ${variant === 'compact' ? 'px-4 pb-4 pt-3' : 'px-6 pb-6 pt-4'} border-t border-gray-100 pointer-events-none`}>
        <Link
          href={ctaHref}
          className="pointer-events-auto relative z-[70] inline-flex text-sm font-medium text-gray-600 underline underline-offset-4 hover:text-gray-900 transition-colors"
        >
          Full Review
        </Link>
      </div>
    </article>
  );
};

export default AIToolCard;
