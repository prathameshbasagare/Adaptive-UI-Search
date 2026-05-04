// File: ./src/components/chat/FloatingChatButton.tsx

"use client";

import { MessageCircle } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";

export default function FloatingChatButton() {
  const { isChatOpen, isLoading, toggleChat, messages } = useChatStore();

  if (isChatOpen) return null;

  return (
    <button
      onClick={toggleChat}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 group hover:scale-105 ${
        isLoading ? "ring-2 ring-offset-2 ring-offset-slate-900 animate-pulse" : ""
      }`}
      style={{
        backgroundColor: "var(--theme-500)",
        boxShadow: "0 8px 25px var(--theme-500-30)",
      }}
      aria-label="Open chat"
    >
      <MessageCircle size={22} className="text-slate-950 dark:text-white" />
      {messages.length > 0 && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-100 dark:border-slate-900" />
      )}
      <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow border border-slate-300 dark:border-slate-700">
        Ask Adaptive AI
      </span>
    </button>
  );
}
