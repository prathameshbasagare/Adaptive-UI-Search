// File: ./src/components/adaptive/RatingGrid.tsx

"use client";

import type { RatingGridItem } from "@/lib/types";

interface RatingGridProps {
  gridTitle?: string;
  criteria: string[];
  gridItems: RatingGridItem[];
}

function ScoreBar({ score }: { score: number }) {
  const clamped = Math.min(10, Math.max(0, score));
  const pct = (clamped / 10) * 100;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, var(--theme-600), var(--theme-400))`,
          }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums text-slate-400 shrink-0 w-6 text-right">{clamped}</span>
    </div>
  );
}

export default function RatingGrid({ gridTitle, criteria, gridItems }: RatingGridProps) {
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
      {gridTitle && (
        <div
          className="px-5 py-3 border-b border-slate-700 font-semibold text-white text-sm"
          style={{ background: "linear-gradient(to right, var(--theme-500-10), transparent)" }}
        >
          {gridTitle}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/60">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                Item
              </th>
              {criteria.map((c, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-center"
                >
                  {c}
                </th>
              ))}
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap text-center">
                Avg
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {gridItems.map((row, i) => {
              const vals = criteria.map((c) => row.scores[c] ?? 0);
              const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
              return (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-200 whitespace-nowrap">{row.item}</td>
                  {criteria.map((c, j) => (
                    <td key={j} className="px-4 py-3 min-w-[100px]">
                      <ScoreBar score={row.scores[c] ?? 0} />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <span
                      className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full"
                      style={{ color: "var(--theme-400)", backgroundColor: "var(--theme-500-20)" }}
                    >
                      {avg.toFixed(1)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
