# Suggested Components & Blocks for AdaptiveUI

This document outlines high-impact UI blocks and components proposed for future iterations of the AdaptiveUI Search engine. Each component is designed to elevate the canvas from plain text into rich, interactive, and visually stunning interfaces.

---

## Component Index

1. [Pricing Table (`pricing_table`)](#1-pricing-table-pricing_table)
2. [Interactive Checklist (`checklist`)](#2-interactive-checklist-checklist)
3. [Project & File Tree (`file_tree`)](#3-project--file-tree-file_tree)
4. [Radial Metric Gauge (`metric_gauge`)](#4-radial-metric-gauge-metric_gauge)
5. [Kanban Board (`kanban_board`)](#5-kanban-board-kanban_board)
6. [Curated Resource Directory (`resource_hub`)](#6-curated-resource-directory-resource_hub)
7. [Testimonials & Review Wall (`testimonial_cards`)](#7-testimonials--review-wall-testimonial_cards)
8. [Interactive Parameter Calculator (`calculator`)](#8-interactive-parameter-calculator-calculator)
9. [Tech Stack Radar (`tech_radar`)](#9-tech-stack-radar-tech_radar)

---

### 1. Pricing Table (`pricing_table`)

#### Description
A modern multi-tier card grid (e.g. *Hobby*, *Pro*, *Enterprise*) showcasing pricing, billing intervals (monthly/annual), feature checkmark lists, highlighted "Popular" badges, and action buttons.

#### Target Queries
- *"Supabase vs Firebase pricing"*
- *"Vercel Pro tier limits and cost"*
- *"Compare GitHub Copilot vs Cursor subscription models"*

#### TypeScript Schema
```typescript
export interface PricingTier {
  name: string;
  price: string;
  billingPeriod?: string; // e.g., "/month", "/user/mo", "one-time"
  description: string;
  badge?: string; // e.g., "Most Popular", "Best Value"
  isHighlighted?: boolean;
  features: {
    text: string;
    included: boolean;
    tooltip?: string;
  }[];
  ctaText?: string;
  ctaLink?: string;
}

export interface PricingTableDef {
  type: "pricing_table";
  tableTitle?: string;
  billingToggle?: boolean; // toggle between monthly / annual
  tiers: PricingTier[];
}
```

#### Visual Layout
- Responsive 3-column grid (`grid-cols-1 md:grid-cols-3 gap-6`).
- The highlighted tier has a glowing border (`var(--theme-500)`), raised elevation, and a distinct top accent badge.

---

### 2. Interactive Checklist (`checklist`)

#### Description
An actionable list of tasks with interactive checkboxes that users can tick off directly on the canvas, paired with an animated progress bar displaying completion status.

#### Target Queries
- *"Production launch checklist for Next.js"*
- *"SEO optimization checklist for web apps"*
- *"Steps to secure an AWS EC2 instance"*

#### TypeScript Schema
```typescript
export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  category?: string; // e.g., "Performance", "Security"
  completed?: boolean;
  priority?: "high" | "medium" | "low";
}

export interface ChecklistDef {
  type: "checklist";
  checklistTitle: string;
  items: ChecklistItem[];
}
```

#### Interactivity
- Local state handles checkbox toggling.
- Progress bar dynamically recalculates percentage: `(completedCount / totalCount) * 100%`.

---

### 3. Project & File Tree (`file_tree`)

#### Description
A collapsible nested directory tree component with file-type iconography (TypeScript, CSS, JSON, config files, folders) and optional inline explanatory tooltips.

#### Target Queries
- *"Scalable folder structure for Next.js App Router"*
- *"How to organize a monorepo with Turborepo"*
- *"Django project layout best practices"*

#### TypeScript Schema
```typescript
export interface FileNode {
  name: string;
  type: "file" | "directory";
  description?: string; // inline note on what this file does
  children?: FileNode[]; // for directories
}

export interface FileTreeDef {
  type: "file_tree";
  treeTitle?: string;
  root: FileNode[];
}
```

#### Visual Layout
- Monospaced typography with syntax colored icons (Lucide `Folder`, `FileCode`, `FileJson`, etc.).
- Expand/collapse toggle arrows for directories.
- Click to view file description in a side popover or modal.

---

### 4. Radial Metric Gauge (`metric_gauge`)

#### Description
A circular or semi-circular speedometer-style SVG gauge rendering a numeric score (0 to 100), color gradients (green/amber/red), and descriptive status ratings.

#### Target Queries
- *"Lighthouse audit score for mobile web"*
- *"Security score breakdown for JWT authentication"*
- *"System health and uptime metrics"*

#### TypeScript Schema
```typescript
export interface MetricGaugeItem {
  label: string;
  value: number; // 0 to 100
  maxValue?: number; // defaults to 100
  unit?: string; // e.g., "%", "/100", "ms"
  statusLabel?: string; // e.g., "Good", "Needs Improvement", "Poor"
  color?: "emerald" | "amber" | "rose" | "cyan" | "violet";
  submetrics?: { label: string; value: string }[];
}

export interface MetricGaugeDef {
  type: "metric_gauge";
  gaugeTitle?: string;
  gauges: MetricGaugeItem[];
}
```

---

### 5. Kanban Board (`kanban_board`)

#### Description
Multi-column workflow board (*Backlog*, *In Progress*, *Review*, *Done*) showcasing task cards with priority tags, avatars, and dates.

#### Target Queries
- *"SaaS MVP roadmap in 4 weeks"*
- *"Agile sprint plan for refactoring authentication"*
- *"Content marketing release schedule"*

#### TypeScript Schema
```typescript
export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  tag?: string;
  priority?: "low" | "medium" | "high";
  assignee?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  cards: KanbanCard[];
}

export interface KanbanBoardDef {
  type: "kanban_board";
  boardTitle?: string;
  columns: KanbanColumn[];
}
```

---

### 6. Curated Resource Directory (`resource_hub`)

#### Description
Compact bookmark cards featuring platform icons (GitHub, Documentation, YouTube, NPM), short summaries, tags, and clickable outbound link chips.

#### Target Queries
- *"Best libraries for React animations in 2026"*
- *"Top tools for Postgres database monitoring"*
- *"Learning resources for Rust programming"*

#### TypeScript Schema
```typescript
export interface ResourceItem {
  title: string;
  description: string;
  url: string;
  platform?: "github" | "docs" | "video" | "package" | "website";
  stars?: string; // e.g., "45.2k ★"
  badge?: string; // e.g., "Recommended", "Official"
  tags?: string[];
}

export interface ResourceHubDef {
  type: "resource_hub";
  hubTitle?: string;
  resources: ResourceItem[];
}
```

---

### 7. Testimonials & Review Wall (`testimonial_cards`)

#### Description
Social proof masonry or grid cards featuring user avatar initials, user names, roles/companies, star ratings (⭐⭐⭐⭐⭐), and verified quotes.

#### Target Queries
- *"Developer consensus on Tailwind CSS vs styled-components"*
- *"Customer reviews for Claude vs GPT-4"*
- *"User sentiment for Apple Vision Pro"*

#### TypeScript Schema
```typescript
export interface TestimonialItem {
  author: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  rating?: number; // 1 to 5
  quote: string;
  sentiment?: "positive" | "mixed" | "critical";
  verified?: boolean;
}

export interface TestimonialCardsDef {
  type: "testimonial_cards";
  wallTitle?: string;
  testimonials: TestimonialItem[];
}
```

---

### 8. Interactive Parameter Calculator (`calculator`)

#### Description
A live mathematical estimation card with sliders or input fields that dynamically update an output calculation in real-time.

#### Target Queries
- *"Estimate monthly cost for AWS S3 storage"*
- *"AI token cost calculator for 1M requests"*
- *"Team seat pricing calculator"*

#### TypeScript Schema
```typescript
export interface CalculatorInput {
  id: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export interface CalculatorFormula {
  outputLabel: string;
  outputUnit: string;
  formula: string; // e.g. "storage_gb * 0.023 + requests_k * 0.0004"
}

export interface CalculatorDef {
  type: "calculator";
  calcTitle: string;
  description?: string;
  inputs: CalculatorInput[];
  formula: CalculatorFormula;
}
```

---

### 9. Tech Stack Radar (`tech_radar`)

#### Description
Quadrant-based classification inspired by ThoughtWorks Technology Radar, organizing tools into *Adopt*, *Trial*, *Assess*, and *Hold*.

#### Target Queries
- *"Modern frontend engineering tech radar"*
- *"Which database should I use for real-time apps?"*
- *"State of AI development frameworks"*

#### TypeScript Schema
```typescript
export type RadarRing = "adopt" | "trial" | "assess" | "hold";

export interface RadarItem {
  name: string;
  category: "languages" | "frameworks" | "infrastructure" | "data";
  ring: RadarRing;
  description?: string;
}

export interface TechRadarDef {
  type: "tech_radar";
  radarTitle?: string;
  items: RadarItem[];
}
```

---

## Implementation Roadmap

| Priority | Component | Complexity | Primary Use Case |
|---|---|---|---|
| **P1** | `pricing_table` | Low-Medium | SaaS comparisons, pricing breakdowns |
| **P1** | `checklist` | Low | Step-by-step interactive task tracking |
| **P2** | `metric_gauge` | Medium | Audit scores, benchmark results |
| **P2** | `file_tree` | Medium | Project directory setup guides |
| **P3** | `kanban_board` | Medium | Roadmaps and agile milestone planning |
| **P3** | `resource_hub` | Low | Tool directories and curated bookmarks |
| **P4** | `calculator` | Medium-High | Cloud cost and token pricing modeling |
