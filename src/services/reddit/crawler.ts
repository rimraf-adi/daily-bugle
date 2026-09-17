import { XMLParser } from "fast-xml-parser";
import { RedditPost, RedditDigest, RedditQueryResult } from "@/types/reddit";

const BASE_URL = "https://www.reddit.com";
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (DailyBugle/1.0)";

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

  const linkTagMatch = html.match(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>\s*\[link\]\s*<\/a>/i);
  if (linkTagMatch && linkTagMatch[1]) {
    externalUrl = decodeHtmlEntities(linkTagMatch[1]);
  }

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

  let stripped = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ");

  stripped = decodeHtmlEntities(stripped);

  stripped = stripped
    .replace(/submitted by\s+\/u\/[a-zA-Z0-9_\-]+/gi, "")
    .replace(/\[link\]/gi, "")
    .replace(/\[comments\]/gi, "")
    .replace(/\/u\/[a-zA-Z0-9_\-]+/gi, "");

  const cleanText = stripped.replace(/\s+/g, " ").trim();
  return { cleanText, externalUrl };
}

export class RedditCrawler {
  private userAgent: string;
  private timeoutMs: number;
  private lastRequestTime: number = 0;
  private throttleQueue: Promise<void> = Promise.resolve();

  constructor(
    userAgent: string = DEFAULT_USER_AGENT,
    _cacheTtlSeconds: number = 0, // Zero cache
    timeoutSeconds: number = 20
  ) {
    this.userAgent = userAgent;
    this.timeoutMs = timeoutSeconds * 1000;
  }

  private async throttle(minIntervalMs: number = 2500): Promise<void> {
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

  // Pure live fetch: NO CACHE
  private async fetchFeedXml(url: string): Promise<{ xml: string; fromCache: false; rateLimited?: boolean }> {
    await this.throttle(2500);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      let resp = await fetch(url, {
        headers: {
          "User-Agent": this.userAgent,
          Accept: "application/atom+xml,application/rss+xml,text/xml;q=0.9,*/*;q=0.8",
        },
        signal: controller.signal,
        cache: "no-store",
      });

      if (resp.status === 429) {
        const resetHeader = resp.headers.get("x-ratelimit-reset");
        const resetSeconds = resetHeader ? parseInt(resetHeader, 10) : 4;

        if (resetSeconds <= 5) {
          await new Promise((resolve) => setTimeout(resolve, (resetSeconds + 1) * 1000));
          resp = await fetch(url, {
            headers: {
              "User-Agent": this.userAgent,
              Accept: "application/atom+xml,application/rss+xml,text/xml;q=0.9,*/*;q=0.8",
            },
            signal: controller.signal,
            cache: "no-store",
          });
        }

        if (resp.status === 429) {
          throw new Error(`Reddit rate-limit reached (HTTP 429). Please wait a few seconds before refetching.`);
        }
      }

      if (!resp.ok) {
        throw new Error(`Failed to crawl Reddit feed from '${url}' (HTTP ${resp.status})`);
      }

      const rawXml = await resp.text();
      return { xml: rawXml, fromCache: false };
    } finally {
      clearTimeout(timer);
    }
  }

  parseFeedXml(xmlContent: string, fallbackSub: string = ""): RedditPost[] {
    if (!xmlContent || !xmlContent.includes("<feed")) {
      return [];
    }

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

      let permalink = "";
      if (entry.link && Array.isArray(entry.link)) {
        for (const l of entry.link) {
          if (l["@_href"]) {
            permalink = l["@_href"];
            break;
          }
        }
      }

      const author = entry.author?.name?.["#text"] || entry.author?.name || "/u/unknown";

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
    const url = `${BASE_URL}/r/${cleanSub}/${listing}.rss${queryStr}`;

    const { xml } = await this.fetchFeedXml(url);
    const allPosts = this.parseFeedXml(xml, `r/${cleanSub}`);
    const posts = allPosts.slice(0, limit);

    return {
      posts,
      rawXml: xml,
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

    const { xml } = await this.fetchFeedXml(url);
    const posts = this.parseFeedXml(xml, fallbackSub);
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
        // Continue
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
