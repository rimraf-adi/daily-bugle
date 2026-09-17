import { RedditPost, RedditDigest, TrackedSubreddit } from "@/types/reddit";
import { RedditCrawler, defaultRedditCrawler, normalizeSubreddit } from "./crawler";

export const DEFAULT_CURATED_WATCHLIST: Array<Omit<TrackedSubreddit, "cleanName" | "displayName">> = [
  {
    name: "LocalLLaMA",
    category: "Open Source AI & LLMs",
    listing: "hot",
    limit: 5,
    includeKeywords: [],
    excludeKeywords: [],
    enabled: true,
  },
  {
    name: "MachineLearning",
    category: "Research & Benchmarks",
    listing: "hot",
    limit: 5,
    includeKeywords: [],
    excludeKeywords: [],
    enabled: true,
  },
  {
    name: "artificial",
    category: "Industry & Applications",
    listing: "hot",
    limit: 3,
    includeKeywords: [],
    excludeKeywords: [],
    enabled: true,
  },
  {
    name: "singularity",
    category: "Frontier Tech & AGI",
    listing: "hot",
    limit: 3,
    includeKeywords: [],
    excludeKeywords: [],
    enabled: true,
  },
  {
    name: "technology",
    category: "General Tech News",
    listing: "hot",
    limit: 3,
    includeKeywords: [],
    excludeKeywords: [],
    enabled: true,
  },
];

function buildTrackedSubreddit(item: Omit<TrackedSubreddit, "cleanName" | "displayName">): TrackedSubreddit {
  const cleanName = normalizeSubreddit(item.name);
  return {
    ...item,
    cleanName,
    displayName: `r/${cleanName}`,
  };
}

export class SubredditTracker {
  private crawler: RedditCrawler;
  private watchlist: Map<string, TrackedSubreddit> = new Map();
  private seenIds: Set<string> = new Set();

  constructor(crawler: RedditCrawler = defaultRedditCrawler) {
    this.crawler = crawler;
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    for (const item of DEFAULT_CURATED_WATCHLIST) {
      const sub = buildTrackedSubreddit(item);
      const key = (sub.cleanName || sub.name).toLowerCase();
      this.watchlist.set(key, sub);
    }
  }

  addSubreddit(
    name: string,
    category: string = "General",
    listing: "hot" | "new" | "top" | "rising" = "hot",
    timeFilter?: "day" | "week" | "month" | "year" | "all",
    limit: number = 5,
    includeKeywords: string[] = [],
    excludeKeywords: string[] = []
  ): TrackedSubreddit {
    const sub = buildTrackedSubreddit({
      name,
      category,
      listing,
      timeFilter,
      limit,
      includeKeywords,
      excludeKeywords,
      enabled: true,
    });

    const key = (sub.cleanName || sub.name).toLowerCase();
    this.watchlist.set(key, sub);
    return sub;
  }

  removeSubreddit(name: string): boolean {
    const clean = normalizeSubreddit(name).toLowerCase();
    return this.watchlist.delete(clean);
  }

  setEnabled(name: string, enabled: boolean): boolean {
    const clean = normalizeSubreddit(name).toLowerCase();
    const item = this.watchlist.get(clean);
    if (item) {
      item.enabled = enabled;
      return true;
    }
    return false;
  }

  listWatchlist(enabledOnly: boolean = false): TrackedSubreddit[] {
    const all = Array.from(this.watchlist.values());
    if (enabledOnly) {
      return all.filter((s) => s.enabled);
    }
    return all;
  }

  private postMatches(sub: TrackedSubreddit, post: RedditPost): boolean {
    const textToMatch = `${post.title} ${post.contentText}`.toLowerCase();

    // Check exclude keywords
    if (sub.excludeKeywords && sub.excludeKeywords.length > 0) {
      for (const kw of sub.excludeKeywords) {
        if (textToMatch.includes(kw.toLowerCase())) {
          return false;
        }
      }
    }

    // Check include keywords
    if (sub.includeKeywords && sub.includeKeywords.length > 0) {
      const hasAny = sub.includeKeywords.some((kw) => textToMatch.includes(kw.toLowerCase()));
      if (!hasAny) {
        return false;
      }
    }

    return true;
  }

  async pollNewPosts(markAsSeen: boolean = true): Promise<RedditDigest> {
    const newPosts: RedditPost[] = [];
    const scannedSubs: string[] = [];

    const activeSubs = this.listWatchlist(true);

    for (const sub of activeSubs) {
      const cleanSub = sub.cleanName || normalizeSubreddit(sub.name);
      scannedSubs.push(sub.displayName || `r/${cleanSub}`);
      try {
        const posts = await this.crawler.getPosts(
          cleanSub,
          sub.listing,
          sub.limit * 2,
          sub.timeFilter
        );

        const matchingUnseen: RedditPost[] = [];
        for (const p of posts) {
          if (this.seenIds.has(p.id)) continue;
          if (this.postMatches(sub, p)) {
            matchingUnseen.push(p);
            if (markAsSeen) {
              this.seenIds.add(p.id);
            }
          }
          if (matchingUnseen.length >= sub.limit) break;
        }

        newPosts.push(...matchingUnseen);
      } catch {
        // Continue scanning others
      }
    }

    return {
      topic: "New Unseen Watchlist Posts",
      subreddits: scannedSubs,
      posts: newPosts,
      totalPosts: newPosts.length,
      generatedAt: new Date().toISOString(),
    };
  }

  async getTrendingDigest(): Promise<RedditDigest> {
    const allPosts: RedditPost[] = [];
    const scannedSubs: string[] = [];

    const activeSubs = this.listWatchlist(true);

    for (const sub of activeSubs) {
      const cleanSub = sub.cleanName || normalizeSubreddit(sub.name);
      scannedSubs.push(sub.displayName || `r/${cleanSub}`);
      try {
        const posts = await this.crawler.getPosts(
          cleanSub,
          sub.listing,
          sub.limit,
          sub.timeFilter
        );
        const filtered = posts.filter((p) => this.postMatches(sub, p));
        allPosts.push(...filtered);
      } catch {
        // Continue
      }
    }

    return {
      topic: "Watchlist Trending Digest",
      subreddits: scannedSubs,
      posts: allPosts,
      totalPosts: allPosts.length,
      generatedAt: new Date().toISOString(),
    };
  }
}

// Global singleton attached to globalThis to preserve watchlist state across Next.js reloads
const globalForTracker = globalThis as unknown as {
  subredditTracker?: SubredditTracker;
};

export const defaultSubredditTracker =
  globalForTracker.subredditTracker ||
  (globalForTracker.subredditTracker = new SubredditTracker());
