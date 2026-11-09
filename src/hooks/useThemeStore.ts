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

export const THEME_STORAGE_KEY = "adaptive-ui-theme";

interface ThemeStore {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

function applyTheme(theme: string) {
  if (typeof document !== "undefined") document.body.setAttribute("data-theme", theme);
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "violet",
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        if (state?.theme && state.theme in THEME_COLORS) applyTheme(state.theme);
      },
    }
  )
);

/**
 * Inline script rendered as the first child of <body>: applies the saved
 * theme before first paint so there is no flash of the default theme.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)})||"null");var t=s&&s.state&&s.state.theme;if(${JSON.stringify(Object.keys(THEME_COLORS))}.indexOf(t)>-1)document.body.setAttribute("data-theme",t)}catch(e){}})();`;
