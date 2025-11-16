import {
  getCurrentLocation,
  AreaType,
  LocationData,
} from "./location.service";
import { Theme, PlaylistTrack } from "./spotify.service";
import {
  generatePlaylistFromAPI,
  PlaylistGenerateRequest,
  savePlaylistToAPI as savePlaylistToAPIService,
} from "./api/playlist-api.service";
import { generatePlaylistFromAPIPlaceholder } from "./api/playlist-api.placeholder";

export interface GeneratedPlaylist {
  name: string;
  tracks: PlaylistTrack[];
  location: LocationData;
  theme: Theme;
  spotifyPlaylistId?: string;
}

/**
 * Generate a playlist based on current location and selected theme
 * Uses API endpoint to get curated tracks based on location and theme
 */
export async function generatePlaylist(
  theme: Theme,
  usePlaceholder: boolean = false
): Promise<GeneratedPlaylist> {
  try {
    // Get current location
    const location = await getCurrentLocation();

    // Prepare API request
    const request: PlaylistGenerateRequest = {
      theme,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        areaType: location.areaType,
        address: location.address,
      },
      limit: 20,
    };

    // Call API (use placeholder if backend not ready)
    let apiResponse;
    if (usePlaceholder) {
      apiResponse = await generatePlaylistFromAPIPlaceholder(request);
    } else {
      try {
        apiResponse = await generatePlaylistFromAPI(request);
      } catch (error) {
        console.warn("API request failed, falling back to placeholder:", error);
        // Fallback to placeholder if API fails
        apiResponse = await generatePlaylistFromAPIPlaceholder(request);
      }
    }

    return {
      name: apiResponse.playlistName,
      tracks: apiResponse.tracks,
      location,
      theme,
    };
  } catch (error) {
    console.error("Error generating playlist:", error);
    throw error;
  }
}

/**
 * Save playlist to backend API
 * The backend will handle Spotify integration if access token is provided
 */
export async function savePlaylistToAPI(
  playlist: GeneratedPlaylist,
  spotifyAccessToken?: string
): Promise<string> {
  try {
    const response = await savePlaylistToAPIService({
      playlistName: playlist.name,
      tracks: playlist.tracks,
      location: playlist.location,
      theme: playlist.theme,
      spotifyAccessToken,
    });

    return response.playlistId;
  } catch (error) {
    console.error("Error saving playlist:", error);
    throw error;
  }
}

