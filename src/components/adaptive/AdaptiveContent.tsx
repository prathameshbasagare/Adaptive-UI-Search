// File: ./src/components/adaptive/AdaptiveContent.tsx

"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
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
import ComponentErrorBoundary from "./ComponentErrorBoundary";
import { BookOpen, Sparkles } from "lucide-react";

// Chart.js relies on browser APIs — load only on the client
const ChartBlock = dynamic(() => import("./ChartBlock"), { ssr: false });

// Showcase blocks pull in GSAP — code-split so it only loads when used.
const ParallaxHero = dynamic(() => import("./showcase/ParallaxHero"), { ssr: false });
const ScrollStory = dynamic(() => import("./showcase/ScrollStory"), { ssr: false });
const HorizontalScroll = dynamic(() => import("./showcase/HorizontalScroll"), { ssr: false });
const StackingCards = dynamic(() => import("./showcase/StackingCards"), { ssr: false });
const TextReveal = dynamic(() => import("./showcase/TextReveal"), { ssr: false });
const NumberTicker = dynamic(() => import("./showcase/NumberTicker"), { ssr: false });
const SpotlightCards = dynamic(() => import("./showcase/SpotlightCards"), { ssr: false });
import HoverPanels from "./showcase/HoverPanels";
import Marquee from "./showcase/Marquee";

/** Interactive blocks that need the full content width to work. */
const SHOWCASE_TYPES = new Set<ComponentDef["type"]>([
  "parallax_hero", "scroll_story", "horizontal_scroll", "stacking_cards", "text_reveal",
  "number_ticker", "hover_panels", "spotlight_cards", "marquee",
]);
const isShowcase = (c: ComponentDef) => SHOWCASE_TYPES.has(c.type);

interface AdaptiveContentProps {
  response: AdaptiveUIResponse;
  layoutOverride?: LayoutStyle;
  /** True while components are still streaming in. */
  streaming?: boolean;
}

/** Component paired with its position in the original response (stable key). */
interface Indexed {
  c: ComponentDef;
  i: number;
}

/**
 * Components arrive already validated by the Zod schemas, so every prop the
 * renderer needs is guaranteed present. The `never` check makes TypeScript
 * fail the build if a registry type has no renderer.
 */
function renderInner(c: ComponentDef): React.ReactNode {
  switch (c.type) {
    case "text": return <TextBlock content={c.content} />;
    case "bento_grid": return <BentoGrid bentoTitle={c.bentoTitle} items={c.bentoItems} />;
    case "cards": return <CardGrid cards={c.cards} />;
    case "chart": return <ChartBlock chartType={c.chartType} chartData={c.chartData} chartTitle={c.chartTitle} />;
    case "code": return <CodeBlock language={c.language} code={c.code} codeTitle={c.codeTitle} snippets={c.snippets} />;
    case "timeline": return <Timeline events={c.events} />;
    case "table": return <TableBlock headers={c.tableHeaders} rows={c.tableRows} />;
    case "stat_cards": return <StatCards stats={c.stats} />;
    case "progress": return <ProgressBars progressTitle={c.progressTitle} items={c.items} />;
    case "accordion": return <Accordion items={c.accordionItems} />;
    case "tabs_content": return <TabsContent tabs={c.tabs} />;
    case "quote": return <Quote quoteType={c.quoteType} content={c.content} author={c.author} />;
    case "steps": return <Steps steps={c.steps} />;
    case "comparison": return <Comparison leftSide={c.leftSide} rightSide={c.rightSide} />;
    case "rating": return <Rating ratingTitle={c.ratingTitle} items={c.ratingItems} />;
    case "quiz": return <Quiz questions={c.questions} />;
    case "image_gallery": return <ImageGallery query={c.query} count={c.count} caption={c.caption} />;
    case "key_value": return <KeyValueList kvTitle={c.kvTitle} entries={c.entries} />;
    case "terminal": return <TerminalBlock terminalTitle={c.terminalTitle} lines={c.lines} />;
    case "flashcard": return <FlashcardDeck flashcardTitle={c.flashcardTitle} flashcards={c.flashcards} />;
    case "color_palette": return <ColorPalette paletteTitle={c.paletteTitle} swatches={c.swatches} />;
    case "poll": return <Poll pollQuestion={c.pollQuestion} options={c.options} />;
    case "rating_grid": return <RatingGrid gridTitle={c.gridTitle} criteria={c.criteria} gridItems={c.gridItems} />;
    case "flow_diagram": return <FlowDiagram flowTitle={c.flowTitle} nodes={c.nodes} edges={c.edges} />;
    case "map_highlight": return <MapHighlight mapTitle={c.mapTitle} highlights={c.highlights} />;
    case "document_view": return <DocumentView docTitle={c.docTitle} docSubtitle={c.docSubtitle} content={c.content} />;
    case "parallax_hero": return <ParallaxHero eyebrow={c.eyebrow} title={c.title} subtitle={c.subtitle} icon={c.icon} highlights={c.highlights} />;
    case "scroll_story": return <ScrollStory storyTitle={c.storyTitle} chapters={c.chapters} />;
    case "horizontal_scroll": return <HorizontalScroll sectionTitle={c.sectionTitle} panels={c.panels} />;
    case "stacking_cards": return <StackingCards stackTitle={c.stackTitle} cards={c.cards} />;
    case "text_reveal": return <TextReveal statement={c.statement} attribution={c.attribution} emphasis={c.emphasis} />;
    case "number_ticker": return <NumberTicker tickerTitle={c.tickerTitle} items={c.items} />;
    case "hover_panels": return <HoverPanels panelsTitle={c.panelsTitle} panels={c.panels} />;
    case "spotlight_cards": return <SpotlightCards gridTitle={c.gridTitle} cards={c.cards} />;
    case "marquee": return <Marquee marqueeTitle={c.marqueeTitle} items={c.items} speed={c.speed} />;
    default: {
      const unreachable: never = c;
      return unreachable;
    }
  }
}

