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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    height: 20,
  },
  headerSpacer: {
    flex: 1,
  },
  headerIcon: {
    color: Colors.text,
  },
  headerIconLeft: {
    marginRight: 4,
  },
  headerIconRight: {
    marginLeft: 4,
  },
  screenTitle: {
    ...Typography.screenTitle,
    marginBottom: 12,
    color: Colors.text,
    textAlign: "center",
  },
  menuList: {
    flex: 1,
    maxHeight: SCREEN_HEIGHT - 60, // Account for header and padding
  },
  menuListContent: {
    flexGrow: 1,
    paddingBottom: 8,
  },
  menuItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  menuItem: {
    ...Typography.menuItem,
    color: Colors.text,
    flex: 1,
  },
  menuItemSelected: {
    backgroundColor: Colors.selectedBackground,
  },
  menuItemSelectedText: {
    color: Colors.textSelected,
    fontWeight: "bold",
  },
  menuIcon: {
    marginRight: 6,
  },
  menuArrow: {
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    ...Typography.menuItem,
    color: Colors.text,
    textAlign: "center",
  },
  locationText: {
    ...Typography.menuItem,
    color: Colors.text,
    fontSize: 10,
    textTransform: "capitalize",
  },
});

