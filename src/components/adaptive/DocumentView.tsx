// File: ./src/components/adaptive/DocumentView.tsx

"use client";

import TextBlock from "./TextBlock";
import { useThemeStore } from "@/hooks/useThemeStore";

interface DocumentViewProps {
  docTitle?: string;
  docSubtitle?: string;
  content: string;
}

export default function DocumentView({ docTitle, docSubtitle, content }: DocumentViewProps) {
  const { mode } = useThemeStore();
  return (
    <div
      className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-xl"
      style={{ background: mode === "light" ? "linear-gradient(to bottom, #f8fafc, #f1f5f9)" : "linear-gradient(to bottom, #0f172a, #020617)" }}
    >
      {/* Cover */}
      {(docTitle || docSubtitle) && (
        <div
          className="relative px-10 py-12 border-b border-slate-200 dark:border-slate-800 text-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, var(--theme-500-10), transparent 70%)" }}
        >
          {/* Decorative rings */}
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full border opacity-10 pointer-events-none"
            style={{ borderColor: "var(--theme-500)" }}
          />
          <div
            className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full border opacity-20 pointer-events-none"
            style={{ borderColor: "var(--theme-500)" }}
          />

          <div className="relative space-y-3">
            <div
              className="inline-block w-10 h-1 rounded-full mx-auto mb-4"
              style={{ backgroundColor: "var(--theme-500)" }}
            />
            {docTitle && <h1 className="text-3xl font-bold text-slate-950 dark:text-white">{docTitle}</h1>}
            {docSubtitle && <p className="text-slate-600 dark:text-slate-400 text-base">{docSubtitle}</p>}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="px-8 py-8">
        <TextBlock content={content} />
      </div>
    </div>
  );
}
