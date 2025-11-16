import * as Location from "expo-location";

export type AreaType = "city" | "forest" | "suburban" | "unknown";

export interface LocationData {
  latitude: number;
  longitude: number;
  areaType: AreaType;
  address?: string;
}

/**
 * Request location permissions and get current location
 */
export async function getCurrentLocation(): Promise<LocationData> {
  try {
    // Request permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission not granted");
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Reverse geocode to get address info
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    const address = reverseGeocode[0];
    const areaType = determineAreaType(address);

    return {
      latitude,
      longitude,
      areaType,
      address: formatAddress(address),
    };
  } catch (error) {
    console.error("Error getting location:", error);
    throw error;
  }
}

/**
 * Determine area type based on reverse geocoding data
 */
function determineAreaType(address: Location.LocationGeocodedAddress): AreaType {
  if (!address) return "unknown";

  const street = (address.street || "").toLowerCase();
  const district = (address.district || "").toLowerCase();
  const subregion = (address.subregion || "").toLowerCase();
  const region = (address.region || "").toLowerCase();
  const name = (address.name || "").toLowerCase();

  // Keywords for different area types
  const cityKeywords = [
    "city",
    "downtown",
    "urban",
    "metropolitan",
    "avenue",
    "boulevard",
    "street",
    "road",
  ];

  const forestKeywords = [
    "park",
    "forest",
    "trail",
    "nature",
    "reserve",
    "wilderness",
    "wood",
    "grove",
  ];

  const suburbanKeywords = [
    "suburb",
    "residential",
    "neighborhood",
    "community",
    "village",
    "town",
  ];

  const allText = `${street} ${district} ${subregion} ${region} ${name}`.toLowerCase();

  // Check for forest/nature areas first
  if (forestKeywords.some((keyword) => allText.includes(keyword))) {
    return "forest";
  }

  // Check for city/urban areas
  if (cityKeywords.some((keyword) => allText.includes(keyword))) {
    // Additional check: if it's a numbered street/avenue, likely city
    if (/\d+(st|nd|rd|th)\s+(street|ave|avenue|road|rd)/i.test(allText)) {
      return "city";
    }
    // Check population density indicators
    if (allText.includes("downtown") || allText.includes("metropolitan")) {
      return "city";
    }
  }

  // Check for suburban areas
  if (suburbanKeywords.some((keyword) => allText.includes(keyword))) {
    return "suburban";
  }

  // Default: try to infer from address structure
  // If we have a street name but no clear indicators, likely suburban
  if (street && !cityKeywords.some((k) => allText.includes(k))) {
    return "suburban";
  }

  // If we have district/region but no street, might be city
  if ((district || region) && !street) {
    return "city";
  }

  return "unknown";
}

/**
 * Format address for display
 */
function formatAddress(address: Location.LocationGeocodedAddress): string {
  if (!address) return "Unknown location";

  const parts = [
    address.street,
    address.district,
    address.subregion,
    address.region,
  ].filter(Boolean);

  return parts.join(", ") || address.name || "Unknown location";
}

