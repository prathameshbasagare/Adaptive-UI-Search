import { describe, it, expect } from "vitest";
import { validateResponse, repairComponents } from "../validate";
import { parseComponent, COMPONENT_TYPES, COMPONENT_REGISTRY } from "../schemas";

describe("parseComponent", () => {
  it("rejects components missing required fields (would have crashed render)", () => {
    expect(parseComponent({ type: "map_highlight", highlights: [{ value: "x" }] })).toBeNull();
    expect(parseComponent({ type: "table", tableHeaders: ["a"] })).toBeNull();
    expect(parseComponent({ type: "rating_grid", criteria: ["a"], gridItems: [{ item: "x" }] })).toBeNull();
    expect(parseComponent({ type: "flow_diagram", nodes: [] })).toBeNull();
    expect(parseComponent({ type: "nope" })).toBeNull();
  });

  it("drops bad items but keeps the component", () => {
    const c = parseComponent({ type: "table", tableHeaders: ["a"], tableRows: [["1"], "oops", [2]] });
    expect(c).toMatchObject({ tableRows: [["1"], ["2"]] });
  });

  it("coerces numeric strings and clamps ranges", () => {
    const c = parseComponent({ type: "progress", items: [{ label: "x", value: "150%" }] });
    expect(c).toMatchObject({ items: [{ label: "x", value: 100 }] });
  });

  it("drops quiz questions whose answer index is out of range", () => {
    const c = parseComponent({
      type: "quiz",
      questions: [
        { question: "a", options: ["1", "2"], correct: 5 },
        { question: "b", options: ["1", "2"], correct: 1 },
      ],
    });
    expect(c).toMatchObject({ questions: [{ question: "b" }] });
  });

  it("every registry example parses (prompt and schema agree)", () => {
    for (const t of COMPONENT_TYPES) {
      const example = COMPONENT_REGISTRY[t].example.split("  OR  ")[0].replace(/\s*\(.*\)\s*$/, "");
      const obj = JSON.parse(example.replace(/"<[^"]*>"/g, '"x"').replace(/"\w+\|[\w|]+"/g, (m) => `"${m.slice(1).split("|")[0]}"`));
      expect(parseComponent(obj), t).not.toBeNull();
    }
  });
});

describe("validateResponse", () => {
  it("keeps valid components, drops invalid ones, strips _thought", () => {
    const r = validateResponse({
      _thought: "secret",
      tabTitle: "T",
      layoutStyle: "weird",
      components: [{ type: "text", content: "hi" }, { type: "table" }],
    });
    expect(r).toEqual({ tabTitle: "T", summary: undefined, layoutStyle: "bento", components: [{ type: "text", content: "hi" }] });
  });

  it("returns null when nothing renderable is left", () => {
    expect(validateResponse({ tabTitle: "T", components: [{ type: "table" }] })).toBeNull();
    expect(validateResponse(null)).toBeNull();
  });
});

describe("repairComponents", () => {
  it("regroups orphan items into envelopes", () => {
    const out = repairComponents([
      { title: "a", body: "b" },
      { title: "c", body: "d" },
      { label: "Users", value: 3 },
      { title: "s", description: "d" },
      { title: "e", description: "d", year: "2020" },
    ]);
    expect(out.map((c) => (c as { type: string }).type)).toEqual(["cards", "stat_cards", "steps", "timeline"]);
  });
});
