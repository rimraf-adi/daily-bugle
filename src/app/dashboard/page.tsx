"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { RawPayloadViewer } from "@/components/RawPayloadViewer";
import {
  CATEGORY_MAP,
  listSubjects,
  getCategoriesBySubject,
} from "@/services/arxiv/taxonomy";
import { ArxivPaper, ArxivQueryResult } from "@/types/arxiv";
import { RedditPost, RedditQueryResult, TrackedSubreddit } from "@/types/reddit";
import { SubstackEmail, GmailQueryResult } from "@/types/gmail";
import { ChatResponse } from "@/types/llm";
import {
  Cpu,
  Radio,
  Globe,
  Activity,
  Terminal,
  Search,
  RefreshCw,
  ExternalLink,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Send,
  Plus,
  Trash2,
  Eye,
  Sliders,
  Database,
  Code2,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "arxiv";

  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // ==========================================
  // 1. arXiv Terminal State
  // ==========================================
  const subjects = listSubjects();
  const [selectedSubject, setSelectedSubject] = useState<string>("Computer Science");
  const [selectedCategory, setSelectedCategory] = useState<string>("cs.AI");
  const [customArxivQuery, setCustomArxivQuery] = useState<string>("");
  const [arxivLimit, setArxivLimit] = useState<number>(10);
  const [arxivSortBy, setArxivSortBy] = useState<"submittedDate" | "lastUpdatedDate" | "relevance">("submittedDate");
  const [arxivLoading, setArxivLoading] = useState<boolean>(false);
  const [arxivResult, setArxivResult] = useState<ArxivQueryResult | null>(null);
  const [arxivError, setArxivError] = useState<string | null>(null);

  const fetchArxiv = async () => {
    setArxivLoading(true);
    setArxivError(null);
    try {
      const params = new URLSearchParams();
      if (customArxivQuery.trim()) {
        params.set("q", customArxivQuery.trim());
      } else {
        params.set("category", selectedCategory);
      }
      params.set("maxResults", String(arxivLimit));
      params.set("sortBy", arxivSortBy);

      const resp = await fetch(`/api/arxiv?${params.toString()}`, { cache: "no-store" });
      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${resp.status}`);
      }
      const data: ArxivQueryResult = await resp.json();
      setArxivResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error fetching arXiv papers";
      if (msg.includes("NetworkError") || msg.includes("Failed to fetch")) {
        setArxivError("Connecting to local API... please click 'Fetch' again in a moment.");
      } else {
        setArxivError(msg);
      }
    } finally {
      setArxivLoading(false);
    }
  };

  // ==========================================
  // 2. Reddit Watcher State
  // ==========================================
  const curatedSubreddits = ["LocalLLaMA", "MachineLearning", "artificial", "singularity", "technology"];
  const [subredditInput, setSubredditInput] = useState<string>("LocalLLaMA");
  const [redditListing, setRedditListing] = useState<"hot" | "new" | "top" | "rising">("hot");
  const [redditTimeFilter, setRedditTimeFilter] = useState<string>("day");
  const [redditLimit, setRedditLimit] = useState<number>(10);
  const [redditLoading, setRedditLoading] = useState<boolean>(false);
  const [redditResult, setRedditResult] = useState<RedditQueryResult | null>(null);
  const [redditError, setRedditError] = useState<string | null>(null);

  // Watchlist State
  const [watchlist, setWatchlist] = useState<TrackedSubreddit[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState<boolean>(false);
  const [newSubName, setNewSubName] = useState<string>("");
  const [newSubCategory, setNewSubCategory] = useState<string>("AI News");

  const fetchReddit = async (subToFetch?: string) => {
    const targetSub = subToFetch || subredditInput;
    setRedditLoading(true);
    setRedditError(null);
    try {
      const params = new URLSearchParams({
        sub: targetSub,
        listing: redditListing,
        limit: String(redditLimit),
      });
      if (redditListing === "top" && redditTimeFilter) {
        params.set("timeFilter", redditTimeFilter);
      }

      const resp = await fetch(`/api/reddit?${params.toString()}`, { cache: "no-store" });
      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${resp.status}`);
      }
      const data: RedditQueryResult = await resp.json();
      setRedditResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error crawling Reddit";
      if (msg.includes("NetworkError") || msg.includes("Failed to fetch")) {
        setRedditError("Connecting to Reddit feed... please click 'Crawl' again in a moment.");
      } else {
        setRedditError(msg);
      }
    } finally {
      setRedditLoading(false);
    }
  };

  const loadWatchlist = async () => {
    setWatchlistLoading(true);
    try {
      const resp = await fetch("/api/reddit/watchlist?action=list", { cache: "no-store" });
      const data = await resp.json();
      if (data.watchlist) {
        setWatchlist(data.watchlist);
      }
    } catch (e) {
      console.error("Failed to load watchlist", e);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleAddSubreddit = async () => {
    if (!newSubName.trim()) return;
    try {
      const resp = await fetch("/api/reddit/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          name: newSubName.trim(),
          category: newSubCategory.trim() || "General",
          limit: 10,
        }),
      });
      const data = await resp.json();
      if (data.watchlist) {
        setWatchlist(data.watchlist);
        setNewSubName("");
      }
    } catch (e) {
      console.error("Failed to add subreddit", e);
    }
  };

  const handleToggleSubreddit = async (name: string, currentEnabled: boolean) => {
    try {
      const resp = await fetch("/api/reddit/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          name,
          enabled: !currentEnabled,
        }),
      });
      const data = await resp.json();
      if (data.watchlist) setWatchlist(data.watchlist);
    } catch (e) {
      console.error("Failed to toggle subreddit", e);
    }
  };

  const handleRemoveSubreddit = async (name: string) => {
    try {
      const resp = await fetch("/api/reddit/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", name }),
      });
      const data = await resp.json();
      if (data.watchlist) setWatchlist(data.watchlist);
    } catch (e) {
      console.error("Failed to remove subreddit", e);
    }
  };

  // ==========================================
  // 3. Substack IMAP State
  // ==========================================
  const [gmailFolder, setGmailFolder] = useState<string>("INBOX");
  const [gmailLimit, setGmailLimit] = useState<number>(10);
  const [gmailUnreadOnly, setGmailUnreadOnly] = useState<boolean>(false);
  const [gmailLoading, setGmailLoading] = useState<boolean>(false);
  const [gmailResult, setGmailResult] = useState<GmailQueryResult | null>(null);
  const [gmailError, setGmailError] = useState<string | null>(null);

  const fetchGmail = async () => {
    setGmailLoading(true);
    setGmailError(null);
    try {
      const params = new URLSearchParams({
        folder: gmailFolder,
        limit: String(gmailLimit),
        unreadOnly: String(gmailUnreadOnly),
      });
      const resp = await fetch(`/api/gmail?${params.toString()}`, { cache: "no-store" });
      const data: GmailQueryResult = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || data.error || `HTTP ${resp.status}`);
      }
      setGmailResult(data);
    } catch (err) {
      setGmailError(err instanceof Error ? err.message : "Error scanning Gmail IMAP");
    } finally {
      setGmailLoading(false);
    }
  };

  // ==========================================
  // 4. OpenRouter Studio State
  // ==========================================
  const modelOptions = [
    { value: "anthropic/claude-3.7-sonnet", label: "Claude 3.7 Sonnet (Anthropic)" },
    { value: "deepseek/deepseek-r1", label: "DeepSeek R1 Reasoning" },
    { value: "meta-llama/llama-3.3-70b-instruct", label: "Llama 3.3 70B Instruct (Meta)" },
    { value: "openai/gpt-4o", label: "GPT-4o Omnimodel (OpenAI)" },
    { value: "google/gemini-2.0-flash", label: "Gemini 2.0 Flash (Google)" },
    { value: "mistralai/mistral-large-2411", label: "Mistral Large 2411 (Mistral)" },
  ];

  const [llmModel, setLlmModel] = useState<string>("deepseek/deepseek-r1");
  const [customModel, setCustomModel] = useState<string>("");
  const [llmSystemPrompt, setLlmSystemPrompt] = useState<string>(
    "You are The Daily Bugle AI Editor. Synthesize input research into high-signal, punchy engineering briefs."
  );
  const [llmPrompt, setLlmPrompt] = useState<string>(
    "Synthesize the key recent breakthroughs in open-weights reasoning models and their implications for consumer inference."
  );
  const [llmTemperature, setLlmTemperature] = useState<number>(0.7);
  const [llmMaxTokens, setLlmMaxTokens] = useState<number>(1000);
  const [llmLoading, setLlmLoading] = useState<boolean>(false);
  const [llmResponse, setLlmResponse] = useState<ChatResponse | null>(null);
  const [llmError, setLlmError] = useState<string | null>(null);

  const executeCompletion = async () => {
    setLlmLoading(true);
    setLlmError(null);
    try {
      const targetModel = customModel.trim() || llmModel;
      const resp = await fetch("/api/llm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: llmPrompt,
          systemPrompt: llmSystemPrompt,
          model: targetModel,
          temperature: llmTemperature,
          maxTokens: llmMaxTokens,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || `HTTP ${resp.status}`);
      }
      setLlmResponse(data);
    } catch (err) {
      setLlmError(err instanceof Error ? err.message : "Error querying OpenRouter");
    } finally {
      setLlmLoading(false);
    }
  };

  // ==========================================
  // 5. Multi-Source Snapshot State
  // ==========================================
  const [snapshotLoading, setSnapshotLoading] = useState<boolean>(false);
  const [snapshotData, setSnapshotData] = useState<any>(null);
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  const fetchSnapshot = async () => {
    setSnapshotLoading(true);
    setSnapshotError(null);
    try {
      const resp = await fetch("/api/snapshot", { cache: "no-store" });
      const data = await resp.json();
      setSnapshotData(data);
    } catch (err) {
      setSnapshotError(err instanceof Error ? err.message : "Error generating snapshot");
    } finally {
      setSnapshotLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadWatchlist();
    fetchArxiv();
    fetchReddit();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)] text-[var(--text-main)] selection:bg-indigo-500/30 selection:text-indigo-600 dark:selection:text-indigo-200 relative overflow-hidden transition-colors duration-200">
      {/* Ambient Aurora Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-[450px] aurora-hero pointer-events-none -z-10" />
      <div className="absolute top-36 left-1/2 -translate-x-1/2 w-[700px] h-[350px] aurora-glow-center pointer-events-none -z-10 blur-3xl opacity-50" />

      {/* Floating Glassmorphic Pill Header */}
      <Header />

      {/* Command Center Modern Pill Tab Bar */}
      <div className="pt-4 px-4 pb-2 max-w-6xl mx-auto w-full">
        <div className="glass-nav rounded-2xl p-2 flex flex-wrap items-center justify-between gap-3 shadow-lg dark:shadow-2xl">
          {/* Module Pill Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setActiveTab("arxiv")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === "arxiv"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-md shadow-zinc-950/10 dark:shadow-white/10"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04] dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06]"
              }`}
            >
              <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>arXiv Wire</span>
              {arxivResult && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === "arxiv"
                    ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950 font-bold"
                    : "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                }`}>
                  {arxivResult.papers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("reddit")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === "reddit"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-md shadow-zinc-950/10 dark:shadow-white/10"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04] dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06]"
              }`}
            >
              <Radio className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Reddit Watcher</span>
              {redditResult && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === "reddit"
                    ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950 font-bold"
                    : "bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
                }`}>
                  {redditResult.posts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("substack")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === "substack"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-md shadow-zinc-950/10 dark:shadow-white/10"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04] dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06]"
              }`}
            >
              <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Substack Radar</span>
              {gmailResult && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  activeTab === "substack"
                    ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950 font-bold"
                    : "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                }`}>
                  {gmailResult.emails.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("llm")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === "llm"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-md shadow-zinc-950/10 dark:shadow-white/10"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04] dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06]"
              }`}
            >
              <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>OpenRouter Studio</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("snapshot");
                if (!snapshotData) fetchSnapshot();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                activeTab === "snapshot"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-md shadow-zinc-950/10 dark:shadow-white/10"
                  : "text-zinc-600 hover:text-zinc-950 hover:bg-black/[0.04] dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/[0.06]"
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Multi-Source Snapshot</span>
            </button>
          </div>

          {/* Quick Refresh Action */}
          <button
            onClick={() => {
              if (activeTab === "arxiv") fetchArxiv();
              else if (activeTab === "reddit") fetchReddit();
              else if (activeTab === "substack") fetchGmail();
              else if (activeTab === "llm") executeCompletion();
              else fetchSnapshot();
            }}
            disabled={arxivLoading || redditLoading || gmailLoading || llmLoading || snapshotLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-zinc-700 dark:text-zinc-200 border border-black/10 dark:border-white/10 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${
              arxivLoading || redditLoading || gmailLoading || llmLoading || snapshotLoading ? "animate-spin text-indigo-600 dark:text-indigo-400" : "text-zinc-500 dark:text-zinc-400"
            }`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* Main Command Center Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-8">
        {/* ========================================================= */}
        {/* TAB 1: arXiv Terminal */}
        {/* ========================================================= */}
        {activeTab === "arxiv" && (
          <div className="space-y-6">
            {/* Query Controls Card */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                      arXiv Research Wire
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      Query 166 scientific taxonomy disciplines via Atom XML
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-medium">
                    export.arxiv.org/api/query
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Discipline / Subject selector */}
                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider font-medium">
                    <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Discipline / Subject</span>
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      const newSub = e.target.value;
                      setSelectedSubject(newSub);
                      const catKeys = Object.keys(getCategoriesBySubject(newSub));
                      if (catKeys.length > 0) setSelectedCategory(catKeys[0]);
                    }}
                    className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  >
                    {subjects.map((sub) => (
                      <option key={sub} value={sub} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">
                        {sub} ({Object.keys(getCategoriesBySubject(sub)).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specific Category selector */}
                <div className="md:col-span-5 space-y-2">
                  <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">
                    Subcategory Code & Name
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 truncate"
                  >
                    {Object.entries(getCategoriesBySubject(selectedSubject)).map(([cat, name]) => (
                      <option key={cat} value={cat} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">
                        [{cat}] {name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Max Results */}
                <div className="md:col-span-3 space-y-2">
                  <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Limit</label>
                  <select
                    value={arxivLimit}
                    onChange={(e) => setArxivLimit(Number(e.target.value))}
                    className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                  >
                    <option value={5} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">5 Papers</option>
                    <option value={10} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">10 Papers</option>
                    <option value={20} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">20 Papers</option>
                    <option value={35} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">35 Papers</option>
                  </select>
                </div>

                {/* Custom Search Query override */}
                <div className="md:col-span-8 space-y-2">
                  <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">
                    Custom Query (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. cat:cs.AI AND ti:reasoning OR quantum"
                      value={customArxivQuery}
                      onChange={(e) => setCustomArxivQuery(e.target.value)}
                      className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                    />
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                  </div>
                </div>

                {/* Sort By & Button */}
                <div className="md:col-span-4 flex items-end gap-3">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Sort By</label>
                    <select
                      value={arxivSortBy}
                      onChange={(e) => setArxivSortBy(e.target.value as any)}
                      className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
                    >
                      <option value="submittedDate" className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">Submitted Date</option>
                      <option value="lastUpdatedDate" className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">Last Updated</option>
                      <option value="relevance" className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">Relevance</option>
                    </select>
                  </div>
                  <button
                    onClick={fetchArxiv}
                    disabled={arxivLoading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 h-[40px]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${arxivLoading ? "animate-spin" : ""}`} />
                    <span>Fetch</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {arxivError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 dark:text-red-400" />
                <span>{arxivError}</span>
              </div>
            )}

            {/* Papers List */}
            {arxivResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 px-2">
                  <span>
                    Query executed: <code className="text-blue-700 dark:text-blue-300 font-bold">{arxivResult.query}</code>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10">
                    {arxivResult.papers.length} Papers Retrieved
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {arxivResult.papers.map((paper) => (
                    <article
                      key={paper.arxivId}
                      className="glass-card rounded-2xl p-6 border border-black/[0.06] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 transition-all space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-medium">
                            {paper.primaryCategory} • {paper.primaryCategoryName}
                          </span>
                          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                            ID: {paper.arxivId}
                          </span>
                        </div>
                        {paper.published && (
                          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                            <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                            <span>{new Date(paper.published).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <h4 className="text-lg font-sans font-semibold text-zinc-900 dark:text-white tracking-tight leading-snug hover:text-blue-600 dark:hover:text-blue-300 transition-colors cursor-pointer">
                        {paper.title}
                      </h4>

                      <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                        Authors:{" "}
                        <span className="text-zinc-900 dark:text-zinc-200">
                          {paper.authors.slice(0, 5).join(", ")}
                          {paper.authors.length > 5 && ` (+${paper.authors.length - 5} more)`}
                        </span>
                      </p>

                      <div className="text-xs font-sans text-zinc-700 dark:text-zinc-300/90 leading-relaxed bg-slate-100/70 dark:bg-black/30 p-4 rounded-xl border border-black/[0.05] dark:border-white/[0.05] line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                        {paper.abstract}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
                        <div className="flex flex-wrap gap-1.5">
                          {paper.categories.slice(0, 4).map((c) => (
                            <span
                              key={c}
                              className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.05] text-zinc-600 dark:text-zinc-400 border border-black/[0.06] dark:border-white/[0.08]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium">
                          <a
                            href={paper.links.abstract}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-all flex items-center gap-1 border border-black/10 dark:border-white/10"
                          >
                            <span>Abstract</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={paper.links.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30 transition-all flex items-center gap-1 font-semibold"
                          >
                            <span>PDF</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={paper.links.html}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 transition-all flex items-center gap-1 font-semibold"
                          >
                            <span>HTML View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Raw API Payloads */}
                <RawPayloadViewer
                  title="arXiv Raw Payload Inspection"
                  tabs={[
                    {
                      id: "xml",
                      label: "Raw Atom XML",
                      language: "xml",
                      content: arxivResult.rawXml,
                      badge: "Official API Output",
                    },
                    {
                      id: "json",
                      label: "Parsed Paper Models",
                      language: "json",
                      content: JSON.stringify(arxivResult.papers, null, 2),
                    },
                  ]}
                  defaultCollapsed={true}
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: Reddit Watcher */}
        {/* ========================================================= */}
        {activeTab === "reddit" && (
          <div className="space-y-6">
            {/* Reddit Controls Card */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                      Reddit Community Watcher
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      Zero-Auth Public RSS stream with dual-tier disk caching
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium">
                    Throttle: 2.5s • Cache: 60s
                  </span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mr-1 uppercase tracking-wider font-medium">Curated:</span>
                {curatedSubreddits.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      setSubredditInput(sub);
                      fetchReddit(sub);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                      subredditInput.toLowerCase() === sub.toLowerCase()
                        ? "bg-orange-500/20 border border-orange-500/40 text-orange-800 dark:text-orange-200 font-bold shadow-sm"
                        : "bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]"
                    }`}
                  >
                    r/{sub}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Subreddit Input */}
                <div className="md:col-span-5 space-y-2">
                  <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Target Subreddit</label>
                  <input
                    type="text"
                    value={subredditInput}
                    onChange={(e) => setSubredditInput(e.target.value)}
                    placeholder="e.g. LocalLLaMA or MachineLearning"
                    className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                  />
                </div>

                {/* Listing */}
                <div className="md:col-span-3 space-y-2">
                  <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Feed Listing</label>
                  <select
                    value={redditListing}
                    onChange={(e) => setRedditListing(e.target.value as any)}
                    className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                  >
                    <option value="hot" className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">Hot (Trending)</option>
                    <option value="new" className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">New (Chronological)</option>
                    <option value="top" className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">Top (Highest Voted)</option>
                    <option value="rising" className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">Rising (Gaining)</option>
                  </select>
                </div>

                {/* Time filter (if top) or Limit */}
                {redditListing === "top" ? (
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Time Window</label>
                    <select
                      value={redditTimeFilter}
                      onChange={(e) => setRedditTimeFilter(e.target.value)}
                      className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                    >
                      <option value="day" className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">Past 24 Hours</option>
                      <option value="week" className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">Past Week</option>
                      <option value="month" className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">Past Month</option>
                      <option value="year" className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">Past Year</option>
                      <option value="all" className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">All Time</option>
                    </select>
                  </div>
                ) : (
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Limit</label>
                    <select
                      value={redditLimit}
                      onChange={(e) => setRedditLimit(Number(e.target.value))}
                      className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500"
                    >
                      <option value={5} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">5 Posts</option>
                      <option value={10} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">10 Posts</option>
                      <option value={15} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">15 Posts</option>
                      <option value={25} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">25 Posts</option>
                    </select>
                  </div>
                )}

                {/* Fetch Button */}
                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={() => fetchReddit()}
                    disabled={redditLoading}
                    className="w-full h-[40px] bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${redditLoading ? "animate-spin" : ""}`} />
                    <span>Crawl</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Watchlist Manager Panel */}
            <div className="glass-card rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-200">
                    Watchlist Manager (Seen-Post Deduplication Active)
                  </h4>
                </div>
                <button
                  onClick={async () => {
                    setRedditLoading(true);
                    try {
                      const resp = await fetch("/api/reddit/watchlist?action=poll", { cache: "no-store" });
                      const data = await resp.json();
                      if (data.posts) {
                        setRedditResult({
                          posts: data.posts,
                          rawXml: "",
                          subreddit: "Watchlist Poll",
                          listing: "unseen",
                        });
                      }
                    } finally {
                      setRedditLoading(false);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-xs font-mono text-zinc-700 dark:text-zinc-200 rounded-full border border-black/10 dark:border-white/10 transition-all flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>Poll New Unseen</span>
                </button>
              </div>

              {/* Add form */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Subreddit (e.g. singularity)"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                />
                <input
                  type="text"
                  placeholder="Category label"
                  value={newSubCategory}
                  onChange={(e) => setNewSubCategory(e.target.value)}
                  className="bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                />
                <button
                  onClick={handleAddSubreddit}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add To Watchlist</span>
                </button>
              </div>

              {/* Watchlist items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {watchlist.map((sub) => (
                  <div
                    key={sub.name}
                    className="p-3.5 rounded-2xl border border-black/[0.06] dark:border-white/[0.06] bg-slate-50/60 dark:bg-black/20 flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-200">{sub.displayName || `r/${sub.name}`}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">{sub.category} • limit: {sub.limit}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSubreddit(sub.name, sub.enabled)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                          sub.enabled
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                            : "bg-black/[0.05] dark:bg-white/[0.05] text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {sub.enabled ? "Active" : "Disabled"}
                      </button>
                      <button
                        onClick={() => handleRemoveSubreddit(sub.name)}
                        className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                        title="Remove Subreddit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Banner */}
            {redditError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 dark:text-red-400" />
                <span>{redditError}</span>
              </div>
            )}

            {/* Posts List */}
            {redditResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 px-2">
                  <span>
                    Stream: <code className="text-orange-700 dark:text-orange-300 font-bold">{redditResult.subreddit}</code> ({redditResult.listing})
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10">
                    {redditResult.posts.length} Posts Extracted
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {redditResult.posts.map((post) => (
                    <article
                      key={post.id}
                      className="glass-card rounded-2xl p-6 border border-black/[0.06] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 transition-all space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20 font-medium">
                            {post.subreddit}
                          </span>
                          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                            Author: {post.author}
                          </span>
                        </div>
                        {post.publishedAt && (
                          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                            <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                            <span>{new Date(post.publishedAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <h4 className="text-base sm:text-lg font-sans font-semibold text-zinc-900 dark:text-white tracking-tight leading-snug hover:text-orange-600 dark:hover:text-orange-300 transition-colors cursor-pointer">
                        {post.title}
                      </h4>

                      {post.contentText && (
                        <div className="text-xs font-sans text-zinc-700 dark:text-zinc-300/90 leading-relaxed bg-slate-100/70 dark:bg-black/30 p-4 rounded-xl border border-black/[0.05] dark:border-white/[0.05] line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                          {post.contentText}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] text-xs font-mono">
                        {post.externalUrl && post.externalUrl !== post.permalink ? (
                          <a
                            href={post.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30 transition-all flex items-center gap-1.5 font-medium"
                          >
                            <span>Linked Article</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-zinc-500 dark:text-zinc-400">Text Submission</span>
                        )}

                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white transition-all flex items-center gap-1.5 border border-black/10 dark:border-white/10"
                        >
                          <span>Reddit Discussion</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Raw API Payloads */}
                <RawPayloadViewer
                  title="Reddit Feed Raw Inspection"
                  tabs={[
                    {
                      id: "xml",
                      label: "Raw RSS Atom Feed",
                      language: "xml",
                      content: redditResult.rawXml || "// Search / watchlist cached stream",
                      badge: "Zero-Auth XML",
                    },
                    {
                      id: "json",
                      label: "Parsed Reddit Posts",
                      language: "json",
                      content: JSON.stringify(redditResult.posts, null, 2),
                    },
                  ]}
                  defaultCollapsed={true}
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: Substack Tracker */}
        {/* ========================================================= */}
        {activeTab === "substack" && (
          <div className="space-y-6">
            {/* Substack Controls Card */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                      Substack Newsletter Radar
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      TLS IMAP direct connection with canonical web link extraction
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium">
                    Host: imap.gmail.com:993
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Folder input */}
                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Mailbox Folder</label>
                  <input
                    type="text"
                    value={gmailFolder}
                    onChange={(e) => setGmailFolder(e.target.value)}
                    placeholder="INBOX"
                    className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  />
                </div>

                {/* Limit */}
                <div className="md:col-span-3 space-y-2">
                  <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Max Issues</label>
                  <select
                    value={gmailLimit}
                    onChange={(e) => setGmailLimit(Number(e.target.value))}
                    className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  >
                    <option value={5} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">5 Newsletters</option>
                    <option value={10} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">10 Newsletters</option>
                    <option value={20} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">20 Newsletters</option>
                  </select>
                </div>

                {/* Unread Only Toggle */}
                <div className="md:col-span-3 flex items-center pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-mono text-zinc-700 dark:text-zinc-300 font-medium">
                    <input
                      type="checkbox"
                      checked={gmailUnreadOnly}
                      onChange={(e) => setGmailUnreadOnly(e.target.checked)}
                      className="rounded border-zinc-300 dark:border-white/20 bg-white dark:bg-white/[0.05] text-amber-500 focus:ring-amber-500/20"
                    />
                    <span>Unread (UNSEEN) Only</span>
                  </label>
                </div>

                {/* Fetch Button */}
                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={fetchGmail}
                    disabled={gmailLoading}
                    className="w-full h-[40px] bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${gmailLoading ? "animate-spin" : ""}`} />
                    <span>Scan IMAP</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error or Notice Banner */}
            {gmailError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 dark:text-red-400" />
                <span>{gmailError}</span>
              </div>
            )}

            {gmailResult && gmailResult.configured === false && (
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs font-mono space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Gmail Credentials Required For Live Fetch</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  Configure <code className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-black/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-none">GMAIL_USER</code> and <code className="text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-black/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-none">GMAIL_APP_PASSWORD</code> in <code className="text-zinc-900 dark:text-white bg-black/5 dark:bg-black/40 px-1.5 py-0.5 rounded">.env.local</code> to fetch live Substack newsletters directly from your inbox.
                </p>
              </div>
            )}

            {/* Emails List */}
            {gmailResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 px-2">
                  <span>Folder: <code className="text-amber-700 dark:text-amber-300 font-bold">{gmailResult.folder}</code></span>
                  <span className="px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/10 dark:border-white/10">
                    {gmailResult.emails.length} Issues Retrieved
                  </span>
                </div>

                {gmailResult.emails.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-black/20 text-center text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                    No Substack emails found in this mailbox query. Try selecting all messages or verify Substack subscriptions.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {gmailResult.emails.map((item) => (
                      <article
                        key={item.id}
                        className="glass-card rounded-2xl p-6 border border-black/[0.06] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 transition-all space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-semibold">
                              {item.senderName || item.sender}
                            </span>
                            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                              UID: {item.id}
                            </span>
                          </div>
                          {item.date && (
                            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                              <Clock className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                              <span>{new Date(item.date).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <h4 className="text-lg font-sans font-semibold text-zinc-900 dark:text-white tracking-tight leading-snug hover:text-amber-600 dark:hover:text-amber-300 transition-colors cursor-pointer">
                          {item.subject}
                        </h4>

                        <div className="text-xs font-sans text-zinc-700 dark:text-zinc-300/90 leading-relaxed bg-slate-100/70 dark:bg-black/30 p-4 rounded-xl border border-black/[0.05] dark:border-white/[0.05] line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                          {item.bodyText}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] text-xs font-mono">
                          <div className="text-zinc-500 dark:text-zinc-400">
                            {item.links.length} hyperlinks identified
                          </div>

                          {item.webUrl ? (
                            <a
                              href={item.webUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-amber-600/20"
                            >
                              <span>Read Post on Substack</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-zinc-400">No direct Substack slug link</span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                {/* Raw API Payloads */}
                <RawPayloadViewer
                  title="Substack IMAP Inspection"
                  tabs={[
                    {
                      id: "headers",
                      label: "Raw RFC822 Headers",
                      language: "text",
                      content: gmailResult.rawHeaders || "// Headers stream",
                      badge: "IMAP Envelope",
                    },
                    {
                      id: "json",
                      label: "Parsed Newsletter Schema",
                      language: "json",
                      content: JSON.stringify(gmailResult.emails, null, 2),
                    },
                  ]}
                  defaultCollapsed={true}
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: OpenRouter Studio */}
        {/* ========================================================= */}
        {activeTab === "llm" && (
          <div className="space-y-6">
            {/* LLM Controls Card */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                      OpenRouter Studio
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                      Multi-model completions with real-time prompt & completion token counters
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-medium">
                    openrouter.ai/api/v1
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Model Selector */}
                <div className="md:col-span-6 space-y-2">
                  <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Model Selector</label>
                  <select
                    value={llmModel}
                    onChange={(e) => setLlmModel(e.target.value)}
                    className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
                  >
                    {modelOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-white text-zinc-900 dark:bg-[#0b0e17] dark:text-zinc-200">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Model String */}
                <div className="md:col-span-6 space-y-2">
                  <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">
                    Custom Model (Optional)
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="Overrides dropdown if provided"
                    className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                  />
                </div>

                {/* Temperature & Max Tokens */}
                <div className="md:col-span-6 space-y-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>TEMPERATURE</span>
                    <span className="text-purple-600 dark:text-purple-300 font-bold">{llmTemperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={llmTemperature}
                    onChange={(e) => setLlmTemperature(parseFloat(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div className="md:col-span-6 space-y-2">
                  <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Max Tokens</label>
                  <input
                    type="number"
                    value={llmMaxTokens}
                    onChange={(e) => setLlmMaxTokens(Number(e.target.value))}
                    className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
                  />
                </div>

                {/* System Prompt */}
                <div className="md:col-span-12 space-y-2">
                  <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">System Instruction</label>
                  <textarea
                    rows={2}
                    value={llmSystemPrompt}
                    onChange={(e) => setLlmSystemPrompt(e.target.value)}
                    className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl p-3.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
                  />
                </div>

                {/* User Prompt */}
                <div className="md:col-span-12 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Prompt / Digest Input</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (arxivResult?.papers.length) {
                            const summary = arxivResult.papers
                              .slice(0, 5)
                              .map((p) => `- [${p.primaryCategory}] ${p.title}\n  Abstract: ${p.abstract.slice(0, 150)}...`)
                              .join("\n\n");
                            setLlmPrompt(`Format an authoritative digest based on these latest arXiv research papers:\n\n${summary}`);
                          }
                        }}
                        className="text-[11px] font-mono px-3 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 transition-all font-medium"
                      >
                        + Insert arXiv Digest Context
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={llmPrompt}
                    onChange={(e) => setLlmPrompt(e.target.value)}
                    className="w-full bg-white dark:bg-white/[0.04] border border-black/10 dark:border-white/10 rounded-xl p-3.5 text-xs font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500"
                  />
                </div>

                {/* Submit button */}
                <div className="md:col-span-12 flex justify-end">
                  <button
                    onClick={executeCompletion}
                    disabled={llmLoading || !llmPrompt.trim()}
                    className="px-7 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-600/25 disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${llmLoading ? "animate-pulse" : ""}`} />
                    <span>{llmLoading ? "Synthesizing..." : "Execute Completion"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {llmError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 dark:text-red-400" />
                <span>{llmError}</span>
              </div>
            )}

            {/* LLM Response */}
            {llmResponse && (
              <div className="space-y-4">
                {/* Token usage badges */}
                {llmResponse.usage && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl glass-card text-center border border-black/[0.06] dark:border-white/[0.08]">
                      <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Prompt Tokens</div>
                      <div className="text-xl font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {llmResponse.usage.prompt_tokens ?? llmResponse.usage.promptTokens ?? 0}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl glass-card text-center border border-black/[0.06] dark:border-white/[0.08]">
                      <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Completion Tokens</div>
                      <div className="text-xl font-mono font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {llmResponse.usage.completion_tokens ?? llmResponse.usage.completionTokens ?? 0}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl glass-card text-center border border-black/[0.06] dark:border-white/[0.08]">
                      <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">Total Tokens</div>
                      <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {llmResponse.usage.total_tokens ?? llmResponse.usage.totalTokens ?? 0}
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Box */}
                <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-4 border border-black/[0.06] dark:border-white/[0.08]">
                  <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Model: <code className="text-purple-700 dark:text-purple-300 font-bold">{llmResponse.model}</code>
                    </span>
                    {llmResponse.finishReason && (
                      <span className="text-zinc-500 dark:text-zinc-400">Finish: {llmResponse.finishReason}</span>
                    )}
                  </div>
                  <div className="prose prose-invert max-w-none text-sm font-sans leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                    {llmResponse.content}
                  </div>
                </div>

                {/* Raw API Payloads */}
                <RawPayloadViewer
                  title="OpenRouter Raw Response Inspection"
                  tabs={[
                    {
                      id: "json",
                      label: "Complete OpenRouter Response Schema",
                      language: "json",
                      content: JSON.stringify(llmResponse.rawJson || llmResponse, null, 2),
                      badge: "Exact API Schema",
                    },
                  ]}
                  defaultCollapsed={false}
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: Multi-Source Snapshot */}
        {/* ========================================================= */}
        {activeTab === "snapshot" && (
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 border border-black/[0.06] dark:border-white/10">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Consolidated Multi-Source Intelligence Snapshot</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Triggers concurrent polling across arXiv preprints, zero-auth Reddit feeds, and Gmail Substack newsletters.
                </p>
              </div>

              <button
                onClick={fetchSnapshot}
                disabled={snapshotLoading}
                className="btn-white-pill rounded-full px-6 py-3 text-xs font-semibold flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${snapshotLoading ? "animate-spin" : ""}`} />
                <span>{snapshotLoading ? "Gathering Streams..." : "Refresh Snapshot"}</span>
              </button>
            </div>

            {snapshotError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 dark:text-red-400" />
                <span>{snapshotError}</span>
              </div>
            )}

            {snapshotData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Column 1: arXiv Snapshot */}
                  <div className="glass-card rounded-2xl p-6 space-y-4 border border-black/[0.06] dark:border-white/[0.08]">
                    <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        arXiv Feed
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                        {snapshotData.arxiv?.papers?.length || 0} papers
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {snapshotData.arxiv?.papers?.map((p: any) => (
                        <div key={p.arxivId} className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-black/30 border border-black/[0.05] dark:border-white/[0.05] text-xs">
                          <div className="font-sans font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">{p.title}</div>
                          <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400 mt-1.5">{p.primaryCategory}</div>
                        </div>
                      )) || <div className="text-zinc-500 text-xs font-mono">No papers loaded</div>}
                    </div>
                  </div>

                  {/* Column 2: Reddit Snapshot */}
                  <div className="glass-card rounded-2xl p-6 space-y-4 border border-black/[0.06] dark:border-white/[0.08]">
                    <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                      <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 flex items-center gap-2">
                        <Radio className="w-4 h-4" />
                        Reddit Watcher
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20">
                        {snapshotData.reddit?.posts?.length || 0} posts
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {snapshotData.reddit?.posts?.map((post: any) => (
                        <div key={post.id} className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-black/30 border border-black/[0.05] dark:border-white/[0.05] text-xs">
                          <div className="font-sans font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">{post.title}</div>
                          <div className="text-[10px] font-mono text-orange-600 dark:text-orange-400 mt-1.5">{post.subreddit} • by {post.author}</div>
                        </div>
                      )) || <div className="text-zinc-500 text-xs font-mono">No posts loaded</div>}
                    </div>
                  </div>

                  {/* Column 3: Gmail Snapshot */}
                  <div className="glass-card rounded-2xl p-6 space-y-4 border border-black/[0.06] dark:border-white/[0.08]">
                    <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Substack Radar
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                        {snapshotData.gmail?.emails?.length || 0} issues
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {snapshotData.gmail?.emails?.map((email: any) => (
                        <div key={email.id} className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-black/30 border border-black/[0.05] dark:border-white/[0.05] text-xs">
                          <div className="font-sans font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">{email.subject}</div>
                          <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-1.5">{email.senderName || email.sender}</div>
                        </div>
                      )) || (
                        <div className="text-zinc-500 text-xs font-mono p-2">
                          {snapshotData.gmail?.message || "No emails or credentials needed"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Raw Snapshot JSON */}
                <RawPayloadViewer
                  title="Consolidated Snapshot JSON Inspection"
                  tabs={[
                    {
                      id: "json",
                      label: "Combined Multi-Source Snapshot Payload",
                      language: "json",
                      content: JSON.stringify(snapshotData, null, 2),
                      badge: "Real-Time Parallel",
                    },
                  ]}
                  defaultCollapsed={false}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-app)] text-zinc-500 flex items-center justify-center text-xs font-mono">
          Loading Command Center...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
