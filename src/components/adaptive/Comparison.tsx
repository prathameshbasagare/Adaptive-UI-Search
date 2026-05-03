// File: ./src/components/adaptive/Comparison.tsx

"use client";

import { Check, X, Minus } from "lucide-react";
import type { ComparisonSide } from "@/lib/types";

interface ComparisonProps {
  leftSide: ComparisonSide;
  rightSide: ComparisonSide;
}

const COLOR_CONFIG: Record<
  NonNullable<ComparisonSide["color"]>,
  { border: string; header: string; dot: string; icon: React.ElementType }
> = {
  green: {
    border: "border-emerald-500/40",
    header: "bg-emerald-500/10 border-b border-emerald-500/20",
    dot: "text-emerald-400",
    icon: Check,
  },
  red: {
    border: "border-red-500/40",
    header: "bg-red-500/10 border-b border-red-500/20",
    dot: "text-red-400",
    icon: X,
  },
  blue: {
    border: "border-blue-500/40",
    header: "bg-blue-500/10 border-b border-blue-500/20",
    dot: "text-blue-400",
    icon: Check,
  },
  neutral: {
    border: "border-slate-600",
    header: "bg-slate-800/60 border-b border-slate-700",
    dot: "text-slate-400",
    icon: Minus,
  },
};

function SideColumn({ side }: { side: ComparisonSide }) {
  const config = COLOR_CONFIG[side.color ?? "neutral"];
  const Icon = config.icon;

  return (
    <div className={`flex-1 border ${config.border} rounded-xl overflow-hidden`}>
      <div className={`px-4 py-3 ${config.header}`}>
        <h3 className="font-semibold text-white text-sm">{side.title}</h3>
      </div>
      <ul className="p-4 space-y-2.5">
        {side.items.map((item, index) => (
          <li key={index} className="flex items-start gap-2.5 text-sm text-slate-300">
            <Icon size={15} className={`${config.dot} shrink-0 mt-0.5`} />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Comparison({ leftSide, rightSide }: ComparisonProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <SideColumn side={leftSide} />
      <div className="hidden sm:flex items-center">
        <div className="w-px h-full bg-slate-700/60 mx-1" />
        <span className="text-xs text-slate-600 font-mono rotate-0 px-1">vs</span>
        <div className="w-px h-full bg-slate-700/60 mx-1" />
      </div>
      <SideColumn side={rightSide} />
    </div>
  );
}
