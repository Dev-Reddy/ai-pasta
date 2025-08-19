import type { AIProviderConfig } from "./types"

export const AI_PROVIDERS: Record<string, AIProviderConfig> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    icon: "OP",
    color: "bg-green-500",
    models: ["GPT-4 Turbo", "GPT-4", "GPT-3.5 Turbo"],
    defaultModel: "GPT-4 Turbo",
  },
  claude: {
    id: "claude",
    name: "Claude",
    icon: "CL",
    color: "bg-orange-500",
    models: ["Claude 3 Opus", "Claude 3 Sonnet", "Claude 3 Haiku"],
    defaultModel: "Claude 3 Opus",
  },
  gemini: {
    id: "gemini",
    name: "Gemini",
    icon: "GE",
    color: "bg-blue-500",
    models: ["Gemini Pro", "Gemini Pro Vision", "Gemini Ultra"],
    defaultModel: "Gemini Pro",
  },
  grok: {
    id: "grok",
    name: "Grok",
    icon: "GR",
    color: "bg-gray-500",
    models: ["Grok-1", "Grok-1.5"],
    defaultModel: "Grok-1",
  },
  deepseek: {
    id: "deepseek",
    name: "DeepSeek",
    icon: "DE",
    color: "bg-purple-500",
    models: ["DeepSeek Coder", "DeepSeek Chat"],
    defaultModel: "DeepSeek Coder",
  },
  perplexity: {
    id: "perplexity",
    name: "Perplexity",
    icon: "PE",
    color: "bg-indigo-500",
    models: ["Perplexity Online", "Perplexity Offline"],
    defaultModel: "Perplexity Online",
  },
}
