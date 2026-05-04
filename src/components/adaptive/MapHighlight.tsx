// File: ./src/components/adaptive/MapHighlight.tsx

"use client";

import type { MapHighlightEntry } from "@/lib/types";
import { useThemeStore } from "@/hooks/useThemeStore";

interface MapHighlightProps {
  mapTitle?: string;
  highlights: MapHighlightEntry[];
}

export default function MapHighlight({ mapTitle, highlights }: MapHighlightProps) {
  const { mode } = useThemeStore();
  const normalized = highlights
    .map((h) => ({
      country: h.country,
      value: h.value,
      key: h.country.trim().toLowerCase(),
    }))
    .filter((h) => h.key.length > 0);

  return (
    <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
      {mapTitle && (
        <div
          className="px-5 py-3 border-b border-slate-300 dark:border-slate-700 font-semibold text-slate-950 dark:text-white text-sm"
          style={{ background: "linear-gradient(to right, var(--theme-500-10), transparent)" }}
        >
          {mapTitle}
        </div>
      )}

      {/* Stylized world banner (no external map dependency) */}
      <div className="px-5 pt-5">
        <div className="relative overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 20% 30%, var(--theme-500-20), transparent 55%), radial-gradient(circle at 70% 55%, var(--theme-500-10), transparent 60%)",
            }}
          />
          <svg viewBox="0 0 800 200" className="relative w-full h-auto block">
            {/* Abstract continent blobs */}
            <path d="M80 120 C110 70, 170 55, 210 80 C250 105, 260 150, 220 165 C170 185, 120 170, 80 120 Z" fill={mode === "light" ? "#cbd5e1" : "#1e293b"} />
            <path d="M260 70 C300 35, 360 35, 395 65 C425 92, 430 135, 400 155 C365 178, 305 170, 280 135 C255 100, 240 95, 260 70 Z" fill={mode === "light" ? "#cbd5e1" : "#1e293b"} />
            <path d="M470 95 C500 55, 565 50, 605 80 C650 115, 645 165, 605 175 C560 188, 510 168, 485 140 C460 115, 450 120, 470 95 Z" fill={mode === "light" ? "#cbd5e1" : "#1e293b"} />
            <path d="M650 105 C680 80, 725 90, 745 120 C765 150, 740 180, 705 178 C675 176, 635 130, 650 105 Z" fill={mode === "light" ? "#cbd5e1" : "#1e293b"} />

            {/* Highlight dots */}
            {normalized.slice(0, 10).map((h, i) => (
              <circle
                key={h.key}
                cx={120 + (i * 58) % 640}
                cy={70 + ((i * 37) % 90)}
                r={6}
                fill="var(--theme-500)"
                opacity={0.9}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Country chips */}
      {normalized.length > 0 && (
        <div className="px-5 py-4 flex flex-wrap gap-2">
          {normalized.map((h, i) => (
            <span
              key={`${h.key}-${i}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: "var(--theme-500-10)", borderColor: "var(--theme-500-20)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "var(--theme-500)" }} />
              {h.country}
              {h.value && <span className="text-slate-500 dark:text-slate-500">· {h.value}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
