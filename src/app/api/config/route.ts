import { config } from '@/lib/config'

export async function GET() {
  const clientConfig = {
    maxUserMessagesPerChat: config.maxUserMessagesPerChat,
    oauthConfigured: Boolean(
      process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim()
    ),
  }

  return Response.json(clientConfig)
}
