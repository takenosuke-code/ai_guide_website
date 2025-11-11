// ============================================================================
// FILE: app/tool/[slug]/page.tsx
// PURPOSE: Dynamic tool detail page matching reference design
// FEATURES: Overview, Key Findings, Who is it for, Tutorials, Reviews, etc.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { ChevronDown, Star, ExternalLink, Search, Zap, Clock } from 'lucide-react';
import { wpFetch } from '../../../lib/wpclient';
import { POST_BY_SLUG_QUERY, REVIEWS_BY_POST_ID_QUERY, RELATED_POSTS_QUERY } from '../../../lib/queries';
import { notFound } from 'next/navigation';
import PricingSection from '../../../components/PricingSection';
import Image from 'next/image';
import ReviewCard from './ReviewCard';
import KeyFindingsSection from './KeyFindingsSection';
import AudienceCard from './AudienceCard';
import UserReviewsCarousel from './UserReviewsCarousel';
import RelatedPostImage from './RelatedPostImage';
import AlternativesCarousel from './AlternativesCarousel';
import AuthorCard from '@/components/AuthorCard';
import RelatedArticles from '@/components/RelatedArticles';
import TableOfContents from '@/components/TableOfContents';
import { addAnchorsAndExtractHeadings } from '@/lib/toc';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ToolPageProps {
  params: {
    slug: string;
  };
}

interface UserReview {
  id: string;
  title: string;
  content: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText?: string;
    };
  };
  reviewerMeta: {
    reviewerName: string;
    reviewerCountry: string;
    starRating: number;
    reviewDate: string;
    relatedTool?: {
      nodes: Array<{
        databaseId: number;
      }>;
    } | null;
  };
}

interface ReviewsData {
  reviews: {
    nodes: UserReview[];
  };
}

