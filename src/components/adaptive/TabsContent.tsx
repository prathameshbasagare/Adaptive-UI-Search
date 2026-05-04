// File: ./src/components/adaptive/TabsContent.tsx

"use client";

import { useState } from "react";
import type { TabContent } from "@/lib/types";
import TextBlock from "./TextBlock";

interface TabsContentProps {
  tabs: TabContent[];
}

export default function TabsContent({ tabs }: TabsContentProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="bg-slate-200/40 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex overflow-x-auto border-b border-slate-300 dark:border-slate-700 bg-slate-100/40 dark:bg-slate-900/40">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className="shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2"
            style={
              index === activeIndex
                ? { color: "var(--theme-400)", borderColor: "var(--theme-500)", backgroundColor: "rgba(255,255,255,0.03)" }
                : { color: "#94a3b8", borderColor: "transparent" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-5">
        {tabs[activeIndex] && <TextBlock content={tabs[activeIndex].content} />}
      </div>
    </div>
  );
}
