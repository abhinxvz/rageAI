

import { prisma } from '@/lib/prisma'
import { google } from 'googleapis'
import { APP_CONFIGURATIONS } from '@/lib/auth'

export interface AppPermission {
    id: string
    userId: string
    appId: string
    appName: string
    scopes: string[]
    isConnected: boolean
    connectedAt: Date
    lastUsedAt?: Date
}

export class AppPermissionService {

    async getUserAppPermissions(userId: string): Promise<AppPermission[]> {
        const permissions = await prisma.userAppPermission.findMany({
            where: { userId },
            orderBy: { connectedAt: 'desc' }
        })

        return permissions.map((p: any) => ({
            id: p.id,
            userId: p.userId,
            appId: p.appId,
            appName: p.appName,
            scopes: p.scopes,
            isConnected: p.isConnected,
            connectedAt: p.connectedAt,
            lastUsedAt: p.lastUsedAt || undefined
        }))
    }

    async hasAppPermission(userId: string, appId: string): Promise<boolean> {
        const permission = await prisma.userAppPermission.findUnique({
            where: { userId_appId: { userId, appId } }
        })

        return permission?.isConnected || false
    }

    async getAppAccessToken(userId: string, appId: string): Promise<string | null> {
        const permission = await prisma.userAppPermission.findUnique({
            where: { userId_appId: { userId, appId } }
        })

        if (!permission?.isConnected || !permission.accessToken) {
            return null
        }

        if (permission.expiresAt && permission.expiresAt.getTime() < Date.now() + 60000) {
            if (permission.refreshToken) {
                try {
                    const oauth2Client = new google.auth.OAuth2(
                        process.env.GOOGLE_CLIENT_ID!,
                        process.env.GOOGLE_CLIENT_SECRET!
                    )

                    oauth2Client.setCredentials({
                        refresh_token: permission.refreshToken
                    })

                    const { credentials } = await oauth2Client.refreshAccessToken()

                    await prisma.userAppPermission.update({
                        where: { id: permission.id },
                        data: {
                            accessToken: credentials.access_token!,
                            expiresAt: new Date(credentials.expiry_date!),
                            lastUsedAt: new Date()
                        }
                    })

                    return credentials.access_token!
                } catch (error) {
                    console.error('Failed to refresh app token:', error)
                    await this.disconnectApp(userId, appId)
                    return null
                }
            }
            return null
        }

        await prisma.userAppPermission.update({
            where: { id: permission.id },
            data: { lastUsedAt: new Date() }
        })

        return permission.accessToken
    }

    async getAppMetadata(userId: string, appId: string): Promise<any> {
        const permission = await prisma.userAppPermission.findUnique({
            where: { userId_appId: { userId, appId } }
        })

        return permission?.metadata || null
    }

    async saveAppPermission(data: {
        userId: string
        appId: string
        appName: string
        scopes: string[]
        accessToken: string
        refreshToken: string | null
        expiresAt: Date | null
        metadata?: any
    }): Promise<void> {
        await prisma.userAppPermission.upsert({
            where: { userId_appId: { userId: data.userId, appId: data.appId } },
            update: {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresAt: data.expiresAt,
                scopes: data.scopes,
                isConnected: true,
                connectedAt: new Date(),
                lastUsedAt: new Date(),
                metadata: data.metadata || null
            },
            create: {
                userId: data.userId,
                appId: data.appId,
                appName: data.appName,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                expiresAt: data.expiresAt,
                scopes: data.scopes,
                isConnected: true,
                connectedAt: new Date(),
                lastUsedAt: new Date(),
                metadata: data.metadata || null
            }
        })
    }

    async storeAppPermission(
        userId: string,
        appId: string,
        accessToken: string,
        refreshToken: string,
        expiresAt: number,
        scopes: string[]
    ): Promise<void> {
        const appConfig = APP_CONFIGURATIONS[appId as keyof typeof APP_CONFIGURATIONS]
        const expiryDate = new Date(expiresAt)

        await prisma.userAppPermission.upsert({
            where: { userId_appId: { userId, appId } },
            update: {
                accessToken,
                refreshToken: refreshToken || null,
                expiresAt: expiryDate,
                scopes,
                isConnected: true,
                connectedAt: new Date(),
                lastUsedAt: new Date()
            },
            create: {
                userId,
                appId,
                appName: appConfig.name,
                accessToken,
                refreshToken: refreshToken || null,
                expiresAt: expiryDate,
                scopes,
                isConnected: true,
                connectedAt: new Date(),
                lastUsedAt: new Date()
            }
        })
    }

