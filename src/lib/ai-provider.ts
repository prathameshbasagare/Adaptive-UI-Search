// File: ./src/lib/ai-provider.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AdaptiveUIResponse } from "./types";

// ── Model registry ───────────────────────────────────────────────────────────
// Ranked strongest → weakest. The fallback loop tries models in this order,
// skipping any whose provider API key is not configured.

type Provider = "gemini" | "openrouter";

interface ModelConfig {
  id: string;
  provider: Provider;
  /** OpenRouter-specific model ID (only needed when provider === "openrouter") */
  routerId?: string;
  contextWindow: number;
  maxOutput: number;
}

const MODEL_REGISTRY: ModelConfig[] = [
  // ── Tier 1: Flagship models ──
  { id: "openrouter/owl-alpha", provider: "openrouter", routerId: "openrouter/owl-alpha", contextWindow: 128_000, maxOutput: 8_192 },
  { id: "gemini-2.5-flash", provider: "gemini", contextWindow: 1_048_576, maxOutput: 65_535 },
  { id: "gemma-4-31b-it", provider: "gemini", contextWindow: 256_000, maxOutput: 8_192 },
  { id: "gemma-4-26b-a4b-it", provider: "gemini", contextWindow: 256_000, maxOutput: 8_192 },

  // ── Tier 2: Strong free models ──
  { id: "gemma-4-31b-it-or", provider: "openrouter", routerId: "google/gemma-4-31b-it:free", contextWindow: 128_000, maxOutput: 8_192 },
  { id: "gemma-3-27b-it", provider: "gemini", contextWindow: 128_000, maxOutput: 8_192 },
  { id: "nemotron-3-super", provider: "openrouter", routerId: "nvidia/nemotron-3-super:free", contextWindow: 32_000, maxOutput: 8_192 },

  // ── Tier 3: Lite / smaller models ──
  { id: "gemini-3.1-flash-lite-preview", provider: "gemini", contextWindow: 1_048_576, maxOutput: 65_535 },
  { id: "gemini-2.5-flash-lite", provider: "gemini", contextWindow: 1_048_576, maxOutput: 65_535 },
  { id: "gemma-3-12b-it", provider: "gemini", contextWindow: 128_000, maxOutput: 8_192 },
];

/** Maximum number of models to try before giving up */
const MAX_ATTEMPTS = 3;

// ── Shared constants ─────────────────────────────────────────────────────────

const ALL_TYPES = [
  "text", "cards", "chart", "code",
  "timeline", "table", "stat_cards", "progress",
  "accordion", "tabs_content", "quote", "steps", "comparison",
  "rating", "quiz", "image_gallery", "key_value", "terminal",
  "flashcard", "color_palette", "poll", "rating_grid",
  "flow_diagram", "map_highlight", "document_view",
];

