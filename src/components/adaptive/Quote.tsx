// File: ./src/components/adaptive/Quote.tsx

"use client";

import { Lightbulb, AlertTriangle, Info, CheckCircle, Quote as QuoteIcon } from "lucide-react";

type QuoteType = "tip" | "warning" | "info" | "success" | "quote";

interface QuoteProps {
  quoteType?: QuoteType;
  content: string;
  author?: string;
}

const QUOTE_CONFIG: Record<QuoteType, { icon: React.ElementType; borderClass: string; bgClass: string; iconClass: string; label: string }> = {
  tip:     { icon: Lightbulb,    borderClass: "border-amber-500",   bgClass: "bg-amber-500/8",   iconClass: "text-amber-400",   label: "Tip"     },
  warning: { icon: AlertTriangle, borderClass: "border-orange-500", bgClass: "bg-orange-500/8",  iconClass: "text-orange-400",  label: "Warning" },
  info:    { icon: Info,          borderClass: "border-blue-500",   bgClass: "bg-blue-500/8",    iconClass: "text-blue-400",    label: "Info"    },
  success: { icon: CheckCircle,   borderClass: "border-emerald-500",bgClass: "bg-emerald-500/8", iconClass: "text-emerald-400", label: "Success" },
  quote:   { icon: QuoteIcon,     borderClass: "border-[var(--theme-500)]", bgClass: "bg-[var(--theme-500-8)]", iconClass: "text-[var(--theme-400)]", label: "" },
};

export default function Quote({ quoteType = "info", content, author }: QuoteProps) {
  const config = QUOTE_CONFIG[quoteType] ?? QUOTE_CONFIG.info;
  const Icon = config.icon;

  return (
    <div className={`border-l-4 ${config.borderClass} ${config.bgClass} rounded-r-xl px-5 py-4`}>
      <div className="flex items-start gap-3">
        <Icon size={18} className={`${config.iconClass} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {config.label && (
            <p className={`text-xs font-semibold uppercase tracking-wide ${config.iconClass} mb-1`}>{config.label}</p>
          )}
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{content}</p>
          {author && <p className="text-slate-500 dark:text-slate-500 text-xs mt-2 italic">— {author}</p>}
        </div>
      </div>
    </div>
  );
}
