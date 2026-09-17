import { XMLParser } from "fast-xml-parser";
import { RedditPost, RedditDigest, RedditQueryResult } from "@/types/reddit";

const BASE_URL = "https://www.reddit.com";
const DEFAULT_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 DailyBugle/1.0";

export const COMMON_SUBREDDIT_ALIASES: Record<string, string> = {
  artificialintelligence: "artificial",
  ai: "artificial",
  ml: "MachineLearning",
  localllm: "LocalLLaMA",
  llama: "LocalLLaMA",
  claude: "ClaudeAI",
  chatgpt: "ChatGPT",
  openai: "OpenAI",
};

export function normalizeSubreddit(name: string): string {
  const clean = name.replace(/^r\//i, "").trim();
  return COMMON_SUBREDDIT_ALIASES[clean.toLowerCase()] || clean;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#32;/g, " ")
    .replace(/&nbsp;/g, " ");
}

export function cleanRedditHtml(html: string): { cleanText: string; externalUrl?: string } {
  let externalUrl: string | undefined;

  // 1. Look for [link] anchor href: <a href="(url)">[link]</a>
  const linkTagMatch = html.match(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>\s*\[link\]\s*<\/a>/i);
  if (linkTagMatch && linkTagMatch[1]) {
    externalUrl = decodeHtmlEntities(linkTagMatch[1]);
  }

  // 2. If not found, look for any external link not pointing to reddit.com
  if (!externalUrl) {
    const allLinks = Array.from(html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi));
    for (const match of allLinks) {
      const href = decodeHtmlEntities(match[1]);
      if (href.startsWith("http") && !href.includes("reddit.com")) {
        externalUrl = href;
        break;
      }
    }
  }

  // 3. Clean HTML tags for content text
  let stripped = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ");

  stripped = decodeHtmlEntities(stripped);

  // Remove common Reddit RSS boilerplate
  stripped = stripped
    .replace(/submitted by\s+\/u\/[a-zA-Z0-9_\-]+/gi, "")
    .replace(/\[link\]/gi, "")
    .replace(/\[comments\]/gi, "")
    .replace(/\/u\/[a-zA-Z0-9_\-]+/gi, "");

  const cleanText = stripped.replace(/\s+/g, " ").trim();
  return { cleanText, externalUrl };
}

interface CacheEntry {
  timestamp: number;
  posts: RedditPost[];
  rawXml: string;
}

export class RedditCrawler {
  private userAgent: string;
  private cacheTtlMs: number;
  private timeoutMs: number;
  private cache: Map<string, CacheEntry> = new Map();
  private lastRequestTime: number = 0;
  private throttleQueue: Promise<void> = Promise.resolve();

  constructor(
    userAgent: string = DEFAULT_USER_AGENT,
    cacheTtlSeconds: number = 90,
    timeoutSeconds: number = 15
  ) {
    this.userAgent = userAgent;
    this.cacheTtlMs = cacheTtlSeconds * 1000;
    this.timeoutMs = timeoutSeconds * 1000;
  }

  private async throttle(minIntervalMs: number = 2000): Promise<void> {
    const currentQueue = this.throttleQueue;
    let nextResolve: () => void;
    this.throttleQueue = new Promise((resolve) => {
      nextResolve = resolve;
    });

    await currentQueue;
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < minIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, minIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();
    nextResolve!();
  }

