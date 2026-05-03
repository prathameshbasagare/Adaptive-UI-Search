// File: ./src/components/adaptive/KeyValueList.tsx

"use client";

import type { KeyValueEntry } from "@/lib/types";

interface KeyValueListProps {
  kvTitle?: string;
  entries: KeyValueEntry[];
}

export default function KeyValueList({ kvTitle, entries }: KeyValueListProps) {
  // Group by category
  const grouped = entries.reduce<Record<string, KeyValueEntry[]>>((acc, e) => {
    const cat = e.category ?? "";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(e);
    return acc;
  }, {});

  const categories = Object.keys(grouped);
  const hasCategories = categories.some((c) => c !== "");

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
      {kvTitle && (
        <div
          className="px-5 py-3 border-b border-slate-700 font-semibold text-white text-sm"
          style={{ background: "linear-gradient(to right, var(--theme-500-10), transparent)" }}
        >
          {kvTitle}
        </div>
      )}

      {hasCategories
        ? categories.map((cat) => (
            <div key={cat}>
              {cat && (
                <div className="px-5 py-2 bg-slate-900/40 border-b border-t border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{cat}</span>
                </div>
              )}
              <dl className="divide-y divide-slate-700/60">
                {grouped[cat].map((entry, i) => (
                  <Row key={i} entry={entry} />
                ))}
              </dl>
            </div>
          ))
        : (
            <dl className="divide-y divide-slate-700/60">
              {entries.map((entry, i) => (
                <Row key={i} entry={entry} />
              ))}
            </dl>
          )}
    </div>
  );
}

function Row({ entry }: { entry: KeyValueEntry }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3 hover:bg-slate-800/40 transition-colors">
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide min-w-0 shrink-0 w-1/3">{entry.key}</dt>
      <dd className="text-sm text-slate-200 text-right leading-relaxed">{entry.value}</dd>
    </div>
  );
}