function renderComponent({ c, i }: Indexed): React.ReactNode {
  return (
    <ComponentErrorBoundary key={`${c.type}-${i}`} label={getComponentTitle(c, i)}>
      {renderInner(c)}
    </ComponentErrorBoundary>
  );
}

// ── Bento Grid Auto-Spanner ──────────────────────────────────────────────────
function getBentoSpan(component: ComponentDef, index: number): string {
  if (isShowcase(component)) return "md:col-span-2 lg:col-span-3";
  if (component.colSpan === 3 || component.colSpan === 4) return "lg:col-span-3";
  if (component.colSpan === 2) return "lg:col-span-2";
  if (component.colSpan === 1) return "lg:col-span-1";

  switch (component.type) {
    case "bento_grid":
    case "table":
    case "comparison":
    case "timeline":
    case "document_view":
      return "md:col-span-2 lg:col-span-3";
    case "chart":
    case "code":
    case "rating_grid":
    case "steps":
    case "flow_diagram":
    case "map_highlight":
    case "image_gallery":
      return "md:col-span-2 lg:col-span-2";
    case "cards":
      return component.cards.length <= 2 ? "md:col-span-2 lg:col-span-2" : "md:col-span-2 lg:col-span-3";
    case "text":
      return index === 0 ? "md:col-span-2 lg:col-span-3" : "md:col-span-2 lg:col-span-2";
    case "stat_cards":
      return component.stats.length >= 3 ? "md:col-span-2 lg:col-span-3" : "md:col-span-2 lg:col-span-2";
    default:
      return "lg:col-span-1";
  }
}

const LG_SPAN = ["", "lg:col-span-1", "lg:col-span-2", "lg:col-span-3"];

/**
 * Greedy row packing for the 3-column bento grid: when the next item does not
 * fit in what is left of the current row, the previous item stretches to fill
 * the gap (and the last item fills the final row), so no holes are left.
 */
function packBento(items: Indexed[]): { it: Indexed; cls: string }[] {
  const spans = items.map((it) => {
    const m = getBentoSpan(it.c, it.i).match(/lg:col-span-(\d)/);
    return m ? Number(m[1]) : 1;
  });
  let used = 0;
  for (let k = 0; k < spans.length; k++) {
    if (used + spans[k] > 3) {
      if (k > 0) spans[k - 1] += 3 - used;
      used = 0;
    }
    used = (used + spans[k]) % 3;
  }
  if (used > 0 && spans.length) spans[spans.length - 1] += 3 - used;

  return items.map((it, k) => {
    const base = getBentoSpan(it.c, it.i).replace(/lg:col-span-\d/, "").trim();
    const md = spans[k] >= 2 && !base.includes("md:col-span-2") ? "md:col-span-2" : "";
    return { it, cls: `${base} ${md} ${LG_SPAN[spans[k]]}`.trim() };
  });
}

