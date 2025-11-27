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
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
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

  return (
    <div className="flex flex-col relative" style={{ paddingLeft: '12px' }}>
      {/* Blue circular icon and pricing model label + plan name */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex flex-col">
          <p className="text-xs text-gray-600 mb-0 leading-tight">Pricing model</p>
          <h3 className="text-base font-bold text-gray-900 -mt-0.5 leading-tight">{name}</h3>
        </div>
      </div>
      
      {/* Price - large and bold, positioned higher and slightly to the right */}
      <div className="mb-4 relative">
        <p className="text-2xl font-bold mb-3" style={{ marginTop: '-8px', marginLeft: '8px', color: '#404040' }}>{price}</p>
        {/* Thin line under the price */}
        <div
          className="border-t"
          style={{
            borderColor: '#EFEFEF',
            borderWidth: '1px',
            width: 'calc(100% - 48px)',
            marginLeft: '12px'
          }}
        ></div>
      </div>
      
      {/* It includes heading - matching typography settings */}
      <p 
        className="mb-3"
        style={{
          fontFamily: 'Inter',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '175%',
          letterSpacing: '0%',
          color: '#404040'
        }}
      >
        It includes:
      </p>
      
      {/* Features list with dark gray checkmarks */}
      <ul className="space-y-2 flex-1">
        {features.length > 0 ? (
          features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <svg 
                className="w-5 h-5 flex-shrink-0 mt-0.5" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                style={{ color: '#404040' }}
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span 
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '175%',
                  letterSpacing: '0%',
                  color: '#000000'
                }}
              >
                {feature}
              </span>
            </li>
          ))
        ) : (
          <p className="text-gray-500 text-xs">No features listed.</p>
        )}
      </ul>
    </div>
  );
}
