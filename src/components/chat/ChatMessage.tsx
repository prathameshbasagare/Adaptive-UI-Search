// File: ./src/components/chat/ChatMessage.tsx

"use client";

import { Bot, User } from "lucide-react";
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

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
          isUser ? "bg-violet-500" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        {isUser ? (
          <User size={14} className="text-slate-950 dark:text-white" />
        ) : (
          <Bot size={14} className="text-violet-300" />
        )}
      </div>

      <div className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-violet-600 text-slate-950 dark:text-white rounded-tr-sm"
              : "bg-slate-300/80 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 rounded-tl-sm"
          }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-500 px-1">{formatTime(message.timestamp)}</span>
      </div>
    </div>
  );
}
