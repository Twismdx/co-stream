import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import LinearGradient from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function AnimatedGradientText({ children, className }) {
  // Shared value for the gradient animation
  const gradientPosition = useSharedValue(0);

  useEffect(() => {
    // Loop the gradient animation
    gradientPosition.value = withTiming(1, {
      duration: 5000,
      easing: Easing.linear,
    });
  }, []);

  // Animate gradient position
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(gradientPosition.value * -300, {
          duration: 1000,
        }),
      },
    ],
  }));

  return (
    <View style={[styles.container, className]}>
      <Animated.View style={[styles.gradientBackground, animatedStyle]}>
        <LinearGradient
          colors={["#ffaa40", "#9c40ff", "#ffaa40"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#8fdfff",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    overflow: "hidden",
  },
  gradient: {
    width: "300%", // Equivalent to [--bg-size:300%]
    height: "100%",
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "black",
  },
});

/* import React from "react";
import { View, StyleSheet } from "react-native";
import AnimatedGradientText from "./AnimatedGradientText";

export default function App() {
  return (
    <View style={styles.appContainer}>
      <AnimatedGradientText>
        Animated Gradient Text
      </AnimatedGradientText>
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
