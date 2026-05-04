// File: ./src/components/adaptive/Timeline.tsx

"use client";

import type { TimelineEvent } from "@/lib/types";

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative">
      <div
        className="absolute left-5 top-0 bottom-0 w-px"
        style={{ background: "linear-gradient(to bottom, var(--theme-500-60), transparent)" }}
      />

      <div className="space-y-0">
        {events.map((event, index) => (
          <div key={index} className="relative flex gap-5 group">
            <div className="relative z-10 shrink-0 flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 border-2 flex items-center justify-center transition-colors mt-1"
                style={{ borderColor: "var(--theme-500-60)" }}
              >
                {event.icon ? (
                  <span className="text-base leading-none">{event.icon}</span>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--theme-500)" }} />
                )}
              </div>
              {index < events.length - 1 && (
                <div className="w-px flex-1 bg-slate-300/60 dark:bg-slate-700/60 min-h-6" />
              )}
            </div>

            <div className="pb-8 pt-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {event.year && (
                  <span
                    className="text-xs font-mono px-2 py-0.5 rounded-full border"
                    style={{
                      color: "var(--theme-400)",
                      backgroundColor: "var(--theme-500-10)",
                      borderColor: "var(--theme-500-20)",
                    }}
                  >
                    {event.year}
                  </span>
                )}
                <h3 className="font-semibold text-slate-950 dark:text-white text-sm">{event.title}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
