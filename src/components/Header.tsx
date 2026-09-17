"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import {
  ArrowUpRight,
  Menu,
  X,
  BookOpen,
  Radio,
  Cpu,
  Layers,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Front Page", href: "/" },
    { name: "Today's Edition", href: "/edition" },
    { name: "Signal Lab", href: "/dashboard" },
    { name: "arXiv Wire", href: "/dashboard?tab=arxiv" },
    { name: "Reddit Watch", href: "/dashboard?tab=reddit" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full pt-4 px-4 pb-2">
      <div className="max-w-6xl mx-auto">
        {/* Floating Glassmorphic Pill Navbar */}
        <div className="glass-editorial-nav rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Brand Logo - Refined Typographic Monogram */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-[#fff8f2] dark:bg-[#f7f8f8] dark:text-[#08090a] flex items-center justify-center font-serif italic text-lg leading-none shadow-sm group-hover:scale-105 transition-transform">
              B
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-[#f7f8f8] group-hover:text-[var(--accent-terracotta)] transition-colors">
                Daily Bugle
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#5b5a57] dark:text-[#8a8f98] -mt-0.5 hidden sm:block font-medium">
                THE DIGITAL EDITION
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-full px-3 py-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : link.href === "/edition"
                  ? pathname === "/edition"
                  : pathname.startsWith("/dashboard") &&
                    typeof window !== "undefined" &&
                    window.location.search.includes(link.href.split("?")[1] || "");

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "text-zinc-950 bg-black/10 font-semibold shadow-sm dark:text-white dark:bg-white/10"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04] dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-white/[0.05]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action, Live Status & Theme Toggle */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-terracotta)]/10 border border-[var(--accent-terracotta)]/25 text-[var(--accent-terracotta)] text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-terracotta)] animate-pulse" />
              <span className="hidden lg:inline text-[11px] font-medium">Finite Briefing</span>
            </div>

            {/* Theme Toggle Button */}
            <ThemeToggle />

            {/* Read Today's Edition CTA */}
            <Link
              href="/edition"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold btn-editorial-primary group"
            >
              <span>Today's Edition</span>
              <div className="w-4 h-4 rounded-full bg-[var(--accent-terracotta)] text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowUpRight className="w-2.5 h-2.5" />
              </div>
            </Link>
          </div>

          {/* Mobile Right Bar: Theme toggle + Menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 glass-editorial-card rounded-2xl p-4 border border-black/10 dark:border-white/10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-zinc-700 hover:text-zinc-950 hover:bg-black/5 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 mt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[var(--accent-terracotta)] text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-terracotta)] animate-pulse" />
                  <span>Finite Edition</span>
                </div>
                <Link
                  href="/edition"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold btn-editorial-terracotta"
                >
                  Read Edition
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
