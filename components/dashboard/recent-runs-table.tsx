"use client";

import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { TestRunStatusBadge } from "@/components/test-runs/test-run-status-badge";
import { GitBranch, GitCommit, ArrowRight, Play, FileText } from "lucide-react";

interface RecentRunsTableProps {
  runs: any[];
}

export function RecentRunsTable({ runs }: RecentRunsTableProps) {
  if (!runs || runs.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <Play className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">No test runs executed yet</h3>
        <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-6">
          Connect your GitHub repository and trigger an automated QA run to see real-time execution results and AI analysis.
        </p>
        <Link
          href="/repositories"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
        >
          <span>Connect Repository</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-neutral-800/80 bg-neutral-950/60 text-neutral-400 font-medium uppercase tracking-wider text-[11px]">
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Repository & Commit</th>
              <th className="py-3 px-5">Results</th>
              <th className="py-3 px-5">Duration</th>
              <th className="py-3 px-5">Executed</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {runs.map((run) => {
              const passRate =
                run.totalTests > 0
                  ? Math.round((run.passedTests / run.totalTests) * 100)
                  : 100;

              return (
                <tr
                  key={run.id}
                  className="hover:bg-neutral-800/30 transition-colors group"
                >
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <TestRunStatusBadge status={run.status} />
                  </td>

                  <td className="py-3.5 px-5">
                    <div className="font-medium text-white group-hover:text-indigo-400 transition">
                      {run.repository?.fullName || "Repository"}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <GitBranch className="w-3 h-3 text-neutral-400" />
                        {run.branch}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <GitCommit className="w-3 h-3 text-neutral-400" />
                        {run.commitSha?.slice(0, 7)}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-neutral-800 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${passRate}%` }}
                        />
                        <div
                          className="bg-rose-500 h-full"
                          style={{ width: `${100 - passRate}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-neutral-200">
                        {run.passedTests}/{run.totalTests}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {run.failedTests > 0 ? (
                        <span className="text-rose-400 font-medium">
                          {run.failedTests} failed
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-medium">All tests passed</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-5 font-mono text-neutral-300 whitespace-nowrap">
                    {run.durationMs ? `${(run.durationMs / 1000).toFixed(2)}s` : "-"}
                  </td>

                  <td className="py-3.5 px-5 text-neutral-400 whitespace-nowrap text-[11px]">
                    {formatDistanceToNow(new Date(run.createdAt), { addSuffix: true })}
                  </td>

                  <td className="py-3.5 px-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/reports/${run.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-indigo-600/20 text-neutral-200 hover:text-indigo-300 border border-neutral-700/80 transition"
                      >
                        <FileText className="w-3 h-3" />
                        <span>QA Report</span>
                      </Link>
                      <Link
                        href={`/test-runs/${run.id}`}
                        className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                        title="View Execution Details"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
