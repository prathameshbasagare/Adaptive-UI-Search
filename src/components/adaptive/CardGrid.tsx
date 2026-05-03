// File: ./src/components/adaptive/CardGrid.tsx

"use client";

import type { CardItem } from "@/lib/types";

interface CardGridProps {
  cards: CardItem[];
}

const ACCENT_COLORS = [
  "from-violet-500/30 to-violet-500/0",
  "from-blue-500/30 to-blue-500/0",
  "from-emerald-500/30 to-emerald-500/0",
  "from-amber-500/30 to-amber-500/0",
  "from-pink-500/30 to-pink-500/0",
  "from-cyan-500/30 to-cyan-500/0",
];

const BORDER_HOVER_COLORS = [
  "hover:border-violet-500/50",
  "hover:border-blue-500/50",
  "hover:border-emerald-500/50",
  "hover:border-amber-500/50",
  "hover:border-pink-500/50",
  "hover:border-cyan-500/50",
];

const TITLE_HOVER_COLORS = [
  "group-hover:text-violet-300",
  "group-hover:text-blue-300",
  "group-hover:text-emerald-300",
  "group-hover:text-amber-300",
  "group-hover:text-pink-300",
  "group-hover:text-cyan-300",
];

export default function CardGrid({ cards }: CardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const accentIdx = index % ACCENT_COLORS.length;
        return (
          <div
            key={index}
            className={`group relative bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden hover:bg-slate-800 transition-all duration-200 hover:shadow-lg ${BORDER_HOVER_COLORS[accentIdx]}`}
          >
            {/* Top gradient accent band */}
            <div
              className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${ACCENT_COLORS[accentIdx]}`}
            />

            <div className="p-5 pt-6">
              {card.icon && (
                <span className="text-3xl mb-3 block">{card.icon}</span>
              )}

              <div className="flex items-start justify-between gap-2 mb-2">
                <h3
                  className={`font-semibold text-white text-base leading-snug transition-colors ${TITLE_HOVER_COLORS[accentIdx]}`}
                >
                  {card.title}
                </h3>
                {card.badge && (
                  <span className="shrink-0 text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
                    {card.badge}
                  </span>
                )}
              </div>

              <p className="text-slate-400 text-sm leading-relaxed">{card.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
