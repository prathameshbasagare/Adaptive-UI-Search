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

const commonOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: { color: "#cbd5e1", font: { size: 12 }, padding: 16 },
    },
    tooltip: {
      backgroundColor: "#1e293b",
      titleColor: "#f1f5f9",
      bodyColor: "#cbd5e1",
      borderColor: "#334155",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: "#94a3b8" },
      grid: { color: "rgba(51,65,85,0.6)" },
    },
    y: {
      ticks: { color: "#94a3b8" },
      grid: { color: "rgba(51,65,85,0.6)" },
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { color: "#cbd5e1", font: { size: 12 }, padding: 16 },
    },
    tooltip: {
      backgroundColor: "#1e293b",
      titleColor: "#f1f5f9",
      bodyColor: "#cbd5e1",
      borderColor: "#334155",
      borderWidth: 1,
    },
  },
};

interface ChartBlockProps {
  chartType?: "bar" | "line" | "pie" | "doughnut";
  chartData: ChartData;
  chartTitle?: string;
}

export default function ChartBlock({ chartType = "bar", chartData, chartTitle }: ChartBlockProps) {
  const enriched = enrichChartData(chartData);

  const titlePlugin = chartTitle
    ? {
        title: {
          display: true,
          text: chartTitle,
          color: "#e2e8f0",
          font: { size: 14, weight: "bold" as const },
        },
      }
    : {};

  // Mixed chart: at least one dataset has its own type override
  const isMixed = enriched.datasets.some((ds) => ds.type && ds.type !== chartType);

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
      {chartTitle && (
        <h3 className="text-white font-semibold text-base mb-4">{chartTitle}</h3>
      )}
      <div className="w-full max-h-80 flex items-center justify-center">
        {isMixed ? (
          // Mixed chart renders datasets with their individual type overrides
          <Chart
            type="bar"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data={enriched as any}
            options={{
              ...commonOptions,
              plugins: { ...commonOptions.plugins, ...titlePlugin },
            }}
          />
        ) : chartType === "bar" ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Bar data={enriched as any} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, ...titlePlugin } }} />
        ) : chartType === "line" ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Line data={enriched as any} options={{ ...commonOptions, plugins: { ...commonOptions.plugins, ...titlePlugin } }} />
        ) : chartType === "pie" ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Pie data={enriched as any} options={{ ...pieOptions, plugins: { ...pieOptions.plugins, ...titlePlugin } }} />
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Doughnut data={enriched as any} options={{ ...pieOptions, plugins: { ...pieOptions.plugins, ...titlePlugin } }} />
        )}
      </div>
    </div>
  );
}
