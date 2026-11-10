// File: ./src/lib/a11y.ts
import type { KeyboardEvent } from "react";

/**
 * Props that make a non-button element behave like a button for keyboard and
 * assistive-technology users (focusable, Enter/Space activate). Returns {}
 * when there is no action, so non-interactive cards stay non-interactive.
 */
export function pressable(onActivate: (() => void) | undefined, label?: string) {
  if (!onActivate) return {};
  return {
    role: "button" as const,
    tabIndex: 0,
    "aria-label": label,
    onClick: onActivate,
    onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    },
  };
}
