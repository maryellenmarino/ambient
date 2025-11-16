/**
 * API URL Utility
 * 
 * Determines the correct API base URL based on the platform.
 * On mobile devices/emulators, localhost doesn't work, so we need
 * to use the computer's IP address or emulator-specific addresses.
 */

import { Platform } from "react-native";

/**
 * Get the API base URL for the current platform
 * 
 * IMPORTANT: For physical mobile devices, you need to:
 * 1. Find your computer's local IP address (e.g., 192.168.1.100)
 * 2. Set EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:8000
 * 
 * Or use a tool like ngrok for testing.
 */
export function getApiBaseUrl(): string {
  // Use environment variable if set (recommended for mobile devices)
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    const url = process.env.EXPO_PUBLIC_API_BASE_URL;
    console.log(`[API URL] Using environment variable: ${url}`);
    return url;
  }

  // For web, use localhost
  if (Platform.OS === "web") {
    const url = "http://localhost:8000";
    console.log(`[API URL] Platform: web, using: ${url}`);
    return url;
  }

  // For Android emulator, use special IP that maps to host's localhost
  if (Platform.OS === "android") {
    // Android emulator uses 10.0.2.2 to access host machine's localhost
    const url = "http://10.0.2.2:8000";
    console.log(`[API URL] Platform: android, using: ${url}`);
    return url;
  }

  // For iOS, localhost only works in simulator
  // For physical devices, use environment variable with your computer's IP
  if (Platform.OS === "ios") {
    // Note: This will only work in iOS Simulator
    // For physical devices, set EXPO_PUBLIC_API_BASE_URL to your computer's IP
    const url = "http://localhost:8000";
    console.log(`[API URL] Platform: ios, using: ${url}`);
    console.log(`[API URL] ⚠️  If running on physical device, set EXPO_PUBLIC_API_BASE_URL to your computer's IP address`);
    return url;
  }

  // Default fallback
  const url = "http://localhost:8000";
  console.log(`[API URL] Platform: ${Platform.OS}, using default: ${url}`);
  return url;
}


