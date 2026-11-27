import { ConversationService } from './conversation.service'
import { prisma } from '@/lib/prisma'
import { getSystemPrompt } from '@/lib/prompt'
import { AppPermissionService } from './app-permission.service'
import { getProviderForModel } from '@/lib/models'

import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { StructuredTool } from '@langchain/core/tools'
import { TavilySearch } from "@langchain/tavily";
import {
    GmailCreateDraft,
    GmailGetMessage,
    GmailGetThread,
    GmailSearch,
} from "@langchain/community/tools/gmail";

import { GmailSendMessageTool } from '@/lib/gmail-tools'
import { GoogleCalendarCreateEvent, GoogleCalendarGetEvents, GoogleCalendarUpdateEvent, GoogleCalendarDeleteEvent } from '@/lib/calendar'
import { GoogleDocsCreateDocument, GoogleDocsReadDocument, GoogleDocsUpdateDocument, GoogleDocsFormatDocument, GoogleDocsSearchDocuments, GoogleDocsShareDocument, GoogleDocsDeleteDocument } from '@/lib/docs'
import {
    WebPageReaderTool,
    YouTubeTranscriptTool,
    GitHubInspectorTool,
    WebhookPushTool,
    ConfiguredWebhooks,
} from '@/lib/web-tools'
import { JobScraperTool } from '@/lib/job-tools'

interface ChatRequest {
    messages: { role: string; content: string }[]
    threadId: string
    model: string
    apiKey: string
    fallbackModel?: string
    fallbackApiKey?: string
    webhooks?: ConfiguredWebhooks
    resumeText?: string
    streamEvents?: boolean
    ephemeral?: boolean
}

interface ChatFetchRequest {
    threadId: string
    userId: string
}

function extractChunkText(chunk: any): string {
    if (!chunk) return ''
    if (typeof chunk.content === 'string') return chunk.content
    if (Array.isArray(chunk.content)) {
        return chunk.content
            .map((part: any) => (typeof part === 'string' ? part : part?.text || ''))
            .join('')
    }
    if (typeof chunk.text === 'string') return chunk.text
    return ''
}

function isFailoverEligibleError(err: any): boolean {
    const msg = String(err?.message || err || '').toLowerCase()
    const status = err?.status || err?.response?.status
    return (
        status === 429 ||
        status === 503 ||
        status === 502 ||
        msg.includes('429') ||
        msg.includes('rate limit') ||
        msg.includes('quota') ||
        msg.includes('resource exhausted') ||
        msg.includes('overloaded') ||
        msg.includes('timeout') ||
        msg.includes('service unavailable')
    )
}

export class ChatService {
    private conversationService = new ConversationService()
    private appPermissionService = new AppPermissionService()
    private user: {
        name: string
        email: string
        id: string
    }

    constructor(user: { name: string, email: string, id: string }) {
        this.user = user
    }

    private convertMessagesToLangChain(messages: { role: string; content: string }[]): BaseMessage[] {
        return messages.map((msg) => {
            switch (msg.role) {
                case 'user':
                    return new HumanMessage(msg.content);
                case 'assistant':
                    return new AIMessage(msg.content);
                case 'system':
                    return null;
                default:
                    throw new Error(`Unsupported message role: ${msg.role}`);
            }
        }).filter(Boolean) as BaseMessage[];
    }

