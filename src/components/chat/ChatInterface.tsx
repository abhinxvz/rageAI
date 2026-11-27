"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Loader2, PanelRightOpen, RefreshCw, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"
import MarkdownRenderer from "./markdown-renderer"
import { useParams, useRouter } from "next/navigation"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAPIKeys } from "@/hooks/use-api-keys"
import { KeysManager } from "@/components/keys-manager"
import {
    AVAILABLE_MODELS,
    getApiKeyForProvider,
    getDefaultModelForKeys,
    getFallbackModelForKeys,
    getModelsForKeys,
    getProviderForModel,
} from "@/lib/models"
import PromptSuggestions from "./prompt-suggestions"
import { Composer } from "./composer"
import { ArtifactDrawer } from "./artifact-drawer"
import { twMerge } from "tailwind-merge"

type ToolTrace = {
    tool: string
    status: "running" | "done"
    durationMs?: number
}

type VersusComparison = {
    modelId: string
    modelName: string
    content: string
    isStreaming: boolean
    toolTraces: ToolTrace[]
}

type Message = {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    toolTraces?: ToolTrace[]
    failover?: { from: string; to: string }
    versus?: VersusComparison
}

function getModelDisplayName(modelId: string): string {
    return AVAILABLE_MODELS.find((m) => m.id === modelId)?.name || modelId
}

