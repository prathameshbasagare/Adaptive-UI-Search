// File: ./src/lib/schemas.ts
//
// Single source of truth for every adaptive component:
//   type → Zod schema (runtime validation + TS type) → prompt example.
// The renderer switch in AdaptiveContent is exhaustively type-checked
// against the union derived here, so adding a component means:
//   1. add an entry to COMPONENT_REGISTRY below
//   2. add a `case` in AdaptiveContent (TypeScript will error until you do)

import { z } from "zod";

// ── Lenient primitives ───────────────────────────────────────────────────────
// LLM output is noisy. We coerce where intent is unambiguous and drop
// individual bad array items instead of rejecting the whole component.

const str = z.string();
const optStr = z.string().optional().catch(undefined);
/** Accepts numbers or numeric strings ("42", "42%"). */
const num = z.preprocess((v) => {
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^0-9.+-]/g, ""));
    return Number.isFinite(n) ? n : v;
  }
  return v;
}, z.number().finite());
/** Accepts strings or numbers, always yields a string. */
const textish = z.union([z.string(), z.number()]).transform(String);
const trendDirection = z.enum(["up", "down", "neutral"]).optional().catch(undefined);

/**
 * Array whose invalid items are silently dropped. The array itself must
 * be present and end up with at least `min` valid items.
 */
function lenientArray<T extends z.ZodType>(item: T, min = 1) {
  return z
    .array(z.unknown())
    .transform((arr) =>
      arr.flatMap((v) => {
        const r = item.safeParse(v);
        return r.success ? [r.data as z.output<T>] : [];
      })
    )
    .pipe(z.array(z.custom<z.output<T>>()).min(min));
}

// ── Item schemas ─────────────────────────────────────────────────────────────

export const CardItemSchema = z.object({
  title: textish,
  body: textish,
  badge: optStr,
  icon: optStr,
  details: optStr,
});

export const BentoItemSchema = z.object({
  title: textish,
  body: textish,
  badge: optStr,
  icon: optStr,
  colSpan: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional().catch(undefined),
  rowSpan: z.union([z.literal(1), z.literal(2)]).optional().catch(undefined),
  statValue: textish.optional().catch(undefined),
  statLabel: optStr,
  trend: optStr,
  trendDirection,
  headerSnippet: optStr,
  details: optStr,
});

export const ChartDatasetSchema = z.object({
  label: textish.catch(""),
  data: z.array(num.catch(0)),
  backgroundColor: z.union([z.string(), z.array(z.string())]).optional().catch(undefined),
  borderColor: z.union([z.string(), z.array(z.string())]).optional().catch(undefined),
  type: z.enum(["bar", "line"]).optional().catch(undefined),
});

export const ChartDataSchema = z.object({
  labels: z.array(textish),
  datasets: lenientArray(ChartDatasetSchema),
});

export const CodeSnippetSchema = z.object({
  language: str.catch("text"),
  label: optStr,
  code: str,
});

export const TimelineEventSchema = z.object({
  year: textish.optional().catch(undefined),
  title: textish,
  description: textish.catch(""),
  icon: optStr,
});

export const StatCardSchema = z.object({
  label: textish,
  value: textish,
  trend: optStr,
  trendDirection,
  icon: optStr,
});

export const ProgressItemSchema = z.object({
  label: textish,
  value: num.transform((v) => Math.min(100, Math.max(0, v))),
});

export const AccordionItemSchema = z.object({ question: textish, answer: textish });
export const TabContentSchema = z.object({ label: textish, content: textish });

export const StepSchema = z.object({
  title: textish,
  description: textish.catch(""),
  code: optStr,
  language: optStr,
});

export const ComparisonSideSchema = z.object({
  title: textish,
  items: lenientArray(textish, 0),
  color: z.enum(["green", "red", "blue", "neutral"]).optional().catch(undefined),
});

export const RatingItemSchema = z.object({
  label: textish,
  defaultScore: num.transform((v) => Math.min(5, Math.max(0, v))).catch(0),
});

