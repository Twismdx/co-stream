import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function OrbitingCircles({
  reverse = false,
  duration = 20000,
  delay = 10000,
  radius = 50,
  path = true,
  children,
  style,
}) {
  const angle = useSharedValue(0);

  useEffect(() => {
    // Start the animation with delay and reverse options
    angle.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, {
          duration,
          easing: Easing.linear,
        }),
        -1, // Infinite repeats
        reverse // Reverse direction if `reverse` is true
      )
    );
  }, [duration, delay, reverse]);

  // Animated style for orbiting motion
  const animatedStyle = useAnimatedStyle(() => {
    const x = radius * Math.cos((angle.value * Math.PI) / 180);
    const y = radius * Math.sin((angle.value * Math.PI) / 180);
    return {
      transform: [
        { translateX: x },
        { translateY: y },
      ],
    };
  });

  return (
    <View style={[styles.container, style]}>
      {path && (
        <Svg
          style={styles.circlePath}
          width={radius * 2}
          height={radius * 2}
          viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        >
          <Circle
            cx={radius}
            cy={radius}
            r={radius}
            stroke="black"
            strokeOpacity={0.1}
            strokeWidth={1}
            fill="none"
          />
        </Svg>
      )}
      <Animated.View style={[styles.orbitingCircle, animatedStyle]}>
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  circlePath: {
    position: "absolute",
  },
  orbitingCircle: {
    position: "absolute",
    width: 20, // Adjust size of orbiting circle
    height: 20,
    borderRadius: 10, // Half of width/height for a circular shape
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});


/* import React from "react";
import { View, Text, StyleSheet } from "react-native";
import OrbitingCircles from "./OrbitingCircles";

export default function App() {
  return (
    <View style={styles.appContainer}>
      <OrbitingCircles radius={60} duration={5000} reverse>
        <Text style={styles.orbitingText}>🌟</Text>
      </OrbitingCircles>
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
  orbitingText: {
    fontSize: 24,
  },
});
*/