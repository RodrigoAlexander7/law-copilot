"use client";

import { Source } from "@/lib/types";
import { useState } from "react";

interface SourceCardProps {
  source: Source;
  index: number;
}

export function SourceCard({ source, index }: SourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hierarchyParts = [
    source.hierarchy.title,
    source.hierarchy.chapter,
    source.hierarchy.section,
  ].filter(Boolean);

  return (
    <div className="border border-zinc-700 rounded-lg bg-zinc-800/50 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-zinc-700/50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-medium flex items-center justify-center">
            {index + 1}
          </span>
          <div>
            <p className="font-medium text-zinc-100">{source.label}</p>
            <p className="text-xs text-zinc-400">{source.source}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            {(source.similarity_score * 100).toFixed(0)}% relevante
          </span>
          <svg
            className={`w-4 h-4 text-zinc-400 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 py-3 border-t border-zinc-700 bg-zinc-900/50">
          {hierarchyParts.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {hierarchyParts.map((part, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs bg-zinc-700 rounded text-zinc-300"
                >
                  {part}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {source.text}
          </p>
        </div>
      )}
    </div>
  );
}
