import { describe, it, expect } from "vitest";
import { layoutFlow, wrapLabel } from "../flow-layout";

const checkout = {
  nodes: [
    { id: "start", label: "Start", shape: "circle" as const },
    { id: "cart", label: "Review cart" },
    { id: "auth", label: "Logged in?", shape: "diamond" as const },
    { id: "login", label: "Login / Sign up" },
    { id: "pay", label: "Payment" },
    { id: "done", label: "Order confirmed", shape: "circle" as const },
  ],
  edges: [
    { from: "start", to: "cart" },
    { from: "cart", to: "auth" },
    { from: "auth", to: "pay", label: "yes" },
    { from: "auth", to: "login", label: "no" },
    { from: "login", to: "pay" },
    { from: "pay", to: "done" },
  ],
};

const overlaps = (a: { x: number; y: number; w: number; h: number }, b: typeof a) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

describe("layoutFlow", () => {
  it("produces finite, non-overlapping node boxes", () => {
    const l = layoutFlow(checkout.nodes, checkout.edges);
    expect(l.nodes).toHaveLength(6);
    for (const n of l.nodes) for (const k of ["x", "y", "w", "h"] as const) expect(Number.isFinite(n[k])).toBe(true);
    for (let i = 0; i < l.nodes.length; i++)
      for (let j = i + 1; j < l.nodes.length; j++) expect(overlaps(l.nodes[i], l.nodes[j])).toBe(false);
  });

  it("routes a skip-level edge around the intermediate node", () => {
    const l = layoutFlow(checkout.nodes, checkout.edges);
    const login = l.nodes.find((n) => n.id === "login")!;
    const auth = l.nodes.find((n) => n.id === "auth")!;
    // The skip edge auth→pay gets a dummy vertex beside "login", so login is
    // not centred directly under auth's exit point.
    expect(login.x + login.w / 2).not.toBeCloseTo(auth.x + auth.w / 2, 0);
    expect(l.edges.every((e) => !/NaN|undefined/.test(e.path))).toBe(true);
  });

  it("handles cycles, self loops, unknown ids and duplicates", () => {
    const l = layoutFlow(
      [{ id: "a", label: "A" }, { id: "b", label: "B" }, { id: "a", label: "dup" }],
      [{ from: "a", to: "b" }, { from: "b", to: "a" }, { from: "a", to: "a" }, { from: "a", to: "zzz" }]
    );
    expect(l.nodes.map((n) => n.id)).toEqual(["a", "b"]);
    expect(l.edges).toHaveLength(2);
    expect(l.edges.filter((e) => e.back)).toHaveLength(1);
  });

  it("wraps long labels", () => {
    expect(wrapLabel("A very long node label that should definitely wrap onto lines").length).toBeGreaterThan(1);
  });
});
