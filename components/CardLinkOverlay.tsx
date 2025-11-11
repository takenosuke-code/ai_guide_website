'use client';

import Link from 'next/link';

type CardLinkOverlayProps = {
  href: string;
  ariaLabel?: string;
  className?: string;
};

export default function CardLinkOverlay({
  href,
  ariaLabel,
  className = '',
}: CardLinkOverlayProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? 'Open detail'}
      className={`absolute inset-0 z-[60] rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${className}`}
    />
  );
}

