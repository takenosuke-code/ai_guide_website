// ============================================================================
// FILE: app/tool/[slug]/page.tsx
// PURPOSE: Dynamic tool detail page matching reference design
// FEATURES: Overview, Key Findings, Who is it for, Tutorials, Reviews, etc.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { ChevronDown, Star, ThumbsUp, ExternalLink, Search, ChevronRight, Play, Zap, Clock } from 'lucide-react';
import { wpFetch } from '../../../lib/wpclient';
import { POST_BY_SLUG_QUERY } from '../../../lib/queries';
import { notFound } from 'next/navigation';
import PricingSection from '../../../components/PricingSection';
import Image from 'next/image';
import StatCard from './StatCard';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ToolPageProps {
  params: {
    slug: string;
  };
}

interface ToolData {
  post: {
    id: string;
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

      {/* Hero Section - Simplified */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start gap-8">
            {/* Left: Logo and Info */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <div className="w-24 h-24 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-16 h-16 border-4 border-white rounded-full"></div>
                )}
              </div>

              {/* Title and Description */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{post.title}</h1>
                <p className="text-lg text-gray-600 mb-4">OpenAI</p>
                
                {/* Visit Website Button */}
                {meta?.productWebsite && (
                  <a
                    href={meta.productWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Visit Website
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Overview Text */}
          <div className="mt-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <div 
                  className="prose prose-lg max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: post.excerpt || post.content.substring(0, 500) }}
                />
              </div>
              
              {/* Overview Image */}
              {meta?.overviewimage?.node?.sourceUrl && (
                <div className="flex-shrink-0 -mt-32 md:-mt-40 ml-8 md:ml-12">
                  <img
                    src={meta.overviewimage.node.sourceUrl}
                    alt={meta.overviewimage.node.altText || post.title}
                    className="w-[140%] max-w-none rounded-xl shadow-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {post.tags?.nodes && post.tags.nodes.length > 0 && (
            <div className="flex gap-3 mt-6">
              {post.tags.nodes.slice(0, 3).map((tag, idx) => (
                <span
                  key={tag.slug}
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    idx === 0 ? 'bg-green-100 text-green-800' :
                    idx === 1 ? 'bg-purple-100 text-purple-800' :
                    'bg-cyan-100 text-cyan-800'
                  }`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-50">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Page Navigation */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 z-10 self-start">
              <nav className="space-y-2">
                <a href="#what-is" className="block text-blue-600 font-medium border-b-2 border-blue-600 pb-2">
                  What is {post.title}
                </a>
                <a href="#key-findings" className="block text-gray-700 hover:text-blue-600 py-1">
                  Key Findings
                </a>
                <a href="#who-is-it-for" className="block text-gray-700 hover:text-blue-600 py-1">
                  Who is it for
                </a>
                <a href="#prompts" className="block text-gray-700 hover:text-blue-600 py-1">
                  Prompts
                </a>
                <a href="#tutorials" className="block text-gray-700 hover:text-blue-600 py-1">
                  Tutorials
                </a>
                <a href="#pricing" className="block text-gray-700 hover:text-blue-600 py-1">
                  Pricing
                </a>
                <a href="#review" className="block text-gray-700 hover:text-blue-600 py-1">
                  Review
                </a>
                <a href="#related-posts" className="block text-gray-700 hover:text-blue-600 py-1">
                  Related Posts
                </a>
                <a href="#alternatives" className="block text-gray-700 hover:text-blue-600 py-1">
                  Alternatives
                </a>
              </nav>
            </div>
          </div>

          {/* Center Column - Main Content */}
          <div className="lg:col-span-9 space-y-12">
            {/* What is ChatGPT Section */}
            <ContentSection
              id="what-is"
              title={`What is ${post.title}`}
              content={post.content}
            />

            {/* Video/Tutorial Section */}
            <section id="tutorials" className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Tutorials</h2>
              <div className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100 aspect-video">
                {post.featuredImage?.node?.sourceUrl ? (
                  <>
                    <img
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                      <button className="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                        <Play className="w-10 h-10 text-blue-600 ml-1" fill="currentColor" />
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
                      <Play className="w-20 h-20 text-blue-600 mx-auto mb-4" fill="currentColor" />
                      <p className="text-gray-600">Tutorial Video</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Key Findings Section */}
            <section id="key-findings" className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">key findings</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(keyFindings.length > 0 ? keyFindings : Array(10).fill('')).map((finding, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ThumbsUp className="w-5 h-5 text-white" />
                    </div>
                    {finding && i === 0 ? (
                      <span className="text-gray-700 text-sm flex-1">{finding}</span>
                    ) : (
                      <div className="bg-white rounded-lg flex-1 min-h-[60px]"></div>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Who is it for</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {targetAudience.slice(0, 3).map((audience, idx) => (
                  <AudienceCard key={idx} title={audience} />
                ))}
              </div>
            </section>

            {/* Pricing Section */}
            <PricingSection pricingModel={undefined} />

            {/* Use Cases Section - Dynamic from WordPress */}
            {/* Note: useCases field not available in WordPress ACF */}

            {/* Review Section */}
            <section id="review" className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{post.title} Review</h2>
              </div>
              
              {/* Rating Display */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl font-bold text-gray-900">4.4</div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 ${
                          star <= 4
                            ? 'fill-blue-500 text-blue-500'
                            : star === 5
                            ? 'fill-blue-200 text-blue-200'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6">32 reviews</p>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors mb-6">
                  Leave a Review
                </button>
                
                {/* Rating Breakdown */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-8">{rating}</span>
                      <Star className="w-4 h-4 fill-gray-300 text-gray-300" />
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{
                            width: `${rating === 5 ? 80 : rating === 4 ? 15 : rating === 3 ? 3 : rating === 2 ? 1 : 1}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Cards Placeholder */}
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-pink-200 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-gray-900">Reviewer {i}</p>
                        <p className="text-sm text-gray-600">United States</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">5/5</span>
                      <span className="text-sm text-gray-500 ml-2">July 15, 2025</span>
                    </div>
                    <p className="text-gray-600 text-sm">text goes here.</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Related Posts Section */}
            <section id="related-posts" className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Posts</h2>
              <div className="space-y-4">
                {/* Placeholder for embedded social media posts */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-gray-500 text-sm">Related posts will be displayed here</p>
                </div>
              </div>
            </section>

            {/* Related Posts Section - Can be added later with WordPress relationship fields */}
            {/* Alternatives Section - Can be added later with WordPress relationship fields */}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="space-y-6 flex-1 sticky top-24 self-start max-w-[240px]">
              {/* Product Info Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="space-y-3 text-sm">
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
                    <InfoRow label="Product Website" value="Gemini" link={meta.productWebsite} />
                  )}
                  {meta?.seller && (
                    <InfoRow label="Seller" value={meta.seller} link={meta.productWebsite} />
                  )}
                  {meta?.discussionUrl && (
                    <InfoRow label="Discussions" value="Gemini Community" link={meta.discussionUrl} />
                  )}
                </div>
              </div>

              {/* Boosted Productivity & Less Manual Work Cards */}
              {meta?.boostedProductivity && (
                <StatCard
                  icon={<Zap className="w-6 h-6 text-yellow-500" />}
                  title="Boosted Productivity"
                  value={meta.boostedProductivity}
                  detail={undefined}
                />
              )}

              {meta?.lessManualWork && (
                <StatCard
                  icon={<Clock className="w-6 h-6 text-gray-600" />}
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
      <h2 className="text-3xl font-bold text-gray-900 mb-6">{title}</h2>
      <div
        className="prose prose-lg max-w-none text-gray-600"
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
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
      <div className="bg-blue-600 h-32 relative flex items-center justify-center">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
          <span className="text-4xl">👤</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 text-center mb-4">{title}</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-gray-700 rounded-full mt-2 flex-shrink-0"></span>
            <span>Feature description goes here</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-gray-700 rounded-full mt-2 flex-shrink-0"></span>
            <span>Another feature description</span>
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
    <div className="flex justify-between items-start border-b border-gray-100 pb-2">
      <span className="text-gray-600">{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
          {value}
        </a>
      ) : (
        <span className="text-gray-900 font-medium">{value}</span>
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

