// File: ./src/hooks/useChatStore.ts

import { create } from "zustand";
import type { ChatStore, ChatMessage, TabEntry } from "@/lib/types";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  tabs: [],
  activeTabId: null,
  isChatOpen: false,
  isLoading: false,

  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: generateId(), timestamp: Date.now() },
      ],
    })),

  addTab: (tab: Omit<TabEntry, "id" | "createdAt">) => {
    const id = generateId();
    set((state) => ({
      tabs: [...state.tabs, { ...tab, id, createdAt: Date.now() }],
      activeTabId: id,
    }));
  },

  setActiveTab: (id: string) => set({ activeTabId: id }),

  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  setLoading: (v: boolean) => set({ isLoading: v }),

  clearMessages: () => set({ messages: [], tabs: [], activeTabId: null }),
}));
