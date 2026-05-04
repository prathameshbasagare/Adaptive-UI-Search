// File: ./src/components/adaptive/Rating.tsx

"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { RatingItem } from "@/lib/types";

interface RatingProps {
  ratingTitle?: string;
  items: RatingItem[];
}

function StarRow({ label, initial }: { label: string; initial: number }) {
  const [score, setScore] = useState(Math.min(5, Math.max(0, initial)));
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-300/60 dark:border-slate-700/60 last:border-0">
      <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const active = hover !== null ? star <= hover : star <= score;
          return (
            <button
              key={star}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setScore(star === score ? 0 : star)}
              aria-label={`Rate ${star} out of 5`}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={20}
                className="transition-colors"
                fill={active ? "var(--theme-500)" : "none"}
                style={{ color: active ? "var(--theme-400)" : "#475569" }}
              />
            </button>
          );
        })}
        <span className="ml-2 text-xs text-slate-500 dark:text-slate-500 w-6 tabular-nums">{score}/5</span>
      </div>
    </div>
  );
}

export default function Rating({ ratingTitle, items }: RatingProps) {
  return (
    <div className="bg-slate-200/40 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
      {ratingTitle && (
        <div
          className="px-5 py-3 border-b border-slate-300 dark:border-slate-700 font-semibold text-slate-950 dark:text-white text-sm"
          style={{ background: "linear-gradient(to right, var(--theme-500-10), transparent)" }}
        >
          {ratingTitle}
        </div>
      )}
      <div className="px-5 divide-y-0">
        {items.map((item, i) => (
          <StarRow key={i} label={item.label} initial={item.defaultScore} />
        ))}
      </div>
    </div>
  );
}
