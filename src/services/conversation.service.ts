import { prisma } from '@/lib/prisma'
import { config } from '@/lib/config'

export class ConversationService {
    async ensureConversation(threadId: string, userId: string, messages: { role: string; content: string }[], model: string, apiKey: string) {
        let conversation = await prisma.conversation.findUnique({
            where: { threadId }
        })

        const title = conversation?.title || await this._generateTitle(messages[messages.length - 1]?.content || 'New Chat', model, apiKey)

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: { threadId, title: title.slice(0, 120), userId }
            })
        } else if (conversation.userId !== userId) {
            const error = new Error('FORBIDDEN')
            ;(error as any).code = 'FORBIDDEN'
            throw error
        }

        if (conversation.isDeleted || conversation.deletedAt) {
            const error = new Error('CONVERSATION_DELETED')
            ;(error as any).code = 'DELETED'
            throw error
        }

        if (!conversation.title && title) {
            await prisma.conversation.update({
                where: { threadId },
                data: { title: title.slice(0, 120) }
            })
        }

        return conversation
    }

    async checkMessageLimit(threadId: string): Promise<Response | null> {
        const existingUserMessages = await prisma.message.count({
            where: { threadId, role: 'user', isDeleted: false }
        })

        if (existingUserMessages >= config.maxUserMessagesPerChat) {
            const limitMessage = `You have reached the maximum limit of ${config.maxUserMessagesPerChat} messages in this chat. Please start a new conversation to continue.`

            await this.saveAssistantMessage(threadId, limitMessage)
            return new Response(limitMessage, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            })
        }

        return null
    }

    async verifyEphemeralAccess(threadId: string, userId: string): Promise<'allowed' | 'forbidden' | 'deleted' | 'limit'> {
        const conversation = await prisma.conversation.findUnique({
            where: { threadId },
            select: { userId: true, isDeleted: true, deletedAt: true }
        })

        if (!conversation) {
            return 'allowed'
        }
        if (conversation.userId !== userId) {
            return 'forbidden'
        }
        if (conversation.isDeleted || conversation.deletedAt) {
            return 'deleted'
        }

        const existingUserMessages = await prisma.message.count({
            where: { threadId, role: 'user', isDeleted: false }
        })
        if (existingUserMessages > config.maxUserMessagesPerChat) {
            return 'limit'
        }

        return 'allowed'
    }

    async getAuthoritativeHistory(threadId: string, userId: string): Promise<{ role: string; content: string }[]> {
        const conversation = await prisma.conversation.findFirst({
            where: {
                threadId,
                userId,
                isDeleted: false,
                deletedAt: null,
            },
            select: { threadId: true }
        })

        if (!conversation) {
            return []
        }

        const dbMessages = await prisma.message.findMany({
            where: {
                threadId,
                isDeleted: false,
            },
            orderBy: { timestamp: 'asc' },
            take: 60,
            select: { role: true, content: true }
        })

        return dbMessages.filter((m) => m.role === 'user' || m.role === 'assistant')
    }

    async saveUserMessage(threadId: string, content: string) {
        await prisma.message.create({
            data: {
                threadId,
                content,
                role: 'user',
                timestamp: new Date().toISOString()
            }
        })
    }

    async saveAssistantMessage(threadId: string, content: string) {
        await prisma.message.create({
            data: {
                threadId,
                content,
                role: 'assistant',
                timestamp: new Date().toISOString()
            }
        })
    }

    private async _generateTitle(firstMessage: string, _model: string, _apiKey: string): Promise<string> {
        return firstMessage
    }

    async getUserConversations(userId: string, search?: string) {
        const cleanSearch = search?.trim().slice(0, 100) || undefined
        const conversations = await prisma.conversation.findMany({
            where: {
                userId,
                isDeleted: false,
                ...(cleanSearch ? { title: { contains: cleanSearch, mode: 'insensitive' } } : {})
            },
            orderBy: { updatedAt: 'desc' },
            take: 50,
            select: {
                threadId: true,
                title: true,
                createdAt: true,
                updatedAt: true,
                _count: { select: { messages: true } },
            },
        })

        return conversations.map((conv: any) => ({
            threadId: conv.threadId ?? "",
            title: conv.title || "Untitled Chat",
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
            messagesCount: conv._count.messages,
        }))
    }

    async softDeleteConversation(userId: string, threadId: string) {
        const existing = await prisma.conversation.findFirst({
            where: { userId, threadId }
        })

        if (!existing) {
            const error = new Error('Conversation not found')
            ;(error as any).code = 'NOT_FOUND'
            throw error
        }

        await prisma.conversation.update({
            where: { threadId },
            data: { isDeleted: true, deletedAt: new Date() }
        })

        return { success: true }
    }

    async bringConversationToTop(threadId: string) {
        await prisma.conversation.update({
            where: { threadId },
            data: { updatedAt: new Date() }
        })
    }
}
