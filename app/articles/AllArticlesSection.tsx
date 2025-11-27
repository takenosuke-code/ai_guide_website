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
  const [displayCount, setDisplayCount] = useState(6);
  const displayedArticles = allArticles.slice(0, displayCount);
  const hasMore = allArticles.length > displayCount;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 6);
  };

  return (
    <div className="mb-12">
      <h2 className="font-bold mb-8 text-center" style={{ fontSize: '28px', lineHeight: '100%', color: '#4D545D', fontFamily: 'Inter' }}>
        {title}
      </h2>
      <div className="grid grid-cols-3 gap-6 justify-items-center">
        {displayedArticles.map((article) => {
          const heroImage =
            article.blog?.topPickImage?.node?.sourceUrl ??
            article.featuredImage?.node?.sourceUrl ??
            undefined;

          return (
            <Link key={article.id} href={`/blog/${article.slug}`}>
              <article 
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-gray-100 w-full max-w-[325px] mx-auto"
              >
                <div className="relative w-full aspect-[325/265]">
                  <FallbackImg
                    src={heroImage}
                    fallback="https://via.placeholder.com/325x265?text=No+Image"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center p-4 min-h-[117px] min-w-0">
                  <h3 className="font-bold break-words w-full" style={{ fontSize: '16px', lineHeight: '100%', color: '#4D545D', fontFamily: 'Inter', letterSpacing: '0%' }}>
                    {article.title}
                  </h3>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
      {hasMore && (
        <div className="flex justify-end mt-8">
          <button
            onClick={handleLoadMore}
            className="font-semibold hover:opacity-80 transition-opacity underline"
            style={{ color: '#8C8C8C' }}
          >
            Read More
          </button>
        </div>
      )}
    </div>
  );
}

