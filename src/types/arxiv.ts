/**
 * arXiv data models and search query parameter types.
 */

export interface PaperLinks {
  abstract: string;
  pdf: string;
  html: string;
  fullArticle?: string;
}

export interface ArxivPaper {
  arxivId: string;
  title: string;
  abstract: string;
  summary?: string;
  authors: string[];
  primaryCategory: string;
  primaryCategoryName: string;
  categories: string[];
  categoryNames: string[];
  published?: string;
  updated?: string;
  comment?: string;
  doi?: string;
  journalRef?: string;
  links: PaperLinks;
}

export interface NewsletterDigest {
  topic: string;
  papers: ArxivPaper[];
  generatedAt?: string;
  totalPapers?: number;
  fullArticleLinks?: string[];
}

export interface ArxivSearchParams {
  query: string;
  start?: number;
  maxResults?: number;
  sortBy?: "relevance" | "lastUpdatedDate" | "submittedDate";
  sortOrder?: "ascending" | "descending";
}

export interface ArxivQueryResult {
  papers: ArxivPaper[];
  rawXml: string;
  query?: string;
  totalResults?: number;
  url?: string;
  latencyMs?: number;
}
