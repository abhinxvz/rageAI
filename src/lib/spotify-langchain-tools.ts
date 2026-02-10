import { DynamicStructuredTool } from "@langchain/core/tools"
import { z } from "zod"

/**
 * Spotify LangChain Tools
 * 
 * These tools enable AI to interact with Spotify API for:
 * - Creating playlists based on user's listening history
 * - Getting user's top tracks and artists
 * - Analyzing listening patterns
 * - Managing playlists
 */

interface SpotifyToolsConfig {
    accessToken: string
    userId: string
}

async function refreshSpotifyToken(refreshToken: string): Promise<string> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        })
    })

    if (!response.ok) {
        throw new Error('Failed to refresh Spotify token')
    }

    const data = await response.json()
    return data.access_token
}

export function createSpotifyTools(config: SpotifyToolsConfig) {
    const { accessToken } = config

    const spotifyFetch = async (endpoint: string, options: RequestInit = {}) => {
        const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(`Spotify API error: ${error.error?.message || response.statusText}`)
        }

        return response.json()
    }

    return [
        // Get user's top tracks
        new DynamicStructuredTool({
            name: 'spotify_get_top_tracks',
            description: 'Get user\'s top tracks based on their listening history. Use this to understand their music taste. Time range can be short_term (4 weeks), medium_term (6 months), or long_term (years).',
            schema: z.object({
                time_range: z.enum(['short_term', 'medium_term', 'long_term']).default('medium_term').describe('Time period for top tracks'),
                limit: z.number().min(1).max(50).default(20).describe('Number of tracks to return')
            }),
            func: async ({ time_range, limit }) => {
                const data = await spotifyFetch(`/me/top/tracks?time_range=${time_range}&limit=${limit}`)
                return JSON.stringify({
                    tracks: data.items.map((track: any) => ({
                        name: track.name,
                        artists: track.artists.map((a: any) => a.name),
                        id: track.id,
                        popularity: track.popularity
                    }))
                })
            }
        }),

        // Get user's top artists
        new DynamicStructuredTool({
            name: 'spotify_get_top_artists',
            description: 'Get user\'s top artists based on their listening history. Useful for understanding their music preferences.',
            schema: z.object({
                time_range: z.enum(['short_term', 'medium_term', 'long_term']).default('medium_term').describe('Time period for top artists'),
                limit: z.number().min(1).max(50).default(20).describe('Number of artists to return')
            }),
            func: async ({ time_range, limit }) => {
                const data = await spotifyFetch(`/me/top/artists?time_range=${time_range}&limit=${limit}`)
                return JSON.stringify({
                    artists: data.items.map((artist: any) => ({
                        name: artist.name,
                        genres: artist.genres,
                        id: artist.id,
                        popularity: artist.popularity
                    }))
                })
            }
        }),

        // Get recently played tracks
        new DynamicStructuredTool({
            name: 'spotify_get_recently_played',
            description: 'Get user\'s recently played tracks. Great for understanding current listening patterns.',
            schema: z.object({
                limit: z.number().min(1).max(50).default(20).describe('Number of recently played tracks')
            }),
            func: async ({ limit }) => {
                const data = await spotifyFetch(`/me/player/recently-played?limit=${limit}`)
                return JSON.stringify({
                    tracks: data.items.map((item: any) => ({
                        name: item.track.name,
                        artists: item.track.artists.map((a: any) => a.name),
                        played_at: item.played_at,
                        id: item.track.id
                    }))
                })
            }
        }),

        // Create playlist
        new DynamicStructuredTool({
            name: 'spotify_create_playlist',
            description: 'Create a new playlist for the user. Returns the playlist ID which can be used to add tracks.',
            schema: z.object({
                name: z.string().describe('Name of the playlist'),
                description: z.string().optional().describe('Description of the playlist'),
                public: z.boolean().default(false).describe('Whether the playlist should be public')
            }),
            func: async ({ name, description, public: isPublic }) => {
                // Get user's Spotify ID
                const userData = await spotifyFetch('/me')
                
                const data = await spotifyFetch(`/users/${userData.id}/playlists`, {
                    method: 'POST',
                    body: JSON.stringify({
                        name,
                        description: description || `Created by Rage AI based on your listening history`,
                        public: isPublic
                    })
                })
                
                return JSON.stringify({
                    playlist_id: data.id,
                    name: data.name,
                    url: data.external_urls.spotify,
                    message: `Successfully created playlist "${name}"`
                })
            }
        }),

        // Add tracks to playlist
        new DynamicStructuredTool({
            name: 'spotify_add_tracks_to_playlist',
            description: 'Add tracks to a playlist. Use track IDs or URIs. This is used after creating a playlist to populate it with songs.',
            schema: z.object({
                playlist_id: z.string().describe('ID of the playlist'),
                track_ids: z.array(z.string()).describe('Array of Spotify track IDs or URIs to add')
            }),
            func: async ({ playlist_id, track_ids }) => {
                // Convert IDs to URIs if needed
                const uris = track_ids.map(id => 
                    id.startsWith('spotify:track:') ? id : `spotify:track:${id}`
                )
                
                await spotifyFetch(`/playlists/${playlist_id}/tracks`, {
                    method: 'POST',
                    body: JSON.stringify({ uris })
                })
                
                return JSON.stringify({
                    message: `Successfully added ${track_ids.length} tracks to playlist`,
                    tracks_added: track_ids.length
                })
            }
        }),

        // Search for tracks
        new DynamicStructuredTool({
            name: 'spotify_search_tracks',
            description: 'Search for tracks on Spotify. Useful for finding specific songs or discovering music similar to user\'s taste.',
            schema: z.object({
                query: z.string().describe('Search query (track name, artist, etc.)'),
                limit: z.number().min(1).max(50).default(20).describe('Number of results')
            }),
            func: async ({ query, limit }) => {
                const data = await spotifyFetch(`/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`)
                return JSON.stringify({
                    tracks: data.tracks.items.map((track: any) => ({
                        name: track.name,
                        artists: track.artists.map((a: any) => a.name),
                        id: track.id,
                        uri: track.uri,
                        popularity: track.popularity
                    }))
                })
            }
        }),

        // Get recommendations based on seeds
        new DynamicStructuredTool({
            name: 'spotify_get_recommendations',
            description: 'Get track recommendations based on seed tracks, artists, or genres. Perfect for creating personalized playlists.',
            schema: z.object({
                seed_tracks: z.array(z.string()).optional().describe('Up to 5 track IDs as seeds'),
                seed_artists: z.array(z.string()).optional().describe('Up to 5 artist IDs as seeds'),
                seed_genres: z.array(z.string()).optional().describe('Up to 5 genre names as seeds'),
                limit: z.number().min(1).max(100).default(20).describe('Number of recommendations')
            }),
            func: async ({ seed_tracks, seed_artists, seed_genres, limit }) => {
                const params = new URLSearchParams({ limit: limit.toString() })
                
                if (seed_tracks?.length) params.append('seed_tracks', seed_tracks.join(','))
                if (seed_artists?.length) params.append('seed_artists', seed_artists.join(','))
                if (seed_genres?.length) params.append('seed_genres', seed_genres.join(','))
                
                const data = await spotifyFetch(`/recommendations?${params.toString()}`)
                return JSON.stringify({
                    tracks: data.tracks.map((track: any) => ({
                        name: track.name,
                        artists: track.artists.map((a: any) => a.name),
                        id: track.id,
                        uri: track.uri
                    }))
                })
            }
        }),

        // Get user's playlists
        new DynamicStructuredTool({
            name: 'spotify_get_user_playlists',
            description: 'Get list of user\'s playlists. Useful for managing existing playlists.',
            schema: z.object({
                limit: z.number().min(1).max(50).default(20).describe('Number of playlists to return')
            }),
            func: async ({ limit }) => {
                const data = await spotifyFetch(`/me/playlists?limit=${limit}`)
                return JSON.stringify({
                    playlists: data.items.map((playlist: any) => ({
                        name: playlist.name,
                        id: playlist.id,
                        tracks_total: playlist.tracks.total,
                        url: playlist.external_urls.spotify
                    }))
                })
            }
        })
    ]
}
