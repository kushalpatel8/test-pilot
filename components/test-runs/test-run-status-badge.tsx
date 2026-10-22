import React from "react";
import { CheckCircle2, XCircle, Clock, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";

export type TestRunStatusType = "QUEUED" | "RUNNING" | "PASSED" | "FAILED" | "CANCELLED" | "ERROR";

interface StatusBadgeProps {
  status: TestRunStatusType | string;
  className?: string;
  showIcon?: boolean;
}

export function TestRunStatusBadge({ status, className = "", showIcon = true }: StatusBadgeProps) {
  switch (status) {
    case "PASSED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          Passed
        </span>
      );
    case "FAILED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/25 ${className}`}
        >
          {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
          Failed
        </span>
      );
    case "RUNNING":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 animate-pulse ${className}`}
        >
          {showIcon && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
          Running
        </span>
      );
    case "QUEUED":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/25 ${className}`}
        >
          {showIcon && <Clock className="w-3.5 h-3.5 text-amber-400" />}
          Queued
        </span>
      );
    case "ERROR":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/15 text-red-400 border border-red-500/30 ${className}`}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
          System Error
        </span>
      );
    case "CANCELLED":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-800 text-neutral-400 border border-neutral-700 ${className}`}
        >
          {showIcon && <AlertTriangle className="w-3.5 h-3.5 text-neutral-400" />}
          {status}
        </span>
      );
  }
}
