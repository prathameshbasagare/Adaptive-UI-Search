// File: ./src/components/adaptive/BentoGrid.tsx

"use client";

import { ExternalLink, TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import type { BentoItem } from "@/lib/types";
import { useModal } from "@/contexts/ModalContext";
import TextBlock from "./TextBlock";

interface BentoGridProps {
  bentoTitle?: string;
  items: BentoItem[];
}

export default function BentoGrid({ bentoTitle, items }: BentoGridProps) {
  const { openModal } = useModal();

  // Smart layout auto-assigner if the AI or caller didn't provide colSpan/rowSpan
  const getColSpanClass = (item: BentoItem, index: number) => {
    if (item.colSpan === 3) return "md:col-span-3 lg:col-span-3";
    if (item.colSpan === 2) return "md:col-span-2 lg:col-span-2";
    if (item.colSpan === 1) return "md:col-span-1 lg:col-span-1";

    // Auto-rhythm for bento visual interest:
    // Items: 0 -> col-2, 1 -> col-1, 2 -> col-1, 3 -> col-2, 4 -> col-1, 5 -> col-2...
    const cycle = index % 5;
    if (cycle === 0 || cycle === 3) {
      return "md:col-span-2 lg:col-span-2";
    }
    return "md:col-span-1 lg:col-span-1";
  };

  const getRowSpanClass = (item: BentoItem, index: number) => {
    if (item.rowSpan === 2) return "row-span-2";
    if (item.rowSpan === 1) return "row-span-1";
    // Index 0 or hero item can span 2 rows if has extensive content
    if (index === 0 && (item.body.length > 180 || item.headerSnippet)) {
      return "md:row-span-2";
    }
    return "row-span-1";
  };

  return (
    <div className="space-y-4">
      {bentoTitle && (
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} style={{ color: "var(--theme-400)" }} />
          <h2 className="text-lg font-semibold text-white tracking-tight">{bentoTitle}</h2>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(180px,auto)]">
        {items.map((item, index) => {
          const colSpan = getColSpanClass(item, index);
          const rowSpan = getRowSpanClass(item, index);
          const hasDetails = Boolean(item.details);

          return (
            <div
              key={index}
              onClick={
                hasDetails
                  ? () => openModal(item.title, <TextBlock content={item.details!} />)
                  : undefined
              }
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-md transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-black/40 ${colSpan} ${rowSpan} ${
                hasDetails ? "cursor-pointer" : ""
              }`}
            >
              {/* Subtle top edge gradient glow */}
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-60 transition-opacity group-hover:opacity-100"
                style={{
                  background: `linear-gradient(90deg, var(--theme-500-60), transparent)`,
                }}
              />

              {/* Ambient radial glow on hover */}
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20"
                style={{ backgroundColor: "var(--theme-500)" }}
              />

              {/* Top Bar: Icon, Badges, Metrics */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {item.icon && (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/60 text-2xl shadow-inner">
                        {item.icon}
                      </span>
                    )}
                    {item.badge && (
                      <span
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: "var(--theme-500-10)",
                          color: "var(--theme-400)",
                          borderColor: "var(--theme-500-30)",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.trend && (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                          item.trendDirection === "up"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : item.trendDirection === "down"
                            ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            : "bg-slate-700/40 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {item.trendDirection === "up" && <TrendingUp size={12} />}
                        {item.trendDirection === "down" && <TrendingDown size={12} />}
                        {item.trendDirection === "neutral" && <Minus size={12} />}
                        {item.trend}
                      </span>
                    )}

                    {hasDetails && (
                      <span className="p-1.5 rounded-lg text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-800/80 transition-colors">
                        <ExternalLink size={14} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Big Stat Display if present */}
                {item.statValue && (
                  <div className="mb-3">
                    <span className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      {item.statValue}
                    </span>
                    {item.statLabel && (
                      <span className="block text-xs uppercase font-medium tracking-wider text-slate-500 mt-0.5">
                        {item.statLabel}
                      </span>
                    )}
                  </div>
                )}

                {/* Title & Body */}
                <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-slate-100 transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-4 group-hover:text-slate-300 transition-colors">
                  {item.body}
                </p>
              </div>

              {/* Bottom Snippet / Preview Card */}
              {item.headerSnippet && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 font-mono text-xs text-slate-400 bg-slate-950/40 rounded-lg p-2.5 overflow-x-auto border">
                  <code>{item.headerSnippet}</code>
                </div>
              )}

              {/* Hover indicator for modal */}
              {hasDetails && (
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                  <span>Click to expand details</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