export const QuizQuestionSchema = z
  .object({
    question: textish,
    options: lenientArray(textish, 2),
    correct: num.transform((v) => Math.trunc(v)),
    explanation: optStr,
  })
  .refine((q) => q.correct >= 0 && q.correct < q.options.length, "correct out of range");

export const KeyValueEntrySchema = z.object({
  key: textish,
  value: textish,
  category: optStr,
});

export const TerminalLineSchema = z
  .object({ prompt: optStr, command: optStr, output: optStr })
  .refine((l) => l.command !== undefined || l.output !== undefined, "empty line");

export const FlashcardSchema = z.object({ front: textish, back: textish });

export const ColorSwatchSchema = z.object({
  name: textish,
  hex: z.string().regex(/^#?[0-9a-f]{3,8}$/i).transform((h) => (h.startsWith("#") ? h : `#${h}`)),
  description: optStr,
});

export const PollOptionSchema = z.object({
  label: textish,
  initialPercent: num.optional().catch(undefined),
});

export const RatingGridItemSchema = z.object({
  item: textish,
  scores: z.record(z.string(), num.catch(0)),
});

// Coordinates are computed client-side (see lib/flow-layout.ts), so any x/y
// the model emits is ignored.
export const FlowNodeSchema = z.object({
  id: textish,
  label: textish,
  shape: z.enum(["rect", "diamond", "circle"]).optional().catch(undefined),
});

export const FlowEdgeSchema = z.object({ from: textish, to: textish, label: optStr });

export const MapHighlightEntrySchema = z.object({
  country: z.string().trim().min(1),
  value: textish.optional().catch(undefined),
});


// ── Showcase (interactive) item schemas ──────────────────────────────────────

/**
 * Parses KPI values like "$4.2B", "98%", "1,200+", 37 into
 * { prefix, value, suffix, decimals } so they can be animated as numbers.
 */
export function parseTickerValue(raw: unknown): { prefix: string; value: number; suffix: string; decimals: number } | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    const decimals = Math.min(2, (String(raw).split(".")[1] ?? "").length);
    return { prefix: "", value: raw, suffix: "", decimals };
  }
  if (typeof raw !== "string") return null;
  const m = raw.trim().match(/^([^\d\-+.]*)([-+]?[\d,]*\.?\d+)(.*)$/);
  if (!m) return null;
  const num = parseFloat(m[2].replace(/,/g, ""));
  if (!Number.isFinite(num)) return null;
  return { prefix: m[1].trim(), value: num, suffix: m[3].trim(), decimals: Math.min(2, (m[2].split(".")[1] ?? "").length) };
}

export const TickerItemSchema = z
  .object({
    value: z.unknown(),
    prefix: optStr,
    suffix: optStr,
    label: textish,
    description: optStr,
    percent: num.transform((v) => Math.min(100, Math.max(0, v))).optional().catch(undefined),
  })
  .transform((it, ctx) => {
    const p = parseTickerValue(it.value);
    if (!p) {
      ctx.addIssue({ code: "custom", message: "value must be numeric" });
      return z.NEVER;
    }
    return {
      label: it.label,
      description: it.description,
      percent: it.percent,
      value: p.value,
      decimals: p.decimals,
      prefix: it.prefix ?? p.prefix,
      suffix: it.suffix ?? p.suffix,
    };
  });

export const StoryChapterSchema = z.object({
  title: textish,
  body: textish,
  visual: optStr,
  stat: textish.optional().catch(undefined),
  statLabel: optStr,
});

export const ShowcasePanelSchema = z.object({
  title: textish,
  body: textish,
  icon: optStr,
  tag: optStr,
  stat: textish.optional().catch(undefined),
});

export const StackCardSchema = z.object({
  title: textish,
  body: textish,
  icon: optStr,
  tag: optStr,
  points: lenientArray(textish, 0).optional().catch(undefined),
});

export const HoverPanelSchema = z.object({
  title: textish,
  summary: textish,
  details: optStr,
  icon: optStr,
  stat: textish.optional().catch(undefined),
});

