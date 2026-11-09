"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger, getScroller, MOTION_OK } from "@/lib/motion";
import type { ComponentOf } from "@/lib/types";

type Props = Omit<ComponentOf<"scroll_story">, "type">;

/**
 * Scrollytelling: a sticky "stage" on the left swaps its visual / big stat as
 * each chapter on the right scrolls through the centre of the viewport.
 * On small screens the stage is inlined into every chapter instead.
 */
export default function ScrollStory({ storyTitle, chapters }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scroller = getScroller();
      const steps = gsap.utils.toArray<HTMLElement>(".ss-chapter", root.current);
      const triggers = steps.map((step, i) =>
        ScrollTrigger.create({
          trigger: step,
          scroller,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        })
      );
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          progressRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: ".ss-chapters", scroller, start: "top 55%", end: "bottom 55%", scrub: true },
          }
        );
        steps.forEach((step) =>
          gsap.fromTo(step.querySelector(".ss-body"), { y: 40, opacity: 0 }, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: step, scroller, start: "top 80%", toggleActions: "play none none reverse" },
          })
        );
      });
      return () => triggers.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [chapters.length] }
  );

  const current = chapters[active] ?? chapters[0];

  return (
    <section ref={root} className="rounded-3xl border border-slate-800 bg-slate-950/60">
      {storyTitle && (
        <h3 className="px-6 sm:px-10 pt-8 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--theme-400)" }}>
          {storyTitle}
        </h3>
      )}
      <div className="grid lg:grid-cols-2 gap-8 px-6 sm:px-10 py-8">
        {/* Sticky stage (desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-6 h-[min(68vh,520px)] rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 transition-[background] duration-700" aria-hidden="true"
                 style={{ background: `radial-gradient(circle at ${30 + active * 15}% ${35 + (active % 2) * 30}%, var(--theme-500-30), transparent 60%)` }} />
            <div key={active} className="relative text-center px-8 animate-fadeIn" aria-live="polite">
              {current.visual && <div className="text-7xl mb-6 drop-shadow-[0_10px_30px_var(--theme-500-40)]">{current.visual}</div>}
              {current.stat && <div className="text-6xl font-bold tracking-tight text-white">{current.stat}</div>}
              {current.statLabel && <div className="mt-2 text-sm uppercase tracking-wider text-slate-400">{current.statLabel}</div>}
              {!current.visual && !current.stat && <div className="text-3xl font-semibold text-white">{current.title}</div>}
            </div>
            {/* chapter dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2" aria-hidden="true">
              {chapters.map((_, i) => (
                <span key={i} className="h-1.5 rounded-full transition-all duration-500"
                      style={{ width: i === active ? 24 : 6, background: i === active ? "var(--theme-400)" : "#334155" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Chapters */}
        <ol className="ss-chapters relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-800" aria-hidden="true">
            <div ref={progressRef} className="h-full w-full origin-top" style={{ background: "var(--theme-500)" }} />
          </div>
          {chapters.map((c, i) => (
            <li key={i} className="ss-chapter relative pl-10 lg:min-h-[42vh] py-6 lg:pt-[10vh] lg:pb-[6vh]">
              <span
                className="absolute left-0 top-7 lg:top-[calc(10vh+4px)] h-6 w-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-colors duration-300"
                style={{
                  borderColor: i <= active ? "var(--theme-500)" : "#334155",
                  background: i === active ? "var(--theme-500)" : "#020617",
                  color: i === active ? "white" : "#64748b",
                }}
              >
                {i + 1}
              </span>
              <div className="ss-body">
                {/* inline stage for small screens */}
                {(c.visual || c.stat) && (
                  <div className="lg:hidden mb-3 flex items-baseline gap-3">
                    {c.visual && <span className="text-4xl">{c.visual}</span>}
                    {c.stat && <span className="text-3xl font-bold text-white">{c.stat}</span>}
                    {c.statLabel && <span className="text-xs uppercase text-slate-500">{c.statLabel}</span>}
                  </div>
                )}
                <h4 className={`text-xl sm:text-2xl font-semibold transition-colors duration-300 ${i === active ? "text-white" : "text-slate-400"}`}>
                  {c.title}
                </h4>
                <p className={`mt-3 leading-relaxed transition-colors duration-300 ${i === active ? "text-slate-300" : "text-slate-500"}`}>{c.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
