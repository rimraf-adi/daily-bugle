import { ImapFlow } from "imapflow";
import { SubstackEmail, SubstackDigest, GmailQueryResult } from "@/types/gmail";

const IMAP_HOST = "imap.gmail.com";
const IMAP_PORT = 993;

export function extractSubstackPostUrl(textOrHtml: string, links: string[]): string | undefined {
  for (const link of links) {
    const match = link.match(/https?:\/\/[a-zA-Z0-9_\-]+\.substack\.com\/p\/[a-zA-Z0-9_\-]+/i);
    if (match) {
      return match[0].split("?")[0];
    }
  }

  const rawMatch = textOrHtml.match(/https?:\/\/[a-zA-Z0-9_\-]+\.substack\.com\/p\/[a-zA-Z0-9_\-]+/i);
  if (rawMatch) {
    return rawMatch[0].split("?")[0];
  }

  for (const link of links) {
    if (link.includes("substack.com") && !link.includes("/unsubscribe") && !link.includes("/action/")) {
      return link.split("?")[0];
    }
  }

  return undefined;
}

export function extractLinks(content: string): string[] {
  const matches = Array.from(content.matchAll(/https?:\/\/[^\s"'<>\)]+/gi));
  const urls: string[] = [];
  for (const m of matches) {
    const url = m[0].replace(/[.,;:]+$/, "");
    if (!urls.includes(url)) {
      urls.push(url);
    }
  }
  return urls;
}

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*[\/]?>/gi, " ")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export class GmailClient {
  private user: string;
  private pass: string;
  private host: string;
  private port: number;

  constructor(user?: string, pass?: string, host: string = IMAP_HOST, port: number = IMAP_PORT) {
    this.user = (user || process.env.GMAIL_USER || process.env.GMAIL_EMAIL || "").trim();
    const rawPass = (pass || process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD || "").trim();
    this.pass = rawPass.replace(/\s+/g, "");
    this.host = host;
    this.port = port;
  }

  private getClient(): ImapFlow {
    if (!this.user || !this.pass) {
      throw new Error(
        "Gmail credentials missing. GMAIL_USER and GMAIL_APP_PASSWORD must be configured in environment variables or .env.local"
      );
    }

    return new ImapFlow({
      host: this.host,
      port: this.port,
      secure: true,
      auth: {
        user: this.user,
        pass: this.pass,
      },
      logger: false,
    });
  }

  async fetchSubstackEmailsRaw(options?: {
    folder?: string;
    limit?: number;
    unreadOnly?: boolean;
    customQuery?: string;
  }): Promise<GmailQueryResult> {
    const folder = options?.folder || "INBOX";
    const limit = options?.limit ?? 15;
    const unreadOnly = options?.unreadOnly ?? false;

    const client = this.getClient();
    await client.connect();

    const emails: SubstackEmail[] = [];
    let rawHeadersCollected = "";

    try {
      const lock = await client.getMailboxLock(folder, { readOnly: true });

      try {
        const searchCriteria = unreadOnly
          ? { unseen: true, or: [{ from: "substack.com" }, { header: { "List-Unsubscribe": "substack.com" } }] }
          : { or: [{ from: "substack.com" }, { header: { "List-Unsubscribe": "substack.com" } }] };

        let messageUids: number[] = [];
        try {
          const res = await client.search(searchCriteria, { uid: true });
          messageUids = Array.isArray(res) ? res : [];
        } catch {
          const fallback = await client.search({ from: "substack" }, { uid: true });
          messageUids = Array.isArray(fallback) ? fallback : [];
        }

        if (!messageUids || messageUids.length === 0) {
          const status = await client.status(folder, { messages: true });
          const totalMsgs = status.messages || 0;
          if (totalMsgs > 0) {
            const startSeq = Math.max(1, totalMsgs - limit + 1);
            const range = `${startSeq}:${totalMsgs}`;
            const seqRes = await client.search({ seq: range }, { uid: true });
            messageUids = Array.isArray(seqRes) ? seqRes : [];
          }
        }

        const selectedUids = messageUids.slice(-limit).reverse();

        if (selectedUids.length > 0) {
          const fetchRange = selectedUids.join(",");
          const generator = client.fetch(
            fetchRange,
            {
              envelope: true,
              source: true,
              bodyStructure: true,
              headers: ["from", "to", "subject", "date", "list-unsubscribe"],
            },
            { uid: true }
          );

          for await (const msg of generator) {
            const uidStr = String(msg.uid);
            const env = msg.envelope;
            const subject = env?.subject || "(No Subject)";

            const fromObj = env?.from?.[0];
            const senderRaw = fromObj ? `${fromObj.name ? `${fromObj.name} ` : ""}<${fromObj.address}>` : "Unknown Sender";
            const senderName = fromObj?.name || fromObj?.address || senderRaw;
            const senderEmail = fromObj?.address || undefined;
            const date = env?.date ? new Date(env.date).toISOString() : undefined;

            const rawSource = msg.source ? msg.source.toString("utf-8") : "";
            if (!rawHeadersCollected && msg.headers) {
              rawHeadersCollected = msg.headers.toString("utf-8");
            }

            const links = extractLinks(rawSource);
            const webUrl = extractSubstackPostUrl(rawSource, links);
            const bodyText = stripHtmlToText(rawSource);

            emails.push({
              id: uidStr,
              subject,
              sender: senderRaw,
              senderName,
              senderEmail,
              date,
              webUrl: webUrl || null,
              fullArticleUrl: webUrl || null,
              bodyText: bodyText.slice(0, 4000),
              links: links.slice(0, 15),
              rawHeaders: rawHeadersCollected || undefined,
              rawEmail: rawSource.slice(0, 5000),
            });
          }
        }
      } finally {
        lock.release();
      }
    } finally {
      await client.logout().catch(() => {});
    }

    return {
      emails,
      folder,
      count: emails.length,
      rawHeaders: rawHeadersCollected || undefined,
    };
  }

  async fetchSubstackEmails(
    folder: string = "INBOX",
    limit: number = 15,
    unreadOnly: boolean = false
  ): Promise<SubstackEmail[]> {
    const result = await this.fetchSubstackEmailsRaw({ folder, limit, unreadOnly });
    return result.emails;
  }

  async createSubstackDigest(folder: string = "INBOX", limit: number = 10): Promise<SubstackDigest> {
    const emails = await this.fetchSubstackEmails(folder, limit);
    return {
      emails,
      generatedAt: new Date().toISOString(),
      mailbox: folder,
      totalIssues: emails.length,
    };
  }
}

export const defaultGmailClient = new GmailClient();
