// File: ./src/lib/ai-provider.ts

import { GoogleGenerativeAI, type Content } from "@google/generative-ai";
import { componentPromptSchemas, parseComponent, type AdaptiveUIResponse, type ComponentDef } from "./schemas";
import { ComponentStreamScanner, extractJSON } from "./json-stream";
import { normalizeLayout, validateResponse } from "./validate";
import { envInt } from "./rate-limit";
import type { HistoryTurn, StreamEvent } from "./types";

// ── Model registry ───────────────────────────────────────────────────────────
// Ranked strongest → weakest within each provider. Providers are tried in
// PROVIDER_PRIORITY order; see buildAttemptPlan for how attempts are chosen.

type Provider = "custom" | "gemini" | "openrouter";

interface ModelConfig {
  id: string;
  provider: Provider;
  /** Model name sent to the API (defaults to id). */
  apiModel?: string;
  maxOutput: number;
  /** Gemini API: Gemma models reject systemInstruction and JSON mode. */
  nativeSystemPrompt?: boolean;
  jsonMode?: boolean;
}

const PROVIDER_PRIORITY: Provider[] = ["custom", "openrouter", "gemini"];

function customModels(): ModelConfig[] {
  const list = (process.env.CUSTOM_MODELS || "auto,claude-sonnet-4-5,gemini-3.8-flash,qwen3.8-max")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // JSON mode is opt-in: some OpenAI-compatible gateways buffer the entire
  // response when response_format is set, which defeats streaming.
  const jsonMode = process.env.CUSTOM_JSON_MODE === "true";
  return list.map((m) => ({ id: `custom/${m}`, provider: "custom", apiModel: m, maxOutput: 8_192, jsonMode }));
}

const STATIC_REGISTRY: ModelConfig[] = [
  { id: "openrouter/owl-alpha", provider: "openrouter", apiModel: "openrouter/owl-alpha", maxOutput: 8_192, jsonMode: true },
  { id: "gemma-4-31b-it-or", provider: "openrouter", apiModel: "google/gemma-4-31b-it:free", maxOutput: 8_192 },
  { id: "nemotron-3-super", provider: "openrouter", apiModel: "nvidia/nemotron-3-super:free", maxOutput: 8_192 },

  { id: "gemini-2.5-flash", provider: "gemini", maxOutput: 65_535, nativeSystemPrompt: true, jsonMode: true },
  { id: "gemini-3.1-flash-lite-preview", provider: "gemini", maxOutput: 65_535, nativeSystemPrompt: true, jsonMode: true },
  { id: "gemini-2.5-flash-lite", provider: "gemini", maxOutput: 65_535, nativeSystemPrompt: true, jsonMode: true },
  { id: "gemma-4-31b-it", provider: "gemini", maxOutput: 8_192 },
  { id: "gemma-4-26b-a4b-it", provider: "gemini", maxOutput: 8_192 },
  { id: "gemma-3-27b-it", provider: "gemini", maxOutput: 8_192 },
];

/** Upper bound on output tokens we ever request; responses are a few KB of JSON. */
const OUTPUT_TOKEN_CAP = 16_384;

// ── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a Principal UI/UX Architect and Visual Interface Designer. Respond ONLY with a valid JSON object. No prose. No markdown fences. No explanation.

CRITICAL DESIGN PHILOSOPHY:
- NEVER default to plain text walls. If information can be structured visually, USE A RICH COMPONENT.
- At most ONE brief "text" block (2-3 sentences). Never output multiple text blocks.
- Overviews / features → "bento_grid"; metrics & KPIs → "stat_cards" (with trend + trendDirection); trends → "chart"; showdowns / pros-cons → "comparison" + "table"; guides & workflows → "steps" or "flow_diagram"; setup → "terminal" + "code"; specs → "key_value"; tips & warnings → "quote"; multi-attribute scoring → "rating_grid"; FAQs → "accordion".