interface ToolData {
  post: {
    id: string;
    databaseId: number;
    title: string;
    content: string;
    excerpt: string;
    date: string;
    featuredImage?: {
      node: {
        sourceUrl: string;
        altText?: string;
      };
    };
    aiToolMeta?: {
      logo?: {
        node: {
          sourceUrl: string;
          altText?: string;
        };
      };
      overview?: string;
      productWebsite?: string;
      youtubeLink?: string;
      publishedDate?: string;
      latestUpdate?: string;
      latestVersion?: string;
      seller?: string;
      discussionUrl?: string;
      keyFindingsRaw?: string | string[];
      whoIsItFor?: string;
      pricing?: string;
      tutorialvid?: string;
      tutorialvid1?: string;
      tutorialvid2?: string;
      relatedpost1?: {
        node: {
          sourceUrl: string;
          altText?: string;
        };
      };
      relatedpost2?: {
        node: {
          sourceUrl: string;
          altText?: string;
        };
      };
      relatedpost3?: {
        node: {
          sourceUrl: string;
          altText?: string;
        };
      };
      relatedpost4?: {
        node: {
          sourceUrl: string;
          altText?: string;
        };
      };
      relatedpost5?: {
        node: {
          sourceUrl: string;
          altText?: string;
        };
      };
      relatedpost6?: {
        node: {
          sourceUrl: string;
          altText?: string;
        };
      };
      boostedProductivity?: string;
      lessManualWork?: string;
      overviewimage?: {
        node: {
          sourceUrl: string;
          altText?: string;
        };
      };
    };
    uri: string;
    tags?: {
      nodes: Array<{
        name: string;
        slug: string;
      }>;
    };
    categories?: {
      nodes: Array<{
        name: string;
        slug: string;
      }>;
    };
    author?: {
      node?: {
        name?: string | null;
        description?: string | null;
        avatar?: {
          url?: string | null;
        } | null;
      } | null;
    };
    blog?: {
      authorBio?: string | null;
      authorIcon?: {
        node?: {
          sourceUrl?: string | null;
        } | null;
      } | null;
    } | null;
  };
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default async function ToolDetailPage({ params }: ToolPageProps) {
  const { slug } = params;

  // Fetch tool data from WordPress
  let data: ToolData;
  try {
    console.log('🔎 Fetching post with slug:', slug);
    data = await wpFetch<ToolData>(POST_BY_SLUG_QUERY, { slug }, { revalidate: 0 });
    console.log('📦 Data received:', data);
    if (!data?.post) {
      console.log('❌ No post found in data');
      notFound();
    }
    console.log('✅ Post found:', data.post.title);
  } catch (error) {
    console.error('❌ Error fetching post:', error);
    notFound();
  }

  const { post } = data;
  const normalizedTitle = post.title
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Fetch reviews for this post using databaseId
  let reviewsData: ReviewsData;
  let reviews: UserReview[] = [];
  
  try {
    console.log('🔎 Fetching reviews for post ID:', post.databaseId);
    reviewsData = await wpFetch<ReviewsData>(
      REVIEWS_BY_POST_ID_QUERY, 
      { postId: post.databaseId }, 
      { revalidate: 0 }
    );
    
    const allReviews = reviewsData?.reviews?.nodes ?? [];
    console.log(`📦 Total reviews fetched: ${allReviews.length}`);
    
    // Filter reviews that match this post's ID
    // relatedTool is a connection with nodes array
    reviews = allReviews.filter(review => {
      const relatedToolNodes = review.reviewerMeta?.relatedTool?.nodes;
      const relatedToolId = relatedToolNodes?.[0]?.databaseId;
      const matches = relatedToolId && relatedToolId === post.databaseId;
      
      if (matches) {
        console.log(`✅ Review "${review.title}" matches post ID ${post.databaseId}`);
      }
      
      return matches;
    });
    
    console.log(`📦 Filtered reviews for this post: ${reviews.length}`);
    if (reviews.length > 0) {
      console.log(`✅ First review: "${reviews[0].title}" by ${reviews[0].reviewerMeta.reviewerName}`);
    } else {
      console.log('⚠️ No reviews found for this post. Make sure "Tool Being Reviewed" is set in WordPress!');
      console.log('Debug: All reviews:', allReviews.map(r => ({ 
        title: r.title, 
        relatedToolId: r.reviewerMeta?.relatedTool?.nodes?.[0]?.databaseId,
        reviewerName: r.reviewerMeta?.reviewerName
      })));
      console.log(`Debug: Looking for post ID: ${post.databaseId}`);
    }
  } catch (error) {
    console.error('⚠️ Error fetching reviews (will show empty):', error);
    console.error('Error details:', error);
    reviews = [];
  }

  const logoUrl = post.aiToolMeta?.logo?.node?.sourceUrl ?? post.featuredImage?.node?.sourceUrl;
  const meta = post.aiToolMeta;
  const category = post.categories?.nodes?.[0]?.name ?? 'Productivity';
  const authorNode = post.author?.node ?? null;
  const authorName = authorNode?.name ?? null;
  const authorAvatarUrl =
    authorNode?.avatar?.url ??
    post.blog?.authorIcon?.node?.sourceUrl ??
    null;
  const authorBioRaw =
    authorNode?.description ??
    post.blog?.authorBio ??
    null;
  const authorBio = authorBioRaw ? authorBioRaw.trim() : null;
  console.log('[AuthorCard DEBUG]', { authorName, hasBio: !!authorBio, hasAvatar: !!authorAvatarUrl });

  const rawHtml = post?.content ?? "";
  const { html: contentHtml, headings, tree } = addAnchorsAndExtractHeadings(rawHtml);
  const tagSlugs = post.tags?.nodes?.map((t) => t.slug).filter((slug): slug is string => Boolean(slug)) ?? [];
  
  // Normalize keyFindings from keyFindingsRaw
  // Try both camelCase (GraphQL standard) and check if data exists
  const keyFindingsRawValue: string | string[] | null | undefined = (meta as any)?.keyFindingsRaw ?? (meta as any)?.keyfindingsraw;
  let keyFindings: string[] = [];
  
  // Handle null, undefined, empty string, or actual data
  if (keyFindingsRawValue && keyFindingsRawValue !== null && keyFindingsRawValue !== '') {
    // Handle string (newline-separated, comma-separated, or array formats)
    if (typeof keyFindingsRawValue === 'string') {
      // First try splitting by newlines
      const byNewlines = keyFindingsRawValue.split(/\r?\n/).filter(Boolean);
      if (byNewlines.length > 1) {
        // Data is newline-separated - use newlines
        keyFindings = byNewlines
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 12);
      } else if (byNewlines.length === 1 && byNewlines[0].includes(',')) {
        // Single line but contains commas - split by commas
        keyFindings = byNewlines[0]
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .slice(0, 12);
      } else {
        // Single item, no commas - use as is
        keyFindings = byNewlines
          .map(s => s.trim())
          .filter(Boolean)
          .slice(0, 12);
      }
    } else if (Array.isArray(keyFindingsRawValue)) {
      keyFindings = keyFindingsRawValue
        .map((item: any) => typeof item === 'string' ? item.trim() : String(item).trim())
        .filter(Boolean)
        .slice(0, 12);
    }
  }
  
