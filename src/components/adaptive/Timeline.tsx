// File: ./src/components/adaptive/Timeline.tsx

"use client";

import type { TimelineEvent } from "@/lib/types";

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative">
      {/* Vertical spine */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/60 via-slate-700 to-transparent" />

      <div className="space-y-0">
        {events.map((event, index) => (
          <div key={index} className="relative flex gap-5 group">
            {/* Dot */}
            <div className="relative z-10 shrink-0 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-violet-500/60 group-hover:border-violet-400 flex items-center justify-center transition-colors mt-1">
                {event.icon ? (
                  <span className="text-base leading-none">{event.icon}</span>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                )}
              </div>
              {index < events.length - 1 && (
                <div className="w-px flex-1 bg-slate-700/60 min-h-6" />
              )}
            </div>

            {/* Content */}
            <div className="pb-8 pt-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {event.year && (
                  <span className="text-xs font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                    {event.year}
                  </span>
                )}
                <h3 className="font-semibold text-white text-sm">{event.title}</h3>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
