// File: ./src/components/adaptive/MapHighlight.tsx

"use client";

import type { MapHighlightEntry } from "@/lib/types";
import { CONTINENT_PATHS, MAP_H, MAP_W, countryPoint } from "@/lib/geo";

interface MapHighlightProps {
  mapTitle?: string;
  highlights: MapHighlightEntry[];
}

export default function MapHighlight({ mapTitle, highlights }: MapHighlightProps) {
  const seen = new Set<string>();
  const entries = highlights
    .map((h) => ({ ...h, key: h.country.trim().toLowerCase(), point: countryPoint(h.country) }))
    .filter((h) => h.key && !seen.has(h.key) && (seen.add(h.key), true));
  const plotted = entries.filter((h) => h.point);

  return (
    <figure className="bg-slate-900/60 border border-slate-700 rounded-xl overflow-hidden">
      {mapTitle && (
        <figcaption
          className="px-5 py-3 border-b border-slate-700 font-semibold text-white text-sm"
          style={{ background: "linear-gradient(to right, var(--theme-500-10), transparent)" }}
        >
          {mapTitle}
        </figcaption>
      )}

      <div className="px-5 pt-5">
        <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="relative w-full h-auto block"
            role="img"
            aria-label={`Map highlighting ${entries.map((e) => e.country).join(", ")}`}
          >
            {CONTINENT_PATHS.map((d, i) => (
              <path key={i} d={d} fill="#1e293b" stroke="#334155" strokeWidth="0.75" strokeLinejoin="round" />
            ))}

            {plotted.map((h) => {
              const [x, y] = h.point as [number, number];
              return (
                <g key={h.key}>
                  <title>{h.value ? `${h.country}: ${h.value}` : h.country}</title>
                  <circle cx={x} cy={y} r={14} fill="var(--theme-500-20)" className="animate-pulse" />
                  <circle cx={x} cy={y} r={5} fill="var(--theme-500)" stroke="#0f172a" strokeWidth="1.5" />
                  <text
                    x={x}
                    y={y - 11}
                    textAnchor="middle"
                    fontSize="11"
                    fontFamily="system-ui, sans-serif"
                    fill="#e2e8f0"
                    stroke="#020617"
                    strokeWidth="3"
                    paintOrder="stroke"
                  >
                    {h.country}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="px-5 py-4 flex flex-wrap gap-2">
          {entries.map((h) => (
            <span
              key={h.key}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: "var(--theme-500-10)", borderColor: "var(--theme-500-20)" }}
              title={h.point ? undefined : "Location not shown on map"}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: h.point ? "var(--theme-500)" : "#475569" }}
              />
              {h.country}
              {h.value && <span className="text-slate-500">· {h.value}</span>}
            </span>
          ))}
        </div>
      )}
    </figure>
  );
}
