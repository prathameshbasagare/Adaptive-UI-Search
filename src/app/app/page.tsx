// File: ./src/app/app/page.tsx

"use client";

import { useChatStore } from "@/hooks/useChatStore";
import AdaptiveContent from "@/components/adaptive/AdaptiveContent";
import FloatingChatButton from "@/components/chat/FloatingChatButton";
import ChatPanel from "@/components/chat/ChatPanel";
import ThemePicker from "@/components/ui/ThemePicker";
import { ModalProvider } from "@/contexts/ModalContext";
import { LayoutGrid, ChevronLeft, Home } from "lucide-react";
import Link from "next/link";

export default function AppPage() {
  const { tabs, activeTabId, isChatOpen, setActiveTab } = useChatStore();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <ModalProvider>
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
            <LayoutGrid size={15} style={{ color: "var(--theme-400)" }} />
            <span className="text-sm font-medium text-slate-300">Adaptive UI</span>
          </div>

          <ThemePicker />
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
                    className="group shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all max-w-48"
                    style={
                      tab.id === activeTabId
                        ? {
                            backgroundColor: "var(--theme-500-20)",
                            color: "var(--theme-400)",
                            border: "1px solid var(--theme-500-30)",
                          }
                        : { color: "#94a3b8" }
                    }
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
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: "var(--theme-500)" }}
                          />
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
                    <div
                      className="mt-4 h-px"
                      style={{
                        background: "linear-gradient(to right, var(--theme-500-30), #334155, transparent)",
                      }}
                    />
                  </div>

                  {/* Adaptive components */}
                  <AdaptiveContent response={activeTab.response} />
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-2xl border flex items-center justify-center"
                      style={{
                        backgroundColor: "var(--theme-500-10)",
                        borderColor: "var(--theme-500-20)",
                      }}
                    >
                      <LayoutGrid size={36} style={{ color: "var(--theme-400)" }} />
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
                    className="flex items-center gap-2 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors hover:opacity-90"
                    style={{ backgroundColor: "var(--theme-500)" }}
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
    </ModalProvider>
  );
}
