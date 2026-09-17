"use client";

import React, { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Code2, FileText, Database } from "lucide-react";

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
    <div className="rounded-lg border border-[#272a30] bg-[#0e1013] overflow-hidden shadow-xl transition-all">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#14171c] border-b border-[#272a30] gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
            {title}
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            ({lineCount} lines • {formattedSize})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <div className="flex items-center bg-[#090a0b] rounded p-0.5 border border-[#272a30]">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all font-mono ${
                    isActive
                      ? "bg-[#272a30] text-zinc-100 font-medium shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tab.language === "xml" && <Code2 className="w-3 h-3 text-amber-400" />}
                  {tab.language === "json" && <Database className="w-3 h-3 text-cyan-400" />}
                  {tab.language === "text" && <FileText className="w-3 h-3 text-emerald-400" />}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] px-1 bg-zinc-800 rounded text-zinc-400">
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
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#1f2329] hover:bg-[#282d35] text-zinc-200 rounded border border-[#30353f] transition-all disabled:opacity-40"
            title="Copy Raw Content"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-mono">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span className="font-mono">Copy</span>
              </>
            )}
          </button>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-[#1f2329] rounded transition-all"
            title={isCollapsed ? "Expand Inspector" : "Collapse Inspector"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {!isCollapsed && (
        <div className="relative">
          <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto max-h-[480px] overflow-y-auto whitespace-pre leading-relaxed bg-[#0a0c0e]">
            <code>{content || "// No payload available"}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
