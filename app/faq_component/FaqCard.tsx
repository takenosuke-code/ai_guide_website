"use client";

import { useState } from "react";

interface FaqCardProps {
  id: string;
  title: string;
  content: string;
}

export default function FaqCard({ id, title, content }: FaqCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full cursor-pointer flex items-center justify-between gap-4 p-4 md:p-5 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <span className="font-semibold text-sm md:text-base flex items-center gap-2 flex-1 text-left">
          <span className="text-xl">😊</span>
          <span className="line-clamp-2">{title}</span>
        </span>
        <span
          className={`shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          } text-white`}
        >
          ⌃
        </span>
      </button>

      {isOpen && (
        <div className="p-4 md:p-5">
          <div
            className={`prose prose-sm max-w-none text-gray-700 break-words ${
              !showFullContent ? "line-clamp-5" : ""
            }`}
            style={{ overflowWrap: "anywhere" }}
            dangerouslySetInnerHTML={{ __html: content ?? "" }}
          />
          {!showFullContent && (
            <button
              onClick={() => setShowFullContent(true)}
              className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Show more
            </button>
          )}
          {showFullContent && (
            <button
              onClick={() => setShowFullContent(false)}
              className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}

