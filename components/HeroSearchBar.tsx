"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeAlias, toSlug } from "@/lib/slugify";
import { Search } from "lucide-react";

type Tag = { name: string; slug: string };
type Tool = { title: string; slug: string };

type Suggestion =
  | { kind: "tag"; slug: string; name: string }
  | { kind: "tool"; slug: string; title: string };

interface HeroSearchBarProps {
  tags: Tag[];
  tools?: Tool[];
  showButton?: boolean;
  placeholder?: string;
}

export default function HeroSearchBar({
  tags,
  tools = [],
  showButton = false,
  placeholder = "Search by tag (e.g. marketing, coder)",
}: HeroSearchBarProps) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const suggestions: Suggestion[] = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];

    const tagMatches: Suggestion[] = tags
      .filter(
        (t) =>
          t.name.toLowerCase().includes(s) ||
          t.slug.toLowerCase().includes(s)
      )
      .slice(0, 8)
      .map((t) => ({
        kind: "tag" as const,
        slug: t.slug,
        name: t.name,
      }));

    const toolMatches: Suggestion[] = tools
      .filter(
        (tool) =>
          tool.title.toLowerCase().includes(s) ||
          tool.slug.toLowerCase().includes(s)
      )
      .slice(0, 8)
      .map((tool) => ({
        kind: "tool" as const,
        slug: tool.slug,
        title: tool.title,
      }));

    return [...tagMatches, ...toolMatches].slice(0, 10);
  }, [q, tags, tools]);

  const go = (raw: string) => {
    if (!raw?.trim()) return;
    const normalized = normalizeAlias(raw);
    const slugified = toSlug(normalized);

    // 1) Exact or slugified match against tools → go to tool detail
    const toolHit = tools.find(
      (tool) =>
        tool.slug.toLowerCase() === slugified ||
        toSlug(tool.title) === slugified
    );
    if (toolHit) {
      router.push(`/tool/${toolHit.slug}`);
      return;
    }

    // 2) Fallback to existing tag behavior → go to collection
    const tagHit = tags.find(
      (t) =>
        t.slug.toLowerCase() === slugified ||
        toSlug(t.name) === slugified
    );
    const target = tagHit ? tagHit.slug : slugified;

    router.push(`/collection/${target}`);
  };

  const goFromSuggestion = (s: Suggestion) => {
    if (s.kind === "tool") {
      router.push(`/tool/${s.slug}`);
      return;
    }
    go(s.slug);
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
          "w-full rounded-full bg-white/90 px-3 py-0.5 text-xs shadow ring-1 ring-gray-200 text-gray-900 outline-none h-8",
          showButton ? "pr-28" : ""
        ].join(" ")}
        aria-label="Search tags"
      />

      {showButton && (
        <button
          type="submit"
          className="absolute top-1/2 right-1.5 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 h-7"
        >
          <Search className="h-3 w-3" strokeWidth={2.5} />
          <span>Search</span>
        </button>
      )}

      {suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1.5 w-full max-w-3xl rounded-xl bg-white shadow ring-1 ring-gray-200 divide-y">
          {suggestions.map((s) => (
          <li key={`${s.kind}-${s.slug}`}>
              <button
                type="button"
                onClick={() => goFromSuggestion(s)}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                {s.kind === "tag" ? (
                  <>
                    <span className="font-medium text-gray-900">
                      {s.name}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      /{s.slug}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-gray-900">
                      {s.title}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      AI tool
                    </span>
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

