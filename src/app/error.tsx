"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  const clearAndReload = () => {
    try {
      localStorage.removeItem("adaptive-ui-chat-storage");
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <AlertTriangle className="mx-auto text-amber-400" size={36} />
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-slate-400">An unexpected error occurred while rendering this page.</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700"
          >
            <RotateCcw size={14} /> Try again
          </button>
          <button
            onClick={clearAndReload}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white border border-slate-800 hover:border-slate-600"
          >
            Clear saved results &amp; reload
          </button>
        </div>
      </div>
    </div>
  );
}
