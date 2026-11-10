"use client";

import type { ComponentOf } from "@/lib/types";

type Props = Omit<ComponentOf<"marquee">, "type">;

const DURATION = { slow: 60, normal: 38, fast: 22 } as const;

/**
 * Infinite ticker of chips (tech stack, partners, facts). Long lists split
 * into two rows moving in opposite directions. Hovering pauses the row and
 * lifts the chip to reveal its detail. Pure CSS animation; reduced motion
 * turns it into a wrapped, static list.
 */
export default function Marquee({ marqueeTitle, items, speed }: Props) {
  const rows = items.length >= 10 ? [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)] : [items];
  const base = DURATION[speed];

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/60 py-6">
      {marqueeTitle && <h3 className="px-6 mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{marqueeTitle}</h3>}
      <ul className="sr-only">
        {items.map((it, i) => (
          <li key={i}>
            {it.label}
            {it.detail ? ` — ${it.detail}` : ""}
          </li>
        ))}
      </ul>
      <div className="space-y-3" aria-hidden="true">
        {rows.map((row, r) => (
          <div
            key={r}
            className="group/row relative overflow-hidden motion-reduce:overflow-visible [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
          >
            <div
              className="marquee-track flex w-max group-hover/row:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:px-6"
              style={{
                animationDuration: `${base + row.length * 1.5}s`,
                animationDirection: r % 2 ? "reverse" : "normal",
              }}
            >
              {/* Two identical copies, each with trailing padding equal to the gap,
                  so translating by -50% lands exactly on the seam. */}
              {[0, 1].map((copy) => (
                <div key={copy} className={`flex gap-3 pr-3 motion-reduce:flex-wrap ${copy ? "motion-reduce:hidden" : ""}`}>
                {row.map((it, i) => (
                  <span
                    key={i}
                    className="group/chip relative inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 text-sm text-slate-300 whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--theme-500-60)] hover:text-white hover:bg-slate-900"
                  >
                    {it.icon && <span className="text-base">{it.icon}</span>}
                    {it.label}
                    {it.detail && (
                      <span className="max-w-0 overflow-hidden opacity-0 group-hover/chip:max-w-[220px] group-hover/chip:opacity-100 transition-all duration-500 text-xs" style={{ color: "var(--theme-400)" }}>
                        · {it.detail}
                      </span>
                    )}
                  </span>
                ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
