import React, { Suspense } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
      <Suspense
        fallback={
          <aside className="w-64 border-r border-[var(--border-theme)] bg-[var(--bg-sidebar)] shrink-0 min-h-screen" />
        }
      >
        <Sidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
