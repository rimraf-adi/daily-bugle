import { NextResponse } from "next/server";
import { defaultArxivClient } from "@/services/arxiv/client";
import { defaultSubredditTracker } from "@/services/reddit/tracker";
import { defaultGmailClient } from "@/services/gmail/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const timestamp = new Date().toISOString();

  // Run all three modules concurrently
  const [arxivResult, redditResult, gmailResult] = await Promise.allSettled([
    // Fetch arXiv papers across top AI categories
    defaultArxivClient.searchRaw({
      query: "cat:cs.AI OR cat:cs.LG",
      start: 0,
      maxResults: 6,
      sortBy: "submittedDate",
      sortOrder: "descending",
    }),

    // Fetch trending posts across active watchlist
    defaultSubredditTracker.getTrendingDigest(),

    // Fetch Gmail Substack newsletters if configured
    (async () => {
      const hasUser = Boolean(process.env.GMAIL_USER || process.env.GMAIL_EMAIL);
      const hasPass = Boolean(process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD);
      if (!hasUser || !hasPass) {
        return { configured: false, emails: [], count: 0, message: "Gmail credentials not set" };
      }
      return defaultGmailClient.fetchSubstackEmailsRaw({ folder: "INBOX", limit: 6 });
    })(),
  ]);

  return NextResponse.json({
    timestamp,
    arxiv: arxivResult.status === "fulfilled" ? arxivResult.value : { error: String(arxivResult.reason) },
    reddit: redditResult.status === "fulfilled" ? redditResult.value : { error: String(redditResult.reason) },
    gmail: gmailResult.status === "fulfilled" ? gmailResult.value : { error: String(gmailResult.reason) },
  });
}
