import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"

/**
 * Instagram Graph API LangChain Tools
 * 
 * These tools enable AI to interact with Instagram API for:
 * - Publishing posts (photos, videos, carousels)
 * - Managing stories
 * - Reading insights and analytics
 * - Managing comments
 * - Getting user media
 */

interface InstagramToolsConfig {
    accessToken: string
    instagramAccountId: string
}

export function createInstagramTools(config: InstagramToolsConfig) {
    const { accessToken, instagramAccountId } = config

    const instagramFetch = async (endpoint: string, options: RequestInit = {}) => {
        const url = endpoint.startsWith('http') 
            ? endpoint 
            : `https://graph.facebook.com/v18.0${endpoint}`
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(`Instagram API error: ${error.error?.message || response.statusText}`)
        }

        return response.json()
    }

    return [
        // Get user profile info
        new DynamicStructuredTool({
            name: 'instagram_get_profile',
            description: 'Get Instagram account profile information including username, followers count, media count, and biography.',
            schema: z.object({}),
            func: async () => {
                const data = await instagramFetch(
                    `/${instagramAccountId}?fields=username,name,biography,followers_count,follows_count,media_count,profile_picture_url&access_token=${accessToken}`
                )

                return JSON.stringify({
                    username: data.username,
                    name: data.name,
                    biography: data.biography,
                    followers: data.followers_count,
                    following: data.follows_count,
                    posts: data.media_count,
                    profile_picture: data.profile_picture_url
                })
            }
        }),

        // Get user's media posts
        new DynamicStructuredTool({
            name: 'instagram_get_media',
            description: 'Get user\'s Instagram posts/media. Returns recent posts with captions, likes, comments, and media URLs.',
            schema: z.object({
                limit: z.number().min(1).max(25).default(10).describe('Number of posts to retrieve (max 25)')
            }),
            func: async ({ limit }) => {
                const data = await instagramFetch(
                    `/${instagramAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`
                )

                return JSON.stringify({
                    posts: data.data?.map((post: any) => ({
                        id: post.id,
                        caption: post.caption,
                        type: post.media_type,
                        url: post.media_url,
                        thumbnail: post.thumbnail_url,
                        permalink: post.permalink,
                        timestamp: post.timestamp,
                        likes: post.like_count,
                        comments: post.comments_count
                    })) || []
                })
            }
        }),

        // Create image post
        new DynamicStructuredTool({
            name: 'instagram_create_image_post',
            description: 'Create and publish an Instagram image post. Requires a publicly accessible image URL.',
            schema: z.object({
                image_url: z.string().url().describe('Public URL of the image to post'),
                caption: z.string().max(2200).optional().describe('Post caption (max 2200 characters, optional)')
            }),
            func: async ({ image_url, caption }) => {
                // Step 1: Create container
                const container = await instagramFetch(
                    `/${instagramAccountId}/media?image_url=${encodeURIComponent(image_url)}&caption=${encodeURIComponent(caption || '')}&access_token=${accessToken}`,
                    { method: 'POST' }
                )

                // Step 2: Publish container
                const published = await instagramFetch(
                    `/${instagramAccountId}/media_publish?creation_id=${container.id}&access_token=${accessToken}`,
                    { method: 'POST' }
                )

                return JSON.stringify({
                    message: 'Image post published successfully!',
                    post_id: published.id
                })
            }
        }),

        // Create video post
        new DynamicStructuredTool({
            name: 'instagram_create_video_post',
            description: 'Create and publish an Instagram video post. Requires a publicly accessible video URL.',
            schema: z.object({
                video_url: z.string().url().describe('Public URL of the video to post'),
                caption: z.string().max(2200).optional().describe('Post caption (max 2200 characters, optional)')
            }),
            func: async ({ video_url, caption }) => {
                // Step 1: Create container
                const container = await instagramFetch(
                    `/${instagramAccountId}/media?media_type=VIDEO&video_url=${encodeURIComponent(video_url)}&caption=${encodeURIComponent(caption || '')}&access_token=${accessToken}`,
                    { method: 'POST' }
                )

                // Step 2: Publish container
                const published = await instagramFetch(
                    `/${instagramAccountId}/media_publish?creation_id=${container.id}&access_token=${accessToken}`,
                    { method: 'POST' }
                )

                return JSON.stringify({
                    message: 'Video post published successfully!',
                    post_id: published.id
                })
            }
        }),

        // Create carousel post
        new DynamicStructuredTool({
            name: 'instagram_create_carousel_post',
            description: 'Create and publish an Instagram carousel post with multiple images. Requires publicly accessible image URLs.',
            schema: z.object({
                image_urls: z.array(z.string().url()).min(2).max(10).describe('Array of public image URLs (2-10 images)'),
                caption: z.string().max(2200).optional().describe('Post caption (max 2200 characters, optional)')
            }),
            func: async ({ image_urls, caption }) => {
                // Step 1: Create containers for each image
                const containerIds = []
                for (const imageUrl of image_urls) {
                    const container = await instagramFetch(
                        `/${instagramAccountId}/media?image_url=${encodeURIComponent(imageUrl)}&is_carousel_item=true&access_token=${accessToken}`,
                        { method: 'POST' }
                    )
                    containerIds.push(container.id)
                }

                // Step 2: Create carousel container
                const carouselContainer = await instagramFetch(
                    `/${instagramAccountId}/media?media_type=CAROUSEL&children=${containerIds.join(',')}&caption=${encodeURIComponent(caption || '')}&access_token=${accessToken}`,
                    { method: 'POST' }
                )

                // Step 3: Publish carousel
                const published = await instagramFetch(
                    `/${instagramAccountId}/media_publish?creation_id=${carouselContainer.id}&access_token=${accessToken}`,
                    { method: 'POST' }
                )

                return JSON.stringify({
                    message: 'Carousel post published successfully!',
                    post_id: published.id,
                    images_count: image_urls.length
                })
            }
        }),

        // Get post insights
        new DynamicStructuredTool({
            name: 'instagram_get_post_insights',
            description: 'Get analytics and insights for a specific Instagram post including reach, impressions, engagement.',
            schema: z.object({
                media_id: z.string().describe('ID of the media/post to get insights for')
            }),
            func: async ({ media_id }) => {
                const data = await instagramFetch(
                    `/${media_id}/insights?metric=engagement,impressions,reach,saved&access_token=${accessToken}`
                )

                const insights: any = {}
                data.data?.forEach((metric: any) => {
                    insights[metric.name] = metric.values[0].value
                })

                return JSON.stringify({
                    media_id,
                    engagement: insights.engagement || 0,
                    impressions: insights.impressions || 0,
                    reach: insights.reach || 0,
                    saved: insights.saved || 0
                })
            }
        }),

        // Get account insights
        new DynamicStructuredTool({
            name: 'instagram_get_account_insights',
            description: 'Get account-level analytics including impressions, reach, profile views, and follower count for a time period.',
            schema: z.object({
                period: z.enum(['day', 'week', 'days_28']).default('day').describe('Time period for insights')
            }),
            func: async ({ period }) => {
                const data = await instagramFetch(
                    `/${instagramAccountId}/insights?metric=impressions,reach,profile_views,follower_count&period=${period}&access_token=${accessToken}`
                )

                const insights: any = {}
                data.data?.forEach((metric: any) => {
                    insights[metric.name] = metric.values[0].value
                })

                return JSON.stringify({
                    period,
                    impressions: insights.impressions || 0,
                    reach: insights.reach || 0,
                    profile_views: insights.profile_views || 0,
                    followers: insights.follower_count || 0
                })
            }
        }),

        // Get comments on a post
        new DynamicStructuredTool({
            name: 'instagram_get_comments',
            description: 'Get comments on a specific Instagram post.',
            schema: z.object({
                media_id: z.string().describe('ID of the media/post to get comments from')
            }),
            func: async ({ media_id }) => {
                const data = await instagramFetch(
                    `/${media_id}/comments?fields=id,text,username,timestamp,like_count&access_token=${accessToken}`
                )

                return JSON.stringify({
                    comments: data.data?.map((comment: any) => ({
                        id: comment.id,
                        text: comment.text,
                        username: comment.username,
                        timestamp: comment.timestamp,
                        likes: comment.like_count
                    })) || []
                })
            }
        }),

        // Reply to comment
        new DynamicStructuredTool({
            name: 'instagram_reply_to_comment',
            description: 'Reply to a comment on an Instagram post.',
            schema: z.object({
                comment_id: z.string().describe('ID of the comment to reply to'),
                message: z.string().describe('Reply message text')
            }),
            func: async ({ comment_id, message }) => {
                const data = await instagramFetch(
                    `/${comment_id}/replies?message=${encodeURIComponent(message)}&access_token=${accessToken}`,
                    { method: 'POST' }
                )

                return JSON.stringify({
                    message: 'Reply posted successfully!',
                    reply_id: data.id
                })
            }
        }),

        // Delete comment
        new DynamicStructuredTool({
            name: 'instagram_delete_comment',
            description: 'Delete a comment from an Instagram post. Can only delete comments on your own posts.',
            schema: z.object({
                comment_id: z.string().describe('ID of the comment to delete')
            }),
            func: async ({ comment_id }) => {
                await instagramFetch(
                    `/${comment_id}?access_token=${accessToken}`,
                    { method: 'DELETE' }
                )

                return JSON.stringify({
                    message: 'Comment deleted successfully!',
                    comment_id
                })
            }
        }),

        // Get hashtag search
        new DynamicStructuredTool({
            name: 'instagram_search_hashtag',
            description: 'Search for a hashtag and get its ID and recent media count.',
            schema: z.object({
                hashtag: z.string().describe('Hashtag to search for (without # symbol)')
            }),
            func: async ({ hashtag }) => {
                const searchData = await instagramFetch(
                    `/ig_hashtag_search?user_id=${instagramAccountId}&q=${encodeURIComponent(hashtag)}&access_token=${accessToken}`
                )

                if (!searchData.data || searchData.data.length === 0) {
                    return JSON.stringify({
                        message: 'Hashtag not found',
                        hashtag
                    })
                }

                const hashtagId = searchData.data[0].id
                const hashtagData = await instagramFetch(
                    `/${hashtagId}?fields=id,name&access_token=${accessToken}`
                )

                return JSON.stringify({
                    hashtag_id: hashtagData.id,
                    name: hashtagData.name
                })
            }
        }),

        // Get recent media for hashtag
        new DynamicStructuredTool({
            name: 'instagram_get_hashtag_media',
            description: 'Get recent public media posts for a specific hashtag.',
            schema: z.object({
                hashtag_id: z.string().describe('Hashtag ID (get from instagram_search_hashtag)'),
                limit: z.number().min(1).max(50).default(10).describe('Number of posts to retrieve')
            }),
            func: async ({ hashtag_id, limit }) => {
                const data = await instagramFetch(
                    `/${hashtag_id}/recent_media?user_id=${instagramAccountId}&fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`
                )

                return JSON.stringify({
                    posts: data.data?.map((post: any) => ({
                        id: post.id,
                        caption: post.caption,
                        type: post.media_type,
                        url: post.media_url,
                        permalink: post.permalink,
                        timestamp: post.timestamp,
                        likes: post.like_count,
                        comments: post.comments_count
                    })) || []
                })
            }
        })
    ]
}
