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
  Search,
} from "lucide-react";

export default function LandingPage() {
  const [quickQuery, setQuickQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("cs.AI");

  const partners = [
    { name: "arXiv.org", label: "166 Categories", desc: "Atom XML Stream" },
    { name: "Reddit RSS", label: "Zero-Auth Engine", desc: "Community Feeds" },
    { name: "Substack IMAP", label: "TLS Mailbox", desc: "Newsletter Radar" },
    { name: "OpenRouter", label: "240+ Endpoints", desc: "Token Tracking" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-main)] selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 relative overflow-hidden transition-colors duration-200">
      {/* Background Aurora Radial Gradients */}
      <div className="absolute top-0 left-0 right-0 h-[640px] aurora-hero pointer-events-none -z-10" />
      <div className="absolute top-48 left-1/2 -translate-x-1/2 w-[800px] h-[500px] aurora-glow-center pointer-events-none -z-10 blur-3xl opacity-60" />

      {/* Floating Pill Navigation Header */}
      <Header />

      {/* Hero Section (Matching Reference Image 2) */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 text-center max-w-6xl mx-auto flex flex-col items-center">
        {/* Top Micro Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10 backdrop-blur-md shadow-sm mb-8 hover:bg-black/[0.06] dark:hover:bg-white/[0.09] transition-all">
          <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
          <span className="text-xs font-medium text-indigo-700 dark:text-indigo-200">
            Next.js 16 • Zero-Auth Ingestion • Raw API Payloads
          </span>
        </div>

        {/* Hero Title: Mixed Sans & Italic Serif Accent (Image 2 Signature Headline) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-sans font-bold tracking-tight text-zinc-950 dark:text-white max-w-5xl mx-auto leading-[1.08]">
          AI Intelligence that{" "}
          <span className="font-editorial-italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-violet-200 dark:via-pink-200 dark:to-indigo-100">
            moves the Needle
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
          The unified intelligence hub engineered to deliver impact — not just impressions. Stream raw arXiv research, live Reddit discussions, Substack dispatches, and OpenRouter inferences.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {/* Glowing High-Contrast Pill Button */}
          <Link
            href="/dashboard"
            className="btn-white-pill rounded-full px-7 py-3.5 font-semibold text-sm sm:text-base flex items-center gap-3 group"
          >
            <span>Launch Command Center</span>
            <div className="w-6 h-6 rounded-full bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Secondary Glass Pill Button */}
          <Link
            href="/dashboard?tab=arxiv"
            className="glass-pill rounded-full px-6 py-3.5 text-sm sm:text-base font-medium flex items-center gap-2 shadow-sm transition-all"
          >
            <span>Explore arXiv Wire</span>
            <ArrowUpRight className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          </Link>
        </div>

        {/* Floating Ambient Badge Indicator */}
        <div className="mt-12 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] backdrop-blur-xl text-xs text-zinc-600 dark:text-zinc-400">
          <div className="flex -space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-[#06080e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-white dark:ring-[#06080e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-white dark:ring-[#06080e]" />
          </div>
          <span>Continuous feed ingestion active with zero developer credentials needed.</span>
        </div>
      </section>

      {/* Partner / Sources Strip */}
      <section className="border-y border-black/[0.06] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.015] py-8 px-4 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-6">
            Ingesting intelligence from open frontier networks
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/70 dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.05] shadow-sm hover:shadow transition-all"
              >
                <span className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
                  {partner.name}
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-300 font-mono mt-0.5 font-medium">
                  {partner.label}
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {partner.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-16">
        {/* Reference Image 1 Split Card Feature: Warm Peach Mesh Gradient + Glass Panel */}
        <section className="mb-20">
          <div className="rounded-[2rem] overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#0d121f]/70 backdrop-blur-xl shadow-xl dark:shadow-2xl dark:shadow-black/80 grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Warm Peach / Coral Gradient Mesh */}
            <div className="lg:col-span-6 mesh-peach-card p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden text-zinc-950">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-black/90 flex items-center justify-center text-white shadow-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-bold tracking-tight text-lg text-zinc-950">
                    Daily Bugle
                  </span>
                </div>

                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-800 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                  Raw API Transparency
                </span>

                <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 mt-6 leading-tight">
                  Get access to un-sanitized data payloads for clarity and control.
                </h3>

                <p className="text-sm sm:text-base text-zinc-800/90 mt-4 leading-relaxed font-normal">
                  No synthetic summaries or hidden truncations. Directly inspect pristine arXiv Atom XML feeds, Reddit RSS document trees, and raw OpenRouter token schemas.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-black/10 flex items-center justify-between text-xs font-medium text-zinc-900">
                <span>Zero Hallucination Filter</span>
                <span>Sub-10ms Cache Tier</span>
              </div>
            </div>

            {/* Right Column: Clean Interactive Hub */}
            <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white dark:bg-zinc-950/40">
              <div>
                <div className="w-7 h-7 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                  <Zap className="w-4 h-4" />
                </div>

                <h4 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
                  Interactive Intelligence Stream
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  Select a research stream to instantly inspect live feeds and raw schemas in real-time.
                </p>

                {/* Quick Stream Preset Pills */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2 font-medium">
                      Select Topic Stream
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { id: "cs.AI", label: "Artificial Intelligence" },
                        { id: "cs.LG", label: "Machine Learning" },
                        { id: "cs.CL", label: "NLP & LLMs" },
                        { id: "stat.ML", label: "Stats & ML" },
                        { id: "LocalLLaMA", label: "r/LocalLLaMA" },
                        { id: "OpenRouter", label: "LLM Studio" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedTopic(item.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left ${
                            selectedTopic === item.id
                              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-md"
                              : "bg-black/[0.03] text-zinc-700 hover:bg-black/[0.06] dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.06]"
                          }`}
                        >
                          <div className="font-semibold">{item.id}</div>
                          <div className="text-[10px] opacity-70 truncate">{item.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2 font-medium">
                      Custom Filter or Keyword
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={quickQuery}
                        onChange={(e) => setQuickQuery(e.target.value)}
                        placeholder="e.g. reasoning distillation, quant..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-6 border-t border-black/[0.08] dark:border-white/[0.08]">
                <Link
                  href={`/dashboard?tab=${
                    selectedTopic.startsWith("cs.") || selectedTopic.startsWith("stat.")
                      ? "arxiv"
                      : selectedTopic.startsWith("r/") || selectedTopic === "LocalLLaMA"
                      ? "reddit"
                      : "llm"
                  }`}
                  className="w-full py-3.5 px-6 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-zinc-950/10 dark:shadow-white/5 transition-all group"
                >
                  <span>Query {selectedTopic} Stream</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Feature Layout */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 dark:text-white mb-3">
              Four Specialized Intelligence Engines
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              Engineered with full TypeScript types, dual-tier caching, and zero authentication overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bento Card 1: arXiv */}
            <div className="glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                  <Cpu className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 mb-2 font-medium">
                  <span>166 Taxonomy Disciplines</span>
                  <span>•</span>
                  <span>Fast XML Parser</span>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                  arXiv Research Wire
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  Full coverage across Computer Science, Math, Physics, and Stats. Expand wildcard categories like <code className="text-blue-700 dark:text-blue-300 font-mono text-xs bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 rounded">cat:stat.*</code>, sort by submission or relevance, and inspect raw Atom XML payloads.
                </p>
              </div>
              <Link
                href="/dashboard?tab=arxiv"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                <span>Launch arXiv Wire</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Bento Card 2: Reddit */}
            <div className="glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/20 transition-all" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6">
                  <Radio className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-orange-600 dark:text-orange-400 mb-2 font-medium">
                  <span>Zero-Auth Engine</span>
                  <span>•</span>
                  <span>Rate-Limit Shield</span>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                  Reddit Community Watcher
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  Crawl public Atom/RSS streams from r/LocalLLaMA, r/MachineLearning, and r/singularity without requiring Reddit API keys. Features disk persistence and automatic 429 cooldown protection.
                </p>
              </div>
              <Link
                href="/dashboard?tab=reddit"
                className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                <span>Launch Reddit Watcher</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Bento Card 3: Substack */}
            <div className="glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-amber-400 mb-2 font-medium">
                  <span>TLS IMAP Connection</span>
                  <span>•</span>
                  <span>Canonical URL Scraper</span>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                  Substack Newsletter Radar
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  Direct connection to your mailbox over TLS. Automatically extracts Substack newsletter dispatches, identifies author publications, and parses canonical web links.
                </p>
              </div>
              <Link
                href="/dashboard?tab=substack"
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                <span>Launch Substack Radar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Bento Card 4: OpenRouter */}
            <div className="glass-card rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute -right-16 -top-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-purple-600 dark:text-purple-400 mb-2 font-medium">
                  <span>Unified Gateway</span>
                  <span>•</span>
                  <span>Token Metrics</span>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                  OpenRouter Studio
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  Interact with 240+ commercial and open-weight models including Claude 3.7, DeepSeek R1, and Llama 3.3. Verify exact prompt and completion tokens with zero middleman modification.
                </p>
              </div>
              <Link
                href="/dashboard?tab=llm"
                className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                <span>Launch LLM Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="rounded-3xl p-8 sm:p-12 border border-indigo-100 dark:border-white/10 bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-indigo-950/40 dark:via-[#0d1222] dark:to-violet-950/40 relative overflow-hidden shadow-xl dark:shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="relative z-10 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-tight mb-2">
              Step into the Unified Newsroom Command Center
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Explore live streams, test custom queries, manage subreddit watchlists, and inspect raw API payloads with zero friction.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="relative z-10 btn-white-pill rounded-full px-8 py-4 text-sm font-semibold flex items-center gap-3 whitespace-nowrap shadow-xl"
          >
            <span>Launch Command Center</span>
            <div className="w-6 h-6 rounded-full bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </section>
      </main>

      {/* Modern Minimalist Footer */}
      <footer className="border-t border-black/[0.08] dark:border-white/[0.08] bg-slate-100/60 dark:bg-[#05060b] py-10 px-4 text-xs text-zinc-500 dark:text-zinc-400 transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">Daily Bugle</span>
            <span>•</span>
            <span>Automated AI Intelligence Hub</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/dashboard?tab=arxiv" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">arXiv</Link>
            <Link href="/dashboard?tab=reddit" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Reddit</Link>
            <Link href="/dashboard?tab=substack" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">Substack</Link>
            <Link href="/dashboard?tab=llm" className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">OpenRouter</Link>
          </div>

          <div>
            <span>Next.js 16 • React 19 • TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
