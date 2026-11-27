import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { google } from 'googleapis'
import { authOptions } from '@/lib/auth'
import { AppPermissionService } from '@/services/app-permission.service'
import { safeEqualStrings, verifyOAuthState } from '@/lib/crypto'

const OAUTH_NONCE_COOKIE = 'rageai_app_oauth_nonce'

function redirectAndClearNonce(url: URL): NextResponse {
    const res = NextResponse.redirect(url)
    res.cookies.set(OAUTH_NONCE_COOKIE, '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/api/auth/callback/google-app',
        maxAge: 0,
    })
    return res
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.userId) {
            return NextResponse.redirect(new URL('/auth/signin', req.url))
        }

        const { searchParams } = new URL(req.url)
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
            return redirectAndClearNonce(new URL('/chat?error=access_denied', req.url))
        }

        if (!code || !state) {
            return redirectAndClearNonce(new URL('/chat?error=invalid_request', req.url))
        }

        const verifiedState = verifyOAuthState(state)
        const cookieNonce = req.cookies.get(OAUTH_NONCE_COOKIE)?.value || ''

        if (
            !verifiedState ||
            verifiedState.userId !== session.userId ||
            !cookieNonce ||
            !safeEqualStrings(verifiedState.nonce, cookieNonce)
        ) {
            return redirectAndClearNonce(new URL('/chat?error=invalid_request', req.url))
        }

        const baseUrl = process.env.NEXTAUTH_URL || new URL(req.url).origin
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID!,
            process.env.GOOGLE_CLIENT_SECRET!,
            `${baseUrl}/api/auth/callback/google-app`
        )

        const { tokens } = await oauth2Client.getToken(code)

        if (!tokens.access_token) {
            return redirectAndClearNonce(new URL('/chat?error=token_error', req.url))
        }

        const appPermissionService = new AppPermissionService()
        await appPermissionService.storeAppPermission(
            verifiedState.userId,
            verifiedState.appId,
            tokens.access_token,
            tokens.refresh_token || '',
            tokens.expiry_date || Date.now() + 3600 * 1000,
            tokens.scope?.split(' ') || []
        )

        return redirectAndClearNonce(
            new URL(`/chat?connected=${encodeURIComponent(verifiedState.appId)}`, req.url)
        )
    } catch (error) {
        console.error('Error handling Google app callback:', error)
        return redirectAndClearNonce(new URL('/chat?error=callback_error', req.url))
    }
}