const SYSTEM_PROMPT = `You are a JSON API. Respond ONLY with a valid JSON object. No prose. No markdown fences. No explanation.

CRITICAL JSON RULES:
- Properly escape all special characters inside string values.
- Use \\n for newlines and \\" for nested quotes to prevent JSON.parse() crashes.

CRITICAL CONTENT RULES:
- BE EXHAUSTIVE AND HIGHLY DETAILED. Do not give brief summaries. 
- Markdown text should be in-depth and comprehensive.
- Cards, steps, and timeline descriptions must contain rich, multi-sentence details.
- Build a visually rich page. ALWAYS mix text blocks with visual/data components (charts, tables, cards, code, stats).

REQUIRED OUTPUT FORMAT:
{"_thought":"<brief reasoning about intent & component selection BEFORE outputting components>","tabTitle":"<max 30 chars>","summary":"<one sentence>","components":[...]}

COMPONENT TYPES (compact schema):

{"type":"text","content":"<markdown>"}
{"type":"cards","cards":[{"title":"<str>","body":"<str>","badge":"<opt str>","icon":"<opt emoji>","details":"<opt markdown>"}]}
{"type":"chart","chartType":"bar","chartTitle":"<str>","chartData":{"labels":["A","B"],"datasets":[{"label":"<str>","data":[10,20]}]}}
{"type":"code","language":"python","code":"print('hi')"}
{"type":"code","snippets":[{"language":"js","label":"JS","code":"console.log('hi')"}]}
{"type":"timeline","events":[{"year":"2020","title":"<str>","description":"<str>","icon":"<emoji>"}]}
{"type":"table","tableHeaders":["Col1"],"tableRows":[["val1"]]}
{"type":"stat_cards","stats":[{"label":"Users","value":"1.2M","trend":"+12%","trendDirection":"up","icon":"👥"}]}
{"type":"progress","progressTitle":"<str>","items":[{"label":"React","value":85}]}
{"type":"accordion","accordionItems":[{"question":"<str>","answer":"<str>"}]}
{"type":"tabs_content","tabs":[{"label":"Tab1","content":"<markdown>"}]}
{"type":"quote","quoteType":"tip","content":"<str>","author":"<opt str>"} (options: tip|warning|info|success|quote)
{"type":"steps","steps":[{"title":"Step 1","description":"<str>","code":"npm i","language":"bash"}]}
{"type":"comparison","leftSide":{"title":"Pros","items":["Fast"],"color":"green"},"rightSide":{"title":"Cons","items":["Heavy"],"color":"red"}} (color: green|red|blue|neutral. green/red for pros/cons, blue/neutral for comparisons)
{"type":"rating","ratingTitle":"Rate","ratingItems":[{"label":"React","defaultScore":4}]}
{"type":"quiz","questions":[{"question":"<str>","options":["A","B"],"correct":1,"explanation":"<opt>"}]}
{"type":"image_gallery","query":"nature","count":6,"caption":"<opt>"}
{"type":"key_value","kvTitle":"<opt>","entries":[{"key":"Lang","value":"Python","category":"<opt>"}]}
{"type":"terminal","terminalTitle":"sh","lines":[{"prompt":"$","command":"ls","output":"file"}]}
{"type":"flashcard","flashcardTitle":"<opt>","flashcards":[{"front":"Q","back":"A"}]}
{"type":"color_palette","paletteTitle":"<opt>","swatches":[{"name":"Primary","hex":"#fff","description":"<opt>"}]}
{"type":"poll","pollQuestion":"<str>","options":[{"label":"A","initialPercent":30}]}
{"type":"rating_grid","gridTitle":"<opt>","criteria":["Speed"],"gridItems":[{"item":"React","scores":{"Speed":8}}]}
{"type":"flow_diagram","flowTitle":"<opt>","nodes":[{"id":"a","label":"Start","shape":"circle"}],"edges":[{"from":"a","to":"b","label":"<opt>"}]} (shape: rect|diamond|circle. NOTE: Frontend auto-layout engine handles positioning, do NOT provide x/y coordinates)
{"type":"map_highlight","mapTitle":"<opt>","highlights":[{"country":"France","value":"<opt>"}]}
{"type":"document_view","docTitle":"<str>","docSubtitle":"<opt>","content":"<markdown>"}

SELECTION RULES — FOLLOW EXACTLY:
- compare neutral → comparison(blue/neutral) + text + table
- pros and cons → comparison(green/red) + text + cards
- timeline/history → timeline + text + image_gallery
- how to/guide → steps + quote(tip) + code/terminal
- FAQ → accordion + text + quote(info)
- statistics/metrics → stat_cards + chart + text
- differences → table + text + comparison
- code snippets → code(snippets) + text + terminal
- features/list → cards + text + key_value
- skills/ranking → progress + text + rating_grid
- quiz → text + quiz + flashcard
- rating → rating + text + cards
- images → image_gallery + text
- setup/install → terminal + steps + code
- flashcards → text + flashcard
- colors → color_palette + text
- poll/vote → poll + text
- multi-criteria → rating_grid + text + table
- flow/process → flow_diagram + text + steps
- map/countries → map_highlight + text + stat_cards
- article/report → document_view + text + quote
- specs → key_value + text + table
- general → text + cards + image_gallery

ALWAYS return >=4 components per response. Output ONLY JSON. Nothing else.`;
// ── Provider call implementations ────────────────────────────────────────────

async function callGeminiModel(
  modelConfig: ModelConfig,
  userQuery: string,
  conversationHistory: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: modelConfig.id });

  const augmentedQuery = `${SYSTEM_PROMPT}\n\n---\nUser request: ${userQuery}\n\nRespond with ONLY the JSON object:`;

  const chat = model.startChat({
    history: conversationHistory,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: modelConfig.maxOutput,
    },
  });

  const result = await chat.sendMessage(augmentedQuery);
  return result.response.text();
}

