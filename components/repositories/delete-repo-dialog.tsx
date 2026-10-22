"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";

interface DeleteRepoDialogProps {
  repositoryId: string;
  repositoryName: string;
  redirectAfterDelete?: boolean;
  variant?: "button" | "icon";
}

export function DeleteRepoDialog({
  repositoryId,
  repositoryName,
  redirectAfterDelete = false,
  variant = "button",
}: DeleteRepoDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
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

  const isConfirmed = confirmText.trim().toLowerCase() === repositoryName.toLowerCase();

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/repositories/${repositoryId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete repository");
      }

      setIsOpen(false);
      if (redirectAfterDelete) {
        router.push("/repositories");
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while deleting the repository");
      setLoading(false);
    }
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => {
            setConfirmText("");
            setError(null);
            setIsOpen(true);
          }}
          title={`Delete ${repositoryName}`}
          className="p-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-rose-500/10 hover:border-rose-500/30 text-neutral-400 hover:text-rose-400 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setConfirmText("");
            setError(null);
            setIsOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-500/25 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Repository</span>
        </button>
      )}

      {isOpen && mounted && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Delete Repository</h3>
                  <p className="text-xs text-neutral-400 font-mono truncate max-w-[260px]">
                    {repositoryName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <p>
                Are you sure you want to delete <span className="font-semibold text-white font-mono">{repositoryName}</span>?
              </p>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                <span className="font-semibold block text-[11px] uppercase tracking-wider">Warning</span>
                <p className="text-[11px] leading-relaxed text-rose-200/90">
                  This will permanently delete this repository connection along with all its test run executions, assertion records, and AI QA reports. This action cannot be undone.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1.5">
                  Type <span className="font-mono text-white font-semibold">{repositoryName}</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={repositoryName}
                  disabled={loading}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3.5 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-rose-500 font-mono"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!isConfirmed || loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Repository</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
