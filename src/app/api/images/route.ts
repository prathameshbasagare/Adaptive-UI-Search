// File: ./src/app/api/images/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "pexels";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();
  const count = Math.min(12, Math.max(1, parseInt(searchParams.get("count") ?? "6", 10)));

  if (!query) {
    return NextResponse.json({ error: "query parameter is required" }, { status: 400 });
  }

  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "PEXELS_API_KEY is not configured" }, { status: 503 });
  }

  try {
    const client = createClient(apiKey);
    const response = await client.photos.search({ query, per_page: count });

    if ("error" in response) {
      return NextResponse.json({ error: "Pexels API error" }, { status: 502 });
    }

    const photos = response.photos.map((photo) => ({
      url: photo.src.large,
      thumb: photo.src.medium,
      alt: photo.alt || query,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
    }));

    return NextResponse.json({ photos });
  } catch (err) {
    console.error("[/api/images]", err);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}
