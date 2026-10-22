import React from "react";
import { Sparkles, ShieldCheck, AlertTriangle, ShieldAlert, Cpu } from "lucide-react";
import { AIAnalysisOutput } from "@/types/test-report";

export function AiSummaryCard({ analysis }: { analysis: AIAnalysisOutput }) {
  const assessmentConfig = {
    HEALTHY: {
      label: "Healthy Build",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: ShieldCheck,
    },
    DEGRADED: {
      label: "Degraded - Failures Observed",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: AlertTriangle,
    },
    CRITICAL_ISSUES_FOUND: {
      label: "Critical Regressions Found",
      color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      icon: ShieldAlert,
    },
    CONFIG_OR_SETUP_ERROR: {
      label: "Configuration Error",
      color: "bg-red-500/10 text-red-400 border-red-500/30",
      icon: AlertTriangle,
    },
  }[analysis.overallAssessment] || {
    label: analysis.overallAssessment,
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    icon: Sparkles,
  };

  const AssessmentIcon = assessmentConfig.icon;

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 via-neutral-900/60 to-neutral-950 p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">AI QA Intelligence Assessment</h3>
            <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
              <Cpu className="w-3 h-3 text-indigo-400" />
              Engine: <span className="font-mono text-neutral-300">{analysis.modelUsed || "OpenAI"}</span>
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${assessmentConfig.color}`}
        >
          <AssessmentIcon className="w-3.5 h-3.5" />
          {assessmentConfig.label}
        </span>
      </div>

      <div className="text-xs text-neutral-200 leading-relaxed font-sans">
        {analysis.summary}
      </div>

      {analysis.recommendedActions && analysis.recommendedActions.length > 0 && (
        <div className="pt-2">
          <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Recommended Prioritized Actions
          </div>
          <ul className="space-y-1.5 text-xs text-neutral-300">
            {analysis.recommendedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold shrink-0">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
