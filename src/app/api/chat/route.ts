// File: ./src/app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAdaptiveUIStream, GenerationError } from "@/lib/ai-provider";
import { checkRateLimit, clientKey, envInt } from "@/lib/rate-limit";
import { buildSearchQuery, buildUserPrompt, isWebSearchConfigured, searchWeb, shouldSearch } from "@/lib/web-search";
import type { HistoryTurn, StreamEvent, WebSource } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_QUERY_CHARS = 2_000;
const MAX_HISTORY_TURNS = 12;
const MAX_TURN_CHARS = 12_000;
const MAX_HISTORY_CHARS = 30_000;

const BodySchema = z.object({
  query: z.string().trim().min(1, "Query is required").max(MAX_QUERY_CHARS, `Query must be ${MAX_QUERY_CHARS} characters or fewer`),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string().max(MAX_TURN_CHARS),
      })
    )
    .max(50)
    .optional()
    .default([]),
  webSearch: z.enum(["auto", "on", "off"]).optional().default("auto"),
});

/**
 * Keeps the most recent turns within the char budget, and normalises the
 * sequence so it starts with a user turn and strictly alternates roles
 * (both Gemini and OpenAI-style APIs expect that).
 */
function sanitizeHistory(history: HistoryTurn[]): HistoryTurn[] {
  const recent = history.slice(-MAX_HISTORY_TURNS);
  const kept: HistoryTurn[] = [];
  let total = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    total += recent[i].text.length;
    if (total > MAX_HISTORY_CHARS) break;
    kept.unshift(recent[i]);
  }
  const alternating: HistoryTurn[] = [];
  for (const t of kept) {
    if (alternating.length === 0 && t.role !== "user") continue;
    if (alternating.length && alternating[alternating.length - 1].role === t.role) {
      alternating[alternating.length - 1] = t;
    } else alternating.push(t);
  }
  // History must end with a model turn; the new query is the next user turn.
  if (alternating.length && alternating[alternating.length - 1].role === "user") alternating.pop();
  return alternating;
}

export async function POST(request: NextRequest) {
  const rl = checkRateLimit(clientKey(request, "chat"), envInt("CHAT_RATE_LIMIT_PER_MIN", 10), 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many requests. Please wait ${rl.retryAfterSec}s and try again.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body: z.output<typeof BodySchema>;
  try {
    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "Request body must be JSON" }, { status: 400 });
  }

  const history = sanitizeHistory(body.history);
  const encoder = new TextEncoder();

  // NDJSON stream: one StreamEvent per line.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const emit = (e: StreamEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
        } catch {
          closed = true;
        }
      };
      try {
        // 1. Optional web grounding — best effort: on failure, answer without it.
        let sources: WebSource[] = [];
        const isFollowUp = history.length > 0;
        if (body.webSearch === "on" && !isWebSearchConfigured()) {
          emit({ type: "status", message: "Web search isn't configured on this server — answering from model knowledge…" });
        } else if (shouldSearch(body.webSearch, body.query, isFollowUp)) {
          emit({ type: "status", message: "Searching the web…" });
          try {
            sources = await searchWeb(buildSearchQuery(body.query, history), request.signal);
            if (sources.length) emit({ type: "sources", sources });
          } catch (err) {
            if (request.signal.aborted) throw new GenerationError("Request cancelled", 499);
            console.warn("[/api/chat] web search failed, continuing without it:", (err as Error).message);
            emit({ type: "status", message: "Web search unavailable — answering from model knowledge…" });
          }
        }

        // 2. Generate. The prompt carries today's date and any web results.
        const prompt = buildUserPrompt(body.query, sources);
        const response = await generateAdaptiveUIStream(prompt, history, emit, request.signal);
        if (sources.length) response.sources = sources;
        emit({ type: "done", response });
      } catch (err) {
        if (err instanceof GenerationError) {
          if (err.status !== 499) emit({ type: "error", error: err.message, status: err.status });
        } else {
          console.error("[/api/chat] Unexpected error:", err);
          emit({ type: "error", error: "Failed to generate response. Please try again.", status: 500 });
        }
      } finally {
        if (!closed) {
          closed = true;
          try {
            controller.close();
          } catch {
            /* already closed by client disconnect */
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
