import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { TestRunService } from "@/services/test-run.service";
import { Header } from "@/components/dashboard/header";
import { TestRunStatusBadge } from "@/components/test-runs/test-run-status-badge";
import { DeveloperConsole } from "@/components/test-runs/developer-console";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  GitBranch,
  GitCommit,
  Clock,
  Sparkles,
} from "lucide-react";

export default async function TestRunDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const { runId } = await params;
  let testRun;
  try {
    testRun = await TestRunService.getTestRunById(user.id, runId);
  } catch {
    notFound();
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title={`Execution Run #${testRun.id.slice(0, 8)}`}
        subtitle={`${testRun.repository.fullName} @ ${testRun.branch}`}
        action={
          <div className="flex items-center gap-2">
            <Link
              href={`/reports/${testRun.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/30 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{testRun.qaReport ? "View QA Report" : "Generate AI QA Report"}</span>
            </Link>
          </div>
        }
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Meta Bar */}
        <div className="rounded-2xl border border-[var(--border-theme)] bg-[var(--bg-card)] p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <TestRunStatusBadge status={testRun.status} />
              <span className="text-base font-semibold text-[var(--text-main)]">
                {testRun.repository.fullName}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5" />
                {testRun.branch}
              </span>
              <span className="flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5" />
                {testRun.commitSha.slice(0, 7)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {testRun.durationMs ? `${(testRun.durationMs / 1000).toFixed(2)}s` : "In progress..."}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-center">
            <div className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-theme)]">
              <div className="text-xl font-bold font-mono text-[var(--text-main)]">{testRun.totalTests}</div>
              <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Total</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-theme)]">
              <div className="text-xl font-bold font-mono text-emerald-400">{testRun.passedTests}</div>
              <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Passed</div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[var(--bg-main)] border border-[var(--border-theme)]">
              <div className="text-xl font-bold font-mono text-rose-400">{testRun.failedTests}</div>
              <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Failed</div>
            </div>
          </div>
        </div>

        {/* Attractive Developer Console */}
        <DeveloperConsole initialTestRun={testRun} />
      </main>
    </div>
  );
}
