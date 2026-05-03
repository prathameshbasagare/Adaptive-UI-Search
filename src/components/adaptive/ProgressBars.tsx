// File: ./src/components/adaptive/ProgressBars.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import type { ProgressItem } from "@/lib/types";

interface ProgressBarsProps {
  progressTitle?: string;
  items: ProgressItem[];
}

const BAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-cyan-500",
];

function ProgressBar({
  item,
  colorClass,
  animate,
}: {
  item: ProgressItem;
  colorClass: string;
  animate: boolean;
}) {
  const clamped = Math.min(100, Math.max(0, item.value));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300 font-medium">{item.label}</span>
        <span className="text-slate-400 font-mono text-xs tabular-nums">{clamped}%</span>
      </div>
      <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: animate ? `${clamped}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export default function ProgressBars({ progressTitle, items }: ProgressBarsProps) {
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Trigger fill animation when component enters viewport
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 space-y-4">
      {progressTitle && (
        <h3 className="font-semibold text-white text-sm">{progressTitle}</h3>
      )}
      {items.map((item, index) => (
        <ProgressBar
          key={index}
          item={item}
          colorClass={BAR_COLORS[index % BAR_COLORS.length]}
          animate={animate}
        />
      ))}
    </div>
  );
}
