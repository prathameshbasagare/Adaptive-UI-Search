// File: ./src/components/adaptive/AdaptiveContent.tsx

"use client";

import dynamic from "next/dynamic";
import type { AdaptiveUIResponse, ComponentDef } from "@/lib/types";
import TextBlock from "./TextBlock";
import CardGrid from "./CardGrid";
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

// Chart.js relies on browser APIs — load only on the client
const ChartBlock = dynamic(() => import("./ChartBlock"), { ssr: false });

interface AdaptiveContentProps {
  response: AdaptiveUIResponse;
}

function renderComponent(component: ComponentDef, index: number): React.ReactNode {
  switch (component.type) {
    case "text":
      return component.content ? (
        <TextBlock key={index} content={component.content} />
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

export default function AdaptiveContent({ response }: AdaptiveContentProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {response.summary && (
        <p
          className="text-slate-400 text-sm leading-relaxed border-l-2 pl-3"
          style={{ borderColor: "var(--theme-500-60)" }}
        >
          {response.summary}
        </p>
      )}
      {response.components.map((component, index) =>
        renderComponent(component, index)
      )}
    </div>
  );
}
