import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ChatService } from '@/services/chat.service'
import { ConversationService } from '@/services/conversation.service'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages, threadId, model, fallbackModel, resumeText, ephemeral } = await req.json()
    if (!Array.isArray(messages)) {
      return new Response('Invalid message format', { status: 400 })
    }

    const apiKey = req.headers.get("x-model-api-key") as string
    const fallbackApiKey = req.headers.get("x-fallback-api-key") || undefined
    const discordWebhook = req.headers.get("x-discord-webhook") || undefined
    const slackWebhook = req.headers.get("x-slack-webhook") || undefined
    const streamEvents = req.headers.get("x-stream-events") === "1"

    const conversationService = new ConversationService()
    const chatService = new ChatService({
      name: session?.user?.name as string,
      email: session?.user?.email,
      id: session?.userId as string,
    })

    if (!ephemeral) {
      try {
        await conversationService.ensureConversation(
          threadId,
          session.userId as string,
          messages,
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

      await conversationService.saveUserMessage(threadId, messages[messages.length - 1]?.content || '')
      await conversationService.bringConversationToTop(threadId)
    }

    const stream = await chatService.processChat({
      messages,
      threadId,
      model,
      apiKey,
      fallbackModel,
      fallbackApiKey,
      webhooks: {
        discord: discordWebhook,
        slack: slackWebhook,
      },
      resumeText: typeof resumeText === 'string' ? resumeText.slice(0, 16000) : undefined,
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
    console.error('Chat API error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return new Response(JSON.stringify({
      error: error.message || 'Internal Server Error',
      details: error.toString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
