import { Text, TouchableOpacity, View, ActivityIndicator, ScrollView, Alert } from "react-native";
import { useState, useRef, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import {
  containerStyles,
  ipodBodyStyles,
  screenStyles,
  wheelStyles,
  Colors,
} from "@/styles/ipod";
import { SCREEN_HEIGHT } from "@/styles/ipod/constants";
import { generatePlaylist, GeneratedPlaylist } from "@/services/playlist.service";
import { Theme } from "@/services/spotify.service";
import { openSpotifyTrack } from "@/services/spotify-deeplink.service";

type Screen = "menu" | "theme" | "playlist";

export default function IPodScreen() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("menu");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  const [selectedSongIndex, setSelectedSongIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<Theme>("Fantasy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlaylist, setGeneratedPlaylist] = useState<GeneratedPlaylist | null>(null);
  const [error, setError] = useState<string | null>(null);

  const menuItems = ["Theme", "Start"];
  const themeItems: Theme[] = ["Fantasy", "Cyberpunk"];
  
  const scrollViewRef = useRef<ScrollView>(null);

  const getPlaylistItems = () => {
    if (generatedPlaylist) {
      return [
        generatedPlaylist.name,
        ...generatedPlaylist.tracks.map((track) => `${track.artist} - ${track.name}`),
      ];
    }
    return ["Playlist", "Song #1", "Song #2", "Song #3", "Song #4"];
  };

  const getCurrentItems = () => {
    switch (currentScreen) {
      case "theme":
        return themeItems;
      case "playlist":
        return getPlaylistItems();
      default:
        return menuItems;
    }
  };

  const getCurrentSelectedIndex = () => {
    switch (currentScreen) {
      case "theme":
        return selectedThemeIndex;
      case "playlist":
        return selectedSongIndex;
      default:
        return selectedIndex;
    }
  };

  const setCurrentSelectedIndex = (index: number) => {
    switch (currentScreen) {
      case "theme":
        setSelectedThemeIndex(index);
        break;
      case "playlist":
        setSelectedSongIndex(index);
        // Scroll will be handled by onLayout in the item
        break;
      default:
        setSelectedIndex(index);
    }
  };

  // Auto-scroll when playlist is generated or selection changes
  useEffect(() => {
    if (currentScreen === "playlist" && generatedPlaylist) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        if (selectedSongIndex === 0) {
          scrollViewRef.current?.scrollTo({ y: 0, animated: false });
        }
      }, 100);
    }
  }, [currentScreen, generatedPlaylist, selectedSongIndex]);

  const handleWheelScroll = (direction: "up" | "down") => {
    const items = getCurrentItems();
    const currentIdx = getCurrentSelectedIndex();

    if (direction === "up") {
      const newIndex = currentIdx > 0 ? currentIdx - 1 : items.length - 1;
      setCurrentSelectedIndex(newIndex);
    } else {
      const newIndex = currentIdx < items.length - 1 ? currentIdx + 1 : 0;
      setCurrentSelectedIndex(newIndex);
    }
  };

  const handleMenuPress = () => {
    if (currentScreen !== "menu") {
      setCurrentScreen("menu");
      setSelectedIndex(0);
    }
  };

  const handleSelect = async () => {
    const currentIdx = getCurrentSelectedIndex();
    const items = getCurrentItems();

    if (currentScreen === "menu") {
      if (currentIdx === 0) {
        // Theme
        setCurrentScreen("theme");
        setSelectedThemeIndex(0);
      } else if (currentIdx === 1) {
        // Start - Generate playlist
        await handleGeneratePlaylist();
      }
    } else if (currentScreen === "theme") {
      // Theme selected - save and go back to menu
      setSelectedTheme(themeItems[currentIdx]);
      setCurrentScreen("menu");
      setSelectedIndex(0);
    } else if (currentScreen === "playlist") {
      // Playlist screen - open track in Spotify
      if (generatedPlaylist && currentIdx > 0) {
        // Index 0 is the playlist name, so subtract 1 for track index
        const trackIndex = currentIdx - 1;
        const track = generatedPlaylist.tracks[trackIndex];
        
        if (track) {
          try {
            await openSpotifyTrack(track);
          } catch (error) {
            console.error("Error opening Spotify track:", error);
            // Error is already handled by openSpotifyTrack with Alert
          }
        }
      }
    }
  };

  const handleGeneratePlaylist = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const playlist = await generatePlaylist(selectedTheme);
      setGeneratedPlaylist(playlist);
      setCurrentScreen("playlist");
      setSelectedSongIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate playlist");
      console.error("Error generating playlist:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderScreenContent = () => {
    const items = getCurrentItems();
    const currentIdx = getCurrentSelectedIndex();

    // Show loading state
    if (isGenerating) {
      return (
        <View style={screenStyles.screenContent}>
          <View style={screenStyles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.selectedBackground} />
            <Text style={[screenStyles.loadingText, { marginTop: 12 }]}>
              Getting location...
            </Text>
            <Text style={screenStyles.loadingText}>
              Generating playlist...
            </Text>
          </View>
        </View>
      );
    }

    // Show error state
    if (error && currentScreen === "playlist") {
      const isNetworkError = error.includes("Network") || error.includes("Cannot connect");
      return (
        <View style={screenStyles.screenContent}>
          <View style={screenStyles.loadingContainer}>
            <MaterialIcons name="error-outline" size={32} color="#ff0000" />
            <Text style={[screenStyles.loadingText, { marginTop: 12, color: "#ff0000" }]}>
              {error}
            </Text>
            {isNetworkError && (
              <Text style={[screenStyles.loadingText, { marginTop: 8, fontSize: 11, textAlign: "center", paddingHorizontal: 8 }]}>
                Tip: Make sure backend is running. On mobile, use your computer's IP address.
              </Text>
            )}
            <Text style={[screenStyles.loadingText, { marginTop: 8, fontSize: 12 }]}>
              Press Menu to go back
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={screenStyles.screenContent}>
        {/* Header with icons */}
        <View style={screenStyles.header}>
          {(currentScreen === "theme" || currentScreen === "playlist") && (
            <MaterialIcons
              name="volume-up"
              size={16}
              color={Colors.text}
              style={screenStyles.headerIconLeft}
            />
          )}
          <View style={screenStyles.headerSpacer} />
          {generatedPlaylist && currentScreen === "playlist" && (
            <Text style={[screenStyles.locationText, { marginRight: 4 }]}>
              {generatedPlaylist.location.areaType}
            </Text>
          )}
          <MaterialIcons
            name="battery-full"
            size={16}
            color={Colors.text}
            style={screenStyles.headerIconRight}
          />
        </View>

        {/* Screen Title */}
        {currentScreen === "menu" && (
          <Text style={screenStyles.screenTitle}>iPod</Text>
        )}

        {/* Menu List */}
        {currentScreen === "playlist" ? (
          <ScrollView
            ref={scrollViewRef}
            style={screenStyles.menuList}
            contentContainerStyle={screenStyles.menuListContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={true}
            bounces={false}
            nestedScrollEnabled={true}
          >
            {items.map((item, index) => {
              const isSelected = index === currentIdx;
              return (
                <View
                  key={index}
                  style={[
                    screenStyles.menuItemContainer,
                    isSelected && screenStyles.menuItemSelected,
                  ]}
                  onLayout={(event) => {
                    if (isSelected && scrollViewRef.current) {
                      const { y, height } = event.nativeEvent.layout;
                      // Calculate visible area (screen height minus header and padding)
                      const visibleHeight = SCREEN_HEIGHT - 100;
                      const scrollPosition = y - visibleHeight / 2 + height / 2;
                      scrollViewRef.current.scrollTo({
                        y: Math.max(0, scrollPosition),
                        animated: true,
                      });
                    }
                  }}
                >
                  {index === 0 && (
                    <MaterialIcons
                      name="check-box"
                      size={16}
                      color={isSelected ? "#fff" : "#000"}
                      style={screenStyles.menuIcon}
                    />
                  )}
                  <Text
                    style={[
                      screenStyles.menuItem,
                      isSelected && screenStyles.menuItemSelectedText,
                    ]}
                    numberOfLines={1}
                  >
                    {item}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View style={screenStyles.menuList}>
            {items.map((item, index) => {
              const isSelected = index === currentIdx;
              const showArrow =
                (currentScreen === "menu" && index < 2) ||
                (currentScreen === "theme");

              return (
                <View
                  key={index}
                  style={[
                    screenStyles.menuItemContainer,
                    isSelected && screenStyles.menuItemSelected,
                  ]}
                >
                  <Text
                    style={[
                      screenStyles.menuItem,
                      isSelected && screenStyles.menuItemSelectedText,
                    ]}
                    numberOfLines={1}
                  >
                    {item}
                  </Text>
                  {showArrow && (
                    <MaterialIcons
                      name={
                        currentScreen === "theme"
                          ? "keyboard-arrow-down"
                          : "keyboard-arrow-right"
                      }
                      size={16}
                      color={isSelected ? "#fff" : "#000"}
                      style={screenStyles.menuArrow}
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={containerStyles.container}>
      {/* iPod Body */}
      <View style={ipodBodyStyles.ipodBody}>
        {/* Screen */}
        <View style={screenStyles.screen}>{renderScreenContent()}</View>

        {/* Click Wheel */}
        <View style={wheelStyles.wheelContainer}>
          <View style={wheelStyles.wheel}>
            {/* Top Menu Button */}
            <TouchableOpacity
              style={[wheelStyles.wheelButton, wheelStyles.topButton]}
              onPress={handleMenuPress}
            >
              <MaterialIcons
                name="menu"
                size={20}
                color={Colors.buttonText}
              />
            </TouchableOpacity>

            {/* Left Button (Previous) */}
            <TouchableOpacity
              style={[wheelStyles.wheelButton, wheelStyles.leftButton]}
              onPress={() => handleWheelScroll("up")}
            >
              <MaterialIcons
                name="fast-rewind"
                size={20}
                color={Colors.buttonText}
              />
            </TouchableOpacity>

            {/* Right Button (Next) */}
            <TouchableOpacity
              style={[wheelStyles.wheelButton, wheelStyles.rightButton]}
              onPress={() => handleWheelScroll("down")}
            >
              <MaterialIcons
                name="fast-forward"
                size={20}
                color={Colors.buttonText}
              />
            </TouchableOpacity>

            {/* Bottom Play/Pause Button */}
            <TouchableOpacity
              style={[wheelStyles.wheelButton, wheelStyles.bottomButton]}
              onPress={() => {}}
            >
              <MaterialIcons
                name="pause"
                size={20}
                color={Colors.buttonText}
              />
            </TouchableOpacity>

            {/* Center Button */}
            <TouchableOpacity
              style={wheelStyles.centerButton}
              onPress={handleSelect}
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
