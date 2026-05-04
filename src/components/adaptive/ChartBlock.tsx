// File: ./src/components/adaptive/ChartBlock.tsx

"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Pie, Doughnut, Chart } from "react-chartjs-2";
import { useThemeStore } from "@/hooks/useThemeStore";
import type { ChartData } from "@/lib/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CHART_COLORS = [
  "rgba(139, 92, 246, 0.8)",
  "rgba(59, 130, 246, 0.8)",
  "rgba(16, 185, 129, 0.8)",
  "rgba(245, 158, 11, 0.8)",
  "rgba(239, 68, 68, 0.8)",
  "rgba(236, 72, 153, 0.8)",
  "rgba(20, 184, 166, 0.8)",
  "rgba(249, 115, 22, 0.8)",
];

const CHART_BORDER_COLORS = CHART_COLORS.map((c) => c.replace("0.8", "1"));

function enrichChartData(data: ChartData): ChartData {
  return {
    ...data,
    datasets: data.datasets.map((ds, i) => ({
      ...ds,
      backgroundColor: ds.backgroundColor ?? CHART_COLORS[i % CHART_COLORS.length],
      borderColor: ds.borderColor ?? CHART_BORDER_COLORS[i % CHART_BORDER_COLORS.length],
      borderWidth: 2,
    })),
  };
}

const getCommonOptions = (mode: "light" | "dark") => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: { color: mode === "light" ? "#475569" : "#cbd5e1", font: { size: 12 }, padding: 16 },
    },
    tooltip: {
      backgroundColor: mode === "light" ? "#ffffff" : "#1e293b",
      titleColor: mode === "light" ? "#0f172a" : "#f1f5f9",
      bodyColor: mode === "light" ? "#475569" : "#cbd5e1",
      borderColor: mode === "light" ? "#e2e8f0" : "#334155",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: mode === "light" ? "#64748b" : "#94a3b8" },
      grid: { color: mode === "light" ? "rgba(203,213,225,0.6)" : "rgba(51,65,85,0.6)" },
    },
    y: {
      ticks: { color: mode === "light" ? "#64748b" : "#94a3b8" },
      grid: { color: mode === "light" ? "rgba(203,213,225,0.6)" : "rgba(51,65,85,0.6)" },
    },
  },
});

const getPieOptions = (mode: "light" | "dark") => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { color: mode === "light" ? "#475569" : "#cbd5e1", font: { size: 12 }, padding: 16 },
    },
    tooltip: {
      backgroundColor: mode === "light" ? "#ffffff" : "#1e293b",
      titleColor: mode === "light" ? "#0f172a" : "#f1f5f9",
      bodyColor: mode === "light" ? "#475569" : "#cbd5e1",
      borderColor: mode === "light" ? "#e2e8f0" : "#334155",
      borderWidth: 1,
    },
  },
});

interface ChartBlockProps {
  chartType?: "bar" | "line" | "pie" | "doughnut";
  chartData: ChartData;
  chartTitle?: string;
}

export default function ChartBlock({ chartType = "bar", chartData, chartTitle }: ChartBlockProps) {
  const { mode } = useThemeStore();
  const enriched = enrichChartData(chartData);

  const titlePlugin = chartTitle
    ? {
        title: {
          display: true,
          text: chartTitle,
          color: mode === "light" ? "#0f172a" : "#e2e8f0",
          font: { size: 14, weight: "bold" as const },
        },
      }
    : {};

  // Mixed chart: at least one dataset has its own type override
  const isMixed = enriched.datasets.some((ds) => ds.type && ds.type !== chartType);
  const common = getCommonOptions(mode);
  const pie = getPieOptions(mode);

  return (
    <div className="bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl p-6">
      {chartTitle && (
        <h3 className="text-slate-950 dark:text-white font-semibold text-base mb-4">{chartTitle}</h3>
      )}
      <div className="w-full max-h-80 flex items-center justify-center">
        {isMixed ? (
          // Mixed chart renders datasets with their individual type overrides
          <Chart
            type="bar"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={enriched as any}
            options={{
              ...common,
              plugins: { ...common.plugins, ...titlePlugin },
            }}
          />
        ) : chartType === "bar" ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Bar data={enriched as any} options={{ ...common, plugins: { ...common.plugins, ...titlePlugin } }} />
        ) : chartType === "line" ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Line data={enriched as any} options={{ ...common, plugins: { ...common.plugins, ...titlePlugin } }} />
        ) : chartType === "pie" ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Pie data={enriched as any} options={{ ...pie, plugins: { ...pie.plugins, ...titlePlugin } }} />
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Doughnut data={enriched as any} options={{ ...pie, plugins: { ...pie.plugins, ...titlePlugin } }} />
        )}
      </div>
    </div>
  );
}
