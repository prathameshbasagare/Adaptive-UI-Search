// File: ./src/hooks/useHydrated.ts
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useChatStore } from "./useChatStore";
import { useThemeStore } from "./useThemeStore";

/**
 * Persisted stores use `skipHydration` so the server render and the first
 * client render match. This hook rehydrates them after mount and reports
 * when the chat store is ready.
 */
export function useStoresHydrated(): boolean {
  const hydrated = useSyncExternalStore(
    (cb) => useChatStore.persist.onFinishHydration(cb),
    () => useChatStore.persist.hasHydrated(),
    () => false
  );

  useEffect(() => {
    if (!useChatStore.persist.hasHydrated()) void useChatStore.persist.rehydrate();
    if (!useThemeStore.persist.hasHydrated()) void useThemeStore.persist.rehydrate();
  }, []);

  return hydrated;
}
