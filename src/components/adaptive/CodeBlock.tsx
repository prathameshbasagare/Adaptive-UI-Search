// File: ./src/components/adaptive/CodeBlock.tsx

"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { useThemeStore } from "@/hooks/useThemeStore";
import type { CodeSnippet } from "@/lib/types";

interface CodeBlockProps {
  language?: string;
  code?: string;
  codeTitle?: string;
  snippets?: CodeSnippet[];
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-300 dark:hover:bg-slate-700"
    >
      {copied ? <><Check size={13} className="text-emerald-400" /><span className="text-emerald-400">Copied</span></> : <><Copy size={13} /><span>Copy</span></>}
    </button>
  );
}

const getShlProps = (mode: "light" | "dark") => ({
  style: mode === "light" ? vs : vscDarkPlus,
  customStyle: { margin: 0, borderRadius: 0, background: mode === "light" ? "#f8fafc" : "#0f172a", fontSize: "0.85rem", lineHeight: "1.6", padding: "1.25rem" },
  showLineNumbers: true,
  lineNumberStyle: { color: mode === "light" ? "#94a3b8" : "#475569", minWidth: "2.5em" },
  wrapLongLines: true,
});

function SingleBlock({ language = "text", code, title }: { language?: string; code: string; title?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
      <div className="flex items-center justify-between bg-slate-200 dark:bg-slate-800 px-4 py-2.5 border-b border-slate-300 dark:border-slate-700">
        <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wide">{title ?? language}</span>
        <CopyButton code={code} />
      </div>
      <SyntaxHighlighter language={language} {...getShlProps(useThemeStore().mode)}>{code}</SyntaxHighlighter>
    </div>
  );
}

function MultiBlock({ snippets }: { snippets: CodeSnippet[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = snippets[activeIndex];
  return (
    <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
      <div className="flex items-center justify-between bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 pr-3">
        <div className="flex overflow-x-auto">
          {snippets.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="shrink-0 px-4 py-2.5 text-xs font-mono font-medium transition-colors border-b-2"
              style={i === activeIndex
                ? { color: "var(--theme-400)", borderColor: "var(--theme-500)", backgroundColor: "rgba(255,255,255,0.02)" }
                : { color: "#64748b", borderColor: "transparent" }
              }
            >
              {s.label ?? s.language}
            </button>
          ))}
        </div>
        {active && <CopyButton code={active.code} />}
      </div>
      {active && <SyntaxHighlighter language={active.language} {...getShlProps(useThemeStore().mode)}>{active.code}</SyntaxHighlighter>}
    </div>
  );
}

export default function CodeBlock({ language, code, codeTitle, snippets }: CodeBlockProps) {
  if (snippets && snippets.length > 1) return <MultiBlock snippets={snippets} />;
  const resolvedCode = snippets?.[0]?.code ?? code ?? "";
  const resolvedLang = snippets?.[0]?.language ?? language;
  const resolvedTitle = snippets?.[0]?.label ?? codeTitle;
  return <SingleBlock language={resolvedLang} code={resolvedCode} title={resolvedTitle} />;
}
