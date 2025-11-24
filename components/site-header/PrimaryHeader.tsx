"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import HeroSearchBar from "@/components/HeroSearchBar";
import type { NavMenuGroup } from "@/lib/nav-groups";

type SearchTag = {
  name: string;
  slug: string;
};

interface PrimaryHeaderProps {
  tags: SearchTag[];
  navGroups: NavMenuGroup[];
}

export default function PrimaryHeader({
  tags,
  navGroups,
}: PrimaryHeaderProps) {
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState(
    navGroups[0]?.id ?? null
  );

  const hasGroups = navGroups.length > 0;
  const activeGroup = useMemo(() => {
    if (!hasGroups) return undefined;
    return (
      navGroups.find((group) => group.id === activeGroupId) ?? navGroups[0]
    );
  }, [activeGroupId, navGroups, hasGroups]);

  const megaContent =
    hasGroups && activeGroup ? (
      <MegaMenuContent
        groups={navGroups}
        activeGroupId={activeGroup.id}
        onGroupFocus={setActiveGroupId}
      />
    ) : null;

  const handleSoftwareClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches;
    if (!isTouch) return;
    event.preventDefault();
    setMegaOpen((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-gradient-to-r from-[#6EA6FF] via-[#7EC7FF] to-[#8CEBFF] shadow-[0_10px_35px_-15px_rgba(15,38,84,0.45)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-4 py-3 md:flex-row md:items-center md:gap-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-white transition hover:opacity-90"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow">
            <AiPlazaMark />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-semibold tracking-tight">
              AI Plaza
            </span>
            <span className="text-xs font-medium text-white/80">
              Find the right AI in seconds
            </span>
          </div>
        </Link>

        <div className="hidden flex-1 md:block">
          <HeroSearchBar
            tags={tags}
            placeholder="What AI tool do you need? (write about 5 words)"
          />
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-white md:flex">
          <div
            className="relative"
            onMouseEnter={() => hasGroups && setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              onClick={handleSoftwareClick}
              className="inline-flex items-center gap-1 rounded-full px-4 py-2 transition hover:bg-white/10"
            >
              Software
              <ChevronDown
                className={`h-4 w-4 transition duration-300 ${
                  megaOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {megaOpen && megaContent && (
              <div className="absolute left-1/2 top-full z-50 hidden w-[min(960px,calc(100vw-2rem))] -translate-x-1/2 pt-4 md:block">
                <div className="rounded-3xl bg-white/95 p-6 text-gray-900 shadow-2xl ring-1 ring-black/5">
                  {megaContent}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/blog"
            className="rounded-full px-4 py-2 transition hover:bg-white/10"
          >
            Blog
          </Link>
          <Link
            href="/#for-vendors"
            className="rounded-full px-4 py-2 transition hover:bg-white/10"
          >
            For Vendors
          </Link>
          <Link
            href="/#leave-review"
            className="inline-flex items-center rounded-full bg-[#2454FF] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:-translate-y-0.5 hover:bg-[#1d44cc]"
          >
            Leave Review
          </Link>
        </nav>
      </div>

      {/* Mobile search & nav */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 pb-4 md:hidden">
        <HeroSearchBar
          tags={tags}
          placeholder="What AI tool do you need? (write about 5 words)"
        />

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white/90">
          <button
            type="button"
            onClick={() => hasGroups && setMegaOpen((prev) => !prev)}
            className="inline-flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-white"
          >
            <span>Browse software</span>
            <ChevronDown
              className={`h-5 w-5 transition ${megaOpen ? "rotate-180" : ""}`}
            />
          </button>
          <Link
            href="/blog"
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white/10 px-4 py-3"
          >
            Blog
          </Link>
          <Link
            href="/#for-vendors"
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white/10 px-4 py-3"
          >
            For Vendors
          </Link>
          <Link
            href="/#leave-review"
            className="inline-flex flex-1 items-center justify-center rounded-2xl bg-[#2454FF] px-4 py-3 text-white shadow-lg shadow-blue-900/30"
          >
            Leave Review
          </Link>
        </div>

        {megaOpen && megaContent && (
          <div className="rounded-3xl bg-white/95 p-5 text-gray-900 shadow-xl ring-1 ring-black/5 md:hidden">
            {megaContent}
          </div>
        )}
      </div>
    </header>
  );
}

function MegaMenuContent({
  groups,
  activeGroupId,
  onGroupFocus,
}: {
  groups: NavMenuGroup[];
  activeGroupId: string;
  onGroupFocus: (id: string) => void;
}) {
  const activeGroup =
    groups.find((group) => group.id === activeGroupId) ?? groups[0];
  if (!activeGroup) return null;

  return (
    <div className="grid gap-6 md:grid-cols-[220px,1fr]">
      <div className="space-y-1 border-b pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-4">
        {groups.map((group) => {
          const isActive = group.id === activeGroup.id;
          return (
            <button
              key={group.id}
              onMouseEnter={() => onGroupFocus(group.id)}
              onFocus={() => onGroupFocus(group.id)}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-2 text-left text-sm font-semibold transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{group.label}</span>
              {isActive && (
                <span className="rounded-full bg-blue-100 px-2 text-xs font-semibold text-blue-800">
                  {group.tags.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {activeGroup.tags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/collection/${tag.slug}`}
            className="group flex flex-col gap-1 rounded-2xl border border-gray-100 bg-white/60 px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60"
          >
            <span className="text-sm font-semibold text-gray-900">
              {tag.label}
            </span>
            {typeof tag.count === "number" && (
              <span className="text-xs text-gray-500">
                {tag.count ?? 0} tools
              </span>
            )}
          </Link>
        ))}
        {activeGroup.tags.length === 0 && (
          <p className="text-sm text-gray-500">
            Add tags with “Nav Group: {activeGroup.label}” to populate this
            list.
          </p>
        )}
      </div>
    </div>
  );
}

function AiPlazaMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mark-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F7DFF" />
          <stop offset="100%" stopColor="#7CE3FF" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="26"
        height="26"
        rx="13"
        fill="url(#mark-bg)"
      />
      <rect
        x="6"
        y="11"
        width="16"
        height="9"
        rx="4.5"
        fill="#FFFFFF"
        opacity="0.95"
      />
      <circle cx="11" cy="15" r="1.5" fill="#4F7DFF" />
      <circle cx="17" cy="15" r="1.5" fill="#4F7DFF" />
      <path
        d="M9 7.5C9 6.11929 10.1193 5 11.5 5H16.5C17.8807 5 19 6.11929 19 7.5V9H9V7.5Z"
        fill="#FFFFFF"
        opacity="0.9"
      />
    </svg>
  );
}


