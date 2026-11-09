// File: ./src/components/adaptive/Accordion.tsx

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AccordionItem } from "@/lib/types";

interface AccordionProps {
  items: AccordionItem[];
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="rounded-xl border border-slate-700 overflow-hidden divide-y divide-slate-700/60">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className="bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-slate-200 text-sm leading-snug">{item.question}</span>
              <ChevronDown
                size={16}
                className="shrink-0 text-slate-400 transition-transform duration-200"
                style={{
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  color: isOpen ? "var(--theme-400)" : undefined,
                }}
              />
            </button>
            {/* grid-rows trick animates to the content's real height (max-h-96 clipped long answers) */}
            <div
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
              inert={!isOpen}
            >
              <div className="min-h-0 overflow-hidden">
              <p className="px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-slate-700/40 pt-3">
                {item.answer}
              </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
