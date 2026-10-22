"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Play, Loader2, CheckSquare, Square, X } from "lucide-react";

interface RunTestDialogProps {
  repositoryId: string;
  repositoryName: string;
  defaultBranch?: string;
}

export function RunTestDialog({
  repositoryId,
  repositoryName,
  defaultBranch = "main",
}: RunTestDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [branch, setBranch] = useState(defaultBranch);
  const [commitSha, setCommitSha] = useState("");
  const [runLint, setRunLint] = useState(true);
  const [runTypeCheck, setRunTypeCheck] = useState(true);
  const [runUnitTests, setRunUnitTests] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/test-runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repositoryId,
          branch: branch.trim() || defaultBranch,
          commitSha: commitSha.trim() || undefined,
          runLint,
          runTypeCheck,
          runUnitTests,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger test run");
      }

      setIsOpen(false);
      router.push(`/test-runs/${data.testRun.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to start run");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold btn-play transition cursor-pointer"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Run Tests</span>
      </button>

      {isOpen && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-base font-semibold text-white">Trigger QA Execution</h3>
                <p className="text-xs text-neutral-400">Target: {repositoryName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLaunch} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Target Branch
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Commit SHA (Optional)
                </label>
                <input
                  type="text"
                  value={commitSha}
                  onChange={(e) => setCommitSha(e.target.value)}
                  placeholder="Defaults to latest HEAD commit"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Configured QA Checks
                </label>

                <div
                  onClick={() => setRunLint(!runLint)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/60 cursor-pointer hover:border-neutral-700 transition"
                >
                  {runLint ? (
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-neutral-600" />
                  )}
                  <div>
                    <div className="text-xs font-medium text-white">Static Code Analysis (ESLint)</div>
                    <div className="text-[11px] text-neutral-400">Syntax, lint warnings, and import checks</div>
                  </div>
                </div>

                <div
                  onClick={() => setRunTypeCheck(!runTypeCheck)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/60 cursor-pointer hover:border-neutral-700 transition"
                >
                  {runTypeCheck ? (
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-neutral-600" />
                  )}
                  <div>
                    <div className="text-xs font-medium text-white">TypeScript Type Safety Validation</div>
                    <div className="text-[11px] text-neutral-400">Strict compile-time type verification</div>
                  </div>
                </div>

                <div
                  onClick={() => setRunUnitTests(!runUnitTests)}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/60 cursor-pointer hover:border-neutral-700 transition"
                >
                  {runUnitTests ? (
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-neutral-600" />
                  )}
                  <div>
                    <div className="text-xs font-medium text-white">Vitest Unit & Integration Suites</div>
                    <div className="text-[11px] text-neutral-400">Assertion checks and failure stack traces</div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{loading ? "Launching Worker..." : "Start Test Run"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
