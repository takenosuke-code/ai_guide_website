'use client';

import { useState } from 'react';

export default function FallbackImg({
  src,
  alt = '',
  className = '',
  fallback,
}: {
  src?: string;
  alt?: string;
  className?: string;
  fallback: string;
}) {
  const [err, setErr] = useState(false);
  // src が空文字列、null、undefined の場合は fallback を使用
  const url = !src || src === '' || err ? fallback : src;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={url} 
      alt={alt} 
      className={className} 
      onError={() => setErr(true)}
      style={{ display: 'block' }}
    />
  );
}