    private async getToolsAndAccessConfig(webhooks?: ConfiguredWebhooks, resumeText?: string) {
        const [gmailAccessToken, calendarAccessToken, docsAccessToken] = await Promise.all([
            this.appPermissionService.getAppAccessToken(this.user.id, 'gmail'),
            this.appPermissionService.getAppAccessToken(this.user.id, 'calendar'),
            this.appPermissionService.getAppAccessToken(this.user.id, 'docs'),
        ])

        const tokenData = {
            credentials: {
                accessToken: gmailAccessToken as string
            },
        }

        const tools: StructuredTool[] = [
            new JobScraperTool(resumeText || ''),
            new WebPageReaderTool(),
            new YouTubeTranscriptTool(),
            new GitHubInspectorTool(),
        ]

        if (webhooks?.discord || webhooks?.slack) {
            tools.push(new WebhookPushTool(webhooks))
        }

        if (process.env.TAVILY_API_KEY) {
            try {
                tools.push(new TavilySearch({
                    maxResults: 5,
                    topic: "general"
                }))
            } catch (error) {
                console.error('Error initializing TavilySearch:', error)
            }
        }

        if (gmailAccessToken) {
            try {
                tools.push(
                    new GmailSendMessageTool(tokenData),
                    new GmailCreateDraft(tokenData),
                    new GmailGetMessage(tokenData),
                    new GmailGetThread(tokenData),
                    new GmailSearch(tokenData)
                )
            } catch (error) {
                console.error('Error initializing Gmail tools:', error)
            }
        }

        if (calendarAccessToken) {
            try {
                tools.push(
                    new GoogleCalendarCreateEvent(calendarAccessToken),
                    new GoogleCalendarGetEvents(calendarAccessToken),
                    new GoogleCalendarUpdateEvent(calendarAccessToken),
                    new GoogleCalendarDeleteEvent(calendarAccessToken)
                )
            } catch (error) {
                console.error('Error initializing Calendar tools:', error)
            }
        }

        if (docsAccessToken) {
            try {
                tools.push(
                    new GoogleDocsCreateDocument(docsAccessToken),
                    new GoogleDocsReadDocument(docsAccessToken),
                    new GoogleDocsUpdateDocument(docsAccessToken),
                    new GoogleDocsFormatDocument(docsAccessToken),
                    new GoogleDocsSearchDocuments(docsAccessToken),
                    new GoogleDocsShareDocument(docsAccessToken),
                    new GoogleDocsDeleteDocument(docsAccessToken)
                )
            } catch (error) {
                console.error('Error initializing Docs tools:', error)
            }
        }

        const accessConfig = {
            gmail: Boolean(gmailAccessToken),
            calendar: Boolean(calendarAccessToken),
            docs: Boolean(docsAccessToken),
            discordWebhook: Boolean(webhooks?.discord),
            slackWebhook: Boolean(webhooks?.slack),
        }

        const validTools = tools.filter(tool => Boolean(tool && typeof tool === 'object' && tool.name && tool.schema))
        return { tools: validTools, accessConfig };
    }

    private createLLM(model: string, apiKey: string) {
        const provider = getProviderForModel(model)
        const maxTokens = parseInt(process.env.MAX_OUTPUT_TOKENS || '2048', 10)

        if (provider === 'gemini') {
            return new ChatGoogleGenerativeAI({
                model,
                maxOutputTokens: maxTokens,
                apiKey,
            })
        }

        if (provider === 'nemotron') {
            return new ChatOpenAI({
                model,
                maxTokens,
                apiKey,
                streaming: true,
                configuration: {
                    baseURL: 'https://integrate.api.nvidia.com/v1',
                },
            })
        }

        return new ChatOpenAI({
            model,
            maxTokens,
            apiKey,
            streaming: true,
        })
    }

    private buildAgentGraph(
        model: string,
        apiKey: string,
        tools: StructuredTool[],
        accessConfig: Record<string, boolean>,
        resumeText?: string
    ) {
        const llm = this.createLLM(model, apiKey)
        const user = this.user
        const llmWithTools = tools.length > 0 ? llm.bindTools(tools) : llm

        async function llmCall(state: typeof MessagesAnnotation.State) {
            const result = await llmWithTools.invoke([
                {
                    role: "system",
                    content: getSystemPrompt(user.name, user.email, accessConfig, resumeText),
                },
                ...state.messages,
            ]);
            return { messages: [result] };
        }

        const toolNode = new ToolNode(tools);

        function shouldContinue(state: typeof MessagesAnnotation.State) {
            const lastMessage = state.messages.at(-1);
            if ((lastMessage as any)?.tool_calls?.length) {
                return "Action";
            }
            return "__end__";
        }

        return new StateGraph(MessagesAnnotation)
            .addNode("llmCall", llmCall)
            .addNode("tools", toolNode)
            .addEdge("__start__", "llmCall")
            .addConditionalEdges(
                "llmCall",
                shouldContinue,
                {
                    "Action": "tools",
                    "__end__": "__end__",
                }
            )
            .addEdge("tools", "llmCall")
            .compile();
    }

