"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ArrowDown,
  Search,
  Sparkles,
  Layers,
  Cpu,
  RefreshCw,
  Download,
  ShieldAlert,
  Sliders,
  Filter,
} from "lucide-react";
import { TestRunStatusBadge } from "./test-run-status-badge";

export interface TestResultItem {
  id: string;
  testName: string;
  testFile: string;
  status: string;
  durationMs?: number | null;
  errorMessage?: string | null;
  stackTrace?: string | null;
}

export interface DeveloperConsoleTestRun {
  id: string;
  status: string;
  branch: string;
  commitSha: string;
  durationMs?: number | null;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests?: number;
  errorTests?: number;
  logs?: string | null;
  startedAt?: string | Date | null;
  completedAt?: string | Date | null;
  testResults?: TestResultItem[];
  repository: {
    fullName: string;
  };
  qaReport?: {
    id: string;
  } | null;
}

interface DeveloperConsoleProps {
  initialTestRun: DeveloperConsoleTestRun;
}

type TabType = "terminal" | "assertions" | "pipeline" | "telemetry";
type FilterType = "all" | "errors" | "passed" | "info";

export function DeveloperConsole({ initialTestRun }: DeveloperConsoleProps) {
  const [testRun, setTestRun] = useState<DeveloperConsoleTestRun>(initialTestRun);
  const [activeTab, setActiveTab] = useState<TabType>("terminal");
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [logFilter, setLogFilter] = useState<FilterType>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (initialTestRun.durationMs) return initialTestRun.durationMs / 1000;
    if (initialTestRun.startedAt) {
      return (Date.now() - new Date(initialTestRun.startedAt).getTime()) / 1000;
    }
    return 0;
  });

  const terminalBodyRef = useRef<HTMLDivElement>(null);
  const isRunning = testRun.status === "RUNNING" || testRun.status === "QUEUED";

  // Stopwatch for in-progress executions
  useEffect(() => {
    if (!isRunning) return;

    const startTs = testRun.startedAt
      ? new Date(testRun.startedAt).getTime()
      : Date.now();

    const interval = setInterval(() => {
      setElapsedSeconds((Date.now() - startTs) / 1000);
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, testRun.startedAt]);

  // Live polling while running or queued
  useEffect(() => {
    if (!isRunning) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/test-runs/${testRun.id}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.testRun) {
          setTestRun((prev) => ({
            ...prev,
            ...data.testRun,
          }));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1200);

    return () => clearInterval(pollInterval);
  }, [isRunning, testRun.id]);

  // Auto-scroll to bottom of terminal when logs arrive
  useEffect(() => {
    if (autoScroll && terminalBodyRef.current && activeTab === "terminal") {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [testRun.logs, autoScroll, activeTab]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/test-runs/${testRun.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.testRun) setTestRun(data.testRun);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleCopyLogs = () => {
    if (!testRun.logs) return;
    navigator.clipboard.writeText(testRun.logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadLogs = () => {
    if (!testRun.logs) return;
    const blob = new Blob([testRun.logs], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `testpilot-run-${testRun.id.slice(0, 8)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter logs lines based on search query and category
  const rawLogs = testRun.logs || (isRunning ? "Worker initialized. Sandboxed worker launching command stream...\n" : "No logs available.");
  const allLines = rawLogs.split("\n");

  const filteredLines = allLines.filter((line) => {
    if (searchQuery.trim()) {
      if (!line.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    }
    if (logFilter === "errors") {
      return (
        line.includes("✕") ||
        line.toLowerCase().includes("error") ||
        line.toLowerCase().includes("failed") ||
        line.toLowerCase().includes("fatal")
      );
    }
    if (logFilter === "passed") {
      return line.includes("✓") || line.toLowerCase().includes("passed");
    }
    if (logFilter === "info") {
      return (
        line.includes("[PHASE") ||
        line.includes("===") ||
        line.includes("Target:") ||
        line.includes("Timestamp:")
      );
    }
    return true;
  });

  // Calculate phase status
  const hasPhase1 = rawLogs.includes("[PHASE 1]");
  const phase1Done = rawLogs.includes("ESLint engine ready") || rawLogs.includes("[PHASE 2]");
  const hasPhase2 = rawLogs.includes("[PHASE 2]");
  const phase2Done = rawLogs.includes("TypeScript typecheck") || rawLogs.includes("[PHASE 3]");
  const hasPhase3 = rawLogs.includes("[PHASE 3]");
  const phase3Done = !isRunning && (testRun.status === "PASSED" || testRun.status === "FAILED" || testRun.status === "ERROR");

  return (
    <div
      className={`transition-all duration-300 flex flex-col ${
        isFullscreen
          ? "fixed inset-0 z-50 p-4 sm:p-6 bg-black/90 backdrop-blur-2xl"
          : "w-full"
      }`}
    >
      <div className="w-full rounded-2xl border border-[var(--border-theme)] bg-[#090d16] text-neutral-200 shadow-2xl overflow-hidden flex flex-col flex-1 border-opacity-80">
        {/* Terminal Titlebar Chrome */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#0d121f] border-b border-neutral-800/80 gap-3">
          {/* Traffic Lights & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/90 shadow-sm shadow-rose-500/40 inline-block hover:opacity-80 transition" />
              <span className="w-3 h-3 rounded-full bg-amber-500/90 shadow-sm shadow-amber-500/40 inline-block hover:opacity-80 transition" />
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-sm shadow-emerald-500/40 inline-block hover:opacity-80 transition cursor-pointer"
              />
            </div>

            <div className="h-4 w-px bg-neutral-800" />

            <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-white font-semibold">testpilot-runner</span>
              <span className="text-neutral-600">/</span>
              <span className="text-cyan-400/90">{testRun.repository.fullName}</span>
              <span className="text-neutral-600">@</span>
              <span className="text-amber-400/90 font-mono text-[11px]">{testRun.branch}</span>
            </div>
          </div>

          {/* Center: Live Running Ping & Stopwatch */}
          <div className="flex items-center gap-3">
            {isRunning ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 shadow-sm shadow-amber-500/10 animate-pulse">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="font-mono uppercase tracking-wider text-[11px]">
                  {testRun.status}
                </span>
              </div>
            ) : (
              <TestRunStatusBadge status={testRun.status as any} />
            )}

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{elapsedSeconds.toFixed(2)}s</span>
            </div>
          </div>

          {/* Right: Window Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              title="Refresh stream"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>
            <button
              onClick={handleCopyLogs}
              title="Copy Output"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleDownloadLogs}
              title="Download Logs"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Phase Pipeline Stepper Card */}
        <div className="bg-[#0b101c] px-4 py-2.5 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1 scrollbar-none font-mono text-[11px]">
            {/* Step 1 */}
            <div className={`flex items-center gap-1.5 ${hasPhase1 ? (phase1Done ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold animate-pulse") : "text-neutral-500"}`}>
              <div className={`w-2 h-2 rounded-full ${hasPhase1 ? (phase1Done ? "bg-emerald-500" : "bg-amber-400 animate-ping") : "bg-neutral-700"}`} />
              <span>1. ESLint Check</span>
            </div>

            <span className="text-neutral-700">➔</span>

            {/* Step 2 */}
            <div className={`flex items-center gap-1.5 ${hasPhase2 ? (phase2Done ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold animate-pulse") : "text-neutral-500"}`}>
              <div className={`w-2 h-2 rounded-full ${hasPhase2 ? (phase2Done ? "bg-emerald-500" : "bg-amber-400 animate-ping") : "bg-neutral-700"}`} />
              <span>2. TypeScript Typecheck</span>
            </div>

            <span className="text-neutral-700">➔</span>

            {/* Step 3 */}
            <div className={`flex items-center gap-1.5 ${hasPhase3 ? (phase3Done ? (testRun.failedTests > 0 ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold") : "text-cyan-400 font-semibold animate-pulse") : "text-neutral-500"}`}>
              <div className={`w-2 h-2 rounded-full ${hasPhase3 ? (phase3Done ? (testRun.failedTests > 0 ? "bg-rose-500" : "bg-emerald-500") : "bg-cyan-400 animate-ping") : "bg-neutral-700"}`} />
              <span>3. Vitest Test Suites</span>
            </div>

            <span className="text-neutral-700">➔</span>

            {/* Step 4: AI Analysis */}
            <div className={`flex items-center gap-1.5 ${testRun.qaReport ? "text-indigo-400 font-semibold" : "text-neutral-500"}`}>
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>4. AI QA Diagnostic</span>
            </div>
          </div>

          {testRun.qaReport ? (
            <Link
              href={`/reports/${testRun.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition"
            >
              <Sparkles className="w-3 h-3" />
              <span>View AI Report</span>
            </Link>
          ) : isRunning ? (
            <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-mono">
              <span className="animate-spin text-cyan-400">⚡</span>
              <span>Worker executing commands...</span>
            </div>
          ) : (
            <Link
              href={`/reports/${testRun.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Generate AI QA Report</span>
            </Link>
          )}
        </div>

        {/* View Tabs & Search/Filter Toolbar */}
        <div className="px-4 py-2 bg-[#090d16] border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("terminal")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === "terminal"
                  ? "bg-neutral-800 text-cyan-400 border border-cyan-500/30 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Terminal Console</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-900 text-neutral-400 font-mono">
                {allLines.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("assertions")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === "assertions"
                  ? "bg-neutral-800 text-cyan-400 border border-cyan-500/30 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Assertions</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-900 text-neutral-400 font-mono">
                {testRun.testResults?.length || testRun.totalTests || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("telemetry")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeTab === "telemetry"
                  ? "bg-neutral-800 text-cyan-400 border border-cyan-500/30 shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sandbox Telemetry</span>
            </button>
          </div>

          {/* Search & Severity Filters (Only on terminal view) */}
          {activeTab === "terminal" && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Filter logs or errors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 rounded-lg bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 w-36 sm:w-48 font-mono"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center rounded-lg bg-neutral-900 p-0.5 border border-neutral-800 text-[11px] font-mono">
                <button
                  onClick={() => setLogFilter("all")}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    logFilter === "all" ? "bg-neutral-800 text-white font-semibold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setLogFilter("errors")}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    logFilter === "errors" ? "bg-rose-500/20 text-rose-400 font-semibold" : "text-neutral-400 hover:text-rose-300"
                  }`}
                >
                  Errors
                </button>
                <button
                  onClick={() => setLogFilter("passed")}
                  className={`px-2 py-0.5 rounded cursor-pointer transition ${
                    logFilter === "passed" ? "bg-emerald-500/20 text-emerald-400 font-semibold" : "text-neutral-400 hover:text-emerald-300"
                  }`}
                >
                  Passes
                </button>
              </div>

              {/* Auto Scroll Toggle */}
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                title={autoScroll ? "Auto-scroll active" : "Auto-scroll paused"}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono border transition cursor-pointer ${
                  autoScroll
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                <ArrowDown className={`w-3 h-3 ${autoScroll ? "animate-bounce" : ""}`} />
                <span>Auto-Scroll</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Terminal Console Body */}
        {activeTab === "terminal" && (
          <div
            ref={terminalBodyRef}
            className={`font-mono text-xs text-neutral-300 p-4 overflow-y-auto leading-relaxed bg-[#070b13] flex-1 select-text ${
              isFullscreen ? "h-[calc(100vh-230px)]" : "max-h-[520px] min-h-[380px]"
            }`}
          >
            {filteredLines.map((line, idx) => {
              // ANSI / semantic parsing for styling
              let lineStyle = "text-neutral-300";
              let isSpecial = false;

              if (line.includes("=== TestPilot QA Engine") || line.includes("Run Completed in")) {
                lineStyle = "text-indigo-400 font-bold border-y border-indigo-500/20 py-1 bg-indigo-950/20";
                isSpecial = true;
              } else if (line.startsWith("[PHASE")) {
                lineStyle = "text-cyan-400 font-bold bg-cyan-950/30 px-2 py-0.5 rounded border-l-2 border-cyan-400 my-1";
                isSpecial = true;
              } else if (line.includes("✓") || line.includes("passed")) {
                lineStyle = "text-emerald-400";
              } else if (
                line.includes("✕") ||
                line.includes("FAILED") ||
                line.includes("AssertionError") ||
                line.includes("[FATAL ERROR]")
              ) {
                lineStyle = "text-rose-400 bg-rose-950/30 px-1 rounded border-l border-rose-500 font-semibold";
              } else if (line.includes("$ ") || line.includes("testpilot run")) {
                lineStyle = "text-amber-400 font-semibold";
              } else if (line.includes("warning") || line.includes("WARN")) {
                lineStyle = "text-amber-300";
              }

              const cleanedLine = line
                .replace(/\u001b\[[0-9;]*[a-zA-Z]/g, "")
                .replace(/\[{1,2}[0-9;]*m/g, "")
                .replace(/\[{1,2}[0-9;]*[a-zA-Z]/g, "")
                .replace(/\[\]/g, "");

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 hover:bg-white/[0.02] py-0.5 px-1 rounded transition-colors ${lineStyle}`}
                >
                  <span className="text-neutral-600 select-none text-[10px] w-8 text-right font-mono shrink-0 pt-0.5">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre-wrap break-all flex-1 font-mono">
                    {cleanedLine}
                  </span>
                </div>
              );
            })}

            {/* Blinking Runner Cursor when RUNNING */}
            {isRunning && (
              <div className="flex items-center gap-2 mt-3 pt-2 text-cyan-400 font-mono text-xs animate-pulse">
                <span className="text-emerald-400">❯</span>
                <span className="text-neutral-400">testpilot-runner executing in sandbox</span>
                <span className="w-2 h-4 bg-cyan-400 inline-block animate-ping ml-1" />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Test Assertions Tree */}
        {activeTab === "assertions" && (
          <div
            className={`p-4 overflow-y-auto bg-[#070b13] flex-1 ${
              isFullscreen ? "h-[calc(100vh-230px)]" : "max-h-[520px] min-h-[380px]"
            }`}
          >
            {testRun.testResults && testRun.testResults.length > 0 ? (
              <div className="space-y-2">
                {testRun.testResults.map((result) => {
                  const isPassed = result.status === "PASSED";

                  return (
                    <div
                      key={result.id}
                      className={`p-3.5 rounded-xl border transition-all text-xs ${
                        isPassed
                          ? "bg-neutral-900/60 border-neutral-800/80 hover:border-emerald-500/30"
                          : "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {isPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                          <span className="font-semibold text-white font-mono">
                            {result.testName}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            ({result.testFile})
                          </span>
                        </div>
                        <span className="text-neutral-400 font-mono text-[11px]">
                          {result.durationMs ?? 20}ms
                        </span>
                      </div>

                      {result.errorMessage && (
                        <div className="mt-2.5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px] whitespace-pre-wrap">
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
            ) : (
              <div className="p-8 text-center text-neutral-400 font-mono text-xs space-y-2">
                {isRunning ? (
                  <>
                    <RefreshCw className="w-5 h-5 mx-auto animate-spin text-cyan-400" />
                    <p>Executing test suites in isolated runner...</p>
                    <p className="text-[11px] text-neutral-500">Assertions will stream into this view as each suite completes.</p>
                  </>
                ) : (
                  <p>No individual assertion records logged for this execution run.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Sandbox Telemetry */}
        {activeTab === "telemetry" && (
          <div
            className={`p-6 overflow-y-auto bg-[#070b13] flex-1 space-y-4 font-mono text-xs ${
              isFullscreen ? "h-[calc(100vh-230px)]" : "max-h-[520px] min-h-[380px]"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Execution Engine</span>
                <span className="text-white font-semibold">TestPilot Sandbox v2.4</span>
                <span className="text-[11px] text-cyan-400 block">Vitest 5.x + ESLint 9</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Commit SHA</span>
                <span className="text-white font-semibold">{testRun.commitSha}</span>
                <span className="text-[11px] text-amber-400 block">Branch: {testRun.branch}</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Container Isolation</span>
                <span className="text-emerald-400 font-semibold">Protected Environment</span>
                <span className="text-[11px] text-neutral-400 block">Secrets auto-redacted</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Elapsed Duration</span>
                <span className="text-white font-semibold">{testRun.durationMs ? `${(testRun.durationMs / 1000).toFixed(2)}s` : `${elapsedSeconds.toFixed(2)}s`}</span>
                <span className="text-[11px] text-neutral-400 block">Timeout limit: 60.00s</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Memory Limit</span>
                <span className="text-white font-semibold">512 MB Max Bound</span>
                <span className="text-[11px] text-emerald-400 block">Normal consumption (&lt; 85MB)</span>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Live Stream Status</span>
                <span className={isRunning ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"}>
                  {isRunning ? "● Active Polling (1.2s)" : "✓ Execution Finished"}
                </span>
                <span className="text-[11px] text-neutral-400 block">State synced with PostgreSQL</span>
              </div>
            </div>
          </div>
        )}

        {/* Terminal Bottom Status Bar */}
        <div className="px-4 py-2 bg-[#090d16] border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isRunning ? "bg-amber-400 animate-ping" : "bg-emerald-500"}`} />
              <span className="text-neutral-300">{isRunning ? "Live Stream Active" : "Stream Completed"}</span>
            </span>

            <span className="hidden sm:inline text-neutral-600">|</span>

            <span className="hidden sm:inline">
              Lines: <strong className="text-neutral-200">{allLines.length}</strong>
            </span>

            <span className="hidden sm:inline text-neutral-600">|</span>

            <span>
              Passed: <strong className="text-emerald-400">{testRun.passedTests}</strong>
            </span>

            <span>
              Failed: <strong className="text-rose-400">{testRun.failedTests}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-neutral-500">testpilot-v1 · UTF-8</span>
          </div>
        </div>
      </div>
    </div>
  );
}
