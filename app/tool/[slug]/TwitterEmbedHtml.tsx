'use client';

import { useEffect, useRef } from 'react';

export default function TwitterEmbedHtml({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject HTML
    if (containerRef.current) {
      containerRef.current.innerHTML = html;
    }
    // Ensure Twitter widgets script is loaded and process the block
    const ensureScript = () => {
      const w = window as any;
      const process = () => {
        if (w.twttr && w.twttr.widgets && containerRef.current) {
          w.twttr.widgets.load(containerRef.current);
        }
      };
      if (w.twttr && w.twttr.widgets) {
        process();
        return;
      }
      const existing = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
      if (existing) {
        existing.addEventListener('load', process);
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://platform.twitter.com/widgets.js';
      s.async = true;
      s.onload = process;
      document.body.appendChild(s);
    };
    ensureScript();
  }, [html]);

  return <div ref={containerRef} className="w-full" />;
}









