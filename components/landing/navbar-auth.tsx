"use client";

import React from "react";
import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function NavbarAuth() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="flex items-center gap-2.5">
      <ThemeToggle />

      {!isLoaded ? (
        <div className="flex items-center gap-2">
          <div className="w-16 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-theme)] animate-pulse" />
          <div className="w-24 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-theme)] animate-pulse" />
        </div>
      ) : isSignedIn ? (
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-card)] hover:bg-[var(--accent)] text-[var(--text-main)] border border-[var(--border-theme)] shadow-sm transition cursor-pointer"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="pl-1">
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8 rounded-xl ring-1 ring-[var(--border-theme)]",
                },
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5">
          <Link
            href="/sign-in"
            className="px-3.5 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold btn-play shadow-lg transition cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
