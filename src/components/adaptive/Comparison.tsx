// File: ./src/components/adaptive/Comparison.tsx

"use client";

import { Check, X, Minus } from "lucide-react";
import type { ComparisonSide } from "@/lib/types";

interface ComparisonProps {
  leftSide: ComparisonSide;
  rightSide: ComparisonSide;
}

/*
 * Green/red treatment is reserved for pros/cons only.
 * Any other comparison gets the theme-colored neutral treatment.
 */
function isProsConsContext(left: ComparisonSide, right: ComparisonSide): boolean {
  const proKeywords = /^(pros?|advantages?|benefits?|strengths?|positives?)$/i;
  const conKeywords = /^(cons?|disadvantages?|drawbacks?|weaknesses?|negatives?|limitations?)$/i;
  return proKeywords.test(left.title) || conKeywords.test(right.title) || left.color === "green" || right.color === "red";
}

type PaletteKey = "green" | "red" | "blue" | "neutral" | "theme";

const FIXED_PALETTES: Record<Exclude<PaletteKey, "theme">, { border: string; header: string; icon: React.ElementType; iconColor: string }> = {
  green: {
    border: "border-emerald-500/40",
    header: "bg-emerald-500/10 border-b border-emerald-500/20",
    icon: Check,
    iconColor: "text-emerald-400",
  },
  red: {
    border: "border-red-500/40",
    header: "bg-red-500/10 border-b border-red-500/20",
    icon: X,
    iconColor: "text-red-400",
  },
  blue: {
    border: "border-blue-500/40",
    header: "bg-blue-500/10 border-b border-blue-500/20",
    icon: Minus,
    iconColor: "text-blue-400",
  },
  neutral: {
    border: "border-slate-600",
    header: "bg-slate-800/60 border-b border-slate-700",
    icon: Minus,
    iconColor: "text-slate-400",
  },
};

function SideColumn({ side, isProsCons }: { side: ComparisonSide; isProsCons: boolean }) {
  // For pros/cons use the original color. For neutral comparisons, use theme vars.
  if (!isProsCons || !side.color || side.color === "neutral") {
    return (
      <div
        className="flex-1 border rounded-xl overflow-hidden"
        style={{ borderColor: "var(--theme-500-30)" }}
      >
        <div
          className="px-4 py-3 border-b"
          style={{ backgroundColor: "var(--theme-500-10)", borderColor: "var(--theme-500-20)" }}
        >
          <h3 className="font-semibold text-slate-950 dark:text-white text-sm">{side.title}</h3>
        </div>
        <ul className="p-4 space-y-2.5">
          {side.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
              <Minus size={15} className="shrink-0 mt-0.5" style={{ color: "var(--theme-400)" }} />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const palette = FIXED_PALETTES[side.color] ?? FIXED_PALETTES.neutral;
  const Icon = palette.icon;

  return (
    <div className={`flex-1 border ${palette.border} rounded-xl overflow-hidden`}>
      <div className={`px-4 py-3 ${palette.header}`}>
        <h3 className="font-semibold text-slate-950 dark:text-white text-sm">{side.title}</h3>
      </div>
      <ul className="p-4 space-y-2.5">
        {side.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
            <Icon size={15} className={`${palette.iconColor} shrink-0 mt-0.5`} />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Comparison({ leftSide, rightSide }: ComparisonProps) {
  const isProsCons = isProsConsContext(leftSide, rightSide);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <SideColumn side={leftSide} isProsCons={isProsCons} />
      <div className="hidden sm:flex items-center self-stretch">
        <div className="flex flex-col items-center gap-1">
          <div className="w-px flex-1 bg-slate-300/60 dark:bg-slate-700/60" />
          <span className="text-xs text-slate-400 dark:text-slate-600 font-mono">vs</span>
          <div className="w-px flex-1 bg-slate-300/60 dark:bg-slate-700/60" />
        </div>
      </div>
      <SideColumn side={rightSide} isProsCons={isProsCons} />
    </div>
  );
}