CRITICAL JSON RULES:
- Properly escape all special characters inside string values (\\n for newlines, \\" for quotes).
- Use real numbers for numeric fields (value, data, correct, defaultScore, scores).
- Follow each component schema exactly; components with missing required fields are discarded.

REQUIRED OUTPUT FORMAT (keys in this order):
{"_thought":"<max 30 words: intent, chosen layoutStyle, composition>","tabTitle":"<max 30 chars>","layoutStyle":"bento|dashboard|docs|split|standard","summary":"<one clear executive sentence>","components":[...]}

LAYOUT STYLES:
- "bento": asymmetrical bento grid (overviews, feature showcases, tech stacks, company profiles).
- "dashboard": analytics cockpit (financial metrics, benchmarks, statistics).
- "docs": technical documentation with anchor navigation (guides, tutorials, setup, API references).
- "split": head-to-head two columns ("X vs Y", pros/cons).
- "standard": linear visual storyline (timelines, milestones, history).

COMPONENT TYPES (compact schema; <opt> fields may be omitted):
${componentPromptSchemas()}

SHOWCASE BLOCKS (scroll- and hover-driven, full width — these make the page feel premium):
- parallax_hero: cinematic opener. Use it as the FIRST component for overviews of a company, product, place, person, technology or era. At most one.
- number_ticker: 2-4 headline KPIs that count up. Prefer it over stat_cards for the 2-4 most impressive numbers; values must be numeric (e.g. "$4.2B", "98%", 1200).
- scroll_story: 3-5 chapter narrative (history, journey, how something evolved/works). Prefer it over timeline when each step deserves 2-3 sentences.
- horizontal_scroll: 4-8 parallel items worth browsing (products, eras, destinations, case studies).
- stacking_cards: 3-5 big ideas / principles / phases that build on each other.
- hover_panels: 3-5 categories to explore side by side (pillars, regions, plans, roles).
- spotlight_cards: 3-6 features or capabilities (more premium than "cards").
- text_reveal: ONE memorable insight or thesis sentence; put 2-3 key words in "emphasis".
- marquee: 8-16 short names (tech stack, partners, tools, ingredients, cities).
Use 2-4 showcase blocks per response when the topic fits (parallax_hero counts as one), always mixed with at least one data component (chart, table, comparison, timeline…). Never two of the same type, and skip showcase blocks for pure code/how-to answers.

SELECTION RULES:
- company / product / technology overview → bento + parallax_hero + number_ticker + spotlight_cards + chart + marquee
- X vs Y → split + comparison(blue/neutral) + table + hover_panels + stat_cards
- pros and cons → split + comparison(green/red) + bento_grid + rating_grid
- statistics/metrics → dashboard + number_ticker + chart + table + progress
- how-to / setup → docs + steps + quote(tip) + terminal + code(snippets)
- history / evolution / story → standard + parallax_hero + scroll_story + number_ticker + text_reveal
- guide to options / places / products → bento + parallax_hero + horizontal_scroll + table + quote(tip)
- principles / strategy / framework → standard + text_reveal + stacking_cards + hover_panels
- FAQ → docs + accordion + quote(tip) + key_value
- flow/process → docs + flow_diagram + steps + quote(tip)
- quiz / study → quiz + flashcard + progress
- general → bento + bento_grid + spotlight_cards + stat_cards + quote(tip)

FOLLOW-UPS: earlier assistant turns contain the JSON you previously generated. When the user refers to "that", "it", or asks to add/change something, build on that previous output.

ALWAYS return 4 to 6 diverse visual components. Output ONLY JSON.`;

// ── Errors ───────────────────────────────────────────────────────────────────

type FailureKind = "rate_limit" | "auth" | "unavailable" | "bad_output" | "timeout" | "other";

class ProviderError extends Error {
  constructor(
    message: string,
    readonly kind: FailureKind,
    readonly retryAfterSec?: number
  ) {
    super(message);
  }
}

export class GenerationError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function classifyHttp(status: number, body: string): FailureKind {
  if (status === 429 || /quota|rate.?limit|too many requests/i.test(body)) return "rate_limit";
  if (status === 401 || status === 403) return "auth";
  if (status >= 500) return "unavailable";
  return "other";
}

function parseRetryAfter(text: string, header?: string | null): number | undefined {
  const h = header ? parseInt(header, 10) : NaN;
  if (Number.isFinite(h)) return h;
  const m = text.match(/retry[^0-9]{0,30}(\d+(?:\.\d+)?)\s*s/i);
  return m ? Math.ceil(parseFloat(m[1])) : undefined;
}

function toProviderError(err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;
  const e = err as { name?: string; message?: string; status?: number };
  const msg = e?.message ?? String(err);
  if (e?.name === "TimeoutError" || /timed? ?out/i.test(msg)) return new ProviderError(msg, "timeout");
  if (e?.name === "AbortError") return new ProviderError(msg, "timeout");
  const status = e?.status ?? parseInt(msg.match(/\[(\d{3})[^\]]*\]/)?.[1] ?? "", 10);
  if (Number.isFinite(status)) {
    return new ProviderError(msg, classifyHttp(status, msg), parseRetryAfter(msg));
  }
  if (/fetch failed|ECONNREFUSED|ENOTFOUND|network/i.test(msg)) return new ProviderError(msg, "unavailable");
  return new ProviderError(msg, "other");
}

// ── Provider streaming implementations ───────────────────────────────────────

type TextStream = AsyncGenerator<string, void, unknown>;

async function* streamGemini(model: ModelConfig, history: HistoryTurn[], query: string, signal: AbortSignal): TextStream {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ProviderError("GEMINI_API_KEY not configured", "auth");

  const client = new GoogleGenerativeAI(apiKey);
  const contents: Content[] = history.map((h) => ({ role: h.role, parts: [{ text: h.text }] }));

  let systemInstruction: string | undefined;
  if (model.nativeSystemPrompt) {
    systemInstruction = SYSTEM_PROMPT;
    contents.push({ role: "user", parts: [{ text: query }] });
  } else {
    // Gemma rejects systemInstruction — prepend to the first user turn only.
    if (contents.length > 0 && contents[0].role === "user") {
      contents[0] = { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n---\n${contents[0].parts[0].text}` }] };
      contents.push({ role: "user", parts: [{ text: `${query}\n\nRespond with ONLY the JSON object.` }] });
    } else {
      contents.push({ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n---\nUser request: ${query}\n\nRespond with ONLY the JSON object.` }] });
    }
  }

  const gm = client.getGenerativeModel({ model: model.apiModel ?? model.id, systemInstruction });
  const result = await gm.generateContentStream(
    {
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: Math.min(model.maxOutput, OUTPUT_TOKEN_CAP),
        ...(model.jsonMode ? { responseMimeType: "application/json" } : {}),
      },
    },
    { signal }
  );
  for await (const chunk of result.stream) {
    const t = chunk.text();
    if (t) yield t;
  }
}

async function* streamOpenAICompatible(
  model: ModelConfig,
  history: HistoryTurn[],
  query: string,
  signal: AbortSignal
): TextStream {
  let endpoint: string;
  let headers: Record<string, string>;
  if (model.provider === "openrouter") {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new ProviderError("OPENROUTER_API_KEY not configured", "auth");
    endpoint = "https://openrouter.ai/api/v1/chat/completions";
    headers = {
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": process.env.APP_URL || "https://adaptive-ui-search.vercel.app",
      "X-Title": "AdaptiveUI Search",
    };
  } else {
    const baseUrl = (process.env.BASE_URL || process.env.AI_BASE_URL || "").replace(/\/+$/, "");
    const key = process.env.API_KEY || process.env.CUSTOM_API_KEY;
    if (!baseUrl || !key) throw new ProviderError("BASE_URL and API_KEY must be configured", "auth");
    endpoint = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
    headers = { Authorization: `Bearer ${key}` };
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((h) => ({ role: h.role === "model" ? "assistant" : "user", content: h.text })),
    { role: "user", content: query },
  ];

  const send = (jsonMode: boolean) =>
    fetch(endpoint, {
      method: "POST",
      signal,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model.apiModel ?? model.id,
        messages,
        temperature: 0.4,
        max_tokens: Math.min(model.maxOutput, OUTPUT_TOKEN_CAP),
        stream: true,
        ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      }),
    });

  let res = await send(!!model.jsonMode);
  // Some OpenAI-compatible servers reject response_format — retry once without it.
  if (!res.ok && model.jsonMode && (res.status === 400 || res.status === 422)) {
    const body = await res.text().catch(() => "");
    if (/response_format|json/i.test(body)) res = await send(false);
    else throw new ProviderError(`HTTP ${res.status}: ${body.slice(0, 200)}`, classifyHttp(res.status, body));
  }
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    throw new ProviderError(
      `HTTP ${res.status}: ${body.slice(0, 200)}`,
      classifyHttp(res.status, body),
      parseRetryAfter(body, res.headers.get("retry-after"))
    );
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let pending = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    pending += value;
    const lines = pending.split("\n");
    pending = lines.pop() ?? "";
    for (const line of lines) {
      const l = line.trim();
      if (!l.startsWith("data:")) continue;
      const data = l.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        if (json.error) {
          const msg = typeof json.error === "string" ? json.error : JSON.stringify(json.error);
          throw new ProviderError(msg.slice(0, 200), classifyHttp(json.error?.code ?? 0, msg));
        }
        const delta = json.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) yield delta;
      } catch (e) {
        if (e instanceof ProviderError) throw e;
        // ignore keep-alive / malformed SSE lines
      }
    }
  }
}

// ── Attempt planning ─────────────────────────────────────────────────────────

function providerConfigured(p: Provider): boolean {
  if (p === "custom") {
    return !!((process.env.BASE_URL || process.env.AI_BASE_URL) && (process.env.API_KEY || process.env.CUSTOM_API_KEY));
  }
  if (p === "gemini") return !!process.env.GEMINI_API_KEY;
  return !!process.env.OPENROUTER_API_KEY;
}

/**
 * Picks which models to try: up to PER_PROVIDER models from each configured
 * provider (in priority order), capped at MAX_ATTEMPTS overall. This guarantees
 * a dead provider cannot consume every attempt and block fallback to the others.
 */
export function buildAttemptPlan(): ModelConfig[] {
  const perProvider = envInt("AI_MODELS_PER_PROVIDER", 2);
  const maxAttempts = envInt("AI_MAX_ATTEMPTS", 5);
  const all = [...customModels(), ...STATIC_REGISTRY];
  const plan: ModelConfig[] = [];
  for (const p of PROVIDER_PRIORITY) {
    if (!providerConfigured(p)) continue;
    plan.push(...all.filter((m) => m.provider === p).slice(0, perProvider));
  }
  return plan.slice(0, maxAttempts);
}

// ── Main entry point ─────────────────────────────────────────────────────────

const ATTEMPT_TIMEOUT_MS = envInt("AI_ATTEMPT_TIMEOUT_MS", 90_000);
const MIN_SALVAGE_COMPONENTS = 2;
const FIRST_TOKEN_TIMEOUT_MS = envInt("AI_FIRST_TOKEN_TIMEOUT_MS", 30_000);

export async function generateAdaptiveUIStream(
  query: string,
  history: HistoryTurn[],
  emit: (e: StreamEvent) => void,
  clientSignal: AbortSignal
): Promise<AdaptiveUIResponse> {
  const plan = buildAttemptPlan();
  if (plan.length === 0) {
    throw new GenerationError("Server configuration error: no AI provider API key is configured.", 500);
  }

  const failures: ProviderError[] = [];
  const deadProviders = new Set<Provider>();
  const dev = process.env.NODE_ENV === "development";

  for (const model of plan) {
    if (clientSignal.aborted) throw new GenerationError("Request cancelled", 499);
    if (deadProviders.has(model.provider)) continue;

    emit({ type: "status", message: failures.length ? "Retrying with a fallback model…" : "Designing your layout…" });

    const ctrl = new AbortController();
    const onClientAbort = () => ctrl.abort(clientSignal.reason);
    clientSignal.addEventListener("abort", onClientAbort);
    const overall = setTimeout(() => ctrl.abort(new DOMException("attempt timed out", "TimeoutError")), ATTEMPT_TIMEOUT_MS);
    let firstToken: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => ctrl.abort(new DOMException("no response from model", "TimeoutError")),
      FIRST_TOKEN_TIMEOUT_MS
    );

    const scanner = new ComponentStreamScanner();
    let raw = "";
    let emitted = 0;
    const streamed: ComponentDef[] = [];
    const streamedMeta: Record<string, string> = {};

    try {
      if (dev) console.log(`[ai-provider] Trying ${model.id}`);
      const stream =
        model.provider === "gemini"
          ? streamGemini(model, history, query, ctrl.signal)
          : streamOpenAICompatible(model, history, query, ctrl.signal);

      for await (const chunk of stream) {
        if (firstToken) {
          clearTimeout(firstToken);
          firstToken = undefined;
        }
        raw += chunk;
        const { components, meta } = scanner.feed(chunk);
        Object.assign(streamedMeta, meta);
        if (Object.keys(meta).length) {
          emit({
            type: "meta",
            tabTitle: meta.tabTitle,
            summary: meta.summary,
            layoutStyle: meta.layoutStyle ? normalizeLayout(meta.layoutStyle) : undefined,
          });
        }
        for (const text of components) {
          let comp: ComponentDef | null = null;
          try {
            comp = parseComponent(JSON.parse(text));
          } catch {
            /* incomplete / malformed — final parse decides */
          }
          if (comp) {
            streamed.push(comp);
            emit({ type: "component", index: emitted++, component: comp });
          }
        }
      }

      let validated: AdaptiveUIResponse | null = null;
      try {
        validated = validateResponse(JSON.parse(extractJSON(raw)));
      } catch {
        /* handled below */
      }
      // Salvage: the document as a whole is broken (e.g. truncated, or junk
      // after the last component) but the components that streamed in were
      // individually valid — use them rather than discarding the attempt.
      if (!validated && streamed.length >= MIN_SALVAGE_COMPONENTS) {
        if (dev) console.warn(`[ai-provider] ${model.id}: invalid document, salvaged ${streamed.length} streamed components`);
        validated = {
          tabTitle: (streamedMeta.tabTitle || query).slice(0, 60),
          summary: streamedMeta.summary || undefined,
          layoutStyle: normalizeLayout(streamedMeta.layoutStyle),
          components: streamed,
        };
      }
      if (!validated) throw new ProviderError("returned invalid or off-schema JSON", "bad_output");

      if (dev) console.log(`[ai-provider] ✓ ${model.id} (${validated.components.length} components)`);
      return validated;
    } catch (err) {
      if (clientSignal.aborted) throw new GenerationError("Request cancelled", 499);
      const pe = toProviderError(err);
      failures.push(pe);
      console.error(`[ai-provider] ${model.id} failed (${pe.kind}): ${pe.message.slice(0, 200)}`);
      if (dev && pe.kind === "bad_output") {
        console.error("[ai-provider] raw output head:", raw.slice(0, 200));
        console.error("[ai-provider] raw output tail:", raw.slice(-200));
      }
      // Auth / connectivity problems affect every model of that provider.
      if (pe.kind === "auth" || pe.kind === "unavailable") deadProviders.add(model.provider);
      if (emitted > 0) emit({ type: "reset" });
    } finally {
      clearTimeout(overall);
      if (firstToken) clearTimeout(firstToken);
      clientSignal.removeEventListener("abort", onClientAbort);
    }
  }

  // Every attempt failed: report the most actionable cause.
  if (failures.length > 0 && failures.every((f) => f.kind === "rate_limit")) {
    const wait = Math.max(0, ...failures.map((f) => f.retryAfterSec ?? 0));
    throw new GenerationError(
      `Rate limit reached on all AI providers.${wait ? ` Please wait ${wait}s and try again.` : " Please wait a moment and try again."}`,
      429
    );
  }
  if (failures.some((f) => f.kind === "rate_limit")) {
    throw new GenerationError("AI providers are busy or rate-limited. Please try again in a moment.", 503);
  }
  if (failures.length > 0 && failures.every((f) => f.kind === "timeout")) {
    throw new GenerationError("The AI models took too long to respond. Please try again.", 504);
  }
  throw new GenerationError("AI service is temporarily unavailable. Please try again in a moment.", 502);
}
