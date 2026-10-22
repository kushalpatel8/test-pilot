import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { ReportService } from "@/services/report.service";
import { Header } from "@/components/dashboard/header";
import { TestRunStatusBadge } from "@/components/test-runs/test-run-status-badge";
import { AiSummaryCard } from "@/components/reports/ai-summary-card";
import { FindingsList } from "@/components/reports/findings-list";
import { ExportButton } from "@/components/reports/export-button";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  GitBranch,
  GitCommit,
  Clock,
  Terminal,
  CheckCircle2,
  XCircle,
  FileCheck,
  Lightbulb,
} from "lucide-react";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const { runId } = await params;
  let reportData;
  try {
    reportData = await ReportService.getReportForRun(user.id, runId);
  } catch {
    notFound();
  }

  if (!reportData) {
    notFound();
  }

  const passRate =
    reportData.totalTests > 0
      ? Math.round((reportData.passedTests / reportData.totalTests) * 100)
      : 100;

  const aiAnalysis = reportData.qaReport?.analysisJson as any;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Comprehensive QA Test Report"
        subtitle={`${reportData.repository.fullName} • Commit ${reportData.commitSha.slice(0, 7)}`}
        action={<ExportButton runId={reportData.id} />}
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Status & Metrics Bar */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <TestRunStatusBadge status={reportData.status} />
              <span className="text-lg font-semibold text-white">
                {reportData.repository.fullName}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
                {reportData.branch}
              </span>
              <span className="flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5 text-neutral-400" />
                {reportData.commitSha.slice(0, 7)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {reportData.durationMs ? `${(reportData.durationMs / 1000).toFixed(2)}s` : "-"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center w-full md:w-auto">
            <div className="px-4 py-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <div className="text-2xl font-bold font-mono text-indigo-400">{passRate}%</div>
              <div className="text-[10px] uppercase font-semibold text-neutral-400">Pass Rate</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <div className="text-2xl font-bold font-mono text-emerald-400">{reportData.passedTests}</div>
              <div className="text-[10px] uppercase font-semibold text-neutral-400">Passed</div>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-neutral-950/80 border border-neutral-800">
              <div className="text-2xl font-bold font-mono text-rose-400">{reportData.failedTests}</div>
              <div className="text-[10px] uppercase font-semibold text-neutral-400">Failed</div>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        {aiAnalysis ? (
          <AiSummaryCard analysis={aiAnalysis} />
        ) : (
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-6 text-center text-xs text-neutral-400">
            AI analysis currently queued or generating. Refresh in a few moments.
          </div>
        )}

        {/* AI Findings List */}
        {aiAnalysis?.findings && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-400" />
              <span>Identified Issues & Defect Severity</span>
            </h3>
            <FindingsList findings={aiAnalysis.findings} />
          </div>
        )}

        {/* Suggested Additional QA Test Cases */}
        {aiAnalysis?.suggestedTestCases && aiAnalysis.suggestedTestCases.length > 0 && (
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Recommended Test Case Expansion</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiAnalysis.suggestedTestCases.map((tc: any, i: number) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-950/70 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{tc.title}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {tc.type}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{tc.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Result Assertions Breakdown */}
        {reportData.testResults.length > 0 && (
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400" />
              <span>Individual Test Assertions ({reportData.testResults.length})</span>
            </h3>

            <div className="divide-y divide-neutral-800/60">
              {reportData.testResults.map((result) => {
                const isPassed = result.status === "PASSED";

                return (
                  <div key={result.id} className="py-3 flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span className="font-semibold text-white font-mono">{result.testName}</span>
                        <span className="text-[11px] text-neutral-500 font-mono">({result.testFile})</span>
                      </div>
                      <span className="text-neutral-400 font-mono">{result.durationMs}ms</span>
                    </div>

                    {result.errorMessage && (
                      <div className="mt-1.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px] whitespace-pre-wrap">
                        {result.errorMessage}
                        {result.stackTrace && (
                          <div className="mt-2 pt-2 border-t border-rose-500/20 text-neutral-400 text-[10px]">
                            {result.stackTrace}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Execution Output Logs */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950 p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-white font-mono uppercase tracking-wider">
                Full Execution Transcript & Console Output
              </span>
            </div>
            <Link
              href={`/test-runs/${reportData.id}`}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Inspect Terminal Details →
            </Link>
          </div>

          <pre className="font-mono text-xs text-neutral-300 overflow-x-auto whitespace-pre-wrap max-h-80 leading-relaxed p-2">
            {reportData.logs || "No stdout logs stored for this run."}
          </pre>
        </div>
      </main>
    </div>
  );
}
