export type ProviderId = "openai" | "claude" | "gemini" | "grok" | "deepseek" | "perplexity"

// Default small/fast models per provider for inexpensive tasks like chat title generation.
export const SMALL_MODEL_ID: Record<ProviderId, string> = {
	openai: "gpt-5.6-luna",
	claude: "claude-haiku-4-5-20251001",
	gemini: "gemini-3.1-flash-lite",
	grok: "grok-4.6",
	deepseek: "deepseek-v4-flash",
	perplexity: "sonar",
} 
