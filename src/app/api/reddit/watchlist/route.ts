import { NextRequest, NextResponse } from "next/server";
import { defaultSubredditTracker } from "@/services/reddit/tracker";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action") || "list";
    const enabledOnly = searchParams.get("enabledOnly") === "true";

    if (action === "poll") {
      const digest = await defaultSubredditTracker.pollNewPosts(true);
      return NextResponse.json(digest);
    }

    if (action === "trending") {
      const digest = await defaultSubredditTracker.getTrendingDigest();
      return NextResponse.json(digest);
    }

    const watchlist = defaultSubredditTracker.listWatchlist(enabledOnly);
    return NextResponse.json({ watchlist });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error managing watchlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || "add";

    if (action === "add") {
      const { name, category, listing, timeFilter, limit, includeKeywords, excludeKeywords } = body;
      if (!name) {
        return NextResponse.json({ error: "Subreddit name is required" }, { status: 400 });
      }

      const item = defaultSubredditTracker.addSubreddit(
        name,
        category || "General",
        listing || "hot",
        timeFilter,
        limit || 5,
        includeKeywords || [],
        excludeKeywords || []
      );
      return NextResponse.json({ success: true, item });
    }

    if (action === "remove") {
      const { name } = body;
      if (!name) {
        return NextResponse.json({ error: "Subreddit name is required" }, { status: 400 });
      }
      const removed = defaultSubredditTracker.removeSubreddit(name);
      return NextResponse.json({ success: removed });
    }

    if (action === "toggle") {
      const { name, enabled } = body;
      if (!name || enabled === undefined) {
        return NextResponse.json({ error: "Subreddit name and enabled boolean required" }, { status: 400 });
      }
      const updated = defaultSubredditTracker.setEnabled(name, Boolean(enabled));
      return NextResponse.json({ success: updated });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error handling watchlist request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
