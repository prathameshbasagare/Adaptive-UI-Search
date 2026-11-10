import { describe, it, expect } from "vitest";
import { ComponentStreamScanner, extractJSON } from "../json-stream";

const doc = JSON.stringify({
  _thought: "x { not a brace } [",
  tabTitle: "Hello",
  layoutStyle: "docs",
  summary: "S",
  components: [
    { type: "text", content: "has } and ] and \"quotes\"" },
    { type: "code", code: "```js\nconst a = {b: [1]};\n```" },
  ],
});

describe("ComponentStreamScanner", () => {
  it("emits each component and meta field as it completes, chunk by chunk", () => {
    const s = new ComponentStreamScanner();
    const comps: string[] = [];
    const meta: Record<string, string> = {};
    for (let i = 0; i < doc.length; i += 7) {
      const r = s.feed(doc.slice(i, i + 7));
      comps.push(...r.components);
      Object.assign(meta, r.meta);
    }
    expect(comps.map((c) => JSON.parse(c).type)).toEqual(["text", "code"]);
    expect(meta).toEqual({ tabTitle: "Hello", layoutStyle: "docs", summary: "S" });
  });

  it("ignores reasoning blocks and leading prose", () => {
    const s = new ComponentStreamScanner();
    const r = s.feed(`<think>{"components":[{"type":"bogus"}]}</think>Sure! ${doc}`);
    expect(r.components).toHaveLength(2);
  });

  it("does not treat nested 'components' keys as the top-level array", () => {
    const s = new ComponentStreamScanner();
    const r = s.feed(JSON.stringify({ x: { components: [{ a: 1 }] }, components: [{ type: "text", content: "y" }] }));
    expect(r.components).toEqual(['{"type":"text","content":"y"}']);
  });
});

describe("extractJSON", () => {
  it("returns raw JSON untouched even when a string value contains a fence", () => {
    expect(JSON.parse(extractJSON(doc)).components).toHaveLength(2);
  });
  it("unwraps a fenced answer", () => {
    expect(JSON.parse(extractJSON("```json\n" + doc + "\n```")).tabTitle).toBe("Hello");
  });
  it("strips think blocks and surrounding prose", () => {
    expect(JSON.parse(extractJSON(`<think>hmm {}</think>Here you go: ${doc} Enjoy!`)).tabTitle).toBe("Hello");
  });
});