async function callOpenRouterModel(
  modelConfig: ModelConfig,
  userQuery: string,
  conversationHistory: { role: "user" | "model"; parts: { text: string }[] }[]
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured");

  // Convert Gemini-style history to OpenAI-style messages
  const messages: { role: string; content: string }[] = [];

  // System prompt
  messages.push({ role: "system", content: SYSTEM_PROMPT });

  // Conversation history
  for (const h of conversationHistory) {
    messages.push({
      role: h.role === "model" ? "assistant" : "user",
      content: h.parts.map((p) => p.text).join("\n"),
    });
  }

  // Current user query
  messages.push({ role: "user", content: userQuery });

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://adaptive-ui-search.vercel.app",
      "X-Title": "AdaptiveUI Search",
    },
    body: JSON.stringify({
      model: modelConfig.routerId ?? modelConfig.id,
      messages,
      temperature: 0.4,
      max_tokens: modelConfig.maxOutput,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    throw new Error(
      `OpenRouter API error ${response.status}: ${errBody.slice(0, 200)}`
    );
  }

  const data = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    throw new Error("OpenRouter returned empty response");
  }

  return data.choices[0].message.content;
}

// ── JSON extraction & validation (unchanged from original) ───────────────────

/*
 * Repairs common structural mistakes small models make.
 * Detects orphan component items placed directly in `components` array
 * and wraps them into their correct type envelopes.
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
      orphanCards.push(comp);
    } else if (typeof comp.title === "string" && typeof comp.description === "string") {
      // Disambiguate timeline event vs step by presence of "year"
      if ("year" in comp) {
        orphanEvents.push(comp);
      } else {
        orphanSteps.push(comp);
      }
    } else if (typeof comp.label === "string" && typeof comp.value === "string") {
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

// ── Main entry point with fallback ───────────────────────────────────────────

/**
 * Returns the list of models that can actually be used based on which
 * API keys are configured.
 */
function getAvailableModels(): ModelConfig[] {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY;

  return MODEL_REGISTRY.filter((m) => {
    if (m.provider === "gemini") return hasGemini;
    if (m.provider === "openrouter") return hasOpenRouter;
    return false;
  });
}

export async function generateAdaptiveUI(
  userQuery: string,
  conversationHistory: { role: "user" | "model"; parts: { text: string }[] }[] = []
): Promise<AdaptiveUIResponse> {
  const available = getAvailableModels();

  if (available.length === 0) {
    throw new Error(
      "NO_PROVIDER_CONFIGURED: Set GEMINI_API_KEY or OPENROUTER_API_KEY in .env.local"
    );
  }

  const modelsToTry = available.slice(0, MAX_ATTEMPTS);
  const errors: string[] = [];

  for (const modelConfig of modelsToTry) {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log(`[ai-provider] Trying model: ${modelConfig.id} (${modelConfig.provider})`);
      }

      // Call the appropriate provider
      let raw: string;
      if (modelConfig.provider === "gemini") {
        raw = await callGeminiModel(modelConfig, userQuery, conversationHistory);
      } else {
        raw = await callOpenRouterModel(modelConfig, userQuery, conversationHistory);
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[ai-provider] Raw output from ${modelConfig.id}:`, raw.slice(0, 500));
      }

      // Parse and validate
      const cleaned = extractJSON(raw);

      let parsed: unknown;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const msg = `Model ${modelConfig.id} returned invalid JSON`;
        console.error(`[ai-provider] ${msg}:`, cleaned.slice(0, 300));
        errors.push(msg);
        continue; // Try next model
      }

      const validated = validateResponse(parsed);
      if (!validated) {
        const msg = `Model ${modelConfig.id} response did not match expected schema`;
        console.error(`[ai-provider] ${msg}:`, JSON.stringify(parsed).slice(0, 300));
        errors.push(msg);
        continue; // Try next model
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[ai-provider] ✓ Success with model: ${modelConfig.id}`);
      }

      return validated;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[ai-provider] Model ${modelConfig.id} failed:`, msg.slice(0, 200));
      errors.push(`${modelConfig.id}: ${msg.slice(0, 150)}`);
      continue; // Try next model
    }
  }

  // All models failed
  throw new Error(
    `All models failed after ${modelsToTry.length} attempts. Errors: ${errors.join(" | ")}`
  );
}
