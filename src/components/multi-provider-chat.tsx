// components/ui/multi-provider-chat.tsx
"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { MessageCircle, Loader2, ChevronDown, ChevronRight} from "lucide-react"
import { cn } from "@/lib/utils"
import { AI_PROVIDERS } from "@/lib/ai-providers"
import { db } from "@/lib/database"
import { UnifiedChatInput } from "./unified-chat-input"
import type { AIProvider, ChatState, Project, Message } from "@/lib/types"
import { SMALL_MODEL_ID } from "@/lib/model-mapping"

interface MultiProviderChatProps {
  currentChatId?: string
  currentProjectId?: string
  availableProviders: AIProvider[]
}

export const MultiProviderChat = forwardRef<
  { handleApiKeySaved: (provider: AIProvider) => void },
  MultiProviderChatProps
>(({ currentChatId, currentProjectId, availableProviders }, ref) => {
  const [chatState, setChatState] = useState<ChatState>({
    activeProviders: availableProviders,
    selectedModels: Object.fromEntries(
      Object.entries(AI_PROVIDERS).map(([key, config]) => [key, config.defaultModel]),
    ) as Record<AIProvider, string>,
    isEnabled: Object.fromEntries(
      Object.keys(AI_PROVIDERS).map((key) => [key, availableProviders.includes(key as AIProvider)]),
    ) as Record<AIProvider, boolean>,
    singleProviderMode: null,
  })

  // Turn on toggles for providers with API keys on initial render and when keys change
  useEffect(() => {
    setChatState((prev) => ({
      ...prev,
      activeProviders: availableProviders,
      isEnabled: Object.fromEntries(
        Object.keys(AI_PROVIDERS).map((key) => [key, availableProviders.includes(key as AIProvider)]),
      ) as Record<AIProvider, boolean>,
      // If currently in single provider mode that is no longer available, reset to multi
      singleProviderMode: prev.singleProviderMode && availableProviders.includes(prev.singleProviderMode)
        ? prev.singleProviderMode
        : null,
    }))
  }, [availableProviders])

  const [collapsedChats, setCollapsedChats] = useState<Record<AIProvider, boolean>>(() => {
    const initialState: Record<AIProvider, boolean> = {
      openai: false,
      claude: false,
      gemini: false,
      grok: false,
      deepseek: false,
      perplexity: false,
    }

    return initialState
  })

  const [customModels, setCustomModels] = useState<Record<AIProvider, string[]>>({
    openai: [],
    claude: [],
    gemini: [],
    grok: [],
    deepseek: [],
    perplexity: [],
  })

  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<Record<AIProvider, Message[]>>({
    openai: [],
    claude: [],
    gemini: [],
    grok: [],
    deepseek: [],
    perplexity: [],
  })
  const [streamingStates, setStreamingStates] = useState<Record<AIProvider, boolean>>({
    openai: false,
    claude: false,
    gemini: false,
    grok: false,
    deepseek: false,
    perplexity: false,
  })
  const [streamingMessages, setStreamingMessages] = useState<Record<AIProvider, string>>({
    openai: "",
    claude: "",
    gemini: "",
    grok: "",
    deepseek: "",
    perplexity: "",
  })

  const [previouslyExpandedChats, setPreviouslyExpandedChats] = useState<Record<AIProvider, boolean>>({
    openai: false,
    claude: false,
    gemini: false,
    grok: false,
    deepseek: false,
    perplexity: false,
  })

  // Load project data when currentProjectId changes
  useEffect(() => {
    if (currentProjectId) {
      db.getProject(currentProjectId).then(setCurrentProject)
    } else {
      setCurrentProject(null)
    }
  }, [currentProjectId])

  // Load messages when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      db.getMessages(currentChatId).then((msgs) => {
        const messagesByProvider: Record<AIProvider, Message[]> = {
          openai: [],
          claude: [],
          gemini: [],
          grok: [],
          deepseek: [],
          perplexity: [],
        }

        msgs.forEach((msg) => {
          // Backward-compat: if user message has no provider, show in all columns; otherwise only in its provider
          if (msg.role === "user") {
            if (msg.provider) {
              messagesByProvider[msg.provider]?.push(msg)
            } else {
              ;(Object.keys(messagesByProvider) as AIProvider[]).forEach((p) => {
                messagesByProvider[p].push(msg)
              })
            }
          } else if (msg.provider && messagesByProvider[msg.provider]) {
            messagesByProvider[msg.provider].push(msg)
          }
        })

        setMessages(messagesByProvider)
      })
    } else {
      setMessages({
        openai: [],
        claude: [],
        gemini: [],
        grok: [],
        deepseek: [],
        perplexity: [],
      })
    }
  }, [currentChatId])

  const handleToggleProvider = (provider: AIProvider) => {
    if (!availableProviders.includes(provider)) return

    setChatState((prev) => {
      const newEnabled = !prev.isEnabled[provider]

      return {
        ...prev,
        isEnabled: {
          ...prev.isEnabled,
          [provider]: newEnabled,
        },
        singleProviderMode: prev.singleProviderMode === provider ? null : prev.singleProviderMode,
      }
    })
  }

  const handleModelChange = (provider: AIProvider, model: string) => {
    setChatState((prev) => ({
      ...prev,
      selectedModels: {
        ...prev.selectedModels,
        [provider]: model,
      },
    }))
  }

  const handleAddCustomModel = (provider: AIProvider, modelName: string) => {
    const trimmedName = modelName.trim()
    if (!trimmedName) return

    setCustomModels((prev) => ({
      ...prev,
      [provider]: [...prev[provider], trimmedName],
    }))

    // Set as selected model
    handleModelChange(provider, trimmedName)
  }

  const handleSingleProviderMode = (provider: AIProvider) => {
    if (!chatState.singleProviderMode) {
      setPreviouslyExpandedChats({ ...collapsedChats })
    }

    setChatState((prev) => ({
      ...prev,
      singleProviderMode: prev.singleProviderMode === provider ? null : provider,
      isEnabled: Object.fromEntries(
        Object.keys(AI_PROVIDERS).map((key) => [
          key,
          key === provider ? true : prev.singleProviderMode === provider ? prev.isEnabled[key as AIProvider] : false,
        ]),
      ) as Record<AIProvider, boolean>,
    }))

    setCollapsedChats(
      (prev) =>
        Object.fromEntries(Object.keys(AI_PROVIDERS).map((key) => [key, key === provider ? false : true])) as Record<
          AIProvider,
          boolean
        >,
    )
  }

  const handleBackToMultiAI = () => {
    // Restore previously expanded chats
    setCollapsedChats({ ...previouslyExpandedChats })

    // Reset to multi-provider mode
    setChatState((prev) => ({
      ...prev,
      singleProviderMode: null,
      isEnabled: Object.fromEntries(
        Object.keys(AI_PROVIDERS).map((key) => [key, availableProviders.includes(key as AIProvider)]),
      ) as Record<AIProvider, boolean>,
    }))
  }

  const handleToggleCollapse = (provider: AIProvider) => {
    setCollapsedChats((prev) => {
      return {
        ...prev,
        [provider]: !prev[provider],
      }
    })
  }

  const handleApiKeySaved = (provider: AIProvider) => {
    // Auto-expand the chat
    setCollapsedChats((prev) => ({
      ...prev,
      [provider]: false,
    }))

    // Auto-enable the provider toggle
    setChatState((prev) => ({
      ...prev,
      isEnabled: {
        ...prev.isEnabled,
        [provider]: true,
      },
    }))
  }

  useImperativeHandle(ref, () => ({
    handleApiKeySaved,
  }))

  const getVisibleProviders = () => {
    if (chatState.singleProviderMode) {
      return [chatState.singleProviderMode]
    }
    return Object.keys(AI_PROVIDERS) as AIProvider[]
  }

  const visibleProviders = getVisibleProviders()

  const handleSendMessage = async (messageContent: string) => {
    if (!currentChatId) return

    // Determine target providers: single-provider mode or all enabled
    const enabledProviders = (() => {
      if (chatState.singleProviderMode) return [chatState.singleProviderMode]
      return Object.entries(chatState.isEnabled)
        .filter(([_, enabled]) => enabled)
        .map(([provider]) => provider as AIProvider)
    })()

    // Store user message separately for each targeted provider
    for (const provider of enabledProviders) {
      await db.addMessage(currentChatId, messageContent, "user", provider)
    }

    // Send to all enabled providers
    for (const provider of enabledProviders) {
      sendToProvider(provider, messageContent)
    }

    // Refresh messages
    loadMessages()

    // Try to generate a chat title if it's the first message and title looks default
    const chat = await db.getChat(currentChatId)
    if (chat && /new chat/i.test(chat.title)) {
      generateTitleFromFirstMessage(messageContent)
    }
  }

  const sendToProvider = async (provider: AIProvider, messageContent: string) => {
    if (!currentChatId) return

    setStreamingStates((prev) => ({ ...prev, [provider]: true }))
    setStreamingMessages((prev) => ({ ...prev, [provider]: "" }))

    try {
      // Resolve api key for this provider
      const apiKeyRecord = await db.getApiKey(provider)
      const apiKey = apiKeyRecord?.key
      if (!apiKey) {
        await db.addMessage(currentChatId, `Error: No API key configured for ${provider}`, "assistant", provider)
        return
      }

      // Build provider-specific message history: user messages + assistant messages from this provider only
      const history = await db.getMessages(currentChatId)
      const providerHistory = history
        .filter((m) =>
          (m.role === "user" && (m.provider === provider || m.provider === undefined)) ||
          (m.role === "assistant" && m.provider === provider),
        )
        .map((m) => ({ role: m.role, content: m.content }))

      // Do not append again; it is already stored and included by getMessages ordering

      const systemContext = currentProject?.systemContext || ""
      const model = chatState.selectedModels[provider]

      const response = await fetch(`/api/chat/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: providerHistory,
          apiKey,
          systemContext: currentProjectId ? systemContext : "",
          model,
        }),
      })

      if (!response.ok) {
        throw new Error(`${provider} API error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      let accumulatedMessage = ""
      const decoder = new TextDecoder()

      // AI SDK v5 data stream protocol over SSE: lines like "data: {json}"
      let buffer = ""
      let errorText: string | null = null
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n") // SSE frames separated by blank line
        // Keep last partial in buffer
        buffer = parts.pop() || ""

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith("data:")) continue
          const json = line.slice(5).trim()
          if (json === "[DONE]") continue
          try {
            const data = JSON.parse(json)
            if (data?.type === "text-delta" && typeof data.delta === "string") {
              accumulatedMessage += data.delta
              setStreamingMessages((prev) => ({ ...prev, [provider]: accumulatedMessage }))
            } else if (data?.type === "error" && typeof data.errorText === "string") {
              errorText = data.errorText
            }
          } catch {
            // ignore
          }
        }
      }

      // Save final message to database
      if (errorText) {
        await db.addMessage(
          currentChatId,
          `Error from ${provider}: ${errorText}`,
          "assistant",
          provider,
        )
      } else if (accumulatedMessage) {
        await db.addMessage(currentChatId, accumulatedMessage, "assistant", provider)
      }
    } catch (error) {
      console.error(`Error streaming from ${provider}:`, error)
      // Add error message
      await db.addMessage(currentChatId, `Error: Failed to get response from ${provider}`, "assistant", provider)
    } finally {
      setStreamingStates((prev) => ({ ...prev, [provider]: false }))
      setStreamingMessages((prev) => ({ ...prev, [provider]: "" }))
      loadMessages()
    }
  }

  // Generate chat title using a small model from any available provider API key
  const generateTitleFromFirstMessage = async (firstMessage: string) => {
    try {
      // Determine which provider API key is available in priority order
      const priority: AIProvider[] = ["openai", "gemini", "claude", "perplexity", "deepseek", "grok"]
      let chosenProvider: AIProvider | null = null
      let apiKey: string | null = null
      for (const p of priority) {
        const key = await db.getApiKey(p)
        if (key?.key) {
          chosenProvider = p
          apiKey = key.key
          break
        }
      }
      if (!chosenProvider || !apiKey) return

      const systemPrompt =
        "You are a helpful assistant that writes concise chat titles (3-6 words). Do not use quotes or punctuation. Return only the title."

      const response = await fetch(`/api/chat/${chosenProvider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: firstMessage },
          ],
          apiKey,
          model: SMALL_MODEL_ID[chosenProvider],
        }),
      })
      if (!response.ok) return

      const reader = response.body?.getReader()
      if (!reader) return

      let title = ""
      const decoder = new TextDecoder()
      let buffer = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n")
        buffer = parts.pop() || ""
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith("data:")) continue
          const json = line.slice(5).trim()
          if (json === "[DONE]") continue
          try {
            const data = JSON.parse(json)
            if (data?.type === "text-delta" && typeof data.delta === "string") {
              title += data.delta
            }
          } catch {}
        }
      }
      title = (title || "").trim()
      if (title && currentChatId) {
        await db.updateChat(currentChatId, { title })
      }
    } catch (e) {
      // Best-effort; ignore errors
    }
  }

  const loadMessages = async () => {
    if (currentChatId) {
      const msgs = await db.getMessages(currentChatId)
      const messagesByProvider: Record<AIProvider, Message[]> = {
        openai: [],
        claude: [],
        gemini: [],
        grok: [],
        deepseek: [],
        perplexity: [],
      }

      msgs.forEach((msg) => {
        if (msg.role === "user") {
          if (msg.provider) {
            messagesByProvider[msg.provider]?.push(msg)
          } else {
            ;(Object.keys(messagesByProvider) as AIProvider[]).forEach((p) => {
              messagesByProvider[p].push(msg)
            })
          }
        } else if (msg.provider && messagesByProvider[msg.provider]) {
          messagesByProvider[msg.provider].push(msg)
        }
      })

      setMessages(messagesByProvider)
    }
  }

  const getEnabledProviders = () => {
    return Object.entries(chatState.isEnabled)
      .filter(([_, enabled]) => enabled)
      .map(([provider]) => provider as AIProvider)
  }

  const isAnyProviderStreaming = Object.values(streamingStates).some(Boolean)

  return (
    <div className="flex h-full flex-col bg-gray-900">
      <div className="border-b border-gray-800 bg-gray-900 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-white">
              {chatState.singleProviderMode
                ? `Chatting with ${AI_PROVIDERS[chatState.singleProviderMode].name}`
                : "Multi-AI Chat"}
            </h1>
            <p className="text-sm text-gray-400">{currentProject ? currentProject.name : "No project selected"}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="flex h-full">
          {(Object.keys(AI_PROVIDERS) as AIProvider[]).map((providerId) => {
            const provider = AI_PROVIDERS[providerId]
            const isAvailable = availableProviders.includes(providerId)
            const isEnabled = chatState.isEnabled[providerId]
            const isCollapsed = collapsedChats[providerId]
            const providerMessages = messages[providerId] || []
            const isStreaming = streamingStates[providerId]
            const streamingMessage = streamingMessages[providerId]
            const allModels = [...provider.models, ...customModels[providerId]]

            return (
              <div
                key={providerId}
                className={cn(
                  "flex flex-col min-h-0 border-r border-gray-800 bg-gray-900 last:border-r-0 transition-all duration-300",
                  isCollapsed ? "w-12 min-w-12" : "flex-1 min-w-0",
                )}
              >
                {isCollapsed ? (
                  <div
                    className="flex-1 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => handleToggleCollapse(providerId)}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold mb-2",
                        provider.color,
                      )}
                    >
                      {provider.icon}
                    </div>
                    <div className="transform -rotate-90 whitespace-nowrap text-xs text-gray-400 font-medium">
                      {provider.name}
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 mt-2" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 p-3 border-b border-gray-800">
                      <div
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold",
                          provider.color,
                        )}
                      >
                        {provider.icon}
                      </div>
                      <span className="text-sm font-medium text-white flex-1 min-w-0 truncate">{provider.name}</span>
                      <Switch
                        checked={isEnabled && isAvailable}
                        onCheckedChange={() => handleToggleProvider(providerId)}
                        disabled={!isAvailable}
                        className="scale-75"
                      />
                      <button
                        onClick={() => handleToggleCollapse(providerId)}
                        className="text-gray-400 hover:text-white transition-colors"
                        aria-label="Collapse panel"
                        title="Collapse"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="px-3 py-2 border-b border-gray-800">
                      <div className="space-y-2">
                        <Select
                          value={chatState.selectedModels[providerId]}
                          onValueChange={(value) => handleModelChange(providerId, value)}
                          disabled={!isEnabled}
                        >
                          <SelectTrigger className="h-7 text-xs bg-gray-800 border-gray-700 text-gray-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allModels.map((model) => (
                              <SelectItem key={model} value={model} className="text-xs">
                                {model}
                              </SelectItem>
                            ))}
                            <div className="border-t border-gray-700 mt-1 pt-1">
                              <div className="px-2 py-1">
                                <Input
                                  placeholder="Add custom model..."
                                  className="h-6 text-xs bg-gray-700 border-gray-600 text-gray-200"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const target = e.target as HTMLInputElement
                                      handleAddCustomModel(providerId, target.value)
                                      target.value = ""
                                    }
                                  }}
                                />
                                <p className="text-xs text-gray-500 mt-1">Press Enter to add</p>
                              </div>
                            </div>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="px-3 py-2 border-b border-gray-800">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (chatState.singleProviderMode === providerId) {
                            handleBackToMultiAI()
                          } else {
                            handleSingleProviderMode(providerId)
                          }
                        }}
                        disabled={!isAvailable}
                        className={cn(
                          "w-full h-7 text-xs gap-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800",
                          chatState.singleProviderMode === providerId && "bg-blue-600 border-blue-600 text-white",
                          !isAvailable && "opacity-50 cursor-not-allowed",
                        )}
                      >
                        <MessageCircle className="h-3 w-3" />
                        {chatState.singleProviderMode === providerId
                          ? "Back to Multi-AI"
                          : `Chat with ${provider.name} Only`}
                      </Button>
                      {!isAvailable && (
                        <p className="text-xs text-gray-500 mt-1 text-center">Add API key in settings to enable</p>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                      <ScrollArea className="flex-1 h-full">
                        {providerMessages.length === 0 && !isStreaming ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                            <MessageCircle className="h-12 w-12 mb-3 opacity-30" />
                            <p className="text-sm">No messages yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3 p-3">
                            {providerMessages.map((message) => (
                              <div
                                key={message.id}
                                className={cn(
                                  "rounded-lg p-3 max-w-[85%] text-sm",
                                  message.role === "user"
                                    ? "bg-blue-600 text-white ml-auto"
                                    : "bg-gray-800 text-gray-200",
                                )}
                              >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              </div>
                            ))}

                            {isStreaming && (
                              <div className="rounded-lg p-3 max-w-[85%] bg-gray-800 text-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <span className="text-xs text-gray-400">Thinking...</span>
                                </div>
                                {streamingMessage && <p className="text-sm whitespace-pre-wrap">{streamingMessage}</p>}
                              </div>
                            )}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <UnifiedChatInput
        onSendMessage={handleSendMessage}
        isLoading={isAnyProviderStreaming}
        enabledProviders={getEnabledProviders()}
      />
    </div>
  )
})

MultiProviderChat.displayName = "MultiProviderChat"
