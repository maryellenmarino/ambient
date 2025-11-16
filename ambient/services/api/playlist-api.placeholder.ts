/**
 * Playlist API Placeholder Service
 * 
 * Placeholder implementation that simulates API responses.
 * Replace this with actual API calls when backend is ready.
 */

import { PlaylistGenerateRequest, PlaylistGenerateResponse } from "./playlist-api.service";
import { PlaylistTrack } from "../spotify.service";

/**
 * Placeholder: Generate playlist from API
 * 
 * TODO: Replace with actual API call to API_ENDPOINTS.PLAYLIST_GENERATE
 */
export async function generatePlaylistFromAPIPlaceholder(
  request: PlaylistGenerateRequest
): Promise<PlaylistGenerateResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock response based on theme and area type
  const mockTracks: Record<string, PlaylistTrack[]> = {
    "Fantasy-city": [
      { name: "Enchanted", artist: "Taylor Swift", spotifyId: "mock-id-1" },
      { name: "Castle", artist: "Halsey", spotifyId: "mock-id-2" },
      { name: "Warriors", artist: "Imagine Dragons", spotifyId: "mock-id-3" },
    ],
    "Fantasy-forest": [
      { name: "The Forest", artist: "The Cure", spotifyId: "mock-id-4" },
      { name: "Nature's Path", artist: "Enya", spotifyId: "mock-id-5" },
      { name: "Woodland", artist: "Ludovico Einaudi", spotifyId: "mock-id-6" },
    ],
    "Fantasy-suburban": [
      { name: "Home", artist: "Edward Sharpe & The Magnetic Zeros", spotifyId: "mock-id-7" },
      { name: "Safe and Sound", artist: "Taylor Swift", spotifyId: "mock-id-8" },
    ],
    "Cyberpunk-city": [
      { name: "Blade Runner", artist: "Vangelis", spotifyId: "mock-id-9" },
      { name: "Midnight City", artist: "M83", spotifyId: "mock-id-10" },
      { name: "Technologic", artist: "Daft Punk", spotifyId: "mock-id-11" },
    ],
    "Cyberpunk-forest": [
      { name: "Electric Forest", artist: "Bassnectar", spotifyId: "mock-id-12" },
      { name: "Digital Nature", artist: "Tycho", spotifyId: "mock-id-13" },
    ],
    "Cyberpunk-suburban": [
      { name: "Suburbia", artist: "Pet Shop Boys", spotifyId: "mock-id-14" },
      { name: "Neon Suburbs", artist: "The Midnight", spotifyId: "mock-id-15" },
    ],
  };

  const key = `${request.theme}-${request.location.areaType}`;
  const tracks = mockTracks[key] || mockTracks[`${request.theme}-city`] || [];

  // Expand to requested limit
  const expandedTracks: PlaylistTrack[] = [];
  while (expandedTracks.length < (request.limit || 20)) {
    expandedTracks.push(...tracks);
  }

  const areaTypeNames: Record<string, string> = {
    city: "Urban",
    forest: "Nature",
    suburban: "Suburban",
    unknown: "Ambient",
  };

  return {
    tracks: expandedTracks.slice(0, request.limit || 20),
    playlistName: `${request.theme} ${areaTypeNames[request.location.areaType]}`,
    metadata: {
      totalTracks: expandedTracks.length,
      generatedAt: new Date().toISOString(),
      location: request.location as any,
    },
  };
}

