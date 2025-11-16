/**
 * Spotify Deep Link Service
 * 
 * Handles opening Spotify app to play tracks using deep links.
 * Falls back to web if Spotify app is not installed.
 */

import { Linking, Platform, Alert } from "react-native";
import { PlaylistTrack } from "./spotify.service";

/**
 * Open Spotify track using deep link
 * Falls back to web if app is not installed
 */
export async function openSpotifyTrack(track: PlaylistTrack): Promise<void> {
  try {
    let spotifyUrl: string;

    if (track.spotifyId) {
      // Use Spotify ID if available (most reliable)
      // Both iOS and Android use the same format: spotify:track:TRACK_ID
      spotifyUrl = `spotify:track:${track.spotifyId}`;
    } else {
      // Fallback: Search by track name and artist
      const searchQuery = encodeURIComponent(`${track.artist} ${track.name}`);
      // Both iOS and Android use: spotify:search:QUERY
      spotifyUrl = `spotify:search:${searchQuery}`;
    }

    // Try to open Spotify app
    const canOpen = await Linking.canOpenURL(spotifyUrl);
    
    if (canOpen) {
      await Linking.openURL(spotifyUrl);
    } else {
      // Fallback to web version
      const webUrl = track.spotifyId
        ? `https://open.spotify.com/track/${track.spotifyId}`
        : `https://open.spotify.com/search/${encodeURIComponent(`${track.artist} ${track.name}`)}`;
      
      const canOpenWeb = await Linking.canOpenURL(webUrl);
      if (canOpenWeb) {
        await Linking.openURL(webUrl);
      } else {
        throw new Error("Cannot open Spotify. Please install Spotify app or check your browser.");
      }
    }
  } catch (error) {
    console.error("Error opening Spotify:", error);
    Alert.alert(
      "Cannot Open Spotify",
      error instanceof Error 
        ? error.message 
        : "Please make sure Spotify is installed or try again later.",
      [{ text: "OK" }]
    );
    throw error;
  }
}

/**
 * Check if Spotify app is installed
 */
export async function isSpotifyInstalled(): Promise<boolean> {
  try {
    const spotifyUrl = Platform.OS === "ios" 
      ? "spotify://" 
      : "spotify:";
    return await Linking.canOpenURL(spotifyUrl);
  } catch {
    return false;
  }
}

