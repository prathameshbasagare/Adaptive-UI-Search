// File: ./src/lib/types.ts

export type ComponentType =
  | "text"
  | "cards"
  | "chart"
  | "code"
  | "timeline"
  | "table"
  | "stat_cards"
  | "progress"
  | "accordion"
  | "tabs_content"
  | "quote"
  | "steps"
  | "comparison";

// ── cards ────────────────────────────────────────────────────────────────────

export interface CardItem {
  title: string;
  body: string;
  badge?: string;
  icon?: string;
}

// ── chart ────────────────────────────────────────────────────────────────────

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  // Per-dataset chart type override for mixed charts
  type?: "bar" | "line";
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// ── code ─────────────────────────────────────────────────────────────────────

export interface CodeSnippet {
  language: string;
  label?: string;
  code: string;
}

// ── timeline ─────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  year?: string;
  title: string;
  description: string;
  icon?: string;
}

// ── stat_cards ───────────────────────────────────────────────────────────────

export interface StatCard {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon?: string;
}

// ── progress ─────────────────────────────────────────────────────────────────

export interface ProgressItem {
  label: string;
  value: number;
}

// ── accordion ────────────────────────────────────────────────────────────────

export interface AccordionItem {
  question: string;
  answer: string;
}

// ── tabs_content ─────────────────────────────────────────────────────────────

export interface TabContent {
  label: string;
  content: string;
}

// ── steps ────────────────────────────────────────────────────────────────────

export interface Step {
  title: string;
  description: string;
  code?: string;
  language?: string;
}

// ── comparison ───────────────────────────────────────────────────────────────

export interface ComparisonSide {
  title: string;
  items: string[];
  color?: "green" | "red" | "blue" | "neutral";
}

// ── ComponentDef ─────────────────────────────────────────────────────────────

export interface ComponentDef {
  type: ComponentType;

  // text
  content?: string;

  // cards
  cards?: CardItem[];

  // chart
  chartType?: "bar" | "line" | "pie" | "doughnut";
  chartData?: ChartData;
  chartTitle?: string;

  // code — single snippet (legacy) or multi-snippet tabs
  language?: string;
  code?: string;
  codeTitle?: string;
  snippets?: CodeSnippet[];

  // timeline
  events?: TimelineEvent[];

  // table
  tableHeaders?: string[];
  tableRows?: string[][];

  // stat_cards
  stats?: StatCard[];

  // progress
  progressTitle?: string;
  items?: ProgressItem[];

  // accordion
  accordionItems?: AccordionItem[];

  // tabs_content
  tabs?: TabContent[];

  // quote
  quoteType?: "tip" | "warning" | "info" | "success" | "quote";
  author?: string;

  // steps
  steps?: Step[];

  // comparison
  leftSide?: ComparisonSide;
  rightSide?: ComparisonSide;
}

// ── top-level response ────────────────────────────────────────────────────────

export interface AdaptiveUIResponse {
  tabTitle: string;
  summary?: string;
  components: ComponentDef[];
}

// ── store types ───────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  adaptiveResponse?: AdaptiveUIResponse;
}

export interface TabEntry {
  id: string;
  title: string;
  query: string;
  response: AdaptiveUIResponse;
  createdAt: number;
}

export interface ChatStore {
  messages: ChatMessage[];
  tabs: TabEntry[];
  activeTabId: string | null;
  isChatOpen: boolean;
  isLoading: boolean;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  addTab: (tab: Omit<TabEntry, "id" | "createdAt">) => void;
  setActiveTab: (id: string) => void;
  toggleChat: () => void;
  setLoading: (v: boolean) => void;
  clearMessages: () => void;
}
