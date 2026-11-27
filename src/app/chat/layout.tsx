"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import ChatInterface from "@/components/chat/ChatInterface"
import { Button } from "@/components/ui/button"
import { Layers, Loader2, Menu, X } from "lucide-react"
import { twMerge } from "tailwind-merge"
import { AnimatePresence, motion } from "motion/react"
import AppsSidebar from "@/components/chat/app-sidebar"
import { RageLogo } from "@/components/rage-logo"

export const dynamic = 'force-dynamic'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [mobileAppsOpen, setMobileAppsOpen] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth >= 768) {
            setSidebarOpen(true)
        }
    }, [])

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin")
        }
    }, [status, router])

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev)
    }

    if (status === "loading") {
        return (
            <div className="h-[100dvh] flex items-center justify-center bg-[#0b0909]">
                <Loader2 className="h-7 w-7 animate-spin text-red-500" />
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="h-[100dvh] relative flex flex-col md:flex-row bg-[#0b0909] overflow-hidden">
            {/* Mobile Top Bar */}
            <header className="md:hidden flex items-center justify-between px-3 h-14 border-b border-white/[0.07] bg-[#100c0c] shrink-0 z-30">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setMobileAppsOpen(false)
                        toggleSidebar()
                    }}
                    aria-label="Toggle conversations"
                    className="h-9 w-9 text-zinc-300 hover:text-white hover:bg-white/5"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2">
                    <RageLogo variant="red" className="h-5 w-5" />
                    <span className="text-sm font-semibold text-white">Rage AI</span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setSidebarOpen(false)
                        setMobileAppsOpen((prev) => !prev)
                    }}
                    aria-label="Toggle Google Apps"
                    className="h-9 w-9 text-zinc-300 hover:text-white hover:bg-white/5"
                >
                    {mobileAppsOpen ? <X className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                </Button>
            </header>

            {/* Mobile Drawer Backdrop */}
            {(sidebarOpen || mobileAppsOpen) && (
                <div
                    className="md:hidden fixed inset-0 top-14 z-40 bg-black/70 backdrop-blur-xs"
                    onClick={() => {
                        setSidebarOpen(false)
                        setMobileAppsOpen(false)
                    }}
                />
            )}

            {/* Left Conversations Sidebar (Overlay on mobile, docked on md+) */}
            <AnimatePresence initial={false}>
                {sidebarOpen && (
                    <motion.div
                        key="sidebar"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ width: { duration: 0.25 }, opacity: { duration: 0.2 } }}
                        className="fixed md:static inset-y-0 top-14 md:top-0 left-0 z-50 md:z-20 overflow-hidden flex-shrink-0 bg-[#100c0c] border-r border-white/[0.07]"
                        style={{ minWidth: 0 }}
                    >
                        <ChatSidebar
                            isOpen={sidebarOpen}
                            onToggle={toggleSidebar}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar Toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
                className={twMerge(
                    "hidden md:flex h-10 w-10 absolute left-4 z-50 top-5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg",
                    sidebarOpen ? "" : "bg-white/5"
                )}
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Main Chat Area */}
            <div className="flex-1 min-w-0 min-h-0 w-full bg-[#0b0909]">
                <ChatInterface threadId={params?.threadId as string} />
                {children}
            </div>

            {/* Right Google Apps Sidebar: docked on lg+, slide-over drawer on mobile/tablet */}
            <div className="hidden lg:block">
                <AppsSidebar />
            </div>

            {mobileAppsOpen && (
                <div className="lg:hidden fixed inset-y-0 top-14 md:top-0 right-0 z-50">
                    <AppsSidebar isOpen={true} onCloseMobile={() => setMobileAppsOpen(false)} />
                </div>
            )}
        </div>
    )
}
