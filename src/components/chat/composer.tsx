"use client"

import { ArrowUp, Briefcase, Columns2, Key, Loader2, Mic, MicOff, Sun } from "lucide-react"
import { Textarea } from "../ui/textarea"
import { ModelSelector } from "./model-selector"
import { PillButton } from "../pill-button"
import { MessageCounter } from "./message-counter"
import { useEffect, useRef, useCallback, useState } from "react"
import { cn } from "@/lib/utils"
import { getModelsForKeys } from "@/lib/models"
import type { APIKeys } from "@/lib/api-keys"

interface SpeechRecognitionResultEvent {
    results: ArrayLike<ArrayLike<{ transcript: string }>>
}

interface BrowserSpeechRecognition {
    lang: string
    interimResults: boolean
    continuous: boolean
    onresult: ((event: SpeechRecognitionResultEvent) => void) | null
    onerror: (() => void) | null
    onend: (() => void) | null
    start: () => void
    stop: () => void
}

interface ComposerProps {
    input: string
    inputRef: React.RefObject<HTMLTextAreaElement | null>
    isMessageLimitReached: boolean
    isLoading?: boolean
    setInput: (value: string) => void
    handleSubmit: (value: string) => void
    maxUserMessagesPerChat: number
    model: string
    setModel: (value: string) => void
    versusMode: boolean
    setVersusMode: (value: boolean) => void
    versusModel: string
    setVersusModel: (value: string) => void
    keys: APIKeys
    openModal: () => void
    userMessageCount: number
}

const MORNING_BRIEFING_PROMPT =
    "Give me my Morning Briefing: check today's Google Calendar events, summarize recent unread Gmail threads, and pull top AI & tech headlines into a structured daily brief."

function buildJobMatchPrompt(targetRole?: string): string {
    const roleLabel = targetRole?.trim() ? `for "${targetRole.trim()}"` : "matching my resume"
    return `Scrape the best live jobs ${roleLabel} using scrape_jobs, rank the top matches against my resume with match scores and apply links, then: (1) save a tailored Job Match & Cover Letter brief to Google Docs if connected, (2) create Gmail outreach drafts for the top roles if connected, (3) schedule a follow-up reminder on Google Calendar if connected, and (4) push the top matched jobs digest to my Discord/Slack webhook if configured.`
}

