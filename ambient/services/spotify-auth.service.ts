import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import { makeRedirectUri } from "expo-auth-session";

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
  code: string,
  redirectUri?: string
): Promise<SpotifyTokenResponse> {
  // Use provided redirect URI or fall back to the configured one
  // IMPORTANT: This must match EXACTLY what was used in the auth request
  const finalRedirectUri = redirectUri || makeRedirectUri({
    scheme: "ambient",
    path: "auth",
  });
  
  console.log(`[Spotify Auth] Exchanging code for token with redirect URI: ${finalRedirectUri}`);
  
  // Verify client secret is set
  if (!process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET) {
    throw new Error("Spotify Client Secret not configured. Please set EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET in .env file");
  }

  // Create base64 encoded credentials
  // Spotify requires: Base64(client_id:client_secret)
  const credentials = `${SPOTIFY_CLIENT_ID}:${process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET || ""}`;
  let base64Credentials: string;
  
  // Use btoa if available (web), otherwise use a proper base64 encoding
  if (typeof btoa !== "undefined") {
    // Web environment - use btoa
    base64Credentials = btoa(credentials);
  } else {
    // React Native - use TextEncoder and manual base64 encoding
    // Convert string to Uint8Array, then to base64
    const encoder = new TextEncoder();
    const bytes = encoder.encode(credentials);
    
    // Base64 encoding
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "";
    let i = 0;
    while (i < bytes.length) {
      const a = bytes[i++];
      const b = i < bytes.length ? bytes[i++] : 0;
      const c = i < bytes.length ? bytes[i++] : 0;
      const bitmap = (a << 16) | (b << 8) | c;
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < bytes.length ? chars.charAt((bitmap >> 6) & 63) : "=";
      result += i - 1 < bytes.length ? chars.charAt(bitmap & 63) : "=";
    }
    base64Credentials = result;
  }
  
  console.log(`[Spotify Auth] Client ID: ${SPOTIFY_CLIENT_ID.substring(0, 8)}...`);
  console.log(`[Spotify Auth] Client Secret configured: ${!!process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET}`);

  // Create form-encoded body manually to ensure it works in React Native
  const bodyParams = new URLSearchParams();
  bodyParams.append("grant_type", "authorization_code");
  bodyParams.append("code", code);
  bodyParams.append("redirect_uri", finalRedirectUri);
  
  const bodyString = bodyParams.toString();
  console.log(`[Spotify Auth] Request body: grant_type=authorization_code&code=...&redirect_uri=${encodeURIComponent(finalRedirectUri)}`);

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${base64Credentials}`,
    },
    body: bodyString,
  });

  if (!response.ok) {
    // Get detailed error message from response
    let errorMessage = `Token exchange failed: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) {
        errorMessage = `Token exchange failed: ${errorData.error} - ${errorData.error_description || ""}`;
      }
      console.error("[Spotify Auth] Token exchange error details:", errorData);
    } catch (e) {
      const errorText = await response.text();
      console.error("[Spotify Auth] Token exchange error response:", errorText);
    }
    
    console.error(`[Spotify Auth] Redirect URI used: ${finalRedirectUri}`);
    console.error(`[Spotify Auth] Make sure this redirect URI matches what was used in the auth request!`);
    
    throw new Error(errorMessage);
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

  try {
    // Use redirect URI from environment variable if set, otherwise generate one
    let redirectUri: string;
    
    if (SPOTIFY_REDIRECT_URI && SPOTIFY_REDIRECT_URI !== "ambient://auth") {
      // Use the explicitly configured redirect URI
      redirectUri = SPOTIFY_REDIRECT_URI;
      console.log(`[Spotify Auth] Using configured redirect URI: ${redirectUri}`);
    } else {
      // Generate redirect URI based on platform
      if (Platform.OS === "web") {
        // Web uses http://localhost
        redirectUri = makeRedirectUri({
          scheme: "http",
          path: "auth",
        });
      } else {
        // Mobile uses custom scheme
        redirectUri = makeRedirectUri({
          scheme: "ambient",
          path: "auth",
        });
      }
      console.log(`[Spotify Auth] Generated redirect URI: ${redirectUri}`);
    }
    
    console.log(`[Spotify Auth] ⚠️  IMPORTANT: Make sure this exact URI is registered in your Spotify app settings!`);
    console.log(`[Spotify Auth] Go to: https://developer.spotify.com/dashboard -> Your App -> Edit Settings -> Redirect URIs`);

    // Create auth request
    const request = new AuthSession.AuthRequest({
      clientId: SPOTIFY_CLIENT_ID,
      scopes: scopes,
      responseType: AuthSession.ResponseType.Code,
      redirectUri: redirectUri,
      usePKCE: false,
    });

    // Get discovery document (not needed for Spotify, but required by AuthRequest)
    const discovery = {
      authorizationEndpoint: "https://accounts.spotify.com/authorize",
      tokenEndpoint: "https://accounts.spotify.com/api/token",
    };

    // Prompt for authentication
    const result = await request.promptAsync(discovery, {
      useProxy: false,
      showInRecents: true,
    });

    if (result.type === "success" && result.params.code) {
      console.log(`[Spotify Auth] Received authorization code, exchanging for token...`);
      console.log(`[Spotify Auth] Using redirect URI: ${redirectUri}`);
      return await exchangeCodeForToken(result.params.code, redirectUri);
    } else if (result.type === "cancel") {
      throw new Error("Authentication cancelled by user");
    } else {
      throw new Error("Authentication failed");
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
  // Create base64 encoded credentials (same as exchangeCodeForToken)
  const credentials = `${SPOTIFY_CLIENT_ID}:${process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET || ""}`;
  let base64Credentials: string;
  
  if (typeof btoa !== "undefined") {
    base64Credentials = btoa(credentials);
  } else {
    // Manual base64 encoding for React Native
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "";
    let i = 0;
    while (i < credentials.length) {
      const a = credentials.charCodeAt(i++);
      const b = i < credentials.length ? credentials.charCodeAt(i++) : 0;
      const c = i < credentials.length ? credentials.charCodeAt(i++) : 0;
      const bitmap = (a << 16) | (b << 8) | c;
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < credentials.length ? chars.charAt((bitmap >> 6) & 63) : "=";
      result += i - 1 < credentials.length ? chars.charAt(bitmap & 63) : "=";
    }
    base64Credentials = result;
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${base64Credentials}`,
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


