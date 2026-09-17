"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  BookOpen,
  Sparkle,
  Layers,
  Flame,
} from "lucide-react";

export default function LandingPage() {
  // Doomscroll Reclaimer Calculator State
  const [scrollHours, setScrollHours] = useState<number>(2.0);

  // Calculate annual metrics
  const yearlyHoursLost = Math.round(scrollHours * 365);
  const yearlyDaysLost = (yearlyHoursLost / 24).toFixed(1);
  const bugleReadHours = Math.round((5 / 60) * 365); // 5 mins/day
  const hoursReclaimed = Math.max(0, yearlyHoursLost - bugleReadHours);

  // Selected Beat for Interactive Edition Preview
  const [selectedBeat, setSelectedBeat] = useState<{
    id: string;
    label: string;
    section: string;
    headline: string;
    takeaway: string;
    source: string;
  }>({
    id: "llm",
    label: "Frontier LLMs",
    section: "SEC. 01 // BREAKTHROUGH OF THE DAY",
    headline: "Test-Time Compute Scaling Beyond Autoregressive Limits",
    takeaway: "Inference-time search and verifier feedback achieve 4x benchmark gains without additional pre-training parameters.",
    source: "arXiv:2502.14892 [cs.AI] • 4 min read",
  });

  const beats = [
    {
      id: "llm",
      label: "Frontier LLMs",
      section: "SEC. 01 // BREAKTHROUGH OF THE DAY",
      headline: "Test-Time Compute Scaling Beyond Autoregressive Limits",
      takeaway: "Inference-time search and verifier feedback achieve 4x benchmark gains without additional pre-training parameters.",
      source: "arXiv:2502.14892 [cs.AI] • 4 min read",
    },
    {
      id: "weights",
      label: "Open Weights",
      section: "SEC. 02 // COMMUNITY CONSENSUS",
      headline: "Quantized 70B MoE Serving on Single Consumer GPUs",
      takeaway: "Community benchmarks confirm FP4 mixed-precision cache achieves 48 tokens/sec on Mac Studio silicon.",
      source: "r/LocalLLaMA • 842 upvotes • 3 min read",
    },
    {
      id: "quantum",
      label: "Quantum Systems",
      section: "SEC. 03 // QUANTUM DISPATCH",
      headline: "Surface-Code Logical Qubit Fidelity Exceeds 99.8%",
      takeaway: "Physical error suppression milestones validate fault-tolerant quantum error correction in neutral-atom arrays.",
      source: "arXiv:2502.09180 [quant-ph] • 5 min read",
    },
    {
      id: "substack",
      label: "Executive Briefs",
      section: "SEC. 04 // NEWSLETTER RADAR",
      headline: "The Architecture of Compute Sovereign Clusters in 2026",
      takeaway: "Capital expenditures shift from monolithic cloud data centers to distributed micro-grids and optical interconnects.",
      source: "Substack Dispatch • 3 min read",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-main)] selection:bg-[var(--accent-terracotta)]/20 selection:text-[var(--accent-terracotta)] relative overflow-hidden transition-colors duration-400">
      {/* Living Atmospheric Glow Orbs (High Gaussian Blurs) */}
      <div className="glow-orb-terracotta top-[-80px] left-1/2 -translate-x-1/2 w-[720px] h-[480px] pointer-events-none -z-10 opacity-70" />
      <div className="glow-orb-champagne top-[280px] left-[10%] w-[500px] h-[400px] pointer-events-none -z-10 opacity-60" />
      <div className="glow-orb-terracotta top-[750px] right-[5%] w-[550px] h-[450px] pointer-events-none -z-10 opacity-40" />

      {/* Floating Pill Navigation */}
      <Header />

      {/* Hero Section: The Anti-Doomscroll Mission */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 text-center max-w-5xl mx-auto flex flex-col items-center animate-fade-in-up">
        {/* Minimalist Editorial Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-editorial-pill shadow-sm mb-8 hover:scale-[1.02] transition-transform cursor-default">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-terracotta)] animate-pulse" />
          <span className="text-xs font-mono font-medium tracking-wide text-zinc-800 dark:text-zinc-200">
            SEC. 00 // ANTI-DOOMSCROLL BRIEFING • FINITE BY DESIGN
          </span>
        </div>

        {/* Hero Title: Modern Sans + Editorial Serif Italic Accent */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-sans font-extrabold tracking-tight text-zinc-950 dark:text-[#f7f8f8] leading-[1.05]">
          A personalized newspaper for the digital era.{" "}
          <span className="font-editorial-italic font-normal text-[var(--accent-terracotta)] block sm:inline">
            Engineered to kill the doomscroll.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-2xl text-[#5b5a57] dark:text-[#8a8f98] max-w-3xl mx-auto font-normal leading-relaxed">
          Trade 2 hours of algorithmic sludge for a finite 5-minute daily edition. Your topics, your preprints, high-signal community debates, and curated newsletters — read once, stay informed, and get on with your day.
        </p>

        {/* Primary Action Button Bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/edition"
            className="btn-editorial-primary rounded-full px-8 py-4 font-bold text-base sm:text-lg flex items-center gap-3 shadow-xl hover:scale-105 transition-all group"
          >
            <span>Read Today's Edition</span>
            <div className="w-7 h-7 rounded-full bg-[var(--accent-terracotta)] text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="glass-editorial-pill rounded-full px-7 py-4 text-sm sm:text-base font-semibold flex items-center gap-2 shadow-md hover:scale-105 transition-all"
          >
            <Sliders className="w-4 h-4 text-[var(--accent-terracotta)]" />
            <span>Open Signal Lab</span>
          </Link>
        </div>

        {/* Interactive "Doomscroll Reclaimer" Calculator Widget */}
        <div className="mt-16 w-full max-w-xl glass-editorial-card rounded-3xl p-6 sm:p-8 border shadow-2xl text-left">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-terracotta)]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Doomscroll Reclaimer Calculator
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--accent-terracotta)]/15 text-[var(--accent-terracotta)]">
              {scrollHours} hrs / day
            </span>
          </div>

          {/* Interactive Range Slider */}
          <div className="my-4">
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.5"
              value={scrollHours}
              onChange={(e) => setScrollHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent-terracotta)]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#5b5a57] dark:text-[#8a8f98] mt-1.5">
              <span>30m light browse</span>
              <span>2h average feed</span>
              <span>4h deep doomscroll</span>
            </div>
          </div>

          {/* Impact Comparison Grid */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-black/[0.06] dark:border-white/[0.06]">
            <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04]">
              <span className="text-[11px] font-mono text-[#5b5a57] dark:text-[#8a8f98] block">
                Yearly Time Lost to Feeds
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white mt-1 block">
                {yearlyHoursLost} hrs
              </span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                ≈ {yearlyDaysLost} days of your year
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--accent-terracotta)]/10 border border-[var(--accent-terracotta)]/20">
              <span className="text-[11px] font-mono text-[var(--accent-terracotta)] font-semibold block">
                Time Reclaimed With Bugle
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[var(--accent-terracotta)] mt-1 block">
                +{hoursReclaimed} hrs
              </span>
              <span className="text-[10px] text-[var(--accent-terracotta)] font-medium">
                In a 5-min finite daily paper
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive "Build Your Personal Edition" Live Preview */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-20">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-mono font-bold tracking-widest text-[var(--accent-terracotta)] uppercase">
            Curate Your Daily Signals
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-[#f7f8f8] mt-2">
            Pick your beats. We compile the edition.
          </h2>
          <p className="text-sm sm:text-base text-[#5b5a57] dark:text-[#8a8f98] mt-2">
            No infinite recommendation algorithms. You declare your signals, and our engine filters out flamewars, noise, and spam.
          </p>
        </div>

        {/* Interactive Beat Selector & Live Front-Page Preview */}
        <section className="rounded-[2.5rem] overflow-hidden border border-black/10 dark:border-white/10 glass-editorial-card shadow-2xl grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Beat Selector Controls */}
          <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-black/[0.08] dark:border-white/[0.08]">
            <div>
              <span className="text-xs font-mono tracking-widest text-[#5b5a57] dark:text-[#8a8f98] uppercase font-semibold">
                Interactive Personalizer
              </span>
              <h3 className="text-2xl font-bold text-zinc-950 dark:text-white mt-1 mb-6">
                Choose a signal channel
              </h3>

              <div className="space-y-2.5">
                {beats.map((beat) => (
                  <button
                    key={beat.id}
                    onClick={() => setSelectedBeat(beat)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedBeat.id === beat.id
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-bold border-transparent shadow-lg scale-[1.01]"
                        : "bg-black/[0.02] dark:bg-white/[0.03] text-zinc-700 dark:text-zinc-300 border-black/[0.06] dark:border-white/[0.06] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{beat.label}</span>
                      <span className="text-[10px] font-mono opacity-70">
                        {beat.id === selectedBeat.id ? "ACTIVE" : "SELECT"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs text-[#5b5a57] dark:text-[#8a8f98]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero Algorithmic Bias</span>
              </span>
              <span>Finite 5m Cap</span>
            </div>
          </div>

          {/* Right Column: Live Front-Page Preview Card (Warm Terracotta / Champagne Silk) */}
          <div className="lg:col-span-7 mesh-terracotta-card p-8 sm:p-12 flex flex-col justify-between text-zinc-950 relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full bg-black/10 dark:bg-black/30 backdrop-blur-md">
                  {selectedBeat.section}
                </span>
                <span className="text-xs font-mono font-semibold opacity-80">
                  ISSUE #104 • TODAY'S EDITION
                </span>
              </div>

              <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-950 leading-snug">
                "{selectedBeat.headline}"
              </h4>

              <div className="mt-5 p-5 rounded-2xl bg-white/70 dark:bg-white/80 backdrop-blur-md border border-black/10 shadow-sm text-zinc-900">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent-terracotta)] block mb-1.5">
                  Why It Matters For Your Focus
                </span>
                <p className="text-sm sm:text-base leading-relaxed">
                  {selectedBeat.takeaway}
                </p>
              </div>

              <div className="mt-4 text-xs font-mono text-zinc-800 dark:text-zinc-800 opacity-90">
                {selectedBeat.source}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-black/15 flex items-center justify-between">
              <Link
                href="/edition"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 font-bold text-sm shadow-xl transition-all hover:scale-105 group"
              >
                <span>Read Full Today's Edition</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <span className="text-xs font-mono font-semibold text-zinc-900 hidden sm:inline">
                Zero Infinite Scroll
              </span>
            </div>
          </div>
        </section>

        {/* The 3 Tenets of Digital-Era Journalism */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
              The 3 Tenets of Anti-Doomscroll Journalism
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-editorial-card rounded-3xl p-8 border">
              <div className="text-xs font-mono font-bold text-[var(--accent-terracotta)] mb-4">
                TENET 01 //
              </div>
              <h4 className="text-xl font-bold text-zinc-950 dark:text-white mb-2">
                Finite by Design
              </h4>
              <p className="text-sm text-[#5b5a57] dark:text-[#8a8f98] leading-relaxed">
                Clear start, clear finish line. When you reach the bottom of your edition, you get a clean milestone and close the tab. No endless feed traps.
              </p>
            </div>

            <div className="glass-editorial-card rounded-3xl p-8 border">
              <div className="text-xs font-mono font-bold text-[var(--accent-terracotta)] mb-4">
                TENET 02 //
              </div>
              <h4 className="text-xl font-bold text-zinc-950 dark:text-white mb-2">
                Zero Algorithmic Outrage
              </h4>
              <p className="text-sm text-[#5b5a57] dark:text-[#8a8f98] leading-relaxed">
                No black-box engagement algorithms selecting rage-bait to keep you glued. Feeds are drawn directly from peer-reviewed preprints and source RSS.
              </p>
            </div>

            <div className="glass-editorial-card rounded-3xl p-8 border">
              <div className="text-xs font-mono font-bold text-[var(--accent-terracotta)] mb-4">
                TENET 03 //
              </div>
              <h4 className="text-xl font-bold text-zinc-950 dark:text-white mb-2">
                High-Signal Distillation
              </h4>
              <p className="text-sm text-[#5b5a57] dark:text-[#8a8f98] leading-relaxed">
                Distills hundreds of arXiv papers and thousands of forum comments into actionable executive takeaways so you stay at the frontier in minutes.
              </p>
            </div>
          </div>
        </section>

        {/* Direct Sub-Channel Portals */}
        <section className="glass-editorial-card rounded-3xl p-8 sm:p-12 border flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="max-w-xl">
            <span className="text-xs font-mono font-semibold text-[var(--accent-terracotta)] uppercase tracking-wider">
              Deep Raw Telemetry
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white tracking-tight mt-1">
              Need raw inspection or multi-model completions?
            </h3>
            <p className="text-sm text-[#5b5a57] dark:text-[#8a8f98] mt-2">
              The Signal Lab gives you low-level access to arXiv query builders, live Reddit watcher, TLS IMAP inboxes, and 240+ frontier models.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="btn-editorial-primary rounded-full px-8 py-4 text-base font-bold flex items-center gap-3 whitespace-nowrap shadow-xl hover:scale-105 transition-all"
          >
            <span>Launch Signal Lab</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Minimalist Editorial Footer */}
      <footer className="border-t border-black/[0.08] dark:border-white/[0.08] bg-black/[0.01] dark:bg-black/[0.2] py-8 px-4 text-xs text-[#5b5a57] dark:text-[#8a8f98] mt-20 transition-colors duration-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-base text-zinc-950 dark:text-white">Daily Bugle</span>
            <span>•</span>
            <span>The Personalized Newspaper for the Digital Era</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/edition" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Today's Edition</Link>
            <Link href="/dashboard" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Signal Lab</Link>
            <Link href="/dashboard?tab=arxiv" className="hover:text-zinc-950 dark:hover:text-white transition-colors">arXiv</Link>
            <Link href="/dashboard?tab=reddit" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Reddit</Link>
          </div>

          <div>
            <span>Finite Daily Briefing • Reclaim Your Focus</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
