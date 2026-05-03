// File: ./src/components/adaptive/MapHighlight.tsx

"use client";

import { useState } from "react";
import type { MapHighlightEntry } from "@/lib/types";

interface MapHighlightProps {
  mapTitle?: string;
  highlights: MapHighlightEntry[];
}

/*
 * Lightweight SVG world map using react-simple-maps.
 * Falls back gracefully to a list if the library isn't loaded.
 */
export default function MapHighlight({ mapTitle, highlights }: MapHighlightProps) {
  // Dynamically import react-simple-maps only on client
  const [MapComponents, setMapComponents] = useState<null | {
    ComposableMap: React.ComponentType<React.SVGProps<SVGSVGElement> & { projectionConfig?: Record<string, unknown> }>;
    Geographies: React.ComponentType<{ geography: string; children: (props: { geographies: Array<{ rsmKey: string; properties: { ISO_A3: string; NAME: string } }> }) => React.ReactNode }>;
    Geography: React.ComponentType<{ geography: unknown; fill?: string; stroke?: string; strokeWidth?: number; style?: { default?: React.CSSProperties; hover?: React.CSSProperties; pressed?: React.CSSProperties } }>;
  }>(null);

  // We import dynamically to avoid SSR issues
  if (typeof window !== "undefined" && !MapComponents) {
    import("react-simple-maps")
      .then((m) => setMapComponents(m as unknown as typeof MapComponents))
      .catch(() => null);
  }

  const countrySet = new Map(highlights.map((h) => [h.country.toLowerCase(), h.value]));

  const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  if (!MapComponents) {
    // Skeleton / fallback list while the lib loads
    return (
      <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 space-y-3">
        {mapTitle && <h3 className="font-semibold text-white text-sm">{mapTitle}</h3>}
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {highlights.map((h, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/60 rounded-lg px-3 py-2"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: "var(--theme-500)" }}
              />
              <span className="truncate">{h.country}</span>
              {h.value && <span className="ml-auto text-xs text-slate-500 shrink-0">{h.value}</span>}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const { ComposableMap, Geographies, Geography } = MapComponents;

  return (
    <div className="bg-slate-900/60 border border-slate-700 rounded-xl overflow-hidden">
      {mapTitle && (
        <div
          className="px-5 py-3 border-b border-slate-700 font-semibold text-white text-sm"
          style={{ background: "linear-gradient(to right, var(--theme-500-10), transparent)" }}
        >
          {mapTitle}
        </div>
      )}
      <div className="p-2">
        <ComposableMap projectionConfig={{ scale: 145 }} style={{ width: "100%", height: "auto" }}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.NAME?.toLowerCase() ?? "";
                const iso = geo.properties.ISO_A3?.toLowerCase() ?? "";
                const isHighlighted = countrySet.has(name) || countrySet.has(iso);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isHighlighted ? "var(--theme-500)" : "#1e293b"}
                    stroke="#0f172a"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: isHighlighted ? "var(--theme-400)" : "#334155", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
      {highlights.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {highlights.map((h, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 px-2.5 py-1 rounded-full border"
              style={{ backgroundColor: "var(--theme-500-10)", borderColor: "var(--theme-500-20)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "var(--theme-500)" }} />
              {h.country}
              {h.value && <span className="text-slate-500">· {h.value}</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
