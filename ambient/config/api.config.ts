/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints and settings.
 * Uses environment variables for configuration.
 */

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.example.com";

export const API_ENDPOINTS = {
  PLAYLIST_GENERATE: `${API_BASE_URL}/api/playlist/generate`,
  PLAYLIST_SAVE: `${API_BASE_URL}/api/playlist/save`,
} as const;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

