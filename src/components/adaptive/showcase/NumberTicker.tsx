"use client";

import { useRef } from "react";
import { gsap, useGSAP, getScroller, MOTION_OK } from "@/lib/motion";
import type { ComponentOf } from "@/lib/types";

type Props = Omit<ComponentOf<"number_ticker">, "type">;

// Full class names so Tailwind can see them at build time.
const LG_COLS: Record<number, string> = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" };

function format(n: number, decimals: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * Oversized KPIs that count up when scrolled into view, with an animated ring
 * and a hover lift + glow that follows the pointer.
 */
export default function NumberTicker({ tickerTitle, items }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scroller = getScroller();
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.utils.toArray<HTMLElement>(".nt-item", root.current).forEach((el, i) => {
          const item = items[i];
          const out = el.querySelector<HTMLElement>(".nt-value")!;
          const ring = el.querySelector<SVGCircleElement>(".nt-ring");
          const counter = { v: 0 };
          const tl = gsap.timeline({
            scrollTrigger: { trigger: el, scroller, start: "top 85%", toggleActions: "play none none none" },
          });
          tl.fromTo(el, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, i * 0.08).to(
            counter,
            {
              v: item.value,
              duration: 1.8,
              ease: "power2.out",
              onUpdate: () => (out.textContent = format(counter.v, item.decimals)),
            },
            "<0.1"
          );
          if (ring && item.percent !== undefined) {
            tl.fromTo(ring, { strokeDashoffset: 100 }, { strokeDashoffset: 100 - item.percent, duration: 1.8, ease: "power2.out" }, "<");
          }
        });
      });
    },
    { scope: root, dependencies: [items] }
  );

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section ref={root}>
      {tickerTitle && <h3 className="mb-4 text-lg font-semibold text-white">{tickerTitle}</h3>}
      <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${LG_COLS[Math.min(items.length, 4)] ?? ""}`}>
        {items.map((it, i) => (
          <div key={i} className="nt-item">
          <article
            onPointerMove={onMove}
            className="group h-full relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition-transform duration-300 hover:-translate-y-1"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), var(--theme-500-20), transparent 70%)" }}
              aria-hidden="true"
            />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="text-4xl sm:text-5xl font-bold tracking-tight text-white tabular-nums whitespace-nowrap">
                  {it.prefix}
                  <span className="nt-value">{format(it.value, it.decimals)}</span>
                  <span style={{ color: "var(--theme-400)" }}>{it.suffix}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-300">{it.label}</p>
              </div>
              {it.percent !== undefined && (
              <svg viewBox="0 0 36 36" className="h-12 w-12 shrink-0 -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="3" />
                <circle
                  className="nt-ring"
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="var(--theme-500)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray="100"
                  strokeDashoffset={100 - it.percent}
                />
              </svg>
              )}
            </div>
            {it.description && <p className="relative mt-3 text-xs text-slate-500 leading-relaxed">{it.description}</p>}
          </article>
          </div>
        ))}
      </div>
    </section>
  );
}
