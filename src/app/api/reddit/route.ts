import { NextRequest, NextResponse } from "next/server";
import { defaultRedditCrawler } from "@/services/reddit/crawler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sub = searchParams.get("sub") || searchParams.get("subreddit") || "LocalLLaMA";
    const listing = searchParams.get("listing") || "hot";
    const limit = Math.min(25, parseInt(searchParams.get("limit") || "10", 10));
    const timeFilter = searchParams.get("timeFilter") || undefined;
    const q = searchParams.get("q");

    if (q) {
      const posts = await defaultRedditCrawler.search(q, sub, limit);
      return NextResponse.json({
        posts,
        subreddit: `r/${sub}`,
        listing: "search",
        query: q,
        rawXml: "",
      });
    }

    const result = await defaultRedditCrawler.getPostsRaw(sub, listing, limit, timeFilter);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error crawling Reddit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
