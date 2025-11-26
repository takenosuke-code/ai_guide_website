'use client';

import Link from 'next/link';
import Image from 'next/image';

interface AlternativeCardProps {
  tool: {
    id: string;
    title: string;
    slug: string;
    uri: string;
    excerpt?: string;
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
      keyFindingsRaw?: string | string[];
      whoIsItFor?: string;
      pricing?: string;
      latestVersion?: string;
      publishedDate?: string;
      latestUpdate?: string;
    };
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

export default function AlternativeCard({ tool }: AlternativeCardProps) {
  // Parse key findings
  const parseKeyFindings = (raw: string | string[] | null | undefined): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.slice(0, 4);
    if (typeof raw === 'string') {
      const byNewlines = raw.split(/\r?\n/).filter(Boolean);
      if (byNewlines.length > 1) {
        return byNewlines.map(s => s.trim()).filter(Boolean).slice(0, 4);
      } else if (byNewlines[0]?.includes(',')) {
        return byNewlines[0].split(',').map(s => s.trim()).filter(Boolean).slice(0, 4);
      }
      return byNewlines.map(s => s.trim()).filter(Boolean).slice(0, 4);
    }
    return [];
  };

  // Parse who is it for (get first audience title)
  const parseWhoIsItFor = (text: string | null | undefined): string[] => {
    if (!text || text.trim() === '') return [];
    const sections = text.split(/\n\s*\n/).filter(Boolean);
    return sections.slice(0, 4).map(section => {
      const lines = section.split('\n').filter(Boolean);
      return lines[0]?.trim() || '';
    }).filter(Boolean);
  };

  // Parse pricing (get first pricing model name)
  const parsePricing = (text: string | null | undefined): string => {
    if (!text || text.trim() === '') return 'Free';
    const sections = text.split(/\n\s*\n/).filter(Boolean);
    if (sections.length > 0) {
      const lines = sections[0].split('\n').filter(Boolean);
      return lines[0]?.trim() || 'Free';
    }
    return 'Free';
  };

  const logoUrl = tool.aiToolMeta?.logo?.node?.sourceUrl || tool.featuredImage?.node?.sourceUrl;
  const keyFindings = parseKeyFindings(tool.aiToolMeta?.keyFindingsRaw);
  const whoIsItFor = parseWhoIsItFor(tool.aiToolMeta?.whoIsItFor);
  const pricing = parsePricing(tool.aiToolMeta?.pricing);
  const version = tool.aiToolMeta?.latestVersion || '';
  // Get up to 4 tags (like "Marketing", "Coder", etc.)
  const tags = tool.tags?.nodes?.slice(0, 4).map(tag => tag.name) || [];
  const description = tool.excerpt?.replace(/<[^>]*>/g, '').substring(0, 120) || 'AI-powered tool for various tasks.';

  // Calculate time ago
  const getTimeAgo = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) return `${diffDays}d ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
      return `${Math.floor(diffDays / 365)}y ago`;
    } catch {
      return '';
    }
  };

  const timeAgo = getTimeAgo(tool.aiToolMeta?.latestUpdate || tool.aiToolMeta?.publishedDate);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow bg-white flex-shrink-0 w-full max-w-[320px]">
      <div className="p-4">
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={tool.title}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 rounded-xl"></div>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-sm">{tool.title}</h3>
            </div>
            {version && timeAgo && (
              <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                {version} Released {timeAgo}
              </span>
            )}
          </div>
          {tags.length > 0 ? (
            <div className="flex flex-row flex-wrap gap-1.5">
              {tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                    idx % 3 === 0 ? 'bg-green-100 text-green-700' :
                    idx % 3 === 1 ? 'bg-purple-100 text-purple-700' :
                    'bg-cyan-100 text-cyan-700'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
              {tool.categories?.nodes?.[0]?.name || 'Basic Tasks'}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 text-xs leading-relaxed mb-4">
          {description}
        </p>
        
        {/* Preview Image */}
        <div className="relative rounded-lg overflow-hidden shadow-md bg-gray-100 mb-4 h-32">
          {tool.featuredImage?.node?.sourceUrl ? (
            <Image
              src={tool.featuredImage.node.sourceUrl}
              alt={tool.featuredImage.node.altText || tool.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200"></div>
          )}
        </div>
        
        {/* Key Findings and Who is it for */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-900 mb-2">Key Findings</p>
            <div className="space-y-1">
              {keyFindings.length > 0 ? (
                keyFindings.slice(0, 4).map((finding, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-green-500 rounded-sm flex-shrink-0"></div>
                    <span className="text-xs text-gray-700">{finding}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-500">No findings</span>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-xs font-semibold text-gray-900 mb-2">Who is it for?</p>
            <div className="space-y-1">
              {whoIsItFor.length > 0 ? (
                whoIsItFor.slice(0, 4).map((audience, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm flex-shrink-0"></div>
                    <span className="text-xs text-gray-700">{audience}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-500">Not specified</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-600">{pricing}</span>
          <Link href={`/tool/${tool.slug}`} className="text-xs text-gray-500 hover:text-blue-600 underline">
            Full Review
          </Link>
        </div>
      </div>
    </div>
  );
}