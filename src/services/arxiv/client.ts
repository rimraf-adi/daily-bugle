import { XMLParser } from "fast-xml-parser";
import { ArxivPaper, PaperLinks, NewsletterDigest, ArxivQueryResult, ArxivSearchParams } from "@/types/arxiv";
import { CATEGORY_MAP, normalizeArxivQuery } from "./taxonomy";

const BASE_URL = "https://export.arxiv.org/api/query";
const DEFAULT_USER_AGENT = "DailyBugleNewsletter/1.0 (contact: bot@dailybugle.local)";

interface RawXmlFeed {
  feed?: {
    entry?: RawXmlEntry[];
    id?: string;
    title?: string | { "#text"?: string };
    updated?: string;
    [key: string]: unknown;
  };
}

interface RawXmlEntry {
  id?: string;
  title?: string | { "#text"?: string };
  summary?: string | { "#text"?: string };
  published?: string;
  updated?: string;
  author?: Array<{ name?: string | { "#text"?: string } }>;
  category?: Array<{ "@_term"?: string; "@_scheme"?: string }>;
  "arxiv:primary_category"?: { "@_term"?: string };
  link?: Array<{ "@_rel"?: string; "@_href"?: string; "@_title"?: string; "@_type"?: string }>;
  "arxiv:comment"?: string | { "#text"?: string };
  "arxiv:journal_ref"?: string | { "#text"?: string };
  "arxiv:doi"?: string | { "#text"?: string };
}

function getText(val: unknown): string {
  if (!val) return "";
  if (typeof val === "string") return val.trim();
  if (typeof val === "object" && val !== null && "#text" in val) {
    return String((val as { "#text"?: unknown })["#text"] || "").trim();
  }
  return String(val).trim();
}

function cleanWhitespace(str: string): string {
  return str.replace(/\s+/g, " ").trim();
}

export class ArxivClient {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(baseUrl: string = BASE_URL, timeoutMs: number = 20000) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
  }

  async searchRaw(params: ArxivSearchParams): Promise<ArxivQueryResult> {
    const normalizedQuery = normalizeArxivQuery(params.query);
    const urlParams = new URLSearchParams({
      search_query: normalizedQuery,
      start: String(params.start ?? 0),
      max_results: String(params.maxResults ?? 10),
      sortBy: params.sortBy ?? "submittedDate",
      sortOrder: params.sortOrder ?? "descending",
    });

    const targetUrl = `${this.baseUrl}?${urlParams.toString()}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const resp = await fetch(targetUrl, {
        headers: {
          "User-Agent": DEFAULT_USER_AGENT,
        },
        signal: controller.signal,
        cache: "no-store",
      });

      if (!resp.ok) {
        throw new Error(`arXiv API error HTTP ${resp.status}: ${await resp.text().catch(() => "")}`);
      }

      const rawXml = await resp.text();
      const papers = this.parseFeedXml(rawXml);

      return {
        papers,
        rawXml,
        query: normalizedQuery,
        totalResults: papers.length,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async search(
    query: string,
    start: number = 0,
    maxResults: number = 10,
    sortBy: "relevance" | "lastUpdatedDate" | "submittedDate" = "submittedDate",
    sortOrder: "ascending" | "descending" = "descending"
  ): Promise<ArxivPaper[]> {
    const res = await this.searchRaw({ query, start, maxResults, sortBy, sortOrder });
    return res.papers;
  }

  async fetchNewsletterDigest(
    categories: string[] | string = ["cs.AI", "cs.LG", "cs.CL"],
    maxResults: number = 10,
    topic?: string,
    sortBy: "relevance" | "lastUpdatedDate" | "submittedDate" = "submittedDate"
  ): Promise<NewsletterDigest> {
    const catList = Array.isArray(categories) ? categories : [categories];
    const query = catList.map((c) => `cat:${c}`).join(" OR ");

    const finalTopic =
      topic ||
      `Latest Updates in ${catList.map((c) => CATEGORY_MAP[c] || c).join(", ")}`;

    const papers = await this.search(query, 0, maxResults, sortBy, "descending");
    return {
      topic: finalTopic,
      papers,
      generatedAt: new Date().toISOString(),
    };
  }

  parseFeedXml(xmlString: string): ArxivPaper[] {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      isArray: (name) => ["entry", "author", "category", "link"].includes(name),
    });

    const parsed = parser.parse(xmlString) as RawXmlFeed;
    const entries = parsed?.feed?.entry || [];
    const papers: ArxivPaper[] = [];

    for (const entry of entries) {
      const rawId = getText(entry.id);
      const arxivId = rawId.includes("/abs/") ? rawId.split("/abs/").pop() || rawId : rawId;
      const title = cleanWhitespace(getText(entry.title));
      const abstract = cleanWhitespace(getText(entry.summary));

      // Authors
      const authors: string[] = [];
      if (entry.author && Array.isArray(entry.author)) {
        for (const author of entry.author) {
          const name = cleanWhitespace(getText(author.name));
          if (name) authors.push(name);
        }
      }

      const published = getText(entry.published) || undefined;
      const updated = getText(entry.updated) || undefined;

      // Links
      let absLink: string | undefined;
      let pdfLink: string | undefined;

      if (entry.link && Array.isArray(entry.link)) {
        for (const link of entry.link) {
          const rel = link["@_rel"];
          const href = link["@_href"];
          const titleAttr = link["@_title"];

          if (rel === "alternate" && href) {
            absLink = href;
          } else if (titleAttr === "pdf" && href) {
            pdfLink = href;
          }
        }
      }

      const finalAbsLink = absLink || `https://arxiv.org/abs/${arxivId}`;
      const finalPdfLink = pdfLink || `https://arxiv.org/pdf/${arxivId}.pdf`;
      const finalHtmlLink = `https://arxiv.org/html/${arxivId}`;

      const links: PaperLinks = {
        abstract: finalAbsLink,
        pdf: finalPdfLink,
        html: finalHtmlLink,
        fullArticle: finalHtmlLink,
      };

      // Categories
      const primaryCatTerm = entry["arxiv:primary_category"]?.["@_term"];
      const categories: string[] = [];

      if (entry.category && Array.isArray(entry.category)) {
        for (const cat of entry.category) {
          const term = cat["@_term"];
          if (term && !categories.includes(term)) {
            categories.push(term);
          }
        }
      }

      const primaryCategory = primaryCatTerm || categories[0] || "cs.AI";
      const primaryCategoryName = CATEGORY_MAP[primaryCategory] || primaryCategory;
      const categoryNames = categories.map((c) => CATEGORY_MAP[c] || c);

      // Comments & metadata
      const comment = cleanWhitespace(getText(entry["arxiv:comment"])) || undefined;
      const journalRef = cleanWhitespace(getText(entry["arxiv:journal_ref"])) || undefined;
      const doi = cleanWhitespace(getText(entry["arxiv:doi"])) || undefined;

      papers.push({
        arxivId,
        title,
        abstract,
        authors,
        published,
        updated,
        primaryCategory,
        primaryCategoryName,
        categories,
        categoryNames,
        comment,
        journalRef,
        doi,
        links,
      });
    }

    return papers;
  }
}

export const defaultArxivClient = new ArxivClient();
