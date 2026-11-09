"use client";

import { useState } from "react";
import type { ComponentOf } from "@/lib/types";

type Props = Omit<ComponentOf<"hover_panels">, "type">;

/**
 * Expanding panels: on desktop a row of slim panels where the hovered /
 * focused one grows to reveal its details (flex-grow transition). On small
 * screens they stack vertically and expand on tap. Keyboard: Tab focuses and
 * expands a panel.
 */
export default function HoverPanels({ panelsTitle, panels }: Props) {
  const [active, setActive] = useState(0);

  return (
    <section>
      {panelsTitle && <h3 className="mb-4 text-lg font-semibold text-white">{panelsTitle}</h3>}
      <div className="flex flex-col md:flex-row gap-3 md:h-[400px]">
        {panels.map((p, i) => {
          const open = i === active;
          return (
            <button
              key={i}
              type="button"
              aria-expanded={open}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`group relative overflow-hidden rounded-3xl border text-left outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-[flex-grow,border-color,background-color] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] md:min-w-[72px] ${
                open ? "md:flex-[4] border-[var(--theme-500-60)] bg-slate-900" : "md:flex-1 border-slate-800 bg-slate-900/50 hover:bg-slate-900/80"
              }`}
            >
              {/* glow */}
              <div
                className={`absolute inset-0 transition-opacity duration-700 ${open ? "opacity-100" : "opacity-0"}`}
                style={{ background: "radial-gradient(120% 70% at 0% 100%, var(--theme-500-30), transparent 60%)" }}
                aria-hidden="true"
              />
              {/* collapsed label (desktop) */}
              <div
                className={`hidden md:flex absolute inset-0 flex-col items-center justify-end gap-4 pb-6 transition-opacity duration-300 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
                aria-hidden="true"
              >
                {p.icon && <span className="text-2xl">{p.icon}</span>}
                <span className="[writing-mode:vertical-rl] rotate-180 text-sm font-semibold tracking-wide text-slate-300 whitespace-nowrap">
                  {p.title}
                </span>
              </div>

              {/* content */}
              <div className="relative p-5 md:p-7 h-full flex flex-col">
                <div className={`flex items-center gap-3 md:transition-opacity md:duration-300 ${open ? "md:opacity-100 md:delay-200" : "md:opacity-0"}`}>
                  {p.icon && <span className="text-3xl">{p.icon}</span>}
                  <h4 className="text-lg md:text-2xl font-bold text-white">{p.title}</h4>
                </div>
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ${open ? "grid-rows-[1fr] opacity-100 md:delay-200" : "grid-rows-[0fr] opacity-0"} md:mt-auto`}
                >
                  <div className="min-h-0 overflow-hidden">
                    {p.stat && (
                      <p className="mt-4 text-4xl font-bold tracking-tight" style={{ color: "var(--theme-400)" }}>
                        {p.stat}
                      </p>
                    )}
                    <p className="mt-3 text-slate-200 font-medium">{p.summary}</p>
                    {p.details && <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-xl">{p.details}</p>}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
