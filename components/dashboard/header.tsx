"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Plus, GitBranch } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ title = "Dashboard", subtitle, action }: HeaderProps) {
  return (
    <header className="h-16 border-b border-[var(--border-theme)] bg-[var(--bg-sidebar)]/85 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      <div>
        <h1 className="text-base font-semibold text-[var(--text-main)] tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {action ? (
          action
        ) : (
          <>
            <Link
              href="/repositories"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[var(--bg-card)] hover:bg-[var(--accent)] text-[var(--text-main)] border border-[var(--border-theme)] transition"
            >
              <GitBranch className="w-3.5 h-3.5 text-[var(--accent-theme)]" />
              <span>Connect Repo</span>
            </Link>
            <Link
              href="/test-runs"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium btn-play transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Test Run</span>
            </Link>
          </>
        )}

        <ThemeToggle />

        <div className="pl-2 border-l border-[var(--border-theme)]">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8 rounded-xl ring-1 ring-neutral-700",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
