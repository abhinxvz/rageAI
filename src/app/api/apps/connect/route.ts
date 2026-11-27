import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppPermissionService } from '@/services/app-permission.service'
import { checkRateLimit } from '@/lib/rate-limit'

const OAUTH_NONCE_COOKIE = 'rageai_app_oauth_nonce'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const rate = checkRateLimit(`connect:${session.userId}`, 15, 60_000)
        if (!rate.allowed) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
            )
        }

        const { appId } = await req.json()
        if (!appId || typeof appId !== 'string') {
            return NextResponse.json({ error: 'App ID is required' }, { status: 400 })
        }

        const appPermissionService = new AppPermissionService()
        const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin
        const redirectUri = `${baseUrl}/api/auth/callback/google-app`

        const { authUrl, nonce } = appPermissionService.generateAppOAuthUrl(
            appId,
            session.userId,
            redirectUri,
            session?.user?.email as string
        )

        const response = NextResponse.json({ authUrl })
        response.cookies.set(OAUTH_NONCE_COOKIE, nonce, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/api/auth/callback/google-app',
            maxAge: 600,
        })

        return response
    } catch (error) {
        console.error('Error generating connect URL:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
