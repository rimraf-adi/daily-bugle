"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import {
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Radio,
  Globe,
  Activity,
  Zap,
  Flame,
  Gauge,
  Compass,
  Rocket,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  // Fun interactive Needle Slider
  const [needleLevel, setNeedleLevel] = useState<number>(85);
  const [selectedArena, setSelectedArena] = useState<{
    id: string;
    name: string;
    route: string;
    icon: string;
    tag: string;
  }>({
    id: "arxiv",
    name: "arXiv Wire",
    route: "/dashboard?tab=arxiv",
    icon: "🚀",
    tag: "166 Disciplines",
  });

  const arenas = [
    {
      id: "arxiv",
      name: "arXiv Wire",
      route: "/dashboard?tab=arxiv",
      icon: "🚀",
      tag: "166 Disciplines",
      desc: "Instant Atom XML telemetry straight from export.arxiv.org",
      color: "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400",
      btnColor: "bg-blue-600 hover:bg-blue-500",
    },
    {
      id: "reddit",
      name: "Reddit Watcher",
      route: "/dashboard?tab=reddit",
      icon: "👾",
      tag: "Zero-Auth Live RSS",
      desc: "Uncensored community discussions from r/LocalLLaMA & r/singularity",
      color: "from-orange-500/20 to-amber-500/20 text-orange-600 dark:text-orange-400",
      btnColor: "bg-orange-600 hover:bg-orange-500",
    },
    {
      id: "substack",
      name: "Substack Radar",
      route: "/dashboard?tab=substack",
      icon: "📬",
      tag: "TLS Mailbox",
      desc: "Direct inbox extraction with canonical web link discovery",
      color: "from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400",
      btnColor: "bg-amber-600 hover:bg-amber-500",
    },
    {
      id: "llm",
      name: "OpenRouter Studio",
      route: "/dashboard?tab=llm",
      icon: "🧠",
      tag: "240+ Frontier Models",
      desc: "Multi-model prompt laboratory with token counting telemetry",
      color: "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400",
      btnColor: "bg-purple-600 hover:bg-purple-500",
    },
  ];

  // Impact level status text
  const getImpactStatus = (level: number) => {
    if (level < 30) return { label: "Standard Telemetry", color: "text-zinc-500", badge: "Low Latency" };
    if (level < 70) return { label: "High Signal Ingestion", color: "text-indigo-500", badge: "Multi-Source" };
    if (level < 95) return { label: "Raw Feed Overdrive", color: "text-purple-500", badge: "Non-Sanitized" };
    return { label: "MAXIMUM NEEDLE MOVEMENT ⚡", color: "text-pink-500 font-bold", badge: "Full Compute" };
  };

  const status = getImpactStatus(needleLevel);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-main)] selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 relative overflow-hidden transition-colors duration-200">
      {/* Dynamic Aurora Glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[700px] aurora-hero pointer-events-none -z-10 transition-opacity duration-500"
        style={{ opacity: 0.4 + (needleLevel / 100) * 0.6 }}
      />
      <div className="absolute top-48 left-1/2 -translate-x-1/2 w-[850px] h-[550px] aurora-glow-center pointer-events-none -z-10 blur-3xl opacity-60" />

      {/* Floating Pill Navigation */}
      <Header />

      {/* Hero Section: Pure High-Impact CTA & Brand Vibe */}
      <section className="relative pt-16 pb-20 sm:pt-28 sm:pb-28 px-4 text-center max-w-5xl mx-auto flex flex-col items-center">
        {/* Floating Sparkle Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 backdrop-blur-md shadow-sm mb-8 hover:scale-105 transition-transform cursor-default">
          <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-spin" style={{ animationDuration: "8s" }} />
          <span className="text-xs font-semibold tracking-wide text-indigo-700 dark:text-indigo-200">
            Zero Cache • 100% Live Streams • Pure Raw Telemetry
          </span>
        </div>

        {/* Hero Title: Geometric Sans + Flowing Italic Accent */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-sans font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.05]">
          AI Intelligence that{" "}
          <span className="font-editorial-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-violet-200 dark:via-pink-200 dark:to-indigo-100 block sm:inline">
            moves the Needle
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-2xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Skip the stale sanitizers and canned summaries. Jump straight into raw preprints, live Reddit chatter, and multi-model inference.
        </p>

        {/* Primary Action Button Bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="btn-white-pill rounded-full px-8 py-4 font-bold text-base sm:text-lg flex items-center gap-3 shadow-2xl hover:scale-105 transition-all group"
          >
            <span>Launch Command Center</span>
            <div className="w-7 h-7 rounded-full bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/dashboard?tab=snapshot"
            className="glass-pill rounded-full px-7 py-4 text-sm sm:text-base font-semibold flex items-center gap-2 shadow-md hover:scale-105 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Parallel Snapshot ⚡</span>
          </Link>
        </div>

        {/* Interactive "Needle Movement" Slider Fun Widget */}
        <div className="mt-16 w-full max-w-lg glass-card rounded-3xl p-6 border border-black/10 dark:border-white/10 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
              <Gauge className="w-4 h-4 text-indigo-500" />
              <span>Needle Movement</span>
            </span>
            <span className={`font-bold ${status.color}`}>
              {needleLevel}% • {status.label}
            </span>
          </div>

          {/* Interactive Range Slider */}
          <div className="relative flex items-center my-2">
            <input
              type="range"
              min="10"
              max="100"
              value={needleLevel}
              onChange={(e) => setNeedleLevel(Number(e.target.value))}
              className="w-full h-2.5 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-zinc-300 mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
            <span>10% Low Signal</span>
            <button
              onClick={() => setNeedleLevel(100)}
              className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20 font-bold transition-colors"
            >
              MAX OVERDRIVE (100%)
            </button>
            <span>100% Impact</span>
          </div>
        </div>
      </section>

      {/* Main Feature Launchpads: Pure CTAs to Deep Routes */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Choose Your Intelligence Arena
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-2">
            Each route is packed with live telemetry, direct filters, and un-sanitized API payload viewers.
          </p>
        </div>

        {/* 4 Clickable Arena Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {arenas.map((arena) => (
            <Link
              key={arena.id}
              href={arena.route}
              className="glass-card rounded-3xl p-8 border border-black/10 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    {arena.icon}
                  </div>
                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 border border-black/5 dark:border-white/10">
                    {arena.tag}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-zinc-950 dark:text-white tracking-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  {arena.name}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  {arena.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                <span>Enter Arena</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* Reference Image 1 Inspired Split Card (Playful CTA Rocket) */}
        <section className="rounded-[2.5rem] overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#0d121f]/70 backdrop-blur-xl shadow-2xl grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Warm Peach Radiant Mesh */}
          <div className="lg:col-span-6 mesh-peach-card p-8 sm:p-12 flex flex-col justify-between text-zinc-950">
            <div>
              <div className="flex items-center gap-2.5 mb-8">
                <div className="w-9 h-9 rounded-2xl bg-black flex items-center justify-center text-white shadow-lg">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <span className="font-extrabold tracking-tight text-xl text-zinc-950">
                  Instant Launchpad
                </span>
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 bg-white/60 px-3 py-1 rounded-full shadow-sm">
                Zero Stale Cache
              </span>

              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 mt-6 leading-tight">
                Inspect genuine live API outputs in their native glory.
              </h3>

              <p className="text-sm sm:text-base text-zinc-800 mt-4 leading-relaxed font-normal">
                Pick any research channel to jump directly to its live query console with un-altered XML, JSON, and network headers.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-black/10 flex items-center justify-between text-xs font-semibold text-zinc-900">
              <span>● Direct Node Fetching</span>
              <span>● Live In-Memory Streaming</span>
            </div>
          </div>

          {/* Right Column: Interactive Quick Launch Selector */}
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white dark:bg-zinc-950/40">
            <div>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Rocket className="w-5 h-5" />
              </div>

              <h4 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight mb-2">
                Fast Portal Selector
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                Click a destination to immediately open its live terminal.
              </p>

              {/* Arena Option Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {arenas.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedArena(a)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      selectedArena.id === a.id
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold border-transparent shadow-lg scale-[1.02]"
                        : "bg-black/[0.03] dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border-black/10 dark:border-white/10 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                    }`}
                  >
                    <div className="text-lg mb-1">{a.icon}</div>
                    <div className="text-sm font-semibold">{a.name}</div>
                    <div className="text-[11px] opacity-70 truncate">{a.tag}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-6 border-t border-black/[0.08] dark:border-white/[0.08]">
              <Link
                href={selectedArena.route}
                className="w-full py-4 px-6 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-bold text-base flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-all group"
              >
                <span>Jump Into {selectedArena.name}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom Full-Width CTA Card */}
        <section className="rounded-3xl p-8 sm:p-12 border border-indigo-100 dark:border-white/10 bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:via-[#0d1222] dark:to-violet-950/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Ready to take full command?
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Access the full multi-module console with live real-time queries and raw schema inspectors.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="btn-white-pill rounded-full px-8 py-4 text-base font-bold flex items-center gap-3 whitespace-nowrap shadow-xl hover:scale-105 transition-all"
          >
            <span>Open Command Center ⚡</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-black/[0.08] dark:border-white/[0.08] bg-slate-100/60 dark:bg-[#05060b] py-8 px-4 text-xs text-zinc-500 dark:text-zinc-400 mt-16 transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900 dark:text-white">DAILY BUGLE</span>
            <span>•</span>
            <span>Live Stream Intelligence Engine</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/dashboard?tab=arxiv" className="hover:text-zinc-900 dark:hover:text-white transition-colors">arXiv Wire</Link>
            <Link href="/dashboard?tab=reddit" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Reddit Watcher</Link>
            <Link href="/dashboard?tab=substack" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Substack</Link>
            <Link href="/dashboard?tab=llm" className="hover:text-zinc-900 dark:hover:text-white transition-colors">OpenRouter</Link>
          </div>

          <div>
            <span>Next.js 16 • Zero Cache • Live Telemetry</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
