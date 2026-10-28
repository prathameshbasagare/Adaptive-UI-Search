// File: ./src/hooks/useChatStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatStore, ChatMessage, TabEntry, LayoutStyle, AdaptiveUIResponse } from "@/lib/types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      messages: [],
      tabs: [],
      activeTabId: null,
      isChatOpen: false,
      isLoading: false,

      sendQuery: async (query: string) => {
        const trimmed = query.trim();
        const state = get();
        if (!trimmed || state.isLoading) return;

        state.addMessage({ role: "user", content: trimmed });
        state.setLoading(true);

        const history = state.messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            role: m.role === "user" ? ("user" as const) : ("model" as const),
            parts: [{ text: m.content }],
          }));

        try {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: trimmed, history }),
          });

          const data: AdaptiveUIResponse | { error: string } = await res.json();

          if (!res.ok || "error" in data) {
            const errMsg = "error" in data ? data.error : "Something went wrong. Please try again.";
            state.addMessage({ role: "assistant", content: `Error: ${errMsg}` });
            return;
          }

          const adaptiveData = data as AdaptiveUIResponse;

          state.addMessage({
            role: "assistant",
            content: adaptiveData.summary ?? `Generated: ${adaptiveData.tabTitle}`,
            adaptiveResponse: adaptiveData,
          });

          state.addTab({
            title: adaptiveData.tabTitle,
            query: trimmed,
            response: adaptiveData,
            layoutStyle: adaptiveData.layoutStyle ?? "bento",
          });
        } catch {
          state.addMessage({
            role: "assistant",
            content: "Network error. Please check your connection and try again.",
          });
        } finally {
          state.setLoading(false);
        }
      },

      addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...msg, id: generateId(), timestamp: Date.now() },
          ],
        })),

      addTab: (tab: Omit<TabEntry, "id" | "createdAt">) => {
        const id = generateId();
        const initialLayout = tab.layoutStyle ?? tab.response.layoutStyle ?? "bento";
        set((state) => ({
          tabs: [...state.tabs, { ...tab, id, layoutStyle: initialLayout, createdAt: Date.now() }],
          activeTabId: id,
        }));
      },

      closeTab: (id: string) =>
        set((state) => {
          const tabIndex = state.tabs.findIndex((t) => t.id === id);
          const remainingTabs = state.tabs.filter((t) => t.id !== id);
          let newActiveId = state.activeTabId;

          if (state.activeTabId === id) {
            if (remainingTabs.length > 0) {
              const nextIndex = Math.min(tabIndex, remainingTabs.length - 1);
              newActiveId = remainingTabs[nextIndex].id;
            } else {
              newActiveId = null;
            }
          }

          return {
            tabs: remainingTabs,
            activeTabId: newActiveId,
          };
        }),

      updateTabLayout: (tabId: string, layout: LayoutStyle) =>
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === tabId ? { ...t, layoutStyle: layout } : t
          ),
        })),

      setActiveTab: (id: string) => set({ activeTabId: id }),

      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

      setLoading: (v: boolean) => set({ isLoading: v }),

      clearMessages: () => set({ messages: [], tabs: [], activeTabId: null }),
    }),
    {
      name: "adaptive-ui-chat-storage",
      partialize: (state) => ({
        messages: state.messages,
        tabs: state.tabs,
        activeTabId: state.activeTabId,
      }),
    }
  )
);
