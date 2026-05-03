// File: ./src/components/adaptive/CardGrid.tsx

"use client";

import { ExternalLink } from "lucide-react";
import type { CardItem } from "@/lib/types";
import { useModal } from "@/contexts/ModalContext";
import TextBlock from "./TextBlock";

interface CardGridProps {
  cards: CardItem[];
}

export default function CardGrid({ cards }: CardGridProps) {
  const { openModal } = useModal();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`group relative bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden transition-all duration-200 hover:bg-slate-800 hover:shadow-lg ${
            card.details ? "cursor-pointer" : ""
          }`}
          style={{
            borderTopColor: "transparent",
          }}
          onClick={
            card.details
              ? () => openModal(card.title, <TextBlock content={card.details!} />)
              : undefined
          }
        >
          {/* Top gradient accent using theme color */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{
              background: `linear-gradient(to right, var(--theme-500-60), transparent)`,
            }}
          />

          <div className="p-5 pt-6">
            {card.icon && <span className="text-3xl mb-3 block">{card.icon}</span>}

            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                className="font-semibold text-white text-base leading-snug transition-colors"
                style={{ color: "inherit" }}
              >
                {card.title}
              </h3>
              <div className="flex items-center gap-1.5 shrink-0">
                {card.badge && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: "var(--theme-500-20)",
                      color: "var(--theme-400)",
                      borderColor: "var(--theme-500-30)",
                    }}
                  >
                    {card.badge}
                  </span>
                )}
                {card.details && (
                  <ExternalLink
                    size={13}
                    className="text-slate-500 group-hover:text-slate-300 transition-colors"
                  />
                )}
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">{card.body}</p>

            {/* Hover preview for cards with details */}
            {card.details && (
              <p className="mt-2 text-xs text-slate-600 group-hover:text-slate-500 transition-colors line-clamp-2">
                {card.details.replace(/[#*`]/g, "").slice(0, 100)}…
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
