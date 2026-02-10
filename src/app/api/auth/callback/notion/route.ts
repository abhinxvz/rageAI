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
        const credentials = Buffer.from(
            `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
        ).toString('base64')

        const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code,
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/notion`
            })
        })

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
            console.error('Notion OAuth error:', tokenData)
            return NextResponse.redirect(new URL('/chat?error=oauth_failed', request.url))
        }

        const accessToken = tokenData.access_token
        const workspaceId = tokenData.workspace_id

        // Store the permission
        const appPermissionService = new AppPermissionService()
        await appPermissionService.storeAppPermission(
            userId,
            appId,
            accessToken,
            '', // Notion doesn't provide refresh tokens
            Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year expiry
            [`workspace:${workspaceId}`]
        )

        return NextResponse.redirect(new URL('/chat?connected=notion', request.url))
    } catch (error) {
        console.error('Notion callback error:', error)
        return NextResponse.redirect(new URL('/chat?error=callback_failed', request.url))
    }
}
