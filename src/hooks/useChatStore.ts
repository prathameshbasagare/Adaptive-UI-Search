// File: ./src/hooks/useChatStore.ts

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { parseComponent, type ComponentDef } from "@/lib/schemas";
import { normalizeLayout } from "@/lib/validate";
import type {
  ChatStore,
  ChatMessage,
  TabEntry,
  HistoryTurn,
  StreamEvent,
  AdaptiveUIResponse,
} from "@/lib/types";

const MAX_PERSISTED_TABS = 20;
const MAX_PERSISTED_MESSAGES = 60;
/** How many recent assistant turns are sent back as full JSON (older ones as summaries). */
const FULL_JSON_TURNS = 2;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** localStorage wrapper that never throws (private mode, quota exceeded, …). */
const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // Quota exceeded: drop the oldest half of the tabs and try once more.
      try {
        const parsed = JSON.parse(value) as { state: { tabs: TabEntry[] } };
        parsed.state.tabs = parsed.state.tabs.slice(Math.ceil(parsed.state.tabs.length / 2));
        localStorage.setItem(name, JSON.stringify(parsed));
      } catch {
        /* give up silently — persistence is best-effort */
      }
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

/** Re-validates persisted tabs so stale or corrupted data can never crash render. */
function sanitizeTabs(tabs: unknown): TabEntry[] {
  if (!Array.isArray(tabs)) return [];
  return tabs.flatMap((t): TabEntry[] => {
    if (!t || typeof t !== "object") return [];
    const tab = t as TabEntry;
    const comps = Array.isArray(tab.response?.components)
      ? tab.response.components.map(parseComponent).filter((c): c is ComponentDef => c !== null)
      : [];
    if (!tab.id || comps.length === 0) return [];
    return [
      {
        id: String(tab.id),
        title: String(tab.title ?? "Results"),
        query: String(tab.query ?? ""),
        createdAt: Number(tab.createdAt) || Date.now(),
        layoutStyle: tab.layoutStyle ? normalizeLayout(tab.layoutStyle) : undefined,
        response: {
          tabTitle: String(tab.response.tabTitle ?? tab.title ?? "Results"),
          summary: typeof tab.response.summary === "string" ? tab.response.summary : undefined,
          layoutStyle: normalizeLayout(tab.response.layoutStyle),
          components: comps,
        },
      },
    ];
  });
}

function sanitizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages.filter(
    (m): m is ChatMessage =>
      !!m && typeof m === "object" && typeof m.id === "string" && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
  );
}

function buildHistory(messages: ChatMessage[], tabs: TabEntry[]): HistoryTurn[] {
  const tabById = new Map(tabs.map((t) => [t.id, t]));
  const assistantWithTabs = messages.filter((m) => m.role === "assistant" && m.tabId && tabById.has(m.tabId));
  const fullJsonIds = new Set(assistantWithTabs.slice(-FULL_JSON_TURNS).map((m) => m.id));

  const turns: HistoryTurn[] = [];
  for (const m of messages) {
    if (m.isError) continue;
    if (m.role === "user") {
      turns.push({ role: "user", text: m.content });
      continue;
    }
    const tab = m.tabId ? tabById.get(m.tabId) : undefined;
    if (tab && fullJsonIds.has(m.id)) {
      const { tabTitle, layoutStyle, summary, components } = tab.response;
      turns.push({ role: "model", text: JSON.stringify({ tabTitle, layoutStyle, summary, components }).slice(0, 12_000) });
    } else {
      turns.push({ role: "model", text: JSON.stringify({ tabTitle: tab?.title, summary: m.content }) });
    }
  }
  return turns;
}

