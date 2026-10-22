import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { RepositoryService } from "@/services/repository.service";
import { GitHubService } from "@/services/github.service";
import { Header } from "@/components/dashboard/header";
import { RunTestDialog } from "@/components/repositories/run-test-dialog";
import { DeleteRepoDialog } from "@/components/repositories/delete-repo-dialog";
import { RecentRunsTable } from "@/components/dashboard/recent-runs-table";
import { notFound } from "next/navigation";
import { GitBranch, GitCommit, ExternalLink, Calendar } from "lucide-react";
import { format } from "date-fns";

export default async function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ repositoryId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) notFound();

  const { repositoryId } = await params;
  let repository;
  try {
    repository = await RepositoryService.getRepositoryById(user.id, repositoryId);
  } catch {
    notFound();
  }

  let branches: any[] = [];
  try {
    branches = await GitHubService.getBranches(repository.owner, repository.name);
  } catch {
    branches = [{ name: repository.defaultBranch, commit: { sha: "HEAD" } }];
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title={repository.fullName}
        subtitle="Repository configuration, branches & test run history"
        action={
          <div className="flex items-center gap-2">
            <DeleteRepoDialog
              repositoryId={repository.id}
              repositoryName={repository.fullName}
              redirectAfterDelete={true}
              variant="button"
            />
            <RunTestDialog
              repositoryId={repository.id}
              repositoryName={repository.fullName}
              defaultBranch={repository.defaultBranch}
            />
          </div>
        }
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Repo Header Card */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">{repository.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                {repository.owner}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2">
              <span className="flex items-center gap-1 font-mono">
                <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
                Default: {repository.defaultBranch}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Connected {format(new Date(repository.createdAt), "MMM d, yyyy")}
              </span>
              <a
                href={`https://github.com/` + repository.fullName}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Branches & Testing Targets */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-indigo-400" />
            <span>Target Branches</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {branches.map((b) => (
              <div
                key={b.name}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950/70 text-xs text-neutral-300 font-mono"
              >
                <span className="text-indigo-400 font-semibold">{b.name}</span>
                {b.commit?.sha && (
                  <span className="text-neutral-500 text-[11px]">
                    ({b.commit.sha.slice(0, 7)})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Historical Test Executions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Execution History ({repository.testRuns.length})
          </h3>
          <RecentRunsTable runs={repository.testRuns} />
        </div>
      </main>
    </div>
  );
}
