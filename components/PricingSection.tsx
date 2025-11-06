// ============================================================================
// FILE: components/PricingSection.tsx
// PURPOSE: Pricing model display component for tool detail pages
// ============================================================================

import React from 'react';

interface PricingTier {
  name: string;
  price: string;
  features: string[];
}

interface PricingSectionProps {
  pricingModel?: string;
  tiers?: PricingTier[];
}

export default function PricingSection({ pricingModel, tiers }: PricingSectionProps) {
  // Default pricing tiers if not provided
  const defaultTiers: PricingTier[] = [
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

  const displayTiers = tiers ?? defaultTiers;

  return (
    <section id="pricing" className="bg-white rounded-2xl p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayTiers.map((tier, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500">Pricing model</div>
                <div className="font-bold text-gray-900 text-sm">{tier.name}</div>
              </div>
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-4">{tier.price}</div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700 mb-2">It includes:</div>
              {tier.features.map((feature, featureIdx) => (
                <div key={featureIdx} className="flex items-start gap-2 text-xs text-gray-600">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

