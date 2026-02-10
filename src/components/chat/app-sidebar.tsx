import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Calendar, Video, Loader2, X, FileText } from "lucide-react"
import { SiGmail, SiGooglecalendar, SiGooglemeet, SiGoogledocs, SiGoogledrive, SiGithub, SiNotion, SiSpotify, SiX, SiInstagram, SiDiscord } from "react-icons/si"
import { cn } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Input } from "@/components/ui/input"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type AppStatus = 'connected' | 'disconnected' | 'connecting'
import { toast } from "sonner"
import ConfirmDialog from "@/components/confirm-dialog"

type GoogleApp = {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    status: AppStatus
    permissions: string[]
    isConnected: boolean
    connectedAt?: Date
    lastUsedAt?: Date
}

export default function EnhancedAppsSidebar({ isOpen = true }: { isOpen?: boolean }) {
    const queryClient = useQueryClient()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [connectingAppId, setConnectingAppId] = useState<string | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingDisconnectAppId, setPendingDisconnectAppId] = useState<string | null>(null)
    const [tokenDialogOpen, setTokenDialogOpen] = useState(false)
    const [selectedApp, setSelectedApp] = useState<string | null>(null)
    const [tokenInput, setTokenInput] = useState('')

    const appIcons = {
        gmail: <SiGmail className="w-5 h-5" />,
        calendar: <SiGooglecalendar className="w-5 h-5" />,
        meet: <SiGooglemeet className="w-5 h-5" />,
        docs: <SiGoogledocs className="w-5 h-5" />,
        drive: <SiGoogledrive className="w-5 h-5" />,
        github: <SiGithub className="w-5 h-5" />,
        notion: <SiNotion className="w-5 h-5" />,
        spotify: <SiSpotify className="w-5 h-5" />,
        twitter: <SiX className="w-5 h-5" />,
        instagram: <SiInstagram className="w-5 h-5" />,
        discord: <SiDiscord className="w-5 h-5" />
    }

    const appDescriptions = {
        gmail: 'Send, read and manage your emails',
        calendar: 'Schedule meetings and manage your calendar',
        meet: 'Create and join video meetings',
        docs: 'Read, create, and manage documents',
        drive: 'Store, organize, and share files',
        github: 'Manage repositories, issues, and pull requests',
        notion: 'Access and manage your Notion workspace',
        spotify: 'Create playlists based on your listening history',
        twitter: 'Post tweets and manage your Twitter account',
        instagram: 'Post photos, videos, and manage your Instagram',
        discord: 'Send messages and manage your Discord servers'
    }

    const appPermissions = {
        gmail: ['Read emails', 'Send emails', 'Manage inbox'],
        calendar: ['Read events', 'Create events', 'Send invitations'],
        meet: ['Create meetings', 'Cancel meetings', 'Schedule Meetings'],
        docs: ['Read, create, edit, and manage documents', 'Access document content and formatting', 'Share and collaborate on documents'],
        drive: ['List and search files', 'Upload and organize files', 'Share files and folders'],
        github: ['Access repositories', 'Create issues and PRs', 'Manage code'],
        notion: ['Read pages and databases', 'Create and update content', 'Search workspace'],
        spotify: ['Read listening history', 'Create playlists', 'Manage music library'],
        twitter: ['Post tweets', 'Read timeline', 'Manage interactions'],
        instagram: ['Post photos and videos', 'View insights', 'Manage comments'],
        discord: ['Send messages', 'Manage channels', 'Manage roles']
    }

    const { data: apps = [], isLoading } = useQuery<GoogleApp[]>({
        queryKey: ['apps'],
        queryFn: async () => {
            const response = await fetch('/api/apps')
            if (!response.ok) throw new Error('Failed to fetch apps')
            const { apps: apiApps } = await response.json()
            return apiApps.map((app: any) => ({
                id: app.id,
                name: app.name,
                description: appDescriptions[app.id as keyof typeof appDescriptions] || '',
                icon: appIcons[app.id as keyof typeof appIcons],
                status: app.isConnected ? 'connected' : 'disconnected',
                permissions: appPermissions[app.id as keyof typeof appPermissions] || [],
                isConnected: app.isConnected,
                connectedAt: app.connectedAt ? new Date(app.connectedAt) : undefined,
                lastUsedAt: app.lastUsedAt ? new Date(app.lastUsedAt) : undefined
            })) as GoogleApp[]
        },
        staleTime: 30_000,
    })

    const connectMutation = useMutation({
        mutationFn: async (appId: string) => {
            const response = await fetch('/api/apps/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appId })
            })
            if (!response.ok) throw new Error('Failed to generate connect URL')
            return response.json() as Promise<{ authUrl: string }>
        },
        onMutate: (appId: string) => {
            setConnectingAppId(appId)
        },
        onError: () => {
            setConnectingAppId(null)
            toast.error("Failed to connect app. Please try again.")
        },
        onSuccess: ({ authUrl }) => {
            window.location.href = authUrl
        }
    })

    const connectTokenMutation = useMutation({
        mutationFn: async ({ appId, token }: { appId: string, token: string }) => {
            const response = await fetch('/api/apps/connect-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appId, token })
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Failed to connect')
            }
            return response.json()
        },
        onSuccess: () => {
            toast.success("App connected successfully!")
            setTokenDialogOpen(false)
            setTokenInput('')
            setSelectedApp(null)
            queryClient.invalidateQueries({ queryKey: ['apps'] })
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to connect app. Please check your token.")
        }
    })

    const handleConnect = (appId: string) => {
        // For GitHub, Notion, and Twitter show token input dialog
        if (appId === 'github') {
            window.open('https://github.com/settings/tokens/new?description=RageAI%20Integration&scopes=repo,delete_repo,admin:org,admin:public_key,admin:repo_hook,admin:org_hook,gist,notifications,user,delete:packages,write:packages,read:packages,admin:gpg_key,workflow', '_blank')
            setSelectedApp(appId)
            setTokenDialogOpen(true)
        } else if (appId === 'notion') {
            window.open('https://www.notion.so/my-integrations', '_blank')
            setSelectedApp(appId)
            setTokenDialogOpen(true)
        } else if (appId === 'twitter') {
            window.open('https://developer.twitter.com/en/portal/projects-and-apps', '_blank')
            setSelectedApp(appId)
            setTokenDialogOpen(true)
        } else if (appId === 'discord') {
            window.open('https://discord.com/developers/applications', '_blank')
            setSelectedApp(appId)
            setTokenDialogOpen(true)
        } else if (appId === 'spotify') {
            const scopes = [
                'user-read-private',
                'user-read-email',
                'user-top-read',
                'user-read-recently-played',
                'playlist-modify-public',
                'playlist-modify-private',
                'playlist-read-private',
                'user-library-read'
            ].join(' ')
            
            const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
                client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '',
                response_type: 'code',
                redirect_uri: `${window.location.origin}/api/auth/callback/spotify`,
                scope: scopes,
                show_dialog: 'true'
            })}`
            
            window.location.href = authUrl
        } else if (appId === 'instagram') {
            const scopes = 'instagram_basic,instagram_content_publish,pages_read_engagement,pages_show_list'
            const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || ''
            
            const authUrl = `https://api.instagram.com/oauth/authorize?${new URLSearchParams({
                client_id: clientId,
                redirect_uri: `${window.location.origin}/api/auth/callback/instagram`,
                scope: scopes,
                response_type: 'code'
            })}`
            
            window.location.href = authUrl
        } else {
            // For Google apps, use OAuth
            connectMutation.mutate(appId)
        }
    }

    const handleTokenSubmit = () => {
        if (selectedApp && tokenInput.trim()) {
            connectTokenMutation.mutate({ appId: selectedApp, token: tokenInput.trim() })
        }
    }

    const disconnectMutation = useMutation({
        mutationFn: async (appId: string) => {
            const response = await fetch('/api/apps/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appId })
            })
            if (!response.ok) throw new Error('Failed to disconnect app')
            return true
        },
        onSuccess: async () => {
            toast.success("App has been disconnected successfully.")
            await queryClient.invalidateQueries({ queryKey: ['apps'] })
        },
        onError: () => {
            toast.error("Failed to disconnect app. Please try again.")
        }
    })

    const handleDisconnectRequest = (appId: string) => {
        setPendingDisconnectAppId(appId)
        setConfirmOpen(true)
    }

    const handleConfirmDisconnect = () => {
        if (pendingDisconnectAppId) {
            disconnectMutation.mutate(pendingDisconnectAppId)
        }
        setConfirmOpen(false)
        setPendingDisconnectAppId(null)
    }

    const handleCancelDisconnect = () => {
        setConfirmOpen(false)
        setPendingDisconnectAppId(null)
    }

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const connected = urlParams.get('connected')
        const error = urlParams.get('error')

        if (connected) {
            toast.success(`${connected.charAt(0).toUpperCase() + connected.slice(1)} has been connected to your account.`)
            window.history.replaceState({}, '', '/chat')
            queryClient.invalidateQueries({ queryKey: ['apps'] })
        }

        if (error) {
            const errorMessages = {
                access_denied: "Access was denied. Please try connecting again.",
                invalid_request: "Invalid connection request. Please try again.",
                token_error: "Failed to obtain access tokens. Please try again.",
                callback_error: "Connection failed. Please try again."
            }

            toast.error(errorMessages[error as keyof typeof errorMessages] || "An error occurred during connection.")
            window.history.replaceState({}, '', '/chat')
        }
    }, [])


    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    const connectedApps = apps.filter(app => app.status === 'connected').length

    if (!isOpen) return null

    if (isLoading) {
        return (
            <div className={cn(
                "w-60 h-screen bg-sidebar border-l border-sidebar-border transition-all duration-300 z-30"
            )}>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "bg-[#0f0f0f] h-screen border-l border-white/5 transition-all duration-300 z-30 flex flex-col",
            isCollapsed ? "w-16" : "w-80"
        )}>
            <div className="flex flex-col h-full">

                {/* Header */}
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-semibold text-white">Connected Apps</h2>
                                <p className="text-sm text-gray-500">
                                    {connectedApps} of {apps.length} connected
                                </p>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="text-gray-400 hover:text-white hover:bg-white/5 h-8 w-8 p-0"
                        >
                            <X className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
                        </Button>
                    </div>
                </div>

                {/* Apps List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {!isCollapsed ? (
                        <>
                            {apps.map((app) => {
                                const isThisConnecting = connectingAppId === app.id
                                const status: AppStatus = isThisConnecting ? 'connecting' : app.status
                                return (
                                    <div 
                                        key={app.id} 
                                        className={cn(
                                            "bg-[#1a1a1a] border rounded-xl p-4 transition-all",
                                            status === 'connected' 
                                                ? "border-[#1072f8]/30 shadow-lg shadow-[#1072f8]/5" 
                                                : "border-white/5 hover:border-white/10"
                                        )}
                                    >
                                        {/* App Header */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={cn(
                                                "p-2.5 rounded-lg",
                                                status === 'connected'
                                                    ? "bg-[#1072f8]/10 text-[#3b8fff]"
                                                    : "bg-white/5 text-gray-400"
                                            )}>
                                                {app.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-sm font-semibold text-white">{app.name}</h3>
                                                {status === 'connected' && app.lastUsedAt && (
                                                    <p className="text-xs text-gray-500">
                                                        Last used {formatDate(app.lastUsedAt)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Permissions */}
                                        <div className="mb-3">
                                            <div className="space-y-1.5">
                                                {app.permissions.slice(0, 3).map((permission, idx) => (
                                                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                                                        <div className="w-1 h-1 bg-[#3b8fff] rounded-full" />
                                                        {permission}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div>
                                            {status === 'connected' ? (
                                                <button className="w-full bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block">
                                                    <span className="absolute inset-0 overflow-hidden rounded-full">
                                                        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(239,68,68,0.6)_0%,rgba(239,68,68,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                                    </span>
                                                    <div 
                                                        className="relative flex items-center justify-center z-10 rounded-full bg-zinc-950 py-2 px-4 ring-1 ring-red-500/20"
                                                        onClick={() => handleDisconnectRequest(app.id)}
                                                    >
                                                        <span className="text-red-400">Disconnect</span>
                                                    </div>
                                                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-red-500/0 via-red-500/90 to-red-500/0 transition-opacity duration-500 group-hover:opacity-40" />
                                                </button>
                                            ) : (
                                                <button 
                                                    className="w-full bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
                                                    onClick={() => handleConnect(app.id)}
                                                    disabled={status === 'connecting'}
                                                >
                                                    <span className="absolute inset-0 overflow-hidden rounded-full">
                                                        <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(16,114,248,0.6)_0%,rgba(16,114,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                                    </span>
                                                    <div className="relative flex items-center justify-center z-10 rounded-full bg-zinc-950 py-2 px-4 ring-1 ring-white/10">
                                                        {status === 'connecting' ? (
                                                            <>
                                                                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                                                <span>Connecting...</span>
                                                            </>
                                                        ) : (
                                                            <span>Connect</span>
                                                        )}
                                                    </div>
                                                    <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#1072f8]/0 via-[#1072f8]/90 to-[#1072f8]/0 transition-opacity duration-500 group-hover:opacity-40" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </>
                    ) : (
                        <div className="space-y-3">
                            {apps.map((app) => (
                                <div
                                    key={app.id}
                                    className="relative flex items-center justify-center p-3 transition-all cursor-pointer"
                                    title={`${app.name} - ${app.status}`}
                                    onClick={() => setIsCollapsed(false)}
                                >
                                    <div className={cn(
                                        "scale-125 transition-colors",
                                        app.status === 'connected'
                                            ? "text-[#3b8fff]"
                                            : "text-gray-500 hover:text-gray-400"
                                    )}>
                                        {app.icon}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!isCollapsed && (
                    <div className="p-4 border-t border-white/5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Secure OAuth 2.0</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-[#3b8fff] rounded-full animate-pulse" />
                                <span className="text-[#3b8fff] font-medium">Protected</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={confirmOpen}
                title="Disconnect app?"
                message={
                    pendingDisconnectAppId
                        ? `Are you sure you want to disconnect ${apps.find(a => a.id === pendingDisconnectAppId)?.name || 'this app'}? This will revoke its access.`
                        : "Are you sure you want to disconnect this app? This will revoke its access."
                }
                confirmText={disconnectMutation.isPending ? "Disconnecting..." : "Disconnect"}
                onConfirm={handleConfirmDisconnect}
                onCancel={handleCancelDisconnect}
            />

            <AlertDialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
                <AlertDialogContent className="sm:max-w-md bg-[#1a1a1a] border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Connect {selectedApp === 'github' ? 'GitHub' : selectedApp === 'twitter' ? 'Twitter' : selectedApp === 'discord' ? 'Discord' : 'Notion'}</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            {selectedApp === 'github' ? (
                                <>
                                    We've opened GitHub's token creation page in a new tab with FULL ACCESS permissions pre-selected.<br/><br/>
                                    1. Scroll down and click "Generate token" on the GitHub page<br/>
                                    2. Copy the generated token<br/>
                                    3. Paste it below<br/><br/>
                                    <span className="text-xs text-gray-500">This gives RageAI full control to create, edit, delete repos, issues, PRs, and more.</span>
                                </>
                            ) : selectedApp === 'twitter' ? (
                                <>
                                    We've opened Twitter Developer Portal in a new tab.<br/><br/>
                                    1. Create a new app or select an existing one<br/>
                                    2. Go to "Keys and tokens" tab<br/>
                                    3. Generate a "Bearer Token" with Read and Write permissions<br/>
                                    4. Copy the Bearer Token<br/>
                                    5. Paste it below<br/><br/>
                                    <span className="text-xs text-gray-500">This gives RageAI access to post tweets, read timeline, and manage interactions.</span>
                                </>
                            ) : selectedApp === 'discord' ? (
                                <>
                                    We've opened Discord Developer Portal in a new tab.<br/><br/>
                                    1. Create a new application or select an existing one<br/>
                                    2. Go to "Bot" section and click "Add Bot"<br/>
                                    3. Enable "MESSAGE CONTENT INTENT" under Privileged Gateway Intents<br/>
                                    4. Click "Reset Token" and copy the Bot Token<br/>
                                    5. Paste it below<br/>
                                    6. Use the OAuth2 URL Generator to invite the bot to your server<br/><br/>
                                    <span className="text-xs text-gray-500">This gives RageAI access to send messages, manage channels, roles, and more in your Discord servers.</span>
                                </>
                            ) : (
                                <>
                                    We've opened Notion's integrations page in a new tab.<br/><br/>
                                    1. Click "New integration" or select an existing one<br/>
                                    2. Give it FULL ACCESS capabilities (Read, Update, Insert content)<br/>
                                    3. Copy the "Internal Integration Token"<br/>
                                    4. Paste it below<br/><br/>
                                    <span className="text-xs text-gray-500">This gives RageAI full control to read, create, update, and delete pages and databases.</span>
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4">
                        <Input
                            type="password"
                            placeholder={selectedApp === 'github' ? 'ghp_xxxxxxxxxxxx' : selectedApp === 'twitter' ? 'Bearer token...' : selectedApp === 'discord' ? 'Bot token...' : 'secret_xxxxxxxxxxxx'}
                            value={tokenInput}
                            onChange={(e) => setTokenInput(e.target.value)}
                            className="font-mono text-sm bg-[#0f0f0f] border-white/10 text-white"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleTokenSubmit}
                                disabled={!tokenInput.trim() || connectTokenMutation.isPending}
                                className="flex-1 bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="absolute inset-0 overflow-hidden rounded-full">
                                    <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(16,114,248,0.6)_0%,rgba(16,114,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                </span>
                                <div className="relative flex items-center justify-center z-10 rounded-full bg-zinc-950 py-2 px-4 ring-1 ring-white/10">
                                    {connectTokenMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            <span>Connecting...</span>
                                        </>
                                    ) : (
                                        <span>Connect</span>
                                    )}
                                </div>
                                <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-[#1072f8]/0 via-[#1072f8]/90 to-[#1072f8]/0 transition-opacity duration-500 group-hover:opacity-40" />
                            </button>
                            <button
                                onClick={() => {
                                    setTokenDialogOpen(false)
                                    setTokenInput('')
                                    setSelectedApp(null)
                                }}
                                className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
                            >
                                <span className="absolute inset-0 overflow-hidden rounded-full">
                                    <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                </span>
                                <div className="relative flex items-center justify-center z-10 rounded-full bg-zinc-950 py-2 px-4 ring-1 ring-white/10">
                                    <span>Cancel</span>
                                </div>
                                <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-white/0 via-white/50 to-white/0 transition-opacity duration-500 group-hover:opacity-40" />
                            </button>
                        </div>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )

}