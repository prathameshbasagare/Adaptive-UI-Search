// File: ./src/app/app/page.tsx

"use client";

import { useState, FormEvent } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import AdaptiveContent from "@/components/adaptive/AdaptiveContent";
import FloatingChatButton from "@/components/chat/FloatingChatButton";
import ChatPanel from "@/components/chat/ChatPanel";
import ThemePicker from "@/components/ui/ThemePicker";
import { ModalProvider } from "@/contexts/ModalContext";
import {
  LayoutGrid,
  ChevronLeft,
  Home,
  X,
  Search,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Columns,
  Layers,
  FileText,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import type { LayoutStyle } from "@/lib/types";

const LAYOUT_OPTIONS: { id: LayoutStyle; label: string; icon: React.ReactNode }[] = [
  { id: "bento", label: "Bento", icon: <LayoutGrid size={13} /> },
  { id: "dashboard", label: "Dashboard", icon: <BarChart2 size={13} /> },
  { id: "docs", label: "Docs", icon: <FileText size={13} /> },
  { id: "split", label: "Split", icon: <Columns size={13} /> },
  { id: "standard", label: "Stream", icon: <Layers size={13} /> },
];

const SUGGESTIONS = [
  "Compare Next.js vs Remix features",
  "Tesla Q4 Financial & Vehicle Metrics",
  "PostgreSQL Indexing & Query Guide",
  "Modern AI Tech Stack Overview",
];

export default function AppPage() {
  const {
    tabs,
    activeTabId,
    isChatOpen,
    isLoading,
    setActiveTab,
    closeTab,
    updateTabLayout,
    sendQuery,
    toggleChat,
  } = useChatStore();

  const [canvasInput, setCanvasInput] = useState("");
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleCanvasSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canvasInput.trim() || isLoading) return;
    const q = canvasInput.trim();
    setCanvasInput("");
    await sendQuery(q);
  };

  const handleSuggestionClick = async (prompt: string) => {
    if (isLoading) return;
    await sendQuery(prompt);
  };

  const currentLayout: LayoutStyle =
    activeTab?.layoutStyle ?? activeTab?.response.layoutStyle ?? "bento";

  return (
    <ModalProvider>
      <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
        {/* Top bar */}
        <header className="h-12 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm z-20 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft size={16} />
              <Home size={15} />
              <span className="hidden sm:inline font-medium">Home</span>
            </Link>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center border"
                style={{
                  backgroundColor: "var(--theme-500-20)",
                  borderColor: "var(--theme-500-40)",
                }}
              >
                <LayoutGrid size={13} style={{ color: "var(--theme-400)" }} />
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-200">
                AdaptiveUI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleChat}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <MessageSquare size={13} style={{ color: "var(--theme-400)" }} />
              <span className="hidden sm:inline">
                {isChatOpen ? "Hide Chat" : "Chat Panel"}
              </span>
            </button>
            <ThemePicker />
          </div>
        </header>

        <div
          className={`flex flex-1 overflow-hidden transition-all duration-300 ${
            isChatOpen ? "mr-96" : "mr-0"
          }`}
        >
          {/* Content area */}
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {/* Tab bar */}
            {tabs.length > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 border-b border-slate-800/80 bg-slate-900/40 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 shrink-0">
                {tabs.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  return (
                    <div
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`group shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all max-w-56 border ${
                        isActive
                          ? "shadow-sm"
                          : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: "var(--theme-500-10)",
                              color: "var(--theme-400)",
                              borderColor: "var(--theme-500-30)",
                            }
                          : undefined
                      }
                    >
                      <span className="truncate">{tab.title}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-700/60 text-slate-400 hover:text-rose-400 transition-all"
                        title="Close tab"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab ? (
                <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
                  {/* Tab header */}
                  <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-1.5">
                          {activeTab.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                          <span
                            className="inline-block w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: "var(--theme-500)" }}
                          />
                          <span className="font-mono">{activeTab.query}</span>
                        </p>
                      </div>

                      {/* Layout Switcher Controls */}
                      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start md:self-center shadow-inner">
                        {LAYOUT_OPTIONS.map((opt) => {
                          const isSelected = currentLayout === opt.id;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => updateTabLayout(activeTab.id, opt.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isSelected
                                  ? "shadow-sm"
                                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                              }`}
                              style={
                                isSelected
                                  ? {
                                      backgroundColor: "var(--theme-500-20)",
                                      color: "var(--theme-400)",
                                      border: "1px solid var(--theme-500-40)",
                                    }
                                  : undefined
                              }
                            >
                              <span>{opt.icon}</span>
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div
                      className="mt-6 h-px"
                      style={{
                        background:
                          "linear-gradient(to right, var(--theme-500-30), #334155, transparent)",
                      }}
                    />
                  </div>

                  {/* Adaptive components with active layout */}
                  <AdaptiveContent
                    response={activeTab.response}
                    layoutOverride={currentLayout}
                  />
                </div>
              ) : (
                /* Empty state with Direct Search Bar & Suggestions */
                <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-12 text-center max-w-2xl mx-auto">
                  <div className="relative mb-6">
                    <div
                      className="w-20 h-20 rounded-3xl border flex items-center justify-center shadow-2xl backdrop-blur-xl"
                      style={{
                        backgroundColor: "var(--theme-500-10)",
                        borderColor: "var(--theme-500-30)",
                      }}
                    >
                      <LayoutGrid size={38} style={{ color: "var(--theme-400)" }} />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700 shadow-md">
                      <Sparkles size={14} style={{ color: "var(--theme-400)" }} />
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
                    Adaptive UI Canvas
                  </h2>
                  <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed mb-8">
                    Ask any question. The AI determines the optimal layout—generating interactive Bento
                    Grids, Dashboards, live Charts, Code, and Specs in real time.
                  </p>

                  {/* On-canvas search input */}
                  <form onSubmit={handleCanvasSubmit} className="w-full max-w-xl mb-6">
                    <div className="relative flex items-center rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-md focus-within:border-slate-700 transition-all overflow-hidden p-1.5">
                      <div className="pl-3 text-slate-500">
                        <Search size={18} />
                      </div>
                      <input
                        type="text"
                        value={canvasInput}
                        onChange={(e) => setCanvasInput(e.target.value)}
                        placeholder="Ask anything (e.g., 'Compare Next.js vs Remix' or 'Tesla Q4 analytics')..."
                        disabled={isLoading}
                        className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !canvasInput.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                        style={{ backgroundColor: "var(--theme-500)" }}
                      >
                        <span>Generate</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </form>

                  {/* Prompt Suggestions */}
                  <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                    {SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles size={11} style={{ color: "var(--theme-400)" }} />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
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
