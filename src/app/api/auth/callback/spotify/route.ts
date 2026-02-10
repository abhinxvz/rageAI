import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppPermissionService } from '@/services/app-permission.service'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.userId) {
            return NextResponse.redirect(new URL('/auth/signin', req.url))
        }

        const searchParams = req.nextUrl.searchParams
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
            console.error('Spotify OAuth error:', error)
            return NextResponse.redirect(new URL(`/chat?error=${error}`, req.url))
        }

        if (!code) {
            return NextResponse.redirect(new URL('/chat?error=invalid_request', req.url))
        }

        // Exchange code for tokens
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/spotify`
            })
        })

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json()
            console.error('Spotify token exchange error:', errorData)
            return NextResponse.redirect(new URL('/chat?error=token_error', req.url))
        }

        const tokens = await tokenResponse.json()

        // Save tokens to database
        const appPermissionService = new AppPermissionService()
        await appPermissionService.saveAppPermission({
            userId: session.userId,
            appId: 'spotify',
            appName: 'Spotify',
            scopes: tokens.scope?.split(' ') || [],
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
        })

        return NextResponse.redirect(new URL('/chat?connected=spotify', req.url))
    } catch (error) {
        console.error('Spotify callback error:', error)
        return NextResponse.redirect(new URL('/chat?error=callback_error', req.url))
    }
}
