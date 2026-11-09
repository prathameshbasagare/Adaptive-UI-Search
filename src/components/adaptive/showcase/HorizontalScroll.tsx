"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, getScroller, MOTION_OK } from "@/lib/motion";
import type { ComponentOf } from "@/lib/types";

type Props = Omit<ComponentOf<"horizontal_scroll">, "type">;

const STICKY_TOP = 16;

/**
 * Pinned horizontal gallery: vertical scroll drives the panel track sideways
 * (CSS sticky + scrubbed ScrollTrigger). On narrow screens / reduced motion it
 * degrades to a native swipeable, snap-scrolling row.
 */
export default function HorizontalScroll({ sectionTitle, panels }: Props) {
  const outer = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [progress, setProgress] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`(min-width: 768px) and ${MOTION_OK}`, () => {
        const measure = () => Math.max(0, track.current!.scrollWidth - viewport.current!.clientWidth);
        setPinned(true);
        setDistance(measure());
        const ro = new ResizeObserver(() => setDistance(measure()));
        ro.observe(viewport.current!);

        const tween = gsap.to(track.current, {
          x: () => -measure(),
          ease: "none",
          scrollTrigger: {
            trigger: outer.current,
            scroller: getScroller(),
            start: `top top+=${STICKY_TOP}`,
            end: () => `+=${measure()}`,
            scrub: 0.5,
            invalidateOnRefresh: true,
            onUpdate: (self) => setProgress(self.progress),
          },
        });
        gsap.fromTo(".hs-panel", { y: 60, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: outer.current, scroller: getScroller(), start: "top 75%" },
        });
        return () => {
          ro.disconnect();
          tween.kill();
          setPinned(false);
          setDistance(0);
        };
      });
    },
    { scope: outer, dependencies: [panels.length] }
  );

  return (
    // Outer height = pinned frame + horizontal distance, so the sticky frame
    // stays put for exactly as long as the track needs to travel.
    <section ref={outer} className="relative" style={pinned ? { height: `calc(min(62vh, 480px) + ${distance}px)` } : undefined}>
      <div
        className={`${pinned ? "sticky" : ""} rounded-3xl border border-slate-800 bg-slate-950/70 overflow-hidden flex flex-col`}
        style={pinned ? { top: STICKY_TOP, height: "min(62vh, 480px)" } : undefined}
      >
        <div className="flex items-center justify-between gap-4 px-6 sm:px-8 pt-6">
          {sectionTitle && <h3 className="text-lg sm:text-xl font-semibold text-white">{sectionTitle}</h3>}
          <div className="flex items-center gap-3 text-xs text-slate-500 tabular-nums" aria-hidden="true">
            <span>{String(Math.min(panels.length, Math.floor(progress * panels.length) + 1)).padStart(2, "0")}</span>
            <span className="relative h-0.5 w-24 sm:w-40 rounded-full bg-slate-800 overflow-hidden">
              <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(4, progress * 100)}%`, background: "var(--theme-500)" }} />
            </span>
            <span>{String(panels.length).padStart(2, "0")}</span>
          </div>
        </div>

        <div
          ref={viewport}
          onScroll={
            pinned
              ? undefined
              : (e) => {
                  const el = e.currentTarget;
                  const max = el.scrollWidth - el.clientWidth;
                  setProgress(max > 0 ? el.scrollLeft / max : 0);
                }
          }
          className={`flex-1 min-h-0 ${pinned ? "overflow-hidden" : "overflow-x-auto snap-x snap-mandatory scrollbar-thin"} px-6 sm:px-8 py-6 [mask-image:linear-gradient(90deg,transparent,black_3%,black_97%,transparent)]`}
        >
          <div ref={track} className="flex h-full gap-5 will-change-transform">
            {panels.map((p, i) => (
              <div key={i} className="hs-panel shrink-0 snap-start w-[78vw] sm:w-[340px] lg:w-[380px] flex">
              <article
                className="group relative w-full min-h-[240px] rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 flex flex-col overflow-hidden transition-[transform,border-color] duration-500 hover:-translate-y-1 hover:border-[var(--theme-500-60)]"
              >
                <div
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "var(--theme-500-30)" }}
                  aria-hidden="true"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-600">{String(i + 1).padStart(2, "0")}</span>
                  {p.tag && (
                    <span className="text-[11px] rounded-full px-2 py-0.5 border" style={{ borderColor: "var(--theme-500-30)", color: "var(--theme-400)" }}>
                      {p.tag}
                    </span>
                  )}
                </div>
                {p.icon && <div className="mt-6 text-6xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 origin-left">{p.icon}</div>}
                <h4 className="mt-auto pt-6 text-xl font-semibold text-white">{p.title}</h4>
                {p.stat && <p className="mt-1 text-2xl font-bold" style={{ color: "var(--theme-400)" }}>{p.stat}</p>}
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{p.body}</p>
              </article>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
