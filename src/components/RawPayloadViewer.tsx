"use client";

import React, { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Code2, FileText, Database, Sparkles } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  content: string;
  language?: "xml" | "json" | "text";
  badge?: string;
}

interface RawPayloadViewerProps {
  title?: string;
  tabs: TabItem[];
  defaultCollapsed?: boolean;
}

export function RawPayloadViewer({
  title = "Raw API Inspection",
  tabs,
  defaultCollapsed = false,
}: RawPayloadViewerProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || "");
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];
  const content = currentTab?.content || "";

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const lineCount = content ? content.split("\n").length : 0;
  const byteCount = new Blob([content]).size;
  const formattedSize = byteCount > 1024 ? `${(byteCount / 1024).toFixed(1)} KB` : `${byteCount} B`;

  return (
    <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#090c14]/90 backdrop-blur-xl overflow-hidden shadow-lg dark:shadow-2xl transition-all">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-slate-50/80 dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.08] gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 font-mono">
              {title}
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono bg-black/[0.04] dark:bg-white/[0.04] px-2 py-0.5 rounded-full border border-black/[0.06] dark:border-white/[0.06]">
            {lineCount} lines • {formattedSize}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <div className="flex items-center bg-black/5 dark:bg-black/40 rounded-full p-0.5 border border-black/10 dark:border-white/10">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-full transition-all font-mono ${
                    isActive
                      ? "bg-white dark:bg-white/15 text-zinc-950 dark:text-white font-medium shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  }`}
                >
                  {tab.language === "xml" && <Code2 className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                  {tab.language === "json" && <Database className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />}
                  {tab.language === "text" && <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-black/[0.06] dark:bg-white/10 rounded-full text-zinc-600 dark:text-zinc-300">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!content}
            className="flex items-center gap-1.5 px-3 py-1 text-xs bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-200 rounded-full border border-black/10 dark:border-white/10 transition-all disabled:opacity-40"
            title="Copy Raw Content"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-mono">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                <span className="font-mono">Copy</span>
              </>
            )}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] rounded-full transition-all"
            title={isCollapsed ? "Expand Inspector" : "Collapse Inspector"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {!isCollapsed && (
        <div className="relative">
          <pre className="p-5 text-xs font-mono text-zinc-800 dark:text-zinc-300 overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre leading-relaxed bg-slate-100/80 dark:bg-[#05070c] border-t border-black/[0.05] dark:border-none">
            <code>{content || "// No payload received yet"}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
