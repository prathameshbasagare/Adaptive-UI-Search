// File: ./src/components/adaptive/AdaptiveContent.tsx

"use client";

import dynamic from "next/dynamic";
import type { AdaptiveUIResponse, ComponentDef, LayoutStyle } from "@/lib/types";
import TextBlock from "./TextBlock";
import CardGrid from "./CardGrid";
import BentoGrid from "./BentoGrid";
import CodeBlock from "./CodeBlock";
import Timeline from "./Timeline";
import TableBlock from "./TableBlock";
import StatCards from "./StatCards";
import ProgressBars from "./ProgressBars";
import Accordion from "./Accordion";
import TabsContent from "./TabsContent";
import Quote from "./Quote";
import Steps from "./Steps";
import Comparison from "./Comparison";
import Rating from "./Rating";
import Quiz from "./Quiz";
import ImageGallery from "./ImageGallery";
import KeyValueList from "./KeyValueList";
import TerminalBlock from "./TerminalBlock";
import FlashcardDeck from "./FlashcardDeck";
import ColorPalette from "./ColorPalette";
import Poll from "./Poll";
import RatingGrid from "./RatingGrid";
import FlowDiagram from "./FlowDiagram";
import MapHighlight from "./MapHighlight";
import DocumentView from "./DocumentView";
import { BookOpen, Sparkles } from "lucide-react";

// Chart.js relies on browser APIs — load only on the client
const ChartBlock = dynamic(() => import("./ChartBlock"), { ssr: false });

interface AdaptiveContentProps {
  response: AdaptiveUIResponse;
  layoutOverride?: LayoutStyle;
}

function renderComponent(component: ComponentDef, index: number): React.ReactNode {
  switch (component.type) {
    case "text":
      return component.content ? (
        <TextBlock key={index} content={component.content} />
      ) : null;

    case "bento_grid":
      return component.bentoItems && component.bentoItems.length > 0 ? (
        <BentoGrid
          key={index}
          bentoTitle={component.bentoTitle}
          items={component.bentoItems}
        />
      ) : null;

    case "cards":
      return component.cards && component.cards.length > 0 ? (
        <CardGrid key={index} cards={component.cards} />
      ) : null;

    case "chart":
      return component.chartData ? (
        <ChartBlock
          key={index}
          chartType={component.chartType}
          chartData={component.chartData}
          chartTitle={component.chartTitle}
        />
      ) : null;

    case "code":
      return component.snippets?.length || component.code ? (
        <CodeBlock
          key={index}
          language={component.language}
          code={component.code}
          codeTitle={component.codeTitle}
          snippets={component.snippets}
        />
      ) : null;

    case "timeline":
      return component.events && component.events.length > 0 ? (
        <Timeline key={index} events={component.events} />
      ) : null;

    case "table":
      return component.tableHeaders && component.tableRows ? (
        <TableBlock
          key={index}
          headers={component.tableHeaders}
          rows={component.tableRows}
        />
      ) : null;

    case "stat_cards":
      return component.stats && component.stats.length > 0 ? (
        <StatCards key={index} stats={component.stats} />
      ) : null;

    case "progress":
      return component.items && component.items.length > 0 ? (
        <ProgressBars
          key={index}
          progressTitle={component.progressTitle}
          items={component.items}
        />
      ) : null;

    case "accordion":
      return component.accordionItems && component.accordionItems.length > 0 ? (
        <Accordion key={index} items={component.accordionItems} />
      ) : null;

    case "tabs_content":
      return component.tabs && component.tabs.length > 0 ? (
        <TabsContent key={index} tabs={component.tabs} />
      ) : null;

    case "quote":
      return component.content ? (
        <Quote
          key={index}
          quoteType={component.quoteType}
          content={component.content}
          author={component.author}
        />
      ) : null;

    case "steps":
      return component.steps && component.steps.length > 0 ? (
        <Steps key={index} steps={component.steps} />
      ) : null;

    case "comparison":
      return component.leftSide && component.rightSide ? (
        <Comparison
          key={index}
          leftSide={component.leftSide}
          rightSide={component.rightSide}
        />
      ) : null;

    case "rating":
      return component.ratingItems && component.ratingItems.length > 0 ? (
        <Rating key={index} ratingTitle={component.ratingTitle} items={component.ratingItems} />
      ) : null;

    case "quiz":
      return component.questions && component.questions.length > 0 ? (
        <Quiz key={index} questions={component.questions} />
      ) : null;

    case "image_gallery":
      return component.query ? (
        <ImageGallery key={index} query={component.query} count={component.count} caption={component.caption} />
      ) : null;

    case "key_value":
      return component.entries && component.entries.length > 0 ? (
        <KeyValueList key={index} kvTitle={component.kvTitle} entries={component.entries} />
      ) : null;

    case "terminal":
      return component.lines && component.lines.length > 0 ? (
        <TerminalBlock key={index} terminalTitle={component.terminalTitle} lines={component.lines} />
      ) : null;

    case "flashcard":
      return component.flashcards && component.flashcards.length > 0 ? (
        <FlashcardDeck key={index} flashcardTitle={component.flashcardTitle} flashcards={component.flashcards} />
      ) : null;

    case "color_palette":
      return component.swatches && component.swatches.length > 0 ? (
        <ColorPalette key={index} paletteTitle={component.paletteTitle} swatches={component.swatches} />
      ) : null;

    case "poll":
      return component.pollQuestion && component.options && component.options.length > 0 ? (
        <Poll key={index} pollQuestion={component.pollQuestion} options={component.options} />
      ) : null;

    case "rating_grid":
      return component.gridItems && component.criteria && component.gridItems.length > 0 ? (
        <RatingGrid
          key={index}
          gridTitle={component.gridTitle}
          criteria={component.criteria}
          gridItems={component.gridItems}
        />
      ) : null;

    case "flow_diagram":
      return component.nodes && component.nodes.length > 0 ? (
        <FlowDiagram
          key={index}
          flowTitle={component.flowTitle}
          nodes={component.nodes}
          edges={component.edges ?? []}
        />
      ) : null;

    case "map_highlight":
      return component.highlights && component.highlights.length > 0 ? (
        <MapHighlight
          key={index}
          mapTitle={component.mapTitle}
          highlights={component.highlights}
        />
      ) : null;

    case "document_view":
      return component.content ? (
        <DocumentView
          key={index}
          docTitle={component.docTitle}
          docSubtitle={component.docSubtitle}
          content={component.content}
        />
      ) : null;

    default:
      return null;
  }
}