function getComponentTitle(component: ComponentDef, index: number): string {
  switch (component.type) {
    case "chart": return component.chartTitle || "Analytics Chart";
    case "code": return component.codeTitle || "Code Implementation";
    case "table": return "Data Table";
    case "stat_cards": return "Key Metrics";
    case "bento_grid": return component.bentoTitle || "Highlights";
    case "steps": return "Implementation Steps";
    case "timeline": return "Timeline";
    case "comparison": return "Comparison";
    case "accordion": return "Frequently Asked Questions";
    case "terminal": return component.terminalTitle || "Terminal Commands";
    case "quiz": return "Interactive Quiz";
    case "flashcard": return component.flashcardTitle || "Flashcard Deck";
    case "color_palette": return component.paletteTitle || "Color System";
    case "progress": return component.progressTitle || "Progress Breakdown";
    case "cards": return "Overview";
    case "document_view": return component.docTitle || "Documentation";
    case "text": return "Introduction";
    case "quote": return "Note";
    case "key_value": return component.kvTitle || "Specifications";
    case "rating": return component.ratingTitle || "Ratings";
    case "rating_grid": return component.gridTitle || "Scorecard";
    case "flow_diagram": return component.flowTitle || "Flow";
    case "map_highlight": return component.mapTitle || "Map";
    case "poll": return "Poll";
    case "image_gallery": return component.caption || "Gallery";
    case "tabs_content": return "Details";
    case "parallax_hero": return component.title;
    case "scroll_story": return component.storyTitle || "Story";
    case "horizontal_scroll": return component.sectionTitle || "Highlights";
    case "stacking_cards": return component.stackTitle || "Key Points";
    case "text_reveal": return "Key Insight";
    case "number_ticker": return component.tickerTitle || "By the Numbers";
    case "hover_panels": return component.panelsTitle || "Explore";
    case "spotlight_cards": return component.gridTitle || "Features";
    case "marquee": return component.marqueeTitle || "Ecosystem";
    default: return `Section ${index + 1}`;
  }
}

/** Rough visual height used to balance the two split columns. */
function weight(c: ComponentDef): number {
  switch (c.type) {
    case "text": case "quote": return 1;
    case "stat_cards": case "progress": case "rating": case "poll": return 2;
    case "table": return 1 + c.tableRows.length * 0.4;
    case "steps": return 1 + c.steps.length;
    case "timeline": return 1 + c.events.length;
    case "accordion": return 1 + c.accordionItems.length * 0.5;
    default: return 3;
  }
}

function StreamingPlaceholder({ count }: { count: number }) {
  return (
    <div className="space-y-3" aria-live="polite" aria-busy="true">
      <div className="h-28 rounded-xl border border-slate-800 bg-slate-900/40 animate-pulse" />
      <p className="text-xs text-slate-500">
        {count === 0 ? "Designing layout…" : `Rendered ${count} block${count === 1 ? "" : "s"} — more on the way…`}
      </p>
    </div>
  );
}

