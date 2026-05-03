// File: ./src/lib/gemini.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AdaptiveUIResponse } from "./types";

const MODEL = "gemma-3-27b-it";

const ALL_TYPES = [
  "text", "cards", "chart", "code",
  "timeline", "table", "stat_cards", "progress",
  "accordion", "tabs_content", "quote", "steps", "comparison",
];

const SYSTEM_PROMPT = `You are a JSON API. Respond ONLY with a valid JSON object. No prose. No markdown fences. No explanation.

REQUIRED OUTPUT FORMAT:
{"tabTitle":"<max 30 chars>","summary":"<one sentence>","components":[...]}

COMPONENT TYPES — use the most appropriate ones for the request:

{"type":"text","content":"<markdown text>"}

{"type":"cards","cards":[{"title":"<str>","body":"<str>","badge":"<optional str>","icon":"<optional emoji>"}]}

{"type":"chart","chartType":"bar","chartTitle":"<str>","chartData":{"labels":["A","B"],"datasets":[{"label":"<str>","data":[10,20]}]}}

{"type":"code","language":"python","code":"print('hello')"}
{"type":"code","snippets":[{"language":"javascript","label":"JS","code":"console.log('hi')"},{"language":"python","label":"Python","code":"print('hi')"}]}

{"type":"timeline","events":[{"year":"2020","title":"<str>","description":"<str>","icon":"<emoji>"}]}

{"type":"table","tableHeaders":["Col1","Col2"],"tableRows":[["val1","val2"],["val3","val4"]]}

{"type":"stat_cards","stats":[{"label":"Users","value":"1.2M","trend":"+12%","trendDirection":"up","icon":"👥"}]}

{"type":"progress","progressTitle":"<str>","items":[{"label":"React","value":85},{"label":"Vue","value":70}]}

{"type":"accordion","accordionItems":[{"question":"<str>","answer":"<str>"}]}

{"type":"tabs_content","tabs":[{"label":"Overview","content":"<markdown>"},{"label":"Details","content":"<markdown>"}]}

{"type":"quote","quoteType":"tip","content":"<str>","author":"<optional str>"}
quoteType options: tip | warning | info | success | quote

{"type":"steps","steps":[{"title":"Step 1","description":"<str>","code":"npm install","language":"bash"}]}

{"type":"comparison","leftSide":{"title":"Pros","items":["Fast","Easy"],"color":"green"},"rightSide":{"title":"Cons","items":["Complex","Heavy"],"color":"red"}}
color options: green | red | blue | neutral

SELECTION RULES — FOLLOW EXACTLY:
- "compare X vs Y" or "pros and cons" → USE comparison + text (NOT cards)
- "history of" or "timeline of" → USE timeline + text (NOT cards)
- "how to" or "steps to" or "tutorial" → USE steps + quote(tip)
- "FAQ" or "questions about" → USE accordion + text
- "statistics" or "metrics" or "numbers" → USE stat_cards + chart
- "difference between" in a table → USE table + text
- "code in multiple languages" → USE code(snippets) + text
- "features" or "options" or "tools" → USE cards + text
- "skill levels" or "rankings" → USE progress + text
- general explanation → USE text

ALWAYS return 2 or more components. Output ONLY the JSON. Nothing else.`;

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

/*
 * Repairs common structural mistakes small models make.
 * Gemma 3 1B tends to place card/step/event items directly in `components`
 * without the wrapping type envelope. We detect and fix these orphan items.
 */
function repairComponents(components: unknown[]): unknown[] {
  const repaired: unknown[] = [];
  const orphanCards: Record<string, unknown>[] = [];
  const orphanEvents: Record<string, unknown>[] = [];
  const orphanSteps: Record<string, unknown>[] = [];
  const orphanStats: Record<string, unknown>[] = [];

  const flush = () => {
    if (orphanCards.length > 0) {
      repaired.push({ type: "cards", cards: [...orphanCards] });
      orphanCards.length = 0;
    }
    if (orphanEvents.length > 0) {
      repaired.push({ type: "timeline", events: [...orphanEvents] });
      orphanEvents.length = 0;
    }
    if (orphanSteps.length > 0) {
      repaired.push({ type: "steps", steps: [...orphanSteps] });
      orphanSteps.length = 0;
    }
    if (orphanStats.length > 0) {
      repaired.push({ type: "stat_cards", stats: [...orphanStats] });
      orphanStats.length = 0;
    }
  };

  for (const c of components) {
    if (!c || typeof c !== "object") continue;
    const comp = c as Record<string, unknown>;

    if (ALL_TYPES.includes(comp.type as string)) {
      flush();
      repaired.push(comp);
    } else if (typeof comp.title === "string" && typeof comp.body === "string") {
      // Orphan card item
      orphanCards.push(comp);
    } else if (typeof comp.title === "string" && typeof comp.description === "string") {
      // Orphan timeline event or step — disambiguate by presence of "year"
      if ("year" in comp) {
        orphanEvents.push(comp);
      } else {
        orphanSteps.push(comp);
      }
    } else if (typeof comp.label === "string" && typeof comp.value === "string") {
      // Orphan stat card
      orphanStats.push(comp);
    } else if (typeof comp.content === "string") {
      flush();
      repaired.push({ type: "text", content: comp.content });
    }
  }

  flush();
  return repaired;
}

function validateResponse(data: unknown): AdaptiveUIResponse | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.tabTitle !== "string") return null;
  if (!Array.isArray(d.components)) return null;

  const repaired = repairComponents(d.components);
  if (repaired.length === 0) return null;

  d.components = repaired;

  for (const c of d.components as unknown[]) {
    if (!c || typeof c !== "object") return null;
    const comp = c as Record<string, unknown>;
    if (!ALL_TYPES.includes(comp.type as string)) return null;
  }

  return data as AdaptiveUIResponse;
}

/*
 * Extracts the first complete JSON object from the model output.
 * Handles cases where the model wraps output in prose or code fences.
 */
function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return raw.slice(start, end + 1).trim();
  }

  return raw.trim();
}

export async function generateAdaptiveUI(
  userQuery: string,
  conversationHistory: { role: "user" | "model"; parts: { text: string }[] }[] = []
): Promise<AdaptiveUIResponse> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: MODEL });

  const augmentedQuery = `${SYSTEM_PROMPT}\n\n---\nUser request: ${userQuery}\n\nRespond with ONLY the JSON object:`;

  const chat = model.startChat({
    history: conversationHistory,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 4096,
    },
  });

  const result = await chat.sendMessage(augmentedQuery);
  const raw = result.response.text();

  if (process.env.NODE_ENV === "development") {
    console.log("[gemini.ts] raw model output:", raw.slice(0, 500));
  }

  const cleaned = extractJSON(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("[gemini.ts] JSON parse failed. cleaned output:", cleaned.slice(0, 300));
    throw new Error(`Model returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }

  const validated = validateResponse(parsed);
  if (!validated) {
    console.error("[gemini.ts] Schema validation failed. parsed:", JSON.stringify(parsed).slice(0, 300));
    throw new Error(`Model response did not match expected schema: ${cleaned.slice(0, 200)}`);
  }

  return validated;
}
