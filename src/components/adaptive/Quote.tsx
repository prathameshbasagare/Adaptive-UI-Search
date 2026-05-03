// File: ./src/components/adaptive/Quote.tsx

"use client";

import { Lightbulb, AlertTriangle, Info, CheckCircle, Quote as QuoteIcon } from "lucide-react";

type QuoteType = "tip" | "warning" | "info" | "success" | "quote";

interface QuoteProps {
  quoteType?: QuoteType;
  content: string;
  author?: string;
}

const QUOTE_CONFIG: Record<
  QuoteType,
  { icon: React.ElementType; borderColor: string; bgColor: string; iconColor: string; label: string }
> = {
  tip: {
    icon: Lightbulb,
    borderColor: "border-amber-500",
    bgColor: "bg-amber-500/8",
    iconColor: "text-amber-400",
    label: "Tip",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-orange-500",
    bgColor: "bg-orange-500/8",
    iconColor: "text-orange-400",
    label: "Warning",
  },
  info: {
    icon: Info,
    borderColor: "border-blue-500",
    bgColor: "bg-blue-500/8",
    iconColor: "text-blue-400",
    label: "Info",
  },
  success: {
    icon: CheckCircle,
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-500/8",
    iconColor: "text-emerald-400",
    label: "Success",
  },
  quote: {
    icon: QuoteIcon,
    borderColor: "border-violet-500",
    bgColor: "bg-violet-500/8",
    iconColor: "text-violet-400",
    label: "",
  },
};

export default function Quote({ quoteType = "info", content, author }: QuoteProps) {
  const config = QUOTE_CONFIG[quoteType] ?? QUOTE_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      className={`border-l-4 ${config.borderColor} ${config.bgColor} rounded-r-xl px-5 py-4`}
    >
      <div className="flex items-start gap-3">
        <Icon size={18} className={`${config.iconColor} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          {config.label && (
            <p className={`text-xs font-semibold uppercase tracking-wide ${config.iconColor} mb-1`}>
              {config.label}
            </p>
          )}
          <p className="text-slate-300 text-sm leading-relaxed">{content}</p>
          {author && (
            <p className="text-slate-500 text-xs mt-2 italic">— {author}</p>
          )}
        </div>
      </div>
    </div>
  );
}
