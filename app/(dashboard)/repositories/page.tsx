import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { RepositoryService } from "@/services/repository.service";
import { Header } from "@/components/dashboard/header";
import { ConnectRepoModal } from "@/components/repositories/connect-repo-modal";
import { RunTestDialog } from "@/components/repositories/run-test-dialog";
import { DeleteRepoDialog } from "@/components/repositories/delete-repo-dialog";
import { TestRunStatusBadge } from "@/components/test-runs/test-run-status-badge";
import Link from "next/link";
import { GitBranch, GitFork, ArrowRight, Shield, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function RepositoriesPage() {
  const user = await getCurrentUser();
  const repos = user ? await RepositoryService.listUserRepositories(user.id) : [];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Connected Repositories"
        subtitle="Manage GitHub repositories configured for automated testing"
        action={<ConnectRepoModal />}
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {repos.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-12 text-center max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <GitFork className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">No Repositories Connected</h3>
            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Connect a GitHub repository to trigger isolated QA test runs, static code analysis, and OpenAI failure investigations.
            </p>
            <ConnectRepoModal />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {repos.map((repo) => (
              <div
                key={repo.id}
                className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-5 shadow-lg hover:border-neutral-700 transition space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/repositories/${repo.id}`}
                      className="text-base font-semibold text-white hover:text-indigo-400 transition"
                    >
                      {repo.fullName}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <GitBranch className="w-3 h-3 text-neutral-400" />
                        {repo.defaultBranch}
                      </span>
                      <span>•</span>
                      <span>{repo._count?.testRuns || 0} test runs</span>
                    </div>
                  </div>

                  {repo.latestRun ? (
                    <TestRunStatusBadge status={repo.latestRun.status} />
                  ) : (
                    <span className="text-xs text-neutral-400 font-mono">No runs yet</span>
                  )}
                </div>

                {repo.latestRun && (
                  <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-neutral-300">
                      <span className="text-neutral-400">Latest Outcome:</span>
                      <span className="font-mono">
                        {repo.latestRun.passedTests}/{repo.latestRun.totalTests} tests passed
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(repo.latestRun.createdAt), { addSuffix: true })}
                      </span>
                      <Link
                        href={`/reports/${repo.latestRun.id}`}
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        View QA Report →
                      </Link>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
                  <Link
                    href={`/repositories/${repo.id}`}
                    className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition"
                  >
                    <span>Details & History</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-2">
                    <DeleteRepoDialog
                      repositoryId={repo.id}
                      repositoryName={repo.fullName}
                      variant="icon"
                    />
                    <RunTestDialog
                      repositoryId={repo.id}
                      repositoryName={repo.fullName}
                      defaultBranch={repo.defaultBranch}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
