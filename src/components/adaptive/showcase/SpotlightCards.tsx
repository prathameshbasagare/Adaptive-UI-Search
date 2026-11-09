"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, getScroller } from "@/lib/motion";
import type { ComponentOf } from "@/lib/types";

type Props = Omit<ComponentOf<"spotlight_cards">, "type">;

/**
 * Cards with a cursor-following spotlight + glowing border, and a subtle 3D
 * tilt toward the pointer (smoothed with gsap.quickTo). The spotlight also
 * bleeds across neighbouring cards because it is tracked at grid level.
 */
export default function SpotlightCards({ gridTitle, cards }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(".sp-card", { y: 40, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top 85%" },
        });
        const cleanups = gsap.utils.toArray<HTMLElement>(".sp-card", root.current).map((card) => {
          const inner = card.querySelector<HTMLElement>(".sp-inner")!;
          const rx = gsap.quickTo(inner, "rotationX", { duration: 0.5, ease: "power3.out" });
          const ry = gsap.quickTo(inner, "rotationY", { duration: 0.5, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 12);
            rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
          };
          const leave = () => (rx(0), ry(0));
          card.addEventListener("pointermove", move);
          card.addEventListener("pointerleave", leave);
          return () => {
            card.removeEventListener("pointermove", move);
            card.removeEventListener("pointerleave", leave);
          };
        });
        return () => cleanups.forEach((c) => c());
      });
    },
    { scope: root, dependencies: [cards.length] }
  );

  // Grid-level pointer tracking: every card computes the spotlight relative to itself.
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    for (const card of e.currentTarget.querySelectorAll<HTMLElement>(".sp-card")) {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
  };

  return (
    <section ref={root}>
      {gridTitle && <h3 className="mb-4 text-lg font-semibold text-white">{gridTitle}</h3>}
      <div onPointerMove={onMove} className="group/grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 [perspective:1000px]">
        {cards.map((c, i) => (
          <article key={i} className="sp-card relative">
            <div className="sp-inner group relative h-full rounded-2xl border border-slate-800 bg-slate-950 p-6 [transform-style:preserve-3d] will-change-transform">
              {/* inner spotlight */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover/grid:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(360px circle at var(--mx) var(--my), var(--theme-500-20), transparent 60%)" }}
                aria-hidden="true"
              />
              {/* border glow: gradient masked to the 1px border ring only */}
              <div
                className="pointer-events-none absolute -inset-px rounded-2xl border border-transparent opacity-0 group-hover/grid:opacity-100 transition-opacity duration-500"
                style={{
                  background: "radial-gradient(260px circle at var(--mx) var(--my), var(--theme-400), transparent 60%) border-box",
                  mask: "linear-gradient(#000 0 0) padding-box, linear-gradient(#000 0 0) border-box",
                  maskComposite: "exclude",
                }}
                aria-hidden="true"
              />
              <div className="relative [transform:translateZ(30px)]">
                <div className="flex items-center justify-between">
                  {c.icon && (
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-2xl transition-transform duration-300 group-hover:scale-110">
                      {c.icon}
                    </span>
                  )}
                  {c.tag && (
                    <span className="text-[11px] rounded-full border px-2 py-0.5" style={{ borderColor: "var(--theme-500-30)", color: "var(--theme-400)" }}>
                      {c.tag}
                    </span>
                  )}
                </div>
                <h4 className="mt-5 text-lg font-semibold text-white">{c.title}</h4>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{c.body}</p>
                {c.metric && (
                  <p className="mt-4 text-sm font-semibold" style={{ color: "var(--theme-400)" }}>
                    {c.metric}
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
