import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppPermissionService } from '@/services/app-permission.service'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.userId) {
            return NextResponse.redirect(new URL('/auth/signin', request.url))
        }

        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get('code')
        const state = searchParams.get('state')

        if (!code || !state) {
            return NextResponse.redirect(new URL('/chat?error=missing_params', request.url))
        }

        const { appId, userId } = JSON.parse(Buffer.from(state, 'base64').toString())

        if (userId !== session.userId) {
            return NextResponse.redirect(new URL('/chat?error=invalid_user', request.url))
        }

        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID!,
                client_secret: process.env.GITHUB_CLIENT_SECRET!,
                code
            })
        })

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
            console.error('GitHub OAuth error:', tokenData)
            return NextResponse.redirect(new URL('/chat?error=oauth_failed', request.url))
        }

        const accessToken = tokenData.access_token
        const scopes = tokenData.scope.split(',')

        // Store the permission
        const appPermissionService = new AppPermissionService()
        await appPermissionService.storeAppPermission(
            userId,
            appId,
            accessToken,
            '', // GitHub doesn't provide refresh tokens for OAuth apps
            Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year expiry
            scopes
        )

        return NextResponse.redirect(new URL('/chat?connected=github', request.url))
    } catch (error) {
        console.error('GitHub callback error:', error)
        return NextResponse.redirect(new URL('/chat?error=callback_failed', request.url))
    }
}