  // Debug logging - check server console for these values
  console.log('[Key Findings Debug] keyFindingsRawValue:', keyFindingsRawValue);
  console.log('[Key Findings Debug] keyFindingsRawValue type:', typeof keyFindingsRawValue);
  console.log('[Key Findings Debug] keyFindingsRawValue is null?', keyFindingsRawValue === null);
  console.log('[Key Findings Debug] keyFindingsRawValue is undefined?', keyFindingsRawValue === undefined);
  console.log('[Key Findings Debug] keyFindings array:', keyFindings);
  console.log('[Key Findings Debug] keyFindings length:', keyFindings.length);
  console.log('[Key Findings Debug] Full meta object:', JSON.stringify(meta, null, 2));
  
  // Process target audience from WordPress Textarea field
  // Format: Each audience section separated by blank lines (double newline)
  // First line of each section is the title, subsequent lines are bullet points
  // Example:
  // Students
  // Summarize academic readings
  // Clarify complex theories
  // 
  // Professionals
  // Summarize academic readings
  // Clarify complex theories
  
  const parseTargetAudience = (text: string | null | undefined): Array<{ title: string; bulletPoints: string[] }> => {
    if (!text || text.trim() === '') {
      return [];
    }
    
    // Split by double newlines (blank lines) to separate different audiences
    const sections = text.split(/\n\s*\n/).filter(section => section.trim() !== '');
    
    return sections.map(section => {
      const lines = section.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
      
      if (lines.length === 0) {
        return { title: '', bulletPoints: [] };
      }
      
      // First line is the title
      const title = lines[0];
      
      // Rest are bullet points (remove leading dashes if present)
      const bulletPoints = lines.slice(1).map(line => {
        // Remove leading dash and whitespace if present
        return line.replace(/^-\s*/, '').trim();
      }).filter(bullet => bullet !== '');
      
      return { title, bulletPoints };
    }).filter(item => item.title !== ''); // Filter out empty items
  };
  
  const targetAudienceRaw = meta?.whoIsItFor;
  const parsedTargetAudience = parseTargetAudience(targetAudienceRaw);
  
  // Fallback to default if no WordPress data
  const targetAudience = parsedTargetAudience.length > 0 
    ? parsedTargetAudience
    : [
        { 
          title: 'Students', 
          bulletPoints: [
            'Summarize academic readings and journal articles',
            'Clarify complex theories or historical concepts',
            'Generate essay outlines and argument structures',
            'Proofread and polish grammar and vocabulary',
            'Practice foreign language communication'
          ]
        },
        { 
          title: 'Professionals', 
          bulletPoints: [
            'Summarize academic readings and journal articles',
            'Clarify complex theories or historical concepts',
            'Generate essay outlines and argument structures',
            'Proofread and polish grammar and vocabulary',
            'Practice foreign language communication'
          ]
        },
        { 
          title: 'Entrepreneurs', 
          bulletPoints: [
            'Summarize academic readings and journal articles',
            'Clarify complex theories or historical concepts',
            'Generate essay outlines and argument structures',
            'Proofread and polish grammar and vocabulary',
            'Practice foreign language communication'
          ]
        }
      ];
  
  console.log('[Target Audience Debug] whoIsItFor raw value:', targetAudienceRaw);
  console.log('[Target Audience Debug] parsedTargetAudience:', parsedTargetAudience);
  console.log('[Target Audience Debug] final targetAudience:', targetAudience);
  
  // Process pricing models from WordPress Textarea field
  // Format: Each pricing model section separated by blank lines (double newline)
  // First line: Pricing model name (e.g., "Free Trial")
  // Second line: Price (e.g., "$0.00")
  // Subsequent lines: Features (each line is a feature)
  // Example:
  // Free Trial
  // $0.00
  // 2 GB File Storage
  // Summary Views
  // 
  // Plus Plan
  // $10.00
  // 2 GB File Storage
  // Summary Views
  
