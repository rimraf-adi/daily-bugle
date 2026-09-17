/**
 * Gmail and Substack newsletter tracking models.
 */

export interface SubstackEmail {
  id: string;
  subject: string;
  sender: string;
  senderName?: string;
  senderEmail?: string;
  date?: string;
  webUrl?: string | null;
  fullArticleUrl?: string | null;
  bodyText: string;
  bodyHtml?: string;
  links: string[];
  rawHeaders?: string;
  rawEmail?: string;
}

export interface SubstackDigest {
  emails: SubstackEmail[];
  generatedAt?: string;
  mailbox?: string;
  totalIssues?: number;
}

export interface GmailQueryResult {
  emails: SubstackEmail[];
  folder: string;
  count?: number;
  configured?: boolean;
  rawHeaders?: string;
  error?: string;
  latencyMs?: number;
}
