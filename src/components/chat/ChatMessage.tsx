// File: ./src/components/chat/ChatMessage.tsx

"use client";

import { Bot, User, AlertCircle } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import type { ChatMessage as ChatMessageType } from "@/lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const setActiveTab = useChatStore((s) => s.setActiveTab);
  const tabExists = useChatStore((s) => !!message.tabId && s.tabs.some((t) => t.id === message.tabId));

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
          isUser ? "" : "bg-slate-700"
        }`}
        style={isUser ? { backgroundColor: "var(--theme-500)" } : undefined}
      >
        {isUser ? (
          <User size={14} className="text-white" />
        ) : (
          message.isError ? (
            <AlertCircle size={14} className="text-rose-300" />
          ) : (
            <Bot size={14} style={{ color: "var(--theme-400)" }} />
          )
        )}
      </div>

      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "text-white rounded-tr-sm"
              : message.isError
                ? "bg-rose-500/10 border border-rose-500/30 text-rose-200 rounded-tl-sm"
                : "bg-slate-700/80 text-slate-200 rounded-tl-sm"
          }`}
          style={isUser ? { backgroundColor: "var(--theme-600)" } : undefined}
        >
          {message.content}
        </div>
        {tabExists && (
          <button
            type="button"
            onClick={() => setActiveTab(message.tabId as string)}
            className="text-xs px-1 underline-offset-2 hover:underline"
            style={{ color: "var(--theme-400)" }}
          >
            View result →
          </button>
        )}
        <span className="text-xs text-slate-500 px-1">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
