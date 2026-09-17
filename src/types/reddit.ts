/**
 * Reddit models and watchlist types.
 */

export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  permalink: string;
  externalUrl?: string;
  contentText: string;
  contentHtml?: string;
  publishedAt?: string;
}

export interface TrackedSubreddit {
  name: string;
  cleanName?: string;
  displayName?: string;
  category: string;
  listing: "hot" | "new" | "top" | "rising";
  timeFilter?: "day" | "week" | "month" | "year" | "all";
  limit: number;
  includeKeywords?: string[];
  excludeKeywords?: string[];
  flairs?: string[];
  enabled: boolean;
}

export interface RedditDigest {
  subreddits: string[];
  posts: RedditPost[];
  topic?: string;
  generatedAt?: string;
  totalPosts?: number;
}

export interface RedditQueryResult {
  posts: RedditPost[];
  rawXml?: string;
  subreddit?: string;
  listing?: string;
  query?: string;
  url?: string;
  latencyMs?: number;
}
