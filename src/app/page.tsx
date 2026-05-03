// File: ./src/app/page.tsx

import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-semibold text-white text-sm">AdaptiveUI</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#features"
            className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:inline"
          >
            Features
          </a>
          <Link
            href="/app"
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Launch App
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Page content */}
      <div className="pt-16">
        <Hero />
        <Features />

        {/* CTA section */}
        <section className="py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to experience adaptive search?
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              No signup required. Just open the app, ask your first question, and watch your UI come to life.
            </p>
            <Link
              href="/app"
              className="inline-flex items-center gap-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02]"
            >
              Get started for free
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <span className="text-sm text-slate-500">AdaptiveUI</span>
            </div>
            <p className="text-xs text-slate-600">
              Built with Next.js · Tailwind CSS · Gemma 3 27B
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
