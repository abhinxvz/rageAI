import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { google } from "googleapis"

export const APP_CONFIGURATIONS = {
  gmail: {
    name: 'Gmail',
    provider: 'google',
    requiresOAuth: true,
    scopes: [
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send'
    ]
  },
  calendar: {
    name: 'Google Calendar',
    provider: 'google',
    requiresOAuth: true,
    scopes: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly'
    ]
  },
  docs: {
    name: 'Google Docs',
    provider: 'google',
    requiresOAuth: true,
    scopes: [
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.metadata.readonly'
    ]
  },
  drive: {
    name: 'Google Drive',
    provider: 'google',
    requiresOAuth: true,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.metadata.readonly'
    ]
  },
  github: {
    name: 'GitHub',
    provider: 'github',
    requiresOAuth: false,
    scopes: [
      'repo',
      'delete_repo', 
      'admin:org',
      'admin:public_key',
      'admin:repo_hook',
      'admin:org_hook',
      'gist',
      'notifications',
      'user',
      'delete:packages',
      'write:packages',
      'read:packages',
      'admin:gpg_key',
      'workflow'
    ]
  },
  notion: {
    name: 'Notion',
    provider: 'notion',
    requiresOAuth: false,
    scopes: [] // Notion integrations have full access by default
  },
  spotify: {
    name: 'Spotify',
    provider: 'spotify',
    requiresOAuth: true,
    scopes: [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'user-read-recently-played',
      'playlist-modify-public',
      'playlist-modify-private',
      'playlist-read-private',
      'user-library-read'
    ]
  },
  twitter: {
    name: 'Twitter',
    provider: 'twitter',
    requiresOAuth: true,
    scopes: [
      'tweet.read',
      'tweet.write',
      'users.read',
      'follows.read',
      'follows.write',
      'offline.access'
    ]
  },
  instagram: {
    name: 'Instagram',
    provider: 'instagram',
    requiresOAuth: true,
    scopes: [
      'instagram_basic',
      'instagram_content_publish',
      'pages_read_engagement',
      'pages_show_list'
    ]
  },
  discord: {
    name: 'Discord',
    provider: 'discord',
    requiresOAuth: false,
    scopes: [
      'bot',
      'messages.read',
      'messages.write'
    ]
  }
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!
    )

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    })

    const { credentials } = await oauth2Client.refreshAccessToken()

    return {
      accessToken: credentials.access_token!,
      expiresAt: credentials.expiry_date!,
      refreshToken: refreshToken,
    }
  } catch (error) {
    console.error('Error refreshing access token:', error)
    throw new Error('Failed to refresh access token')
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile"
          ].join(" "),
          access_type: "offline",
          prompt: "consent"
        }
      },
      httpOptions: {
        timeout: 30000
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user?.email) {
        const waitlistEntry = await prisma.waitlist.findUnique({
          where: { email: user.email }
        })
        if (process.env.NODE_ENV !== 'development' && waitlistEntry?.status !== 'APPROVED') {
          throw new Error('WaitlistRequired')
        }
      }
      return true
    },
    async jwt({ token, account, trigger, user }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        token.userId = user?.id

        if (user?.email) {
          const waitlistEntry = await prisma.waitlist.findUnique({
            where: { email: user.email }
          })
          token.waitlistStatus = waitlistEntry?.status || null
        }

      }

      if (token.expiresAt && typeof token.expiresAt === 'number' && Date.now() > token.expiresAt - 60000) {
        try {
          if (token.refreshToken) {
            const refreshedTokens = await refreshAccessToken(token.refreshToken as string)
            token.accessToken = refreshedTokens.accessToken
            token.expiresAt = refreshedTokens.expiresAt
            token.refreshToken = refreshedTokens.refreshToken
          }
        } catch (error) {
          console.error('Failed to refresh token:', error)
          token.accessToken = undefined
          token.refreshToken = undefined
          token.expiresAt = undefined
        }
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.refreshToken = token.refreshToken as string
      session.expiresAt = token.expiresAt as number
      session.userId = token.userId as string
      session.waitlistStatus = token.waitlistStatus as 'APPROVED' | 'PENDING' | 'REJECTED' | null
      return session
    }
  },
  events: {
    async signIn({ user,  isNewUser }) {
      console.log(`User signed in: ${user.email} (New: ${isNewUser})`)
    },
    async signOut() {
      console.log('User signed out')
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt"
  }
}
