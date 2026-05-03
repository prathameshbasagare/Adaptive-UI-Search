# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **User-controlled 6-theme color system** via CSS custom properties (`--theme-400/500/600` + alpha variants); themes: `violet` (default), `blue`, `emerald`, `amber`, `rose`, `cyan`
- `src/hooks/useThemeStore.ts` — Zustand store persisting selected theme to `localStorage` and syncing `data-theme` attribute on `<body>`
- `src/components/ui/ThemePicker.tsx` — 6 colored circle buttons in the app header for instant theme switching
- **Global modal system**: `src/contexts/ModalContext.tsx` with `ModalProvider`, `useModal()` hook, and `ModalOverlay` (Escape/backdrop close, slide-in animation)
- **Interactive expandable cards**: `CardItem.details` field — cards with details show an expand icon; clicking opens a modal with full markdown content; hover shows 100-char preview
- **`Rating` component** — star rating rows (1–5) for a list of items; in-component state, no persistence
- **`Quiz` component** — multi-question quiz with option selection, correct/wrong highlight, explanation reveal, score summary, and retry
- **`ImageGallery` component** (`image_gallery` type) — fetches from `/api/images` (Pexels), renders masonry grid with photographer credit and skeleton loader
- `src/app/api/images/route.ts` — GET route proxying Pexels API with `?query=<str>&count=<n>` parameters
- **`KeyValueList` component** (`key_value` type) — spec-sheet style key:value pairs with optional category grouping
- **`TerminalBlock` component** (`terminal` type) — dark terminal window with typewriter animation per command line
- **`FlashcardDeck` component** (`flashcard` type) — CSS 3D flip cards with front/back, next/prev navigation, and reset
- **`ColorPalette` component** (`color_palette` type) — color swatches grid with hex copy-to-clipboard
- **`Poll` component** (`poll` type) — single-vote poll with animated result bars after voting
- **`RatingGrid` component** (`rating_grid` type) — items × criteria matrix with fill-bar scores and average column
- **`FlowDiagram` component** (`flow_diagram` type) — custom SVG renderer for nodes (rect/diamond/circle) + directed edges
- **`MapHighlight` component** (`map_highlight` type) — React-19-compatible stylized world banner + highlighted country chips (no external React map dependency)
- **`DocumentView` component** (`document_view` type) — page-like styled document with decorative cover header, title, subtitle, and full markdown body
- `pexels` npm package for typed Pexels API client
- CSS `@keyframes` for `cursor-blink` (terminal cursor) added to `globals.css`
- CSS classes for flashcard 3D perspective/flip in `globals.css`
- `PEXELS_API_KEY` added to `.env.local.example`

### Changed
- Upgraded model from `gemma-3-1b-it` → `gemma-3-4b-it` → `gemma-3-12b-it` — 12B has the strongest instruction following in the Gemma 3 family for reliable structured JSON output
- **All 13 existing components** refactored from hardcoded `violet-*` Tailwind colors to `var(--theme-*)` CSS custom properties
- **`Comparison` component** — auto-detects pros/cons context; only uses green/red for pros vs cons; all other comparisons (React vs Vue, iOS vs Android, etc.) use theme-neutral colors
- **`FloatingChatButton`** — updated to use theme color for background and glow; added message-count dot indicator
- **`app/app/page.tsx`** — added `ThemePicker` in header, wrapped in `ModalProvider`, tab/accent colors now use CSS vars
- **`AdaptiveContent`** — summary border uses `var(--theme-500-60)`; added 12 new component cases
- Extended `src/lib/types.ts` with 12 new `ComponentType` values and interfaces: `RatingItem`, `QuizQuestion`, `KeyValueEntry`, `TerminalLine`, `Flashcard`, `ColorSwatch`, `PollOption`, `RatingGridItem`, `FlowNode`, `FlowEdge`, `MapHighlightEntry`; added `details?: string` to `CardItem`
- Extended system prompt in `src/lib/gemini.ts` with all 25 component schemas and updated selection rules (including comparison color semantics, new types)

### Changed
- Upgraded model from `gemma-3-1b-it` → `gemma-3-4b-it` → `gemma-3-27b-it` — 27B has the strongest instruction following in the Gemma 3 family for reliable structured JSON output
- Rewrote system prompt using concrete JSON examples per component type and explicit SELECTION RULES mapping query patterns (e.g. "compare X vs Y" → comparison, "history of" → timeline) — improves model adherence to schema for smaller models

