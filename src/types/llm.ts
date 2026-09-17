/**
 * OpenRouter LLM Router types and response schema.
 */

export interface OpenRouterUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type OpenRouterMessage = ChatMessage;

export interface OpenRouterChoice {
  message: OpenRouterMessage;
  finish_reason?: string;
  index?: number;
}

export interface OpenRouterResponseSchema {
  id?: string;
  model?: string;
  choices?: OpenRouterChoice[];
  usage?: OpenRouterUsage;
  created?: number;
  object?: string;
  error?: { message?: string; code?: number | string };
}

export interface ChatResponse {
  content: string;
  model: string;
  id?: string;
  usage?: OpenRouterUsage;
  finishReason?: string;
  rawJson?: OpenRouterResponseSchema;
  latencyMs?: number;
}

export interface ChatRequestParams {
  messages: OpenRouterMessage[];
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  max_tokens?: number;
}
