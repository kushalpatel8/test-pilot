"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check saved theme or current DOM attribute
    const currentAttr = document.documentElement.getAttribute("data-theme") as "dark" | "light" | null;
    const saved = (localStorage.getItem("testpilot_theme") as "dark" | "light" | null) || currentAttr || "dark";
    setTheme(saved);
    applyTheme(saved);
    setMounted(true);

    const onThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<"dark" | "light">;
      if (customEvent.detail && (customEvent.detail === "dark" || customEvent.detail === "light")) {
        setTheme(customEvent.detail);
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === "testpilot_theme" && (e.newValue === "dark" || e.newValue === "light")) {
        setTheme(e.newValue);
        applyTheme(e.newValue);
      }
    };

    window.addEventListener("theme-change", onThemeChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("theme-change", onThemeChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const applyTheme = (t: "dark" | "light") => {
    const root = document.documentElement;
    if (t === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("testpilot_theme", next);
    } catch {}
    applyTheme(next);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: next }));
  };

  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Switch to ☀️ Nordic Light" : "Switch to 🌆 Sunset Amber"}
      aria-label="Toggle theme"
      className="p-2 rounded-xl border border-[var(--border-theme)] bg-[var(--bg-card)] hover:brightness-110 text-[var(--text-main)] transition cursor-pointer flex items-center justify-center shadow-sm"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
      ) : (
        <Moon className="w-4 h-4 text-emerald-600 hover:-rotate-12 transition-transform" />
      )}
    </button>
  );
}
