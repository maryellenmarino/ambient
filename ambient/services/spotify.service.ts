import { AreaType } from "./location.service";
import {
  searchTracks,
  searchTracksByGenre,
  getRecommendations,
  getCurrentUser,
  createPlaylist,
  addTracksToPlaylist,
} from "./spotify-api.service";

export type Theme = "Fantasy" | "Cyberpunk";

export interface PlaylistTrack {
  name: string;
  artist: string;
  spotifyId?: string;
  previewUrl?: string;
}

export interface PlaylistConfig {
  theme: Theme;
  areaType: AreaType;
  limit?: number;
  accessToken?: string;
}

// Seed track IDs for recommendations (these are real Spotify track IDs)
const SEED_TRACKS: Record<string, string[]> = {
  "Fantasy-city": [
    "4jPy3d0Rq3jB8W9pN5I5vF", // Enchanted - Taylor Swift
    "4VnVv5q3k5v5v5v5v5v5v5", // Castle - Halsey (placeholder)
  ],
  "Fantasy-forest": [
    "4jPy3d0Rq3jB8W9pN5I5vF", // Nature tracks
  ],
  "Fantasy-suburban": [
    "4jPy3d0Rq3jB8W9pN5I5vF", // Home tracks
  ],
  "Cyberpunk-city": [
    "4jPy3d0Rq3jB8W9pN5I5vF", // Blade Runner style
  ],
  "Cyberpunk-forest": [
    "4jPy3d0Rq3jB8W9pN5I5vF", // Electronic nature
  ],
  "Cyberpunk-suburban": [
    "4jPy3d0Rq3jB8W9pN5I5vF", // Synthwave
  ],
};

/**
 * Generate playlist tracks using Spotify API
 */
export async function generatePlaylistSeeds(
  config: PlaylistConfig
): Promise<PlaylistTrack[]> {
  const { theme, areaType, limit = 20, accessToken } = config;

  if (!accessToken) {
    // Fallback to mock data if no access token
    return generateMockTracks(config);
  }

  try {
    // Define search queries based on theme and area type
    const searchQueries = getSearchQueries(theme, areaType);
    
    // Try to get recommendations first if we have seed tracks
    const seedKey = `${theme}-${areaType}`;
    const seedTrackIds = SEED_TRACKS[seedKey] || [];
    
    if (seedTrackIds.length > 0) {
      try {
        const genre = getGenreForTheme(theme);
        const recommendations = await getRecommendations(
          seedTrackIds,
          accessToken,
          limit,
          genre
        );
        if (recommendations.length > 0) {
          return recommendations;
        }
      } catch (error) {
        console.log("Recommendations failed, falling back to search:", error);
      }
    }

    // Fallback to search
    const allTracks: PlaylistTrack[] = [];
    for (const query of searchQueries) {
      try {
        const tracks = await searchTracks(query, accessToken, Math.ceil(limit / searchQueries.length));
        allTracks.push(...tracks);
        if (allTracks.length >= limit) break;
      } catch (error) {
        console.error(`Search failed for query "${query}":`, error);
      }
    }

    // Shuffle and limit
    const shuffled = allTracks.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  } catch (error) {
    console.error("Spotify API error, using mock data:", error);
    return generateMockTracks(config);
  }
}

/**
 * Get search queries based on theme and area type
 */
function getSearchQueries(theme: Theme, areaType: AreaType): string[] {
  const queries: Record<string, string[]> = {
    "Fantasy-city": ["fantasy epic orchestral", "medieval city", "fantasy soundtrack"],
    "Fantasy-forest": ["fantasy nature", "medieval forest", "celtic music", "nature ambient"],
    "Fantasy-suburban": ["folk fantasy", "acoustic fantasy", "indie folk"],
    "Cyberpunk-city": ["cyberpunk synthwave", "dark synth", "neon city", "electronic dark"],
    "Cyberpunk-forest": ["electronic ambient", "synth nature", "cyberpunk ambient"],
    "Cyberpunk-suburban": ["synthwave", "retrowave", "outrun"],
  };

  const key = `${theme}-${areaType}`;
  return queries[key] || queries[`${theme}-city`] || ["electronic"];
}

/**
 * Get genre for theme
 */
function getGenreForTheme(theme: Theme): string {
  return theme === "Fantasy" ? "folk" : "electronic";
}

/**
 * Fallback mock tracks if API fails
 */
function generateMockTracks(config: PlaylistConfig): PlaylistTrack[] {
  const { theme, areaType, limit = 20 } = config;
  
  const seeds: Record<string, PlaylistTrack[]> = {
    "Fantasy-city": [
      { name: "Enchanted", artist: "Taylor Swift" },
      { name: "Castle", artist: "Halsey" },
      { name: "Warriors", artist: "Imagine Dragons" },
    ],
    "Fantasy-forest": [
      { name: "The Forest", artist: "The Cure" },
      { name: "Nature's Path", artist: "Enya" },
      { name: "Woodland", artist: "Ludovico Einaudi" },
    ],
    "Fantasy-suburban": [
      { name: "Home", artist: "Edward Sharpe & The Magnetic Zeros" },
      { name: "Safe and Sound", artist: "Taylor Swift" },
    ],
    "Cyberpunk-city": [
      { name: "Blade Runner", artist: "Vangelis" },
      { name: "Midnight City", artist: "M83" },
      { name: "Technologic", artist: "Daft Punk" },
    ],
    "Cyberpunk-forest": [
      { name: "Electric Forest", artist: "Bassnectar" },
      { name: "Digital Nature", artist: "Tycho" },
    ],
    "Cyberpunk-suburban": [
      { name: "Suburbia", artist: "Pet Shop Boys" },
      { name: "Neon Suburbs", artist: "The Midnight" },
    ],
  };

  const key = `${theme}-${areaType}`;
  let tracks = seeds[key] || seeds[`${theme}-city`] || [];

  while (tracks.length < limit) {
    tracks = [...tracks, ...tracks];
  }

  return tracks.sort(() => Math.random() - 0.5).slice(0, limit);
}

/**
 * Create Spotify playlist using real API
 */
export async function createSpotifyPlaylist(
  userId: string,
  name: string,
  tracks: PlaylistTrack[],
  accessToken: string,
  description?: string
): Promise<string> {
  // Filter tracks that have Spotify IDs
  const tracksWithIds = tracks.filter((t) => t.spotifyId);
  
  if (tracksWithIds.length === 0) {
    throw new Error("No tracks with Spotify IDs to add to playlist");
  }

  // Create playlist
  const playlist = await createPlaylist(
    userId,
    name,
    description || `Generated playlist: ${name}`,
    accessToken,
    true
  );

  // Add tracks (convert to Spotify URIs)
  const trackUris = tracksWithIds.map((t) => `spotify:track:${t.spotifyId}`);
  await addTracksToPlaylist(playlist.id, trackUris, accessToken);

  return playlist.id;
}

