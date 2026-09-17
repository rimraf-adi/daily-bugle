"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  ArrowUpRight,
  Menu,
  X,
  Cpu,
  Radio,
  Globe,
  Activity,
  Terminal,
  Layers,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Overview", href: "/" },
    { name: "arXiv Wire", href: "/dashboard?tab=arxiv" },
    { name: "Reddit Watcher", href: "/dashboard?tab=reddit" },
    { name: "Substack", href: "/dashboard?tab=substack" },
    { name: "LLM Studio", href: "/dashboard?tab=llm" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full pt-4 px-4 pb-2">
      <div className="max-w-6xl mx-auto">
        {/* Floating Glassmorphic Pill Navbar (Reference Image 2 Style) */}
        <div className="glass-nav rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                Daily Bugle
              </span>
              <span className="text-[9px] font-mono tracking-widest text-indigo-400/80 -mt-1 hidden sm:block">
                AI INTELLIGENCE
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith("/dashboard") &&
                    typeof window !== "undefined" &&
                    window.location.search.includes(link.href.split("?")[1] || "");

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "text-white bg-white/10 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action & Live Status */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden lg:inline text-[11px]">Live Streams</span>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-100 transition-all shadow-md shadow-white/10 hover:shadow-white/20 group"
            >
              <span>Command Center</span>
              <div className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                <ArrowUpRight className="w-2.5 h-2.5" />
              </div>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-white rounded-full bg-white/5 border border-white/10"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Streams Active</span>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-zinc-950"
                >
                  Launch App
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
