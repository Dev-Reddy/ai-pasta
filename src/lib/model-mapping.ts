export type ProviderId = "openai" | "claude" | "gemini" | "grok" | "deepseek" | "perplexity"

// Default small/fast models per provider for inexpensive tasks like chat title generation.
export const SMALL_MODEL_ID: Record<ProviderId, string> = {
	openai: "gpt-5-nano",
	claude: "claude-3-5-haiku-20241022",
	gemini: "gemini-2.5-flash-lite",
	grok: "grok-3-mini",
	deepseek: "deepseek-chat",
	perplexity: "sonar",
} 