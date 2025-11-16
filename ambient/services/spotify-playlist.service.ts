/**
 * Spotify Playlist Service
 * 
 * Handles creating Spotify playlists from generated tracks.
 */

import { Linking, Alert } from "react-native";
import { PlaylistTrack } from "./spotify.service";
import { 
  authenticateSpotify, 
  SpotifyTokenResponse 
} from "./spotify-auth.service";
import {
  getCurrentUser,
  createPlaylist,
  addTracksToPlaylist,
  searchTracks,
} from "./spotify-api.service";

export interface CreatePlaylistResult {
  success: boolean;
  playlistId?: string;
  playlistUrl?: string;
  error?: string;
}

/**
 * Search for a track on Spotify and return its ID
 */
async function findTrackId(
  track: PlaylistTrack,
  accessToken: string
): Promise<string | null> {
  // If track already has Spotify ID, use it
  if (track.spotifyId) {
    return track.spotifyId;
  }

  // Search for the track
  try {
    const query = `artist:${track.artist} track:${track.name}`;
    const results = await searchTracks(query, accessToken, 1);
    
    if (results.length > 0 && results[0].spotifyId) {
      return results[0].spotifyId;
    }
    
    // Fallback: try without artist filter
    const fallbackQuery = `${track.artist} ${track.name}`;
    const fallbackResults = await searchTracks(fallbackQuery, accessToken, 1);
    
    if (fallbackResults.length > 0 && fallbackResults[0].spotifyId) {
      return fallbackResults[0].spotifyId;
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching for track "${track.name}":`, error);
    return null;
  }
}

/**
 * Create a Spotify playlist with all tracks
 */
export async function createSpotifyPlaylistFromTracks(
  playlistName: string,
  tracks: PlaylistTrack[],
  description?: string
): Promise<CreatePlaylistResult> {
  try {
    // Step 1: Authenticate with Spotify
    console.log("🔐 Authenticating with Spotify...");
    const tokenResponse: SpotifyTokenResponse = await authenticateSpotify();
    const accessToken = tokenResponse.accessToken;

    // Step 2: Get current user
    console.log("👤 Getting user info...");
    const user = await getCurrentUser(accessToken);

    // Step 3: Search for all tracks to get Spotify IDs
    console.log(`🔍 Searching for ${tracks.length} tracks on Spotify...`);
    const trackIds: string[] = [];
    const foundTracks: string[] = [];
    const notFoundTracks: string[] = [];

    for (const track of tracks) {
      const trackId = await findTrackId(track, accessToken);
      if (trackId) {
        trackIds.push(trackId);
        foundTracks.push(`${track.artist} - ${track.name}`);
      } else {
        notFoundTracks.push(`${track.artist} - ${track.name}`);
      }
    }

    if (trackIds.length === 0) {
      return {
        success: false,
        error: "Could not find any tracks on Spotify. Please try again.",
      };
    }

    console.log(`✅ Found ${trackIds.length} of ${tracks.length} tracks`);

    // Step 4: Create playlist
    console.log("📝 Creating playlist...");
    const playlist = await createPlaylist(
      user.id,
      playlistName,
      description || `Generated playlist with ${trackIds.length} tracks`,
      accessToken,
      true // Public playlist
    );

    // Step 5: Add tracks to playlist
    console.log(`➕ Adding ${trackIds.length} tracks to playlist...`);
    const trackUris = trackIds.map((id) => `spotify:track:${id}`);
    await addTracksToPlaylist(playlist.id, trackUris, accessToken);

    console.log("✅ Playlist created successfully!");

    return {
      success: true,
      playlistId: playlist.id,
      playlistUrl: playlist.external_urls.spotify,
    };
  } catch (error) {
    console.error("Error creating Spotify playlist:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create playlist",
    };
  }
}

/**
 * Open Spotify playlist in app or web
 */
export async function openSpotifyPlaylist(playlistUrl: string): Promise<void> {
  try {
    // Try to open in Spotify app first
    const spotifyUrl = playlistUrl.replace("https://open.spotify.com", "spotify");
    const canOpen = await Linking.canOpenURL(spotifyUrl);
    
    if (canOpen) {
      await Linking.openURL(spotifyUrl);
    } else {
      // Fallback to web
      await Linking.openURL(playlistUrl);
    }
  } catch (error) {
    console.error("Error opening Spotify playlist:", error);
    Alert.alert(
      "Cannot Open Spotify",
      "Please make sure Spotify is installed or try again later.",
      [{ text: "OK" }]
    );
  }
}

