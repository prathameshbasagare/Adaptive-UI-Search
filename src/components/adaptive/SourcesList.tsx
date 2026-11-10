// File: ./src/components/adaptive/SourcesList.tsx

"use client";

import { Globe, ArrowUpRight } from "lucide-react";
import type { WebSource } from "@/lib/types";

function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

/** Web results the answer was grounded on. Rendered from server data only. */
export default function SourcesList({ sources }: { sources: WebSource[] }) {
  if (!sources.length) return null;
  return (
    <section id="sources" aria-labelledby="sources-heading" className="scroll-mt-6 space-y-3">
      <h2 id="sources-heading" className="flex items-center gap-2 text-sm font-semibold text-slate-300">
        <Globe size={15} style={{ color: "var(--theme-400)" }} />
        Sources
        <span className="text-xs font-normal text-slate-500">· web results this answer was based on</span>
      </h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((s, i) => {
          const date = formatDate(s.publishedDate);
          return (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-[var(--theme-500-60)] hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                    style={{ background: "var(--theme-500-20)", color: "var(--theme-400)" }}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span className="truncate">{s.domain}</span>
                  {date && <span className="shrink-0">· {date}</span>}
                  <ArrowUpRight size={13} className="ml-auto shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                </div>
                <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-200 group-hover:text-white">{s.title}</p>
                {s.snippet && <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{s.snippet}</p>}
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