let activeController: AbortController | null = null;

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      const patchTab = (id: string, fn: (t: TabEntry) => TabEntry) =>
        set((s) => ({ tabs: s.tabs.map((t) => (t.id === id ? fn(t) : t)) }));

      const removeTab = (id: string) =>
        set((s) => {
          const idx = s.tabs.findIndex((t) => t.id === id);
          const tabs = s.tabs.filter((t) => t.id !== id);
          let activeTabId = s.activeTabId;
          if (activeTabId === id) {
            activeTabId = tabs.length ? tabs[Math.min(idx, tabs.length - 1)].id : null;
          }
          return { tabs, activeTabId };
        });

      const addMessage = (msg: Omit<ChatMessage, "id" | "timestamp">) =>
        set((s) => ({ messages: [...s.messages, { ...msg, id: generateId(), timestamp: Date.now() }] }));

      return {
        messages: [],
        tabs: [],
        activeTabId: null,
        isChatOpen: false,
        isLoading: false,
        statusMessage: null,

        sendQuery: async (query: string) => {
          const trimmed = query.trim();
          const { isLoading, messages, tabs } = get();
          if (!trimmed || isLoading) return;

          const history = buildHistory(messages, tabs);
          addMessage({ role: "user", content: trimmed });

          const tabId = generateId();
          const placeholder: TabEntry = {
            id: tabId,
            title: trimmed.length > 30 ? `${trimmed.slice(0, 29)}…` : trimmed,
            query: trimmed,
            createdAt: Date.now(),
            streaming: true,
            response: { tabTitle: trimmed, layoutStyle: "bento", components: [] },
          };
          set((s) => ({ tabs: [...s.tabs, placeholder], activeTabId: tabId, isLoading: true, statusMessage: "Connecting…" }));

          const controller = new AbortController();
          activeController = controller;
          let final: AdaptiveUIResponse | null = null;
          let errorMsg: string | null = null;

          const handle = (e: StreamEvent) => {
            switch (e.type) {
              case "status":
                set({ statusMessage: e.message });
                break;
              case "reset":
                patchTab(tabId, (t) => ({ ...t, response: { ...t.response, components: [] } }));
                break;
              case "meta":
                patchTab(tabId, (t) => ({
                  ...t,
                  title: e.tabTitle ?? t.title,
                  response: {
                    ...t.response,
                    tabTitle: e.tabTitle ?? t.response.tabTitle,
                    summary: e.summary ?? t.response.summary,
                    layoutStyle: e.layoutStyle ?? t.response.layoutStyle,
                  },
                }));
                break;
              case "component": {
                const comp = parseComponent(e.component);
                if (comp) {
                  patchTab(tabId, (t) => ({ ...t, response: { ...t.response, components: [...t.response.components, comp] } }));
                }
                break;
              }
              case "done":
                final = e.response;
                break;
              case "error":
                errorMsg = e.error;
                break;
            }
          };

          try {
            const res = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: trimmed, history }),
              signal: controller.signal,
            });

            if (!res.ok || !res.body) {
              const data = await res.json().catch(() => null);
              errorMsg = (data as { error?: string } | null)?.error ?? `Request failed (${res.status}). Please try again.`;
            } else {
              const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
              let pending = "";
              for (;;) {
                const { value, done } = await reader.read();
                if (done) break;
                pending += value;
                const lines = pending.split("\n");
                pending = lines.pop() ?? "";
                for (const line of lines) {
                  if (!line.trim()) continue;
                  try {
                    handle(JSON.parse(line) as StreamEvent);
                  } catch {
                    /* skip malformed line */
                  }
                }
              }
              if (pending.trim()) {
                try {
                  handle(JSON.parse(pending) as StreamEvent);
                } catch {
                  /* ignore */
                }
              }
              if (!final && !errorMsg) errorMsg = "The response ended unexpectedly. Please try again.";
            }
          } catch (err) {
            errorMsg =
              (err as Error)?.name === "AbortError"
                ? "Generation cancelled."
                : "Network error. Please check your connection and try again.";
          } finally {
            if (activeController === controller) activeController = null;
          }

          const result = final as AdaptiveUIResponse | null;
          if (result) {
            // Server response is authoritative — still re-validate on the client.
            const components = result.components.map(parseComponent).filter((c): c is ComponentDef => c !== null);
            patchTab(tabId, (t) => ({
              ...t,
              title: result.tabTitle,
              streaming: false,
              response: { ...result, layoutStyle: normalizeLayout(result.layoutStyle), components },
            }));
            addMessage({ role: "assistant", content: result.summary ?? `Generated: ${result.tabTitle}`, tabId });
          } else {
            removeTab(tabId);
            addMessage({ role: "assistant", content: errorMsg ?? "Something went wrong.", isError: true });
          }
          set({ isLoading: false, statusMessage: null });
        },

        cancelQuery: () => activeController?.abort(),

        closeTab: (id: string) => {
          const tab = get().tabs.find((t) => t.id === id);
          if (tab?.streaming) activeController?.abort();
          removeTab(id);
        },

        closeAllTabs: () => {
          activeController?.abort();
          set({ tabs: [], activeTabId: null });
        },

        updateTabLayout: (tabId, layout) => patchTab(tabId, (t) => ({ ...t, layoutStyle: layout })),

        setActiveTab: (id: string) => set({ activeTabId: id }),

        toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),

        clearMessages: () => set({ messages: [] }),
      };
    },
    {
      name: "adaptive-ui-chat-storage",
      version: 2,
      storage: createJSONStorage(() => safeStorage),
      // Rehydrated manually after mount (see useHydrated) to avoid SSR mismatches.
      skipHydration: true,
      partialize: (state) => {
        const tabs = state.tabs.filter((t) => !t.streaming).slice(-MAX_PERSISTED_TABS);
        const ids = new Set(tabs.map((t) => t.id));
        return {
          messages: state.messages.slice(-MAX_PERSISTED_MESSAGES),
          tabs,
          activeTabId: state.activeTabId && ids.has(state.activeTabId) ? state.activeTabId : (tabs.at(-1)?.id ?? null),
        };
      },
      migrate: (persisted) => persisted as object,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ChatStore>;
        const tabs = sanitizeTabs(p.tabs);
        const activeTabId = tabs.some((t) => t.id === p.activeTabId) ? (p.activeTabId as string) : (tabs.at(-1)?.id ?? null);
        return { ...current, tabs, activeTabId, messages: sanitizeMessages(p.messages) };
      },
    }
  )
);
