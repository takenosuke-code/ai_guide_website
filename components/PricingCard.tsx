'use client';

interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
  icon?: 'dollar' | 'tag' | 'calendar';
}

export default function PricingCard({ name, price, features, icon = 'dollar' }: PricingCardProps) {
  // Get icon SVG based on type
  const getIcon = () => {
    switch (icon) {
      case 'dollar':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'tag':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Determine icon based on name if not provided
  const getIconType = (): 'dollar' | 'tag' | 'calendar' => {
    if (icon) return icon;
    const nameLower = name.toLowerCase();
    if (nameLower.includes('free') || nameLower.includes('trial')) return 'dollar';
    if (nameLower.includes('plus')) return 'tag';
    return 'calendar';
  };

  const iconType = getIconType();

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          {getIcon()}
        </div>
        <div>
          <div className="text-xs text-gray-500">Pricing model</div>
          <div className="font-bold text-gray-900 text-sm">{name}</div>
        </div>
      </div>

      {/* Price - Bigger and bolder as per image */}
      <div className="text-3xl font-bold text-gray-900 mb-4">{price}</div>

      {/* Features with checkmarks */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-700 mb-2">It includes:</div>
        {features.length > 0 ? (
          features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
              <svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{feature}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-xs">No features listed.</p>
        )}
      </div>
    </div>
  );
}

