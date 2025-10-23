import { Platform, StyleSheet, Text, View } from "react-native";

const AdBannerMock = () => {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        {Platform.OS === "web"
          ? "Banner Placeholder (Web)"
          : "Banner Placeholder (Mobile)"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    height: 50,
    backgroundColor: "#cccccc",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 8,
  },
  text: {
    color: "#333",
    fontWeight: "bold",
  },
});

export default AdBannerMock;
