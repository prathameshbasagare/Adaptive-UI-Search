// File: ./src/components/adaptive/CodeBlock.tsx

"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import type { CodeSnippet } from "@/lib/types";

interface CodeBlockProps {
  // Single snippet (legacy)
  language?: string;
  code?: string;
  codeTitle?: string;
  // Multi-snippet language tabs
  snippets?: CodeSnippet[];
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-slate-700"
      aria-label="Copy code"
    >
      {copied ? (
        <>
          <Check size={13} className="text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy size={13} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function SingleCodeBlock({
  language = "text",
  code,
  title,
}: {
  language?: string;
  code: string;
  title?: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between bg-slate-800 px-4 py-2.5 border-b border-slate-700">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
          {title ?? language}
        </span>
        <CopyButton code={code} />
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: "#0f172a",
          fontSize: "0.85rem",
          lineHeight: "1.6",
          padding: "1.25rem",
        }}
        showLineNumbers
        lineNumberStyle={{ color: "#475569", minWidth: "2.5em" }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function MultiSnippetBlock({ snippets }: { snippets: CodeSnippet[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = snippets[activeIndex];

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700">
      {/* Language tab bar */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 pr-3">
        <div className="flex overflow-x-auto">
          {snippets.map((snippet, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 px-4 py-2.5 text-xs font-mono font-medium transition-colors border-b-2 ${
                index === activeIndex
                  ? "text-violet-300 border-violet-500 bg-slate-900/40"
                  : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              {snippet.label ?? snippet.language}
            </button>
          ))}
        </div>
        {active && <CopyButton code={active.code} />}
      </div>

      {active && (
        <SyntaxHighlighter
          language={active.language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            background: "#0f172a",
            fontSize: "0.85rem",
            lineHeight: "1.6",
            padding: "1.25rem",
          }}
          showLineNumbers
          lineNumberStyle={{ color: "#475569", minWidth: "2.5em" }}
          wrapLongLines
        >
          {active.code}
        </SyntaxHighlighter>
      )}
    </div>
  );
}

export default function CodeBlock({ language, code, codeTitle, snippets }: CodeBlockProps) {
  if (snippets && snippets.length > 1) {
    return <MultiSnippetBlock snippets={snippets} />;
  }

  // Fall back to first snippet or legacy single-code props
  const resolvedCode = snippets?.[0]?.code ?? code ?? "";
  const resolvedLang = snippets?.[0]?.language ?? language;
  const resolvedTitle = snippets?.[0]?.label ?? codeTitle;

  return (
    <SingleCodeBlock language={resolvedLang} code={resolvedCode} title={resolvedTitle} />
  );
}
