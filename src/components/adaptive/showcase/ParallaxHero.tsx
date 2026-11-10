"use client";

import { useRef } from "react";
import { gsap, useGSAP, getScroller, MOTION_OK } from "@/lib/motion";
import type { ComponentOf } from "@/lib/types";

type Props = Omit<ComponentOf<"parallax_hero">, "type">;

/**
 * Opening "hero" block. Layers drift at different speeds while scrolling
 * (scrubbed ScrollTrigger) and follow the pointer (quickTo), the headline
 * reveals word by word, and highlight chips stagger in.
 */
export default function ParallaxHero({ eyebrow, title, subtitle, icon, highlights }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const scroller = getScroller();

        gsap.fromTo(".ph-word", { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: "power4.out", stagger: 0.05 });
        gsap.fromTo(".ph-fade", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.08, delay: 0.25 });

        // Scroll parallax: deeper layers move more.
        const st = { trigger: root.current, scroller, start: "top top", end: "bottom top", scrub: 0.6 };
        gsap.to(".ph-layer-back", { yPercent: 30, ease: "none", scrollTrigger: st });
        gsap.to(".ph-layer-mid", { yPercent: 18, ease: "none", scrollTrigger: st });
        gsap.to(".ph-content", { yPercent: -12, opacity: 0.35, ease: "none", scrollTrigger: st });

        // Pointer parallax.
        const el = root.current!;
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]", el).map((node) => ({
          depth: Number(node.dataset.depth),
          x: gsap.quickTo(node, "x", { duration: 0.8, ease: "power3.out" }),
          y: gsap.quickTo(node, "y", { duration: 0.8, ease: "power3.out" }),
        }));
        const onMove = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          for (const l of layers) {
            l.x(nx * l.depth * 40);
            l.y(ny * l.depth * 30);
          }
        };
        const onLeave = () => layers.forEach((l) => (l.x(0), l.y(0)));
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
        };
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 min-h-[380px] sm:min-h-[440px] flex items-center"
    >
      {/* Background layers */}
      <div className="ph-layer-back absolute inset-0 -z-10" aria-hidden="true">
        <div data-depth="1" className="absolute -top-24 -left-16 h-80 w-80 rounded-full blur-3xl opacity-70" style={{ background: "var(--theme-500-40)" }} />
        <div data-depth="1.6" className="absolute -bottom-32 right-0 h-96 w-96 rounded-full blur-3xl opacity-50" style={{ background: "var(--theme-500-30)" }} />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
      </div>
      {icon && (
        <div className="ph-layer-mid absolute right-6 sm:right-12 top-1/2 -translate-y-1/2 -z-10 select-none" aria-hidden="true">
          <div data-depth="2.4" className="text-[120px] sm:text-[180px] leading-none opacity-20 blur-[1px]">
            {icon}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="ph-content relative w-full px-6 py-12 sm:px-12 sm:py-16 max-w-3xl">
        {eyebrow && (
          <p className="ph-fade mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide uppercase"
             style={{ borderColor: "var(--theme-500-40)", color: "var(--theme-400)", background: "var(--theme-500-10)" }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--theme-400)" }} />
            {eyebrow}
          </p>
        )}
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.05] text-white" aria-label={title}>
          {title.split(/\s+/).map((w, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom pb-1 mr-[0.25em]" aria-hidden="true">
              <span className="ph-word inline-block">{w}</span>
            </span>
          ))}
        </h2>
        {subtitle && <p className="ph-fade mt-5 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">{subtitle}</p>}
        {highlights && highlights.length > 0 && (
          <dl className="mt-8 flex flex-wrap gap-3">
            {highlights.map((h, i) => (
              // Outer div is animated by GSAP; the inner one owns the CSS hover
              // transition (CSS transitions on GSAP-tweened props corrupt them).
              <div key={i} className="ph-fade">
              <div
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--theme-500-60)] hover:shadow-[0_10px_40px_-10px_var(--theme-500-40)]"
              >
                <dt className="text-[11px] uppercase tracking-wider text-slate-500">{h.label}</dt>
                <dd className="text-xl font-semibold text-white group-hover:text-[var(--theme-400)] transition-colors">{h.value}</dd>
              </div>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