export function Composer({
    input,
    inputRef,
    isMessageLimitReached,
    isLoading = false,
    setInput,
    handleSubmit,
    maxUserMessagesPerChat,
    model,
    setModel,
    versusMode,
    setVersusMode,
    versusModel,
    setVersusModel,
    keys,
    openModal,
    userMessageCount,
}: ComposerProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
    const [isListening, setIsListening] = useState(false)

    const availableModels = getModelsForKeys(keys).filter((m) => !m.disabled)

    const adjustTextareaHeight = useCallback(() => {
        const textarea = textareaRef.current || inputRef?.current
        if (textarea) {
            textarea.style.height = 'auto'
            const scrollHeight = textarea.scrollHeight
            const maxHeight = 144
            textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`
        }
    }, [inputRef])

    useEffect(() => {
        adjustTextareaHeight()
    }, [input, adjustTextareaHeight])

    useEffect(() => {
        if (inputRef && textareaRef.current) {
            inputRef.current = textareaRef.current
        }
    }, [inputRef])

    useEffect(() => {
        return () => {
            recognitionRef.current?.stop()
        }
    }, [])

    const toggleVoiceInput = () => {
        if (isListening) {
            recognitionRef.current?.stop()
            setIsListening(false)
            return
        }

        const speechCtor =
            (window as unknown as Record<string, new () => BrowserSpeechRecognition>).SpeechRecognition ||
            (window as unknown as Record<string, new () => BrowserSpeechRecognition>).webkitSpeechRecognition

        if (!speechCtor) {
            return
        }

        const recognition = new speechCtor()
        recognition.lang = 'en-US'
        recognition.interimResults = false
        recognition.continuous = false

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0]?.transcript || '')
                .join(' ')
                .trim()
            if (transcript) {
                setInput(input ? `${input.trim()} ${transcript}` : transcript)
            }
        }
        recognition.onerror = () => setIsListening(false)
        recognition.onend = () => setIsListening(false)

        recognitionRef.current = recognition
        setIsListening(true)
        recognition.start()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (!isLoading && !isMessageLimitReached && input.trim()) {
                handleSubmit(input)
            }
        }
    }

    const handleSend = () => {
        if (!isLoading && !isMessageLimitReached && input.trim()) {
            handleSubmit(input)
        }
    }

    const isDisabled = isMessageLimitReached || isLoading

    return (
        <div className="sticky bottom-0 z-10 pt-6 pb-4">
            <div className="relative w-full">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-rose-500/15 to-red-500/20 rounded-3xl blur-xl opacity-50" />

                {/* Main container */}
                <div className="relative w-full rounded-2xl border border-white/10 bg-[#120d0d]/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
                    {/* Versus banner when active */}
                    {versusMode && (
                        <div className="px-5 py-2.5 bg-red-500/[0.08] border-b border-red-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 text-red-200">
                                <Columns2 className="h-3.5 w-3.5 text-red-400" />
                                <span className="font-medium">Side-by-Side Versus Mode</span>
                                <span className="text-zinc-400">Compare</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-400">against:</span>
                                <select
                                    aria-label="Comparison model"
                                    value={versusModel}
                                    onChange={(e) => setVersusModel(e.target.value)}
                                    disabled={isLoading}
                                    className="rounded-lg bg-[#0b0909] border border-white/15 px-2.5 py-1 text-xs text-white focus:outline-none focus:border-red-500/50"
                                >
                                    {availableModels.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Input area */}
                    <div className="flex items-end gap-2.5 p-5">
                        <Textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => {
                                if (!isDisabled) {
                                    setInput(e.target.value)
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                isMessageLimitReached
                                    ? `Message limit reached`
                                    : isLoading
                                        ? "Processing..."
                                        : isListening
                                            ? "Listening... speak your command"
                                            : "Message Rage AI, paste a URL / YouTube link, or ask for a briefing..."
                            }
                            aria-label="Message"
                            disabled={isDisabled}
                            className={cn(
                                "flex-1 min-h-[48px] resize-none border-0 bg-transparent text-white text-[15px] placeholder:text-gray-500 focus-visible:ring-0 disabled:opacity-50 disabled:cursor-not-allowed",
                                "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                            )}
                            style={{
                                height: '48px',
                                maxHeight: '160px',
                                overflowY: input.split('\n').length > 6 ? 'auto' : 'hidden'
                            }}
                        />

                        <button
                            type="button"
                            aria-label={isListening ? "Stop voice input" : "Start voice input"}
                            title={isListening ? "Stop listening" : "Voice command"}
                            onClick={toggleVoiceInput}
                            disabled={isDisabled}
                            className={cn(
                                "flex h-12 w-11 items-center justify-center rounded-xl border transition-all cursor-pointer",
                                isListening
                                    ? "border-red-500 bg-red-500/20 text-red-300 animate-pulse"
                                    : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:border-red-500/35"
                            )}
                        >
                            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </button>

                        <button
                            aria-label="Send message"
                            onClick={handleSend}
                            disabled={isDisabled || !input.trim()}
                            className={cn(
                                "relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
                                !isDisabled && input.trim()
                                    ? "bg-[#dc2626] text-white hover:bg-[#b91c1c] shadow-lg shadow-red-950/50 hover:scale-105 cursor-pointer"
                                    : "bg-white/5 text-zinc-600 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <ArrowUp className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    {/* Controls bar */}
                    <div className="px-5 pb-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
                        <ModelSelector
                            model={model}
                            onChange={setModel}
                            keys={keys}
                            disabled={isLoading}
                        />

                        <PillButton
                            active={versusMode}
                            onClick={() => setVersusMode(!versusMode)}
                            icon={Columns2}
                            label="Versus"
                            disabled={isLoading || availableModels.length < 2}
                        />

                        <PillButton
                            active={false}
                            onClick={() => handleSubmit(MORNING_BRIEFING_PROMPT)}
                            icon={Sun}
                            label="Briefing"
                            disabled={isDisabled}
                        />

                        <PillButton
                            active={Boolean(keys.resume?.text?.trim())}
                            onClick={() => {
                                if (!keys.resume?.text?.trim()) {
                                    openModal()
                                    return
                                }
                                handleSubmit(buildJobMatchPrompt(keys.resume?.targetRole))
                            }}
                            icon={Briefcase}
                            label="Job Match"
                            disabled={isDisabled}
                        />

                        <PillButton
                            active={true}
                            onClick={openModal}
                            icon={Key}
                            label="Keys & Resume"
                            disabled={isLoading}
                        />

                        <MessageCounter
                            userMessageCount={userMessageCount}
                            maxUserMessagesPerChat={maxUserMessagesPerChat}
                            isMessageLimitReached={isMessageLimitReached}
                        />

                        <div className="flex-1" />

                        <span className="hidden sm:inline text-[11px] text-gray-600 font-medium">
                            {isLoading ? "⚡ Streaming..." : "↵ Send • ⇧↵ New line"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
