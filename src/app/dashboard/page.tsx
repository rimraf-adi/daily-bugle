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

      const resp = await fetch(`/api/arxiv?${params.toString()}`);
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

      const resp = await fetch(`/api/reddit?${params.toString()}`);
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
      const resp = await fetch("/api/reddit/watchlist?action=list");
      const data = await resp.json();
      if (data.watchlist) {
        setWatchlist(data.watchlist);
      }
    } catch {
      // Ignore
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleAddSubreddit = async () => {
    if (!newSubName.trim()) return;
    try {
      await fetch("/api/reddit/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          name: newSubName.trim(),
          category: newSubCategory,
          listing: "hot",
          limit: 5,
        }),
      });
      setNewSubName("");
      loadWatchlist();
    } catch {
      // Ignore
    }
  };

  const handleRemoveSubreddit = async (name: string) => {
    try {
      await fetch("/api/reddit/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", name }),
      });
      loadWatchlist();
    } catch {
      // Ignore
    }
  };

  const handleToggleSubreddit = async (name: string, currentEnabled: boolean) => {
    try {
      await fetch("/api/reddit/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", name, enabled: !currentEnabled }),
      });
      loadWatchlist();
    } catch {
      // Ignore
    }
  };

  // ==========================================
  // 3. Substack Tracker State
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

      const resp = await fetch(`/api/gmail?${params.toString()}`);
      const data: GmailQueryResult = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || `HTTP ${resp.status}`);
      }
      setGmailResult(data);
    } catch (err) {
      setGmailError(err instanceof Error ? err.message : "Error fetching Substack emails");
    } finally {
      setGmailLoading(false);
    }
  };

  // ==========================================
  // 4. OpenRouter Studio State
  // ==========================================
  const modelOptions = [
    { label: "OpenRouter Free Router (Auto)", value: "openrouter/free" },
    { label: "Gemini 2.0 Flash Experimental (Free)", value: "google/gemini-2.0-flash-exp:free" },
    { label: "Llama 3.3 70B Instruct (Free)", value: "meta-llama/llama-3.3-70b-instruct:free" },
    { label: "Mistral 7B Instruct (Free)", value: "mistralai/mistral-7b-instruct:free" },
    { label: "Qwen 2.5 72B Instruct (Free)", value: "qwen/qwen-2.5-72b-instruct:free" },
  ];

  const [llmModel, setLlmModel] = useState<string>("openrouter/free");
  const [customModel, setCustomModel] = useState<string>("");
  const [llmSystemPrompt, setLlmSystemPrompt] = useState<string>(
    "You are the chief science & intelligence editor for The Daily Bugle. Provide crisp, technical, highly objective analysis without boilerplate."
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
      const resp = await fetch("/api/snapshot");
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
    // Auto-fetch initial sample papers
    fetchArxiv();
    fetchReddit();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0b] text-[#e4e4e7]">
      <Header />

      {/* Command Center Control Bar */}
      <div className="border-b border-[#22262d] bg-[#111317] px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Module Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => setActiveTab("arxiv")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === "arxiv"
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                  : "bg-[#181b20] text-zinc-300 hover:bg-[#22262e] border border-[#2b303a]"
              }`}
            >
              <Cpu className="w-4 h-4 text-blue-300" />
              <span>arXiv Terminal</span>
              {arxivResult && (
                <span className="px-1.5 py-0.2 bg-blue-900/60 rounded text-[10px] text-blue-200">
                  {arxivResult.papers.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("reddit")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === "reddit"
                  ? "bg-orange-600 text-white font-bold shadow-md shadow-orange-600/20"
                  : "bg-[#181b20] text-zinc-300 hover:bg-[#22262e] border border-[#2b303a]"
              }`}
            >
              <Radio className="w-4 h-4 text-orange-300" />
              <span>Reddit Watcher</span>
              {redditResult && (
                <span className="px-1.5 py-0.2 bg-orange-900/60 rounded text-[10px] text-orange-200">
                  {redditResult.posts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("substack")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === "substack"
                  ? "bg-amber-600 text-white font-bold shadow-md shadow-amber-600/20"
                  : "bg-[#181b20] text-zinc-300 hover:bg-[#22262e] border border-[#2b303a]"
              }`}
            >
              <Globe className="w-4 h-4 text-amber-300" />
              <span>Substack Tracker</span>
              {gmailResult && (
                <span className="px-1.5 py-0.2 bg-amber-900/60 rounded text-[10px] text-amber-200">
                  {gmailResult.emails.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("llm")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === "llm"
                  ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20"
                  : "bg-[#181b20] text-zinc-300 hover:bg-[#22262e] border border-[#2b303a]"
              }`}
            >
              <Activity className="w-4 h-4 text-purple-300" />
              <span>OpenRouter Studio</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("snapshot");
                if (!snapshotData) fetchSnapshot();
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                activeTab === "snapshot"
                  ? "bg-red-600 text-white font-bold shadow-md shadow-red-600/20"
                  : "bg-[#181b20] text-zinc-300 hover:bg-[#22262e] border border-[#2b303a]"
              }`}
            >
              <Layers className="w-4 h-4 text-red-300" />
              <span>Multi-Source Snapshot</span>
            </button>
          </div>

          {/* Quick Trigger Snapshot */}
          <button
            onClick={() => {
              setActiveTab("snapshot");
              fetchSnapshot();
            }}
            disabled={snapshotLoading}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#1f2329] hover:bg-[#292f38] text-xs font-mono text-zinc-200 rounded-lg border border-[#303642] transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${snapshotLoading ? "animate-spin text-red-400" : ""}`} />
            <span>Parallel Snapshot</span>
          </button>
        </div>
      </div>

      {/* Main Command Center Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: arXiv Terminal */}
        {/* ========================================================= */}
        {activeTab === "arxiv" && (
          <div className="space-y-6">
            {/* Query Controls Card */}
            <div className="p-5 rounded-xl border border-[#272b33] bg-[#121418] shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#23272f] pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <h3 className="text-base font-semibold font-mono text-zinc-100">
                    arXiv Research Wire Terminal
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 font-mono">
                    166 Categories Supported
                  </span>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  Target: <code className="text-blue-300">export.arxiv.org/api/query</code>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Discipline / Subject selector */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5 text-blue-400" />
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
                    className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
                  >
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub} ({Object.keys(getCategoriesBySubject(sub)).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specific Category selector */}
                <div className="md:col-span-5 space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">
                    Subcategory Code & Name
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500 truncate"
                  >
                    {Object.entries(getCategoriesBySubject(selectedSubject)).map(([cat, name]) => (
                      <option key={cat} value={cat}>
                        [{cat}] {name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Max Results */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Limit</label>
                  <select
                    value={arxivLimit}
                    onChange={(e) => setArxivLimit(Number(e.target.value))}
                    className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value={5}>5 Papers</option>
                    <option value={10}>10 Papers</option>
                    <option value={20}>20 Papers</option>
                    <option value={35}>35 Papers</option>
                  </select>
                </div>

                {/* Custom Search Query override */}
                <div className="md:col-span-8 space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">
                    Custom Query (Optional - overrides category dropdown)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. cat:cs.AI AND ti:reasoning OR quantum"
                      value={customArxivQuery}
                      onChange={(e) => setCustomArxivQuery(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500 placeholder:text-zinc-600"
                    />
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Sort By & Button */}
                <div className="md:col-span-4 flex items-end gap-2">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Sort By</label>
                    <select
                      value={arxivSortBy}
                      onChange={(e) => setArxivSortBy(e.target.value as any)}
                      className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="submittedDate">Submitted Date</option>
                      <option value="lastUpdatedDate">Last Updated</option>
                      <option value="relevance">Relevance</option>
                    </select>
                  </div>
                  <button
                    onClick={fetchArxiv}
                    disabled={arxivLoading}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20 disabled:opacity-50 h-[34px]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${arxivLoading ? "animate-spin" : ""}`} />
                    <span>Fetch</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {arxivError && (
              <div className="p-4 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{arxivError}</span>
              </div>
            )}

            {/* Papers List */}
            {arxivResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                  <span>
                    Query executed: <code className="text-blue-300">{arxivResult.query}</code>
                  </span>
                  <span>{arxivResult.papers.length} Papers Retrieved</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {arxivResult.papers.map((paper) => (
                    <article
                      key={paper.arxivId}
                      className="p-5 rounded-xl border border-[#272b33] bg-[#121418] hover:border-[#373e4b] transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-950/80 text-blue-300 border border-blue-800/40">
                            {paper.primaryCategory} • {paper.primaryCategoryName}
                          </span>
                          <span className="text-xs font-mono text-zinc-500">
                            ID: {paper.arxivId}
                          </span>
                        </div>
                        {paper.published && (
                          <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>{new Date(paper.published).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      <h4 className="text-lg font-serif font-bold text-zinc-100 leading-snug">
                        {paper.title}
                      </h4>

                      <p className="text-xs font-mono text-zinc-400">
                        Authors:{" "}
                        <span className="text-zinc-300">
                          {paper.authors.slice(0, 5).join(", ")}
                          {paper.authors.length > 5 && ` (+${paper.authors.length - 5} more)`}
                        </span>
                      </p>

                      <p className="text-xs font-serif text-zinc-300 leading-relaxed line-clamp-4 hover:line-clamp-none transition-all cursor-pointer bg-[#0a0c0e] p-3 rounded-lg border border-[#20232a]">
                        {paper.abstract}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1f232a]">
                        <div className="flex flex-wrap gap-1.5">
                          {paper.categories.slice(0, 4).map((c) => (
                            <span
                              key={c}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400"
                            >
                              {c}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono">
                          <a
                            href={paper.links.abstract}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-[#1f2329] hover:bg-[#282e36] text-zinc-300 hover:text-white transition-all flex items-center gap-1"
                          >
                            <span>Abstract</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={paper.links.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/40 transition-all flex items-center gap-1"
                          >
                            <span>PDF</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <a
                            href={paper.links.html}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/40 transition-all flex items-center gap-1 font-semibold"
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
            <div className="p-5 rounded-xl border border-[#272b33] bg-[#121418] shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#23272f] pb-3">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-orange-400" />
                  <h3 className="text-base font-semibold font-mono text-zinc-100">
                    Unofficial Reddit Community Crawler
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 font-mono">
                    Zero-Auth Public RSS
                  </span>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  Politeness Throttle: <code className="text-orange-300">2.5s</code> • In-Memory TTL: <code className="text-orange-300">60s</code>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-zinc-500 mr-1">Curated:</span>
                {curatedSubreddits.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => {
                      setSubredditInput(sub);
                      fetchReddit(sub);
                    }}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-all ${
                      subredditInput.toLowerCase() === sub.toLowerCase()
                        ? "bg-orange-950/60 border-orange-600 text-orange-300 font-bold"
                        : "bg-[#181b20] border-[#292e37] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    r/{sub}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Subreddit Input with alias detection */}
                <div className="md:col-span-5 space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Target Subreddit</label>
                  <input
                    type="text"
                    value={subredditInput}
                    onChange={(e) => setSubredditInput(e.target.value)}
                    placeholder="e.g. LocalLLaMA or MachineLearning"
                    className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Listing */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Feed Listing</label>
                  <select
                    value={redditListing}
                    onChange={(e) => setRedditListing(e.target.value as any)}
                    className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500"
                  >
                    <option value="hot">Hot (Trending)</option>
                    <option value="new">New (Chronological)</option>
                    <option value="top">Top (Highest Voted)</option>
                    <option value="rising">Rising (Gaining Momentum)</option>
                  </select>
                </div>

                {/* Time filter (if top) or Limit */}
                {redditListing === "top" ? (
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Time Window</label>
                    <select
                      value={redditTimeFilter}
                      onChange={(e) => setRedditTimeFilter(e.target.value)}
                      className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500"
                    >
                      <option value="day">Past 24 Hours</option>
                      <option value="week">Past Week</option>
                      <option value="month">Past Month</option>
                      <option value="year">Past Year</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                ) : (
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-mono text-zinc-400">Limit</label>
                    <select
                      value={redditLimit}
                      onChange={(e) => setRedditLimit(Number(e.target.value))}
                      className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500"
                    >
                      <option value={5}>5 Posts</option>
                      <option value={10}>10 Posts</option>
                      <option value={15}>15 Posts</option>
                      <option value={25}>25 Posts</option>
                    </select>
                  </div>
                )}

                {/* Fetch Button */}
                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={() => fetchReddit()}
                    disabled={redditLoading}
                    className="w-full h-[34px] bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${redditLoading ? "animate-spin" : ""}`} />
                    <span>Crawl</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Watchlist Manager Panel */}
            <div className="p-5 rounded-xl border border-[#272b33] bg-[#121418] shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-[#23272f] pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-orange-400" />
                  <h4 className="text-sm font-mono font-bold text-zinc-200">
                    Watchlist Manager (Seen-Post Deduplication Active)
                  </h4>
                </div>
                <button
                  onClick={async () => {
                    setRedditLoading(true);
                    try {
                      const resp = await fetch("/api/reddit/watchlist?action=poll");
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
                  className="px-3 py-1 bg-[#1f2329] hover:bg-[#282e36] text-xs font-mono text-zinc-200 rounded border border-[#303642] transition-all flex items-center gap-1"
                >
                  <Eye className="w-3 h-3 text-orange-400" />
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
                  className="bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500"
                />
                <input
                  type="text"
                  placeholder="Category label"
                  value={newSubCategory}
                  onChange={(e) => setNewSubCategory(e.target.value)}
                  className="bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={handleAddSubreddit}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-mono text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add To Watchlist</span>
                </button>
              </div>

              {/* Watchlist items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                {watchlist.map((sub) => (
                  <div
                    key={sub.name}
                    className="p-2.5 rounded-lg border border-[#242730] bg-[#0c0e11] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-zinc-200">{sub.displayName || `r/${sub.name}`}</div>
                      <div className="text-[11px] text-zinc-500">{sub.category} • limit: {sub.limit}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSubreddit(sub.name, sub.enabled)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          sub.enabled
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {sub.enabled ? "Active" : "Disabled"}
                      </button>
                      <button
                        onClick={() => handleRemoveSubreddit(sub.name)}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
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
              <div className="p-4 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{redditError}</span>
              </div>
            )}

            {/* Posts List */}
            {redditResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                  <span>
                    Stream: <code className="text-orange-300">{redditResult.subreddit}</code> ({redditResult.listing})
                  </span>
                  <span>{redditResult.posts.length} Posts Extracted</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {redditResult.posts.map((post) => (
                    <article
                      key={post.id}
                      className="p-5 rounded-xl border border-[#272b33] bg-[#121418] hover:border-[#373e4b] transition-all space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-orange-950/80 text-orange-300 border border-orange-800/40">
                            {post.subreddit}
                          </span>
                          <span className="text-xs font-mono text-zinc-500">
                            Author: {post.author}
                          </span>
                        </div>
                        {post.publishedAt && (
                          <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            <span>{new Date(post.publishedAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>

                      <h4 className="text-base sm:text-lg font-serif font-bold text-zinc-100 leading-snug">
                        {post.title}
                      </h4>

                      {post.contentText && (
                        <p className="text-xs font-serif text-zinc-300 leading-relaxed bg-[#0a0c0e] p-3 rounded-lg border border-[#20232a] line-clamp-3 hover:line-clamp-none transition-all cursor-pointer">
                          {post.contentText}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1f232a] text-xs font-mono">
                        {post.externalUrl && post.externalUrl !== post.permalink ? (
                          <a
                            href={post.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/40 transition-all flex items-center gap-1"
                          >
                            <span>Linked Article</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-zinc-600">Text Submission</span>
                        )}

                        <a
                          href={post.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-[#1f2329] hover:bg-[#282e36] text-zinc-300 hover:text-white transition-all flex items-center gap-1"
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
            <div className="p-5 rounded-xl border border-[#272b33] bg-[#121418] shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#23272f] pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-semibold font-mono text-zinc-100">
                    Substack Newsletter IMAP Tracker
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 font-mono">
                    Node TLS IMAP
                  </span>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  Host: <code className="text-amber-300">imap.gmail.com:993</code>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Folder input */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Mailbox Folder</label>
                  <input
                    type="text"
                    value={gmailFolder}
                    onChange={(e) => setGmailFolder(e.target.value)}
                    placeholder="INBOX"
                    className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Limit */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Max Issues</label>
                  <select
                    value={gmailLimit}
                    onChange={(e) => setGmailLimit(Number(e.target.value))}
                    className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value={5}>5 Newsletters</option>
                    <option value={10}>10 Newsletters</option>
                    <option value={20}>20 Newsletters</option>
                  </select>
                </div>

                {/* Unread Only Toggle */}
                <div className="md:col-span-3 flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-300">
                    <input
                      type="checkbox"
                      checked={gmailUnreadOnly}
                      onChange={(e) => setGmailUnreadOnly(e.target.checked)}
                      className="rounded border-[#2c313a] bg-[#0c0d10] text-amber-500 focus:ring-amber-500/20"
                    />
                    <span>Unread (UNSEEN) Only</span>
                  </label>
                </div>

                {/* Fetch Button */}
                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={fetchGmail}
                    disabled={gmailLoading}
                    className="w-full h-[34px] bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${gmailLoading ? "animate-spin" : ""}`} />
                    <span>Scan IMAP</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error or Notice Banner */}
            {gmailError && (
              <div className="p-4 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{gmailError}</span>
              </div>
            )}

            {gmailResult && gmailResult.configured === false && (
              <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs font-mono space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Gmail Credentials Required</span>
                </div>
                <p className="text-zinc-400">
                  Configure <code className="text-amber-300">GMAIL_USER</code> and <code className="text-amber-300">GMAIL_APP_PASSWORD</code> in <code className="text-zinc-200">.env.local</code> to fetch live Substack newsletters directly from your inbox.
                </p>
              </div>
            )}

            {/* Emails List */}
            {gmailResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-1">
                  <span>Folder: <code className="text-amber-300">{gmailResult.folder}</code></span>
                  <span>{gmailResult.emails.length} Issues Retrieved</span>
                </div>

                {gmailResult.emails.length === 0 ? (
                  <div className="p-8 rounded-xl border border-[#272b33] bg-[#121418] text-center text-zinc-500 text-xs font-mono">
                    No Substack emails found in this mailbox query. Try selecting all messages or verify Substack subscriptions.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {gmailResult.emails.map((item) => (
                      <article
                        key={item.id}
                        className="p-5 rounded-xl border border-[#272b33] bg-[#121418] hover:border-[#373e4b] transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800/40 font-semibold">
                              {item.senderName || item.sender}
                            </span>
                            <span className="text-xs font-mono text-zinc-500">
                              UID: {item.id}
                            </span>
                          </div>
                          {item.date && (
                            <div className="flex items-center gap-1 text-xs font-mono text-zinc-400">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              <span>{new Date(item.date).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <h4 className="text-lg font-serif font-bold text-zinc-100 leading-snug">
                          {item.subject}
                        </h4>

                        <p className="text-xs font-serif text-zinc-300 leading-relaxed bg-[#0a0c0e] p-3 rounded-lg border border-[#20232a] line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                          {item.bodyText}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1f232a] text-xs font-mono">
                          <div className="text-zinc-500">
                            {item.links.length} hyperlinks identified
                          </div>

                          {item.webUrl ? (
                            <a
                              href={item.webUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-semibold transition-all flex items-center gap-1 shadow-sm"
                            >
                              <span>Read Post on Substack</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-zinc-600">No direct Substack slug link</span>
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
            <div className="p-5 rounded-xl border border-[#272b33] bg-[#121418] shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#23272f] pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-semibold font-mono text-zinc-100">
                    OpenRouter LLM Router Studio
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 font-mono">
                    Token Inspection Active
                  </span>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  Endpoint: <code className="text-purple-300">openrouter.ai/api/v1</code>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Model Selector */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Model Selector</label>
                  <select
                    value={llmModel}
                    onChange={(e) => setLlmModel(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-purple-500"
                  >
                    {modelOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom Model String */}
                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">
                    Custom Model (Optional - e.g. anthropic/claude-3.5-sonnet)
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="Overrides dropdown if provided"
                    className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Temperature & Max Tokens */}
                <div className="md:col-span-6 space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-zinc-400">
                    <span>Temperature</span>
                    <span className="text-purple-300 font-bold">{llmTemperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={llmTemperature}
                    onChange={(e) => setLlmTemperature(parseFloat(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>

                <div className="md:col-span-6 space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">Max Tokens</label>
                  <input
                    type="number"
                    value={llmMaxTokens}
                    onChange={(e) => setLlmMaxTokens(Number(e.target.value))}
                    className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* System Prompt */}
                <div className="md:col-span-12 space-y-1.5">
                  <label className="text-xs font-mono text-zinc-400">System Instruction</label>
                  <textarea
                    rows={2}
                    value={llmSystemPrompt}
                    onChange={(e) => setLlmSystemPrompt(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* User Prompt */}
                <div className="md:col-span-12 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-zinc-400">Prompt / Digest Input</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (arxivResult?.papers.length) {
                            const summary = arxivResult.papers
                              .slice(0, 5)
                              .map((p) => `- [${p.primaryCategory}] ${p.title}\n  Abstract: ${p.abstract.slice(0, 150)}...`)
                              .join("\n\n");
                            setLlmPrompt(`Format an authoritative newsletter edition based on these latest arXiv research papers:\n\n${summary}`);
                          }
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1f2329] hover:bg-[#282e36] text-blue-300"
                      >
                        + Insert arXiv Digest Context
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={llmPrompt}
                    onChange={(e) => setLlmPrompt(e.target.value)}
                    className="w-full bg-[#0c0d10] border border-[#282d36] rounded-lg p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Submit button */}
                <div className="md:col-span-12 flex justify-end">
                  <button
                    onClick={executeCompletion}
                    disabled={llmLoading || !llmPrompt.trim()}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md shadow-purple-600/20 disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${llmLoading ? "animate-pulse" : ""}`} />
                    <span>{llmLoading ? "Synthesizing..." : "Execute Completion"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {llmError && (
              <div className="p-4 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{llmError}</span>
              </div>
            )}

            {/* LLM Response */}
            {llmResponse && (
              <div className="space-y-4">
                {/* Token usage badges */}
                {llmResponse.usage && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-[#121418] border border-[#272b33] text-center">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Prompt Tokens</div>
                      <div className="text-lg font-mono font-bold text-zinc-100">
                        {llmResponse.usage.prompt_tokens ?? llmResponse.usage.promptTokens ?? 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#121418] border border-[#272b33] text-center">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Completion Tokens</div>
                      <div className="text-lg font-mono font-bold text-purple-400">
                        {llmResponse.usage.completion_tokens ?? llmResponse.usage.completionTokens ?? 0}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#121418] border border-[#272b33] text-center">
                      <div className="text-[10px] font-mono text-zinc-500 uppercase">Total Tokens</div>
                      <div className="text-lg font-mono font-bold text-emerald-400">
                        {llmResponse.usage.total_tokens ?? llmResponse.usage.totalTokens ?? 0}
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Box */}
                <div className="p-6 rounded-xl border border-[#272b33] bg-[#121418] shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-[#23272f] pb-2 text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      Model: <code className="text-purple-300 font-bold">{llmResponse.model}</code>
                    </span>
                    {llmResponse.finishReason && (
                      <span className="text-zinc-500">Finish: {llmResponse.finishReason}</span>
                    )}
                  </div>
                  <div className="prose prose-invert max-w-none text-sm font-serif leading-relaxed text-zinc-200 whitespace-pre-wrap">
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
            <div className="p-5 rounded-xl border border-[#272b33] bg-[#121418] shadow-lg flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold font-mono text-zinc-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-red-500" />
                  <span>Consolidated Multi-Source Intelligence Snapshot</span>
                </h3>
                <p className="text-xs font-serif text-zinc-400 mt-1">
                  Triggers concurrent polling across arXiv preprints, zero-auth Reddit feeds, and Gmail Substack newsletters.
                </p>
              </div>

              <button
                onClick={fetchSnapshot}
                disabled={snapshotLoading}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${snapshotLoading ? "animate-spin" : ""}`} />
                <span>{snapshotLoading ? "Gathering Streams..." : "Refresh Snapshot"}</span>
              </button>
            </div>

            {snapshotError && (
              <div className="p-4 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{snapshotError}</span>
              </div>
            )}

            {snapshotData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Column 1: arXiv Snapshot */}
                  <div className="p-5 rounded-xl border border-[#272b33] bg-[#121418] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#23272f] pb-2">
                      <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4" />
                        arXiv Feed
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {snapshotData.arxiv?.papers?.length || 0} papers
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {snapshotData.arxiv?.papers?.map((p: any) => (
                        <div key={p.arxivId} className="p-2.5 rounded bg-[#0b0d10] border border-[#20232a] text-xs">
                          <div className="font-serif font-bold text-zinc-200 line-clamp-2">{p.title}</div>
                          <div className="text-[10px] font-mono text-blue-400 mt-1">{p.primaryCategory}</div>
                        </div>
                      )) || <div className="text-zinc-500 text-xs font-mono">No papers loaded</div>}
                    </div>
                  </div>

                  {/* Column 2: Reddit Snapshot */}
                  <div className="p-5 rounded-xl border border-[#272b33] bg-[#121418] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#23272f] pb-2">
                      <span className="text-xs font-mono font-bold text-orange-400 flex items-center gap-1.5">
                        <Radio className="w-4 h-4" />
                        Reddit Watcher
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {snapshotData.reddit?.posts?.length || 0} posts
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {snapshotData.reddit?.posts?.map((post: any) => (
                        <div key={post.id} className="p-2.5 rounded bg-[#0b0d10] border border-[#20232a] text-xs">
                          <div className="font-serif font-bold text-zinc-200 line-clamp-2">{post.title}</div>
                          <div className="text-[10px] font-mono text-orange-400 mt-1">{post.subreddit} • by {post.author}</div>
                        </div>
                      )) || <div className="text-zinc-500 text-xs font-mono">No posts loaded</div>}
                    </div>
                  </div>

                  {/* Column 3: Gmail Snapshot */}
                  <div className="p-5 rounded-xl border border-[#272b33] bg-[#121418] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#23272f] pb-2">
                      <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                        <Globe className="w-4 h-4" />
                        Substack In-Box
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500">
                        {snapshotData.gmail?.emails?.length || 0} issues
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                      {snapshotData.gmail?.emails?.map((email: any) => (
                        <div key={email.id} className="p-2.5 rounded bg-[#0b0d10] border border-[#20232a] text-xs">
                          <div className="font-serif font-bold text-zinc-200 line-clamp-2">{email.subject}</div>
                          <div className="text-[10px] font-mono text-amber-400 mt-1">{email.senderName || email.sender}</div>
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
        <div className="min-h-screen bg-[#090a0b] flex items-center justify-center text-xs font-mono text-zinc-400">
          Loading Command Center...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