// ── Bento Grid Auto-Spanner ──────────────────────────────────────────────────
function getBentoSpan(component: ComponentDef, index: number): string {
  if (component.colSpan === 3) return "lg:col-span-3";
  if (component.colSpan === 2) return "lg:col-span-2";
  if (component.colSpan === 1) return "lg:col-span-1";

  switch (component.type) {
    case "bento_grid":
    case "table":
    case "comparison":
    case "timeline":
    case "document_view":
      return "lg:col-span-3";

    case "chart":
    case "code":
    case "rating_grid":
    case "steps":
    case "flow_diagram":
      return "lg:col-span-2";

    case "cards":
      return component.cards && component.cards.length <= 2 ? "lg:col-span-2" : "lg:col-span-3";

    case "text":
      // Give the lead text block full or 2-col span
      return index === 0 ? "lg:col-span-3" : "lg:col-span-2";

    case "stat_cards":
      return component.stats && component.stats.length >= 3 ? "lg:col-span-3" : "lg:col-span-2";

    case "quote":
    case "progress":
    case "key_value":
    case "color_palette":
    case "flashcard":
    case "quiz":
    case "poll":
    case "rating":
    case "terminal":
      return "lg:col-span-1";

    default:
      return "lg:col-span-1";
  }
}

function getComponentTitle(component: ComponentDef, index: number): string {
  switch (component.type) {
    case "chart": return component.chartTitle || "Analytics Chart";
    case "code": return component.codeTitle || "Code Implementation";
    case "table": return "Data Table";
    case "stat_cards": return "Key Metrics";
    case "bento_grid": return component.bentoTitle || "Highlights";
    case "steps": return "Implementation Steps";
    case "timeline": return "Chronological Timeline";
    case "comparison": return "Feature Comparison";
    case "accordion": return "Frequently Asked Questions";
    case "terminal": return component.terminalTitle || "Terminal Commands";
    case "quiz": return "Interactive Quiz";
    case "flashcard": return component.flashcardTitle || "Flashcard Deck";
    case "color_palette": return component.paletteTitle || "Color System";
    case "progress": return component.progressTitle || "Skill & Progress Breakdown";
    case "cards": return "Feature Overview";
    case "document_view": return component.docTitle || "Documentation Overview";
    default: return `Section ${index + 1}`;
  }
}

