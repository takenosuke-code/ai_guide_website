"use client";

import { useEffect, useState } from "react";
import type { FlatHeading, TocItem } from "@/lib/toc";

function TocList({ items }: { items: TocItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <TocLink item={item} />
          {item.children.length > 0 && (
            <div className="ml-1 mt-2 border-l border-gray-200 pl-4">
              <TocList items={item.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function TocLink({ item }: { item: TocItem }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = document.getElementById(item.id);
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setActive(Boolean(entry.isIntersecting)),
      { rootMargin: "-120px 0px -70% 0px", threshold: [0, 1] }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [item.id]);

  return (
    <a
      href={`#${item.id}`}
      className={`block text-[#1466F6] transition-colors ${
        item.level === 2 ? "font-medium" : ""
      }`}
    >
      {item.text}
    </a>
  );
}

export default function TableOfContents({
  headings,
  tree,
  title = "TABLE OF CONTENTS",
}: {
  headings: FlatHeading[];
  tree: TocItem[];
  title?: string;
}) {
  if (!headings?.length) return null;

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <p className="mb-2 font-semibold" style={{ color: '#4C4C4C' }}>
        {title}
      </p>
      <TocList items={tree} />
    </nav>
  );
}