export const SpotlightCardSchema = z.object({
  title: textish,
  body: textish,
  icon: optStr,
  tag: optStr,
  metric: textish.optional().catch(undefined),
});

export const MarqueeItemSchema = z.object({ label: textish, icon: optStr, detail: optStr });

// ── Component schemas ────────────────────────────────────────────────────────

const base = {
  colSpan: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional().catch(undefined),
  rowSpan: z.union([z.literal(1), z.literal(2)]).optional().catch(undefined),
};

const nonEmpty = z.string().trim().min(1);

export const COMPONENT_REGISTRY = {
  text: {
    schema: z.object({ type: z.literal("text"), ...base, content: nonEmpty }),
    example: `{"type":"text","content":"<short 2-3 sentence markdown introduction only>"}`,
  },
  bento_grid: {
    schema: z.object({ type: z.literal("bento_grid"), ...base, bentoTitle: optStr, bentoItems: lenientArray(BentoItemSchema) }),
    example: `{"type":"bento_grid","bentoTitle":"<opt>","bentoItems":[{"title":"<str>","body":"<str>","badge":"<opt str>","icon":"<opt emoji>","colSpan":2,"statValue":"<opt>","statLabel":"<opt>","trend":"<opt>","trendDirection":"up|down|neutral","headerSnippet":"<opt code/tag>","details":"<opt markdown>"}]}`,
  },
  cards: {
    schema: z.object({ type: z.literal("cards"), ...base, cards: lenientArray(CardItemSchema) }),
    example: `{"type":"cards","cards":[{"title":"<str>","body":"<str>","badge":"<opt str>","icon":"<opt emoji>","details":"<opt markdown>"}]}`,
  },
  chart: {
    schema: z.object({
      type: z.literal("chart"),
      ...base,
      chartType: z.enum(["bar", "line", "pie", "doughnut"]).catch("bar"),
      chartTitle: optStr,
      chartData: ChartDataSchema,
    }),
    example: `{"type":"chart","chartType":"bar|line|pie|doughnut","chartTitle":"<str>","chartData":{"labels":["A","B"],"datasets":[{"label":"<str>","data":[10,20]}]}}`,
  },
  code: {
    schema: z
      .object({
        type: z.literal("code"),
        ...base,
        language: optStr,
        code: optStr,
        codeTitle: optStr,
        snippets: lenientArray(CodeSnippetSchema).optional().catch(undefined),
      })
      .refine((c) => !!c.code || !!c.snippets?.length, "code or snippets required"),
    example: `{"type":"code","language":"python","code":"print('hi')"}  OR  {"type":"code","snippets":[{"language":"js","label":"JS","code":"console.log('hi')"}]}`,
  },
  timeline: {
    schema: z.object({ type: z.literal("timeline"), ...base, events: lenientArray(TimelineEventSchema) }),
    example: `{"type":"timeline","events":[{"year":"2020","title":"<str>","description":"<str>","icon":"<emoji>"}]}`,
  },
  table: {
    schema: z.object({
      type: z.literal("table"),
      ...base,
      tableHeaders: z.array(textish).min(1),
      tableRows: lenientArray(z.array(z.union([textish, z.null().transform(() => "")]))),
    }),
    example: `{"type":"table","tableHeaders":["Col1","Col2"],"tableRows":[["val1","val2"]]}`,
  },
  stat_cards: {
    schema: z.object({ type: z.literal("stat_cards"), ...base, stats: lenientArray(StatCardSchema) }),
    example: `{"type":"stat_cards","stats":[{"label":"Users","value":"1.2M","trend":"+12%","trendDirection":"up","icon":"👥"}]}`,
  },
  progress: {
    schema: z.object({ type: z.literal("progress"), ...base, progressTitle: optStr, items: lenientArray(ProgressItemSchema) }),
    example: `{"type":"progress","progressTitle":"<str>","items":[{"label":"React","value":85}]}`,
  },
  accordion: {
    schema: z.object({ type: z.literal("accordion"), ...base, accordionItems: lenientArray(AccordionItemSchema) }),
    example: `{"type":"accordion","accordionItems":[{"question":"<str>","answer":"<str>"}]}`,
  },
  tabs_content: {
    schema: z.object({ type: z.literal("tabs_content"), ...base, tabs: lenientArray(TabContentSchema) }),
    example: `{"type":"tabs_content","tabs":[{"label":"Tab1","content":"<markdown>"}]}`,
  },
  quote: {
    schema: z.object({
      type: z.literal("quote"),
      ...base,
      quoteType: z.enum(["tip", "warning", "info", "success", "quote"]).catch("info"),
      content: nonEmpty,
      author: optStr,
    }),
    example: `{"type":"quote","quoteType":"tip|warning|info|success|quote","content":"<str>","author":"<opt str>"}`,
  },
  steps: {
    schema: z.object({ type: z.literal("steps"), ...base, steps: lenientArray(StepSchema) }),
    example: `{"type":"steps","steps":[{"title":"Step 1","description":"<str>","code":"npm i","language":"bash"}]}`,
  },
  comparison: {
    schema: z.object({ type: z.literal("comparison"), ...base, leftSide: ComparisonSideSchema, rightSide: ComparisonSideSchema }),
    example: `{"type":"comparison","leftSide":{"title":"Pros","items":["Fast"],"color":"green"},"rightSide":{"title":"Cons","items":["Heavy"],"color":"red"}} (color: green|red|blue|neutral)`,
  },
  rating: {
    schema: z.object({ type: z.literal("rating"), ...base, ratingTitle: optStr, ratingItems: lenientArray(RatingItemSchema) }),
    example: `{"type":"rating","ratingTitle":"Rate","ratingItems":[{"label":"React","defaultScore":4}]}`,
  },
  quiz: {
    schema: z.object({ type: z.literal("quiz"), ...base, questions: lenientArray(QuizQuestionSchema) }),
    example: `{"type":"quiz","questions":[{"question":"<str>","options":["A","B"],"correct":1,"explanation":"<opt>"}]}`,
  },
  image_gallery: {
    schema: z.object({
      type: z.literal("image_gallery"),
      ...base,
      query: nonEmpty.max(100),
      count: num.transform((v) => Math.min(12, Math.max(1, Math.trunc(v)))).catch(6),
      caption: optStr,
    }),
    example: `{"type":"image_gallery","query":"nature","count":6,"caption":"<opt>"}`,
  },
  key_value: {
    schema: z.object({ type: z.literal("key_value"), ...base, kvTitle: optStr, entries: lenientArray(KeyValueEntrySchema) }),
    example: `{"type":"key_value","kvTitle":"<opt>","entries":[{"key":"Lang","value":"Python","category":"<opt>"}]}`,
  },
  terminal: {
    schema: z.object({ type: z.literal("terminal"), ...base, terminalTitle: optStr, lines: lenientArray(TerminalLineSchema) }),
    example: `{"type":"terminal","terminalTitle":"sh","lines":[{"prompt":"$","command":"ls","output":"file"}]}`,
  },
  flashcard: {
    schema: z.object({ type: z.literal("flashcard"), ...base, flashcardTitle: optStr, flashcards: lenientArray(FlashcardSchema) }),
    example: `{"type":"flashcard","flashcardTitle":"<opt>","flashcards":[{"front":"Q","back":"A"}]}`,
  },
  color_palette: {
    schema: z.object({ type: z.literal("color_palette"), ...base, paletteTitle: optStr, swatches: lenientArray(ColorSwatchSchema) }),
    example: `{"type":"color_palette","paletteTitle":"<opt>","swatches":[{"name":"Primary","hex":"#7c3aed","description":"<opt>"}]}`,
  },
  poll: {
    schema: z.object({ type: z.literal("poll"), ...base, pollQuestion: nonEmpty, options: lenientArray(PollOptionSchema, 2) }),
    example: `{"type":"poll","pollQuestion":"<str>","options":[{"label":"A","initialPercent":60},{"label":"B","initialPercent":40}]}`,
  },
  rating_grid: {
    schema: z.object({
      type: z.literal("rating_grid"),
      ...base,
      gridTitle: optStr,
      criteria: lenientArray(textish),
      gridItems: lenientArray(RatingGridItemSchema),
    }),
    example: `{"type":"rating_grid","gridTitle":"<opt>","criteria":["Speed"],"gridItems":[{"item":"React","scores":{"Speed":8}}]}`,
  },
  flow_diagram: {
    schema: z.object({
      type: z.literal("flow_diagram"),
      ...base,
      flowTitle: optStr,
      nodes: lenientArray(FlowNodeSchema),
      edges: lenientArray(FlowEdgeSchema, 0).catch([]),
    }),
    example: `{"type":"flow_diagram","flowTitle":"<opt>","nodes":[{"id":"a","label":"Start","shape":"circle|rect|diamond"}],"edges":[{"from":"a","to":"b","label":"<opt>"}]}`,
  },
  map_highlight: {
    schema: z.object({ type: z.literal("map_highlight"), ...base, mapTitle: optStr, highlights: lenientArray(MapHighlightEntrySchema) }),
    example: `{"type":"map_highlight","mapTitle":"<opt>","highlights":[{"country":"France","value":"<opt>"}]}`,
  },
  document_view: {
    schema: z.object({ type: z.literal("document_view"), ...base, docTitle: optStr, docSubtitle: optStr, content: nonEmpty }),
    example: `{"type":"document_view","docTitle":"<str>","docSubtitle":"<opt>","content":"<markdown>"}`,
  },
  // ── Showcase: scroll- and hover-driven interactive blocks ──
  parallax_hero: {
    schema: z.object({
      type: z.literal("parallax_hero"),
      ...base,
      eyebrow: optStr,
      title: nonEmpty.max(120),
      subtitle: optStr,
      icon: optStr,
      highlights: lenientArray(z.object({ label: textish, value: textish }), 0).optional().catch(undefined),
    }),
    example: `{"type":"parallax_hero","eyebrow":"<short kicker>","title":"<punchy 3-8 word headline>","subtitle":"<1-2 sentences>","icon":"<emoji>","highlights":[{"label":"Founded","value":"2015"},{"label":"Users","value":"30M+"}]}`,
  },
  scroll_story: {
    schema: z.object({
      type: z.literal("scroll_story"),
      ...base,
      storyTitle: optStr,
      chapters: lenientArray(StoryChapterSchema, 2),
    }),
    example: `{"type":"scroll_story","storyTitle":"<opt>","chapters":[{"title":"<str>","body":"<2-3 sentences>","visual":"<emoji>","stat":"<opt big number>","statLabel":"<opt>"},{"title":"<str>","body":"<str>","visual":"<emoji>"}]}`,
  },
  horizontal_scroll: {
    schema: z.object({
      type: z.literal("horizontal_scroll"),
      ...base,
      sectionTitle: optStr,
      panels: lenientArray(ShowcasePanelSchema, 3),
    }),
    example: `{"type":"horizontal_scroll","sectionTitle":"<opt>","panels":[{"title":"<str>","body":"<1-2 sentences>","icon":"<emoji>","tag":"<opt>","stat":"<opt>"},{"title":"<str>","body":"<str>","icon":"<emoji>"},{"title":"<str>","body":"<str>","icon":"<emoji>"}]}`,
  },
  stacking_cards: {
    schema: z.object({
      type: z.literal("stacking_cards"),
      ...base,
      stackTitle: optStr,
      cards: lenientArray(StackCardSchema, 2),
    }),
    example: `{"type":"stacking_cards","stackTitle":"<opt>","cards":[{"title":"<str>","body":"<2 sentences>","icon":"<emoji>","tag":"<opt>","points":["<opt bullet>","<opt bullet>"]},{"title":"<str>","body":"<str>","icon":"<emoji>"}]}`,
  },
  text_reveal: {
    schema: z.object({
      type: z.literal("text_reveal"),
      ...base,
      statement: nonEmpty.max(400),
      attribution: optStr,
      emphasis: lenientArray(textish, 0).optional().catch(undefined),
    }),
    example: `{"type":"text_reveal","statement":"<one powerful 15-40 word insight>","attribution":"<opt>","emphasis":["<key word>","<key word>"]}`,
  },
  number_ticker: {
    schema: z.object({
      type: z.literal("number_ticker"),
      ...base,
      tickerTitle: optStr,
      items: lenientArray(TickerItemSchema),
    }),
    example: `{"type":"number_ticker","tickerTitle":"<opt>","items":[{"value":"$4.2B","label":"Revenue","description":"<opt>","percent":72},{"value":98.5,"suffix":"%","label":"Uptime"}]}`,
  },
  hover_panels: {
    schema: z.object({
      type: z.literal("hover_panels"),
      ...base,
      panelsTitle: optStr,
      panels: lenientArray(HoverPanelSchema, 2),
    }),
    example: `{"type":"hover_panels","panelsTitle":"<opt>","panels":[{"title":"<1-3 words>","summary":"<one line>","details":"<2 sentences>","icon":"<emoji>","stat":"<opt>"},{"title":"<str>","summary":"<str>","icon":"<emoji>"}]}`,
  },
  spotlight_cards: {
    schema: z.object({
      type: z.literal("spotlight_cards"),
      ...base,
      gridTitle: optStr,
      cards: lenientArray(SpotlightCardSchema),
    }),
    example: `{"type":"spotlight_cards","gridTitle":"<opt>","cards":[{"title":"<str>","body":"<1-2 sentences>","icon":"<emoji>","tag":"<opt>","metric":"<opt e.g. 3x faster>"}]}`,
  },
  marquee: {
    schema: z.object({
      type: z.literal("marquee"),
      ...base,
      marqueeTitle: optStr,
      items: lenientArray(MarqueeItemSchema, 4),
      speed: z.enum(["slow", "normal", "fast"]).catch("normal"),
    }),
    example: `{"type":"marquee","marqueeTitle":"<opt>","speed":"slow|normal|fast","items":[{"label":"React","icon":"⚛️","detail":"<opt short>"},{"label":"<str>"},{"label":"<str>"},{"label":"<str>"}]}`,
  },
} as const;

