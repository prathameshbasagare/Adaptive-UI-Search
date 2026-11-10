// File: ./src/components/adaptive/FlowDiagram.tsx

"use client";

import { useId, useMemo } from "react";
import type { FlowNode, FlowEdge } from "@/lib/types";
import { layoutFlow, LINE_HEIGHT, type LaidOutNode } from "@/lib/flow-layout";

interface FlowDiagramProps {
  flowTitle?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

function NodeLabel({ node }: { node: LaidOutNode }) {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2;
  const top = cy - ((node.lines.length - 1) * LINE_HEIGHT) / 2;
  return (
    <text textAnchor="middle" fill="#e2e8f0" fontSize="11" fontFamily="system-ui, sans-serif">
      <title>{node.label}</title>
      {node.lines.map((line, i) => (
        <tspan key={i} x={cx} y={top + i * LINE_HEIGHT} dominantBaseline="middle">
          {line}
        </tspan>
      ))}
    </text>
  );
}

function NodeShape({ node }: { node: LaidOutNode }) {
  const { x, y, w, h } = node;
  let shape: React.ReactNode;
  if (node.shape === "diamond") {
    const mx = x + w / 2;
    const my = y + h / 2;
    shape = (
      <polygon
        points={`${mx},${y} ${x + w},${my} ${mx},${y + h} ${x},${my}`}
        fill="var(--theme-500-10)"
        stroke="var(--theme-500-60)"
        strokeWidth="1.5"
      />
    );
  } else if (node.shape === "circle") {
    // Terminal node: rendered as a stadium so any label length fits.
    shape = (
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="var(--theme-500-20)" stroke="var(--theme-500)" strokeWidth="1.5" />
    );
  } else {
    shape = <rect x={x} y={y} width={w} height={h} rx="8" fill="var(--theme-500-10)" stroke="var(--theme-500-40)" strokeWidth="1.5" />;
  }
  return (
    <g>
      {shape}
      <NodeLabel node={node} />
    </g>
  );
}

export default function FlowDiagram({ flowTitle, nodes, edges }: FlowDiagramProps) {
  // useId may contain characters that are awkward inside url(#…); keep it alphanumeric.
  const markerId = `arrow-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const layout = useMemo(() => layoutFlow(nodes, edges), [nodes, edges]);

  if (!layout.nodes.length) return null;

  return (
    <figure className="bg-slate-900/60 border border-slate-700 rounded-xl overflow-hidden">
      {flowTitle && (
        <figcaption
          className="px-5 py-3 border-b border-slate-700 font-semibold text-white text-sm"
          style={{ background: "linear-gradient(to right, var(--theme-500-10), transparent)" }}
        >
          {flowTitle}
        </figcaption>
      )}
      <div className="overflow-x-auto p-4">
        <svg
          role="img"
          aria-label={flowTitle ?? "Flow diagram"}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          width={layout.width}
          className="block mx-auto h-auto max-w-full"
          style={{ minWidth: Math.min(layout.width, 320) }}
        >
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--theme-500-60)" />
            </marker>
          </defs>

          {layout.edges.map((e) => (
            <path
              key={e.key}
              d={e.path}
              fill="none"
              stroke="var(--theme-500-60)"
              strokeWidth="1.5"
              strokeDasharray={e.back ? "4 3" : undefined}
              markerEnd={`url(#${markerId})`}
            />
          ))}

          {layout.nodes.map((node) => (
            <NodeShape key={node.id} node={node} />
          ))}

          {/* Edge labels last so they sit above lines and nodes. */}
          {layout.edges
            .filter((e) => e.label)
            .map((e) => {
              const w = Math.min(120, (e.label as string).length * 6 + 10);
              return (
                <g key={`l-${e.key}`}>
                  <rect x={e.labelX - w / 2} y={e.labelY - 8} width={w} height={16} rx="4" fill="#0f172a" stroke="#334155" />
                  <text x={e.labelX} y={e.labelY} dominantBaseline="middle" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="system-ui, sans-serif">
                    {e.label}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>
    </figure>
  );
}
