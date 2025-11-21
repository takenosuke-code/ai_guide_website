// ============================================================================
// FILE: app/collection/[slug]/CollectionToolCard.tsx
// PURPOSE: Collection page specific tool card component
// ============================================================================

import React from 'react';
import Link from 'next/link';

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
  toolHref,
}) => {
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm">
      <Link href={toolHref} className="block group">
        <div className="w-full aspect-[4/3] bg-sky-100 flex items-center justify-center overflow-hidden">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-sky-200" />
          )}
        </div>

        <div className="px-3 py-4 bg-white border-t">
          <h3 className="text-sm md:text-base font-semibold text-gray-900">{title}</h3>
        </div>
      </Link>
    </article>
  );
};

export default CollectionToolCard;