export type ComponentType = keyof typeof COMPONENT_REGISTRY;
export const COMPONENT_TYPES = Object.keys(COMPONENT_REGISTRY) as ComponentType[];

type Registry = typeof COMPONENT_REGISTRY;
export type ComponentDef = {
  [K in ComponentType]: z.output<Registry[K]["schema"]>;
}[ComponentType];
export type ComponentOf<K extends ComponentType> = Extract<ComponentDef, { type: K }>;

export const LAYOUT_STYLES = ["bento", "dashboard", "docs", "split", "standard"] as const;
export type LayoutStyle = (typeof LAYOUT_STYLES)[number];

export interface AdaptiveUIResponse {
  tabTitle: string;
  summary?: string;
  layoutStyle: LayoutStyle;
  components: ComponentDef[];
}

export function isComponentType(t: unknown): t is ComponentType {
  return typeof t === "string" && t in COMPONENT_REGISTRY;
}

/** Validates a single raw component. Returns null when it cannot be rendered safely. */
export function parseComponent(raw: unknown): ComponentDef | null {
  if (!raw || typeof raw !== "object") return null;
  const type = (raw as { type?: unknown }).type;
  if (!isComponentType(type)) return null;
  const r = COMPONENT_REGISTRY[type].schema.safeParse(raw);
  return r.success ? (r.data as ComponentDef) : null;
}

/** Prompt section listing every component's compact schema. */
export function componentPromptSchemas(): string {
  return COMPONENT_TYPES.map((t) => COMPONENT_REGISTRY[t].example).join("\n");
}
