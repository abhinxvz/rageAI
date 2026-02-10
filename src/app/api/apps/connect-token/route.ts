import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppPermissionService } from '@/services/app-permission.service'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { appId, token } = await request.json()

        if (!appId || !token) {
            return NextResponse.json({ error: 'Missing appId or token' }, { status: 400 })
        }

        // Validate the token by making a test API call
        if (appId === 'github') {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            })
            
            if (!response.ok) {
                return NextResponse.json({ error: 'Invalid GitHub token' }, { status: 400 })
            }
        } else if (appId === 'notion') {
            const response = await fetch('https://api.notion.com/v1/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Notion-Version': '2022-06-28'
                }
            })
            
            if (!response.ok) {
                return NextResponse.json({ error: 'Invalid Notion token' }, { status: 400 })
            }
        }

        const appPermissionService = new AppPermissionService()
        await appPermissionService.storeDirectToken(session.userId, appId, token)

        return NextResponse.json({ success: true, message: `${appId} connected successfully` })
    } catch (error) {
        console.error('Connect token error:', error)
        return NextResponse.json({ error: 'Failed to connect app' }, { status: 500 })
    }
}