export default function AdaptiveContent({ response, layoutOverride }: AdaptiveContentProps) {
  const activeLayout = layoutOverride ?? response.layoutStyle ?? "bento";

  // Summary banner component
  const summaryBlock = response.summary ? (
    <div
      className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm flex items-start gap-3"
      style={{
        borderLeftColor: "var(--theme-500)",
        borderLeftWidth: "4px",
      }}
    >
      <Sparkles size={18} className="shrink-0 mt-0.5" style={{ color: "var(--theme-400)" }} />
      <p className="text-slate-300 text-sm leading-relaxed">{response.summary}</p>
    </div>
  ) : null;

  // 1. Bento Grid Layout
  if (activeLayout === "bento") {
    return (
      <div className="space-y-6 animate-fadeIn">
        {summaryBlock}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {response.components.map((component, index) => {
            const spanClass = getBentoSpan(component, index);
            const rendered = renderComponent(component, index);
            if (!rendered) return null;

            return (
              <div key={index} className={`w-full ${spanClass} transition-all duration-200`}>
                {rendered}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 2. Executive Dashboard Layout
  if (activeLayout === "dashboard") {
    const statCards = response.components.filter((c) => c.type === "stat_cards");
    const visualCards = response.components.filter((c) =>
      ["chart", "progress", "rating_grid", "rating"].includes(c.type)
    );
    const dataCards = response.components.filter((c) =>
      ["table", "cards", "comparison", "key_value", "bento_grid"].includes(c.type)
    );
    const otherCards = response.components.filter(
      (c) =>
        !["stat_cards", "chart", "progress", "rating_grid", "rating", "table", "cards", "comparison", "key_value", "bento_grid"].includes(
          c.type
        )
    );

    return (
      <div className="space-y-6 animate-fadeIn">
        {summaryBlock}

        {/* Top KPI Metrics Row */}
        {statCards.map((c, i) => renderComponent(c, i))}

        {/* Analytics & Visual Section */}
        {visualCards.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {visualCards.map((c, i) => renderComponent(c, i))}
          </div>
        )}

        {/* Data & Breakdown Section */}
        {dataCards.length > 0 && (
          <div className="space-y-6">
            {dataCards.map((c, i) => renderComponent(c, i))}
          </div>
        )}

        {/* Context / Documentation */}
        {otherCards.length > 0 && (
          <div className="space-y-6">
            {otherCards.map((c, i) => renderComponent(c, i))}
          </div>
        )}
      </div>
    );
  }

  // 3. Documentation & Technical Spec Layout
  if (activeLayout === "docs") {
    return (
      <div className="space-y-6 animate-fadeIn">
        {summaryBlock}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Quick Anchor Navigation */}
          <div className="hidden lg:block lg:col-span-1 sticky top-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <BookOpen size={14} style={{ color: "var(--theme-400)" }} />
              <span>On this page</span>
            </div>
            <nav className="space-y-1.5 text-xs">
              {response.components.map((c, i) => (
                <a
                  key={i}
                  href={`#doc-section-${i}`}
                  className="block px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors truncate"
                >
                  {getComponentTitle(c, i)}
                </a>
              ))}
            </nav>
          </div>

          {/* Main Reading Flow */}
          <div className="lg:col-span-3 space-y-8">
            {response.components.map((component, index) => {
              const rendered = renderComponent(component, index);
              if (!rendered) return null;
              return (
                <div key={index} id={`doc-section-${index}`} className="scroll-mt-6">
                  {rendered}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 4. Split Comparison Layout
  if (activeLayout === "split") {
    const leftItems: ComponentDef[] = [];
    const rightItems: ComponentDef[] = [];

    response.components.forEach((c, idx) => {
      if (idx % 2 === 0) leftItems.push(c);
      else rightItems.push(c);
    });

    return (
      <div className="space-y-6 animate-fadeIn">
        {summaryBlock}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            {leftItems.map((c, i) => renderComponent(c, i))}
          </div>
          <div className="space-y-6">
            {rightItems.map((c, i) => renderComponent(c, i))}
          </div>
        </div>
      </div>
    );
  }

  // 5. Standard Linear Layout (Default classic fallback)
  return (
    <div className="space-y-6 animate-fadeIn">
      {summaryBlock}
      {response.components.map((component, index) =>
        renderComponent(component, index)
      )}
    </div>
  );
}
