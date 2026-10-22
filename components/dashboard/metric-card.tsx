import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: "indigo" | "emerald" | "amber" | "rose" | "purple";
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "indigo",
}: MetricCardProps) {
  const accentClasses = {
    indigo: "from-indigo-500/20 to-indigo-500/0 text-indigo-400 border-indigo-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-400 border-emerald-500/20",
    amber: "from-amber-500/20 to-amber-500/0 text-amber-400 border-amber-500/20",
    rose: "from-rose-500/20 to-rose-500/0 text-rose-400 border-rose-500/20",
    purple: "from-purple-500/20 to-purple-500/0 text-purple-400 border-purple-500/20",
  }[accentColor];

  const iconBgClasses = {
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  }[accentColor];

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-[var(--bg-card)] border border-[var(--border-theme)] p-5 shadow-lg hover:border-[var(--accent-theme)]/50 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${accentClasses} blur-2xl pointer-events-none opacity-50`} />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${iconBgClasses}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-semibold tracking-tight text-[var(--text-main)] font-mono">
          {value}
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-rose-500/10 text-rose-500"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-2 text-xs text-[var(--text-muted)] truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
}
