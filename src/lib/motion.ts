// File: ./src/lib/motion.ts
//
// Shared GSAP setup for the interactive "showcase" blocks.
// Results scroll inside #result-panel (not the window), so every
// ScrollTrigger must use getScroller() as its scroller.

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export const SCROLLER_ID = "result-panel";

export function getScroller(): HTMLElement | Window {
  if (typeof document === "undefined") return undefined as unknown as Window;
  return document.getElementById(SCROLLER_ID) ?? window;
}

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const MOTION_REDUCED = "(prefers-reduced-motion: reduce)";

let refreshTimer: ReturnType<typeof setTimeout> | undefined;
/** Debounced ScrollTrigger.refresh — call when layout above a trigger changes. */
export function scheduleScrollRefresh(delay = 150) {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), delay);
}

export { gsap, ScrollTrigger, useGSAP };
