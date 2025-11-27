import React from 'react';
import Link from 'next/link';
import { Check, User } from 'lucide-react';
import CardLinkOverlay from './CardLinkOverlay';
import { getRelativeTime } from '@/lib/relativeTime';

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
  latestVersion?: string | null;
  latestUpdate?: string | null;
  pricing?: string | null;
  whoIsItFor?: string | null;
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
  latestVersion,
  latestUpdate,
  pricing,
  whoIsItFor,
}) => {
  // Filter out any excludeTagSlugs if specified
  let showTags = tags.filter(b => !excludeTagSlugs.includes(b.slug));
  if (showTags.length === 0 && fallbackBadge) showTags = [fallbackBadge];
  
  // Limit tags to prevent overflow/cutoff (4 for default, 3 for compact)
  const maxTags = variant === 'compact' ? 3 : 4;
  showTags = showTags.slice(0, maxTags);

  // Parse pricing to extract Free and Paid information
  const parsePricing = (pricingText: string | null | undefined): string => {
    console.log('[PRICING DEBUG]:', { 
      toolName: title || name, 
      hasPricing: !!pricingText,
      pricingLength: pricingText?.length || 0,
      rawPricing: pricingText 
    });
    
    if (!pricingText || pricingText.trim() === '') {
      console.log('[PRICING EMPTY]:', { toolName: title || name });
      return '';
    }
    
    const sections = pricingText.split(/\n\s*\n/).filter(section => section.trim() !== '');
    console.log('[PRICING SECTIONS]:', { toolName: title || name, sections });
    
    const pricingInfo: string[] = [];
    let hasFree = false;
    let hasPaid = false;
    let lowestPaidPrice = '';
    
    sections.forEach((section, idx) => {
      const lines = section.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
      if (lines.length >= 2) {
        const name = lines[0] || '';
        const price = lines[1] || '';
        
        const nameLower = name.toLowerCase();
        const priceLower = price.toLowerCase();
        
        console.log('[PRICING PARSE]:', { 
          toolName: title || name,
          sectionIdx: idx,
          planName: name,
          price: price,
          nameLower,
          priceLower
        });
        
        // Check for free plans
        if (nameLower.includes('free') || 
            price === '$0' || 
            price === '$0.00' || 
            priceLower.includes('free')) {
          hasFree = true;
          console.log('[PRICING FOUND FREE]:', { toolName: title || name, planName: name });
        } 
        // Check for paid plans
        else if (price && price.startsWith('$') && price !== '$0' && price !== '$0.00') {
          hasPaid = true;
          // Extract just the price part (e.g., "$20" from "$20/mo")
          const priceMatch = price.match(/\$\d+/);
          if (priceMatch && (!lowestPaidPrice || priceMatch[0] < lowestPaidPrice)) {
            lowestPaidPrice = priceMatch[0];
          }
          console.log('[PRICING FOUND PAID]:', { 
            toolName: title || name, 
            planName: name, 
            price,
            extracted: priceMatch?.[0],
            lowestSoFar: lowestPaidPrice
          });
        }
      }
    });
    
    if (hasFree) pricingInfo.push('Free');
    if (hasPaid && lowestPaidPrice) pricingInfo.push(`Paid${lowestPaidPrice}-`);
    
    console.log('[PRICING RESULT]:', { 
      toolName: title || name, 
      hasFree, 
      hasPaid, 
      lowestPaidPrice,
      display: pricingInfo.join(' / ')
    });
    
    return pricingInfo.join(' / ');
  };
  
  const pricingDisplay = parsePricing(pricing);
  
  // Parse whoIsItFor field from WordPress
  // Format: Sections separated by blank lines, first line of each section is the category
  const parseWhoIsItFor = (text: string | null | undefined): string[] => {
    if (!text || text.trim() === '') return [];
    
    console.log('[WHO IS IT FOR DEBUG]:', { 
      toolName: title || name, 
      rawText: text,
      textLength: text.length 
    });
    
    // Split by double newlines (blank lines) to get sections
    const sections = text.split(/\n\s*\n/).filter(section => section.trim() !== '');
    
    console.log('[WHO IS IT FOR SECTIONS]:', { toolName: title || name, sections });
    
    const categories: string[] = [];
    
    sections.forEach((section, idx) => {
      // Get the first line of each section
      const lines = section.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
      if (lines.length > 0) {
        let category = lines[0];
        const originalCategory = category;
        
        // Try to remove "TEST" prefix with optional numbers and whitespace
        // Match patterns like: TEST1, TEST 1, TEST2Entrepreneurs, TESTSomething
        const cleaned = category.replace(/^TEST\s*\d*/i, '').trim();
        
        // If we have content after removing TEST prefix, use it
        // Otherwise, keep the original (even if it's TEST1, TEST2, etc.)
        if (cleaned && cleaned.length > 0) {
          category = cleaned;
        }
        
        console.log('[WHO IS IT FOR PARSE]:', { 
          toolName: title || name,
          sectionIdx: idx,
          original: originalCategory, 
          cleaned: category,
          willAdd: category.length > 0 && category.length < 50
        });
        
        // Add if we have a valid category name
        if (category && category.length > 0 && category.length < 50) {
          categories.push(category);
        }
      }
    });
    
    console.log('[WHO IS IT FOR RESULT]:', { toolName: title || name, categories });
    
    // Return categories - no minimum required
    return categories;
  };
  
  // ALWAYS use whoIsItFor field if it exists and has content
  // Only fall back to tags if the field is completely empty/null
  const whoIsItForList = parseWhoIsItFor(whoIsItFor);
  const shouldUseTags = whoIsItForList.length === 0 && tags && tags.length > 0;

  const hasKeyFindings = keyFindings && keyFindings.length > 0;
  const hasTags = tags && tags.length > 0;
  const hasWhoIsItFor = whoIsItForList && whoIsItForList.length > 0;
  const showWhoSection = hasWhoIsItFor || (shouldUseTags && hasTags);
  const paddingClass = variant === 'compact' ? 'p-3' : 'p-6';
  const headingClass = variant === 'compact' ? 'text-base' : 'text-xl';
  const imageHeightClass = variant === 'compact' ? 'h-32' : 'h-48';
  const keyFindingFont = variant === 'compact' ? 'text-xs' : 'text-sm';
  const whoTextFont = variant === 'compact' ? 'text-[10px]' : 'text-xs';
  const iconSizeClass = variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4';
  const userIconClass = variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4';
  const sectionGap = variant === 'compact' ? 'gap-3' : 'gap-6';
  
  const relativeTime = getRelativeTime(latestUpdate);
  const showVersionInfo = latestVersion || relativeTime;

  return (
    <article
      key={id}
      className={`relative isolate group ${variant === 'compact' ? 'rounded-xl shadow-md hover:shadow-lg' : 'rounded-2xl shadow-lg hover:shadow-xl'} border border-gray-200 bg-white transition-shadow ${className}`}
    >
      <CardLinkOverlay href={ctaHref} ariaLabel={title || name || 'View AI tool'} />
      
      {/* Version and Release Info - Top Right */}
      {showVersionInfo && (
        <div className={`absolute top-3 right-3 z-30 text-right ${variant === 'compact' ? 'text-[10px]' : 'text-xs'} text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md pointer-events-none whitespace-nowrap`}>
          {latestVersion && relativeTime ? (
            <div className="font-medium">{latestVersion} Released {relativeTime}</div>
          ) : latestVersion ? (
            <div className="font-medium">{latestVersion}</div>
          ) : relativeTime ? (
            <div className="font-medium">Released {relativeTime}</div>
          ) : null}
        </div>
      )}

      <div className={`relative z-20 ${paddingClass} border-b border-gray-100 pointer-events-none`}>
        <div className={`flex items-start ${variant === 'compact' ? 'gap-3 mb-2' : 'gap-4 mb-4'}`}>
          <div className={`${variant === 'compact' ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl overflow-hidden bg-gray-200 flex-shrink-0`}>
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-900" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`${headingClass} font-bold text-gray-900 ${variant === 'compact' ? 'mb-0.5' : 'mb-1'} group-hover:underline underline-offset-4`}>
              {title || name}
            </h3>

            <div className={`flex flex-nowrap overflow-hidden ${variant === 'compact' ? 'gap-1 mt-0.5' : 'gap-1.5 mt-1'} ${variant === 'compact' ? 'h-5' : 'h-6'}`}>
              {showTags.map((badge) => (
                <span
                  key={badge.slug}
                  className={`${getBadgeClass(badge.slug)} rounded-md inline-flex items-center justify-center flex-shrink-0 ${variant === 'compact' ? 'h-5 px-2 text-[10px]' : 'h-6 px-2.5 text-xs'} font-semibold leading-none`}
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
            className={`text-gray-600 ${variant === 'compact' ? 'text-xs' : 'text-sm'} leading-relaxed line-clamp-2 ${variant === 'compact' ? 'mb-1' : 'mb-2'}`}
            dangerouslySetInnerHTML={{ __html: excerpt }}
          />
        )}
      </div>
      {/* Screenshot image with 3D effect */}
      <div className={`relative z-20 ${variant === 'compact' ? 'px-3 py-2' : 'px-6 py-4'} pointer-events-none`}>
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
      {(hasKeyFindings || showWhoSection) && (
        <div className={`relative z-20 ${variant === 'compact' ? 'px-3 pt-2 pb-2' : 'px-6 pt-4 pb-4'} pointer-events-none`}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${sectionGap}`}>
            {/* Key Features */}
            <div>
              <h4 className={`${variant === 'compact' ? 'text-xs' : 'text-sm'} font-semibold text-gray-900 ${variant === 'compact' ? 'mb-1' : 'mb-2'}`}>Key Features</h4>
              {hasKeyFindings ? (
                <ul className={variant === 'compact' ? 'space-y-0.5' : 'space-y-1'}>
                  {keyFindings!.map((k, i) => (
                    <li key={i} className={`flex items-start gap-1.5 ${keyFindingFont} text-gray-700`}>
                      <Check className={`${iconSizeClass} mt-0.5 text-green-600 flex-shrink-0`} aria-hidden="true" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`${variant === 'compact' ? 'text-xs' : 'text-sm'} text-gray-400 italic`}>No key features yet.</p>
              )}
            </div>

            {/* Who is it for? */}
            {showWhoSection && (
              <div>
                <h4 className={`${variant === 'compact' ? 'text-xs' : 'text-sm'} font-semibold text-gray-900 ${variant === 'compact' ? 'mb-1' : 'mb-2'}`}>Who is it for?</h4>
                <div className={`flex flex-col ${variant === 'compact' ? 'gap-0.5' : 'gap-1.5'}`}>
                  {hasWhoIsItFor ? (
                    whoIsItForList!.map((item, i) => (
                      <div
                        key={i}
                        className={`inline-flex items-center gap-1.5 ${whoTextFont} text-gray-700`}
                      >
                        <User className={`${userIconClass} text-blue-400 flex-shrink-0`} aria-hidden="true" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    tags!.map(t => (
                      <div
                        key={t.slug}
                        className={`inline-flex items-center gap-1.5 ${whoTextFont} text-gray-700`}
                        title={t.name}
                      >
                        <User className={`${userIconClass} text-blue-400 flex-shrink-0`} aria-hidden="true" />
                        <span>{t.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer: Pricing and Full Review Link */}
      <div className={`relative z-20 ${variant === 'compact' ? 'px-3 pb-3 pt-2' : 'px-6 pb-6 pt-4'} border-t border-gray-100 pointer-events-none`}>
        <div className="flex items-center justify-between">
          {pricingDisplay ? (
            <div className={`${variant === 'compact' ? 'text-xs' : 'text-sm'} font-semibold text-gray-900`}>
              {pricingDisplay}
            </div>
          ) : (
            <div></div>
          )}
          <Link
            href={ctaHref}
            className={`pointer-events-auto relative z-[70] inline-flex ${variant === 'compact' ? 'text-xs' : 'text-sm'} font-medium text-gray-600 underline underline-offset-4 hover:text-gray-900 transition-colors ml-auto`}
          >
            Full Review
          </Link>
        </div>
      </div>
    </article>
  );
};

export default AIToolCard;
