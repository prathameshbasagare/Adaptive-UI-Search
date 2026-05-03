// File: ./src/components/landing/Hero.tsx

"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/3 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Badge */}
      <div className="relative flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-medium px-3.5 py-1.5 rounded-full mb-8">
        <Sparkles size={12} />
        Powered by Gemma 3 27B
      </div>

      {/* Headline */}
      <h1 className="relative text-center text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl">
        <span className="text-white">Search that </span>
        <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
          thinks and builds
        </span>
      </h1>

      {/* Subheading */}
      <p className="relative text-center text-slate-400 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10">
        Ask any question and watch a fully adaptive UI generate itself — cards, charts, code, and more —
        all powered by Gemini AI in real time.
      </p>

      {/* CTA Buttons */}
      <div className="relative flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/app"
          className="group flex items-center gap-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02]"
        >
          Try it now
          <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
        </Link>
        <a
          href="#features"
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium px-5 py-3.5 rounded-xl hover:bg-slate-800/60 transition-colors"
        >
          See how it works
        </a>
      </div>

      {/* Demo preview mockup */}
      <div className="relative mt-20 w-full max-w-5xl">
        <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl shadow-slate-950/60 backdrop-blur-sm">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/60 bg-slate-900/60">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-slate-800 border border-slate-700 rounded-md h-6 w-64 mx-auto flex items-center px-3 gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-600" />
                <div className="text-xs text-slate-500">localhost:3000/app</div>
              </div>
            </div>
          </div>
          {/* App layout preview */}
          <div className="flex h-64 sm:h-80">
            {/* Left content area */}
            <div className="flex-1 bg-slate-950/80 p-5 space-y-3">
              <div className="flex gap-2">
                <div className="h-7 w-28 bg-violet-500/20 border border-violet-500/30 rounded-lg" />
                <div className="h-7 w-32 bg-slate-800/60 rounded-lg" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-4 bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-800 rounded w-5/6" />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 space-y-2"
                  >
                    <div className="h-3 bg-violet-500/30 rounded w-3/4" />
                    <div className="h-3 bg-slate-700 rounded w-full" />
                    <div className="h-3 bg-slate-700 rounded w-5/6" />
                  </div>
                ))}
              </div>
            </div>
            {/* Right chat panel */}
            <div className="w-60 sm:w-72 bg-slate-900 border-l border-slate-700/60 p-3 space-y-3 flex flex-col">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700/60">
                <div className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30" />
                <div className="space-y-1">
                  <div className="h-2.5 bg-slate-700 rounded w-20" />
                  <div className="h-2 bg-slate-800 rounded w-28" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-end">
                  <div className="bg-violet-600/60 rounded-2xl rounded-tr-sm px-3 py-2 w-32 h-8" />
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-700 shrink-0 mt-1" />
                  <div className="bg-slate-700/60 rounded-2xl rounded-tl-sm px-3 py-2 w-40 h-10" />
                </div>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl h-9 flex items-center px-3 gap-2">
                <div className="flex-1 h-2 bg-slate-700 rounded" />
                <div className="w-6 h-6 bg-violet-600 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating label */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-slate-400 text-xs px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
          Adaptive UI updates live with each query
        </div>
      </div>
    </section>
  );
}
