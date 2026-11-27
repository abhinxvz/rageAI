"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Loader2, X } from "lucide-react"
import { SiGmail, SiGooglecalendar, SiGoogledocs } from "react-icons/si"
import { cn } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from "sonner"
import ConfirmDialog from "@/components/confirm-dialog"

type AppStatus = 'connected' | 'disconnected' | 'connecting'

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

export default function EnhancedAppsSidebar({
    isOpen = true,
    onCloseMobile,
}: {
    isOpen?: boolean
    onCloseMobile?: () => void
}) {
    const queryClient = useQueryClient()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [connectingAppId, setConnectingAppId] = useState<string | null>(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingDisconnectAppId, setPendingDisconnectAppId] = useState<string | null>(null)

    const appIcons: Record<string, React.ReactNode> = {
        gmail: <SiGmail className="w-5 h-5" />,
        calendar: <SiGooglecalendar className="w-5 h-5" />,
        docs: <SiGoogledocs className="w-5 h-5" />,
    }

    const appDescriptions: Record<string, string> = {
        gmail: 'Send, read and manage your emails',
        calendar: 'Schedule meetings and manage your calendar',
        docs: 'Read, create, and manage documents',
    }

    const appPermissions: Record<string, string[]> = {
        gmail: ['Read emails', 'Send emails', 'Create drafts'],
        calendar: ['Read events', 'Create events', 'Update & cancel events'],
        docs: ['Create & edit docs', 'Read doc content', 'Share Rage AI docs'],
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
                description: appDescriptions[app.id] || '',
                icon: appIcons[app.id],
                status: app.isConnected ? 'connected' : 'disconnected',
                permissions: appPermissions[app.id] || [],
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
            window.history.replaceState({}, '', window.location.pathname)
            queryClient.invalidateQueries({ queryKey: ['apps'] })
        }

        if (error) {
            const errorMessages: Record<string, string> = {
                access_denied: "Access was denied. Please try connecting again.",
                invalid_request: "Invalid connection request. Please try again.",
                token_error: "Failed to obtain access tokens. Please try again.",
                callback_error: "Connection failed. Please try again."
            }

            toast.error(errorMessages[error] || "An error occurred during connection.")
            window.history.replaceState({}, '', window.location.pathname)
        }
    }, [queryClient])

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
            <div className="w-72 sm:w-64 h-[calc(100dvh-3.5rem)] md:h-[100dvh] bg-[#100c0c] border-l border-white/[0.07] transition-all duration-300 z-30">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-7 h-7 animate-spin text-zinc-500" />
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "bg-[#100c0c] h-[calc(100dvh-3.5rem)] md:h-[100dvh] border-l border-white/[0.07] transition-all duration-300 z-30 flex flex-col",
            isCollapsed ? "w-16" : "w-76 max-w-[88vw]"
        )}>
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-white/[0.07]">
                    <div className="flex items-center justify-between">
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <h2 className="text-base font-semibold text-white">Google Apps</h2>
                                <p className="text-xs text-zinc-500">
                                    {connectedApps} of {apps.length} connected
                                </p>
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (onCloseMobile) {
                                    onCloseMobile()
                                } else {
                                    setIsCollapsed(!isCollapsed)
                                }
                            }}
                            className="text-zinc-400 hover:text-white hover:bg-white/5 h-8 w-8 p-0"
                        >
                            <X className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-45")} />
                        </Button>
                    </div>
                </div>

                {/* Apps List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {!isCollapsed ? (
                        apps.map((app) => {
                            const isThisConnecting = connectingAppId === app.id
                            const status: AppStatus = isThisConnecting ? 'connecting' : app.status
                            return (
                                <div
                                    key={app.id}
                                    className={cn(
                                        "bg-[#161111] border rounded-xl p-4 transition-all",
                                        status === 'connected'
                                            ? "border-red-500/35 shadow-lg shadow-red-950/20"
                                            : "border-white/[0.07] hover:border-white/15"
                                    )}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={cn(
                                            "p-2.5 rounded-lg",
                                            status === 'connected'
                                                ? "bg-red-500/15 text-red-400"
                                                : "bg-white/5 text-zinc-400"
                                        )}>
                                            {app.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-white truncate">{app.name}</h3>
                                            {status === 'connected' && app.lastUsedAt && (
                                                <p className="text-xs text-zinc-500">
                                                    Last used {formatDate(app.lastUsedAt)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mb-3 space-y-1.5">
                                        {app.permissions.slice(0, 3).map((permission, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs text-zinc-400">
                                                <div className="w-1 h-1 bg-red-400 rounded-full" />
                                                <span>{permission}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {status === 'connected' ? (
                                        <button
                                            type="button"
                                            onClick={() => handleDisconnectRequest(app.id)}
                                            className="w-full bg-zinc-900 no-underline group cursor-pointer relative shadow-xl rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
                                        >
                                            <span className="absolute inset-0 overflow-hidden rounded-full">
                                                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(239,68,68,0.6)_0%,rgba(239,68,68,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                            </span>
                                            <div className="relative flex items-center justify-center z-10 rounded-full bg-[#0e0b0b] py-2 px-4 ring-1 ring-red-500/25">
                                                <span className="text-red-400">Disconnect</span>
                                            </div>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => connectMutation.mutate(app.id)}
                                            disabled={status === 'connecting'}
                                            className="w-full bg-zinc-900 no-underline group cursor-pointer relative shadow-xl rounded-full p-px text-xs font-semibold leading-6 text-white inline-block disabled:opacity-60"
                                        >
                                            <span className="absolute inset-0 overflow-hidden rounded-full">
                                                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(239,68,68,0.6)_0%,rgba(239,68,68,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                            </span>
                                            <div className="relative flex items-center justify-center z-10 rounded-full bg-[#0e0b0b] py-2 px-4 ring-1 ring-white/10">
                                                {status === 'connecting' ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                                        <span>Connecting...</span>
                                                    </>
                                                ) : (
                                                    <span>Connect</span>
                                                )}
                                            </div>
                                        </button>
                                    )}
                                </div>
                            )
                        })
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
                                        "scale-110 transition-colors",
                                        app.status === 'connected'
                                            ? "text-red-400"
                                            : "text-zinc-500 hover:text-zinc-300"
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
                    <div className="p-4 border-t border-white/[0.07]">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">Limited Google OAuth</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-red-400 font-medium">Protected</span>
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
        </div>
    )
}
