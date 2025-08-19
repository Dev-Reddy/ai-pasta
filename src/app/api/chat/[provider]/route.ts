// Route handler for dynamic provider chat API
import { streamText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createXai } from "@ai-sdk/xai"
import { resolveModelId, type ProviderId } from "@/lib/model-mapping"

export const maxDuration = 60

function buildModel(provider: ProviderId, modelId: string, apiKey: string) {
	// Some providers are not directly supported and use OpenAI-compatible APIs.
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
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function POST(req: Request, context: any) {
	try {
		const provider = (context?.params?.provider as ProviderId) || "openai"
		const { messages, systemContext, apiKey, modelLabel } = await req.json()

		if (!provider || !["openai", "claude", "gemini", "grok", "deepseek", "perplexity"].includes(provider)) {
			return new Response("Unsupported provider", { status: 400 })
		}

		if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
			return new Response("API key not provided", { status: 400 })
		}

		if (!messages || !Array.isArray(messages)) {
			return new Response("Messages array is required", { status: 400 })
		}

		const modelId = resolveModelId(provider, modelLabel) || resolveModelId(provider, undefined) || ""
		if (!modelId) {
			return new Response("Model not provided", { status: 400 })
		}

		const formattedMessages = [] as Array<{ role: string; content: string }>
		if (systemContext && typeof systemContext === "string" && systemContext.trim() !== "") {
			formattedMessages.push({ role: "system", content: systemContext })
		}
		formattedMessages.push(...messages)

		const result = await streamText({
			model: buildModel(provider, modelId, apiKey),
			messages: formattedMessages as { role: "system" | "user" | "assistant"; content: string }[],
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