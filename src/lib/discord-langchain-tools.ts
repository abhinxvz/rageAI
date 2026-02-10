import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"

/**
 * Discord Bot API LangChain Tools
 * 
 * These tools enable AI to interact with Discord API for:
 * - Sending messages to channels
 * - Managing servers (guilds)
 * - Creating and managing channels
 * - Managing roles and permissions
 * - Reading messages and interactions
 */

interface DiscordToolsConfig {
    botToken: string
    userId: string
}

export function createDiscordTools(config: DiscordToolsConfig) {
    const { botToken } = config

    const discordFetch = async (endpoint: string, options: RequestInit = {}) => {
        const url = endpoint.startsWith('http') 
            ? endpoint 
            : `https://discord.com/api/v10${endpoint}`
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bot ${botToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: response.statusText }))
            throw new Error(`Discord API error: ${error.message || response.statusText}`)
        }

        // Handle 204 No Content responses
        if (response.status === 204) {
            return { success: true }
        }

        return response.json()
    }

    return [
        // Get bot user info
        new DynamicStructuredTool({
            name: 'discord_get_bot_info',
            description: 'Get information about the Discord bot including username, ID, and avatar.',
            schema: z.object({}),
            func: async () => {
                const data = await discordFetch('/users/@me')

                return JSON.stringify({
                    id: data.id,
                    username: data.username,
                    discriminator: data.discriminator,
                    bot: data.bot,
                    avatar: data.avatar
                })
            }
        }),

        // Get guilds (servers) the bot is in
        new DynamicStructuredTool({
            name: 'discord_get_guilds',
            description: 'Get list of Discord servers (guilds) the bot is a member of.',
            schema: z.object({}),
            func: async () => {
                const data = await discordFetch('/users/@me/guilds')

                return JSON.stringify({
                    guilds: data.map((guild: any) => ({
                        id: guild.id,
                        name: guild.name,
                        icon: guild.icon,
                        owner: guild.owner,
                        permissions: guild.permissions
                    }))
                })
            }
        }),

        // Get channels in a guild
        new DynamicStructuredTool({
            name: 'discord_get_channels',
            description: 'Get list of channels in a Discord server (guild).',
            schema: z.object({
                guild_id: z.string().describe('ID of the Discord server')
            }),
            func: async ({ guild_id }) => {
                const data = await discordFetch(`/guilds/${guild_id}/channels`)

                return JSON.stringify({
                    channels: data.map((channel: any) => ({
                        id: channel.id,
                        name: channel.name,
                        type: channel.type,
                        position: channel.position,
                        parent_id: channel.parent_id
                    }))
                })
            }
        }),

        // Send message to channel
        new DynamicStructuredTool({
            name: 'discord_send_message',
            description: 'Send a message to a Discord channel. Use this to post messages, announcements, or replies.',
            schema: z.object({
                channel_id: z.string().describe('ID of the channel to send message to'),
                content: z.string().max(2000).describe('Message content (max 2000 characters)'),
                tts: z.boolean().optional().describe('Whether message should be text-to-speech')
            }),
            func: async ({ channel_id, content, tts }) => {
                const data = await discordFetch(`/channels/${channel_id}/messages`, {
                    method: 'POST',
                    body: JSON.stringify({
                        content,
                        tts: tts || false
                    })
                })

                return JSON.stringify({
                    message: 'Message sent successfully!',
                    message_id: data.id,
                    channel_id: data.channel_id,
                    timestamp: data.timestamp
                })
            }
        }),

        // Send embed message
        new DynamicStructuredTool({
            name: 'discord_send_embed',
            description: 'Send a rich embed message to a Discord channel with title, description, color, and fields.',
            schema: z.object({
                channel_id: z.string().describe('ID of the channel'),
                title: z.string().optional().describe('Embed title'),
                description: z.string().optional().describe('Embed description'),
                color: z.number().optional().describe('Embed color as decimal (e.g., 0x1072f8 = 1077496)'),
                fields: z.array(z.object({
                    name: z.string(),
                    value: z.string(),
                    inline: z.boolean().optional()
                })).optional().describe('Array of embed fields')
            }),
            func: async ({ channel_id, title, description, color, fields }) => {
                const embed: any = {}
                if (title) embed.title = title
                if (description) embed.description = description
                if (color) embed.color = color
                if (fields) embed.fields = fields

                const data = await discordFetch(`/channels/${channel_id}/messages`, {
                    method: 'POST',
                    body: JSON.stringify({ embeds: [embed] })
                })

                return JSON.stringify({
                    message: 'Embed sent successfully!',
                    message_id: data.id
                })
            }
        }),

        // Get messages from channel
        new DynamicStructuredTool({
            name: 'discord_get_messages',
            description: 'Get recent messages from a Discord channel.',
            schema: z.object({
                channel_id: z.string().describe('ID of the channel'),
                limit: z.number().min(1).max(100).default(50).describe('Number of messages to retrieve (max 100)')
            }),
            func: async ({ channel_id, limit }) => {
                const data = await discordFetch(`/channels/${channel_id}/messages?limit=${limit}`)

                return JSON.stringify({
                    messages: data.map((msg: any) => ({
                        id: msg.id,
                        content: msg.content,
                        author: {
                            id: msg.author.id,
                            username: msg.author.username,
                            bot: msg.author.bot
                        },
                        timestamp: msg.timestamp,
                        edited_timestamp: msg.edited_timestamp,
                        mentions: msg.mentions?.map((u: any) => u.username),
                        attachments: msg.attachments?.map((a: any) => a.url)
                    }))
                })
            }
        }),

        // Delete message
        new DynamicStructuredTool({
            name: 'discord_delete_message',
            description: 'Delete a message from a Discord channel. Bot must have permissions.',
            schema: z.object({
                channel_id: z.string().describe('ID of the channel'),
                message_id: z.string().describe('ID of the message to delete')
            }),
            func: async ({ channel_id, message_id }) => {
                await discordFetch(`/channels/${channel_id}/messages/${message_id}`, {
                    method: 'DELETE'
                })

                return JSON.stringify({
                    message: 'Message deleted successfully!',
                    message_id
                })
            }
        }),

        // Create channel
        new DynamicStructuredTool({
            name: 'discord_create_channel',
            description: 'Create a new channel in a Discord server.',
            schema: z.object({
                guild_id: z.string().describe('ID of the Discord server'),
                name: z.string().describe('Channel name'),
                type: z.number().optional().describe('Channel type (0=text, 2=voice, 4=category)'),
                topic: z.string().optional().describe('Channel topic/description')
            }),
            func: async ({ guild_id, name, type, topic }) => {
                const data = await discordFetch(`/guilds/${guild_id}/channels`, {
                    method: 'POST',
                    body: JSON.stringify({
                        name,
                        type: type || 0,
                        topic
                    })
                })

                return JSON.stringify({
                    message: 'Channel created successfully!',
                    channel_id: data.id,
                    name: data.name
                })
            }
        }),

        // Delete channel
        new DynamicStructuredTool({
            name: 'discord_delete_channel',
            description: 'Delete a channel from a Discord server. Use with caution!',
            schema: z.object({
                channel_id: z.string().describe('ID of the channel to delete')
            }),
            func: async ({ channel_id }) => {
                await discordFetch(`/channels/${channel_id}`, {
                    method: 'DELETE'
                })

                return JSON.stringify({
                    message: 'Channel deleted successfully!',
                    channel_id
                })
            }
        }),

        // Get guild members
        new DynamicStructuredTool({
            name: 'discord_get_members',
            description: 'Get list of members in a Discord server.',
            schema: z.object({
                guild_id: z.string().describe('ID of the Discord server'),
                limit: z.number().min(1).max(1000).default(100).describe('Number of members to retrieve')
            }),
            func: async ({ guild_id, limit }) => {
                const data = await discordFetch(`/guilds/${guild_id}/members?limit=${limit}`)

                return JSON.stringify({
                    members: data.map((member: any) => ({
                        user_id: member.user.id,
                        username: member.user.username,
                        nickname: member.nick,
                        roles: member.roles,
                        joined_at: member.joined_at
                    }))
                })
            }
        }),

        // Get guild roles
        new DynamicStructuredTool({
            name: 'discord_get_roles',
            description: 'Get list of roles in a Discord server.',
            schema: z.object({
                guild_id: z.string().describe('ID of the Discord server')
            }),
            func: async ({ guild_id }) => {
                const data = await discordFetch(`/guilds/${guild_id}/roles`)

                return JSON.stringify({
                    roles: data.map((role: any) => ({
                        id: role.id,
                        name: role.name,
                        color: role.color,
                        position: role.position,
                        permissions: role.permissions,
                        mentionable: role.mentionable
                    }))
                })
            }
        }),

        // Create role
        new DynamicStructuredTool({
            name: 'discord_create_role',
            description: 'Create a new role in a Discord server.',
            schema: z.object({
                guild_id: z.string().describe('ID of the Discord server'),
                name: z.string().describe('Role name'),
                color: z.number().optional().describe('Role color as decimal'),
                mentionable: z.boolean().optional().describe('Whether role can be mentioned')
            }),
            func: async ({ guild_id, name, color, mentionable }) => {
                const data = await discordFetch(`/guilds/${guild_id}/roles`, {
                    method: 'POST',
                    body: JSON.stringify({
                        name,
                        color,
                        mentionable
                    })
                })

                return JSON.stringify({
                    message: 'Role created successfully!',
                    role_id: data.id,
                    name: data.name
                })
            }
        }),

        // Add role to member
        new DynamicStructuredTool({
            name: 'discord_add_role',
            description: 'Add a role to a Discord server member.',
            schema: z.object({
                guild_id: z.string().describe('ID of the Discord server'),
                user_id: z.string().describe('ID of the user'),
                role_id: z.string().describe('ID of the role to add')
            }),
            func: async ({ guild_id, user_id, role_id }) => {
                await discordFetch(`/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, {
                    method: 'PUT'
                })

                return JSON.stringify({
                    message: 'Role added to member successfully!',
                    user_id,
                    role_id
                })
            }
        }),

        // Remove role from member
        new DynamicStructuredTool({
            name: 'discord_remove_role',
            description: 'Remove a role from a Discord server member.',
            schema: z.object({
                guild_id: z.string().describe('ID of the Discord server'),
                user_id: z.string().describe('ID of the user'),
                role_id: z.string().describe('ID of the role to remove')
            }),
            func: async ({ guild_id, user_id, role_id }) => {
                await discordFetch(`/guilds/${guild_id}/members/${user_id}/roles/${role_id}`, {
                    method: 'DELETE'
                })

                return JSON.stringify({
                    message: 'Role removed from member successfully!',
                    user_id,
                    role_id
                })
            }
        }),

        // Add reaction to message
        new DynamicStructuredTool({
            name: 'discord_add_reaction',
            description: 'Add an emoji reaction to a message.',
            schema: z.object({
                channel_id: z.string().describe('ID of the channel'),
                message_id: z.string().describe('ID of the message'),
                emoji: z.string().describe('Emoji to react with (e.g., "👍" or "custom_emoji:123456")')
            }),
            func: async ({ channel_id, message_id, emoji }) => {
                const encodedEmoji = encodeURIComponent(emoji)
                await discordFetch(`/channels/${channel_id}/messages/${message_id}/reactions/${encodedEmoji}/@me`, {
                    method: 'PUT'
                })

                return JSON.stringify({
                    message: 'Reaction added successfully!',
                    emoji
                })
            }
        }),

        // Pin message
        new DynamicStructuredTool({
            name: 'discord_pin_message',
            description: 'Pin a message in a Discord channel.',
            schema: z.object({
                channel_id: z.string().describe('ID of the channel'),
                message_id: z.string().describe('ID of the message to pin')
            }),
            func: async ({ channel_id, message_id }) => {
                await discordFetch(`/channels/${channel_id}/pins/${message_id}`, {
                    method: 'PUT'
                })

                return JSON.stringify({
                    message: 'Message pinned successfully!',
                    message_id
                })
            }
        }),

        // Unpin message
        new DynamicStructuredTool({
            name: 'discord_unpin_message',
            description: 'Unpin a message in a Discord channel.',
            schema: z.object({
                channel_id: z.string().describe('ID of the channel'),
                message_id: z.string().describe('ID of the message to unpin')
            }),
            func: async ({ channel_id, message_id }) => {
                await discordFetch(`/channels/${channel_id}/pins/${message_id}`, {
                    method: 'DELETE'
                })

                return JSON.stringify({
                    message: 'Message unpinned successfully!',
                    message_id
                })
            }
        })
    ]
}
