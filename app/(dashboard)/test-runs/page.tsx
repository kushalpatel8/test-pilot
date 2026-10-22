import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { TestRunService } from "@/services/test-run.service";
import { Header } from "@/components/dashboard/header";
import { RecentRunsTable } from "@/components/dashboard/recent-runs-table";
import { TestRunStatus } from "@prisma/client";

export default async function TestRunsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; repositoryId?: string }>;
}) {
  const user = await getCurrentUser();
  const { status, repositoryId } = await searchParams;

  const validStatus = status && Object.values(TestRunStatus).includes(status as any)
    ? (status as TestRunStatus)
    : undefined;

  const { runs, total } = user
    ? await TestRunService.listTestRuns(user.id, {
        status: validStatus,
        repositoryId,
        limit: 50,
      })
    : { runs: [], total: 0 };

  const statuses: { label: string; value?: string }[] = [
    { label: "All Runs" },
    { label: "Passed", value: "PASSED" },
    { label: "Failed", value: "FAILED" },
    { label: "Running", value: "RUNNING" },
    { label: "Queued", value: "QUEUED" },
    { label: "Error", value: "ERROR" },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Test Execution History"
        subtitle={`Track and inspect ${total} automated QA execution cycles`}
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {statuses.map((s) => {
            const isActive = (!s.value && !validStatus) || s.value === validStatus;
            const queryParam = s.value ? `?status=${s.value}` : "";

            return (
              <a
                key={s.label}
                href={`/test-runs${queryParam}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800"
                }`}
              >
                {s.label}
              </a>
            );
          })}
        </div>

        {/* Runs Table */}
        <RecentRunsTable runs={runs} />
      </main>
    </div>
  );
}
