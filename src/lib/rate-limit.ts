// File: ./src/lib/rate-limit.ts
//
// Fixed-window in-memory rate limiter keyed by client IP.
// NOTE: state lives in this server instance only. On serverless / multi-
// instance deployments, swap this for a shared store (Upstash Redis, Vercel
// KV, …) — the call sites only depend on `checkRateLimit`.

import type { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

export interface RateLimitResult {
  ok: boolean;
  retryAfterSec: number;
}

/**
 * Best-effort client IP. Prefers `x-real-ip` (set authoritatively by Vercel,
 * nginx, etc.), then the RIGHTMOST `x-forwarded-for` entry — the one appended
 * by the nearest proxy. The leftmost entries are client-controlled and would
 * let anyone dodge the limit by sending a random header.
 * Without any reverse proxy in front, both headers are client-supplied:
 * deploy behind a proxy (or swap in a platform-provided IP) for real limits.
 */
export function clientKey(req: NextRequest, scope: string): string {
  const real = req.headers.get("x-real-ip")?.trim();
  const hops = req.headers.get("x-forwarded-for")?.split(",").map((s) => s.trim()).filter(Boolean);
  const ip = real || hops?.at(-1) || "local";
  return `${scope}:${ip}`;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // Opportunistic cleanup so the map cannot grow without bound.
  if (now - lastSweep > windowMs) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    lastSweep = now;
  }

  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count++;
  return { ok: true, retryAfterSec: 0 };
}

export function envInt(name: string, fallback: number): number {
  const v = parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}
