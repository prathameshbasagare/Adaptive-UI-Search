// File: ./src/components/chat/ChatPanel.tsx

"use client";

import { useRef, useEffect, useState, FormEvent } from "react";
import { X, Send, Loader2, Trash2, Sparkles } from "lucide-react";
import { useChatStore } from "@/hooks/useChatStore";
import ChatMessage from "./ChatMessage";

export default function ChatPanel() {
  const { messages, isChatOpen, isLoading, toggleChat, sendQuery, clearMessages } =
    useChatStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isChatOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || isLoading) return;

    setInput("");
    await sendQuery(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <>
      {/* Backdrop overlay on mobile */}
      {isChatOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleChat}
        />
      )}

      {/* Chat panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-slate-900 border-l border-slate-700/60 shadow-2xl z-40 flex flex-col transition-transform duration-300 ease-out ${
          isChatOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Sparkles size={15} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Adaptive AI</h2>
              <p className="text-xs text-slate-500">AI-powered adaptive search</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 rounded-lg transition-colors"
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={toggleChat}
              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 px-6">
              <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
                <Sparkles size={24} className="text-violet-400" />
              </div>
              <div>
                <p className="text-white font-medium mb-1">Ask me anything</p>
                <p className="text-slate-500 text-sm leading-relaxed">
                  I&apos;ll generate a rich, adaptive UI response tailored to your query.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {[
                  "Compare React vs Vue",
                  "Show me sorting algorithms",
                  "Population of top countries",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
          )}

          {isLoading && (
            <div className="flex gap-2.5">
              <div className="shrink-0 w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
                <Loader2 size={14} className="text-violet-300 animate-spin" />
              </div>
              <div className="bg-slate-700/80 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/60">
          <div className="flex items-end gap-2 bg-slate-800 border border-slate-700 rounded-xl p-2 focus-within:border-violet-500/60 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything… (Enter to send)"
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 resize-none outline-none px-2 py-1.5 max-h-32 scrollbar-thin scrollbar-thumb-slate-600 disabled:opacity-50"
              style={{ minHeight: "2.25rem" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-8 h-8 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg flex items-center justify-center transition-colors"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 text-center">
            Shift+Enter for new line
          </p>
        </form>
      </div>
    </>
  );
}
