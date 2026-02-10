import { ArrowUp, Key, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Textarea } from "../ui/textarea"
import { ModelSelector } from "./model-selector"
import { PillButton } from "../pill-button"
import { MessageCounter } from "./message-counter"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface Composer {
    input: string,
    inputRef: React.RefObject<HTMLTextAreaElement | null>,
    isMessageLimitReached: boolean,
    isLoading?: boolean, 
    setInput: (value: string) => void,
    handleSubmit: (value: string) => void,
    maxUserMessagesPerChat: number,
    model: string,
    setModel: (value: string) => void,
    keys: any,
    openModal: () => void,
    userMessageCount: number
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
    keys, 
    openModal, 
    userMessageCount 
}: Composer) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current || inputRef?.current
        if (textarea) {
            textarea.style.height = 'auto'
            const scrollHeight = textarea.scrollHeight
            const maxHeight = 144
            textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`
        }
    }

    useEffect(() => {
        adjustTextareaHeight()
    }, [input])

    useEffect(() => {
        if (inputRef && textareaRef.current) {
            inputRef.current = textareaRef.current
        }
    }, [inputRef])

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
                <div className="absolute -inset-1 bg-gradient-to-r from-[#1072f8]/20 via-[#3b8fff]/20 to-[#1072f8]/20 rounded-3xl blur-xl opacity-50" />
                
                {/* Main container */}
                <div className="relative w-full rounded-2xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
                    {/* Input area */}
                    <div className="flex items-end gap-3 p-5">
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
                                        : "Message Rage AI..."
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
                            aria-label="Send message"
                            onClick={handleSend}
                            disabled={isDisabled || !input.trim()}
                            className={cn(
                                "relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
                                !isDisabled && input.trim()
                                    ? "bg-[#1072f8] text-white hover:bg-[#0052cc] shadow-lg shadow-[#1072f8]/30 hover:shadow-[#1072f8]/50 hover:scale-105"
                                    : "bg-white/5 text-gray-600 cursor-not-allowed"
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
                    <div className="px-5 pb-4 flex flex-wrap items-center gap-2.5 border-t border-white/5 pt-4">
                        <ModelSelector
                            model={model}
                            onChange={setModel}
                            keys={keys}
                            disabled={isLoading} 
                        />

                        <PillButton
                            active={true}
                            onClick={openModal}
                            icon={Key}
                            label="API Keys"
                            disabled={isLoading} 
                        />

                        <MessageCounter
                            userMessageCount={userMessageCount}
                            maxUserMessagesPerChat={maxUserMessagesPerChat}
                            isMessageLimitReached={isMessageLimitReached}
                        />

                        <div className="flex-1" />

                        <span className="text-[11px] text-gray-600 font-medium">
                            {isLoading 
                                ? "⚡ Processing..." 
                                : "↵ Send • ⇧↵ New line"
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}