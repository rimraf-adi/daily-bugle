"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ArxivPaper, ArxivQueryResult } from "@/types/arxiv";
import { RedditPost, RedditQueryResult } from "@/types/reddit";
import { SubstackEmail, GmailQueryResult } from "@/types/gmail";
import {
  Clock,
  BookOpen,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sliders,
  Filter,
  RefreshCw,
  Sparkle,
  Share2,
  Layers,
  ArrowUpRight,
} from "lucide-react";

export default function EditionPage() {
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [activeBeat, setActiveBeat] = useState<string>("all");

  // Live Zero-Cache Data State
  const [loading, setLoading] = useState<boolean>(true);
  const [papers, setPapers] = useState<ArxivPaper[]>([]);
  const [redditPosts, setRedditPosts] = useState<RedditPost[]>([]);
  const [emails, setEmails] = useState<SubstackEmail[]>([]);

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(currentProgress);
        if (currentProgress > 85) {
          setIsFinished(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch live zero-cache edition streams concurrently
  const loadEdition = async () => {
    setLoading(true);
    try {
      const [arxivRes, redditRes, gmailRes] = await Promise.allSettled([
        fetch("/api/arxiv?category=cs.AI&maxResults=6", { cache: "no-store" }),
        fetch("/api/reddit?sub=LocalLLaMA&limit=5", { cache: "no-store" }),
        fetch("/api/gmail?limit=4", { cache: "no-store" }),
      ]);

      if (arxivRes.status === "fulfilled" && arxivRes.value.ok) {
        const data: ArxivQueryResult = await arxivRes.value.json();
        setPapers(data.papers || []);
      }

      if (redditRes.status === "fulfilled" && redditRes.value.ok) {
        const data: RedditQueryResult = await redditRes.value.json();
        setRedditPosts(data.posts || []);
      }

      if (gmailRes.status === "fulfilled" && gmailRes.value.ok) {
        const data: GmailQueryResult = await gmailRes.value.json();
        setEmails(data.emails || []);
      }
    } catch (err) {
      console.error("Failed to load edition data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEdition();
  }, []);

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const leadPaper = papers[0];
  const wirePapers = papers.slice(1, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-main)] selection:bg-[var(--accent-terracotta)]/20 selection:text-[var(--accent-terracotta)] relative overflow-hidden transition-colors duration-400">
      {/* Dynamic Reading Progress Bar at the Very Top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/10 z-[100]">
        <div
          className="h-full bg-[var(--accent-terracotta)] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Atmospheric Ambient Glow Orbs */}
      <div className="glow-orb-terracotta top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] pointer-events-none -z-10 opacity-60" />
      <div className="glow-orb-champagne top-[600px] left-[5%] w-[450px] h-[380px] pointer-events-none -z-10 opacity-50" />

      {/* Floating Pill Navigation */}
      <Header />

      {/* Newspaper Masthead Section */}
      <div className="max-w-5xl mx-auto w-full px-4 pt-8 pb-6 animate-fade-in-up">
        {/* Edition Metadata Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#5b5a57] dark:text-[#8a8f98] pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-950 dark:text-[#f7f8f8]">DAILY BUGLE</span>
            <span>•</span>
            <span>VOL. CIV, NO. 260</span>
            <span>•</span>
            <span className="text-[var(--accent-terracotta)] font-semibold">FINITE MORNING EDITION</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[var(--accent-terracotta)] font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>~4 MIN READ</span>
            </span>
            <span>{todayFormatted}</span>
          </div>
        </div>

        {/* Masthead Title */}
        <div className="text-center py-10">
          <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-terracotta)] font-bold">
            The Anti-Doomscroll Digest
          </span>
          <h1 className="font-editorial-italic text-5xl sm:text-7xl font-normal text-zinc-950 dark:text-[#f7f8f8] mt-2">
            Today's Briefing
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#5b5a57] dark:text-[#8a8f98] max-w-xl mx-auto leading-relaxed">
            Curated preprints, community debate consensus, and executive dispatches. No infinite feed. Once you read this, you are done for the day.
          </p>

          {/* Quick Filter Beat Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { id: "all", label: "Complete Briefing" },
              { id: "arxiv", label: "Research Wire (cs.AI)" },
              { id: "reddit", label: "Community Pulse (LocalLLaMA)" },
              { id: "substack", label: "Newsletter Radar" },
            ].map((beat) => (
              <button
                key={beat.id}
                onClick={() => setActiveBeat(beat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all ${
                  activeBeat === beat.id
                    ? "bg-zinc-950 text-white dark:bg-[#f7f8f8] dark:text-[#08090a] font-bold shadow-md"
                    : "glass-editorial-pill text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                }`}
              >
                {beat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Newspaper Content Body */}
      <main className="max-w-5xl mx-auto w-full px-4 pb-24 space-y-12 flex-1">
        {loading ? (
          <div className="glass-editorial-card rounded-3xl p-16 text-center border">
            <RefreshCw className="w-8 h-8 text-[var(--accent-terracotta)] animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
              Compiling Today's Edition...
            </h3>
            <p className="text-xs font-mono text-[#5b5a57] dark:text-[#8a8f98] mt-1">
              Pulling live preprints from arXiv and filtering community discussions
            </p>
          </div>
        ) : (
          <>
            {/* 1. LEAD STORY (Breakthrough of the Day) */}
            {(activeBeat === "all" || activeBeat === "arxiv") && leadPaper && (
              <section className="animate-fade-in-up">
                <div className="mesh-terracotta-card rounded-3xl p-8 sm:p-12 text-zinc-950 border border-black/10 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold tracking-widest px-3 py-1 rounded-full bg-black/10 dark:bg-black/30 backdrop-blur-md">
                      LEAD STORY // BREAKTHROUGH OF THE DAY
                    </span>
                    <span className="text-xs font-mono font-medium opacity-75">
                      {leadPaper.primaryCategory} • {(leadPaper.published || leadPaper.updated || "Today").split("T")[0]}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-zinc-950">
                    {leadPaper.title}
                  </h2>

                  {/* Authors Strip */}
                  <div className="mt-3 text-xs font-mono text-zinc-800 opacity-90">
                    By {leadPaper.authors.slice(0, 4).join(", ")}
                    {leadPaper.authors.length > 4 ? " et al." : ""}
                  </div>

                  {/* Executive Distillation Box */}
                  <div className="mt-6 p-6 rounded-2xl bg-white/75 dark:bg-white/85 backdrop-blur-md border border-black/10 shadow-sm text-zinc-900">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent-terracotta)] block mb-2">
                      Executive Takeaway // Why It Matters
                    </span>
                    <p className="text-sm sm:text-base leading-relaxed">
                      {(leadPaper.abstract || leadPaper.summary || "").length > 280
                        ? (leadPaper.abstract || leadPaper.summary || "").slice(0, 280) + "..."
                        : leadPaper.abstract || leadPaper.summary || ""}
                    </p>
                  </div>

                  {/* Read Paper Action */}
                  <div className="mt-6 pt-5 border-t border-black/15 flex items-center justify-between">
                    <a
                      href={leadPaper.links.pdf || leadPaper.links.abstract}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-950 text-white hover:bg-zinc-800 font-bold text-xs shadow-md transition-transform hover:scale-105"
                    >
                      <span>Read Full Preprint (PDF)</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-xs font-mono font-semibold text-zinc-900 hidden sm:inline">
                      Finite Briefing • Zero Junk Notifications
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* 2. THE RESEARCH WIRE (Curated arXiv Preprints) */}
            {(activeBeat === "all" || activeBeat === "arxiv") && wirePapers.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.08] dark:border-white/[0.08]">
                  <h3 className="text-lg font-extrabold text-zinc-950 dark:text-[#f7f8f8] tracking-tight">
                    The Research Wire
                  </h3>
                  <span className="text-xs font-mono text-[#5b5a57] dark:text-[#8a8f98]">
                    3 HIGH-SIGNAL PREPRINTS
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {wirePapers.map((paper, idx) => (
                    <div
                      key={paper.arxivId}
                      className="glass-editorial-card rounded-2xl p-6 border flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3 text-[10px] font-mono">
                          <span className="px-2 py-0.5 rounded-full bg-[var(--accent-terracotta)]/15 text-[var(--accent-terracotta)] font-semibold">
                            {paper.primaryCategory}
                          </span>
                          <span className="text-[#5b5a57] dark:text-[#8a8f98]">
                            0{idx + 2} //
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-zinc-950 dark:text-white leading-snug line-clamp-3 mb-2">
                          {paper.title}
                        </h4>

                        <p className="text-xs text-[#5b5a57] dark:text-[#8a8f98] leading-relaxed line-clamp-4">
                          {paper.abstract || paper.summary || ""}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
                        <a
                          href={paper.links.pdf || paper.links.abstract}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[var(--accent-terracotta)] hover:underline"
                        >
                          <span>PDF</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                        <span className="text-[10px] font-mono text-[#5b5a57] dark:text-[#8a8f98]">
                          {(paper.published || paper.updated || "Today").split("T")[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. COMMUNITY PULSE (Reddit Noise-Filtered Discussions) */}
            {(activeBeat === "all" || activeBeat === "reddit") && redditPosts.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.08] dark:border-white/[0.08]">
                  <h3 className="text-lg font-extrabold text-zinc-950 dark:text-[#f7f8f8] tracking-tight">
                    Community Consensus // r/LocalLLaMA
                  </h3>
                  <span className="text-xs font-mono text-[var(--accent-terracotta)]">
                    NOISE & FLAMEWARS FILTERED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {redditPosts.slice(0, 4).map((post) => (
                    <div
                      key={post.id}
                      className="glass-editorial-card rounded-2xl p-6 border flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5 text-[11px] font-mono">
                          <span className="text-[#5b5a57] dark:text-[#8a8f98]">
                            u/{post.author}
                          </span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            r/{post.subreddit}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-zinc-950 dark:text-white leading-snug mb-2">
                          {post.title}
                        </h4>

                        {post.contentText && (
                          <p className="text-xs text-[#5b5a57] dark:text-[#8a8f98] leading-relaxed line-clamp-3">
                            {post.contentText}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs">
                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-[var(--accent-terracotta)] hover:underline"
                        >
                          <span>Discussion Thread</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </a>
                        <span className="text-[10px] font-mono text-[#5b5a57] dark:text-[#8a8f98]">
                          Source RSS
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. NEWSLETTER RADAR (Substack Inboxes) */}
            {(activeBeat === "all" || activeBeat === "substack") && emails.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.08] dark:border-white/[0.08]">
                  <h3 className="text-lg font-extrabold text-zinc-950 dark:text-[#f7f8f8] tracking-tight">
                    Executive Newsletter Dispatch
                  </h3>
                  <span className="text-xs font-mono text-[#5b5a57] dark:text-[#8a8f98]">
                    DIRECT INBOX SYNC
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {emails.slice(0, 2).map((email) => (
                    <div
                      key={email.id}
                      className="glass-editorial-card rounded-2xl p-6 border flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2 text-[11px] font-mono text-[#5b5a57] dark:text-[#8a8f98]">
                          <span>{email.sender || email.senderName || "Substack"}</span>
                          <span>{email.date || "Recent"}</span>
                        </div>
                        <h4 className="text-base font-bold text-zinc-950 dark:text-white leading-snug mb-2">
                          {email.subject}
                        </h4>
                        <p className="text-xs text-[#5b5a57] dark:text-[#8a8f98] leading-relaxed line-clamp-3">
                          {email.bodyText.slice(0, 160)}...
                        </p>
                      </div>

                      {email.links && email.links.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                          <a
                            href={email.links[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-terracotta)] hover:underline"
                          >
                            <span>Read Full Newsletter</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. THE FINISH LINE (Anti-Doomscroll Milestone) */}
            <section className="pt-10">
              <div className="glass-editorial-card rounded-3xl p-8 sm:p-14 text-center border shadow-2xl relative overflow-hidden">
                {/* Visual Completion Seal */}
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-400">
                  Edition Complete • No Infinite Scroll
                </span>

                <h3 className="font-editorial-italic text-3xl sm:text-5xl font-normal text-zinc-950 dark:text-[#f7f8f8] mt-2">
                  You are completely caught up.
                </h3>

                <p className="mt-4 text-sm sm:text-base text-[#5b5a57] dark:text-[#8a8f98] max-w-lg mx-auto leading-relaxed">
                  You've absorbed today's key frontier breakthroughs, community consensus, and newsletter dispatches in under 5 minutes. No endless algorithm. Close this tab and go build something remarkable.
                </p>

                {/* Focus Reclaimed Stat Badge */}
                <div className="mt-8 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[var(--accent-terracotta)]/15 border border-[var(--accent-terracotta)]/25 text-[var(--accent-terracotta)] text-xs font-mono font-semibold">
                  <span>✓ ~45 minutes of doomscrolling eliminated today</span>
                </div>

                {/* Return / Signal Lab Controls */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/"
                    className="px-6 py-3 rounded-full text-xs font-semibold glass-editorial-pill hover:scale-105 transition-all"
                  >
                    Return to Front Page
                  </Link>

                  <Link
                    href="/dashboard"
                    className="btn-editorial-primary px-6 py-3 rounded-full text-xs font-semibold shadow-md hover:scale-105 transition-all"
                  >
                    Configure Tomorrow's Signals
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-black/[0.08] dark:border-white/[0.08] py-8 px-4 text-xs text-[#5b5a57] dark:text-[#8a8f98] transition-colors duration-400">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-base text-zinc-950 dark:text-white">Daily Bugle</span>
            <span>•</span>
            <span>Finite Digital Edition</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-white">Front Page</Link>
            <Link href="/dashboard" className="hover:text-zinc-950 dark:hover:text-white">Signal Lab</Link>
          </div>

          <span>Tomorrow's Edition drops at 06:00 UTC</span>
        </div>
      </footer>
    </div>
  );
}
