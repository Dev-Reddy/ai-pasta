export type ProviderId = "openai" | "claude" | "gemini" | "grok" | "deepseek" | "perplexity"

// Mapping from human-friendly labels used in the UI to provider-specific model IDs.
export const LABEL_TO_MODEL_ID: Record<ProviderId, Record<string, string>> = {
	openai: {
		"GPT-4 Turbo": "gpt-4o",
		"GPT-4": "gpt-4",
		"GPT-3.5 Turbo": "gpt-3.5-turbo",
	},
	claude: {
		"Claude 3 Opus": "claude-3-opus-latest",
		"Claude 3 Sonnet": "claude-3-7-sonnet-latest",
		"Claude 3 Haiku": "claude-3-haiku-latest",
	},
	gemini: {
		"Gemini Pro": "gemini-1.5-pro-latest",
		"Gemini Pro Vision": "gemini-1.5-flash-latest",
		"Gemini Ultra": "gemini-1.5-pro-latest",
	},
	grok: {
		"Grok-1": "grok-2-latest",
		"Grok-1.5": "grok-2-latest",
	},
	deepseek: {
		"DeepSeek Coder": "deepseek-coder",
		"DeepSeek Chat": "deepseek-chat",
	},
	perplexity: {
		"Perplexity Online": "sonar",
		"Perplexity Offline": "sonar-small-chat",
	},
}

// Default small/fast models per provider for inexpensive tasks like chat title generation.
export const SMALL_MODEL_ID: Record<ProviderId, string> = {
	openai: "gpt-4o-mini",
	claude: "claude-3-haiku-latest",
	gemini: "gemini-1.5-flash-latest",
	grok: "grok-2-latest",
	deepseek: "deepseek-chat",
	perplexity: "sonar-small-chat",
}

export function resolveModelId(provider: ProviderId, modelLabelOrId?: string): string | undefined {
	if (!modelLabelOrId) return undefined
	const map = LABEL_TO_MODEL_ID[provider]
	return map[modelLabelOrId] || modelLabelOrId
} 