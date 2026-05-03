# AdaptiveUI — AI-Powered Adaptive Search

An intelligent chatbot that generates fully adaptive, dynamic UI components in real time — powered by Google Gemini 2.0 Flash.

## What it does

Ask any question in the chat panel. The AI decides what kind of UI to render:

- **Rich text** — headings, lists, tables, formatted Markdown
- **Card grids** — feature comparisons, product listings, topic overviews
- **Interactive charts** — bar, line, pie, and doughnut charts with live data
- **Code blocks** — syntax-highlighted, copy-ready code for 100+ languages

Each query opens a new tab in the content area so you can compare and revisit previous responses.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Google Gemini 2.0 Flash |
| State | Zustand |
| Charts | Chart.js + react-chartjs-2 |
| Code highlighting | react-syntax-highlighter |
| Markdown | react-markdown |
| Icons | Lucide React |

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd adaptive-ui-chatbot
npm install
```

### 2. Set up your Gemini API key

Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey), then:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and replace `your_gemini_api_key_here` with your actual key:

```
GEMINI_API_KEY=AIza...
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    page.tsx                  ← Landing page
    app/
      page.tsx                ← Main app (split layout)
    api/
      chat/
        route.ts              ← POST /api/chat (Gemini integration)
  components/
    landing/
      Hero.tsx                ← Landing hero section
      Features.tsx            ← Feature cards grid
    chat/
      FloatingChatButton.tsx  ← Bottom-right floating trigger
      ChatPanel.tsx           ← Slide-in chat panel
      ChatMessage.tsx         ← Individual message bubble
    adaptive/
      AdaptiveContent.tsx     ← Component dispatcher
      TextBlock.tsx           ← Markdown renderer
      CardGrid.tsx            ← Responsive card grid
      ChartBlock.tsx          ← Chart.js wrapper
      CodeBlock.tsx           ← Syntax-highlighted code
  lib/
    types.ts                  ← Shared TypeScript types
    gemini.ts                 ← Gemini SDK wrapper + system prompt
  hooks/
    useChatStore.ts           ← Zustand store (chat + tab state)
```

## How the AI Generation Works

1. User submits a query in the chat panel
2. `POST /api/chat` sends it to Gemini with a strict system prompt
3. Gemini returns a JSON object matching `AdaptiveUIResponse` — no prose, just structured data
4. The client renders the JSON using the appropriate component (text, cards, chart, code)
5. A new tab is created in the content area with the result

### AdaptiveUIResponse schema

```typescript
interface AdaptiveUIResponse {
  tabTitle: string;
  summary?: string;
  components: ComponentDef[];
}

// ComponentDef can be: text | cards | chart | code
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key from AI Studio | Yes |

## Deployment

Deploy to [Vercel](https://vercel.com) with one click:

1. Push to GitHub
2. Import the repo in Vercel
3. Add `GEMINI_API_KEY` to environment variables
4. Deploy

## License

MIT
