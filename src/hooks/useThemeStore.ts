// File: ./src/hooks/useThemeStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName = "violet" | "blue" | "emerald" | "amber" | "rose" | "cyan";

export const THEME_COLORS: Record<ThemeName, { hex: string; label: string }> = {
  violet:  { hex: "#8b5cf6", label: "Violet"  },
  blue:    { hex: "#3b82f6", label: "Blue"    },
  emerald: { hex: "#10b981", label: "Emerald" },
  amber:   { hex: "#f59e0b", label: "Amber"   },
  rose:    { hex: "#f43f5e", label: "Rose"    },
  cyan:    { hex: "#06b6d4", label: "Cyan"    },
};

interface ThemeStore {
  theme: ThemeName;
  mode: "light" | "dark";
  setTheme: (t: ThemeName) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "violet",
      mode: "dark",
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          document.body.setAttribute("data-theme", theme);
        }
      },
      toggleMode: () => {
        set((state) => {
          const nextMode = state.mode === "light" ? "dark" : "light";
          if (typeof document !== "undefined") {
            if (nextMode === "dark") {
              document.documentElement.classList.add("dark");
            } else {
              document.documentElement.classList.remove("dark");
            }
          }
          return { mode: nextMode };
        });
      },
    }),
    { name: "adaptive-ui-theme" }
  )
);

/*
 * Call once in a client component to sync the persisted theme to the DOM.
 * Zustand persist rehydrates on mount, so we read and apply on first render.
 */
export function applyPersistedTheme() {
  if (typeof document === "undefined") return;
  const stored = localStorage.getItem("adaptive-ui-theme");
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { state?: { theme?: string; mode?: string } };
      const t = parsed?.state?.theme;
      const m = parsed?.state?.mode;
      if (t) document.body.setAttribute("data-theme", t);
      if (m === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark"); // Default
      }
    } catch {
      // ignore
    }
  }
}
