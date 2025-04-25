import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { BlurView } from "@react-native-community/blur";

export default function BlurIn({
  word,
  className,
  duration = 1000,  // duration in milliseconds
}) {
  // Shared values for opacity and blur
  const opacity = useSharedValue(0);
  const blurAmount = useSharedValue(10);

  useEffect(() => {
    // Start the animations
    opacity.value = withTiming(1, { duration });
    blurAmount.value = withTiming(0, { duration });
  }, [duration]);

  // Animated styles for opacity and blur
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, className]}>
      <Animated.View style={[animatedStyle]}>
        <BlurView
          style={styles.blurView}
          blurType="light"
          blurAmount={blurAmount.value} // blur amount animated from 10 to 0
        >
          <Text style={styles.text}>{word}</Text>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    color: "black",
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});


/* import React from "react";
import { View, StyleSheet } from "react-native";
import BlurIn from "./BlurIn";

export default function App() {
  return (
    <View style={styles.appContainer}>
      <BlurIn word="Hello World" duration={1000} />
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
});
*/