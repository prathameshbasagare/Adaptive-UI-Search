"use client";

import { useRef } from "react";
import { gsap, useGSAP, getScroller, MOTION_OK } from "@/lib/motion";
import type { ComponentOf } from "@/lib/types";

type Props = Omit<ComponentOf<"stacking_cards">, "type">;

const BASE_TOP = 24;
const OFFSET = 28;

/**
 * Sticky card stack: each card pins slightly below the previous one, and as
 * the next card slides over it, the covered card scales down and dims
 * (scrubbed per card). Without motion it is a plain vertical list.
 */
export default function StackingCards({ stackTitle, cards }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const scroller = getScroller();
        const items = gsap.utils.toArray<HTMLElement>(".sc-card", root.current);
        items.forEach((card, i) => {
          if (i === items.length - 1) return;
          const next = items[i + 1];
          const inner = card.querySelector<HTMLElement>(".sc-inner")!;
          const shade = card.querySelector<HTMLElement>(".sc-shade")!;
          const remaining = items.length - 1 - i;
          const pinnedTop = BASE_TOP + i * OFFSET;

          // Explicit fromTo: tweening `filter` from "none" made GSAP start at
          // brightness(0), i.e. cards were black before anything covered them.
          // A shade overlay is also far cheaper to animate than a filter.
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: next,
              scroller,
              // Starts when the next card's top reaches this card's pinned bottom
              // (the moment it begins to overlap) and ends when it settles.
              start: () => `top ${pinnedTop + inner.offsetHeight}px`,
              end: () => `top ${BASE_TOP + (i + 1) * OFFSET}px`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
          tl.fromTo(inner, { scale: 1 }, { scale: 1 - remaining * 0.04, ease: "none" }, 0).fromTo(
            shade,
            { opacity: 0 },
            { opacity: 0.45, ease: "none" },
            0
          );
        });
      });
    },
    { scope: root, dependencies: [cards.length] }
  );

  return (
    <section ref={root} className="relative">
      {stackTitle && <h3 className="mb-6 text-lg sm:text-xl font-semibold text-white">{stackTitle}</h3>}
      <ol className="space-y-8">
        {cards.map((c, i) => (
          <li key={i} className="sc-card sticky" style={{ top: BASE_TOP + i * OFFSET, zIndex: i + 1 }}>
            <div className="sc-inner relative origin-top will-change-transform rounded-3xl border border-slate-800 bg-slate-900 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
              <div className="sc-shade pointer-events-none absolute inset-0 z-10 bg-black opacity-0" aria-hidden="true" />
              <div className="grid sm:grid-cols-[1fr_auto] gap-6 p-6 sm:p-10 min-h-[260px] relative">
                <div
                  className="absolute inset-0 opacity-60 pointer-events-none"
                  style={{ background: `radial-gradient(120% 80% at ${i % 2 ? "100%" : "0%"} 0%, var(--theme-500-20), transparent 60%)` }}
                  aria-hidden="true"
                />
                <div className="relative">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-slate-500">
                      {String(i + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
                    </span>
                    {c.tag && (
                      <span className="rounded-full px-2 py-0.5" style={{ background: "var(--theme-500-20)", color: "var(--theme-400)" }}>
                        {c.tag}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-white">{c.title}</h4>
                  <p className="mt-3 max-w-2xl text-slate-400 leading-relaxed">{c.body}</p>
                  {c.points && c.points.length > 0 && (
                    <ul className="mt-5 grid sm:grid-cols-2 gap-2">
                      {c.points.map((p, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--theme-400)" }} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {c.icon && (
                  <div className="relative hidden sm:flex items-center justify-center h-32 w-32 rounded-3xl border border-slate-800 bg-slate-950/60 text-6xl">
                    {c.icon}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
        {/* Spacer: lets the completed stack hold before it scrolls away. It must be
            a real element — sticky items are bounded by the list's CONTENT box,
            so padding-bottom on the <ol> would not extend the pinned range. */}
        <li aria-hidden="true" className="h-[22vh]" />
      </ol>
    </section>
  );
}