export default function AdaptiveContent({ response, layoutOverride, streaming }: AdaptiveContentProps) {
  const activeLayout = layoutOverride ?? response.layoutStyle ?? "bento";
  const all: Indexed[] = response.components.map((c, i) => ({ c, i }));
  // A hero always opens the page, whatever the layout.
  const heroes = all.filter((x) => x.c.type === "parallax_hero");
  const items = all.filter((x) => x.c.type !== "parallax_hero");
  const placeholder = streaming ? <StreamingPlaceholder count={all.length} /> : null;
  const hasShowcase = all.some((x) => isShowcase(x.c));

  // Scroll-driven blocks cache trigger positions; recompute them whenever
  // content above them changes height (streaming blocks, images, charts…).
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasShowcase || !rootRef.current) return;
    let cancelled = false;
    let ro: ResizeObserver | undefined;
    import("@/lib/motion").then(({ scheduleScrollRefresh }) => {
      if (cancelled || !rootRef.current) return;
      ro = new ResizeObserver(() => scheduleScrollRefresh());
      ro.observe(rootRef.current);
    });
    return () => {
      cancelled = true;
      ro?.disconnect();
    };
  }, [hasShowcase]);

  const summaryBlock = response.summary ? (
    <div
      className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm flex items-start gap-3"
      style={{ borderLeftColor: "var(--theme-500)", borderLeftWidth: "4px" }}
    >
      <Sparkles size={18} className="shrink-0 mt-0.5" style={{ color: "var(--theme-400)" }} />
      <p className="text-slate-300 text-sm leading-relaxed">{response.summary}</p>
    </div>
  ) : null;

  // 1. Bento Grid Layout
  if (activeLayout === "bento") {
    return (
      <div ref={rootRef} className="space-y-6 animate-fadeIn">
        {heroes.map(renderComponent)}
        {summaryBlock}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {packBento(items).map(({ it, cls }) => (
            <div key={`${it.c.type}-${it.i}`} className={`w-full min-w-0 ${cls}`}>
              {renderComponent(it)}
            </div>
          ))}
        </div>
        {placeholder}
      </div>
    );
  }

  // 2. Executive Dashboard Layout
  if (activeLayout === "dashboard") {
    const VISUAL = ["chart", "progress", "rating_grid", "rating"];
    const DATA = ["table", "cards", "comparison", "key_value", "bento_grid"];
    const stats = items.filter((x) => x.c.type === "stat_cards");
    const visual = items.filter((x) => VISUAL.includes(x.c.type));
    const data = items.filter((x) => DATA.includes(x.c.type));
    const showcase = items.filter((x) => isShowcase(x.c));
    const other = items.filter(
      (x) => x.c.type !== "stat_cards" && !VISUAL.includes(x.c.type) && !DATA.includes(x.c.type) && !isShowcase(x.c)
    );

    return (
      <div ref={rootRef} className="space-y-6 animate-fadeIn">
        {heroes.map(renderComponent)}
        {summaryBlock}
        {stats.map(renderComponent)}
        {showcase.map(renderComponent)}
        {visual.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">{visual.map(renderComponent)}</div>
        )}
        {data.length > 0 && <div className="space-y-6">{data.map(renderComponent)}</div>}
        {other.length > 0 && <div className="space-y-6">{other.map(renderComponent)}</div>}
        {placeholder}
      </div>
    );
  }

  // 3. Documentation & Technical Spec Layout
  if (activeLayout === "docs") {
    return (
      <div ref={rootRef} className="space-y-6 animate-fadeIn">
        {heroes.map(renderComponent)}
        {summaryBlock}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <nav
            aria-label="On this page"
            className="hidden lg:block lg:col-span-1 sticky top-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <BookOpen size={14} style={{ color: "var(--theme-400)" }} />
              <span>On this page</span>
            </div>
            <div className="space-y-1.5 text-xs">
              {items.map(({ c, i }) => (
                <a
                  key={`${c.type}-${i}`}
                  href={`#doc-section-${i}`}
                  className="block px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors truncate"
                >
                  {getComponentTitle(c, i)}
                </a>
              ))}
            </div>
          </nav>
          <div className="lg:col-span-3 space-y-8 min-w-0">
            {items.map((it) => (
              <div key={`${it.c.type}-${it.i}`} id={`doc-section-${it.i}`} className="scroll-mt-6">
                {renderComponent(it)}
              </div>
            ))}
            {placeholder}
          </div>
        </div>
      </div>
    );
  }

  // 4. Split Comparison Layout — full-width blocks first, the rest balanced by height.
  if (activeLayout === "split") {
    const FULL = ["comparison", "table", "text"];
    const isFull = (x: Indexed) => FULL.includes(x.c.type) || isShowcase(x.c);
    const full = items.filter(isFull);
    const rest = items.filter((x) => !isFull(x));
    const left: Indexed[] = [];
    const right: Indexed[] = [];
    let lw = 0;
    let rw = 0;
    for (const it of rest) {
      if (lw <= rw) {
        left.push(it);
        lw += weight(it.c);
      } else {
        right.push(it);
        rw += weight(it.c);
      }
    }

    return (
      <div ref={rootRef} className="space-y-6 animate-fadeIn">
        {heroes.map(renderComponent)}
        {summaryBlock}
        {full.map(renderComponent)}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6 min-w-0">{left.map(renderComponent)}</div>
            <div className="space-y-6 min-w-0">{right.map(renderComponent)}</div>
          </div>
        )}
        {placeholder}
      </div>
    );
  }

  // 5. Standard Linear Layout
  return (
    <div ref={rootRef} className="space-y-6 animate-fadeIn">
      {heroes.map(renderComponent)}
      {summaryBlock}
      {items.map(renderComponent)}
      {placeholder}
    </div>
  );
}
