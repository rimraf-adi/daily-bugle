import {
  ChatMessage,
  ChatResponse,
  ChatRequestParams,
  OpenRouterResponseSchema,
  OpenRouterMessage,
} from "@/types/llm";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openrouter/free";

export class LLMRouter {
  private apiKey: string;
  private defaultModel: string;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(
    apiKey?: string,
    defaultModel: string = DEFAULT_MODEL,
    baseUrl: string = OPENROUTER_BASE_URL,
    timeoutSeconds: number = 60
  ) {
    this.apiKey = (apiKey || process.env.OPENROUTER_API_KEY || "").trim();
    this.defaultModel = defaultModel;
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutSeconds * 1000;
  }

  async chat(params: ChatRequestParams): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not set. Please configure it in your environment or .env.local file."
      );
    }

    const model = params.model || this.defaultModel;
    const messages: OpenRouterMessage[] = [];

    if (params.systemPrompt) {
      messages.push({ role: "system", content: params.systemPrompt });
    }
    messages.push(...params.messages);

    const payload: Record<string, unknown> = {
      model,
      messages,
    };

    if (params.temperature !== undefined) {
      payload.temperature = params.temperature;
    }
    if (params.maxTokens !== undefined || params.max_tokens !== undefined) {
      payload.max_tokens = params.maxTokens ?? params.max_tokens;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const resp = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://github.com/rimraf-adi/daily-bugle",
          "X-Title": "Daily Bugle",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        cache: "no-store",
      });

      const rawJson = (await resp.json().catch(() => ({}))) as OpenRouterResponseSchema;

      if (!resp.ok) {
        const errorMsg = rawJson.error?.message || `HTTP ${resp.status} ${resp.statusText}`;
        throw new Error(`OpenRouter API error: ${errorMsg}`);
      }

      const choice = rawJson.choices?.[0];
      const content = choice?.message?.content || "";
      const finishReason = choice?.finish_reason || undefined;

      const usage = rawJson.usage
        ? {
            prompt_tokens: rawJson.usage.prompt_tokens,
            completion_tokens: rawJson.usage.completion_tokens,
            total_tokens: rawJson.usage.total_tokens,
            promptTokens: rawJson.usage.prompt_tokens,
            completionTokens: rawJson.usage.completion_tokens,
            totalTokens: rawJson.usage.total_tokens,
          }
        : undefined;

      return {
        id: rawJson.id,
        content,
        model: rawJson.model || model,
        usage,
        finishReason,
        rawJson,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async complete(
    prompt: string,
    systemPrompt?: string,
    model?: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<ChatResponse> {
    return this.chat({
      messages: [{ role: "user", content: prompt }],
      systemPrompt,
      model,
      temperature,
      maxTokens,
    });
  }
}

export const defaultLLMRouter = new LLMRouter();
