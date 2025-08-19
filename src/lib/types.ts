export interface ApiKey {
  id: string
  provider: AIProvider
  key: string
  createdAt: Date
}

export interface Project {
  id: string
  name: string
  systemContext: string
  createdAt: Date
  updatedAt: Date
}

export interface Chat {
  id: string
  title: string
  projectId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  chatId: string
  content: string
  role: "user" | "assistant"
  provider?: AIProvider
  createdAt: Date
}

export type AIProvider = "openai" | "claude" | "gemini" | "grok" | "deepseek" | "perplexity"

export interface AIProviderConfig {
  id: AIProvider
  name: string
  icon: string
  color: string
  models: string[]
  defaultModel: string
}

export interface ChatState {
  activeProviders: AIProvider[]
  selectedModels: Record<AIProvider, string>
  isEnabled: Record<AIProvider, boolean>
  singleProviderMode: AIProvider | null
}
