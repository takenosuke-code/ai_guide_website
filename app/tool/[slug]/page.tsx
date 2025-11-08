// ============================================================================
// FILE: app/tool/[slug]/page.tsx
// PURPOSE: Dynamic tool detail page matching reference design
// FEATURES: Overview, Key Findings, Who is it for, Tutorials, Reviews, etc.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { ChevronDown, Star, ThumbsUp, ExternalLink, Search, ChevronRight, Play, Zap, Clock } from 'lucide-react';
import { wpFetch } from '../../../lib/wpclient';
import { POST_BY_SLUG_QUERY, REVIEWS_BY_POST_ID_QUERY } from '../../../lib/queries';
import { notFound } from 'next/navigation';
import PricingSection from '../../../components/PricingSection';
import Image from 'next/image';
import StatCard from './StatCard';
import ReviewCard from './ReviewCard';

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
      productWebsite?: string;
      publishedDate?: string;
      latestUpdate?: string;
      latestVersion?: string;
      seller?: string;
      discussionUrl?: string;
      keyFindingsRaw?: string;
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
  const keyFindingsRaw = meta?.keyFindingsRaw ?? "";
  const keyFindings = String(keyFindingsRaw)
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 12);
  
  const targetAudience = ['Students', 'Professionals', 'Entrepreneurs'];
  
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
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-cyan-400 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="What AI tool do you need? ( write about 5 words)"
                  className="w-full pl-12 pr-4 py-3 rounded-full bg-white border-none outline-none text-sm"
                />
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-8 ml-12">
              <Link href="/" className="text-white font-medium hover:opacity-90">
                Home
              </Link>
              <button className="flex items-center gap-1 text-white font-medium hover:opacity-90">
                Marketing <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 text-white font-medium hover:opacity-90">
                Business <ChevronDown className="w-4 h-4" />
              </button>
              <button className="flex items-center gap-1 text-white font-medium hover:opacity-90">
                Learner / Student <ChevronDown className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              {category}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Logo, Title, and Visit Website Button */}
          <div className="flex items-start gap-6 mb-8">
            {/* Logo */}
            <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={post.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-12 h-12 border-4 border-white rounded-full"></div>
              )}
            </div>

            {/* Title and Description */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{post.title}</h1>
              <p className="text-base text-gray-600 mb-4">{meta?.seller || 'OpenAI'}</p>
              
              {/* Visit Website Button */}
              {meta?.productWebsite && (
                <a
                  href={meta.productWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Visit Website
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Main 2-Column Layout: Overview + Product Image */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-8">
            {/* Left Column: Overview and Tags */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <div 
                className="prose max-w-none text-gray-600 text-sm leading-relaxed mb-6"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags?.nodes && post.tags.nodes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.nodes.slice(0, 3).map((tag, idx) => (
                    <span
                      key={tag.slug}
                      className={`px-3 py-1 rounded text-xs font-medium ${
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
            
            {/* Right Column: Product Image */}
            <div className="lg:col-span-1">
              {meta?.overviewimage?.node?.sourceUrl && (
                <Image
                  src={meta.overviewimage.node.sourceUrl}
                  alt={meta.overviewimage.node.altText || post.title}
                  width={400}
                  height={300}
                  className="w-full rounded-lg shadow-lg border border-gray-200 object-cover"
                />
              )}
            </div>
          </div>

          {/* 4-Column Review Grid */}
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reviews.slice(0, 4).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 bg-gray-50">
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Column - Page Navigation */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 z-10 self-start">
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
                <a href="#prompts" className="block text-gray-700 hover:text-blue-600 py-2 text-sm">
                  Prompts
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

          {/* Center Column - Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* What is ChatGPT Section */}
            <ContentSection
              id="what-is"
              title={`What is ${post.title}`}
              content={post.content}
            />

            {/* Tutorials Section */}
            <section id="tutorials" className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tutorials</h2>
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100 aspect-video">
                {post.featuredImage?.node?.sourceUrl ? (
                  <>
                    <img
                      src={post.featuredImage.node.sourceUrl}
                          alt={`${post.title} Tutorial ${i}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                          <button className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                            <Play className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" />
                      </button>
                    </div>
                    {/* Progress bar placeholder */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 opacity-30">
                      <div className="h-full bg-blue-600" style={{ width: '30%' }}></div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                    <div className="text-center">
                          <Play className="w-16 h-16 text-blue-600 mx-auto mb-2" fill="currentColor" />
                          <p className="text-gray-600 text-sm">Tutorial Video {i}</p>
                    </div>
                  </div>
                )}
                  </div>
                ))}
              </div>
            </section>

            {/* Key Findings Section */}
            <section id="key-findings" className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">key findings</h2>
              <div className="grid grid-cols-5 gap-3">
                {Array(10).fill('').map((_, i) => (
                  <div key={i} className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow min-h-[100px]">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                      <ThumbsUp className="w-5 h-5 text-white" />
                    </div>
                    {keyFindings[i] && (
                      <span className="text-gray-700 text-xs text-center">{keyFindings[i]}</span>
                    )}
                  </div>
                ))}
              </div>
              <button className="mt-4 text-blue-600 font-semibold text-sm flex items-center gap-1">
                Show Details <ChevronDown className="w-4 h-4" />
              </button>
            </section>

            {/* Who is it for Section */}
            <section id="who-is-it-for" className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Who is it for</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {targetAudience.slice(0, 3).map((audience, idx) => (
                  <AudienceCard key={idx} title={audience} />
                ))}
              </div>
            </section>

            {/* Pricing Section */}
            <PricingSection pricingModel={undefined} />

            {/* Use Case Section */}
            <section id="use-case" className="bg-white rounded-2xl p-8 shadow-sm">
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

            {/* Review Section */}
            <section id="review" className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{post.title} Review</h2>
              </div>
              
              {/* Rating Display */}
              <div className="mb-6">
                {reviews.length > 0 ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl font-bold text-gray-900">
                        {averageRating.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.floor(averageRating)
                                ? 'fill-blue-500 text-blue-500'
                                : star - 0.5 <= averageRating
                                ? 'fill-blue-300 text-blue-300'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                    </p>
                    <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mb-4 text-sm">
                      Leave a Review
                    </button>
                    
                    {/* Rating Breakdown */}
                    <div className="space-y-2">
                      {ratingDistribution.map((dist) => (
                        <div key={dist.rating} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-8">{dist.rating}</span>
                          <Star className="w-4 h-4 fill-gray-300 text-gray-300" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${dist.percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{dist.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No reviews yet. Be the first to review!</p>
                    <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm">
                      Leave a Review
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Related Posts Section */}
            <section id="related-posts" className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
              <div className="space-y-4">
                {/* Placeholder for embedded social media posts */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-gray-500 text-sm">Related posts will be displayed here</p>
                </div>
              </div>
            </section>

            {/* Alternatives Section */}
            <section id="alternatives" className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Alternatives</h2>
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                            {logoUrl && (
                              <img src={logoUrl} alt={post.title} className="w-full h-full object-cover rounded-xl" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">{post.title}</h3>
                            <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium mt-1">
                              Basic Tasks
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">v1.12.5 Released 1mo ago</span>
                      </div>
                      
                      <p className="text-gray-600 text-xs leading-relaxed mb-4">
                        AI-powered conversational tool that helps users with writing, problem-solving, and learning across various domains.
                      </p>
                      
                      {/* Preview Image */}
                      <div className="relative rounded-lg overflow-hidden shadow-md bg-gray-100 mb-4">
                        {post.featuredImage?.node?.sourceUrl && (
                          <img
                            src={post.featuredImage.node.sourceUrl}
                            alt={post.title}
                            className="w-full h-32 object-cover"
                          />
                        )}
                      </div>
                      
                      {/* Key Findings and Who is it for */}
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-900 mb-2">Key Findings</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 bg-green-500 rounded-sm flex-shrink-0"></div>
                              <span className="text-xs text-gray-700">copy writing</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 bg-green-500 rounded-sm flex-shrink-0"></div>
                              <span className="text-xs text-gray-700">math solving</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 bg-green-500 rounded-sm flex-shrink-0"></div>
                              <span className="text-xs text-gray-700">general conversation</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 bg-green-500 rounded-sm flex-shrink-0"></div>
                              <span className="text-xs text-gray-700">finding restaurants</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs font-semibold text-gray-900 mb-2">Who is it for?</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 bg-blue-500 rounded-sm flex-shrink-0"></div>
                              <span className="text-xs text-gray-700">Student / Learner</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 bg-blue-500 rounded-sm flex-shrink-0"></div>
                              <span className="text-xs text-gray-700">Solo Entrepreneur</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 bg-blue-500 rounded-sm flex-shrink-0"></div>
                              <span className="text-xs text-gray-700">Designer</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 bg-blue-500 rounded-sm flex-shrink-0"></div>
                              <span className="text-xs text-gray-700">Marketer</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-600">Free / Paid$25-</span>
                        <Link href={`/tool/${post.uri}`} className="text-xs text-gray-500 hover:text-blue-600 underline">
                          Full Review
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="space-y-4 flex-1 sticky top-24 self-start w-full">
              {/* Product Info Card */}
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

              {/* Boosted Productivity & Less Manual Work Cards */}
              {meta?.boostedProductivity && (
                <StatCard
                  icon={<Zap className="w-5 h-5 text-yellow-500" />}
                  title="Boosted Productivity"
                  value={meta.boostedProductivity}
                  detail={undefined}
                />
              )}

              {meta?.lessManualWork && (
                <StatCard
                  icon={<Clock className="w-5 h-5 text-gray-600" />}
                  title="Less Manual Work"
                  value={meta.lessManualWork}
                  detail={undefined}
                />
              )}
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

function ContentSection({ id, title, content }: { id: string; title: string; content: string }) {
  return (
    <section id={id} className="bg-white rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      <div
        className="prose max-w-none text-gray-600 text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <button className="mt-4 text-blue-600 font-semibold text-sm flex items-center gap-1">
        Show More <ChevronDown className="w-4 h-4" />
      </button>
    </section>
  );
}

function AudienceCard({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <div className="bg-blue-600 h-32 relative flex items-center justify-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
          <span className="text-4xl">👨‍💼</span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 text-center mb-4">{title}</h3>
        <ul className="space-y-2 text-xs text-gray-700">
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 bg-gray-700 rounded-full mt-1.5 flex-shrink-0"></span>
            <span>Summarize academic readings and journal articles</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 bg-gray-700 rounded-full mt-1.5 flex-shrink-0"></span>
            <span>Clarify complex theories or historical concepts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 bg-gray-700 rounded-full mt-1.5 flex-shrink-0"></span>
            <span>Generate essay outlines and argument structures</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 bg-gray-700 rounded-full mt-1.5 flex-shrink-0"></span>
            <span>Proofread and polish grammar and vocabulary</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 bg-gray-700 rounded-full mt-1.5 flex-shrink-0"></span>
            <span>Practice foreign language communication</span>
          </li>
        </ul>
        <button className="mt-4 text-blue-600 font-semibold text-sm flex items-center gap-1 w-full justify-center">
          Show More <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
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

