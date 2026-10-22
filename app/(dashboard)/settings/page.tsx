import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { Header } from "@/components/dashboard/header";
import { checkDatabaseConnection } from "@/lib/db";
import { getOpenAIModel } from "@/lib/openai";
import { Cpu, Database, GitBranch, Shield, Key, CheckCircle2, User } from "lucide-react";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  let dbStatus = "Unknown";
  try {
    const dbInfo = (await checkDatabaseConnection()) as any;
    if (dbInfo) dbStatus = "Connected to Neon PostgreSQL";
  } catch (err: any) {
    dbStatus = `Connection Error: ${err.message}`;
  }

  const model = getOpenAIModel();
  const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);
  const hasGitHubApp = Boolean(process.env.GITHUB_CLIENT_ID);

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="Settings & Integrations"
        subtitle="Manage authentication, AI models, and infrastructure connectivity"
      />

      <main className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* User Profile Card */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Authenticated Account</h3>
              <p className="text-xs text-neutral-400">Clerk identity linked to PostgreSQL User model</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
            <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
              <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">Email / Identity</div>
              <div className="font-mono text-neutral-200">{user?.email || user?.name || "Clerk User"}</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80">
              <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-1">Database ID</div>
              <div className="font-mono text-neutral-200 truncate">{user?.id || "-"}</div>
            </div>
          </div>
        </div>

        {/* Database & Infrastructure */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Neon PostgreSQL Database</h3>
              <p className="text-xs text-neutral-400">Serverless PostgreSQL with connection pooling & Prisma ORM</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-neutral-200 font-medium">{dbStatus}</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Prisma v6.4.1
            </span>
          </div>
        </div>

        {/* OpenAI QA Engine */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">OpenAI QA Intelligence</h3>
              <p className="text-xs text-neutral-400">Structured root cause analysis, defect severity, and test case suggestions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-0.5">Configured Model</div>
                <div className="font-mono text-neutral-200 font-semibold">{model}</div>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Default
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-neutral-400 uppercase tracking-wider mb-0.5">API Key Status</div>
                <div className="font-mono text-emerald-400 font-medium">
                  {hasOpenAiKey ? "Configured & Active" : "Missing Key"}
                </div>
              </div>
              <Key className="w-4 h-4 text-neutral-500" />
            </div>
          </div>
        </div>

        {/* GitHub Integration */}
        <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neutral-800 text-white">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">GitHub Integration</h3>
              <p className="text-xs text-neutral-400">Direct repository authorization and push webhook listeners</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs text-neutral-300 leading-relaxed">
            Repositories can be connected directly via their GitHub owner/repository identifier or repository clone URL. Push webhooks can be directed to <code className="text-indigo-400 font-mono">/api/webhooks/github</code>.
          </div>
        </div>
      </main>
    </div>
  );
}
