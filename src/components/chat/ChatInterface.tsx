"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import MarkdownRenderer from "./markdown-renderer"
import { useParams } from "next/navigation"
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useAPIKeys } from "@/hooks/use-api-keys"
import { KeysManager } from "@/components/keys-manager"
import { getProviderForModel } from "@/lib/models"
import PromptSuggestions from "./prompt-suggestions"
import { Composer } from "./composer"
import { twMerge } from "tailwind-merge"

type Message = {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}


export default function ChatInterface({ threadId }: { threadId?: string }) {
    const [model, setModel] = useState("gemini-2.5-flash")
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
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


    useEffect(() => {
        if (currentThreadId && messagesData && messagesData.length > 0) {
            if (input.trim() === '') {
                setInput('')
            }
        }
    }, [currentThreadId, messagesData, input])

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

    const handleSubmit = async (userMessage: string) => {
        if (!hasKeys) {
            openModal()
            return
        }

        if (isMessageLimitReached) {
            return
        }

        if (!userMessage.trim()) {
            return
        }

        try {
            const threadId = currentThreadId || crypto?.randomUUID() as string;
            setIsLoading(true);
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "user",
                    content: userMessage,
                    timestamp: new Date(),
                }
            ])
            const message = userMessage;
            setInput("");

            const provider = getProviderForModel(model);
            if (!provider) {
                throw new Error(`Unknown model: ${model}`);
            }

            const apiKey = keys[provider]?.key;
            if (!apiKey) {
                throw new Error(`No API key available for ${model}`);
            }

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-model-api-key": apiKey,
                },
                body: JSON.stringify({
                    messages: [...messages, {
                        role: "user",
                        content: message,
                        timestamp: new Date(),
                    }],
                    threadId: threadId,
                    model: model,
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                throw new Error(`Server error (${response.status}): ${errorText}`);
            }

            const respId = crypto.randomUUID();


            setMessages((prev) => [
                ...prev,
                {
                    id: respId,
                    role: "assistant",
                    content: ' ',
                    timestamp: new Date(),
                }
            ])

            if (!response.body) {
                throw new Error('Response body is null');
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';
            let finalMessages: Message[] = [];


            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    scrollToBottom("smooth")
                    console.log("Stream finished.");
                    break;
                }
                const chunk = decoder.decode(value);
                fullResponse += chunk;
                setMessages((prev: any) => {
                    const updated = [
                        ...prev.slice(0, -1),
                        {
                            id: respId,
                            role: "assistant",
                            content: fullResponse,
                            timestamp: new Date(),
                        }
                    ];
                    finalMessages = updated;
                    return updated;
                })
                if (fullResponse?.length % 20 === 0) {
                    scrollToBottom("smooth")
                }
            }

            if (!currentThreadId) {
                queryClient.setQueryData(['messages', threadId], finalMessages);
                router.push(`/chat/${threadId}`)
            }


        } catch (error: any) {
            console.error("API call failed:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: `Error: ${error.message || 'Failed to send message. Please check your API key and try again.'}`,
                    timestamp: new Date(),
                }
            ])
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        if (keys.gemini?.key) {
            setModel("gemini-2.5-flash")
        } else if (keys.openai?.key) {
            setModel("gpt-4o")
        }
    }, [keys.gemini?.key, keys.openai?.key])

    return (
        <div className="relative mx-auto max-w-5xl px-6 min-h-[100dvh]">
            <div
                className="flex min-h-[100dvh] flex-col"
            >
                <div
                    ref={viewportRef}
                    className={twMerge("flex-1 max-h-[80vh] pr-2 -mr-2 py-12 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent", messages?.length > 0 && "overflow-y-auto")}
                    aria-label="Messages"
                >
                    {
                        messages?.length === 0
                            ? <div className="h-screen flex items-center " >
                                <PromptSuggestions onSuggestionClick={handleSubmit} />
                            </div> : (
                                <div className="mt-2 space-y-6">
                                    {messages.map((m) => (
                                        <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                                            <div
                                                className={cn(
                                                    "prose prose-sm prose-neutral rounded-2xl px-4 py-3 text-sm leading-relaxed prose-a:hover:underline",
                                                    m.role === "user"
                                                        ? "bg-[#1072f8] max-w-[70%] text-white prose-a:text-white shadow-lg shadow-[#1072f8]/20"
                                                        : "bg-[#1a1a1a] border border-white/5 max-w-[85%] text-gray-200 prose-invert prose-a:text-[#3b8fff]",
                                                )}
                                            >
                                                <MarkdownRenderer content={m.content} />
                                            </div>
                                        </div>
                                    ))}
                                    {
                                        isLoading && <div className="flex gap-4 justify-start">
                                            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl px-4 py-3 max-w-xs">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1">
                                                        <div className="flex gap-1">
                                                            <div
                                                                className="w-2 h-2 bg-[#3b8fff] rounded-full animate-bounce"
                                                                style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
                                                            />
                                                            <div
                                                                className="w-2 h-2 bg-[#3b8fff] rounded-full animate-bounce"
                                                                style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
                                                            />
                                                            <div
                                                                className="w-2 h-2 bg-[#3b8fff] rounded-full animate-bounce"
                                                                style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
                                                            />
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    }

                                    {isMessageLimitReached && (
                                        <div className="flex gap-4 justify-center">
                                            <div className="bg-[#1a1a1a] border border-[#1072f8]/30 rounded-2xl px-6 py-4 max-w-2xl">
                                                <div className="flex items-center gap-3 text-center">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 bg-[#1072f8]/20 rounded-full flex items-center justify-center">
                                                            <span className="text-[#3b8fff] text-sm font-semibold">{maxUserMessagesPerChat}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-200 mb-1">
                                                            Message Limit Reached
                                                        </h3>
                                                        <p className="text-sm text-gray-400">
                                                            You've reached the maximum of {maxUserMessagesPerChat} messages in this chat.
                                                            <br />
                                                            <span className="font-medium">Please start a new conversation to continue.</span>
                                                        </p>
                                                        <div className="mt-3">
                                                            <Button
                                                                onClick={() => router.push('/chat')}
                                                                className="bg-[#1072f8] hover:bg-[#0052cc] text-white px-4 py-2 rounded-lg text-sm font-medium"
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
                    keys={keys}
                    openModal={openModal}
                    userMessageCount={userMessageCount}
                />
            </div>
        </div >
    )
}



