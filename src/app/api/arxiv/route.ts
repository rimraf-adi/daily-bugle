import { NextRequest, NextResponse } from "next/server";
import { defaultArxivClient } from "@/services/arxiv/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const maxResults = parseInt(searchParams.get("maxResults") || "10", 10);
    const start = parseInt(searchParams.get("start") || "0", 10);
    const sortBy = (searchParams.get("sortBy") as "relevance" | "lastUpdatedDate" | "submittedDate") || "submittedDate";
    const sortOrder = (searchParams.get("sortOrder") as "ascending" | "descending") || "descending";

    let finalQuery: string;
    if (category) {
      finalQuery = `cat:${category}`;
    } else if (q) {
      finalQuery = q;
    } else {
      finalQuery = "cat:cs.AI";
    }

    const result = await defaultArxivClient.searchRaw({
      query: finalQuery,
      start,
      maxResults,
      sortBy,
      sortOrder,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error querying arXiv";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
