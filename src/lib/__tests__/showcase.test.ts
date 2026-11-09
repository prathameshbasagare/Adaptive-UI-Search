import { describe, it, expect } from "vitest";
import { parseTickerValue, parseComponent } from "../schemas";

describe("parseTickerValue", () => {
  it.each([
    ["$4.2B", { prefix: "$", value: 4.2, suffix: "B", decimals: 1 }],
    ["98%", { prefix: "", value: 98, suffix: "%", decimals: 0 }],
    ["1,200+", { prefix: "", value: 1200, suffix: "+", decimals: 0 }],
    ["€ 3.75 M", { prefix: "€", value: 3.75, suffix: "M", decimals: 2 }],
    [37, { prefix: "", value: 37, suffix: "", decimals: 0 }],
    [-12.5, { prefix: "", value: -12.5, suffix: "", decimals: 1 }],
  ])("%s", (input, expected) => {
    expect(parseTickerValue(input)).toEqual(expected);
  });

  it("rejects non-numeric values", () => {
    expect(parseTickerValue("lots")).toBeNull();
    expect(parseTickerValue(null)).toBeNull();
  });
});

describe("showcase components", () => {
  it("number_ticker drops non-numeric items and keeps explicit suffix", () => {
    const c = parseComponent({
      type: "number_ticker",
      items: [{ value: "lots", label: "x" }, { value: 99.9, suffix: "%", label: "Uptime", percent: 140 }],
    });
    expect(c).toMatchObject({ items: [{ value: 99.9, suffix: "%", percent: 100, decimals: 1 }] });
  });

  it("requires enough items for the interaction to make sense", () => {
    expect(parseComponent({ type: "scroll_story", chapters: [{ title: "a", body: "b" }] })).toBeNull();
    expect(parseComponent({ type: "horizontal_scroll", panels: [{ title: "a", body: "b" }, { title: "c", body: "d" }] })).toBeNull();
    expect(parseComponent({ type: "marquee", items: [{ label: "a" }] })).toBeNull();
  });

  it("marquee speed falls back to normal", () => {
    const c = parseComponent({ type: "marquee", speed: "warp", items: ["a", "b", "c", "d"].map((label) => ({ label })) });
    expect(c).toMatchObject({ speed: "normal" });
  });
});