### Added
- **9 new adaptive canvas components:** `Timeline`, `TableBlock`, `StatCards`, `ProgressBars`, `Accordion`, `TabsContent`, `Quote`, `Steps`, `Comparison`
- `Timeline` — vertical dot-connector timeline with year badges, icons, and alternating content
- `TableBlock` — styled dark-theme table with sticky header row and row count footer
- `StatCards` — KPI cards grid (2–4 per row) with large value, trend badge (up/down/neutral), icon, and background gradient accent
- `ProgressBars` — animated horizontal fill bars with IntersectionObserver viewport trigger
- `Accordion` — collapsible FAQ rows with smooth max-height transition, one item open at a time
- `TabsContent` — inline tab switcher rendering each tab body as markdown via `TextBlock`
- `Quote` — coloured callout box (tip/warning/info/success/quote) with left border accent and Lucide icon
- `Steps` — numbered vertical steps with optional embedded inline code snippet per step
- `Comparison` — side-by-side two-column layout with coloured headers and icon-prefixed item lists

### Changed
- **CardGrid** — added per-card coloured gradient accent top band and matching hover border/title colour (6-colour rotating palette)
- **CodeBlock** — added multi-snippet language tab switcher via new optional `snippets: CodeSnippet[]` field; falls back to single block for legacy `code` prop
- **ChartBlock** — added per-dataset `type` override enabling mixed bar+line charts rendered via Chart.js `Chart` component
- **TextBlock** — added sticky left TOC sidebar (auto-shown when content has 3+ `##`/`###` headings) with IntersectionObserver active-heading highlight
- Updated `src/lib/types.ts` with 10 new `ComponentType` values and all new interfaces (`TimelineEvent`, `StatCard`, `ProgressItem`, `AccordionItem`, `TabContent`, `Step`, `ComparisonSide`, `CodeSnippet`)
- Updated system prompt in `src/lib/gemini.ts` with all 13 component schemas and contextual selection guide
- Extended `repairComponents()` in `src/lib/gemini.ts` to handle orphan timeline events, steps, and stat cards in addition to existing card repair

### Fixed
- Added `repairComponents()` function that auto-wraps orphan card items into a `{ type: "cards", cards: [...] }` envelope — Gemma 3 1B tends to place card items directly in the `components` array without the type wrapper, causing schema validation failures

### Changed
- Switched AI model from `gemini-2.0-flash` → `gemini-1.5-flash` → `gemma-3-1b-it` (free-tier, no billing required)
- Removed `systemInstruction` API parameter (not supported by Gemma IT models); system prompt is now injected as the first user/model turn in conversation history per Gemma's recommended pattern
- Improved JSON extraction to handle cases where the model outputs text around the JSON object
- Updated all UI labels and descriptions to reference Gemma 3 1B

### Fixed
- Improved API error handling for rate-limit (429) responses — now surfaces a user-friendly message with the retry delay instead of a generic 500 error

### Added
- Initial project setup with Next.js 15 (App Router), TypeScript, and Tailwind CSS
- `src/lib/types.ts` — Shared TypeScript types: `AdaptiveUIResponse`, `ComponentDef`, `ChatMessage`, `TabEntry`, `ChatStore`
- `src/lib/gemini.ts` — Gemini 2.0 Flash SDK wrapper with system prompt enforcing structured JSON schema output
- `src/app/api/chat/route.ts` — `POST /api/chat` server route for Gemini integration with input validation and error handling
- `src/hooks/useChatStore.ts` — Zustand store managing chat messages, adaptive UI tabs, panel open/close, and loading state
- `src/components/adaptive/TextBlock.tsx` — Markdown renderer with styled headings, lists, code, tables, and links
- `src/components/adaptive/CardGrid.tsx` — Responsive card grid component with badge and icon support
- `src/components/adaptive/ChartBlock.tsx` — Chart.js wrapper supporting bar, line, pie, and doughnut chart types with dark theme
- `src/components/adaptive/CodeBlock.tsx` — Syntax-highlighted code block with copy-to-clipboard, line numbers, and 100+ language support
- `src/components/adaptive/AdaptiveContent.tsx` — Dispatcher that renders the correct component based on Gemini's JSON response
- `src/components/chat/ChatMessage.tsx` — User and assistant message bubble component
- `src/components/chat/ChatPanel.tsx` — Slide-in chat panel with message history, typing indicators, query suggestions, and clear conversation
- `src/components/chat/FloatingChatButton.tsx` — Bottom-right floating action button to open/close chat with tooltip
- `src/app/app/page.tsx` — Main app page with split layout: tabbed adaptive content area (left) + chat panel (right)
- `src/components/landing/Hero.tsx` — Landing page hero with animated CTA, feature preview mockup, and gradient effects
- `src/components/landing/Features.tsx` — Landing page features grid with 6 feature cards
- `src/app/page.tsx` — Landing page combining navbar, Hero, Features, CTA section, and footer
- `src/app/globals.css` — Custom CSS: dark theme base, `animate-fadeIn` keyframe, thin scrollbar utilities
- `.env.local.example` — Example environment file documenting `GEMINI_API_KEY`
- `.gitignore` — Updated to ignore `.env.local`, macOS system files
- `README.md` — Full project documentation with setup instructions, structure, and deployment guide
- `CHANGELOG.md` — This file
