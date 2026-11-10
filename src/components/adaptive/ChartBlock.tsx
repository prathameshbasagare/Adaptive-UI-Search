// File: ./src/components/adaptive/ChartBlock.tsx

"use client";

import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
  type ChartData as CJSChartData,
  type ChartOptions,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import type { ChartData } from "@/lib/types";
import { useThemeStore, THEME_COLORS } from "@/hooks/useThemeStore";

// Register every controller explicitly. Previously only elements were
// registered, so a mixed bar+line chart only worked if a <Line> chart had
// happened to render first and register LineController as a side effect.
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarController,
  LineController,
  PieController,
  DoughnutController,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

const PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#f97316", "#a3e635", "#8b5cf6", "#06b6d4"];

function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const TOOLTIP = {
  backgroundColor: "#1e293b",
  titleColor: "#f1f5f9",
  bodyColor: "#cbd5e1",
  borderColor: "#334155",
  borderWidth: 1,
  padding: 10,
};

const LEGEND_LABELS = { color: "#cbd5e1", font: { size: 12 }, padding: 16, usePointStyle: true, boxWidth: 8 };

const compact = new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 });

interface ChartBlockProps {
  chartType?: "bar" | "line" | "pie" | "doughnut";
  chartData: ChartData;
  chartTitle?: string;
}

export default function ChartBlock({ chartType = "bar", chartData, chartTitle }: ChartBlockProps) {
  // Re-render on theme change so the primary series follows the accent colour.
  const theme = useThemeStore((s) => s.theme);
  const palette = useMemo(() => [THEME_COLORS[theme].hex, ...PALETTE.filter((c) => c !== THEME_COLORS[theme].hex)], [theme]);

  const isRadial = chartType === "pie" || chartType === "doughnut";
  const isMixed = !isRadial && chartData.datasets.some((ds) => ds.type && ds.type !== chartType);
  const multiSeries = chartData.datasets.length > 1;

  const data = useMemo(() => {
    const datasets = chartData.datasets.map((ds, i) => {
      if (isRadial) {
        // One colour per slice — a single colour made every slice identical.
        const colors = chartData.labels.map((_, j) => palette[(j + i) % palette.length]);
        return {
          ...ds,
          type: undefined,
          backgroundColor: ds.backgroundColor ?? colors.map((c) => withAlpha(c, 0.85)),
          borderColor: ds.borderColor ?? "#0f172a",
          borderWidth: 2,
          hoverOffset: 6,
        };
      }
      const base = palette[i % palette.length];
      const kind = ds.type ?? chartType;
      return {
        ...ds,
        type: kind,
        backgroundColor: ds.backgroundColor ?? withAlpha(base, kind === "line" ? 0.15 : 0.75),
        borderColor: ds.borderColor ?? base,
        borderWidth: 2,
        borderRadius: kind === "bar" ? 6 : undefined,
        fill: kind === "line" && !multiSeries,
        tension: 0.35,
        pointRadius: kind === "line" ? 3 : undefined,
        pointBackgroundColor: base,
        // Lines drawn over bars in mixed charts.
        order: kind === "line" ? 0 : 1,
      };
    });
    return { labels: chartData.labels, datasets } as unknown as CJSChartData;
  }, [chartData, chartType, isRadial, multiSeries, palette]);

  const options = useMemo<ChartOptions>(() => {
    if (isRadial) {
      return {
        responsive: true,
        maintainAspectRatio: false,
        cutout: chartType === "doughnut" ? "60%" : undefined,
        plugins: { legend: { position: "bottom", labels: LEGEND_LABELS }, tooltip: TOOLTIP },
      } as ChartOptions;
    }
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: multiSeries, labels: { ...LEGEND_LABELS, sort: (a: { datasetIndex?: number }, b: { datasetIndex?: number }) => (a.datasetIndex ?? 0) - (b.datasetIndex ?? 0) } },
        tooltip: TOOLTIP,
      },
      scales: {
        x: { ticks: { color: "#94a3b8", maxRotation: 45, autoSkip: true }, grid: { display: false } },
        y: {
          beginAtZero: true,
          ticks: { color: "#94a3b8", callback: (v: string | number) => (typeof v === "number" ? compact.format(v) : v) },
          grid: { color: "rgba(51,65,85,0.5)" },
        },
      },
    } as ChartOptions;
  }, [chartType, isRadial, multiSeries]);

  const rootType = isRadial ? chartType : isMixed ? "bar" : chartType;

  return (
    <figure className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 sm:p-6">
      {chartTitle && <figcaption className="text-white font-semibold text-base mb-4">{chartTitle}</figcaption>}
      {/* Chart.js needs a positioned, explicitly sized parent to be responsive. */}
      <div className={`relative w-full ${isRadial ? "h-72" : "h-64 sm:h-72"}`}>
        <Chart type={rootType} data={data} options={options} aria-label={chartTitle ?? `${chartType} chart`} role="img" />
      </div>
    </figure>
  );
}
