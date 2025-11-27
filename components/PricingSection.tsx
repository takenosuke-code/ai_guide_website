// ============================================================================
// FILE: components/PricingSection.tsx
// PURPOSE: Pricing model display component for tool detail pages
// ============================================================================

'use client';

import React, { useState } from 'react';
import PricingCard from './PricingCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PricingModel {
  name: string;
  price: string;
  features: string[];
}

interface PricingSectionProps {
  pricingModels?: PricingModel[];
}

export default function PricingSection({ pricingModels = [] }: PricingSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // All pricing models use dollar sign icon
  const getIconType = (): 'dollar' => {
    return 'dollar';
  };

  if (pricingModels.length === 0) {
    return null;
  }

  const showCarousel = pricingModels.length > 4;
  const itemsPerPage = 4;
  const maxIndex = Math.max(0, pricingModels.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section id="pricing" className="bg-white rounded-xl shadow-sm border border-gray-200" style={{ padding: '24px' }}>
      {showCarousel ? (
        <div className="relative">
          {/* Navigation Buttons */}
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Previous pricing plans"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          
          {currentIndex < maxIndex && (
            <button
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Next pricing plans"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          )}

          {/* Carousel Container */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
              }}
            >
              {pricingModels.map((model, idx) => (
                <div
                  key={idx}
                  className={`flex-shrink-0 ${idx < itemsPerPage - 1 ? 'border-r border-gray-200' : ''} min-w-0`}
                  style={{ width: `calc((100% - ${(itemsPerPage - 1) * 24}px) / ${itemsPerPage})` }}
                >
                  <PricingCard
                    name={model.name}
                    price={model.price}
                    features={model.features}
                    icon={getIconType()}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className={`grid ${pricingModels.length === 1 ? 'grid-cols-1' : pricingModels.length === 2 ? 'grid-cols-2' : pricingModels.length === 3 ? 'grid-cols-3' : 'grid-cols-4'} gap-0`}>
          {pricingModels.map((model, idx) => (
            <div key={idx} className={`${idx < pricingModels.length - 1 ? 'border-r border-gray-200' : ''} min-w-0`}>
              <PricingCard
                name={model.name}
                price={model.price}
                features={model.features}
                icon={getIconType()}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

