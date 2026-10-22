import React from "react";
import { AIFinding } from "@/types/test-report";
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export function FindingsList({ findings }: { findings: AIFinding[] }) {
  if (!findings || findings.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-8 text-center text-xs text-neutral-400">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="font-semibold text-white">No Defects or Severity Warnings Identified</p>
        <p className="text-neutral-500 mt-1">All executed tests and static analysis rules evaluated cleanly.</p>
      </div>
    );
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "HIGH":
        return "bg-red-500/10 text-red-400 border-red-500/25";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/25";
      case "LOW":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/25";
      case "INFO":
      default:
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/25";
    }
  };

  return (
    <div className="space-y-3">
      {findings.map((finding) => (
        <div
          key={finding.id}
          className="rounded-2xl border border-[#30363D] bg-[#161B22] p-5 shadow-lg space-y-3 hover:border-[#58A6FF]/40 transition"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getSeverityBadge(
                  finding.severity
                )}`}
              >
                {finding.severity}
              </span>
              <h4 className="text-sm font-semibold text-[#E6EDF3]">{finding.title}</h4>
            </div>

            {finding.confidence && (
              <span className="text-[10px] font-mono text-[#8B949E] bg-[#0D1117] px-2 py-0.5 rounded border border-[#30363D]">
                Confidence: {finding.confidence}
              </span>
            )}
          </div>

          {finding.affectedFileOrTest && (
            <div className="text-xs font-mono text-[#58A6FF] bg-[#1F6FEB]/10 px-2.5 py-1 rounded-lg border border-[#1F6FEB]/25 inline-block">
              {finding.affectedFileOrTest}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-1">
              <span className="text-[11px] font-semibold text-[#8B949E] uppercase tracking-wider block">
                Observed Evidence
              </span>
              <p className="text-[#E6EDF3] font-mono text-[11px] whitespace-pre-wrap">
                {finding.evidence}
              </p>
            </div>

            <div className="comment-callout p-3 space-y-1">
              <span className="text-[11px] font-semibold text-[#58A6FF] uppercase tracking-wider block">
                Likely Cause & Recommendation
              </span>
              <p className="text-[#E6EDF3] mb-1.5">{finding.likelyCause}</p>
              <p className="text-[#3FB950] text-[11px] font-medium">
                → {finding.recommendedAction}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
