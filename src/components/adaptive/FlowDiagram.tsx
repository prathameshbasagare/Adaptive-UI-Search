// File: ./src/components/adaptive/FlowDiagram.tsx

"use client";

import type { FlowNode, FlowEdge } from "@/lib/types";
import { useThemeStore } from "@/hooks/useThemeStore";

interface FlowDiagramProps {
  flowTitle?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

const NODE_W = 120;
const NODE_H = 44;
const DIAMOND_H = 52;

function getCenter(node: FlowNode): [number, number] {
  const h = node.shape === "diamond" ? DIAMOND_H : NODE_H;
  return [node.x + NODE_W / 2, node.y + h / 2];
}

function NodeShape({ node, mode }: { node: FlowNode, mode: "light" | "dark" }) {
  const cx = node.x;
  const cy = node.y;

  if (node.shape === "diamond") {
    const hw = NODE_W / 2;
    const hh = DIAMOND_H / 2;
    const mx = cx + hw;
    const my = cy + hh;
    return (
      <>
        <polygon
          points={`${mx},${cy} ${cx + NODE_W},${my} ${mx},${cy + DIAMOND_H} ${cx},${my}`}
          fill="var(--theme-500-10)"
          stroke="var(--theme-500-60)"
          strokeWidth="1.5"
        />
        <text x={mx} y={my + 4} textAnchor="middle" fill={mode === "light" ? "#0f172a" : "#e2e8f0"} fontSize="11" fontFamily="system-ui">
          {node.label}
        </text>
      </>
    );
  }

  if (node.shape === "circle") {
    const r = NODE_H / 2;
    return (
      <>
        <circle
          cx={cx + NODE_W / 2}
          cy={cy + r}
          r={r}
          fill="var(--theme-500-20)"
          stroke="var(--theme-500)"
          strokeWidth="1.5"
        />
        <text x={cx + NODE_W / 2} y={cy + r + 4} textAnchor="middle" fill={mode === "light" ? "#0f172a" : "#e2e8f0"} fontSize="11" fontFamily="system-ui">
          {node.label}
        </text>
      </>
    );
  }

  // rect (default)
  return (
    <>
      <rect
        x={cx}
        y={cy}
        width={NODE_W}
        height={NODE_H}
        rx="8"
        fill="var(--theme-500-10)"
        stroke="var(--theme-500-40)"
        strokeWidth="1.5"
      />
      <text x={cx + NODE_W / 2} y={cy + NODE_H / 2 + 4} textAnchor="middle" fill={mode === "light" ? "#0f172a" : "#e2e8f0"} fontSize="11" fontFamily="system-ui">
        {node.label}
      </text>
    </>
  );
}

function EdgePath({ edge, nodes }: { edge: FlowEdge; nodes: FlowNode[] }) {
  const fromNode = nodes.find((n) => n.id === edge.from);
  const toNode = nodes.find((n) => n.id === edge.to);
  if (!fromNode || !toNode) return null;

  const [x1, y1] = getCenter(fromNode);
  const [x2, y2] = getCenter(toNode);

  // Simple straight line with mid-point curve
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  return (
    <>
      <path
        d={`M${x1},${y1} Q${mx},${y1} ${x2},${y2}`}
        className="flow-edge"
      />
      {edge.label && (
        <text x={(mx + x1) / 2} y={(y1 + my) / 2 - 6} textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="system-ui">
          {edge.label}
        </text>
      )}
    </>
  );
}

export default function FlowDiagram({ flowTitle, nodes, edges }: FlowDiagramProps) {
  const { mode } = useThemeStore();
  if (!nodes.length) return null;

  const maxX = Math.max(...nodes.map((n) => n.x + NODE_W)) + 20;
  const maxY = Math.max(...nodes.map((n) => n.y + (n.shape === "diamond" ? DIAMOND_H : NODE_H))) + 20;

  return (
    <div className="bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
      {flowTitle && (
        <div
          className="px-5 py-3 border-b border-slate-300 dark:border-slate-700 font-semibold text-slate-950 dark:text-white text-sm"
          style={{ background: "linear-gradient(to right, var(--theme-500-10), transparent)" }}
        >
          {flowTitle}
        </div>
      )}
      <div className="overflow-x-auto p-4">
        <svg
          width={maxX}
          height={maxY}
          viewBox={`0 0 ${maxX} ${maxY}`}
          style={{ maxWidth: "100%", height: "auto" }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--theme-500-60)" />
            </marker>
          </defs>
          {edges.map((edge, i) => (
            <EdgePath key={i} edge={edge} nodes={nodes} />
          ))}
          {nodes.map((node) => (
            <NodeShape key={node.id} node={node} mode={mode} />
          ))}
        </svg>
      </div>
    </div>
  );
}
