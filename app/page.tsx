import { Suspense } from "react";
import { checkDatabaseConnection } from "@/lib/db";

async function DatabaseStatus() {
  let dbInfo: { current_time?: string; database_name?: string; version?: string } | null = null;
  let dbError: string | null = null;

  try {
    dbInfo = (await checkDatabaseConnection()) as any;
  } catch (err: any) {
    dbError = err.message || "Failed to connect to Neon database";
  }

  return (
    <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-950/70 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Database Status</span>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            dbInfo
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dbInfo ? "bg-emerald-400" : "bg-red-400"}`} />
          {dbInfo ? "Connected to Neon" : "Connection Error"}
        </span>
      </div>

      {dbInfo && (
        <div className="text-xs space-y-1.5 pt-2 border-t border-neutral-800/60 text-neutral-300">
          <div className="flex justify-between">
            <span className="text-neutral-400">Database:</span>
            <span className="font-mono text-neutral-200">{String(dbInfo.database_name)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Server Time:</span>
            <span className="font-mono text-neutral-200">
              {dbInfo.current_time ? new Date(dbInfo.current_time).toISOString() : "N/A"}
            </span>
          </div>
          <div className="pt-1 text-[11px] text-neutral-400 font-mono truncate">
            {String(dbInfo.version)}
          </div>
        </div>
      )}

      {dbError && (
        <div className="text-xs text-red-400 pt-2 border-t border-neutral-800/60">
          {dbError}
        </div>
      )}
    </div>
  );
}

function DatabaseStatusSkeleton() {
  return (
    <div className="border border-neutral-800 rounded-xl p-5 bg-neutral-950/70 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-neutral-400 font-medium">Database Status</span>
        <span className="text-xs text-neutral-400">Checking Neon...</span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full border border-neutral-800 rounded-2xl p-8 bg-neutral-900/60 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-semibold mb-2 tracking-tight">Test Pilot</h1>
        <p className="text-neutral-400 text-sm mb-6">
          Automated GitHub repository testing and analysis platform
        </p>

        <Suspense fallback={<DatabaseStatusSkeleton />}>
          <DatabaseStatus />
        </Suspense>
      </div>
    </main>
  );
}
