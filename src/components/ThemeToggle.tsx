"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to dark during SSR to match initial html class="dark"
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
        isDark
          ? "bg-black/[0.04] dark:bg-white/[0.08] hover:bg-black/[0.08] dark:hover:bg-white/[0.15] text-amber-500 dark:text-amber-300 border border-black/10 dark:border-white/10 shadow-sm"
          : "bg-black/[0.05] hover:bg-black/[0.1] text-indigo-600 border border-black/10 shadow-sm"
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>
    </button>
  );
}
