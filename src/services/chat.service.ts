
import { ConversationService } from './conversation.service'
import { prisma } from '@/lib/prisma'
import { getSystemPrompt } from '@/lib/prompt'
import { AppPermissionService } from './app-permission.service'
import { WebBrowser } from "langchain/tools/webbrowser";

import { MessagesAnnotation } from "@langchain/langgraph";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { StateGraph } from "@langchain/langgraph";
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
import { createGitHubTools } from '@/lib/github-langchain-tools'
import { createNotionTools } from '@/lib/notion-langchain-tools'
import { createSpotifyTools } from '@/lib/spotify-langchain-tools'
import { createTwitterTools } from '@/lib/twitter-langchain-tools'

interface ChatRequest {
    messages: any[]
    threadId: string
    model: string
    apiKey: string
}

interface ChatFetchRequest {
    threadId: string
    userId: string
}

export class ChatService {
    private conversationService = new ConversationService()
    private appPermissionService = new AppPermissionService()
    private user: {
        name: string,
        email: string
        id: string
    }

    constructor(user: { name: string, email: string, id: string }) {
        this.user = user
    }


    private convertMessagesToLangChain(messages: any[]): BaseMessage[] {
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

    private async getToolsAndAccessConfig() {
        const gmailAccessToken = await this.appPermissionService.getAppAccessToken(this.user.id, 'gmail');
        const calendarAccessToken = await this.appPermissionService.getAppAccessToken(this.user.id, 'calendar');
        const docsAccessToken = await this.appPermissionService.getAppAccessToken(this.user.id, 'docs');
        const driveAccessToken = await this.appPermissionService.getAppAccessToken(this.user.id, 'drive');
        const githubAccessToken = await this.appPermissionService.getAppAccessToken(this.user.id, 'github');
        const notionAccessToken = await this.appPermissionService.getAppAccessToken(this.user.id, 'notion');
        const spotifyAccessToken = await this.appPermissionService.getAppAccessToken(this.user.id, 'spotify');
        const twitterAccessToken = await this.appPermissionService.getAppAccessToken(this.user.id, 'twitter');

        const tokenData = {
            credentials: {
                accessToken: gmailAccessToken as string
            },
        }

        const tools: StructuredTool[] = []

        // Add Tavily search if API key is available
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
                    new GoogleCalendarCreateEvent(calendarAccessToken as string),
                    new GoogleCalendarGetEvents(calendarAccessToken as string),
                    new GoogleCalendarUpdateEvent(calendarAccessToken as string),
                    new GoogleCalendarDeleteEvent(calendarAccessToken as string)
                )
            } catch (error) {
                console.error('Error initializing Calendar tools:', error)
            }
        }

        if (docsAccessToken) {
            try {
                tools.push(
                    new GoogleDocsCreateDocument(docsAccessToken as string),
                    new GoogleDocsReadDocument(docsAccessToken as string),
                    new GoogleDocsUpdateDocument(docsAccessToken as string),
                    new GoogleDocsFormatDocument(docsAccessToken as string),
                    new GoogleDocsSearchDocuments(docsAccessToken as string),
                    new GoogleDocsShareDocument(docsAccessToken as string),
                    new GoogleDocsDeleteDocument(docsAccessToken as string)
                )
            } catch (error) {
                console.error('Error initializing Docs tools:', error)
            }
        }

        if (driveAccessToken) {
            try {
                const { GoogleDriveListFiles, GoogleDriveSearchFiles, GoogleDriveGetFile, GoogleDriveCreateFolder, GoogleDriveUploadFile, GoogleDriveDeleteFile, GoogleDriveMoveFile, GoogleDriveRenameFile, GoogleDriveShareFile, GoogleDriveCopyFile, GoogleDriveGetStorageQuota } = await import('@/lib/drive-tools')
                tools.push(
                    new GoogleDriveListFiles(driveAccessToken as string),
                    new GoogleDriveSearchFiles(driveAccessToken as string),
                    new GoogleDriveGetFile(driveAccessToken as string),
                    new GoogleDriveCreateFolder(driveAccessToken as string),
                    new GoogleDriveUploadFile(driveAccessToken as string),
                    new GoogleDriveDeleteFile(driveAccessToken as string),
                    new GoogleDriveMoveFile(driveAccessToken as string),
                    new GoogleDriveRenameFile(driveAccessToken as string),
                    new GoogleDriveShareFile(driveAccessToken as string),
                    new GoogleDriveCopyFile(driveAccessToken as string),
                    new GoogleDriveGetStorageQuota(driveAccessToken as string)
                )
            } catch (error) {
                console.error('Error initializing Drive tools:', error)
            }
        }

        if (githubAccessToken) {
            try {
                const githubTools = createGitHubTools(githubAccessToken as string)
                tools.push(...githubTools)
            } catch (error) {
                console.error('Error initializing GitHub tools:', error)
            }
        }

        if (notionAccessToken) {
            try {
                const notionTools = createNotionTools(notionAccessToken as string)
                tools.push(...notionTools)
            } catch (error) {
                console.error('Error initializing Notion tools:', error)
            }
        }

        if (spotifyAccessToken) {
            try {
                const spotifyTools = createSpotifyTools({
                    accessToken: spotifyAccessToken as string,
                    userId: this.user.id
                })
                tools.push(...spotifyTools)
            } catch (error) {
                console.error('Error initializing Spotify tools:', error)
            }
        }

        if (twitterAccessToken) {
            try {
                const twitterMetadata = await this.appPermissionService.getAppMetadata(this.user.id, 'twitter')
                const twitterUserId = twitterMetadata?.twitterUserId || this.user.id
                
                const twitterTools = createTwitterTools({
                    bearerToken: twitterAccessToken as string,
                    userId: twitterUserId
                })
                tools.push(...twitterTools)
            } catch (error) {
                console.error('Error initializing Twitter tools:', error)
            }
        }

        const instagramAccessToken = await this.appPermissionService.getAppAccessToken(this.user.id, 'instagram');

        if (instagramAccessToken) {
            try {
                const instagramMetadata = await this.appPermissionService.getAppMetadata(this.user.id, 'instagram')
                const instagramAccountId = instagramMetadata?.instagramAccountId
                
                if (instagramAccountId) {
                    const { createInstagramTools } = await import('@/lib/instagram-langchain-tools')
                    const instagramTools = createInstagramTools({
                        accessToken: instagramAccessToken as string,
                        instagramAccountId
                    })
                    tools.push(...instagramTools)
                }
            } catch (error) {
                console.error('Error initializing Instagram tools:', error)
            }
        }

        const discordAccessToken = await this.appPermissionService.getAppAccessToken(this.user.id, 'discord');

        if (discordAccessToken) {
            try {
                const { createDiscordTools } = await import('@/lib/discord-langchain-tools')
                const discordTools = createDiscordTools({
                    botToken: discordAccessToken as string,
                    userId: this.user.id
                })
                tools.push(...discordTools)
            } catch (error) {
                console.error('Error initializing Discord tools:', error)
            }
        }

        const accessConfig = {
            gmail: gmailAccessToken ? true : false,
            calendar: calendarAccessToken ? true : false,
            docs: docsAccessToken ? true : false,
            drive: driveAccessToken ? true : false,
            github: githubAccessToken ? true : false,
            notion: notionAccessToken ? true : false,
            spotify: spotifyAccessToken ? true : false,
            twitter: twitterAccessToken ? true : false,
            instagram: instagramAccessToken ? true : false,
            discord: discordAccessToken ? true : false
        }

        // Filter out any undefined or invalid tools and validate schema
        const validTools = tools.filter(tool => {
            if (!tool || typeof tool !== 'object') {
                console.error('Invalid tool: not an object', tool)
                return false
            }
            if (!tool.name) {
                console.error('Invalid tool: missing name', tool)
                return false
            }
            if (!tool.schema || typeof tool.schema !== 'object') {
                console.error('Invalid tool: missing or invalid schema', tool.name)
                return false
            }
            return true
        })

        console.log(`Total tools: ${tools.length}, Valid tools: ${validTools.length}`)
        console.log('Tool names:', validTools.map(t => t.name))

        return { tools: validTools, accessConfig };


    }

    async processChat(request: ChatRequest): Promise<ReadableStream> {
        const { messages, threadId, model, apiKey } = request

        if (!apiKey) {
            throw new Error('API key is required')
        }

        console.log('Processing chat with model:', model)
        console.log('API key provided:', apiKey ? 'Yes' : 'No')

        const gemini = new ChatGoogleGenerativeAI({
            model,
            maxOutputTokens: parseInt(process.env.MAX_OUTPUT_TOKENS || '2048'),
            apiKey
        })

        const openai = new ChatOpenAI({
            model,
            maxTokens: parseInt(process.env.MAX_OUTPUT_TOKENS || '2048'),
            apiKey,
            streaming: true
        })

        const llm = model.includes('gemini') ? gemini : openai;
        console.log('Using LLM:', model.includes('gemini') ? 'Gemini' : 'OpenAI')

        const { tools, accessConfig } = await this.getToolsAndAccessConfig();

        const user = this.user

        // Validate each tool's schema structure
        console.log('Validating tool schemas...')
        console.log('Model being used:', model)
        for (const tool of tools) {
            try {
                if (!tool.schema || !tool.schema._def) {
                    console.error(`Tool ${tool.name} has invalid schema structure:`, tool.schema)
                }
            } catch (error) {
                console.error(`Error validating tool ${tool.name}:`, error)
            }
        }

        let llmWithTools;
        try {
            // Try binding tools - if it fails, continue without tools
            console.log('Attempting to bind tools to LLM...')
            
            // Check if this is Gemini or OpenAI
            if (model.includes('gemini')) {
                console.log('Using Gemini model - attempting tool binding')
                // Gemini might have issues with certain tool formats
                // Try with a subset first to identify the problematic tool
                llmWithTools = llm.bindTools(tools);
            } else {
                console.log('Using OpenAI model - attempting tool binding')
                llmWithTools = llm.bindTools(tools);
            }
            console.log('Successfully bound tools to LLM')
        } catch (error: any) {
            console.error('Error binding tools to LLM:', error)
            console.error('Error stack:', error.stack)
            console.error('Model:', model)
            console.error('LLM type:', llm.constructor.name)
            console.error('Number of tools:', tools.length)
            
            // Try to identify which tool is causing the issue
            console.log('Testing tools individually...')
            for (let i = 0; i < tools.length; i++) {
                try {
                    const testLlm = model.includes('gemini') ? 
                        new ChatGoogleGenerativeAI({ model, maxOutputTokens: 2048, apiKey }) :
                        new ChatOpenAI({ model, maxTokens: 2048, apiKey });
                    testLlm.bindTools([tools[i]]);
                    console.log(`✓ Tool ${i}: ${tools[i].name} - OK`)
                } catch (e) {
                    console.error(`✗ Tool ${i}: ${tools[i].name} - FAILED`, e)
                }
            }
            
            throw error
        }


        async function llmCall(state: typeof MessagesAnnotation.State) {
            const result = await llmWithTools.invoke([
                {
                    role: "system",
                    content: getSystemPrompt(user.name, user.email, accessConfig),
                },
                ...state.messages,
            ]);
            return { messages: [result] };
        }

        const toolNode = new ToolNode(tools);

        function shouldContinue(state: typeof MessagesAnnotation.State) {
            const messages = state.messages;
            const lastMessage = messages.at(-1);

            if ((lastMessage as any)?.tool_calls?.length) {
                return "Action";
            }
            return "__end__";
        }

        const agentBuilder = new StateGraph(MessagesAnnotation)
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

        const langChainMessages = this.convertMessagesToLangChain(messages);

        return new ReadableStream({
            start: async (controller) => {
                try {
                    const eventStream = agentBuilder.streamEvents(
                        { messages: langChainMessages },
                        { version: "v1" },
                    );

                    let completeResponse = ''
                    for await (const event of eventStream) {
                        if (event.event === "on_llm_stream") {
                            // Handle both Gemini and OpenAI token formats
                            const token = event.data?.chunk?.content || event.data?.chunk?.text || '';
                            if (token) {
                                controller.enqueue(new TextEncoder().encode(token));
                                completeResponse += token;
                            }
                        }
                    }

                    await this.conversationService.saveAssistantMessage(threadId, completeResponse)
                    controller.close()
                } catch (err: any) {
                    console.error("Streaming error:", err);
                    console.error("Error details:", {
                        message: err.message,
                        stack: err.stack,
                        name: err.name
                    });
                    const errorMessage = `Error: ${err.message || 'Failed to generate response'}`;
                    controller.enqueue(new TextEncoder().encode(errorMessage));
                    controller.close();
                }
            }
        })
    }

    async getMessages(request: ChatFetchRequest) {
        const { threadId, userId } = request;

        const conversation = await prisma.conversation.findFirst({
            where: ({
                threadId,
                userId,
                isDeleted: false,
                deletedAt: null,
            } as any)
        })

        if (!conversation) {
            throw new Error('CONVERSATION_NOT_FOUND_OR_DELETED')
        }

        const conversationAny: any = conversation as any
        if (conversationAny?.isDeleted || conversationAny?.deletedAt) {
            throw new Error('CONVERSATION_NOT_FOUND_OR_DELETED')
        }

        return await prisma.message.findMany({
            where: {
                threadId,
            }
        })
    }
}