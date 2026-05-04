// File: ./src/app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { generateAdaptiveUI } from "@/lib/ai-provider";

export interface ChatRequestBody {
  query: string;
  history?: { role: "user" | "model"; parts: { text: string }[] }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();

    if (!body.query || typeof body.query !== "string" || body.query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (body.query.trim().length > 2000) {
      return NextResponse.json(
        { error: "Query must be 2000 characters or fewer" },
        { status: 400 }
      );
    }

    const adaptiveResponse = await generateAdaptiveUI(
      body.query.trim(),
      body.history ?? []
    );

    return NextResponse.json(adaptiveResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";

    if (message.includes("NO_PROVIDER_CONFIGURED")) {
      return NextResponse.json(
        { error: "Server configuration error: No AI provider API key is configured." },
        { status: 500 }
      );
    }

    if (message.includes("All models failed")) {
      return NextResponse.json(
        { error: "AI service is temporarily unavailable. Please try again in a moment." },
        { status: 502 }
      );
    }

    // Extract retry delay from 429 response for a helpful message
    if (message.includes("429") || message.includes("Too Many Requests") || message.includes("quota")) {
      const retryMatch = message.match(/retry[^0-9]*(\d+)/i);
      const retrySeconds = retryMatch ? parseInt(retryMatch[1], 10) : null;
      const retryHint = retrySeconds ? ` Please wait ${retrySeconds}s and try again.` : " Please wait a moment and try again.";
      return NextResponse.json(
        { error: `Rate limit reached.${retryHint}` },
        { status: 429 }
      );
    }

    console.error("[/api/chat] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate response. Please try again." },
      { status: 500 }
    );
  }
}
