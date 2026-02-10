import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"

/**
 * Twitter/X LangChain Tools
 * 
 * These tools enable AI to interact with Twitter API v2 for:
 * - Posting tweets
 * - Reading timeline and mentions
 * - Searching tweets
 * - Managing interactions (likes, retweets)
 * - Following/unfollowing users
 */

interface TwitterToolsConfig {
    bearerToken: string
    userId: string
}

export function createTwitterTools(config: TwitterToolsConfig) {
    const { bearerToken } = config

    const twitterFetch = async (endpoint: string, options: RequestInit = {}) => {
        const response = await fetch(`https://api.twitter.com/2${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(`Twitter API error: ${error.detail || error.title || response.statusText}`)
        }

        return response.json()
    }

    return [
        // Post a tweet
        new DynamicStructuredTool({
            name: 'twitter_post_tweet',
            description: 'Post a new tweet to Twitter. Use this to share updates, thoughts, or content. Max 280 characters.',
            schema: z.object({
                text: z.string().max(280).describe('Tweet text content (max 280 characters)'),
                reply_to_tweet_id: z.string().optional().describe('Tweet ID to reply to (optional)')
            }),
            func: async ({ text, reply_to_tweet_id }) => {
                const body: any = { text }
                if (reply_to_tweet_id) {
                    body.reply = { in_reply_to_tweet_id: reply_to_tweet_id }
                }

                const data = await twitterFetch('/tweets', {
                    method: 'POST',
                    body: JSON.stringify(body)
                })

                return JSON.stringify({
                    tweet_id: data.data.id,
                    text: data.data.text,
                    message: 'Tweet posted successfully!'
                })
            }
        }),

        // Get user's timeline
        new DynamicStructuredTool({
            name: 'twitter_get_timeline',
            description: 'Get tweets from user\'s home timeline. Shows tweets from accounts they follow.',
            schema: z.object({
                max_results: z.number().min(5).max(100).default(10).describe('Number of tweets to retrieve')
            }),
            func: async ({ max_results }) => {
                const data = await twitterFetch(`/users/${config.userId}/timelines/reverse_chronological?max_results=${max_results}&tweet.fields=created_at,public_metrics,author_id`)

                return JSON.stringify({
                    tweets: data.data?.map((tweet: any) => ({
                        id: tweet.id,
                        text: tweet.text,
                        created_at: tweet.created_at,
                        likes: tweet.public_metrics?.like_count,
                        retweets: tweet.public_metrics?.retweet_count
                    })) || []
                })
            }
        }),

        // Get user's mentions
        new DynamicStructuredTool({
            name: 'twitter_get_mentions',
            description: 'Get tweets that mention the user. Useful for seeing replies and interactions.',
            schema: z.object({
                max_results: z.number().min(5).max(100).default(10).describe('Number of mentions to retrieve')
            }),
            func: async ({ max_results }) => {
                const data = await twitterFetch(`/users/${config.userId}/mentions?max_results=${max_results}&tweet.fields=created_at,public_metrics,author_id`)

                return JSON.stringify({
                    mentions: data.data?.map((tweet: any) => ({
                        id: tweet.id,
                        text: tweet.text,
                        author_id: tweet.author_id,
                        created_at: tweet.created_at
                    })) || []
                })
            }
        }),

        // Get user's tweets
        new DynamicStructuredTool({
            name: 'twitter_get_user_tweets',
            description: 'Get tweets posted by the user. Shows their tweet history.',
            schema: z.object({
                max_results: z.number().min(5).max(100).default(10).describe('Number of tweets to retrieve')
            }),
            func: async ({ max_results }) => {
                const data = await twitterFetch(`/users/${config.userId}/tweets?max_results=${max_results}&tweet.fields=created_at,public_metrics`)

                return JSON.stringify({
                    tweets: data.data?.map((tweet: any) => ({
                        id: tweet.id,
                        text: tweet.text,
                        created_at: tweet.created_at,
                        likes: tweet.public_metrics?.like_count,
                        retweets: tweet.public_metrics?.retweet_count,
                        replies: tweet.public_metrics?.reply_count
                    })) || []
                })
            }
        }),

        // Search tweets
        new DynamicStructuredTool({
            name: 'twitter_search_tweets',
            description: 'Search for tweets using keywords or hashtags. Great for finding relevant content or monitoring topics.',
            schema: z.object({
                query: z.string().describe('Search query (keywords, hashtags, or Twitter search operators)'),
                max_results: z.number().min(10).max(100).default(10).describe('Number of results')
            }),
            func: async ({ query, max_results }) => {
                const data = await twitterFetch(`/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${max_results}&tweet.fields=created_at,public_metrics,author_id`)

                return JSON.stringify({
                    tweets: data.data?.map((tweet: any) => ({
                        id: tweet.id,
                        text: tweet.text,
                        author_id: tweet.author_id,
                        created_at: tweet.created_at,
                        likes: tweet.public_metrics?.like_count,
                        retweets: tweet.public_metrics?.retweet_count
                    })) || []
                })
            }
        }),

        // Like a tweet
        new DynamicStructuredTool({
            name: 'twitter_like_tweet',
            description: 'Like a tweet. Use the tweet ID from search or timeline results.',
            schema: z.object({
                tweet_id: z.string().describe('ID of the tweet to like')
            }),
            func: async ({ tweet_id }) => {
                await twitterFetch(`/users/${config.userId}/likes`, {
                    method: 'POST',
                    body: JSON.stringify({ tweet_id })
                })

                return JSON.stringify({
                    message: 'Tweet liked successfully!',
                    tweet_id
                })
            }
        }),

        // Unlike a tweet
        new DynamicStructuredTool({
            name: 'twitter_unlike_tweet',
            description: 'Remove like from a tweet.',
            schema: z.object({
                tweet_id: z.string().describe('ID of the tweet to unlike')
            }),
            func: async ({ tweet_id }) => {
                await twitterFetch(`/users/${config.userId}/likes/${tweet_id}`, {
                    method: 'DELETE'
                })

                return JSON.stringify({
                    message: 'Tweet unliked successfully!',
                    tweet_id
                })
            }
        }),

        // Retweet
        new DynamicStructuredTool({
            name: 'twitter_retweet',
            description: 'Retweet a tweet to share it with your followers.',
            schema: z.object({
                tweet_id: z.string().describe('ID of the tweet to retweet')
            }),
            func: async ({ tweet_id }) => {
                await twitterFetch(`/users/${config.userId}/retweets`, {
                    method: 'POST',
                    body: JSON.stringify({ tweet_id })
                })

                return JSON.stringify({
                    message: 'Tweet retweeted successfully!',
                    tweet_id
                })
            }
        }),

        // Delete retweet
        new DynamicStructuredTool({
            name: 'twitter_unretweet',
            description: 'Remove a retweet.',
            schema: z.object({
                tweet_id: z.string().describe('ID of the tweet to unretweet')
            }),
            func: async ({ tweet_id }) => {
                await twitterFetch(`/users/${config.userId}/retweets/${tweet_id}`, {
                    method: 'DELETE'
                })

                return JSON.stringify({
                    message: 'Retweet removed successfully!',
                    tweet_id
                })
            }
        }),

        // Delete tweet
        new DynamicStructuredTool({
            name: 'twitter_delete_tweet',
            description: 'Delete one of user\'s tweets. Use with caution - this is permanent!',
            schema: z.object({
                tweet_id: z.string().describe('ID of the tweet to delete')
            }),
            func: async ({ tweet_id }) => {
                await twitterFetch(`/tweets/${tweet_id}`, {
                    method: 'DELETE'
                })

                return JSON.stringify({
                    message: 'Tweet deleted successfully!',
                    tweet_id
                })
            }
        }),

        // Get user info
        new DynamicStructuredTool({
            name: 'twitter_get_user_info',
            description: 'Get information about a Twitter user by username.',
            schema: z.object({
                username: z.string().describe('Twitter username (without @)')
            }),
            func: async ({ username }) => {
                const data = await twitterFetch(`/users/by/username/${username}?user.fields=created_at,description,public_metrics,verified`)

                return JSON.stringify({
                    id: data.data.id,
                    username: data.data.username,
                    name: data.data.name,
                    description: data.data.description,
                    followers: data.data.public_metrics?.followers_count,
                    following: data.data.public_metrics?.following_count,
                    verified: data.data.verified,
                    created_at: data.data.created_at
                })
            }
        }),

        // Follow user
        new DynamicStructuredTool({
            name: 'twitter_follow_user',
            description: 'Follow a Twitter user.',
            schema: z.object({
                target_user_id: z.string().describe('ID of the user to follow')
            }),
            func: async ({ target_user_id }) => {
                await twitterFetch(`/users/${config.userId}/following`, {
                    method: 'POST',
                    body: JSON.stringify({ target_user_id })
                })

                return JSON.stringify({
                    message: 'User followed successfully!',
                    user_id: target_user_id
                })
            }
        }),

        // Unfollow user
        new DynamicStructuredTool({
            name: 'twitter_unfollow_user',
            description: 'Unfollow a Twitter user.',
            schema: z.object({
                target_user_id: z.string().describe('ID of the user to unfollow')
            }),
            func: async ({ target_user_id }) => {
                await twitterFetch(`/users/${config.userId}/following/${target_user_id}`, {
                    method: 'DELETE'
                })

                return JSON.stringify({
                    message: 'User unfollowed successfully!',
                    user_id: target_user_id
                })
            }
        })
    ]
}
