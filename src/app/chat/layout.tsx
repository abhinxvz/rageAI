"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ChatSidebar } from "@/components/chat/ChatSidebar"
import ChatInterface from "@/components/chat/ChatInterface"
import { Button } from "@/components/ui/button"
import { Loader2, Menu } from "lucide-react"
import { twMerge } from "tailwind-merge"
import { AnimatePresence, motion } from "motion/react"
import AppsSidebar from "@/components/chat/app-sidebar"

export const dynamic = 'force-dynamic'

export default function Layout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const params = useParams()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/auth/signin")
        }
    }, [status, router])

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    if (status === "loading") {
        return (
            <div className="h-screen flex items-center justify-center bg-[#0b0909]">
                <Loader2 className="h-7 w-7 animate-spin text-red-500" />
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="h-screen relative flex bg-[#0b0909] overflow-hidden">
            <AnimatePresence initial={false}>
                {sidebarOpen && (
                    <motion.div
                        key="sidebar"
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ width: { duration: 0.25 }, opacity: { duration: 0.2 } }}
                        className="overflow-hidden flex-shrink-0 bg-[#100c0c] border-r border-white/[0.07]"
                        style={{ minWidth: 0 }}
                    >
                        <ChatSidebar
                            isOpen={sidebarOpen}
                            onToggle={toggleSidebar}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className={twMerge(
                    "h-10 w-10 absolute left-4 z-50 top-5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg",
                    sidebarOpen ? "" : "bg-white/5"
                )}
            >
                <Menu className="h-5 w-5" />
            </Button>

            <div className="flex-1 w-full bg-[#0b0909]">
                <ChatInterface threadId={params?.threadId as string} />
                {children}
            </div>

            <AppsSidebar />
        </div>
    )
}
