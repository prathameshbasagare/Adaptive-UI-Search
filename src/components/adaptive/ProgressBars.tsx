// File: ./src/components/adaptive/ProgressBars.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import type { ProgressItem } from "@/lib/types";

interface ProgressBarsProps {
  progressTitle?: string;
  items: ProgressItem[];
}

function ProgressBar({ item, animate, index }: { item: ProgressItem; animate: boolean; index: number }) {
  const clamped = Math.min(100, Math.max(0, item.value));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
        <span className="text-slate-600 dark:text-slate-400 font-mono text-xs tabular-nums">{clamped}%</span>
      </div>
      <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300/60 dark:border-slate-700/60">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: animate ? `${clamped}%` : "0%",
            background: `linear-gradient(to right, var(--theme-600), var(--theme-400))`,
            transitionDelay: `${index * 80}ms`,
          }}
        />
      </div>
    </div>
  );
}

export default function ProgressBars({ progressTitle, items }: ProgressBarsProps) {
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
    <div ref={ref} className="bg-slate-200/40 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 rounded-xl p-5 space-y-4">
      {progressTitle && <h3 className="font-semibold text-slate-950 dark:text-white text-sm">{progressTitle}</h3>}
      {items.map((item, index) => (
        <ProgressBar key={index} item={item} animate={animate} index={index} />
      ))}
    </div>
  );
}
