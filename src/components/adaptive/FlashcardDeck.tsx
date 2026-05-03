// File: ./src/components/adaptive/FlashcardDeck.tsx

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { Flashcard } from "@/lib/types";

interface FlashcardDeckProps {
  flashcardTitle?: string;
  flashcards: Flashcard[];
}

export default function FlashcardDeck({ flashcardTitle, flashcards }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  function go(dir: 1 | -1) {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.max(0, Math.min(flashcards.length - 1, i + dir))), 150);
  }

  const card = flashcards[index];

  return (
    <div className="space-y-4">
      {flashcardTitle && <h3 className="font-semibold text-white text-sm">{flashcardTitle}</h3>}

      {/* Progress */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Card {index + 1} of {flashcards.length}</span>
        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / flashcards.length) * 100}%`, backgroundColor: "var(--theme-500)" }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        className="flashcard-scene w-full"
        style={{ height: "200px" }}
      >
        <div
          className={`flashcard-card w-full h-full cursor-pointer select-none ${flipped ? "flipped" : ""}`}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* Front */}
          <div
            className="flashcard-face absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-700 text-center"
            style={{ backgroundColor: "var(--theme-500-10)", borderColor: "var(--theme-500-30)" }}
          >
            <span className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--theme-400)" }}>Question</span>
            <p className="text-white font-medium text-base leading-snug">{card.front}</p>
            <p className="mt-4 text-xs text-slate-600">Click to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className="flashcard-back flashcard-face flex flex-col items-center justify-center p-6 rounded-2xl border border-slate-600 text-center"
            style={{ backgroundColor: "#0f172a" }}
          >
            <span className="text-xs font-semibold uppercase tracking-wide mb-3 text-emerald-400">Answer</span>
            <p className="text-slate-200 text-base leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => { setFlipped(false); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
        >
          <RotateCcw size={13} /> Reset
        </button>
        <button
          onClick={() => go(1)}
          disabled={index === flashcards.length - 1}
          className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
