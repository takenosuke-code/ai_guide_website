'use client';

import { useEffect, useRef, useState } from 'react';

interface TwitterEmbedProps {
  url: string;
}

// Global script loading state
let globalScriptLoading = false;
let globalScriptReady = false;
const readyCallbacks: (() => void)[] = [];

const loadTwitterScript = (callback: () => void) => {
  // If already ready, call immediately
  if (globalScriptReady && (window as any).twttr && (window as any).twttr.widgets) {
    callback();
    return;
  }

  // Add to callbacks
  readyCallbacks.push(callback);

  // If already loading, just wait
  if (globalScriptLoading) {
    return;
  }

  // Check if script already exists
  const existingScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
  if (existingScript) {
    globalScriptLoading = true;
    // Wait for it to be ready
    const checkReady = setInterval(() => {
      if ((window as any).twttr && (window as any).twttr.ready) {
        clearInterval(checkReady);
        (window as any).twttr.ready(() => {
          globalScriptReady = true;
          globalScriptLoading = false;
          readyCallbacks.forEach(cb => cb());
          readyCallbacks.length = 0;
        });
      }
    }, 50);
    return;
  }

  // Load the script
  globalScriptLoading = true;
  const script = document.createElement('script');
  script.src = 'https://platform.twitter.com/widgets.js';
  script.async = true;
  script.charset = 'utf-8';
  script.id = 'twitter-wjs';
  script.onload = () => {
    if ((window as any).twttr && (window as any).twttr.ready) {
      (window as any).twttr.ready(() => {
        globalScriptReady = true;
        globalScriptLoading = false;
        readyCallbacks.forEach(cb => cb());
        readyCallbacks.length = 0;
      });
    }
  };
  document.body.appendChild(script);
};

export default function TwitterEmbed({ url }: TwitterEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadTwitterScript(() => {
      setScriptReady(true);
    });
  }, []);

  useEffect(() => {
    // Render tweet when script is ready
    if (scriptReady && containerRef.current && (window as any).twttr && (window as any).twttr.widgets) {
      (window as any).twttr.widgets.load(containerRef.current).catch((err: any) => {
        console.error('Error loading tweet:', err);
      });
    }
  }, [scriptReady, url]);

  // Extract tweet ID and username from URL
  // Handle both twitter.com and x.com, and also handle share links
  let tweetId: string | undefined;
  let username: string | undefined;
  
  // Try to extract from standard tweet URL
  const standardMatch = url.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/);
  if (standardMatch) {
    username = standardMatch[1];
    tweetId = standardMatch[2];
  }
  
  // Try to extract from share link (t.co format)
  if (!tweetId) {
    const shareMatch = url.match(/status\/(\d+)/);
    if (shareMatch) {
      tweetId = shareMatch[1];
      // For share links, we'll use the tweet ID only
    }
  }

  if (!tweetId) {
    // Fallback: show as link
    return (
      <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
          {url}
        </a>
        <p className="text-xs text-gray-500 mt-2">Invalid Twitter URL format. Please use: https://twitter.com/username/status/1234567890</p>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div className="w-full h-40 rounded-lg bg-gray-100 animate-pulse" />
    );
  }

  return (
    <div ref={containerRef} className="w-full">
      <blockquote className="twitter-tweet" data-theme="light" data-dnt="true">
        <a href={url}>Loading tweet...</a>
      </blockquote>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    twttr?: {
      ready: (callback: () => void) => void;
      widgets: {
        load: (element?: HTMLElement | null) => Promise<void>;
      };
    };
  }
}