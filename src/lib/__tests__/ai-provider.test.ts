import { describe, it, expect, beforeEach, vi } from "vitest";
import { buildAttemptPlan } from "../ai-provider";

beforeEach(() => {
  vi.unstubAllEnvs();
  for (const k of ["BASE_URL", "AI_BASE_URL", "API_KEY", "CUSTOM_API_KEY", "GEMINI_API_KEY", "OPENROUTER_API_KEY", "AI_MAX_ATTEMPTS", "AI_MODELS_PER_PROVIDER"]) {
    vi.stubEnv(k, "");
  }
});

describe("buildAttemptPlan", () => {
  it("falls back to Gemini/OpenRouter even when a custom endpoint is configured", () => {
    vi.stubEnv("BASE_URL", "https://x/v1");
    vi.stubEnv("API_KEY", "k");
    vi.stubEnv("GEMINI_API_KEY", "g");
    vi.stubEnv("OPENROUTER_API_KEY", "o");
    const providers = buildAttemptPlan().map((m) => m.provider);
    expect(providers).toEqual(["custom", "custom", "openrouter", "openrouter", "gemini"]);
  });

  it("only uses configured providers", () => {
    vi.stubEnv("GEMINI_API_KEY", "g");
    expect(new Set(buildAttemptPlan().map((m) => m.provider))).toEqual(new Set(["gemini"]));
  });

  it("is empty with no keys", () => {
    expect(buildAttemptPlan()).toEqual([]);
  });
});
