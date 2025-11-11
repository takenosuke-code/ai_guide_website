// ============================================================================
// FILE: components/PricingSection.tsx
// PURPOSE: Pricing model display component for tool detail pages
// ============================================================================

import React from 'react';
import PricingCard from './PricingCard';

interface PricingModel {
  name: string;
  price: string;
  features: string[];
}

interface PricingSectionProps {
  pricingModels?: PricingModel[];
}

export default function PricingSection({ pricingModels = [] }: PricingSectionProps) {
  // Determine icon type based on name
  const getIconType = (name: string, index: number): 'dollar' | 'tag' | 'calendar' => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('free') || nameLower.includes('trial')) return 'dollar';
    if (nameLower.includes('plus')) return 'tag';
    return 'calendar';
  };

  if (pricingModels.length === 0) {
    return null;
  }

  return (
    <section id="pricing" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Pricing</h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {pricingModels.map((model, idx) => (
          <PricingCard
            key={idx}
            name={model.name}
            price={model.price}
            features={model.features}
            icon={getIconType(model.name, idx)}
          />
        ))}
      </div>
    </section>
  );
}

