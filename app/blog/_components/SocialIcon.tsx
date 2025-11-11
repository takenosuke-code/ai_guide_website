'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

type SocialIconProps = {
  href: string;
  label: string;
  icon: ReactNode;
  className?: string;
};

export function SocialIcon({ href, label, icon, className = '' }: SocialIconProps) {
  return (
    <Link
      href={href}
      target="_blank"
      aria-label={label}
      className={`grid size-10 place-items-center rounded-full bg-[#0A7AFF] text-white shadow-[0_6px_14px_rgba(10,122,255,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0868e3] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0A7AFF] ${className}`}
    >
      {icon}
    </Link>
  );
}

