import { StyleSheet } from "react-native";
import { Colors, Spacing } from "./constants";

export const containerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.containerPadding,
  },
});

