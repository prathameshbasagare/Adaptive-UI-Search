# AdaptiveUI — AI-Powered Adaptive Search

Ask a question and get back a generated, interactive interface instead of a wall of text. The model chooses a layout (bento, dashboard, docs, split or stream) and composes it from 26 component types: charts, flow diagrams, comparisons, quizzes, timelines, maps and more. Components stream in as soon as each one is complete.

## Features

- **Streaming generation.** The server parses the model's JSON incrementally and pushes each component to the browser as soon as its closing brace arrives.
- **Multi-provider fallback.** It tries a custom OpenAI-compatible endpoint, then OpenRouter, then Gemini. A provider that's down or rejecting the key can't block the others.
- **Schema-validated output.** Every component is checked against a Zod schema. Invalid items are dropped, numeric strings are coerced, and a malformed block is removed instead of crashing the page. Each block also renders inside its own error boundary.
- **Follow-ups.** Recent results are sent back to the model, so "add a chart to that" works.
- **Tabs and layouts.** Each query opens a tab, and you can switch a result between the five layouts. Tabs are saved locally and re-validated when loaded.
- **Themes.** Six accent colours, applied before first paint.
- **Showcase blocks.** Scroll- and hover-driven components built with GSAP ScrollTrigger: a parallax hero, scroll story (pinned scrollytelling), pinned horizontal gallery, stacking cards, word-by-word text reveal, count-up number ticker, expanding hover panels, spotlight/tilt cards and a marquee. All of them respect `prefers-reduced-motion`.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict) |
| Validation | Zod 4 |
| Styling | Tailwind CSS 4 |
| AI | Custom OpenAI-compatible endpoint, OpenRouter, Google Gemini/Gemma |
| State | Zustand (persisted) |
| Charts | Chart.js + react-chartjs-2 |
| Tests | Vitest |

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in at least one provider
npm run dev
```

Open <http://localhost:3000>.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm test` | Unit tests (schemas, stream parser, flow layout, provider planning) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

## Environment variables

At least one AI provider is required.

| Variable | Description |
|---|---|
| `BASE_URL`, `API_KEY` | Custom OpenAI-compatible endpoint, tried first |
| `CUSTOM_MODELS` | Comma-separated model names for the custom endpoint (default `auto,claude-sonnet-4-5,gemini-3.8-flash,qwen3.8-max`) |
| `CUSTOM_JSON_MODE` | `true` to send `response_format: json_object`. Off by default because some gateways stop streaming when it's set |
| `OPENROUTER_API_KEY` | OpenRouter key |
| `GEMINI_API_KEY` | Google AI Studio key |
| `PEXELS_API_KEY` | Optional; enables the `image_gallery` component |
| `AI_MAX_ATTEMPTS` | Total model attempts per request (default 5) |
| `AI_MODELS_PER_PROVIDER` | Models tried per provider before moving on (default 2) |
| `AI_ATTEMPT_TIMEOUT_MS` / `AI_FIRST_TOKEN_TIMEOUT_MS` | Per-attempt timeouts (default 90 s / 30 s) |
| `CHAT_RATE_LIMIT_PER_MIN` / `IMAGES_RATE_LIMIT_PER_MIN` | Per-IP limits (default 10 / 30) |

> **Rate limiting is in-memory and per server instance,** and it identifies clients by `x-real-ip` or the rightmost `x-forwarded-for` hop. Run it behind a reverse proxy (Vercel, nginx, …) so those headers can't be spoofed. That's fine for a single Node server. On serverless or multi-instance hosting, replace `src/lib/rate-limit.ts` with a shared store such as Upstash Redis.

## How generation works

1. The client sends `POST /api/chat` with `{ query, history }`. History is validated, trimmed to a character budget and normalised to alternating turns.
2. `buildAttemptPlan()` picks models from the configured providers in priority order.
3. The provider's token stream is fed into `ComponentStreamScanner`. Each completed component is validated and sent to the client as an NDJSON `component` event.
4. When the stream ends, the full document is parsed and validated (`validateResponse`), and a `done` event carries the final response. If the document as a whole is broken but valid components already streamed in, those components are kept.
5. If an attempt fails, a `reset` event clears its partial output and the next model is tried. If every attempt fails, the error reports the most useful cause (rate limit, timeout, unavailable).

### Showcase blocks (`src/components/adaptive/showcase/`)

| Type | Interaction |
|---|---|
| `parallax_hero` | Layers drift at different speeds on scroll and follow the pointer; headline reveals word by word |
| `scroll_story` | Sticky stage swaps its visual/stat as each chapter crosses the middle of the viewport |
| `horizontal_scroll` | Section pins while vertical scroll moves the panels sideways (native swipe on mobile) |
| `stacking_cards` | Cards stick and stack; covered cards shrink and dim |
| `text_reveal` | Words light up as the statement scrolls through the viewport |
| `number_ticker` | KPIs count up when scrolled into view; optional progress ring |
| `hover_panels` | The hovered or focused panel expands to show details |
| `spotlight_cards` | Cursor-following spotlight, glowing border and 3D tilt |
| `marquee` | Infinite chip ticker that pauses on hover and reveals details |

Notes for working on these:
- Results scroll inside `#result-panel`, not the window. Always pass `scroller: getScroller()` (from `src/lib/motion.ts`) to ScrollTrigger.
- Use `gsap.fromTo` with explicit end values, and never put a CSS `transition` on an element GSAP animates. In dev, StrictMode re-runs effects, so a `from()` tween can capture a mid-transition value as its end state. Put hover transitions on an inner wrapper instead.
- Pinning uses CSS `position: sticky`, with ScrollTrigger only scrubbing progress. Don't add `overflow: hidden` between a sticky element and the scroller.

### Adding a component type

1. Add an entry (Zod schema + prompt example) to `COMPONENT_REGISTRY` in `src/lib/schemas.ts`.
2. Add a `case` to `renderInner` in `src/components/adaptive/AdaptiveContent.tsx`. TypeScript reports an error until you do.

The test suite checks that every registry prompt example passes its own schema.

## Project structure

```
src/
  app/
    api/chat/route.ts        NDJSON streaming endpoint (validation, rate limit)
    api/images/route.ts      Pexels proxy
    app/page.tsx             Main canvas: tabs, layouts, empty state
    error.tsx, app/loading.tsx
  components/
    adaptive/                One file per component + AdaptiveContent (layout engine)
    chat/                    Chat panel, messages, floating button
  contexts/ModalContext.tsx  Accessible dialog
  hooks/                     Zustand stores + hydration hook
  lib/
    schemas.ts               Component registry: Zod schemas, types, prompt examples
    validate.ts              Response validation + orphan repair
    json-stream.ts           Incremental component scanner + JSON extraction
    ai-provider.ts           Provider streaming, attempt planning, fallback
    flow-layout.ts           Layered graph layout for flow diagrams
    geo.ts                   Country centroids + continent outlines for maps
    rate-limit.ts            In-memory per-IP limiter
```

## License

MIT
