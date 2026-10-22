import React from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0D1117] text-[#E6EDF3] p-4 sm:p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[420px] h-[260px] bg-cyan-500/10 blur-[110px] rounded-full pointer-events-none" />

      {/* Brand logo header */}
      <div className="mb-6 z-10 flex flex-col items-center text-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-transform hover:scale-105"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div className="flex items-center gap-1.5 text-left">
            <span className="font-semibold tracking-tight text-white text-lg">
              TestPilot
            </span>
            <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              AI QA
            </span>
          </div>
        </Link>
      </div>

      {/* Centered Auth Card Container */}
      <div className="z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
