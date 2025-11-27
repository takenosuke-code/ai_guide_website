'use client';

import { useState } from 'react';
import { ChevronDown, ThumbsUp } from 'lucide-react';

interface KeyFeature {
  title: string;
  description: string;
}

interface KeyFindingsSectionProps {
  keyFeatures: KeyFeature[];
}

export default function KeyFindingsSection({ keyFeatures }: KeyFindingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show 10 items (2 rows × 5 columns)
  const MAX_VISIBLE = 10;
  const allFeatures = keyFeatures.slice(0, MAX_VISIBLE);

  if (!keyFeatures || keyFeatures.length === 0) {
    return (
      <section id="key-findings" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">key feature</h2>
        <p className="text-gray-500 text-sm">No key features available.</p>
      </section>
    );
  }

  return (
    <section id="key-findings" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">key feature</h2>

      <div className="grid grid-cols-5 gap-3 mb-4">
        {allFeatures.map((feature, i) => (
          <div 
            key={i} 
            className="flex items-start gap-2.5 p-2.5 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            style={{ 
              aspectRatio: !isExpanded ? '198/57' : 'auto',
              minHeight: !isExpanded ? '50px' : 'auto',
              maxWidth: '100%'
            }}
          >
            <div className="bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0" style={{ 
              width: 'clamp(24px, 2.5vw, 32px)', 
              height: 'clamp(24px, 2.5vw, 32px)',
              aspectRatio: '1/1'
            }}>
              <ThumbsUp className="text-white" style={{ 
                width: 'clamp(12px, 1.4vw, 17px)', 
                height: 'clamp(12px, 1.4vw, 17px)'
              }} />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              {!isExpanded ? (
                /* Collapsed - Just title */
                <h4 
                  className="break-words"
                  style={{
                    fontFamily: 'Inter',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '153%',
                    letterSpacing: '0%',
                    color: '#000000'
                  }}
                >
                  {feature.title}
                </h4>
              ) : (
                /* Expanded - Title and description with separator */
                <div className="flex flex-col w-full">
                  <h4 
                    className="break-words mb-2"
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '153%',
                      letterSpacing: '0%',
                      color: '#000000'
                    }}
                  >
                    {feature.title}
                  </h4>
                  <div 
                    className="w-full mb-2"
                    style={{ borderTop: '1px solid #8686861A' }}
                  ></div>
                  <p className="text-xs md:text-sm text-gray-700 break-words">
                    {feature.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:underline"
        >
          {isExpanded ? 'Show Less' : 'Show Details'}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </section>
  );
}
