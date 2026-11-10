// File: ./src/lib/types.ts
//
// Component/data types are derived from the Zod schemas in ./schemas.ts so the
// runtime validation and the TypeScript types can never drift apart.

import type { z } from "zod";
import type {
  CardItemSchema,
  BentoItemSchema,
  ChartDataSchema,
  ChartDatasetSchema,
  CodeSnippetSchema,
  TimelineEventSchema,
  StatCardSchema,
  ProgressItemSchema,
  AccordionItemSchema,
  TabContentSchema,
  StepSchema,
  ComparisonSideSchema,
  RatingItemSchema,
  QuizQuestionSchema,
  KeyValueEntrySchema,
  TerminalLineSchema,
  FlashcardSchema,
  ColorSwatchSchema,
  PollOptionSchema,
  RatingGridItemSchema,
  FlowEdgeSchema,
  FlowNodeSchema,
  MapHighlightEntrySchema,
  AdaptiveUIResponse,
  LayoutStyle,
} from "./schemas";

export type {
  WebSource,
  ComponentDef,
  ComponentType,
  ComponentOf,
  AdaptiveUIResponse,
  LayoutStyle,
} from "./schemas";

export type CardItem = z.output<typeof CardItemSchema>;
export type BentoItem = z.output<typeof BentoItemSchema>;
export type ChartDataset = z.output<typeof ChartDatasetSchema>;
export type ChartData = z.output<typeof ChartDataSchema>;
export type CodeSnippet = z.output<typeof CodeSnippetSchema>;
export type TimelineEvent = z.output<typeof TimelineEventSchema>;
export type StatCard = z.output<typeof StatCardSchema>;
export type ProgressItem = z.output<typeof ProgressItemSchema>;
export type AccordionItem = z.output<typeof AccordionItemSchema>;
export type TabContent = z.output<typeof TabContentSchema>;
export type Step = z.output<typeof StepSchema>;
export type ComparisonSide = z.output<typeof ComparisonSideSchema>;
export type RatingItem = z.output<typeof RatingItemSchema>;
export type QuizQuestion = z.output<typeof QuizQuestionSchema>;
export type KeyValueEntry = z.output<typeof KeyValueEntrySchema>;
export type TerminalLine = z.output<typeof TerminalLineSchema>;
export type Flashcard = z.output<typeof FlashcardSchema>;
export type ColorSwatch = z.output<typeof ColorSwatchSchema>;
export type PollOption = z.output<typeof PollOptionSchema>;
export type RatingGridItem = z.output<typeof RatingGridItemSchema>;
export type FlowNode = z.output<typeof FlowNodeSchema>;
export type FlowEdge = z.output<typeof FlowEdgeSchema>;
export type MapHighlightEntry = z.output<typeof MapHighlightEntrySchema>;

// ── Chat wire format ─────────────────────────────────────────────────────────

export interface HistoryTurn {
  role: "user" | "model";
  text: string;
}

/** NDJSON events streamed from /api/chat. */
export type StreamEvent =
  | { type: "status"; message: string }
  | { type: "sources"; sources: import("./schemas").WebSource[] }
  | { type: "reset" }
  | { type: "component"; index: number; component: import("./schemas").ComponentDef }
  | { type: "meta"; tabTitle?: string; summary?: string; layoutStyle?: LayoutStyle }
  | { type: "done"; response: AdaptiveUIResponse }
  | { type: "error"; error: string; status: number };

// ── store types ───────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  /** Tab that holds this assistant message's generated UI (if any). */
  tabId?: string;
  isError?: boolean;
}

export interface TabEntry {
  id: string;
  title: string;
  query: string;
  layoutStyle?: LayoutStyle;
  response: AdaptiveUIResponse;
  createdAt: number;
  /** True while the response is still streaming in. Never persisted. */
  streaming?: boolean;
}

export type WebSearchMode = "auto" | "on" | "off";

export interface ChatStore {
  webSearchMode: WebSearchMode;
  setWebSearchMode: (m: WebSearchMode) => void;
  messages: ChatMessage[];
  tabs: TabEntry[];
  activeTabId: string | null;
  isChatOpen: boolean;
  isLoading: boolean;
  statusMessage: string | null;
  sendQuery: (query: string) => Promise<void>;
  cancelQuery: () => void;
  closeTab: (id: string) => void;
  closeAllTabs: () => void;
  updateTabLayout: (tabId: string, layout: LayoutStyle) => void;
  setActiveTab: (id: string) => void;
  toggleChat: () => void;
  clearMessages: () => void;
}
