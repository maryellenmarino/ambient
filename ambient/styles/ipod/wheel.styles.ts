import { StyleSheet } from "react-native";
import {
  WHEEL_SIZE,
  Colors,
  Spacing,
  Shadows,
  Typography,
} from "./constants";

export const wheelStyles = StyleSheet.create({
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    backgroundColor: Colors.wheel,
    borderRadius: WHEEL_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: Spacing.wheelBorderWidth,
    borderColor: Colors.wheelBorder,
    ...Shadows.wheel,
  },
  wheelButton: {
    position: "absolute",
    width: WHEEL_SIZE * 0.35,
    height: WHEEL_SIZE * 0.35,
    justifyContent: "center",
    alignItems: "center",
  },
  topButton: {
    top: 0,
    left: WHEEL_SIZE * 0.325,
  },
  leftButton: {
    left: 0,
    top: WHEEL_SIZE * 0.325,
  },
  rightButton: {
    right: 0,
    top: WHEEL_SIZE * 0.325,
  },
  bottomButton: {
    bottom: 0,
    left: WHEEL_SIZE * 0.325,
  },
  buttonInner: {
    width: 20,
    height: 20,
    backgroundColor: Colors.buttonInner,
    borderRadius: 10,
  },
  wheelButtonText: {
    ...Typography.wheelButtonText,
    color: Colors.buttonText,
  },
  centerButton: {
    width: WHEEL_SIZE * 0.3,
    height: WHEEL_SIZE * 0.3,
    backgroundColor: Colors.centerButton,
    borderRadius: WHEEL_SIZE * 0.15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: Spacing.centerButtonBorderWidth,
    borderColor: Colors.centerButtonBorder,
    ...Shadows.centerButton,
  },
  centerButtonInner: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: WHEEL_SIZE * 0.15,
  },
  centerButtonText: {
    ...Typography.centerButtonText,
    color: Colors.buttonText,
  },
});

