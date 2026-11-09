// File: ./src/app/api/images/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "pexels";
import { checkRateLimit, clientKey, envInt } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const rl = checkRateLimit(clientKey(request, "images"), envInt("IMAGES_RATE_LIMIT_PER_MIN", 30), 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many image requests" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim().slice(0, 100);
  const parsedCount = parseInt(searchParams.get("count") ?? "6", 10);
  const count = Math.min(12, Math.max(1, Number.isFinite(parsedCount) ? parsedCount : 6));

  if (!query) {
    return NextResponse.json({ error: "query parameter is required" }, { status: 400 });
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Image search is not configured" }, { status: 503 });
  }

  try {
    const client = createClient(apiKey);
    const response = await Promise.race([
      client.photos.search({ query, per_page: count }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Pexels timeout")), 10_000)),
    ]);

    if ("error" in response) {
      return NextResponse.json({ error: "Image provider error" }, { status: 502 });
    }

    const photos = response.photos.map((photo) => ({
      url: photo.src.large2x,
      // `large`/`medium` are height-capped at 350px (≈230px wide for portraits),
      // which looked blurry in the grid. Ask the CDN for a 640px-wide rendition.
      thumb: `${photo.src.original}?auto=compress&cs=tinysrgb&w=640`,
      width: photo.width,
      height: photo.height,
      alt: photo.alt || query,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
    }));

    return NextResponse.json(
      { photos },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
    );
  } catch (err) {
    console.error("[/api/images]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 502 });
  }
}
