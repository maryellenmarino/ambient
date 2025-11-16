/**
 * Playlist API Service
 * 
 * Handles all API calls related to playlist generation and management.
 * Sends location data and theme to backend, receives curated tracks.
 */

import { apiRequest, ApiClientError } from "./api-client.service";
import { API_ENDPOINTS } from "@/config/api.config";
import { AreaType, LocationData } from "../location.service";
import { Theme, PlaylistTrack } from "../spotify.service";

export interface PlaylistGenerateRequest {
  theme: Theme;
  location: {
    latitude: number;
    longitude: number;
    areaType: AreaType;
    address?: string;
  };
  limit?: number;
}

export interface PlaylistGenerateResponse {
  tracks: PlaylistTrack[];
  playlistName: string;
  metadata?: {
    totalTracks: number;
    generatedAt: string;
    location: LocationData;
  };
}

export interface PlaylistSaveRequest {
  playlistName: string;
  tracks: PlaylistTrack[];
  location: LocationData;
  theme: Theme;
  spotifyAccessToken?: string;
}

export interface PlaylistSaveResponse {
  playlistId: string;
  spotifyPlaylistUrl?: string;
  success: boolean;
}

/**
 * Generate playlist by sending location and theme data to API
 */
export async function generatePlaylistFromAPI(
  request: PlaylistGenerateRequest
): Promise<PlaylistGenerateResponse> {
  try {
    const response = await apiRequest<PlaylistGenerateResponse>(
      API_ENDPOINTS.PLAYLIST_GENERATE,
      {
        method: "POST",
        body: {
          theme: request.theme,
          location: {
            latitude: request.location.latitude,
            longitude: request.location.longitude,
            areaType: request.location.areaType,
            address: request.location.address,
          },
          limit: request.limit || 20,
        },
      }
    );

    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw new Error(
        `Failed to generate playlist: ${error.message} (${error.code})`
      );
    }
    throw error;
  }
}

/**
 * Save playlist to backend (and optionally to Spotify)
 */
export async function savePlaylistToAPI(
  request: PlaylistSaveRequest
): Promise<PlaylistSaveResponse> {
  try {
    const response = await apiRequest<PlaylistSaveResponse>(
      API_ENDPOINTS.PLAYLIST_SAVE,
      {
        method: "POST",
        body: {
          playlistName: request.playlistName,
          tracks: request.tracks,
          location: request.location,
          theme: request.theme,
          spotifyAccessToken: request.spotifyAccessToken,
        },
      }
    );

    return response;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw new Error(`Failed to save playlist: ${error.message} (${error.code})`);
    }
    throw error;
  }
}

