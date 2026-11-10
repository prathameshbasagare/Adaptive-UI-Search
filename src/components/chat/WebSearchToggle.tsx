// File: ./src/components/chat/WebSearchToggle.tsx

"use client";

import { Globe } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import type { WebSearchMode } from "@/lib/types";

const NEXT: Record<WebSearchMode, WebSearchMode> = { auto: "on", on: "off", off: "auto" };
const LABEL: Record<WebSearchMode, string> = { auto: "Web: Auto", on: "Web: On", off: "Web: Off" };
const HELP: Record<WebSearchMode, string> = {
  auto: "Searches the web when the question needs current information",
  on: "Always searches the web before answering",
  off: "Answers from the model's own knowledge only",
};

/** Cycles the web search mode: Auto → On → Off. */
export default function WebSearchToggle({ compact = false }: { compact?: boolean }) {
  const mode = useChatStore((s) => s.webSearchMode);
  const setMode = useChatStore((s) => s.setWebSearchMode);
  const active = mode !== "off";

  return (
    <button
      type="button"
      onClick={() => setMode(NEXT[mode])}
      title={`${HELP[mode]} (click to change)`}
      aria-label={`Web search: ${mode}. ${HELP[mode]}. Click to change.`}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${
        active ? "" : "border-slate-700 text-slate-500 hover:text-slate-300"
      }`}
      style={active ? { borderColor: "var(--theme-500-40)", color: "var(--theme-400)", background: "var(--theme-500-10)" } : undefined}
    >
      <Globe size={13} className={mode === "off" ? "opacity-60" : ""} />
      {compact ? mode === "auto" ? "Auto" : mode === "on" ? "On" : "Off" : LABEL[mode]}
    </button>
  );
}
