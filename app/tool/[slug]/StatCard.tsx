'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  detail?: string;
}

export default function StatCard({ icon, title, value, detail }: StatCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 値が長い場合は短縮表示（CSSで自動的に切り詰め）
  // 常にShow Moreボタンを表示して、展開時に値全体または詳細テキストを表示

  return (
    <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      {!isExpanded && (
        <p className="text-base font-normal text-gray-700 mb-6 line-clamp-1 overflow-hidden">
          {value}
        </p>
      )}
      <div className="border-t border-gray-200 pt-6">
        {(detail || value.length > 20) && (
          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="pt-3 text-gray-600 text-sm leading-relaxed whitespace-pre-line break-words">
              {detail || value}
            </div>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 font-semibold text-sm flex items-center gap-1 w-full"
        >
          Show More <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}