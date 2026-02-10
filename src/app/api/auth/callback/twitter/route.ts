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
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
            console.error('Twitter OAuth error:', error)
            return NextResponse.redirect(new URL(`/chat?error=${error}`, req.url))
        }

        if (!code) {
            return NextResponse.redirect(new URL('/chat?error=invalid_request', req.url))
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`
            },
            body: new URLSearchParams({
                code,
                grant_type: 'authorization_code',
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/twitter`,
                code_verifier: 'challenge' // In production, use PKCE properly
            })
        })

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json()
            console.error('Twitter token exchange error:', errorData)
            return NextResponse.redirect(new URL('/chat?error=token_exchange_failed', req.url))
        }

        const tokenData = await tokenResponse.json()

        // Get user ID from Twitter
        const userResponse = await fetch('https://api.twitter.com/2/users/me', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        })

        if (!userResponse.ok) {
            console.error('Failed to get Twitter user info')
            return NextResponse.redirect(new URL('/chat?error=user_info_failed', req.url))
        }

        const userData = await userResponse.json()

        // Save access token to database
        const appPermissionService = new AppPermissionService()
        await appPermissionService.saveAppPermission({
            userId: session.userId,
            appId: 'twitter',
            appName: 'Twitter',
            scopes: ['tweet.read', 'tweet.write', 'users.read', 'follows.read', 'follows.write'],
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || null,
            expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : null,
            metadata: {
                twitterUserId: userData.data.id,
                twitterUsername: userData.data.username
            }
        })

        return NextResponse.redirect(new URL('/chat?connected=twitter', req.url))
    } catch (error) {
        console.error('Twitter callback error:', error)
        return NextResponse.redirect(new URL('/chat?error=callback_error', req.url))
    }
}
