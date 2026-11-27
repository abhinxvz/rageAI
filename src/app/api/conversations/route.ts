import { authOptions } from "@/lib/auth"
import { ConversationService } from "@/services/conversation.service"
import { getServerSession } from "next-auth"
import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return new Response('Unauthorized', { status: 401 })
    }

    const conversationService = new ConversationService()
    const q = req.nextUrl.searchParams.get('q') ?? undefined

    const conversation = await conversationService.getUserConversations(
      session.userId as string,
      q
    )

    return Response.json(conversation, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error: any) {
    console.error('Conversations API error:', {
      message: error?.message,
      name: error?.name
    })
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}