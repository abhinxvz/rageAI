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
            console.error('Instagram OAuth error:', error)
            return NextResponse.redirect(new URL(`/chat?error=${error}`, req.url))
        }

        if (!code) {
            return NextResponse.redirect(new URL('/chat?error=invalid_request', req.url))
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: process.env.INSTAGRAM_CLIENT_ID!,
                client_secret: process.env.INSTAGRAM_CLIENT_SECRET!,
                grant_type: 'authorization_code',
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/instagram`,
                code
            })
        })

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json()
            console.error('Instagram token exchange error:', errorData)
            return NextResponse.redirect(new URL('/chat?error=token_exchange_failed', req.url))
        }

        const tokenData = await tokenResponse.json()

        // Exchange short-lived token for long-lived token
        const longLivedResponse = await fetch(
            `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${tokenData.access_token}`
        )

        if (!longLivedResponse.ok) {
            console.error('Failed to get long-lived token')
            return NextResponse.redirect(new URL('/chat?error=long_lived_token_failed', req.url))
        }

        const longLivedData = await longLivedResponse.json()

        // Get Instagram Business Account ID
        const accountResponse = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedData.access_token}`
        )

        if (!accountResponse.ok) {
            console.error('Failed to get Instagram account info')
            return NextResponse.redirect(new URL('/chat?error=account_info_failed', req.url))
        }

        const accountData = await accountResponse.json()
        const pageId = accountData.data?.[0]?.id

        if (!pageId) {
            return NextResponse.redirect(new URL('/chat?error=no_instagram_business_account', req.url))
        }

        // Get Instagram Business Account ID from Page
        const igAccountResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${longLivedData.access_token}`
        )

        if (!igAccountResponse.ok) {
            console.error('Failed to get Instagram Business Account ID')
            return NextResponse.redirect(new URL('/chat?error=ig_account_id_failed', req.url))
        }

        const igAccountData = await igAccountResponse.json()
        const instagramAccountId = igAccountData.instagram_business_account?.id

        if (!instagramAccountId) {
            return NextResponse.redirect(new URL('/chat?error=no_instagram_business_account', req.url))
        }

        // Save access token to database
        const appPermissionService = new AppPermissionService()
        await appPermissionService.saveAppPermission({
            userId: session.userId,
            appId: 'instagram',
            appName: 'Instagram',
            scopes: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'],
            accessToken: longLivedData.access_token,
            refreshToken: null,
            expiresAt: new Date(Date.now() + longLivedData.expires_in * 1000),
            metadata: {
                instagramAccountId,
                pageId
            }
        })

        return NextResponse.redirect(new URL('/chat?connected=instagram', req.url))
    } catch (error) {
        console.error('Instagram callback error:', error)
        return NextResponse.redirect(new URL('/chat?error=callback_error', req.url))
    }
}
