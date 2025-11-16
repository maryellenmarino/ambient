import { Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import {
  containerStyles,
  ipodBodyStyles,
  screenStyles,
  wheelStyles,
} from "@/styles/ipod";

export default function IPodScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuItems = ["Music", "Photos", "Videos", "Settings", "Shuffle Songs"];

  const handleWheelScroll = (direction: "up" | "down") => {
    if (direction === "up") {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
    } else {
      setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <View style={containerStyles.container}>
      {/* iPod Body */}
      <View style={ipodBodyStyles.ipodBody}>
        {/* Screen */}
        <View style={screenStyles.screen}>
          <View style={screenStyles.screenContent}>
            <Text style={screenStyles.screenTitle}>iPod</Text>
            <View style={screenStyles.menuList}>
              {menuItems.map((item, index) => (
                <Text
                  key={index}
                  style={[
                    screenStyles.menuItem,
                    index === selectedIndex && screenStyles.menuItemSelected,
                  ]}
                >
                  {index === selectedIndex ? "▶ " : "  "}
                  {item}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Click Wheel */}
        <View style={wheelStyles.wheelContainer}>
          <View style={wheelStyles.wheel}>
            {/* Top Menu Button */}
            <TouchableOpacity
              style={[wheelStyles.wheelButton, wheelStyles.topButton]}
              onPress={() => {}}
            >
              <View style={wheelStyles.buttonInner} />
            </TouchableOpacity>

            {/* Left Button */}
            <TouchableOpacity
              style={[wheelStyles.wheelButton, wheelStyles.leftButton]}
              onPress={() => handleWheelScroll("up")}
            >
              <Text style={wheelStyles.wheelButtonText}>◀◀</Text>
            </TouchableOpacity>

            {/* Right Button */}
            <TouchableOpacity
              style={[wheelStyles.wheelButton, wheelStyles.rightButton]}
              onPress={() => handleWheelScroll("down")}
            >
              <Text style={wheelStyles.wheelButtonText}>▶▶</Text>
            </TouchableOpacity>

            {/* Bottom Play/Pause Button */}
            <TouchableOpacity
              style={[wheelStyles.wheelButton, wheelStyles.bottomButton]}
              onPress={() => {}}
            >
              <View style={wheelStyles.buttonInner} />
            </TouchableOpacity>

            {/* Center Button */}
            <TouchableOpacity
              style={wheelStyles.centerButton}
              onPress={() => {}}
            >
              <View style={wheelStyles.centerButtonInner}>
                <Text style={wheelStyles.centerButtonText}>●</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}