    async processChat(request: ChatRequest): Promise<ReadableStream> {
        const {
            messages,
            threadId,
            model,
            apiKey,
            fallbackModel,
            fallbackApiKey,
            webhooks,
            resumeText,
            streamEvents = false,
            ephemeral = false,
        } = request

        if (!apiKey) {
            throw new Error('API key is required')
        }

        const { tools, accessConfig } = await this.getToolsAndAccessConfig(webhooks, resumeText);
        const langChainMessages = this.convertMessagesToLangChain(messages);
        const encoder = new TextEncoder();

        const emitEvent = (
            controller: ReadableStreamDefaultController,
            payload: Record<string, unknown>
        ) => {
            if (streamEvents) {
                controller.enqueue(encoder.encode(JSON.stringify(payload) + '\n'));
            }
        };

        const runAgentStream = async (
            activeModel: string,
            activeKey: string,
            controller: ReadableStreamDefaultController
        ): Promise<string> => {
            const agent = this.buildAgentGraph(activeModel, activeKey, tools, accessConfig, resumeText);
            const eventStream = agent.streamEvents(
                { messages: langChainMessages },
                { version: "v1" },
            );

            let completeResponse = '';
            const toolStartTimes = new Map<string, number>();

            for await (const event of eventStream) {
                if (event.event === "on_tool_start") {
                    const toolName = event.name || 'tool';
                    const runKey = `${toolName}:${event.run_id || ''}`;
                    toolStartTimes.set(runKey, Date.now());
                    emitEvent(controller, { type: "tool_start", tool: toolName });
                } else if (event.event === "on_tool_end") {
                    const toolName = event.name || 'tool';
                    const runKey = `${toolName}:${event.run_id || ''}`;
                    const started = toolStartTimes.get(runKey);
                    const durationMs = started ? Date.now() - started : undefined;
                    emitEvent(controller, { type: "tool_end", tool: toolName, durationMs });
                } else if (event.event === "on_llm_stream" || event.event === "on_chat_model_stream") {
                    const token = extractChunkText(event.data?.chunk);
                    if (token) {
                        completeResponse += token;
                        if (streamEvents) {
                            emitEvent(controller, { type: "token", text: token });
                        } else {
                            controller.enqueue(encoder.encode(token));
                        }
                    }
                }
            }

            return completeResponse;
        };

        return new ReadableStream({
            start: async (controller) => {
                let completeResponse = '';
                try {
                    try {
                        completeResponse = await runAgentStream(model, apiKey, controller);
                    } catch (primaryErr: any) {
                        if (
                            fallbackModel &&
                            fallbackApiKey &&
                            fallbackModel !== model &&
                            isFailoverEligibleError(primaryErr)
                        ) {
                            console.warn(`Primary model ${model} failed, failing over to ${fallbackModel}:`, primaryErr?.message);
                            emitEvent(controller, {
                                type: "failover",
                                from: model,
                                to: fallbackModel,
                            });
                            if (!streamEvents) {
                                controller.enqueue(
                                    encoder.encode(`\n\n*[Auto-switched from ${model} to ${fallbackModel} due to rate limit]*\n\n`)
                                );
                            }
                            completeResponse = await runAgentStream(fallbackModel, fallbackApiKey, controller);
                        } else {
                            throw primaryErr;
                        }
                    }

                    if (completeResponse && !ephemeral) {
                        await this.conversationService.saveAssistantMessage(threadId, completeResponse)
                    }
                    controller.close()
                } catch (err: any) {
                    console.error("Streaming error:", err);
                    const errorMessage = `Error: ${err.message || 'Failed to generate response'}`;
                    if (streamEvents) {
                        emitEvent(controller, { type: "error", message: errorMessage });
                    } else {
                        controller.enqueue(encoder.encode(errorMessage));
                    }
                    controller.close();
                }
            }
        })
    }

    async getMessages(request: ChatFetchRequest) {
        const { threadId, userId } = request;

        const conversation = await prisma.conversation.findFirst({
            where: {
                threadId,
                userId,
                isDeleted: false,
                deletedAt: null,
            }
        })

        if (!conversation) {
            throw new Error('CONVERSATION_NOT_FOUND_OR_DELETED')
        }

        return await prisma.message.findMany({
            where: {
                threadId,
                isDeleted: false,
            },
            orderBy: {
                timestamp: 'asc'
            }
        })
    }
}
