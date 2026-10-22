"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  PlaySquare,
  Settings,
  CheckCircle2,
  Terminal,
  Cpu,
  Database,
  Sparkles,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Repositories", href: "/repositories", icon: GitBranch },
    { label: "Test Runs", href: "/test-runs", icon: PlaySquare },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-[var(--border-theme)] bg-[var(--bg-sidebar)] flex flex-col justify-between shrink-0 min-h-screen transition-colors duration-200">
      {/* Brand Header */}
      <div>
        <Link
          href="/"
          className="h-16 flex items-center px-6 border-b border-[var(--border-theme)] gap-3 hover:bg-[var(--bg-card)] transition group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold tracking-tight text-[var(--text-main)] text-base group-hover:text-[var(--accent-theme)] transition-colors">TestPilot</span>
              <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-[var(--accent-theme)] border border-[var(--accent-theme)]/30">
                AI QA
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Engineering Platform</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="px-3 py-6 space-y-1">
          <div className="px-3 mb-2 text-[11px] font-medium tracking-wider uppercase text-[var(--text-muted)]">
            Platform
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[var(--accent-theme)]/15 text-[var(--accent-theme)] border border-[var(--accent-theme)]/35 shadow-sm font-semibold"
                    : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[var(--accent-theme)]" : "text-[var(--text-muted)]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Engine Status Card */}
      <div className="p-4 m-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-theme)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--text-muted)] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-theme)]" />
            Engines
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-[var(--mpl-success)] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--mpl-success)] animate-pulse" />
            Live
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-[var(--text-main)]">
            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Database className="w-3 h-3 text-[var(--accent-theme)]" />
              Neon Postgres
            </span>
            <span className="text-[10px] font-mono text-[var(--mpl-success)]">Ready</span>
          </div>

          <div className="flex items-center justify-between text-[var(--text-main)]">
            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Cpu className="w-3 h-3 text-[var(--accent-theme)]" />
              OpenAI QA
            </span>
            <span className="text-[10px] font-mono text-[var(--accent-theme)]">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