  private async fetchFeedXml(url: string): Promise<string> {
    const now = Date.now();
    const cached = this.cache.get(url);
    if (cached && now - cached.timestamp < this.cacheTtlMs) {
      return cached.rawXml;
    }

    await this.throttle();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      let resp = await fetch(url, {
        headers: {
          "User-Agent": this.userAgent,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      // Retry once on 429 after small backoff
      if (resp.status === 429) {
        if (cached) {
          // Serve stale cache gracefully
          return cached.rawXml;
        }
        await new Promise((resolve) => setTimeout(resolve, 4000));
        resp = await fetch(url, {
          headers: {
            "User-Agent": this.userAgent,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
          signal: controller.signal,
          cache: "no-store",
        });
      }

      if (!resp.ok) {
        if (cached) {
          return cached.rawXml;
        }
        throw new Error(`Failed to crawl Reddit feed from '${url}' (HTTP ${resp.status})`);
      }

      const rawXml = await resp.text();
      return rawXml;
    } catch (err) {
      if (cached) {
        return cached.rawXml;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  parseFeedXml(xmlContent: string, fallbackSub: string = ""): RedditPost[] {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      isArray: (name) => ["entry", "category", "link"].includes(name),
    });

    const parsed = parser.parse(xmlContent);
    const entries = parsed?.feed?.entry || [];
    const posts: RedditPost[] = [];

    for (const entry of entries) {
      const rawId = String(entry.id || "").trim();
      const title = String(entry.title?.["#text"] || entry.title || "").replace(/\s+/g, " ").trim();

      // Permalink
      let permalink = "";
      if (entry.link && Array.isArray(entry.link)) {
        for (const l of entry.link) {
          if (l["@_href"]) {
            permalink = l["@_href"];
            break;
          }
        }
      }

      // Author
      const author = entry.author?.name?.["#text"] || entry.author?.name || "/u/unknown";

      // Subreddit category
      let subreddit = fallbackSub;
      if (entry.category && Array.isArray(entry.category)) {
        for (const cat of entry.category) {
          const term = cat["@_term"] || cat["@_label"];
          if (term) {
            subreddit = term.startsWith("r/") ? term : `r/${term}`;
            break;
          }
        }
      }

      const publishedAt = entry.updated || entry.published || undefined;
      const contentHtml = String(entry.content?.["#text"] || entry.content || "");

      const { cleanText, externalUrl } = cleanRedditHtml(contentHtml);

      posts.push({
        id: rawId,
        title,
        author: String(author).trim(),
        subreddit,
        permalink,
        externalUrl: externalUrl || permalink,
        contentText: cleanText,
        contentHtml: contentHtml || undefined,
        publishedAt,
      });
    }

    return posts;
  }

  async getPostsRaw(
    subreddit: string,
    listing: string = "hot",
    limit: number = 10,
    timeFilter?: string
  ): Promise<RedditQueryResult> {
    const cleanSub = normalizeSubreddit(subreddit);
    const params = new URLSearchParams();
    if (listing === "top" && timeFilter) {
      params.set("t", timeFilter);
    }
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    const url = `${BASE_URL}/r/${cleanSub}/${listing}/.rss${queryStr}`;

    const rawXml = await this.fetchFeedXml(url);
    const allPosts = this.parseFeedXml(rawXml, `r/${cleanSub}`);

    this.cache.set(url, {
      timestamp: Date.now(),
      posts: allPosts,
      rawXml,
    });

    const posts = allPosts.slice(0, limit);
    return {
      posts,
      rawXml,
      subreddit: `r/${cleanSub}`,
      listing,
      url,
    };
  }

  async getPosts(
    subreddit: string,
    listing: string = "hot",
    limit: number = 10,
    timeFilter?: string
  ): Promise<RedditPost[]> {
    const result = await this.getPostsRaw(subreddit, listing, limit, timeFilter);
    return result.posts;
  }

  async search(query: string, subreddit?: string, limit: number = 10): Promise<RedditPost[]> {
    const params = new URLSearchParams({ q: query, sort: "relevance" });
    let url: string;
    let fallbackSub: string;

    if (subreddit) {
      const cleanSub = normalizeSubreddit(subreddit);
      url = `${BASE_URL}/r/${cleanSub}/search.rss?${params.toString()}`;
      fallbackSub = `r/${cleanSub}`;
    } else {
      url = `${BASE_URL}/search.rss?${params.toString()}`;
      fallbackSub = "r/all";
    }

    const rawXml = await this.fetchFeedXml(url);
    const posts = this.parseFeedXml(rawXml, fallbackSub);
    return posts.slice(0, limit);
  }

  async createDigest(
    subreddits: string[] | string = ["LocalLLaMA", "MachineLearning"],
    listing: string = "hot",
    limitPerSub: number = 5
  ): Promise<RedditDigest> {
    const subList = Array.isArray(subreddits) ? subreddits : [subreddits];
    const allPosts: RedditPost[] = [];
    const normalizedSubs: string[] = [];

    for (const sub of subList) {
      const clean = normalizeSubreddit(sub);
      normalizedSubs.push(`r/${clean}`);
      try {
        const posts = await this.getPosts(clean, listing, limitPerSub);
        allPosts.push(...posts);
      } catch {
        // Tolerate individual failures
      }
    }

    return {
      topic: `Trending AI posts across ${normalizedSubs.join(", ")}`,
      subreddits: normalizedSubs,
      posts: allPosts,
      totalPosts: allPosts.length,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const defaultRedditCrawler = new RedditCrawler();