  const parsePricingModels = (text: string | null | undefined): Array<{ name: string; price: string; features: string[] }> => {
    if (!text || text.trim() === '') {
      return [];
    }
    
    // Split by double newlines (blank lines) to separate different pricing models
    const sections = text.split(/\n\s*\n/).filter(section => section.trim() !== '');
    
    return sections.map(section => {
      const lines = section.split(/\r?\n/).map(line => line.trim()).filter(line => line !== '');
      
      if (lines.length === 0) {
        return { name: '', price: '', features: [] };
      }
      
      // First line is the pricing model name
      const name = lines[0] || '';
      
      // Second line is the price
      const price = lines[1] || '$0.00';
      
      // Rest are features (remove leading dashes if present)
      const features = lines.slice(2).map(line => {
        // Remove leading dash and whitespace if present
        return line.replace(/^-\s*/, '').trim();
      }).filter(feature => feature !== '');
      
      return { name, price, features };
    }).filter(item => item.name !== ''); // Filter out empty items
  };
  
  const pricingRaw = meta?.pricing;
  const parsedPricingModels = parsePricingModels(pricingRaw);
  
  // Fallback to default if no WordPress data
  const pricingModels = parsedPricingModels.length > 0 
    ? parsedPricingModels
    : [
        { 
          name: 'Free Trial', 
          price: '$0.00',
          features: [
            '2 GB File Storage',
            'Summary Views',
            'Backlogs',
            'Reports and Dashboards',
            'Calendar',
            'Timeline'
          ]
        },
        { 
          name: 'Plus Plan', 
          price: '$0.00',
          features: [
            '2 GB File Storage',
            'Summary Views',
            'Backlogs',
            'Reports and Dashboards',
            'Calendar',
            'Timeline'
          ]
        },
        { 
          name: 'Team Plan', 
          price: '$0.00',
          features: [
            '2 GB File Storage',
            'Summary Views',
            'Backlogs',
            'Reports and Dashboards',
            'Calendar',
            'Timeline'
          ]
        },
        { 
          name: 'Team Plan', 
          price: '$0.00',
          features: [
            '2 GB File Storage',
            'Summary Views',
            'Backlogs',
            'Reports and Dashboards',
            'Calendar',
            'Timeline'
          ]
        }
      ];
  
  console.log('[Pricing Debug] pricing raw value:', pricingRaw);
  console.log('[Pricing Debug] parsedPricingModels:', parsedPricingModels);
  console.log('[Pricing Debug] final pricingModels:', pricingModels);

