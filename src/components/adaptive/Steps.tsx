// File: ./src/components/adaptive/Steps.tsx

"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Step } from "@/lib/types";

interface StepsProps {
  steps: Step[];
}

export default function Steps({ steps }: StepsProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4 group">
          {/* Step number + connector */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-violet-600/20 border-2 border-violet-500/50 flex items-center justify-center text-sm font-bold text-violet-300 group-hover:border-violet-400 transition-colors">
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="w-px flex-1 bg-slate-700/60 min-h-4 mt-1" />
            )}
          </div>

          {/* Content */}
          <div className={`pb-6 flex-1 min-w-0 ${index === steps.length - 1 ? "pb-0" : ""}`}>
            <h3 className="font-semibold text-white text-sm mb-1.5 pt-1 leading-snug">
              {step.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-3">
              {step.description}
            </p>
            {step.code && (
              <div className="rounded-lg overflow-hidden border border-slate-700">
                <div className="bg-slate-800 px-3 py-1.5 border-b border-slate-700 flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 uppercase tracking-wide">
                    {step.language ?? "code"}
                  </span>
                </div>
                <SyntaxHighlighter
                  language={step.language ?? "bash"}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    background: "#0f172a",
                    fontSize: "0.8rem",
                    lineHeight: "1.5",
                    padding: "0.875rem 1rem",
                  }}
                  wrapLongLines
                >
                  {step.code}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
