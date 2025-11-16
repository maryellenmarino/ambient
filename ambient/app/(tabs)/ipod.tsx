import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function IPodScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.screen}>
        <Text style={styles.screenText}>iPod</Text>
      </View>
      <View style={styles.wheel}>
        <TouchableOpacity style={[styles.button, styles.topButton]}>
          <Text style={styles.buttonText}>Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.leftButton]}>
          <Text style={styles.buttonText}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.rightButton]}>
          <Text style={styles.buttonText}>▶</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.bottomButton]}>
          <Text style={styles.buttonText}>Play/Pause</Text>
        </TouchableOpacity>
        <View style={styles.centerButton}>
          <Text style={styles.centerButtonText}>Select</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  screen: {
    width: 250,
    height: 150,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  screenText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  wheel: {
    width: 250,
    height: 250,
    backgroundColor: "#ccc",
    borderRadius: 125,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  button: {
    position: "absolute",
    width: 60,
    height: 40,
    backgroundColor: "#aaa",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  topButton: {
    top: 20,
  },
  leftButton: {
    left: 20,
  },
  rightButton: {
    right: 20,
  },
  bottomButton: {
    bottom: 20,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  centerButton: {
    width: 80,
    height: 80,
    backgroundColor: "#888",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  centerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
