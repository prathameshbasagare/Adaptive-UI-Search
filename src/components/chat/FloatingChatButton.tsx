// File: ./src/components/chat/FloatingChatButton.tsx

"use client";

import { MessageCircle, X } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";

export default function FloatingChatButton() {
  const { isChatOpen, isLoading, toggleChat, messages } = useChatStore();

  const unreadCount = 0; // Reserved for future notification support

  return (
    <button
      onClick={toggleChat}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 group ${
        isChatOpen
          ? "bg-slate-700 hover:bg-slate-600 rotate-0"
          : "bg-violet-600 hover:bg-violet-500 hover:scale-105 hover:shadow-violet-500/30"
      } ${isLoading && !isChatOpen ? "ring-2 ring-violet-400 ring-offset-2 ring-offset-transparent animate-pulse" : ""}`}
      aria-label={isChatOpen ? "Close chat" : "Open chat"}
    >
      {isChatOpen ? (
        <X size={22} className="text-white" />
      ) : (
        <>
          <MessageCircle size={22} className="text-white" />
          {messages.length > 0 && unreadCount === 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
          )}
        </>
      )}

      {/* Tooltip */}
      {!isChatOpen && (
        <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-800 text-slate-200 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow border border-slate-700">
          Ask Adaptive AI
        </span>
      )}
    </button>
  );
}
