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
  const activeTab = tabs[activeIndex];

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-slate-700 bg-slate-900/40">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              index === activeIndex
                ? "text-violet-300 border-violet-500 bg-slate-800/60"
                : "text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {activeTab && <TextBlock content={activeTab.content} />}
      </div>
    </div>
  );
}
