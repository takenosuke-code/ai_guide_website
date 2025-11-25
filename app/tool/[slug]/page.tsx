// ============================================================================
// FILE: app/tool/[slug]/page.tsx
// PURPOSE: Dynamic tool detail page matching reference design
// FEATURES: Overview, Key Findings, Who is it for, Tutorials, Reviews, etc.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { ChevronDown, Star, ThumbsUp, ExternalLink, Search, ChevronRight, Play, Zap, Clock } from 'lucide-react';
import { wpFetch } from '../../../lib/wpclient';
import { POST_BY_SLUG_QUERY, REVIEWS_BY_POST_ID_QUERY, RELATED_POSTS_QUERY, NAV_MENU_POSTS_QUERY, ALL_TAG_SLUGS } from '../../../lib/queries';
import { notFound } from 'next/navigation';
import PricingSection from '../../../components/PricingSection';
import Container from '../../(components)/Container';
import PrimaryHeader from '@/components/site-header/PrimaryHeader';
import { buildNavGroups, NavMenuPostNode } from '@/lib/nav-groups';
import { getSiteBranding } from '@/lib/branding';
import Image from 'next/image';
import StatCard from './StatCard';
import ReviewCard from './ReviewCard';
import ContentSection from './ContentSection';
import KeyFindingsSection from './KeyFindingsSection';
import AudienceCard from './AudienceCard';
import UserReviewsCarousel from './UserReviewsCarousel';
import RelatedPostImage from './RelatedPostImage';
import AlternativesCarousel from './AlternativesCarousel';
import TwitterEmbed from './TwitterEmbed';

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
    slug: string;
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
  };
}

const TWEET_URL_REGEX = /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[A-Za-z0-9_]+\/status\/\d+/gi;

