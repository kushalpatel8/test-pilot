import React from "react";
import { getCurrentUser } from "@/lib/auth";
import { ReportService } from "@/services/report.service";
import { Header } from "@/components/dashboard/header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RecentRunsTable } from "@/components/dashboard/recent-runs-table";
import { QualityTrendChart } from "@/components/dashboard/quality-trend-chart";
import { PlaySquare, CheckCircle2, GitBranch, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  let metrics = {
    totalRuns: 0,
    passedRuns: 0,
    failedRuns: 0,
    reposCount: 0,
    passRate: 100,
    aiReportsCount: 0,
    recentRuns: [] as any[],
  };

  if (user) {
    metrics = await ReportService.getDashboardMetrics(user.id);
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Header
        title="QA Engineering Dashboard"
        subtitle="Automated repository test execution & AI failure intelligence"
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Welcome / Quick Start Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-neutral-900 border border-indigo-500/20 p-6 md:p-8">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Automated QA Pipeline Active
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight mb-2">
              Continuous Reliability & AI Analysis
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 mb-5 leading-relaxed">
              Run static analysis, TypeScript compilation checks, and Vitest suites against any GitHub commit.
              OpenAI analyzes failures and proposes grounded root-cause hypotheses and fixes.
            </p>
            <div className="flex items-center gap-3">
              <Link
                href="/repositories"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition"
              >
                <span>Manage Repositories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/test-runs"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition"
              >
                <span>All Test Runs</span>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total QA Runs"
            value={metrics.totalRuns}
            subtitle={`${metrics.passedRuns} passed, ${metrics.failedRuns} failed`}
            icon={PlaySquare}
            accentColor="indigo"
          />
          <MetricCard
            title="QA Pass Rate"
            value={`${metrics.passRate}%`}
            subtitle="Derived from actual assertions"
            icon={CheckCircle2}
            accentColor="emerald"
            trend={{
              value: metrics.passRate >= 80 ? "Healthy" : "Attention",
              isPositive: metrics.passRate >= 80,
            }}
          />
          <MetricCard
            title="Active Repositories"
            value={metrics.reposCount}
            subtitle="Connected for testing"
            icon={GitBranch}
            accentColor="amber"
          />
          <MetricCard
            title="AI Insights Generated"
            value={metrics.aiReportsCount}
            subtitle="Powered by OpenAI"
            icon={Sparkles}
            accentColor="purple"
          />
        </div>

        {/* Quality Trend Chart */}
        <QualityTrendChart />

        {/* Recent Test Runs Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">Recent Test Executions</h3>
              <p className="text-xs text-neutral-400">Live outcome of recently executed repository test suites</p>
            </div>
            <Link
              href="/test-runs"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
            >
              <span>View All Runs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <RecentRunsTable runs={metrics.recentRuns} />
        </div>
      </main>
    </div>
  );
}
