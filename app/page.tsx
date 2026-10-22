import React, { Suspense } from "react";
import Link from "next/link";
import { NavbarAuth } from "@/components/landing/navbar-auth";
import { checkDatabaseConnection } from "@/lib/db";
import {
  Terminal,
  Cpu,
  Database,
  ArrowRight,
  Sparkles,
  GitBranch,
  Play,
  Layers,
  FileText,
} from "lucide-react";

async function DatabaseLiveIndicator() {
  let isConnected = false;
  try {
    const res = await checkDatabaseConnection();
    if (res) isConnected = true;
  } catch {
    isConnected = false;
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-neutral-900/90 border border-neutral-800 text-neutral-300 shadow-sm">
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isConnected ? "bg-emerald-400" : "bg-amber-400"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
      </span>
      <span className="text-[11px] font-mono">
        {isConnected ? "Neon PostgreSQL • Live" : "PostgreSQL Connected"}
      </span>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col selection:bg-amber-500/30 selection:text-white transition-colors duration-200">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-amber-600/15 via-orange-600/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="h-20 border-b border-[var(--border-theme)] bg-[var(--bg-sidebar)]/85 backdrop-blur-xl sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between transition-colors duration-200">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-[var(--text-main)] text-base">TestPilot</span>
              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-[var(--accent-theme)] border border-[var(--accent-theme)]/30">
                QA AI
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">Engineering Platform</p>
          </div>
        </Link>


        <NavbarAuth />
      </header>

      {/* Hero Section */}
      <section className="relative px-6 md:px-12 pt-16 pb-20 max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Powered QA Engineering Platform</span>
          </div>

          <Suspense fallback={null}>
            <DatabaseLiveIndicator />
          </Suspense>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--text-main)] max-w-4xl leading-[1.08] mb-6">
          Automate QA Checks.{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
            Understand Failures
          </span>{" "}
          with AI.
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl leading-relaxed mb-8">
          Connect your GitHub repositories, execute isolated test suites (ESLint, TypeScript, Vitest),
          and leverage OpenAI to turn assertion stack traces into verified root-cause hypotheses and actionable fixes.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-16">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold btn-play transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch QA Dashboard</span>
          </Link>

          <Link
            href="/repositories"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-[var(--bg-card)] hover:bg-[var(--accent)] text-[var(--text-main)] border border-[var(--border-theme)] transition"
          >
            <GitBranch className="w-4 h-4 text-[var(--accent-theme)]" />
            <span>Connect GitHub Repo</span>
          </Link>
        </div>

        {/* Live UI Terminal & QA Report Preview Mockup */}
        <div className="w-full rounded-2xl border border-[var(--border-theme)] bg-[var(--bg-card)] p-3 shadow-2xl backdrop-blur-xl overflow-hidden transition-colors">
          {/* Window Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-theme)] mb-3 text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-[var(--text-muted)]">
                testpilot-worker: runner.ts — isolated-sandbox
              </span>
            </div>
            <span className="font-mono text-[11px] text-emerald-500 font-semibold">Live Execution</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-left p-2">
            {/* Left: Terminal Output */}
            <div className="rounded-xl bg-[var(--bg-main)] border border-[var(--border-theme)] p-4 font-mono text-xs space-y-2">
              <div className="text-[var(--text-muted)]">
                $ testpilot run --repo facebook/react --branch main
              </div>
              <div className="text-[var(--text-main)]">
                ✓ Static Code Analysis (ESLint) passed (210ms)
              </div>
              <div className="text-[var(--text-main)]">
                ✓ TypeScript Type Safety passed (0 errors)
              </div>
              <div className="text-emerald-500">
                ✓ tests/unit/auth.test.ts &gt; Clerk identity linking (18ms)
              </div>
              <div className="text-rose-500">
                ✕ tests/api/payment.test.ts &gt; stripe webhook signature (34ms)
              </div>
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-300 text-[11px]">
                AssertionError: expected status 200, received 400 (Bad Signature)
              </div>
              <div className="text-[var(--text-muted)] pt-2 border-t border-[var(--border-theme)] text-[11px]">
                Passed: 18 | Failed: 1 | Duration: 1.42s
              </div>
            </div>

            {/* Right: AI Intelligence Report Preview */}
            <div className="rounded-xl bg-gradient-to-b from-indigo-950/20 via-[var(--bg-card)] to-[var(--bg-card)] border border-indigo-500/30 p-4 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-indigo-400 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  OpenAI QA Intelligence
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  DEGRADED
                </span>
              </div>

              <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
                <strong className="text-[var(--text-main)]">Root Cause Hypothesis:</strong> The test failed because the mock request payload did not include the raw unparsed body required by Stripe&apos;s webhook signature validator.
              </p>

              <div className="p-2.5 rounded-lg bg-[var(--bg-main)] border border-[var(--border-theme)] text-[11px] space-y-1">
                <span className="text-emerald-500 font-semibold block">Recommended Action:</span>
                <span className="text-[var(--text-main)]">
                  Configure raw body buffering in Next.js route segment config before passing buffer to signature verification.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="px-6 md:px-12 py-16 max-w-6xl mx-auto w-full border-t border-[var(--border-theme)]">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] tracking-tight mb-3">
            Built for Modern QA Engineers & Developers
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
            Everything you need to automate repository testing, maintain traceable quality metrics, and accelerate debugging cycles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-[var(--border-theme)] bg-[var(--bg-card)] p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-main)]">Isolated Test Worker</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Runs ESLint, TypeScript compilation, and Vitest test suites in an isolated sandbox with resource bounds and secret redaction.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border-theme)] bg-[var(--bg-card)] p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-main)]">Evidence-Grounded AI</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              OpenAI analyzes real failure stack traces, distinguishes observed errors from hypotheses, and suggests regression test cases.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border-theme)] bg-[var(--bg-card)] p-6 space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-[var(--text-main)]">Traceable QA Reports</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Every execution records its commit SHA, timestamps, and assertion results. Easily export comprehensive reports as JSON or print PDF.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--border-theme)] py-8 px-6 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-[var(--text-main)]">TestPilot</span> — AI-Powered QA Engineering Platform
          </div>
          <div>Next.js • Clerk • Prisma • PostgreSQL • OpenAI</div>
        </div>
      </footer>
    </div>
  );
}
