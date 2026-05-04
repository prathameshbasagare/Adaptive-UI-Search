// File: ./src/components/adaptive/ColorPalette.tsx

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { ColorSwatch } from "@/lib/types";

interface ColorPaletteProps {
  paletteTitle?: string;
  swatches: ColorSwatch[];
}

function Swatch({ swatch }: { swatch: ColorSwatch }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(swatch.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-500 dark:hover:border-slate-500 transition-colors cursor-pointer"
      onClick={handleCopy}
      title={`Copy ${swatch.hex}`}
    >
      <div
        className="h-16 sm:h-24 w-full"
        style={{ backgroundColor: swatch.hex }}
      />
      <div className="p-3 bg-slate-200/60 dark:bg-slate-800/60">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{swatch.name}</span>
          {copied ? (
            <Check size={13} className="shrink-0 text-emerald-400" />
          ) : (
            <Copy size={12} className="shrink-0 text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />
          )}
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-500">{swatch.hex}</span>
        {swatch.description && (
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-600 truncate">{swatch.description}</p>
        )}
      </div>
    </div>
  );
}

export default function ColorPalette({ paletteTitle, swatches }: ColorPaletteProps) {
  return (
    <div className="space-y-3">
      {paletteTitle && <h3 className="font-semibold text-slate-950 dark:text-white text-sm">{paletteTitle}</h3>}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {swatches.map((swatch, i) => (
          <Swatch key={i} swatch={swatch} />
        ))}
      </div>
    </div>
  );
}
