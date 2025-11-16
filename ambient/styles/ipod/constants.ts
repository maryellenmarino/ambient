import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// Dimensions
export const IPOD_WIDTH = Math.min(width - 40, 320);
export const WHEEL_SIZE = Math.min(width - 40, 280);
export const SCREEN_HEIGHT = IPOD_WIDTH / 1.6;

// Colors
export const Colors = {
  background: "#1a1a1a",
  screenFrame: "#2a2a2a",
  screenBorder: "#000",
  screenContent: "#fff",
  text: "#000",
  textSelected: "#fff",
  selectedBackground: "#0066cc",
  wheel: "#e0e0e0",
  wheelBorder: "#c0c0c0",
  centerButton: "#fff",
  centerButtonBorder: "#ccc",
  buttonInner: "#999",
  buttonText: "#666",
} as const;

// Spacing
export const Spacing = {
  containerPadding: 20,
  screenPadding: 12,
  screenContentPadding: 12,
  screenMarginBottom: 30,
  screenBorderRadius: 8,
  screenContentBorderRadius: 4,
  wheelBorderWidth: 3,
  centerButtonBorderWidth: 2,
} as const;

// Typography
export const Typography = {
  screenTitle: {
    fontSize: 20,
    fontWeight: "bold" as const,
  },
  menuItem: {
    fontSize: 14,
    fontFamily: "monospace",
  },
  wheelButtonText: {
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  centerButtonText: {
    fontSize: 24,
    fontWeight: "bold" as const,
  },
} as const;

// Shadows
export const Shadows = {
  screen: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  wheel: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  centerButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
} as const;

