// File: ./src/app/app/page.tsx

"use client";

import { useState, useRef, FormEvent, KeyboardEvent } from "react";
import { useChatStore } from "@/hooks/useChatStore";
import { useStoresHydrated } from "@/hooks/useHydrated";
import AdaptiveContent from "@/components/adaptive/AdaptiveContent";
import FloatingChatButton from "@/components/chat/FloatingChatButton";
import ChatPanel from "@/components/chat/ChatPanel";
import WebSearchToggle from "@/components/chat/WebSearchToggle";
import SourcesList from "@/components/adaptive/SourcesList";
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
  Loader2,
  XCircle,
  Globe,
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
  const hydrated = useStoresHydrated();
  const tabs = useChatStore((s) => s.tabs);
  const activeTabId = useChatStore((s) => s.activeTabId);
  const isChatOpen = useChatStore((s) => s.isChatOpen);
  const isLoading = useChatStore((s) => s.isLoading);
  const statusMessage = useChatStore((s) => s.statusMessage);
  const setActiveTab = useChatStore((s) => s.setActiveTab);
  const closeTab = useChatStore((s) => s.closeTab);
  const closeAllTabs = useChatStore((s) => s.closeAllTabs);
  const updateTabLayout = useChatStore((s) => s.updateTabLayout);
  const sendQuery = useChatStore((s) => s.sendQuery);
  const cancelQuery = useChatStore((s) => s.cancelQuery);
  const toggleChat = useChatStore((s) => s.toggleChat);

  const [canvasInput, setCanvasInput] = useState("");
  const tabRefs = useRef(new Map<string, HTMLDivElement>());
  const activeTab = tabs.find((t) => t.id === activeTabId);

  // Roving focus for the tab strip (WAI-ARIA tabs pattern).
  const handleTabKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else if (e.key === "Delete") {
      e.preventDefault();
      closeTab(tabs[index].id);
      return;
    }
    if (next >= 0) {
      e.preventDefault();
      setActiveTab(tabs[next].id);
      tabRefs.current.get(tabs[next].id)?.focus();
    }
  };

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
      <div className="h-dvh overflow-hidden bg-slate-950 text-white flex flex-col font-sans">
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
              aria-expanded={isChatOpen}
              aria-label={isChatOpen ? "Hide chat panel" : "Show chat panel"}
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
          className={`flex flex-1 min-h-0 overflow-hidden transition-all duration-300 ${
            isChatOpen ? "lg:mr-96" : "mr-0"
          }`}
        >
          {/* Content area */}
          <main className="flex-1 min-w-0 flex flex-col overflow-hidden bg-slate-950">
            {/* Tab bar */}
            {tabs.length > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 border-b border-slate-800/80 bg-slate-900/40 shrink-0">
                <div role="tablist" aria-label="Results" className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
                  {tabs.map((tab, index) => {
                    const isActive = tab.id === activeTabId;
                    return (
                      <div
                        key={tab.id}
                        ref={(el) => {
                          if (el) tabRefs.current.set(tab.id, el);
                          else tabRefs.current.delete(tab.id);
                        }}
                        role="tab"
                        id={`tab-${tab.id}`}
                        aria-selected={isActive}
                        aria-controls="result-panel"
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => setActiveTab(tab.id)}
                        onKeyDown={(e) => handleTabKeyDown(e, index)}
                        className={`group shrink-0 flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all max-w-56 border outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
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
                        {tab.streaming && <Loader2 size={11} className="animate-spin shrink-0" aria-label="Generating" />}
                        <span className="truncate">{tab.title}</span>
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={(e) => {
                            e.stopPropagation();
                            closeTab(tab.id);
                          }}
                          className="p-0.5 rounded hover:bg-slate-700/60 text-slate-500 hover:text-rose-400 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 sm:group-aria-selected:opacity-100"
                          aria-label={`Close ${tab.title}`}
                          title="Close tab (Delete)"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
                {tabs.length > 1 && (
                  <button
                    type="button"
                    onClick={closeAllTabs}
                    className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                    aria-label="Close all tabs"
                    title="Close all tabs"
                  >
                    <XCircle size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Main content */}
            <div
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
              id="result-panel"
              role={activeTab ? "tabpanel" : undefined}
              aria-labelledby={activeTab ? `tab-${activeTab.id}` : undefined}
            >
              {!hydrated ? (
                <div className="flex items-center justify-center min-h-[60vh]" role="status" aria-label="Loading">
                  <Loader2 className="animate-spin text-slate-600" size={24} />
                </div>
              ) : activeTab ? (
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
                          {!!activeTab.response.sources?.length && (
                            <a
                              href="#sources"
                              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium hover:opacity-80"
                              style={{ borderColor: "var(--theme-500-30)", color: "var(--theme-400)" }}
                            >
                              <Globe size={11} />
                              Based on {activeTab.response.sources.length} web{" "}
                              {activeTab.response.sources.length === 1 ? "source" : "sources"}
                            </a>
                          )}
                        </p>
                      </div>

                      {/* Layout Switcher Controls */}
                      <div
                        role="group"
                        aria-label="Layout"
                        className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start md:self-center shadow-inner"
                      >
                        {LAYOUT_OPTIONS.map((opt) => {
                          const isSelected = currentLayout === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              aria-pressed={isSelected}
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

                  {activeTab.streaming && (
                    <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-slate-400" role="status">
                      <span className="flex items-center gap-2">
                        <Loader2 size={13} className="animate-spin" style={{ color: "var(--theme-400)" }} />
                        {statusMessage ?? "Generating…"}
                      </span>
                      <button
                        type="button"
                        onClick={cancelQuery}
                        className="px-2.5 py-1 rounded-md border border-slate-700 hover:bg-slate-800 text-slate-300"
                      >
                        Stop
                      </button>
                    </div>
                  )}

                  {/* key: remount per tab so interactive state never leaks between results */}
                  <AdaptiveContent
                    key={activeTab.id}
                    response={activeTab.response}
                    layoutOverride={currentLayout}
                    streaming={activeTab.streaming}
                  />

                  {!!activeTab.response.sources?.length && (
                    <div className="mt-12 border-t border-slate-800/80 pt-8">
                      <SourcesList sources={activeTab.response.sources} />
                    </div>
                  )}
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
                        aria-label="Ask anything"
                        maxLength={2000}
                        value={canvasInput}
                        onChange={(e) => setCanvasInput(e.target.value)}
                        placeholder="Ask anything (e.g., 'Compare Next.js vs Remix' or 'Tesla Q4 analytics')..."
                        disabled={isLoading}
                        className="flex-1 min-w-0 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                      />
                      <WebSearchToggle compact />
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
