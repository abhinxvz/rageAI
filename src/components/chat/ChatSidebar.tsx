"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { format } from "timeago.js"
import {
  Plus,
  LogOut,
  Search,
  MessageSquare,
  Settings,
  Sparkles,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useParams, useRouter } from "next/navigation"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/use-debounce"
import Image from "next/image"

interface Conversation {
  threadId: string
  title: string
  createdAt: Date
}

interface ChatSidebarProps {
  onConversationsChange?: () => void
  conversations?: Conversation[]
  isOpen: boolean
  onToggle: () => void
}

export function ChatSidebar({
  onToggle
}: ChatSidebarProps) {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const debounced = useDebounce(searchQuery, 300);
  const params = useParams()
  const router = useRouter()

  const { data: conversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations', params.threadId, debounced],
    queryFn: () => fetch(`/api/conversations?q=${searchQuery}`).then(res => res.json()),
    placeholderData: keepPreviousData,
  })

  const handleNewChat = () => {
    router.push(`/chat`)
  }

  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title
    return title.substring(0, maxLength) + '...'
  }


  return (
    <div className="w-full h-screen bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-5 space-y-5 border-b border-white/5">
        <div className="flex items-center justify-center gap-3 py-1 -ml-3">
          <Image src="/logo.png" alt="Rage AI" width={32} height={32} className="rounded-lg" />
          <span className="text-xl font-['TRTCENZO'] text-white">Rage AI</span>
        </div>

        <button
          onClick={handleNewChat}
          className="w-full bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px font-semibold leading-6 text-white"
        >
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(16,114,248,0.6)_0%,rgba(16,114,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </span>
          <div className="relative flex items-center justify-center gap-3 z-10 rounded-full bg-zinc-950 py-2.5 px-4 ring-1 ring-white/10">
            <Plus className="h-5 w-5" />
            <span className="text-sm">New Chat</span>
          </div>
          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#1072f8]/0 via-[#1072f8]/90 to-[#1072f8]/0 transition-opacity duration-500 group-hover:opacity-40" />
        </button>
      </div>

      {/* Search */}
      <div className="flex-shrink-0 px-5 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-[#1072f8] transition-colors rounded-lg"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="space-y-1 pb-4">
          {Array.isArray(conversations) && conversations.length === 0 && (
            <div className="text-center py-8 px-4">
              <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-600 mt-1">Start a new chat to begin</p>
            </div>
          )}
          {Array.isArray(conversations) && conversations.map((conversation: any) => (
            <div
              key={conversation.threadId}
              className={cn(
                "group relative flex items-center px-3 py-3 rounded-lg transition-all cursor-pointer",
                params.threadId === conversation.threadId
                  ? "bg-[#1072f8]/10 border border-[#1072f8]/30"
                  : "hover:bg-white/5 border border-transparent"
              )}
              onClick={() => router.push(`/chat/${conversation.threadId}`)}
            >
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium capitalize truncate",
                  params.threadId === conversation.threadId ? "text-white" : "text-gray-300"
                )}>
                  {truncateTitle(conversation.title)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {conversation.messagesCount} messages
                  </span>
                  <span className="text-xs text-gray-600">•</span>
                  <span className="text-xs text-gray-500">
                    {format(conversation.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-white/5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto p-3 hover:bg-white/5 rounded-lg"
            >
              <Avatar className="h-9 w-9 ring-2 ring-white/10">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-[#1072f8] text-white font-semibold">
                  {session?.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a] border-white/10">
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
