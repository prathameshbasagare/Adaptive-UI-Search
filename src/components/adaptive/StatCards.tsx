// File: ./src/components/adaptive/StatCards.tsx

"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { StatCard } from "@/lib/types";

interface StatCardsProps {
  stats: StatCard[];
}

function TrendBadge({ trend, direction }: { trend: string; direction?: StatCard["trendDirection"] }) {
  if (direction === "up") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
        <TrendingUp size={11} />{trend}
      </span>
    );
  }
  if (direction === "down") {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-full">
        <TrendingDown size={11} />{trend}
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-700/60 border border-slate-700 px-2 py-0.5 rounded-full">
      <Minus size={11} />{trend}
    </span>
  );
}

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="relative bg-slate-800/60 border border-slate-700 rounded-xl p-5 overflow-hidden hover:border-slate-600 transition-colors"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: index % 2 === 0
                ? `radial-gradient(ellipse at top left, var(--theme-500-10), transparent)`
                : `radial-gradient(ellipse at bottom right, var(--theme-500-8), transparent)`,
            }}
          />
          <div className="relative">
            {stat.icon && <span className="text-2xl mb-3 block">{stat.icon}</span>}
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-white leading-none mb-2">{stat.value}</p>
            {stat.trend && <TrendBadge trend={stat.trend} direction={stat.trendDirection} />}
          </div>
        </div>
      ))}
    </div>
  );
}
