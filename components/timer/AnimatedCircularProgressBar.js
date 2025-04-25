import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor = "blue",
  gaugeSecondaryColor = "lightgrey",
  size = 100,
}) {
  const radius = 45;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const currentPercent = ((value - min) / (max - min)) * 100;

  const strokeDashoffset = useSharedValue(circumference);

  // Update animation
  useEffect(() => {
    const offset = circumference - (currentPercent / 100) * circumference;
    strokeDashoffset.value = withTiming(offset, {
      duration: 1000,
      easing: Easing.ease,
    });
  }, [currentPercent, circumference]);

  // Animated props for primary circle
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value,
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Background Circle */}
        <Circle
          cx="50"
          cy="50"
          r={radius}
          stroke={gaugeSecondaryColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated Primary Circle */}
        <Animated.Circle
          cx="50"
          cy="50"
          r={radius}
          stroke={gaugePrimaryColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}, ${circumference}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <Text style={styles.percentageText}>
        {Math.round(currentPercent)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    position: "absolute",
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
});


/* import React from "react";
import { View, StyleSheet } from "react-native";
import AnimatedCircularProgressBar from "./AnimatedCircularProgressBar";

export default function App() {
  return (
    <View style={styles.appContainer}>
      <AnimatedCircularProgressBar
        value={75}
        max={100}
        gaugePrimaryColor="blue"
        gaugeSecondaryColor="lightgrey"
      />
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