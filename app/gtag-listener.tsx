"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GtagListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    window.gtag?.("config", GA_ID, { page_path: url });
  }, [pathname, searchParams]);

  return null;
}

