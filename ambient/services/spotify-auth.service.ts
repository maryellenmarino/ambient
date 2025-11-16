import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

// Complete auth session for web
if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || "";
const SPOTIFY_REDIRECT_URI = process.env.EXPO_PUBLIC_SPOTIFY_REDIRECT_URI || "ambient://auth";

const scopes = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
  "user-read-email",
];

export interface SpotifyTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * Get Spotify authorization URL
 */
export function getSpotifyAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: SPOTIFY_REDIRECT_URI,
    scope: scopes.join(" "),
    show_dialog: "false",
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(
  code: string
): Promise<SpotifyTokenResponse> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET || ""}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

/**
 * Authenticate with Spotify using OAuth
 */
export async function authenticateSpotify(): Promise<SpotifyTokenResponse> {
  if (!SPOTIFY_CLIENT_ID) {
    throw new Error("Spotify Client ID not configured. Please set EXPO_PUBLIC_SPOTIFY_CLIENT_ID");
  }

  const authUrl = getSpotifyAuthUrl();

  try {
    const result = await AuthSession.startAsync({
      authUrl,
      returnUrl: SPOTIFY_REDIRECT_URI,
    });

    if (result.type === "success" && result.params.code) {
      return await exchangeCodeForToken(result.params.code);
    } else {
      throw new Error("Authentication cancelled or failed");
    }
  } catch (error) {
    console.error("Spotify authentication error:", error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<SpotifyTokenResponse> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET || ""}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}


