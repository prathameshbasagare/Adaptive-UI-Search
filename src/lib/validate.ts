// File: ./src/lib/validate.ts

import {
  LAYOUT_STYLES,
  isComponentType,
  parseComponent,
  type AdaptiveUIResponse,
  type ComponentDef,
  type LayoutStyle,
} from "./schemas";

type Raw = Record<string, unknown>;

/*
 * Repairs common structural mistakes small models make: component *items*
 * placed directly in the `components` array are grouped back into their
 * correct envelope (cards / timeline / steps / stat_cards / text).
 */
export function repairComponents(components: unknown[]): unknown[] {
  const repaired: unknown[] = [];
  let current: { type: string; key: string; items: Raw[] } | null = null;

  const flush = () => {
    if (current && current.items.length) repaired.push({ type: current.type, [current.key]: current.items });
    current = null;
  };
  const push = (type: string, key: string, item: Raw) => {
    if (!current || current.type !== type) {
      flush();
      current = { type, key, items: [] };
    }
    current.items.push(item);
  };

  for (const c of components) {
    if (!c || typeof c !== "object" || Array.isArray(c)) continue;
    const comp = c as Raw;

    if (isComponentType(comp.type)) {
      flush();
      repaired.push(comp);
    } else if (typeof comp.title === "string" && typeof comp.body === "string") {
      push("cards", "cards", comp);
    } else if (typeof comp.title === "string" && typeof comp.description === "string") {
      if ("year" in comp) push("timeline", "events", comp);
      else push("steps", "steps", comp);
    } else if (typeof comp.label === "string" && (typeof comp.value === "string" || typeof comp.value === "number")) {
      push("stat_cards", "stats", comp);
    } else if (typeof comp.content === "string") {
      flush();
      repaired.push({ type: "text", content: comp.content });
    }
  }
  flush();
  return repaired;
}

export function normalizeLayout(v: unknown): LayoutStyle {
  return (LAYOUT_STYLES as readonly string[]).includes(v as string) ? (v as LayoutStyle) : "bento";
}

/**
 * Validates a full model response. Individual invalid components are
 * dropped (so one bad block never breaks the page); the response is only
 * rejected when nothing renderable is left.
 */
export function validateResponse(data: unknown): AdaptiveUIResponse | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const d = data as Raw;
  if (!Array.isArray(d.components)) return null;

  const components = repairComponents(d.components)
    .map(parseComponent)
    .filter((c): c is ComponentDef => c !== null);
  if (components.length === 0) return null;

  const title = typeof d.tabTitle === "string" && d.tabTitle.trim() ? d.tabTitle.trim() : "Results";

  return {
    tabTitle: title.slice(0, 60),
    summary: typeof d.summary === "string" && d.summary.trim() ? d.summary.trim() : undefined,
    layoutStyle: normalizeLayout(d.layoutStyle),
    components,
    // `_thought` and any other unknown keys are intentionally dropped here.
  };
}
