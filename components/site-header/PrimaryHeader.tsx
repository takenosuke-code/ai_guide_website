"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import HeroSearchBar from "@/components/HeroSearchBar";
import type { NavMenuGroup } from "@/lib/nav-groups";

type SearchTag = {
  name: string;
  slug: string;
};

type SearchTool = {
  title: string;
  slug: string;
};

interface PrimaryHeaderProps {
  tags: SearchTag[];
  navGroups: NavMenuGroup[];
  siteName?: string;
  siteLogo?: {
    sourceUrl: string;
    altText?: string;
  } | null;
  tools?: SearchTool[];
}

export default function PrimaryHeader({
  tags,
  navGroups,
  siteName = "AI Plaza",
  siteLogo = null,
  tools = [],
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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#4A7FD9] via-[#6EA6FF] to-[#8CEBFF] shadow-[0_10px_35px_-15px_rgba(15,38,84,0.45)] backdrop-blur">
      <div className="flex w-full flex-row items-start gap-2 sm:gap-3 px-3 sm:px-6 py-1.5 sm:py-2">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-white transition hover:opacity-90 flex-shrink-0 self-center"
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center overflow-hidden self-center">
            {siteLogo ? (
              <Image
                src={siteLogo.sourceUrl}
                alt={siteLogo.altText || "Site logo"}
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            ) : (
              <AiPlazaMark />
            )}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl sm:text-2xl font-semibold tracking-tight font-league-spartan">
              {siteName}
            </span>
          </div>
        </Link>

        <div className="flex-1 max-w-[340px] ml-2 sm:ml-4 md:ml-8 self-center">
          <HeroSearchBar
            tags={tags}
            tools={tools}
            placeholder="What AI tool do you need? (write about 5 words)"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm font-medium text-white flex-shrink-0 ml-2 sm:ml-4 md:ml-8 lg:ml-20 self-center">
          <div
            className="relative"
            onMouseEnter={() => hasGroups && setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              onClick={handleSoftwareClick}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 transition hover:bg-white/10"
            >
              Software
              <ChevronDown
                className={`h-3.5 w-3.5 transition duration-300 ${
                  megaOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {megaOpen && megaContent && (
              <div className="absolute left-1/2 top-full z-50 w-[min(960px,calc(100vw-2rem))] -translate-x-1/2 pt-2">
                <div className="rounded-3xl bg-white/95 p-6 text-gray-900 shadow-2xl ring-1 ring-black/5">
                  {megaContent}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/articles"
            className="rounded-full px-3 py-1 transition hover:bg-white/10"
          >
            Blog
          </Link>

          <Link
            href="/articles"
            className="rounded-full px-3 py-1 transition hover:bg-white/10"
          >
            For Vendors
          </Link>
        </div>

        <Link
          href="https://aitoolsite1020-vqchs.wpcomstaging.com/submit-a-review/"
          className="inline-flex items-center rounded-full bg-[#2454FF] px-2 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-700 ml-auto self-center"
        >
          <span className="hidden sm:inline">Leave Review</span>
          <span className="sm:hidden">Review</span>
        </Link>
      </div>
      
      {/* Border below header */}
      <div className="border-b border-white/20"></div>
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
    <div className="flex min-h-[340px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
      <div className="w-[260px] max-h-[360px] overflow-y-auto bg-[#f4f6fb]">
        <div className="flex flex-col">
          {groups.map((group) => {
            const isActive = group.id === activeGroup.id;
            return (
              <button
                key={group.id}
                onMouseEnter={() => onGroupFocus(group.id)}
                onFocus={() => onGroupFocus(group.id)}
                className={`w-full px-5 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#2454FF] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
                    : "text-gray-700 hover:bg-white"
                }`}
              >
                {group.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 max-h-[360px] overflow-y-auto px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pr-4">
          {activeGroup.tags.map((tag) => (
            <div key={tag.slug}>
              <Link
                href={`/collection/${tag.slug}`}
                className="text-base font-semibold text-gray-900 transition hover:text-[#2454FF]"
              >
                {tag.label}
              </Link>
            </div>
          ))}
          {activeGroup.tags.length === 0 && (
            <p className="text-sm text-gray-500">
              Add tags with “Nav Group: {activeGroup.label}” to populate this
              list.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function AiPlazaMark() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 28 28"
      className="w-full h-full"
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


