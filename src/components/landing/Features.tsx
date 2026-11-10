// File: ./src/components/landing/Features.tsx

"use client";

import {
  LayoutGrid,
  Brain,
  BarChart3,
  Code2,
  Layers,
  Zap,
  Sparkles,
  TrendingUp,
  FileText,
  Columns,
  Cpu,
} from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-28 px-6 bg-slate-950 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold mb-4">
            <LayoutGrid size={13} />
            <span>Next-Gen UI Generation</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Adaptive Bento Grid Architecture
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Not just plain markdown. Our AI orchestrates asymmetrical Bento Grids, executive analytics
            dashboards, and technical specs tailored in real time.
          </p>
        </div>

        {/* Bento Grid Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Tile 1: Hero Bento Tile (2 cols, 2 rows on desktop) */}
          <div className="md:col-span-2 md:row-span-2 relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800/90 bg-slate-900/50 p-8 backdrop-blur-xl group hover:border-slate-700 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-transparent" />
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-600/15 blur-3xl transition-opacity group-hover:opacity-100" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Brain size={20} />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-mono tracking-wider text-violet-400 font-semibold">
                      Layout Engine
                    </span>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Query-Driven Layout Selection
                    </h3>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Adaptive
                </span>
              </div>

              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                The engine evaluates user intent before rendering. Whether your query is a high-level
                product overview, a numerical benchmark, or a multi-lingual code tutorial, it formats
                components into the optimal layout archetype automatically.
              </p>

              {/* Layout Archetype Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                {[
                  { label: "Bento Grid", icon: <LayoutGrid size={13} />, desc: "Asymmetric Showcase" },
                  { label: "Dashboard", icon: <BarChart3 size={13} />, desc: "Metrics & Charts" },
                  { label: "Docs View", icon: <FileText size={13} />, desc: "Technical Specs" },
                  { label: "Split Battle", icon: <Columns size={13} />, desc: "Head-to-head" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-1.5 text-violet-400 mb-1">
                      {item.icon}
                      <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Canvas Micro-Mockup */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Sparkles size={12} className="text-violet-400" />
                  AdaptiveUI Orchestrator
                </span>
                <span>layoutStyle: &quot;bento&quot;</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 space-y-1">
                  <div className="h-2 w-20 bg-violet-400/30 rounded" />
                  <div className="h-1.5 w-full bg-slate-800 rounded" />
                  <div className="h-1.5 w-4/5 bg-slate-800 rounded" />
                </div>
                <div className="col-span-1 bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between">
                  <div className="text-sm font-bold text-white">99.4%</div>
                  <div className="h-1 w-12 bg-emerald-400/40 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Tile 2: 25+ Components (1 col) */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-slate-800/90 bg-slate-900/50 p-6 backdrop-blur-xl group hover:border-slate-700 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-transparent" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Cpu size={20} />
                </div>
                <span className="text-xs font-mono font-bold text-blue-400">RICH UI</span>
              </div>
              <div className="text-4xl font-extrabold text-white mb-1 tracking-tight">25+</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Dynamic Component Types
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Cards, Chart.js graphs, syntax code blocks, timelines, terminal emulators, flashcards,
                quizzes, color palettes, and voting polls.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-800/80">
              {["bento", "chart", "code", "table", "quiz", "flow"].map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 border border-slate-700 text-slate-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Tile 3: Interactive Visualizations (1 col) */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-slate-800/90 bg-slate-900/50 p-6 backdrop-blur-xl group hover:border-slate-700 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-r from-amber-500 to-transparent" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <BarChart3 size={20} />
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                  <TrendingUp size={12} /> Live
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Interactive Charts</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Bar, line, pie, and doughnut charts rendered with Chart.js using real datasets
                synthesized from your question.
              </p>
            </div>

            {/* Mini Chart Mockup */}
            <div className="h-16 flex items-end gap-2 px-2 pt-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <div className="w-full bg-amber-500/30 rounded-t h-[40%]" />
              <div className="w-full bg-amber-500/50 rounded-t h-[70%]" />
              <div className="w-full bg-amber-500/80 rounded-t h-[95%]" />
              <div className="w-full bg-amber-500/60 rounded-t h-[60%]" />
              <div className="w-full bg-amber-500/40 rounded-t h-[45%]" />
            </div>
          </div>

          {/* Tile 4: Code & Syntax Engine (2 cols) */}
          <div className="md:col-span-2 relative flex flex-col justify-between rounded-3xl border border-slate-800/90 bg-slate-900/50 p-6 backdrop-blur-xl group hover:border-slate-700 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-transparent" />
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Code2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Syntax-Highlighted Code</h3>
                  <span className="text-xs text-slate-400">
                    Multi-file snippet tabs with copy-ready formatting
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-pink-500/10 text-pink-300 border border-pink-500/30">
                100+ Languages
              </span>
            </div>

            {/* Code Snippet Preview */}
            <div className="font-mono text-xs rounded-xl bg-slate-950/90 border border-slate-800/80 p-3.5 text-slate-300 overflow-x-auto">
              <div className="text-slate-500 mb-1">{"// Real-time adaptive UI schema"}</div>
              <div>
                <span className="text-violet-400">const</span>{" "}
                <span className="text-blue-300">canvas</span> ={" "}
                <span className="text-pink-400">await</span>{" "}
                <span className="text-emerald-400">generateAdaptiveUI</span>(query, &#123;{" "}
                <span className="text-amber-300">layout</span>:{" "}
                <span className="text-green-300">&quot;bento&quot;</span> &#125;);
              </div>
            </div>
          </div>

          {/* Tile 5: Multi-Tab & Instant Latency (1 col) */}
          <div className="relative flex flex-col justify-between rounded-3xl border border-slate-800/90 bg-slate-900/50 p-6 backdrop-blur-xl group hover:border-slate-700 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-transparent" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Zap size={20} />
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Layers size={20} />
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-1">Persistent Tabbed History</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Every search creates an isolated tab stored directly in local storage. Switch layouts,
                revisit previous responses, or compare answers without context loss.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
              <span>Layout Switching</span>
              <span className="font-semibold text-cyan-400">Instant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
