import { StyleSheet } from "react-native";
import {
  IPOD_WIDTH,
  SCREEN_HEIGHT,
  Colors,
  Spacing,
  Shadows,
  Typography,
} from "./constants";

export const screenStyles = StyleSheet.create({
  screen: {
    width: IPOD_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: Colors.screenFrame,
    borderRadius: Spacing.screenBorderRadius,
    borderWidth: 2,
    borderColor: Colors.screenBorder,
    padding: Spacing.screenPadding,
    marginBottom: Spacing.screenMarginBottom,
    ...Shadows.screen,
  },
  screenContent: {
    flex: 1,
    backgroundColor: Colors.screenContent,
    borderRadius: Spacing.screenContentBorderRadius,
    padding: Spacing.screenContentPadding,
  },
  screenTitle: {
    ...Typography.screenTitle,
    marginBottom: 12,
    color: Colors.text,
    textAlign: "center",
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    ...Typography.menuItem,
    color: Colors.text,
    paddingVertical: 4,
  },
  menuItemSelected: {
    backgroundColor: Colors.selectedBackground,
    color: Colors.textSelected,
    fontWeight: "bold",
  },
});

