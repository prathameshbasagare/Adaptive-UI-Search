// File: ./src/components/adaptive/TerminalBlock.tsx

"use client";

import { useEffect, useState } from "react";
import type { TerminalLine } from "@/lib/types";

interface TerminalBlockProps {
  terminalTitle?: string;
  lines: TerminalLine[];
}

function useTypewriter(text: string, speed = 30, active = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, active]);

  return { displayed, done };
}

function TerminalLineRow({ line, active, onDone }: { line: TerminalLine; active: boolean; onDone: () => void }) {
  const prompt = line.prompt ?? "$";
  const command = line.command ?? "";
  const { displayed, done } = useTypewriter(command, 28, active);

  useEffect(() => { if (done || !command) onDone(); }, [done, command, onDone]);

  return (
    <div className="space-y-0.5">
      {command && (
        <div className="flex items-center gap-2">
          <span className="select-none" style={{ color: "var(--theme-400)" }}>{prompt}</span>
          <span className="text-white font-mono text-sm">
            {active ? displayed : command}
            {active && !done && <span className="cursor-blink">▋</span>}
          </span>
        </div>
      )}
      {(!command || done || !active) && line.output && (
        <p className="text-slate-400 font-mono text-xs leading-relaxed pl-6 whitespace-pre-wrap">{line.output}</p>
      )}
    </div>
  );
}

export default function TerminalBlock({ terminalTitle, lines }: TerminalBlockProps) {
  const [activeLine, setActiveLine] = useState(0);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 bg-[#0d1117]">
      {/* Chrome bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/60 border-b border-slate-700">
        <span className="w-3 h-3 rounded-full bg-red-500/70" />
        <span className="w-3 h-3 rounded-full bg-amber-500/70" />
        <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
        <span className="ml-3 text-xs text-slate-500 font-mono">{terminalTitle ?? "terminal"}</span>
      </div>

      <div className="p-5 space-y-3 font-mono">
        {lines.map((line, i) => (
          <TerminalLineRow
            key={i}
            line={line}
            active={i === activeLine}
            onDone={() => setActiveLine((a) => Math.max(a, i + 1))}
          />
        ))}
      </div>
    </div>
  );
}
