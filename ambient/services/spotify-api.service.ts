import { PlaylistTrack } from "./spotify.service";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  preview_url: string | null;
  external_urls: { spotify: string };
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  external_urls: { spotify: string };
}

/**
 * Make authenticated request to Spotify API
 */
async function spotifyRequest<T>(
  endpoint: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Spotify API error: ${response.status} ${response.statusText} - ${error.error?.message || ""}`
    );
  }

  return response.json();
}

/**
 * Get current user's profile
 */
export async function getCurrentUser(accessToken: string): Promise<SpotifyUser> {
  return spotifyRequest<SpotifyUser>("/me", accessToken);
}

/**
 * Search for tracks on Spotify
 */
export async function searchTracks(
  query: string,
  accessToken: string,
  limit: number = 20
): Promise<PlaylistTrack[]> {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: limit.toString(),
    market: "US", // You can make this dynamic based on user location
  });

  const response = await spotifyRequest<SpotifySearchResponse>(
    `/search?${params.toString()}`,
    accessToken
  );

  return response.tracks.items.map((track) => ({
    name: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    spotifyId: track.id,
    previewUrl: track.preview_url || undefined,
  }));
}

/**
 * Search for tracks by genre and mood
 */
export async function searchTracksByGenre(
  genre: string,
  mood: string,
  accessToken: string,
  limit: number = 20
): Promise<PlaylistTrack[]> {
  // Combine genre and mood for better results
  const query = `genre:${genre} ${mood}`;
  return searchTracks(query, accessToken, limit);
}

/**
 * Create a new playlist
 */
export async function createPlaylist(
  userId: string,
  name: string,
  description: string,
  accessToken: string,
  isPublic: boolean = true
): Promise<SpotifyPlaylist> {
  return spotifyRequest<SpotifyPlaylist>(
    `/users/${userId}/playlists`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        name,
        description,
        public: isPublic,
      }),
    }
  );
}

/**
 * Add tracks to a playlist
 */
export async function addTracksToPlaylist(
  playlistId: string,
  trackUris: string[],
  accessToken: string
): Promise<void> {
  // Spotify API allows max 100 tracks per request
  const chunks = [];
  for (let i = 0; i < trackUris.length; i += 100) {
    chunks.push(trackUris.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    await spotifyRequest(
      `/playlists/${playlistId}/tracks`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          uris: chunk,
        }),
      }
    );
  }
}

/**
 * Get track recommendations based on seed tracks
 */
export async function getRecommendations(
  seedTrackIds: string[],
  accessToken: string,
  limit: number = 20,
  targetGenre?: string
): Promise<PlaylistTrack[]> {
  const params = new URLSearchParams({
    seed_tracks: seedTrackIds.slice(0, 5).join(","), // Max 5 seed tracks
    limit: limit.toString(),
    market: "US",
  });

  if (targetGenre) {
    params.append("seed_genres", targetGenre);
  }

  const response = await spotifyRequest<{ tracks: SpotifyTrack[] }>(
    `/recommendations?${params.toString()}`,
    accessToken
  );

  return response.tracks.map((track) => ({
    name: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    spotifyId: track.id,
    previewUrl: track.preview_url || undefined,
  }));
}