    async storeDirectToken(userId: string, appId: string, token: string): Promise<void> {
        const appConfig = APP_CONFIGURATIONS[appId as keyof typeof APP_CONFIGURATIONS]

        // For GitHub and Notion, tokens don't expire
        const expiryDate = new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)) // 1 year

        await prisma.userAppPermission.upsert({
            where: { userId_appId: { userId, appId } },
            update: {
                accessToken: token,
                refreshToken: null,
                expiresAt: expiryDate,
                scopes: appConfig.scopes,
                isConnected: true,
                connectedAt: new Date(),
                lastUsedAt: new Date()
            },
            create: {
                userId,
                appId,
                appName: appConfig.name,
                accessToken: token,
                refreshToken: null,
                expiresAt: expiryDate,
                scopes: appConfig.scopes,
                isConnected: true,
                connectedAt: new Date(),
                lastUsedAt: new Date()
            }
        })
    }

    async disconnectApp(userId: string, appId: string): Promise<void> {
        await prisma.userAppPermission.update({
            where: { userId_appId: { userId, appId } },
            data: {
                isConnected: false,
                accessToken: null,
                refreshToken: null,
                expiresAt: null
            }
        })
    }

    generateAppOAuthUrl(appId: string, userId: string, redirectUri: string, email: string): string {
        const appConfig = APP_CONFIGURATIONS[appId as keyof typeof APP_CONFIGURATIONS]

        if (!appConfig) {
            throw new Error(`Unknown app: ${appId}`)
        }

        // Handle GitHub OAuth
        if (appConfig.provider === 'github') {
            const clientId = process.env.GITHUB_CLIENT_ID!
            const scopes = appConfig.scopes.join(' ')
            const state = Buffer.from(JSON.stringify({ appId, userId })).toString('base64')

            return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`
        }

        // Handle Notion OAuth
        if (appConfig.provider === 'notion') {
            const clientId = process.env.NOTION_CLIENT_ID!
            const state = Buffer.from(JSON.stringify({ appId, userId })).toString('base64')

            return `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&owner=user&state=${state}`
        }

        // Handle Spotify OAuth
        if (appConfig.provider === 'spotify') {
            const clientId = process.env.SPOTIFY_CLIENT_ID!
            const scopes = appConfig.scopes.join(' ')
            const state = Buffer.from(JSON.stringify({ appId, userId })).toString('base64')

            return `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`
        }

        // Handle Twitter OAuth 2.0
        if (appConfig.provider === 'twitter') {
            const clientId = process.env.TWITTER_CLIENT_ID!
            const scopes = appConfig.scopes.join(' ')
            const state = Buffer.from(JSON.stringify({ appId, userId })).toString('base64')

            // Twitter OAuth 2.0 with PKCE
            return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}&code_challenge=challenge&code_challenge_method=plain`
        }

        // Handle Instagram OAuth
        if (appConfig.provider === 'instagram') {
            const clientId = process.env.INSTAGRAM_CLIENT_ID!
            const scopes = appConfig.scopes.join(',')
            const state = Buffer.from(JSON.stringify({ appId, userId })).toString('base64')

            return `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code&state=${state}`
        }

        // Handle Google OAuth (Gmail, Calendar, Docs)
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID!,
            process.env.GOOGLE_CLIENT_SECRET!,
            redirectUri
        )

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: appConfig.scopes,
            prompt: 'consent',
            state: JSON.stringify({ appId, userId }),
            login_hint: email
        })

        return authUrl
    }

    async getAvailableApps(userId: string) {
        const userPermissions = await this.getUserAppPermissions(userId)
        const permissionMap = new Map(userPermissions.map(p => [p.appId, p]))

        return Object.entries(APP_CONFIGURATIONS).map(([appId, config]) => {
            const permission = permissionMap.get(appId)

            return {
                id: appId,
                name: config.name,
                scopes: config.scopes,
                isConnected: permission?.isConnected || false,
                connectedAt: permission?.connectedAt,
                lastUsedAt: permission?.lastUsedAt
            }
        })
    }
}