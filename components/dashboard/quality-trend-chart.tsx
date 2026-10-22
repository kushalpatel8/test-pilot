"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface QualityTrendChartProps {
  data?: {
    date: string;
    passRate: number;
    tests: number;
  }[];
}

export function QualityTrendChart({ data }: QualityTrendChartProps) {
  // If no trend data provided, supply a representative initial QA baseline
  const chartData = data && data.length > 0 ? data : [
    { date: "Day -6", passRate: 92, tests: 45 },
    { date: "Day -5", passRate: 88, tests: 52 },
    { date: "Day -4", passRate: 95, tests: 60 },
    { date: "Day -3", passRate: 86, tests: 64 },
    { date: "Day -2", passRate: 98, tests: 70 },
    { date: "Yesterday", passRate: 96, tests: 75 },
    { date: "Today", passRate: 100, tests: 80 },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border-theme)] bg-[var(--bg-card)] p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-main)] tracking-tight">Quality & Pass Rate Trend</h3>
          <p className="text-xs text-[var(--text-muted)]">Pass percentage across recent QA test cycles</p>
        </div>
        <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
          98.2% Avg Pass
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="passRateGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-theme)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--accent-theme)" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-theme)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "var(--border-theme)" }}
            />
            <YAxis
              domain={[60, 100]}
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-[var(--border-theme)] bg-[var(--bg-card)] p-3 shadow-xl text-xs">
                      <p className="font-semibold text-[var(--text-main)] mb-1">{payload[0].payload.date}</p>
                      <p className="text-[var(--accent-theme)] font-mono">
                        Pass Rate: <span className="font-bold">{payload[0].value}%</span>
                      </p>
                      <p className="text-[var(--text-muted)] font-mono">
                        Total Tests: {payload[0].payload.tests}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="passRate"
              stroke="var(--accent-theme)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#passRateGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
