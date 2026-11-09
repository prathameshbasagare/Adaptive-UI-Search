// File: ./src/lib/flow-layout.ts
//
// Small layered (Sugiyama-style) graph layout for flow_diagram components.
// The model only supplies nodes + edges, so we compute everything here:
//   1. break cycles (DFS back edges) and rank nodes by longest path
//   2. insert dummy nodes so edges spanning several ranks route around nodes
//   3. order nodes within each rank by parent barycenter (fewer crossings)
//   4. size nodes from their (wrapped) labels and assign coordinates
//   5. build edge paths that start/end on node borders, not centres

export type FlowShape = "rect" | "diamond" | "circle";

export interface FlowInputNode {
  id: string;
  label: string;
  shape?: FlowShape;
}
export interface FlowInputEdge {
  from: string;
  to: string;
  label?: string;
}

export interface LaidOutNode {
  id: string;
  label: string;
  lines: string[];
  shape: FlowShape;
  /** Top-left corner and size of the node's bounding box. */
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface LaidOutEdge {
  key: string;
  path: string;
  label?: string;
  labelX: number;
  labelY: number;
  back: boolean;
}
export interface FlowLayout {
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  width: number;
  height: number;
}

const PAD = 24;
const RANK_GAP = 64;
const NODE_GAP = 36;
const DUMMY_W = 16;
const LINE_H = 14;
export const LINE_HEIGHT = LINE_H;
const CHAR_W = 6.6;
const MAX_CHARS = 22;
const MAX_LINES = 3;

export function wrapLabel(label: string, max = MAX_CHARS): string[] {
  const words = label.trim().split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const word = w.length > max ? `${w.slice(0, max - 1)}…` : w;
    if (!cur) cur = word;
    else if ((cur + " " + word).length <= max) cur += " " + word;
    else {
      lines.push(cur);
      cur = word;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > MAX_LINES) {
    const kept = lines.slice(0, MAX_LINES);
    kept[MAX_LINES - 1] = `${kept[MAX_LINES - 1].slice(0, max - 1)}…`;
    return kept;
  }
  return lines.length ? lines : [""];
}

function sizeFor(shape: FlowShape, lines: string[]): { w: number; h: number } {
  const longest = Math.max(...lines.map((l) => l.length), 4);
  const w = Math.min(200, Math.max(96, Math.round(longest * CHAR_W + 32)));
  const h = 20 + lines.length * LINE_H;
  if (shape === "diamond") return { w: w + 48, h: h + 28 };
  return { w, h };
}

interface Vertex {
  id: string;
  rank: number;
  order: number;
  w: number;
  h: number;
  x: number;
  y: number;
  dummy: boolean;
}

export function layoutFlow(inputNodes: FlowInputNode[], inputEdges: FlowInputEdge[]): FlowLayout {
  // De-duplicate nodes, keep first occurrence.
  const seen = new Set<string>();
  const nodes = inputNodes.filter((n) => (seen.has(n.id) ? false : (seen.add(n.id), true)));
  if (nodes.length === 0) return { nodes: [], edges: [], width: 0, height: 0 };
  const edges = inputEdges.filter((e) => seen.has(e.from) && seen.has(e.to) && e.from !== e.to);

  const out = new Map<string, string[]>(nodes.map((n) => [n.id, []]));
  for (const e of edges) out.get(e.from)!.push(e.to);

  // 1. Cycle breaking: DFS from roots (then any unvisited node); edges into
  //    a node on the current stack are back edges and are ignored for ranking.
  const indeg = new Map(nodes.map((n) => [n.id, 0]));
  for (const e of edges) indeg.set(e.to, indeg.get(e.to)! + 1);
  const state = new Map<string, 0 | 1 | 2>(); // 0 unvisited, 1 on stack, 2 done
  const backEdges = new Set<string>();
  const ek = (e: FlowInputEdge) => `${e.from}\u0000${e.to}`;
  const dfs = (id: string) => {
    state.set(id, 1);
    for (const to of out.get(id)!) {
      const s = state.get(to) ?? 0;
      if (s === 1) backEdges.add(`${id}\u0000${to}`);
      else if (s === 0) dfs(to);
    }
    state.set(id, 2);
  };
  const roots = nodes.filter((n) => indeg.get(n.id) === 0);
  for (const n of roots.length ? roots : [nodes[0]]) if (!state.get(n.id)) dfs(n.id);
  for (const n of nodes) if (!state.get(n.id)) dfs(n.id);

  const dagEdges = edges.filter((e) => !backEdges.has(ek(e)));

  // Longest-path ranking over the DAG (Kahn's algorithm).
  const rank = new Map(nodes.map((n) => [n.id, 0]));
  const dagIn = new Map(nodes.map((n) => [n.id, 0]));
  for (const e of dagEdges) dagIn.set(e.to, dagIn.get(e.to)! + 1);
  const queue = nodes.filter((n) => dagIn.get(n.id) === 0).map((n) => n.id);
  while (queue.length) {
    const id = queue.shift()!;
    for (const e of dagEdges) {
      if (e.from !== id) continue;
      rank.set(e.to, Math.max(rank.get(e.to)!, rank.get(id)! + 1));
      dagIn.set(e.to, dagIn.get(e.to)! - 1);
      if (dagIn.get(e.to) === 0) queue.push(e.to);
    }
  }

  // 2. Vertices (+ dummies for long forward edges).
  const meta = new Map(nodes.map((n) => {
    const shape: FlowShape = n.shape ?? "rect";
    const lines = wrapLabel(n.label);
    return [n.id, { shape, lines, label: n.label, ...sizeFor(shape, lines) }];
  }));
  const vertices = new Map<string, Vertex>();
  for (const n of nodes) {
    const m = meta.get(n.id)!;
    vertices.set(n.id, { id: n.id, rank: rank.get(n.id)!, order: 0, w: m.w, h: m.h, x: 0, y: 0, dummy: false });
  }

  interface Chain {
    edge: FlowInputEdge;
    ids: string[];
    back: boolean;
  }
  const chains: Chain[] = edges.map((e, i) => {
    const back = backEdges.has(ek(e));
    const r1 = rank.get(e.from)!;
    const r2 = rank.get(e.to)!;
    const ids = [e.from];
    if (!back && r2 - r1 > 1) {
      for (let r = r1 + 1; r < r2; r++) {
        const id = `__d${i}_${r}`;
        vertices.set(id, { id, rank: r, order: 0, w: DUMMY_W, h: 0, x: 0, y: 0, dummy: true });
        ids.push(id);
      }
    }
    ids.push(e.to);
    return { edge: e, ids, back };
  });

  // 3. Ordering within ranks: input order, then barycenter sweeps.
  const maxRank = Math.max(...[...vertices.values()].map((v) => v.rank));
  const layers: Vertex[][] = Array.from({ length: maxRank + 1 }, () => []);
  for (const v of vertices.values()) layers[v.rank].push(v);
  layers.forEach((l) => l.forEach((v, i) => (v.order = i)));

  const parents = new Map<string, string[]>();
  const children = new Map<string, string[]>();
  for (const c of chains) {
    if (c.back) continue;
    for (let i = 0; i < c.ids.length - 1; i++) {
      const a = c.ids[i];
      const b = c.ids[i + 1];
      (parents.get(b) ?? parents.set(b, []).get(b)!).push(a);
      (children.get(a) ?? children.set(a, []).get(a)!).push(b);
    }
  }
  const bary = (v: Vertex, rel: Map<string, string[]>) => {
    const ns = rel.get(v.id);
    if (!ns?.length) return v.order;
    return ns.reduce((s, id) => s + vertices.get(id)!.order, 0) / ns.length;
  };
  for (let pass = 0; pass < 4; pass++) {
    const down = pass % 2 === 0;
    const range = down ? layers.slice(1) : layers.slice(0, -1).reverse();
    for (const layer of range) {
      const scored = layer.map((v) => ({ v, b: bary(v, down ? parents : children) }));
      scored.sort((a, b) => a.b - b.b || a.v.order - b.v.order);
      scored.forEach((s, i) => (s.v.order = i));
      layer.sort((a, b) => a.order - b.order);
    }
  }

  // 4. Coordinates: each rank centred horizontally; rank height = tallest node.
  const rowWidth = (l: Vertex[]) => l.reduce((s, v) => s + v.w, 0) + NODE_GAP * Math.max(0, l.length - 1);
  const contentW = Math.max(...layers.map(rowWidth));
  let y = PAD;
  for (const layer of layers) {
    const rowH = Math.max(0, ...layer.map((v) => v.h));
    let x = PAD + (contentW - rowWidth(layer)) / 2;
    for (const v of layer) {
      v.x = x;
      v.y = y + (rowH - v.h) / 2;
      x += v.w + NODE_GAP;
    }
    y += rowH + RANK_GAP;
  }
  const hasBack = chains.some((c) => c.back);
  const width = contentW + PAD * 2 + (hasBack ? 48 : 0);
  const height = y - RANK_GAP + PAD;

  // 5. Edge paths.
  const cx = (v: Vertex) => v.x + v.w / 2;
  const laidEdges: LaidOutEdge[] = chains.map((c, i) => {
    const from = vertices.get(c.ids[0])!;
    const to = vertices.get(c.ids[c.ids.length - 1])!;
    const key = `${ek(c.edge)}-${i}`;

    if (c.back || from.rank === to.rank) {
      // Route along the right-hand side, entering the target from the right.
      const sx = from.x + from.w;
      const sy = from.y + from.h / 2;
      const tx = to.x + to.w;
      const ty = to.y + to.h / 2;
      const bulge = Math.max(sx, tx) + 40;
      return {
        key,
        back: true,
        path: `M${sx},${sy} C${bulge},${sy} ${bulge},${ty} ${tx + 2},${ty}`,
        label: c.edge.label,
        labelX: bulge - 8,
        labelY: (sy + ty) / 2,
      };
    }

    const pts = c.ids.map((id, idx) => {
      const v = vertices.get(id)!;
      if (v.dummy) return { x: cx(v), y1: v.y, y2: v.y };
      return idx === 0 ? { x: cx(v), y1: v.y + v.h, y2: v.y + v.h } : { x: cx(v), y1: v.y - 2, y2: v.y - 2 };
    });
    let d = `M${pts[0].x},${pts[0].y2}`;
    for (let k = 1; k < pts.length; k++) {
      const a = pts[k - 1];
      const b = pts[k];
      const dy = (b.y1 - a.y2) / 2;
      d += ` C${a.x},${a.y2 + dy} ${b.x},${b.y1 - dy} ${b.x},${b.y1}`;
    }
    // Label on the first segment, just below the source.
    const a = pts[0];
    const b = pts[1];
    return {
      key,
      back: false,
      path: d,
      label: c.edge.label,
      labelX: (a.x + b.x) / 2,
      labelY: (a.y2 + b.y1) / 2,
    };
  });

  const laidNodes: LaidOutNode[] = nodes.map((n) => {
    const v = vertices.get(n.id)!;
    const m = meta.get(n.id)!;
    return { id: n.id, label: m.label, lines: m.lines, shape: m.shape, x: v.x, y: v.y, w: v.w, h: v.h };
  });

  return { nodes: laidNodes, edges: laidEdges, width, height };
}
