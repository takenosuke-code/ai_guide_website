'use client';

import { useState } from 'react';
import Link from 'next/link';
import FallbackImg from '../components/FallbackImg';

interface Article {
  id: string;
  slug: string;
  title: string;
  blog?: {
    topPickImage?: {
      node: {
        sourceUrl: string;
      };
    } | null;
  } | null;
  featuredImage?: {
    node: {
      sourceUrl: string;
    };
  } | null;
}

interface AllArticlesSectionProps {
  allArticles: Article[];
  title: string;
}

export default function AllArticlesSection({ allArticles, title }: AllArticlesSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const displayedArticles = showAll ? allArticles : allArticles.slice(0, 6);
  const hasMore = allArticles.length > 6;

  return (
    <div className="mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
        {displayedArticles.map((article) => {
          const heroImage =
            article.blog?.topPickImage?.node?.sourceUrl ??
            article.featuredImage?.node?.sourceUrl ??
            undefined;

          return (
            <Link key={article.id} href={`/blog/${article.slug}`}>
              <article 
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
                style={{ width: '325px' }}
              >
                <div className="relative" style={{ width: '325px', height: '265px' }}>
                  <FallbackImg
                    src={heroImage}
                    fallback="https://via.placeholder.com/325x265?text=No+Image"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center p-4" style={{ width: '325px', height: '117px' }}>
                  <h3 className="text-base font-bold text-gray-900 line-clamp-3">
                    {article.title}
                  </h3>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
      {hasMore && !showAll && (
        <div className="flex justify-end mt-8">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-1 font-semibold hover:opacity-80 transition-opacity"
            style={{ color: '#8C8C8C' }}
          >
            Read More →
          </button>
        </div>
      )}
    </div>
  );
}

