import { POST as dynamicPost } from "../[provider]/route"

export const maxDuration = 60

export async function POST(req: Request) {
	// Delegate to the dynamic route with provider fixed to openai
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return dynamicPost(req, { params: { provider: "openai" } } as any)
}
