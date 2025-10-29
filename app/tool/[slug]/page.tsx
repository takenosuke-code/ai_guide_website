// ============================================================================
// FILE: app/tool/[slug]/page.tsx
// PURPOSE: Dynamic tool detail page matching reference design
// FEATURES: Overview, Key Findings, Who is it for, Tutorials, Reviews, etc.
// ============================================================================

import React from 'react';
import Link from 'next/link';
import { ChevronDown, Star, ThumbsUp, ExternalLink, Search } from 'lucide-react';
import { wpFetch } from '../../../lib/wpclient';
import { POST_BY_SLUG_QUERY } from '../../../lib/queries';
import { notFound } from 'next/navigation';
import PricingSection from '../../../components/PricingSection';

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
      boostedProductivity?: string;
      lessManualWork?: string;
      keyFindings?: string[];
      targetAudience?: string[];
      pricingModel?: string;
      useCases?: string;
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
  const keyFindings = meta?.keyFindings ?? [];
  const targetAudience = meta?.targetAudience ?? ['Students', 'Professionals', 'Entrepreneurs'];

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
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-start gap-8">
            {/* Left: Logo and Info */}
            <div className="flex-1">
              <div className="flex items-start gap-6 mb-6">
                {/* Logo */}
                <div className="w-24 h-24 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 border-4 border-white rounded-full"></div>
                  )}
                </div>

                {/* Title and Description */}
                <div className="flex-1">
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

              {/* Overview Text */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                <div 
                  className="prose prose-lg max-w-none text-gray-600"
                  dangerouslySetInnerHTML={{ __html: post.excerpt || post.content.substring(0, 500) }}
                />
              </div>
            </div>

            {/* Right: Screenshot */}
            <div className="w-96 flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-200 to-purple-200 rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                {post.featuredImage?.node?.sourceUrl ? (
                  <img
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white text-lg font-semibold">Screenshot</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="bg-white border-b sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto">
            <TabLink href="#writing" active>Writing</TabLink>
            <TabLink href="#data-analytics">Data, Analytics & Research</TabLink>
            <TabLink href="#basic-tasks">Basic Tasks</TabLink>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* What is ChatGPT Section */}
            <ContentSection
              id="what-is"
              title={`What is ${post.title}`}
              content={post.content}
            />

            {/* Key Findings Section */}
            {keyFindings.length > 0 && (
              <section id="key-findings" className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">key findings</h2>
                <div className="grid grid-cols-2 gap-4">
                  {keyFindings.map((finding, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                      <ThumbsUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{finding}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

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
            <PricingSection pricingModel={meta?.pricingModel} />

            {/* Use Cases Section - Dynamic from WordPress */}
            {meta?.useCases && (
              <section id="use-case" className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Use Cases</h2>
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: meta.useCases }}
                />
              </section>
            )}

            {/* Review Section - Placeholder for future review system */}
            <section id="review" className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">{post.title} Review</h2>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                  Leave a Review
                </button>
              </div>
              <p className="text-gray-600 text-center py-8">
                Reviews coming soon. Be the first to review this tool!
              </p>
            </section>

            {/* Related Posts Section - Can be added later with WordPress relationship fields */}
            {/* Alternatives Section - Can be added later with WordPress relationship fields */}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-6">
              {/* Product Info Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Product Website</h3>
                <div className="space-y-4 text-sm">
                  {meta?.publishedDate && (
                    <InfoRow label="Published" value={meta.publishedDate} link={meta.productWebsite} />
                  )}
                  {meta?.latestUpdate && (
                    <InfoRow label="Latest Update" value={meta.latestUpdate} />
                  )}
                  {meta?.latestVersion && (
                    <InfoRow label="Latest Version" value={meta.latestVersion} />
                  )}
                  {meta?.seller && (
                    <InfoRow label="Seller" value={meta.seller} link={meta.productWebsite} />
                  )}
                  {meta?.discussionUrl && (
                    <InfoRow label="Discussions" value="Community" link={meta.discussionUrl} />
                  )}
                </div>
              </div>

              {/* Boosted Productivity Card */}
              {meta?.boostedProductivity && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">⚡Boosted Productivity</h3>
                  <p className="text-3xl font-bold text-gray-900 mb-4">{meta.boostedProductivity}</p>
                  <button className="text-blue-600 font-semibold text-sm flex items-center gap-1">
                    Show More <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Less Manual Work Card */}
              {meta?.lessManualWork && (
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">⏱Less Manual Work</h3>
                  <p className="text-xl font-semibold text-gray-700 mb-4">{meta.lessManualWork}</p>
                  <button className="text-blue-600 font-semibold text-sm flex items-center gap-1">
                    Show More <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
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
    </section>
  );
}

function AudienceCard({ title }: { title: string }) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
      <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
        <span className="text-4xl">👤</span>
      </div>
      <h3 className="text-xl font-bold text-center">{title}</h3>
    </div>
  );
}

function InfoRow({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="flex justify-between items-start border-b border-gray-100 pb-3">
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

