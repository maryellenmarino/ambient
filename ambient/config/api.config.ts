/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints and settings.
 * Uses environment variables for configuration.
 */

import { getApiBaseUrl } from "./api-url.util";

// Get API base URL based on platform
const API_BASE_URL = getApiBaseUrl();

// Log the API URL being used (helpful for debugging)
if (__DEV__) {
  console.log(`[API Config] Using base URL: ${API_BASE_URL}`);
}

export const API_ENDPOINTS = {
  PLAYLIST_GENERATE: `${API_BASE_URL}/api/playlist/generate`,
  PLAYLIST_SAVE: `${API_BASE_URL}/api/playlist/save`,
} as const;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 120000, // 120 seconds (2 minutes) - OpenAI API calls can take a while
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;


