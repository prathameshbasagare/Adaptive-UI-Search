"use client";

import { useRef } from "react";
import { gsap, useGSAP, getScroller, MOTION_OK } from "@/lib/motion";
import type { ComponentOf } from "@/lib/types";

type Props = Omit<ComponentOf<"text_reveal">, "type">;

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/**
 * Big statement whose words light up one by one as it scrolls through the
 * viewport (scrubbed). Emphasised words get the theme gradient.
 */
export default function TextReveal({ statement, attribution, emphasis }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const emph = new Set((emphasis ?? []).flatMap((e) => e.split(/\s+/)).map(norm).filter(Boolean));
  const words = statement.split(/\s+/).filter(Boolean);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          ".tr-word",
          { opacity: 0.12, filter: "blur(2px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "top 80%", end: "bottom 45%", scrub: true },
          }
        );
        gsap.fromTo(".tr-attr", { opacity: 0, y: 10 }, {
          opacity: 1,
          y: 0,
          scrollTrigger: { trigger: root.current, scroller: getScroller(), start: "bottom 60%", toggleActions: "play none none reverse" },
        });
      });
    },
    { scope: root }
  );

  return (
    <figure ref={root} className="relative py-10 sm:py-16 px-2 sm:px-6">
      <span className="absolute left-0 top-4 text-7xl leading-none font-serif select-none" style={{ color: "var(--theme-500-30)" }} aria-hidden="true">
        “
      </span>
      <blockquote className="text-2xl sm:text-4xl font-semibold leading-snug tracking-tight text-slate-100">
        {words.map((w, i) => {
          const isEmph = emph.has(norm(w));
          return (
            <span
              key={i}
              className={`tr-word inline-block mr-[0.28em] ${isEmph ? "bg-clip-text text-transparent" : ""}`}
              style={isEmph ? { backgroundImage: "linear-gradient(90deg, var(--theme-400), #f0abfc)" } : undefined}
            >
              {w}
            </span>
          );
        })}
      </blockquote>
      {attribution && <figcaption className="tr-attr mt-6 text-sm text-slate-500">— {attribution}</figcaption>}
    </figure>
  );
}
