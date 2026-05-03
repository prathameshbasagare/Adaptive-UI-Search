// File: ./src/app/app/page.tsx

"use client";

import { useChatStore } from "@/hooks/useChatStore";
import AdaptiveContent from "@/components/adaptive/AdaptiveContent";
import FloatingChatButton from "@/components/chat/FloatingChatButton";
import ChatPanel from "@/components/chat/ChatPanel";
import { LayoutGrid, X, ChevronLeft, Home } from "lucide-react";
import Link from "next/link";

export default function AppPage() {
  const { tabs, activeTabId, isChatOpen, setActiveTab } = useChatStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm z-20 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft size={16} />
          <Home size={15} />
          <span className="hidden sm:inline">Home</span>
        </Link>

        <div className="flex items-center gap-2">
          <LayoutGrid size={15} className="text-violet-400" />
          <span className="text-sm font-medium text-slate-300">Adaptive UI</span>
        </div>

        <div className="w-20" />
      </header>

      <div
        className={`flex flex-1 overflow-hidden transition-all duration-300 ${
          isChatOpen ? "mr-96" : "mr-0"
        }`}
      >
        {/* Content area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          {tabs.length > 0 && (
            <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-800 bg-slate-900/60 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all max-w-48 ${
                    tab.id === activeTabId
                      ? "bg-violet-600/20 text-violet-300 border border-violet-500/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate">{tab.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab ? (
              <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Tab header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">
                        {activeTab.title}
                      </h1>
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 bg-violet-500 rounded-full" />
                        {activeTab.query}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-600 mt-1">
                      {new Date(activeTab.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="mt-4 h-px bg-gradient-to-r from-violet-500/30 via-slate-700 to-transparent" />
                </div>

                {/* Adaptive components */}
                <AdaptiveContent response={activeTab.response} />
              </div>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                    <LayoutGrid size={36} className="text-violet-400" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700">
                    <span className="text-xs">✨</span>
                  </div>
                </div>
                <div className="max-w-sm">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Your canvas is ready
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Open the chat and ask anything — I&apos;ll generate a rich, adaptive UI right here.
                    Each query creates a new tab.
                  </p>
                </div>
                <button
                  onClick={() => useChatStore.getState().toggleChat()}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  Open Chat
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <FloatingChatButton />
      <ChatPanel />
    </div>
  );
}