export default function ChatInterface({ threadId }: { threadId?: string }) {
    const [model, setModel] = useState("gemini-3.8-flash")
    const [versusMode, setVersusMode] = useState(false)
    const [versusModel, setVersusModel] = useState("nvidia/nemotron-3.5-super-vl-120b-a12b")
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [artifactContent, setArtifactContent] = useState<string | null>(null)
    const { hasKeys, isModalOpen, openModal, closeModal, refreshKeys, keys } = useAPIKeys()

    const router = useRouter()
    const params = useParams()
    const currentThreadId = params?.threadId

    const { data: configData } = useQuery({
        queryKey: ['config'],
        queryFn: () => fetch('/api/config').then(res => res.json()),
        placeholderData: { maxUserMessagesPerChat: 10 }
    })

    const maxUserMessagesPerChat = configData?.maxUserMessagesPerChat || 10

    const userMessageCount = useMemo(() => {
        return messages.filter(msg => msg.role === 'user').length;
    }, [messages]);

    const isMessageLimitReached = userMessageCount >= maxUserMessagesPerChat;

    const { data: messagesData } = useQuery({
        queryKey: ['messages', currentThreadId],
        queryFn: () => currentThreadId ? fetch(`/api/chat/${currentThreadId}`).then(res => res.json()?.then(data => data.messages)) : Promise.resolve([]),
        placeholderData: keepPreviousData,
        enabled: !!currentThreadId
    })

    useEffect(() => {
        if (currentThreadId && messagesData) {
            setMessages(messagesData || [])
        } else if (!currentThreadId) {
            setMessages([])
        }
    }, [currentThreadId, messagesData])

    const viewportRef = useRef<HTMLDivElement>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const queryClient = useQueryClient()

    function scrollToBottom(behavior: ScrollBehavior = "smooth") {
        bottomRef.current?.scrollIntoView({ behavior, block: "end" })
    }

    useEffect(() => {
        if (messages.length === 0) return
        scrollToBottom("smooth")
    }, [messages.length])

    const streamSingleModel = async ({
        targetModel,
        historyMessages,
        activeThreadId,
        ephemeral,
        onEvent,
    }: {
        targetModel: string
        historyMessages: { role: string; content: string; timestamp?: Date }[]
        activeThreadId: string
        ephemeral: boolean
        onEvent: (evt: Record<string, any>) => void
    }) => {
        const provider = getProviderForModel(targetModel)
        if (!provider) throw new Error(`Unknown model: ${targetModel}`)

        const apiKey = getApiKeyForProvider(keys, provider)
        if (!apiKey) throw new Error(`No API key available for ${targetModel}`)

        const fallbackCandidate = !ephemeral ? getFallbackModelForKeys(targetModel, keys) : null
        const fallbackProvider = fallbackCandidate ? getProviderForModel(fallbackCandidate) : null
        const fallbackApiKey = getApiKeyForProvider(keys, fallbackProvider)

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "x-model-api-key": apiKey,
            "x-stream-events": "1",
        }
        if (fallbackApiKey) headers["x-fallback-api-key"] = fallbackApiKey
        if (keys.webhooks?.discord) headers["x-discord-webhook"] = keys.webhooks.discord
        if (keys.webhooks?.slack) headers["x-slack-webhook"] = keys.webhooks.slack

        const resumeProfile = keys.resume?.text?.trim()
            ? `${keys.resume.targetRole ? `Target Role: ${keys.resume.targetRole}\n` : ''}${keys.resume.text.trim()}`
            : undefined

        const response = await fetch("/api/chat", {
            method: "POST",
            headers,
            body: JSON.stringify({
                messages: historyMessages,
                threadId: activeThreadId,
                model: targetModel,
                fallbackModel: fallbackCandidate,
                resumeText: resumeProfile,
                ephemeral,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Server error (${response.status}): ${errorText}`)
        }

        if (!response.body) throw new Error('Response body is null')
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
                const trimmed = line.trim()
                if (!trimmed) continue
                try {
                    onEvent(JSON.parse(trimmed))
                } catch {
                    onEvent({ type: "token", text: trimmed })
                }
            }
        }
    }

    const handleSubmit = async (userMessage: string) => {
        if (!hasKeys) {
            openModal()
            return
        }

        if (isMessageLimitReached || !userMessage.trim()) {
            return
        }

        try {
            const activeThreadId = (currentThreadId as string) || crypto.randomUUID()
            const outgoingHistory = [
                ...messages.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
                { role: "user", content: userMessage, timestamp: new Date() },
            ]

            setIsLoading(true)
            setInput("")

            const respId = crypto.randomUUID()
            const isVersusActive = versusMode && versusModel && versusModel !== model

            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "user",
                    content: userMessage,
                    timestamp: new Date(),
                },
                {
                    id: respId,
                    role: "assistant",
                    content: " ",
                    timestamp: new Date(),
                    toolTraces: [],
                    ...(isVersusActive
                        ? {
                              versus: {
                                  modelId: versusModel,
                                  modelName: getModelDisplayName(versusModel),
                                  content: " ",
                                  isStreaming: true,
                                  toolTraces: [],
                              },
                          }
                        : {}),
                },
            ])

            let finalMessages: Message[] = []

            const updateAssistant = (updater: (msg: Message) => Message) => {
                setMessages((prev) => {
                    const updated = prev.map((m) => (m.id === respId ? updater(m) : m))
                    finalMessages = updated
                    return updated
                })
            }

            const primaryTask = streamSingleModel({
                targetModel: model,
                historyMessages: outgoingHistory,
                activeThreadId,
                ephemeral: false,
                onEvent: (evt) => {
                    if (evt.type === "token") {
                        updateAssistant((m) => ({
                            ...m,
                            content: (m.content === " " ? "" : m.content) + (evt.text || ""),
                        }))
                    } else if (evt.type === "tool_start") {
                        updateAssistant((m) => ({
                            ...m,
                            toolTraces: [...(m.toolTraces || []), { tool: evt.tool, status: "running" }],
                        }))
                    } else if (evt.type === "tool_end") {
                        updateAssistant((m) => {
                            const traces = [...(m.toolTraces || [])]
                            const idx = traces.findLastIndex((t) => t.tool === evt.tool && t.status === "running")
                            if (idx >= 0) {
                                traces[idx] = { ...traces[idx], status: "done", durationMs: evt.durationMs }
                            }
                            return { ...m, toolTraces: traces }
                        })
                    } else if (evt.type === "failover") {
                        updateAssistant((m) => ({
                            ...m,
                            failover: { from: getModelDisplayName(evt.from), to: getModelDisplayName(evt.to) },
                        }))
                    } else if (evt.type === "error") {
                        updateAssistant((m) => ({
                            ...m,
                            content: (m.content === " " ? "" : m.content) + `\n\n${evt.message}`,
                        }))
                    }
                },
            })

            const versusTask = isVersusActive
                ? streamSingleModel({
                      targetModel: versusModel,
                      historyMessages: outgoingHistory,
                      activeThreadId,
                      ephemeral: true,
                      onEvent: (evt) => {
                          if (evt.type === "token") {
                              updateAssistant((m) =>
                                  m.versus
                                      ? {
                                            ...m,
                                            versus: {
                                                ...m.versus,
                                                content:
                                                    (m.versus.content === " " ? "" : m.versus.content) +
                                                    (evt.text || ""),
                                            },
                                        }
                                      : m
                              )
                          } else if (evt.type === "tool_start") {
                              updateAssistant((m) =>
                                  m.versus
                                      ? {
                                            ...m,
                                            versus: {
                                                ...m.versus,
                                                toolTraces: [
                                                    ...m.versus.toolTraces,
                                                    { tool: evt.tool, status: "running" },
                                                ],
                                            },
                                        }
                                      : m
                              )
                          } else if (evt.type === "tool_end") {
                              updateAssistant((m) => {
                                  if (!m.versus) return m
                                  const traces = [...m.versus.toolTraces]
                                  const idx = traces.findLastIndex(
                                      (t) => t.tool === evt.tool && t.status === "running"
                                  )
                                  if (idx >= 0) {
                                      traces[idx] = { ...traces[idx], status: "done", durationMs: evt.durationMs }
                                  }
                                  return { ...m, versus: { ...m.versus, toolTraces: traces } }
                              })
                          } else if (evt.type === "error") {
                              updateAssistant((m) =>
                                  m.versus
                                      ? {
                                            ...m,
                                            versus: {
                                                ...m.versus,
                                                content:
                                                    (m.versus.content === " " ? "" : m.versus.content) +
                                                    `\n\n${evt.message}`,
                                            },
                                        }
                                      : m
                              )
                          }
                      },
                  }).finally(() => {
                      updateAssistant((m) =>
                          m.versus ? { ...m, versus: { ...m.versus, isStreaming: false } } : m
                      )
                  })
                : Promise.resolve()

            await Promise.all([primaryTask, versusTask])
            scrollToBottom("smooth")

            if (!currentThreadId) {
                queryClient.setQueryData(['messages', activeThreadId], finalMessages)
                router.push(`/chat/${activeThreadId}`)
            }
        } catch (error: any) {
            console.error("API call failed:", error)
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: `Error: ${error.message || 'Failed to send message. Please check your API key and try again.'}`,
                    timestamp: new Date(),
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const currentProvider = getProviderForModel(model)
        if (!getApiKeyForProvider(keys, currentProvider)) {
            setModel(getDefaultModelForKeys(keys))
        }
        const enabledModels = getModelsForKeys(keys).filter((m) => !m.disabled)
        const alternate = enabledModels.find((m) => m.id !== model)
        const versusProvider = getProviderForModel(versusModel)
        if (alternate && (!getApiKeyForProvider(keys, versusProvider) || versusModel === model)) {
            setVersusModel(alternate.id)
        }
    }, [keys, model, versusModel])

    return (
        <div className="relative mx-auto max-w-5xl px-3 sm:px-6 h-[calc(100dvh-3.5rem)] md:h-[100dvh]">
            <div className="flex h-full flex-col">
                <div
                    ref={viewportRef}
                    className={twMerge(
                        "flex-1 min-h-0 pr-1 sm:pr-2 -mr-1 sm:-mr-2 py-4 sm:py-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
                        messages?.length > 0 && "overflow-y-auto"
                    )}
                    aria-label="Messages"
                >
                    {messages?.length === 0 ? (
                        <div className="min-h-full flex items-center py-4">
                            <PromptSuggestions onSuggestionClick={handleSubmit} />
                        </div>
                    ) : (
                        <div className="mt-2 space-y-4 sm:space-y-6">
                            {messages.map((m) => (
                                <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                                    {m.role === "user" ? (
                                        <div className="prose prose-sm prose-neutral rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed bg-gradient-to-r from-[#dc2626] to-[#b91c1c] max-w-[88%] sm:max-w-[70%] text-white prose-a:text-white shadow-lg shadow-red-950/35">
                                            <MarkdownRenderer content={m.content} />
                                        </div>
                                    ) : (
                                        <div className={cn("w-full space-y-2.5", m.versus ? "max-w-full" : "max-w-[95%] sm:max-w-[85%]")}>
                                            {/* Failover notice */}
                                            {m.failover && (
                                                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-200">
                                                    <RefreshCw className="h-3 w-3" />
                                                    <span>
                                                        Auto-switched from {m.failover.from} to {m.failover.to}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Live Tool-Trace Pills */}
                                            {m.toolTraces && m.toolTraces.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    {m.toolTraces.map((trace, idx) => (
                                                        <span
                                                            key={`${trace.tool}-${idx}`}
                                                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#141010] px-2.5 py-0.5 text-[11px] text-zinc-300"
                                                        >
                                                            {trace.status === "running" ? (
                                                                <Loader2 className="h-3 w-3 animate-spin text-red-400" />
                                                            ) : (
                                                                <Check className="h-3 w-3 text-red-400" />
                                                            )}
                                                            <Wrench className="h-2.5 w-2.5 text-zinc-500" />
                                                            <span className="font-mono text-[10px]">{trace.tool}</span>
                                                            {trace.durationMs !== undefined && (
                                                                <span className="text-[10px] text-zinc-500">{trace.durationMs}ms</span>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Primary or Side-by-Side Versus Output */}
                                            <div className={cn("grid gap-3", m.versus ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
                                                <div className="group relative prose prose-sm prose-neutral rounded-2xl px-4 py-3 text-sm leading-relaxed bg-[#161111] border border-white/[0.08] text-zinc-200 prose-invert prose-a:text-red-400">
                                                    {m.versus && (
                                                        <div className="mb-2 pb-2 border-b border-white/[0.06] flex items-center justify-between text-[11px] font-medium text-red-300">
                                                            <span>{getModelDisplayName(model)}</span>
                                                            <span className="text-zinc-500">Primary</span>
                                                        </div>
                                                    )}
                                                    <MarkdownRenderer content={m.content} />
                                                    {m.content.trim().length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-white/[0.05] flex justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => setArtifactContent(m.content)}
                                                                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-300 transition-colors cursor-pointer"
                                                            >
                                                                <PanelRightOpen className="h-3.5 w-3.5" />
                                                                <span>Open Preview</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {m.versus && (
                                                    <div className="group relative prose prose-sm prose-neutral rounded-2xl px-4 py-3 text-sm leading-relaxed bg-[#141010] border border-red-500/20 text-zinc-200 prose-invert prose-a:text-red-400">
                                                        <div className="mb-2 pb-2 border-b border-white/[0.06] flex items-center justify-between text-[11px] font-medium text-zinc-200">
                                                            <span>{m.versus.modelName}</span>
                                                            <span className="text-zinc-500">
                                                                {m.versus.isStreaming ? "Streaming..." : "Comparison"}
                                                            </span>
                                                        </div>
                                                        <MarkdownRenderer content={m.versus.content} />
                                                        {m.versus.content.trim().length > 0 && (
                                                            <div className="mt-2 pt-2 border-t border-white/[0.05] flex justify-end">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setArtifactContent(m.versus?.content || null)}
                                                                    className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-red-300 transition-colors cursor-pointer"
                                                                >
                                                                    <PanelRightOpen className="h-3.5 w-3.5" />
                                                                    <span>Open Preview</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-4 justify-start">
                                    <div className="bg-[#161111] border border-white/[0.08] rounded-2xl px-4 py-3 max-w-xs">
                                        <div className="flex gap-1">
                                            <div
                                                className="w-2 h-2 bg-red-400 rounded-full animate-bounce"
                                                style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
                                            />
                                            <div
                                                className="w-2 h-2 bg-red-400 rounded-full animate-bounce"
                                                style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
                                            />
                                            <div
                                                className="w-2 h-2 bg-red-400 rounded-full animate-bounce"
                                                style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isMessageLimitReached && (
                                <div className="flex gap-4 justify-center">
                                    <div className="bg-[#161111] border border-red-500/30 rounded-2xl px-6 py-4 max-w-2xl">
                                        <div className="flex items-center gap-3 text-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                                                    <span className="text-red-400 text-sm font-semibold">{maxUserMessagesPerChat}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-zinc-200 mb-1">
                                                    Message Limit Reached
                                                </h3>
                                                <p className="text-sm text-zinc-400">
                                                    You&apos;ve reached the maximum of {maxUserMessagesPerChat} messages in this chat.
                                                    <br />
                                                    <span className="font-medium">Please start a new conversation to continue.</span>
                                                </p>
                                                <div className="mt-3">
                                                    <Button
                                                        onClick={() => router.push('/chat')}
                                                        className="bg-[#dc2626] hover:bg-[#b91c1c] text-white px-4 py-2 rounded-lg text-sm font-medium"
                                                    >
                                                        Start New Chat
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div ref={bottomRef} className="h-1" />
                </div>

                <KeysManager
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSave={() => {
                        refreshKeys()
                        setModel(prevModel => prevModel)
                    }}
                />

                <Composer
                    input={input}
                    inputRef={inputRef}
                    isLoading={isLoading}
                    isMessageLimitReached={isMessageLimitReached}
                    setInput={setInput}
                    handleSubmit={handleSubmit}
                    maxUserMessagesPerChat={maxUserMessagesPerChat}
                    model={model}
                    setModel={setModel}
                    versusMode={versusMode}
                    setVersusMode={setVersusMode}
                    versusModel={versusModel}
                    setVersusModel={setVersusModel}
                    keys={keys}
                    openModal={openModal}
                    userMessageCount={userMessageCount}
                />
            </div>

            <ArtifactDrawer
                content={artifactContent}
                onClose={() => setArtifactContent(null)}
            />
        </div>
    )
}