  // Fetch related tools based on the first tag (like "Marketing")
  // This matches the tag shown in the overview section
  let relatedTools: any[] = [];
  try {
    const firstTag = post.tags?.nodes?.[0];
    if (firstTag) {
      const tagSlug = firstTag.slug;
      const tagName = firstTag.name;
      console.log(`🔎 Fetching related tools with tag: ${tagName} (${tagSlug})`);
      const relatedData = await wpFetch<{ posts: { nodes: any[] } }>(
        RELATED_POSTS_QUERY,
        { 
          tags: [tagSlug], // Use only the first tag (e.g., "Marketing")
          excludeId: post.id,
          first: 10
        },
        { revalidate: 3600 }
      );
      relatedTools = relatedData?.posts?.nodes || [];
      console.log(`✅ Found ${relatedTools.length} related tools with tag "${tagName}"`);
    } else {
      console.log('⚠️ No tags found for this post, cannot fetch related tools');
    }
  } catch (error) {
    console.error('⚠️ Error fetching related tools:', error);
    relatedTools = [];
  }
  
  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.reviewerMeta.starRating, 0) / reviews.length
    : 0;
  
  // Calculate rating distribution (for the bar chart)
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => Math.floor(r.reviewerMeta.starRating) === rating).length;
    return {
      rating,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-2 right-2 z-[9999] px-2 py-1 text-xs font-bold text-white bg-teal-600 rounded">
        PAGE-DEBUG /tool/[slug]
      </div>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-cyan-400 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto pl-24 pr-8 py-3">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="What AI tool do you need? ( write about 5 words)"
                  className="w-full pl-12 pr-4 py-2 rounded-full bg-white border-none outline-none text-sm"
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-6 ml-8">
              <Link href="/" className="text-white font-normal hover:opacity-90">
                Home
              </Link>
              <button className="flex items-center gap-1 text-white font-normal hover:opacity-90">
                Marketing <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 text-white font-normal hover:opacity-90">
                Business <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 text-white font-normal hover:opacity-90">
                Learner / Student <ChevronDown className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto pl-24 pr-8 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              {category}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{normalizedTitle}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        {/* Strip 1: Hero & Overview - Light Background */}
        <section className="bg-gray-50 py-6">
          <div className="max-w-6xl mx-auto pl-24 pr-8">
            {/* Main Grid: Left (Logo/Title/Overview) + Right (Image) */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1.2fr] gap-3 items-start">
              {/* Left Column: Logo, Title, Overview, Tags */}
              <div>
                {/* Logo, Title, and Visit Website Button */}
                <div className="flex items-start gap-4 mb-6">
              {/* Logo */}
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                      <div className="w-10 h-10 border-4 border-white rounded-full"></div>
                )}
              </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{normalizedTitle}</h1>
                    <p className="text-sm text-gray-600">{meta?.seller || 'OpenAI'}</p>
                  </div>
                  {meta?.productWebsite && (
                    <a
                      href={meta.productWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-xs"
                    >
                      Visit Website
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Overview</h2>
                  {meta?.overview ? (
                    <div
                      className="prose max-w-none text-gray-600 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: meta.overview }}
                    />
                  ) : post.excerpt ? (
                    <div
                      className="prose max-w-none text-gray-600 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: post.excerpt }}
                    />
                  ) : (
                    <p className="text-gray-600 text-xs leading-relaxed">
                      AI assistant chatbot that delivers accurate answers, generates high-quality content, and automates various tasks.
                    </p>
                  )}
                </div>
                {post.tags?.nodes && post.tags.nodes.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.nodes.slice(0, 3).map((tag, idx) => (
                      <span
                        key={tag.slug}
                        className={`px-2.5 py-1 rounded text-xs font-medium ${
                          idx === 0
                            ? 'bg-green-100 text-green-700'
                            : idx === 1
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-cyan-100 text-cyan-700'
                        }`}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
              {/* Right Column: Product Image (spans full height) */}
              <div>
                {(meta?.overviewimage?.node?.sourceUrl || post.featuredImage?.node?.sourceUrl) ? (
                  <Image
                    src={meta?.overviewimage?.node?.sourceUrl || post.featuredImage?.node?.sourceUrl || ''}
                    alt={meta?.overviewimage?.node?.altText || post.featuredImage?.node?.altText || post.title}
                    width={500}
                    height={400}
                    className="w-full rounded-lg shadow-lg border border-gray-200 object-cover"
                  />
                ) : (
                  <div className="w-full h-[350px] rounded-lg shadow-lg border border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-7xl mb-4">🤖</div>
                      <p className="text-gray-500 text-sm">AI Tool</p>
                    </div>
              </div>
            )}
          </div>
            </div>
          </div>
        </section>

        {/* Strip 2: Reviews & Content - White Background */}
        <section className="bg-white py-6">
          <div className="max-w-6xl mx-auto pl-24 pr-8">
            {/* User Reviews */}
          {reviews.length > 0 && (
                    <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">User Reviews</h2>
              <UserReviewsCarousel reviews={reviews} />
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-8 bg-gray-50">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <nav className="space-y-2 text-sm text-gray-600">
                <a href="#what-is" className="block hover:text-blue-600">What is {normalizedTitle}</a>
                <a href="#key-findings" className="block hover:text-blue-600">Key Findings</a>
                <a href="#who-is-it-for" className="block hover:text-blue-600">Who is it for</a>
                <a href="#tutorials" className="block hover:text-blue-600">Tutorials</a>
                <a href="#pricing" className="block hover:text-blue-600">Pricing</a>
                <a href="#review" className="block hover:text-blue-600">Review</a>
                <a href="#alternatives" className="block hover:text-blue-600">Alternatives</a>
              </nav>
            </div>
          </aside>

          <div className="space-y-8">
            {reviews.length > 0 && (
              <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">User Reviews</h2>
                <UserReviewsCarousel reviews={reviews} />
              </section>
            )}

            <section id="overview" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                {meta?.youtubeLink ? (
                  <div
                    className="w-full rounded-lg shadow-lg border border-gray-200 overflow-hidden [&_iframe]:w-full [&_iframe]:aspect-video"
                    dangerouslySetInnerHTML={{ __html: meta.youtubeLink }}
                  />
                ) : (
                  (meta?.overviewimage?.node?.sourceUrl || post.featuredImage?.node?.sourceUrl) && (
                    <Image
                      src={meta?.overviewimage?.node?.sourceUrl || post.featuredImage?.node?.sourceUrl || ''}
                      alt={meta?.overviewimage?.node?.altText || post.featuredImage?.node?.altText || post.title}
                      width={960}
                      height={540}
                      className="w-full rounded-lg shadow-lg border border-gray-200 object-cover"
                    />
                  )
                )}
              </div>
              {(meta?.boostedProductivity || meta?.lessManualWork) && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 h-full flex flex-col gap-4">
                  {meta?.boostedProductivity && (
                    <div className="flex-1 border-b border-gray-200 pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <h3 className="text-sm text-gray-900">Boosted Productivity</h3>
                      </div>
                      <p className="text-base text-gray-900">{meta.boostedProductivity}</p>
                    </div>
                  )}
                  {meta?.lessManualWork && (
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <h3 className="text-sm text-gray-900">Less Manual Work</h3>
                      </div>
                      <p className="text-base text-gray-900">{meta.lessManualWork}</p>
                    </div>
                  )}
                </div>
              )}
            </section>

            <section id="what-is" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{`What is ${normalizedTitle}`}</h2>
                  <article
                    className="prose max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                  />
                </div>
                {headings.length > 0 && (
                  <div className="hidden lg:block">
                    <TableOfContents headings={headings} tree={tree} />
                  </div>
                )}
              </div>
              {headings.length > 0 && (
                <div className="mt-6 lg:hidden">
                  <TableOfContents headings={headings} tree={tree} />
                </div>
              )}
            </section>

            <section id="key-findings" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <KeyFindingsSection keyFindings={keyFindings} />
            </section>

            <section id="who-is-it-for" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Who is it for</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {targetAudience.map((audience, idx) => (
                  <AudienceCard
                    key={idx}
                    title={audience.title}
                    bulletPoints={audience.bulletPoints}
                  />
                ))}
              </div>
            </section>

            <section id="pricing" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <PricingSection pricingModels={pricingModels} />
            </section>

            <section id="tutorials" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tutorials</h2>
              <div className="grid gap-6 md:grid-cols-3">
                {meta?.tutorialvid && (
                  <div
                    className="w-full rounded-lg shadow-lg border border-gray-200 overflow-hidden [&_iframe]:w-full [&_iframe]:aspect-video"
                    dangerouslySetInnerHTML={{ __html: meta.tutorialvid }}
                  />
                )}
                {meta?.tutorialvid1 && (
                  <div
                    className="w-full rounded-lg shadow-lg border border-gray-200 overflow-hidden [&_iframe]:w-full [&_iframe]:aspect-video"
                    dangerouslySetInnerHTML={{ __html: meta.tutorialvid1 }}
                  />
                )}
                {meta?.tutorialvid2 && (
                  <div
                    className="w-full rounded-lg shadow-lg border border-gray-200 overflow-hidden [&_iframe]:w-full [&_iframe]:aspect-video"
                    dangerouslySetInnerHTML={{ __html: meta.tutorialvid2 }}
                  />
                )}
              </div>
            </section>

            <section id="use-case" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Use Case</h2>
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">1. The Power of Clear Communication</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  ChatGPT's effectiveness depends less on its hidden algorithms and more on how precisely users communicate with it. A prompt is not merely a question, it's a structured instruction defining context, role, and outcome. When your message is clear and intentional, the model delivers answers that are more accurate, coherent, and contextually relevant.
                </p>
                <button className="text-blue-600 font-semibold text-sm flex items-center gap-1">
                  Show More <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </section>

            <section id="review" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{normalizedTitle} Review</h2>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    <>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="text-4xl font-bold text-gray-900 mb-1">{averageRating.toFixed(1)}</div>
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(averageRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 text-xs">
                          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {ratingDistribution.map((dist) => (
                          <div key={dist.rating} className="flex items-center gap-2">
                            <span className="text-xs text-gray-600 w-4">{dist.rating}</span>
                            <Star className="w-3 h-3 fill-gray-300 text-gray-300" />
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600" style={{ width: `${dist.percentage}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-500 w-6 text-right">{dist.count}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {reviews.slice(0, 4).map((review) => (
                          <ReviewCard key={review.id} review={review} variant="compact" />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500 mb-3 text-sm">No reviews yet. Be the first to review!</p>
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-xs">
                        Leave a Review
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Posts</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {meta?.relatedpost1?.node && (
                      <RelatedPostImage
                        src={meta.relatedpost1.node.sourceUrl}
                        alt={meta.relatedpost1.node.altText || 'Related post 1'}
                        postNumber={1}
                      />
                    )}
                    {meta?.relatedpost2?.node && (
                      <RelatedPostImage
                        src={meta.relatedpost2.node.sourceUrl}
                        alt={meta.relatedpost2.node.altText || 'Related post 2'}
                        postNumber={2}
                      />
                    )}
                    {meta?.relatedpost3?.node && (
                      <RelatedPostImage
                        src={meta.relatedpost3.node.sourceUrl}
                        alt={meta.relatedpost3.node.altText || 'Related post 3'}
                        postNumber={3}
                      />
                    )}
                    {meta?.relatedpost4?.node && (
                      <RelatedPostImage
                        src={meta.relatedpost4.node.sourceUrl}
                        alt={meta.relatedpost4.node.altText || 'Related post 4'}
                        postNumber={4}
                      />
                    )}
                    {meta?.relatedpost5?.node && (
                      <RelatedPostImage
                        src={meta.relatedpost5.node.sourceUrl}
                        alt={meta.relatedpost5.node.altText || 'Related post 5'}
                        postNumber={5}
                      />
                    )}
                    {meta?.relatedpost6?.node && (
                      <RelatedPostImage
                        src={meta.relatedpost6.node.sourceUrl}
                        alt={meta.relatedpost6.node.altText || 'Related post 6'}
                        postNumber={6}
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section id="alternatives" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Alternatives</h2>
              {relatedTools.length > 0 ? (
                <AlternativesCarousel tools={relatedTools} />
              ) : (
                <p className="text-gray-500 text-sm">
                  No alternatives found. Make sure this tool has tags assigned in WordPress.
                </p>
              )}
            </section>

            {(authorName || authorBio) && (
              <AuthorCard name={authorName} description={authorBio} avatarUrl={authorAvatarUrl} />
            )}

            {tagSlugs.length > 0 && (
              <RelatedArticles currentId={post.id} tagSlugs={tagSlugs} />
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 self-start">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Details</h3>
              <div className="space-y-2.5 text-xs">
                {meta?.publishedDate && <InfoRow label="Published" value={meta.publishedDate} />}
                {meta?.latestUpdate && <InfoRow label="Latest Update" value={meta.latestUpdate} />}
                {meta?.latestVersion && <InfoRow label="Latest Version" value={meta.latestVersion} />}
                {meta?.productWebsite && <InfoRow label="Product Website" value={meta.seller || 'Website'} link={meta.productWebsite} />}
                {meta?.seller && <InfoRow label="Seller" value={meta.seller} />}
                {meta?.discussionUrl && <InfoRow label="Discussions" value="Community" link={meta.discussionUrl} />}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  </div>
);
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function TabLink({ href, children, active = false }: { href: string; children: React.ReactNode; active?: boolean }) {
  return (
    <a
      href={href}
      className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      }`}
    >
      {children}
    </a>
  );
}


function InfoRow({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
      <span className="text-gray-600 text-xs">{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium text-xs">
          {value}
        </a>
      ) : (
        <span className="text-gray-900 font-medium text-xs">{value}</span>
      )}
    </div>
  );
}

// ============================================================================
// ISR CONFIGURATION
// ============================================================================

export const revalidate = 0;

// ============================================================================
// GENERATE STATIC PARAMS (Optional - for static generation of known tools)
// ============================================================================

export async function generateStaticParams() {
  // You can optionally pre-generate paths for known tools
  // This will be called at build time
  return [];
}

