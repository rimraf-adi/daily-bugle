"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Newspaper, Radio, Activity, Cpu, Globe } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const d = new Date();
    const formatted = d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formatted);
  }, []);

  return (
    <header className="border-b border-[#262a30] bg-[#0c0d0e]">
      {/* Top micro-bar: Edition, date, and ticker */}
      <div className="border-b border-[#1c1f24] px-4 py-1.5 text-[11px] font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <span className="text-zinc-500 font-semibold uppercase tracking-wider">
            VOL. LXXIV NO. 24,112
          </span>
          <span className="hidden sm:inline text-zinc-600">•</span>
          <span className="text-zinc-400">{currentDate || "Automated Morning Edition"}</span>
          <span className="hidden sm:inline text-zinc-600">•</span>
          <span className="hidden md:inline text-emerald-400/90 font-medium">
            ZERO-AUTH REDDIT & RAW API STREAMING ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">
              Live Feed
            </span>
          </div>
          <span className="text-zinc-600">|</span>
          <Link
            href="/dashboard"
            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors flex items-center gap-1"
          >
            <Terminal className="w-3 h-3" />
            <span>Launch Terminal</span>
          </Link>
        </div>
      </div>

      {/* Main Newspaper Masthead */}
      <div className="px-4 py-6 sm:py-8 max-w-7xl mx-auto text-center relative">
        {/* Left ear */}
        <div className="hidden lg:block absolute left-4 top-1/2 -translate-y-1/2 text-left max-w-[200px] border-r border-[#22262d] pr-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold mb-0.5">
            WEATHER REPORT
          </div>
          <div className="text-xs text-zinc-300 font-serif leading-tight">
            Clear inference clouds with a 99.8% chance of token rain.
          </div>
        </div>

        {/* Right ear */}
        <div className="hidden lg:block absolute right-4 top-1/2 -translate-y-1/2 text-right max-w-[200px] border-l border-[#22262d] pl-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold mb-0.5">
            MARKET TICKER
          </div>
          <div className="text-xs text-zinc-300 font-mono leading-tight">
            OPEN-WEIGHTS <span className="text-emerald-400">▲ +14.2%</span><br />
            COMPUTE INDEX <span className="text-amber-400">▲ 240k H100</span>
          </div>
        </div>

        {/* Center Title */}
        <Link href="/" className="inline-block group">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight text-zinc-100 group-hover:text-red-500 transition-colors uppercase">
            The Daily Bugle
          </h1>
        </Link>
        <p className="text-xs sm:text-sm font-serif italic text-zinc-400 tracking-wide mt-1">
          &ldquo;All The AI Intelligence & Raw Research Payloads Fit to Compute&rdquo;
        </p>

        {/* Triple decorative line rule */}
        <div className="mt-4 pt-2 border-t-2 border-b border-[#2c313a] flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-zinc-400 px-2">
          <span>Global Dispatches</span>
          <span className="hidden sm:inline">Uncensored Raw XML & JSON Logs</span>
          <span>Zero-Sanitization Mode</span>
        </div>
      </div>

      {/* Navigation bar */}
      <nav className="border-t border-[#1e2229] bg-[#090a0b] px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1 py-1 text-xs font-mono uppercase tracking-wider">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all whitespace-nowrap ${
                pathname === "/"
                  ? "bg-red-950/40 text-red-400 font-semibold border-b-2 border-red-600"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-[#15181d]"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>Front Page</span>
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3 py-2 rounded transition-all whitespace-nowrap ${
                pathname === "/dashboard"
                  ? "bg-red-950/40 text-red-400 font-semibold border-b-2 border-red-600"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-[#15181d]"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Command Center</span>
            </Link>

            <Link
              href="/dashboard?tab=arxiv"
              className="flex items-center gap-1 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-[#15181d] rounded transition-all whitespace-nowrap"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400" />
              <span>arXiv Terminal</span>
            </Link>

            <Link
              href="/dashboard?tab=reddit"
              className="flex items-center gap-1 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-[#15181d] rounded transition-all whitespace-nowrap"
            >
              <Radio className="w-3.5 h-3.5 text-orange-400" />
              <span>Reddit Watcher</span>
            </Link>

            <Link
              href="/dashboard?tab=substack"
              className="flex items-center gap-1 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-[#15181d] rounded transition-all whitespace-nowrap"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Substack Tracker</span>
            </Link>

            <Link
              href="/dashboard?tab=llm"
              className="flex items-center gap-1 px-3 py-2 text-zinc-400 hover:text-zinc-100 hover:bg-[#15181d] rounded transition-all whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>OpenRouter Studio</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Node.js v26
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Next.js 16 App Router
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
