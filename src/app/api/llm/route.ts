import { NextRequest, NextResponse } from "next/server";
import { defaultLLMRouter } from "@/services/llm/router";
import { ChatMessage } from "@/types/llm";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt = body.prompt;
    const systemPrompt = body.systemPrompt;
    const messages: ChatMessage[] = body.messages || [];
    const model = body.model || "openrouter/free";
    const temperature = typeof body.temperature === "number" ? body.temperature : undefined;
    const maxTokens = typeof body.maxTokens === "number" ? body.maxTokens : undefined;

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    if (!prompt && (!messages || messages.length === 0)) {
      return NextResponse.json(
        { error: "Either 'prompt' or 'messages' array must be provided" },
        { status: 400 }
      );
    }

    const chatMessages: ChatMessage[] = messages.length > 0 ? messages : [{ role: "user", content: prompt }];

    const result = await defaultLLMRouter.chat({
      messages: chatMessages,
      systemPrompt,
      model,
      temperature,
      maxTokens,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error querying OpenRouter";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
