'use client';

import { Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyLink({ url, className = '' }: { url: string; className?: string }) {
  const [ok, setOk] = useState(false);

  return (
    <button
      type="button"
      aria-label="Copy link"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        } catch (error) {
          console.error('Failed to copy:', error);
        }
      }}
      className={`grid size-10 place-items-center rounded-full bg-[#0A7AFF] text-white shadow-[0_6px_14px_rgba(10,122,255,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0868e3] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0A7AFF] ${className}`}
      title={ok ? 'Copied!' : 'Copy link'}
    >
      {ok ? (
        <span className="text-sm font-semibold text-white leading-none">✓</span>
      ) : (
        <Copy className="h-4 w-4" strokeWidth={2.2} />
      )}
    </button>
  );
}

