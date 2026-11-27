import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { ChatService } from '@/services/chat.service'
import { ConversationService } from '@/services/conversation.service'
import { checkRateLimit } from '@/lib/rate-limit'

const ChatRequestSchema = z.object({
  threadId: z.string().trim().min(1).max(128),
  model: z.string().trim().min(1).max(128),
  fallbackModel: z.string().trim().min(1).max(128).nullable().optional(),
  resumeText: z.string().max(16000).optional(),
  ephemeral: z.boolean().optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().max(16000),
      })
    )
    .min(1)
    .max(60),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !session?.userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const rate = checkRateLimit(`chat:${session.userId}`, 20, 60_000)
    if (!rate.allowed) {
      return new Response('Too many requests. Please slow down.', {
        status: 429,
        headers: { 'Retry-After': String(rate.retryAfterSec) },
      })
    }

    const rawBody = await req.json()
    const parsed = ChatRequestSchema.safeParse(rawBody)
    if (!parsed.success) {
      return new Response('Invalid request payload', { status: 400 })
    }

    const { messages, threadId, model, fallbackModel, resumeText, ephemeral } = parsed.data
    const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')
    if (!latestUserMsg?.content.trim()) {
      return new Response('User message is required', { status: 400 })
    }

    const apiKey = req.headers.get("x-model-api-key") || ""
    if (!apiKey.trim()) {
      return new Response('API key is required', { status: 400 })
    }

    const fallbackApiKey = req.headers.get("x-fallback-api-key") || undefined
    const discordWebhook = req.headers.get("x-discord-webhook") || undefined
    const slackWebhook = req.headers.get("x-slack-webhook") || undefined
    const streamEvents = req.headers.get("x-stream-events") === "1"

    const conversationService = new ConversationService()
    const chatService = new ChatService({
      name: session.user.name as string,
      email: session.user.email,
      id: session.userId,
    })

    let authoritativeMessages: { role: string; content: string }[]

    if (ephemeral) {
      const access = await conversationService.verifyEphemeralAccess(threadId, session.userId)
      if (access === 'forbidden') return new Response('Forbidden', { status: 403 })
      if (access === 'deleted') return new Response('Conversation not found', { status: 404 })
      if (access === 'limit') return new Response('Message limit reached', { status: 429 })

      const savedHistory = await conversationService.getAuthoritativeHistory(threadId, session.userId)
      const lastSaved = savedHistory.at(-1)
      // When Versus mode runs in parallel with primary, primary may have just saved the user prompt
      authoritativeMessages =
        lastSaved && lastSaved.role === 'user' && lastSaved.content === latestUserMsg.content
          ? savedHistory
          : [...savedHistory, { role: 'user', content: latestUserMsg.content }]
    } else {
      try {
        await conversationService.ensureConversation(
          threadId,
          session.userId,
          [{ role: 'user', content: latestUserMsg.content }],
          model,
          apiKey
        )
      } catch (error: any) {
        if (error?.code === 'DELETED' || error?.message === 'CONVERSATION_DELETED') {
          return new Response('Conversation not found', { status: 404 })
        }
        if (error?.code === 'FORBIDDEN') {
          return new Response('Forbidden', { status: 403 })
        }
        throw error
      }

      const limitResponse = await conversationService.checkMessageLimit(threadId)
      if (limitResponse) {
        return limitResponse
      }

      const priorHistory = await conversationService.getAuthoritativeHistory(threadId, session.userId)
      await conversationService.saveUserMessage(threadId, latestUserMsg.content)
      await conversationService.bringConversationToTop(threadId)
      authoritativeMessages = [...priorHistory, { role: 'user', content: latestUserMsg.content }]
    }

    const stream = await chatService.processChat({
      messages: authoritativeMessages,
      threadId,
      model,
      apiKey,
      fallbackModel: fallbackModel || undefined,
      fallbackApiKey,
      webhooks: {
        discord: discordWebhook,
        slack: slackWebhook,
      },
      resumeText,
      streamEvents,
      ephemeral: Boolean(ephemeral),
    })

    return new Response(stream, {
      headers: {
        'Content-Type': streamEvents
          ? 'application/x-ndjson; charset=utf-8'
          : 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', {
      message: error?.message,
      name: error?.name,
    })
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
