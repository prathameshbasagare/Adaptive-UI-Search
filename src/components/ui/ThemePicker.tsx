// File: ./src/components/ui/ThemePicker.tsx

"use client";

import { useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useThemeStore, THEME_COLORS, applyPersistedTheme, type ThemeName } from "@/hooks/useThemeStore";

export default function ThemePicker() {
  const { theme, setTheme, mode, toggleMode } = useThemeStore();

  // Sync persisted theme to DOM on first mount
  useEffect(() => {
    applyPersistedTheme();
  }, []);

  return (
    <div className="flex items-center gap-1.5" title="Change theme">
      {(Object.entries(THEME_COLORS) as [ThemeName, { hex: string; label: string }][]).map(
        ([name, { hex, label }]) => (
          <button
            key={name}
            onClick={() => setTheme(name)}
            title={label}
            aria-label={`Switch to ${label} theme`}
            className={`w-5 h-5 rounded-full transition-all duration-150 hover:scale-110 ${
              theme === name
                ? "ring-2 ring-offset-2 ring-offset-slate-900 scale-110"
                : "opacity-60 hover:opacity-100"
            }`}
            style={{
              backgroundColor: hex,
            }}
          />
        )
      )}
      
      <div className="w-px h-5 bg-slate-300/50 dark:bg-slate-700/50 mx-1" />
      
      <button
        onClick={toggleMode}
        title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        aria-label={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
      >
        {mode === "light" ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    </div>
  );
}