function extractTweetUrls(content?: string | null): string[] {
  if (!content) return [];
  const matches = content.match(TWEET_URL_REGEX);
  if (!matches) return [];
  return Array.from(new Set(matches));
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
    data = await wpFetch<ToolData>(POST_BY_SLUG_QUERY, { slug }, { revalidate: 3600 });
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

  // Fetch all tags for search
  const allTagRes = await wpFetch<{ tags: { nodes: { name: string; slug: string }[] } }>(
    ALL_TAG_SLUGS,
    {},
    { revalidate: 3600 }
  );
  const allTags = allTagRes?.tags?.nodes ?? [];

  // Fetch nav menu posts for mega menu
  const navMenuRes = await wpFetch<{ posts: { nodes: NavMenuPostNode[] } }>(
    NAV_MENU_POSTS_QUERY,
    { first: 200 },
    { revalidate: 3600 }
  );
  const navGroups = buildNavGroups(navMenuRes?.posts?.nodes ?? []);
  
  // Fetch site branding
  const branding = await getSiteBranding();
  
  // Fetch reviews for this post using databaseId
  let reviewsData: ReviewsData;
  let reviews: UserReview[] = [];
  
  try {
    console.log('🔎 Fetching reviews for post ID:', post.databaseId);
    reviewsData = await wpFetch<ReviewsData>(
      REVIEWS_BY_POST_ID_QUERY, 
      { postId: post.databaseId }, 
      { revalidate: 3600 }
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

  const tweetEmbeds = extractTweetUrls(post.content).slice(0, 6);
  const legacyRelatedImages: { sourceUrl: string; altText?: string }[] = [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PrimaryHeader 
        tags={allTags} 
        navGroups={navGroups}
        siteName={branding.siteName}
        siteLogo={branding.siteLogo}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto pl-24 pr-8 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              {category}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{post.title}</span>
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

              {/* Title and Description */}
              <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">{post.title}</h1>
                    {meta?.seller && (
                      <p className="text-sm text-gray-600 mb-3">{meta.seller}</p>
                    )}
                
                {/* Visit Website Button */}
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

                {/* Overview Section */}
                <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Overview</h2>
                  {meta?.overview ? (
                    <div 
                      className="prose max-w-none text-gray-600 text-xs leading-relaxed mb-4"
                      dangerouslySetInnerHTML={{ __html: meta.overview }}
                    />
                  ) : post.excerpt ? (
                    <div 
                      className="prose max-w-none text-gray-600 text-xs leading-relaxed mb-4"
                      dangerouslySetInnerHTML={{ __html: post.excerpt }}
                    />
                  ) : (
                    <p className="text-gray-600 text-xs leading-relaxed mb-4">
                      AI assistant chatbot that delivers accurate answers, generates high-quality content, and automates various tasks.
                    </p>
                  )}

          {/* Tags */}
          {post.tags?.nodes && post.tags.nodes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
              {post.tags.nodes.slice(0, 3).map((tag, idx) => (
                <span
                  key={tag.slug}
                          className={`px-2.5 py-1 rounded text-xs font-medium ${
                          idx === 0 ? 'bg-green-100 text-green-700' :
                          idx === 1 ? 'bg-purple-100 text-purple-700' :
                          'bg-cyan-100 text-cyan-700'
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
      </main>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pl-24 pr-8 py-8 bg-gray-50">
        <div className="relative">
          {/* Left Column - Page Navigation - Absolutely positioned */}
          <div className="w-48 absolute left-0 top-0 z-10 pointer-events-none">
            <div className="sticky top-24 z-10 self-start pl-6 pr-6 py-2 bg-gray-50 pointer-events-auto">
              <nav className="space-y-1">
                <a href="#what-is" className="block text-blue-600 font-medium border-b-2 border-blue-600 pb-2 text-sm">
                  What is {post.title}
                </a>
                <a href="#key-findings" className="block text-gray-700 hover:text-blue-600 py-2 text-sm">
                  Key Findings
                </a>
                <a href="#who-is-it-for" className="block text-gray-700 hover:text-blue-600 py-2 text-sm">
                  Who is it for
                </a>
                <a href="#tutorials" className="block text-gray-700 hover:text-blue-600 py-2 text-sm">
                  Tutorials
                </a>
                <a href="#pricing" className="block text-gray-700 hover:text-blue-600 py-2 text-sm">
                  Pricing
                </a>
                <a href="#review" className="block text-gray-700 hover:text-blue-600 py-2 text-sm">
                  Review
                </a>
                <a href="#related-posts" className="block text-gray-700 hover:text-blue-600 py-2 text-sm">
                  Related Posts
                </a>
                <a href="#alternatives" className="block text-gray-700 hover:text-blue-600 py-2 text-sm">
                  Alternatives
                </a>
              </nav>
            </div>
          </div>

          {/* Center Column - Main Content - Starts after navigation with proper spacing */}
          <div className="flex items-start gap-0 pl-48">
            <div className="flex-1 min-w-0 space-y-6 pr-6">
            {/* Top Row: Video + Productivity Cards (same height) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Product Video - Left Column */}
              <div className="lg:col-span-8 relative z-0">
                {meta?.youtubeLink && (
                  <div 
                    className="w-full rounded-lg shadow-lg border border-gray-200 overflow-hidden [&_iframe]:w-full [&_iframe]:aspect-video relative z-0"
                    dangerouslySetInnerHTML={{ __html: meta.youtubeLink }}
                  />
                )}
              </div>

              {/* Productivity Cards - Right Column (matches video height) */}
              <div className="lg:col-span-4 flex">
                {(meta?.boostedProductivity || meta?.lessManualWork) && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 w-full h-full flex flex-col">
                    {meta?.boostedProductivity && (
                      <div className="mb-4 pb-4 border-b border-gray-200 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <h3 className="text-sm text-gray-900">Boosted Productivity</h3>
                        </div>
                        <p className="text-base text-gray-900">{meta.boostedProductivity}</p>
                        <button className="text-blue-600 hover:underline text-xs mt-2 flex items-center gap-1">
                          Show More <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    )}
                    
                    {meta?.lessManualWork && (
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <h3 className="text-sm text-gray-900">Less Manual Work</h3>
                    </div>
                        <p className="text-base text-gray-900">{meta.lessManualWork}</p>
                        <button className="text-blue-600 hover:underline text-xs mt-2 flex items-center gap-1">
                          Show More <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                    )}
                  </div>
                )}
                  </div>
              </div>
            
            {/* Bottom Row: What is Gemini + Product Info (aligned) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* What is ChatGPT Section - Left Column - Aligned with navigation left edge */}
              <div className="lg:col-span-8 -ml-48">
                <ContentSection
                  id="what-is"
                  title={`What is ${post.title}`}
                  content={post.content}
                />
                    </div>

              {/* Product Info Card - Right Column - Aligned with What is Gemini */}
              <div className="lg:col-span-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                  <div className="space-y-2.5 text-xs">
                    {meta?.publishedDate && (
                      <InfoRow label="Published" value={meta.publishedDate} />
                    )}
                    {meta?.latestUpdate && (
                      <InfoRow label="Latest Update" value={meta.latestUpdate} />
                    )}
                    {meta?.latestVersion && (
                      <InfoRow label="Latest Version" value={meta.latestVersion} />
                    )}
                    {meta?.productWebsite && (
                      <InfoRow label="Product Website" value={meta.seller || 'Gemini'} link={meta.productWebsite} />
                    )}
                    {meta?.seller && (
                      <InfoRow label="Seller" value={meta.seller} link={meta.productWebsite} />
                    )}
                    {meta?.discussionUrl && (
                      <InfoRow label="Discussions" value="Community" link={meta.discussionUrl} />
                    )}
                  </div>
              </div>
              </div>
            </div>

            {/* Key Findings Section - Spans full width from What is Gemini left edge to Product Info right edge */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12 -ml-48 mr-0">
                <KeyFindingsSection keyFindings={keyFindings} />
              </div>
            </div>

            {/* Who is it for Section - Same width as Key Findings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12 -ml-48 mr-0">
                <section id="who-is-it-for" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Who is it for</h2>
              <div className="grid md:grid-cols-3 gap-6">
                    {targetAudience.map((audience, idx) => (
                      <AudienceCard 
                        key={idx} 
                        title={audience.title} 
                        bulletPoints={audience.bulletPoints}
                      />
                ))}
              </div>
            </section>
              </div>
            </div>

            {/* Pricing Section - Same width as Who is it for */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12 -ml-48 mr-0">
                <PricingSection pricingModels={pricingModels} />
              </div>
            </div>

            {/* Tutorials Section - Same width as Pricing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12 -ml-48 mr-0">
                <section id="tutorials" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Tutorials</h2>
                  <div className="grid md:grid-cols-3 gap-6">
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
              </div>
            </div>

            {/* Use Case Section - Same width as other sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12 -ml-48 mr-0">
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
              </div>
              </div>

            {/* Review and Related Posts Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column - Review Section (Thinner) */}
              <div className="lg:col-span-3 -ml-48 flex">
                <section id="review" className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 w-full flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{post.title} Review</h2>
              
              {/* Rating Display */}
                {reviews.length > 0 ? (
                  <>
                      {/* Rating Card */}
                      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 flex-shrink-0">
                        <div className="text-4xl font-bold text-gray-900 mb-1">
                        {averageRating.toFixed(1)}
                      </div>
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
                    
                    {/* Rating Breakdown */}
                      <div className="space-y-1.5 mb-3 flex-shrink-0">
                      {ratingDistribution.map((dist) => (
                          <div key={dist.rating} className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-600 w-4">{dist.rating}</span>
                            <Star className="w-3 h-3 fill-gray-300 text-gray-300" />
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                              style={{ width: `${dist.percentage}%` }}
                            />
                          </div>
                            <span className="text-[10px] text-gray-500 w-6 text-right">{dist.count}</span>
                        </div>
                      ))}
                    </div>

                      <Link
                        href={`https://aitoolsite1020-vqchs.wpcomstaging.com/ai-tool-review/?tool=${post.slug}&toolName=${encodeURIComponent(post.title)}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mb-3 text-xs w-full flex-shrink-0 text-center"
                      >
                        Leave a Review
                      </Link>

                      {/* Fixed List of Reviews (4 reviews) */}
                      <div className="space-y-2 flex-1">
                        {reviews.slice(0, 4).map((review) => (
                          <ReviewCard key={review.id} review={review} variant="compact" />
                      ))}
                    </div>
                  </>
                ) : (
                    <div className="text-center py-6 flex-1 flex flex-col justify-center">
                      <p className="text-gray-500 mb-3 text-sm">No reviews yet. Be the first to review!</p>
                      <Link
                        href={`https://aitoolsite1020-vqchs.wpcomstaging.com/ai-tool-review/?tool=${post.slug}&toolName=${encodeURIComponent(post.title)}`}
                        className="inline-flex justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-xs"
                      >
                        Leave a Review
                      </Link>
                  </div>
                )}
            </section>
                </div>

              {/* Right Column - Related Posts Section (Wider) */}
              <div className="lg:col-span-9 flex">
                <section id="related-posts" className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 w-full flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex-shrink-0">Related Posts</h2>
                  {tweetEmbeds.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tweetEmbeds.map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="border border-gray-200 rounded-xl p-3 bg-gradient-to-b from-white to-blue-50"
                        >
                          <TwitterEmbed url={url} />
                        </div>
                      ))}
                    </div>
                  ) : legacyRelatedImages.length > 0 ? (
                    <div className="grid grid-cols-2 grid-rows-3 gap-1.5 flex-1">
                      {legacyRelatedImages.map((imageNode, idx) => (
                        <RelatedPostImage
                          key={imageNode.sourceUrl}
                          src={imageNode.sourceUrl}
                          alt={imageNode.altText || `Related post ${idx + 1}`}
                          postNumber={idx + 1}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No related posts available.</p>
                  )}
                </section>
              </div>
              </div>

            {/* Alternatives Section - Same width as other sections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12 -ml-48 mr-0">
                <section id="alternatives" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Alternatives</h2>
                  {relatedTools.length > 0 ? (
                    <AlternativesCarousel tools={relatedTools} />
                  ) : (
                    <p className="text-gray-500 text-sm">No alternatives found. Make sure this tool has tags assigned in WordPress.</p>
                  )}
                </section>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
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

export const revalidate = 3600;

// ============================================================================
// GENERATE STATIC PARAMS (Optional - for static generation of known tools)
// ============================================================================

export async function generateStaticParams() {
  // You can optionally pre-generate paths for known tools
  // This will be called at build time
  return [];
}