import { NextRequest, NextResponse } from "next/server";
import { defaultGmailClient } from "@/services/gmail/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get("folder") || "INBOX";
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "15", 10));
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const hasUser = Boolean(process.env.GMAIL_USER || process.env.GMAIL_EMAIL);
    const hasPass = Boolean(process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD);

    if (!hasUser || !hasPass) {
      return NextResponse.json(
        {
          emails: [],
          folder,
          count: 0,
          configured: false,
          error: "GMAIL_USER and GMAIL_APP_PASSWORD are not configured in .env.local",
        },
        { status: 200 }
      );
    }

    const result = await defaultGmailClient.fetchSubstackEmailsRaw({
      folder,
      limit,
      unreadOnly,
    });

    return NextResponse.json({
      ...result,
      configured: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error connecting to Gmail IMAP";
    return NextResponse.json(
      {
        emails: [],
        folder: "INBOX",
        count: 0,
        configured: true,
        error: message,
      },
      { status: 500 }
    );
  }
}
