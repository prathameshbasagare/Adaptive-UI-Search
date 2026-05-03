# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
