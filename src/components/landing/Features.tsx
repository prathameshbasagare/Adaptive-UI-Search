// File: ./src/components/landing/Features.tsx

import {
  LayoutDashboard,
  Brain,
  BarChart3,
  Code2,
  Layers,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description:
      "Every response is contextually aware and tailored to your exact query — not just text, but fully structured UI powered by advanced AI models.",
    color: "violet",
  },
  {
    icon: LayoutDashboard,
    title: "Adaptive Layout Generation",
    description:
      "The UI evolves with your questions. Ask about data and get charts. Ask about tools and get feature cards. Ask for code and get syntax-highlighted blocks.",
    color: "blue",
  },
  {
    icon: Layers,
    title: "Tabbed History",
    description:
      "Every query opens a new tab in the content area, letting you compare, reference, and revisit previous responses without losing context.",
    color: "emerald",
  },
  {
    icon: BarChart3,
    title: "Live Charts & Visualizations",
    description:
      "When your query involves data, comparisons, or trends, the AI generates interactive bar, line, pie, and doughnut charts automatically.",
    color: "amber",
  },
  {
    icon: Code2,
    title: "Syntax-Highlighted Code",
    description:
      "Code queries return beautifully formatted, copy-ready code blocks with line numbers and syntax highlighting for 100+ languages.",
    color: "pink",
  },
  {
    icon: Zap,
    title: "Instant Response",
    description:
      "Built on Next.js App Router with server-side AI calls — fast, reliable, and ready for production use out of the box.",
    color: "cyan",
  },
];

const colorMap: Record<string, string> = {
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  pink: "bg-pink-500/10 border-pink-500/20 text-pink-400",
  cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
};

export default function Features() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white mb-4">
            Everything your search needs
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Not just answers — intelligent, structured interfaces generated on the fly.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            const colorClass = colorMap[feature.color] ?? colorMap.violet;

            return (
              <div
                key={feature.title}
                className="bg-slate-200/30 dark:bg-slate-800/30 border border-slate-300/60 dark:border-slate-700/60 rounded-2xl p-6 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all duration-200 group"
              >
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${colorClass}`}
                >
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-950 dark:text-white text-base mb-2 group-hover:text-violet-200 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
