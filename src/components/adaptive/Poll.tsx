// File: ./src/components/adaptive/Poll.tsx

"use client";

import { useState } from "react";
import type { PollOption } from "@/lib/types";

interface PollProps {
  pollQuestion: string;
  options: PollOption[];
}

export default function Poll({ pollQuestion, options }: PollProps) {
  // Seed initial counts from initialPercent (or equal distribution)
  const seed = options.map((o) => o.initialPercent ?? Math.floor(100 / options.length));
  const [votes, setVotes] = useState<number[]>(seed);
  const [selected, setSelected] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const total = votes.reduce((a, b) => a + b, 0);

  function handleVote(i: number) {
    if (hasVoted) return;
    const next = [...votes];
    next[i] += 10;
    setVotes(next);
    setSelected(i);
    setHasVoted(true);
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
      <div
        className="px-5 py-4 border-b border-slate-700"
        style={{ background: "linear-gradient(to right, var(--theme-500-10), transparent)" }}
      >
        <p className="font-semibold text-white text-sm leading-snug">{pollQuestion}</p>
        {hasVoted && <p className="text-xs text-slate-500 mt-0.5">Thanks for voting! Live results:</p>}
      </div>

      <div className="px-5 py-4 space-y-3">
        {options.map((opt, i) => {
          const pct = total > 0 ? Math.round((votes[i] / total) * 100) : 0;
          const isWinner = hasVoted && pct === Math.max(...votes.map((v) => (total > 0 ? Math.round((v / total) * 100) : 0)));
          const isSelected = selected === i;

          return (
            <button
              key={i}
              onClick={() => handleVote(i)}
              disabled={hasVoted}
              className="w-full text-left relative rounded-lg overflow-hidden border transition-colors"
              style={
                isSelected
                  ? { borderColor: "var(--theme-500-60)" }
                  : { borderColor: "rgba(51,65,85,0.6)" }
              }
            >
              {/* Result fill bar */}
              <div
                className="absolute inset-0 transition-all duration-700 ease-out"
                style={{
                  width: hasVoted ? `${pct}%` : "0%",
                  backgroundColor: isSelected ? "var(--theme-500-20)" : "rgba(51,65,85,0.3)",
                }}
              />
              <div className="relative flex items-center justify-between px-4 py-3 gap-3">
                <span className={`text-sm ${isSelected ? "text-white font-medium" : "text-slate-300"}`}>
                  {isWinner && hasVoted && <span className="mr-1.5">🏆</span>}
                  {opt.label}
                </span>
                {hasVoted && (
                  <span
                    className="text-xs font-semibold tabular-nums"
                    style={{ color: isSelected ? "var(--theme-400)" : "#64748b" }}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!hasVoted && (
        <p className="px-5 pb-4 text-xs text-slate-600">Click an option to vote</p>
      )}
    </div>
  );
}
