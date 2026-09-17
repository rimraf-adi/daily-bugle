"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import {
  Terminal,
  Cpu,
  Radio,
  Globe,
  Activity,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Layers,
  Database,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const [tickerIndex, setTickerIndex] = useState(0);

  const breakingHeadlines = [
    "BREAKING: arXiv cs.AI hits record 420 submissions in 24 hours.",
    "REDDIT WIRE: r/LocalLLaMA benchmarks new reasoning architectures on consumer 4090 GPUs.",
    "SUBSTACK RADAR: New analysis on frontier model compute clusters and inter-datacenter fabric.",
    "OPENROUTER STATUS: Zero-latency fallbacks active across 240+ multi-modal endpoints.",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % breakingHeadlines.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [breakingHeadlines.length]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c0e] text-[#e4e4e7]">
      <Header />

      {/* Breaking News Ticker */}
      <section className="border-b border-[#22262d] bg-[#101216] px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 text-white font-bold uppercase rounded-sm text-[10px] tracking-wider animate-pulse">
            <Zap className="w-3 h-3" />
            Breaking Dispatch
          </span>
          <p className="text-zinc-300 truncate transition-all duration-300">
            {breakingHeadlines[tickerIndex]}
          </p>
        </div>
      </section>

      {/* Main Front Page Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Top Hero Banner */}
        <div className="mb-8 p-6 sm:p-8 rounded-xl border border-[#272a30] bg-gradient-to-br from-[#13161c] via-[#0f1115] to-[#0c0d0f] relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-red-400 text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Next.js 16 + TypeScript Engine</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white mb-4 leading-tight">
              The AI Intelligence Bureau For Engineers, Researchers & Editors
            </h2>
            <p className="text-base sm:text-lg text-zinc-300 mb-6 font-serif leading-relaxed">
              Synthesize real-time preprints from <strong className="text-zinc-100 font-semibold">arXiv</strong>, unauthenticated community streams from <strong className="text-zinc-100 font-semibold">Reddit</strong>, targeted newsletter dispatches from <strong className="text-zinc-100 font-semibold">Gmail IMAP</strong>, and unified LLM generation via <strong className="text-zinc-100 font-semibold">OpenRouter</strong>. All with non-sanitized raw API payload inspection.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-mono text-sm font-semibold rounded-lg shadow-lg hover:shadow-red-600/20 transition-all group"
              >
                <Terminal className="w-4 h-4" />
                <span>Launch Command Center</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard?tab=arxiv"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#1c2026] hover:bg-[#252b33] text-zinc-200 font-mono text-sm rounded-lg border border-[#2f3540] transition-all"
              >
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>Inspect arXiv Wire</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Newspaper 3-Column Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Main Column: Front Page Lead Story (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#22262d] pb-8 lg:pb-0 lg:pr-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-red-500 font-bold tracking-wider mb-2">
                <span>Special Investigation</span>
                <span className="text-zinc-600">•</span>
                <span>Open-Source Frontier</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-serif font-black text-zinc-100 leading-tight mb-3 hover:text-red-400 transition-colors cursor-pointer">
                Local Reasoning Architectures Surpass Proprietary Baselines Across Scientific Benchmarks
              </h3>
              <p className="text-sm font-mono text-zinc-400 mb-4">
                By <span className="text-zinc-200">The Bugle Technology Desk</span> • Published Today • 6 min read
              </p>
              <p className="text-base text-zinc-300 font-serif leading-relaxed mb-4">
                A massive wave of technical preprints across <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">cs.AI</code> and <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-300">cs.LG</code> indicates that chain-of-thought distillation combined with reinforcement learning from verifiable rewards has closed the gap with commercial frontier systems. Independent practitioners in the open community have verified reproducibility on single-node hardware.
              </p>
              <div className="p-4 rounded-lg bg-[#121519] border border-[#23272f] mb-4">
                <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Key Technical Signals
                </div>
                <ul className="text-xs font-mono text-zinc-300 space-y-1.5 list-disc list-inside">
                  <li>Zero-degradation 4-bit and 6-bit quantization kernels enabled on consumer GPUs</li>
                  <li>Over 160 specialized categories monitored in real-time on arXiv</li>
                  <li>Zero-API-key Reddit monitoring tracks bug reports within minutes of release</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1e2229] flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Source: arXiv API & r/LocalLLaMA stream</span>
              <Link
                href="/dashboard?tab=arxiv"
                className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
              >
                <span>Read Full Papers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Secondary Dispatches (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Box 1: arXiv Dispatch */}
            <div className="p-5 rounded-lg border border-[#252830] bg-[#121417] hover:border-[#353b47] transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">
                  arXiv Research Wire
                </span>
                <span className="text-xs font-mono text-zinc-500">166 Disciplines</span>
              </div>
              <h4 className="text-lg font-serif font-bold text-zinc-100 mb-1">
                Automated Taxonomy & XML Ingestion
              </h4>
              <p className="text-xs text-zinc-400 font-serif leading-relaxed mb-3">
                Full coverage of computer science, mathematics, statistics, and physics with automatic wildcard expansion and raw Atom XML inspection.
              </p>
              <Link
                href="/dashboard?tab=arxiv"
                className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Query Category Index</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Box 2: Reddit Community Wire */}
            <div className="p-5 rounded-lg border border-[#252830] bg-[#121417] hover:border-[#353b47] transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-orange-950/60 text-orange-400 border border-orange-800/40">
                  Reddit Watcher
                </span>
                <span className="text-xs font-mono text-emerald-400">Zero-Auth Active</span>
              </div>
              <h4 className="text-lg font-serif font-bold text-zinc-100 mb-1">
                Public RSS Community Scraper
              </h4>
              <p className="text-xs text-zinc-400 font-serif leading-relaxed mb-3">
                Crawl hot, new, and top posts from r/LocalLLaMA, r/MachineLearning, and r/artificial with 2.5s politeness throttling and seen-post deduplication.
              </p>
              <Link
                href="/dashboard?tab=reddit"
                className="text-xs font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                <span>View Community Feeds</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Box 3: Substack & LLM Router */}
            <div className="p-5 rounded-lg border border-[#252830] bg-[#121417] hover:border-[#353b47] transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-800/40">
                  Substack & OpenRouter
                </span>
                <span className="text-xs font-mono text-zinc-500">IMAP + API</span>
              </div>
              <h4 className="text-lg font-serif font-bold text-zinc-100 mb-1">
                Newsletter Tracking & Generation
              </h4>
              <p className="text-xs text-zinc-400 font-serif leading-relaxed mb-3">
                Read Substack emails via Node.js TLS IMAP, extract canonical web URLs, and synthesize newsletters with OpenRouter token monitoring.
              </p>
              <Link
                href="/dashboard?tab=llm"
                className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <span>Open LLM Studio</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Capabilities Grid */}
        <section className="mb-16 pt-8 border-t border-[#22262d]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-zinc-100 mb-2">
              Engineered For Complete Architectural Control
            </h3>
            <p className="text-sm font-serif text-zinc-400">
              Direct conversion from Python to modern TypeScript. No hidden sanitizers, full raw payload transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl bg-[#111317] border border-[#262a31]">
              <div className="w-10 h-10 rounded-lg bg-blue-950/50 flex items-center justify-center text-blue-400 mb-4 border border-blue-800/30">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-zinc-100 mb-2 font-mono">166 arXiv Categories</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Full taxonomy support with discipline filters and automatic wildcard normalization (<code className="text-zinc-300">cat:stat.*</code>).
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#111317] border border-[#262a31]">
              <div className="w-10 h-10 rounded-lg bg-orange-950/50 flex items-center justify-center text-orange-400 mb-4 border border-orange-800/30">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-zinc-100 mb-2 font-mono">Zero-Auth Reddit</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Crawls public Atom/RSS streams without Reddit developer tokens, featuring alias correction and 60s in-memory TTL caching.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#111317] border border-[#262a31]">
              <div className="w-10 h-10 rounded-lg bg-amber-950/50 flex items-center justify-center text-amber-400 mb-4 border border-amber-800/30">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-zinc-100 mb-2 font-mono">Direct Gmail IMAP</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Connects securely over TLS to Gmail, extracts canonical Substack post links, and surfaces raw RFC822 message headers.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#111317] border border-[#262a31]">
              <div className="w-10 h-10 rounded-lg bg-purple-950/50 flex items-center justify-center text-purple-400 mb-4 border border-purple-800/30">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-zinc-100 mb-2 font-mono">OpenRouter Studio</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Interact with any model, verify prompt/completion token counts, and inspect the exact un-altered response schema.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="p-8 rounded-xl border border-red-900/40 bg-gradient-to-r from-red-950/40 via-[#161214] to-[#121418] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mb-1">
              Ready to take full command of the newsroom?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 font-serif">
              Access the interactive dashboard to trigger real-time queries, manage watchlists, and inspect raw API payloads.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-mono text-sm font-semibold rounded-lg shadow-lg hover:shadow-red-600/30 transition-all whitespace-nowrap"
          >
            <Terminal className="w-4 h-4" />
            <span>Open Command Center</span>
          </Link>
        </section>
      </main>

      {/* Editorial Colophon / Footer */}
      <footer className="border-t border-[#22262d] bg-[#090a0b] px-4 py-8 mt-12 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-zinc-300 font-bold tracking-wider">THE DAILY BUGLE</span> • Automated Newsroom Platform
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard?tab=arxiv" className="hover:text-zinc-300 transition-colors">arXiv</Link>
            <span>•</span>
            <Link href="/dashboard?tab=reddit" className="hover:text-zinc-300 transition-colors">Reddit</Link>
            <span>•</span>
            <Link href="/dashboard?tab=substack" className="hover:text-zinc-300 transition-colors">Substack</Link>
            <span>•</span>
            <Link href="/dashboard?tab=llm" className="hover:text-zinc-300 transition-colors">OpenRouter</Link>
          </div>
          <div>
            <span>Next.js 16 + React 19 + TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
