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

  const showCarousel = pricingModels.length > 3;
  const itemsPerPage = 3;
  const maxIndex = Math.max(0, pricingModels.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section id="pricing" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Pricing</h2>
      
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
                  className="flex-shrink-0"
                  style={{ width: `calc((100% - ${(itemsPerPage - 1) * 24}px) / ${itemsPerPage})` }}
                >
                  <PricingCard
                    name={model.name}
                    price={model.price}
                    features={model.features}
                    icon={getIconType(model.name, idx)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
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
      )}
    </section>
  );
}

