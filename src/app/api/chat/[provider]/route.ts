// Route handler for dynamic provider chat API
import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createXai } from "@ai-sdk/xai"

export const maxDuration = 60

function buildModel(provider: string, modelId: string, apiKey: string) {
	switch (provider) {
		case "openai": {
			const openai = createOpenAI({ apiKey })
			return openai(modelId)
		}
		case "claude": {
			const anthropic = createAnthropic({ apiKey })
			return anthropic(modelId)
		}
		case "gemini": {
			const google = createGoogleGenerativeAI({ apiKey })
			return google(modelId)
		}
		case "grok": {
			const xai = createXai({ apiKey })
			return xai(modelId)
		}
		case "deepseek": {
			const openai = createOpenAI({ apiKey, baseURL: "https://api.deepseek.com" })
			return openai(modelId)
		}
		case "perplexity": {
			const openai = createOpenAI({ apiKey, baseURL: "https://api.perplexity.ai" })
			return openai(modelId)
		}
		default:
			throw new Error("Unsupported provider")
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: Request, context: any) {
	try {
		// Next.js dynamic API params are async; await before use
		const { provider } = await context.params
		const { messages, systemContext, apiKey, model } = await req.json()

		if (!provider || !["openai", "claude", "gemini", "grok", "deepseek", "perplexity"].includes(provider)) {
			return new Response("Unsupported provider", { status: 400 })
		}

		if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
			return new Response("API key not provided", { status: 400 })
		}

		if (!messages || !Array.isArray(messages)) {
			return new Response("Messages array is required", { status: 400 })
		}

		// Use the model as provided (official IDs only). If missing, choose a sensible provider-specific default.
		const defaultModelByProvider: Record<string, string> = {
			openai: "gpt-5",
			claude: "claude-sonnet-4-20250514",
			gemini: "gemini-2.5-pro",
			grok: "grok-4-latest",
			deepseek: "deepseek-chat",
			perplexity: "sonar-pro",
		}
		const modelId: string = (typeof model === "string" && model.trim()) || defaultModelByProvider[provider]

		const formattedMessages = [] as Array<{ role: "system" | "user" | "assistant"; content: string }>
		if (systemContext && typeof systemContext === "string" && systemContext.trim() !== "") {
			formattedMessages.push({ role: "system", content: systemContext })
		}
		formattedMessages.push(...(messages as Array<{ role: "system" | "user" | "assistant"; content: string }>))

		const result = await streamText({
			model: buildModel(provider, modelId, apiKey),
			messages: formattedMessages,
			temperature: 0.7,
		})

		return result.toUIMessageStreamResponse()
	} catch (error) {
		console.error("Chat API error:", error)
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		return new Response(
			JSON.stringify({ error: "Internal server error", details: errorMessage, timestamp: new Date().toISOString() }),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		)
	}
} 