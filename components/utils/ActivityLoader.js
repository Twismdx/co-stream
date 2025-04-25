import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
// If you want a true blur effect, install expo-blur: expo install expo-blur
import { BlurView } from "expo-blur";
import { useGlobalContext } from "../timer/context";

const ActivityLoader = ({ children }) => {
  const { isLoading, setIsLoading } = useGlobalContext();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {loading && (
        <View style={styles.overlay}>
          <BlurView
            intensity={60}
            tint="dark"
            experimentalBlurMethod="dimezisBlurView"
            style={styles.blurContainer}
          >
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading. . .</Text>
          </BlurView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999, // Ensures the loader is on top
  },
  blurContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
});

export default ActivityLoader;
