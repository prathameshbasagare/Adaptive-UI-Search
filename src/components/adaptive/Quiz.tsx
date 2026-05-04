// File: ./src/components/adaptive/Quiz.tsx

"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Trophy } from "lucide-react";
import type { QuizQuestion } from "@/lib/types";

interface QuizProps {
  questions: QuizQuestion[];
}

function QuestionCard({
  question,
  index,
  total,
  onAnswer,
}: {
  question: QuizQuestion;
  index: number;
  total: number;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  function handleSelect(i: number) {
    if (selected !== null) return;
    setSelected(i);
    onAnswer(i === question.correct);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">
          Question {index + 1} of {total}
        </span>
        <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${((index + 1) / total) * 100}%`,
              backgroundColor: "var(--theme-500)",
            }}
          />
        </div>
      </div>
      <p className="text-slate-950 dark:text-white font-medium text-base leading-snug">{question.question}</p>
      <div className="grid grid-cols-1 gap-2.5">
        {question.options.map((opt, i) => {
          let style: React.CSSProperties = {};
          let extra = "";

          if (selected !== null) {
            if (i === question.correct) {
              style = { borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.12)", color: "white" };
            } else if (i === selected) {
              style = { borderColor: "#f43f5e", backgroundColor: "rgba(244,63,94,0.12)", color: "white" };
            } else {
              extra = "opacity-40";
            }
          } else {
            style = {};
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm transition-all duration-150 ${
                selected === null ? "hover:border-[var(--theme-500)] hover:bg-[var(--theme-500-10)]" : ""
              } ${extra}`}
              style={style}
            >
              <span
                className="shrink-0 w-6 h-6 rounded-full border text-xs font-semibold flex items-center justify-center"
                style={
                  selected !== null && i === question.correct
                    ? { borderColor: "#10b981", color: "#10b981" }
                    : selected !== null && i === selected
                    ? { borderColor: "#f43f5e", color: "#f43f5e" }
                    : { borderColor: "#475569", color: "#64748b" }
                }
              >
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {selected !== null && i === question.correct && (
                <CheckCircle size={15} className="ml-auto shrink-0 text-emerald-400" />
              )}
              {selected !== null && i === selected && i !== question.correct && (
                <XCircle size={15} className="ml-auto shrink-0 text-red-400" />
              )}
            </button>
          );
        })}
      </div>
      {selected !== null && question.explanation && (
        <div
          className="mt-3 rounded-lg px-4 py-3 text-sm border"
          style={{
            backgroundColor: "var(--theme-500-10)",
            borderColor: "var(--theme-500-20)",
            color: "#cbd5e1",
          }}
        >
          <span className="font-semibold" style={{ color: "var(--theme-400)" }}>Explanation: </span>
          {question.explanation}
        </div>
      )}
    </div>
  );
}

export default function Quiz({ questions }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  function handleAnswer(correct: boolean) {
    setAnswered(correct);
    if (correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswered(null);
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setScore(0);
    setAnswered(null);
    setDone(false);
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="bg-slate-200/40 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center space-y-4">
        <Trophy size={48} className="mx-auto" style={{ color: "var(--theme-400)" }} />
        <h3 className="text-2xl font-bold text-slate-950 dark:text-white">Quiz Complete!</h3>
        <p className="text-slate-600 dark:text-slate-400">
          You scored{" "}
          <span className="font-bold text-slate-950 dark:text-white">
            {score}/{questions.length}
          </span>{" "}
          ({pct}%)
        </p>
        <div
          className="w-32 h-32 rounded-full border-4 flex items-center justify-center mx-auto text-3xl font-bold"
          style={{ borderColor: "var(--theme-500)", color: "var(--theme-400)" }}
        >
          {pct}%
        </div>
        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-950 dark:text-white text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--theme-500)" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-200/40 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="px-5 py-5">
        <QuestionCard
          question={questions[currentIndex]}
          index={currentIndex}
          total={questions.length}
          onAnswer={handleAnswer}
        />
      </div>
      {answered !== null && (
        <div
          className="px-5 py-4 border-t border-slate-300 dark:border-slate-700 flex items-center justify-between"
          style={{ backgroundColor: "rgba(15,23,42,0.4)" }}
        >
          <span
            className={`text-sm font-semibold ${answered ? "text-emerald-400" : "text-red-400"}`}
          >
            {answered ? "Correct! 🎉" : "Not quite — keep going!"}
          </span>
          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-lg text-slate-950 dark:text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--theme-500)" }}
          >
            {currentIndex + 1 >= questions.length ? "See Results" : "Next →"}
          </button>
        </div>
      )}
    </div>
  );
}
