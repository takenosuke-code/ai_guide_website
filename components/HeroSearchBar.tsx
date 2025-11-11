"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeAlias, toSlug } from "@/lib/slugify";
import { Search } from "lucide-react";

type Tag = { name: string; slug: string };

interface HeroSearchBarProps {
  tags: Tag[];
  showButton?: boolean;
  placeholder?: string;
}

export default function HeroSearchBar({
  tags,
  showButton = false,
  placeholder = "Search by tag (e.g. marketing, coder)",
}: HeroSearchBarProps) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const suggestions = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return tags
      .filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.slug.toLowerCase().includes(s)
      )
      .slice(0, 8);
  }, [q, tags]);

  const go = (raw: string) => {
    if (!raw?.trim()) return;
    const normalized = normalizeAlias(raw);
    const slugified = toSlug(normalized);

    const hit = tags.find(
      (t) =>
        t.slug.toLowerCase() === slugified ||
        toSlug(t.name) === slugified
    );
    const target = hit ? hit.slug : slugified;

    router.push(`/collection/${target}`);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    go(q);
  };

  return (
    <form onSubmit={onSubmit} className="relative w-full max-w-3xl mx-auto">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className={[
          "w-full rounded-full bg-white/90 px-6 py-3 shadow ring-1 ring-gray-200 text-gray-900 outline-none",
          showButton ? "pr-32" : ""
        ].join(" ")}
        aria-label="Search tags"
      />

      {showButton && (
        <button
          type="submit"
          className="absolute top-1/2 right-2 -translate-y-1/2 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Search className="h-4 w-4" strokeWidth={2.5} />
          <span>Search</span>
        </button>
      )}

      {suggestions.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full max-w-3xl rounded-xl bg-white shadow ring-1 ring-gray-200 divide-y">
          {suggestions.map((t) => (
            <li key={t.slug}>
              <button
                type="button"
                onClick={() => go(t.slug)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{t.name}</span>
                <span className="ml-2 text-xs text-gray-500">/{t.slug}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

